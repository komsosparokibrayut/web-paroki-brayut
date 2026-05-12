"use server";

import { adminDb } from "@/lib/firebase/server";
import { getCurrentUser } from "@/lib/firebase/auth";
import { hasPermission } from "@/lib/roles";
import { WilayahApproval } from "../types";
import { revalidatePath } from "next/cache";
import { QueryDocumentSnapshot, DocumentData } from "firebase-admin/firestore";

const COLLECTION = "wilayah_approvals";

type ActionResult<T = void> = { success: true; data?: T } | { success: false; error?: string };

/**
 * Get all pending approvals for a specific wilayah.
 * Auth: data_admin/super_admin see all. admin_wilayah sees only their own wilayah.
 */
export async function getWilayahApprovals(wilayah_id?: string): Promise<WilayahApproval[]> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !hasPermission(currentUser.role, "manage_data")) {
      return [];
    }

    // admin_wilayah: force filter to their own wilayah
    // admin_paroki: no filter, sees all approvals
    if (currentUser.role === "admin_wilayah" || currentUser.role === "admin_paroki") {
      if (currentUser.role === "admin_paroki") {
        // admin_paroki: skip filtering, see all
      } else {
        wilayah_id = currentUser.wilayah_id;
      }
    }

    let query: any = adminDb.collection(COLLECTION);

    if (wilayah_id) {
      query = query.where("wilayah_id", "==", wilayah_id);
    }

    const snapshot = await query.orderBy("createdAt", "desc").get();
    
    return snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data()
    } as WilayahApproval));
  } catch (error) {
    console.error("Error fetching wilayah approvals:", error);
    return [];
  }
}

/**
 * Get approvals for a specific booking.
 * Auth: requires manage_data permission.
 */
export async function getBookingWilayahApprovals(bookingId: string): Promise<WilayahApproval[]> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !hasPermission(currentUser.role, "manage_data")) {
      return [];
    }

    const snapshot = await adminDb.collection(COLLECTION)
      .where("bookingId", "==", bookingId)
      .get();
    
    return snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data()
    } as WilayahApproval));
  } catch (error) {
    console.error("Error fetching booking wilayah approvals:", error);
    return [];
  }
}

/**
 * Approve or reject wilayah approval
 * Only Admin Wilayah can approve/reject their own wilayah items
 */
export async function updateWilayahApprovalStatus(
  approvalId: string,
  status: "approved" | "rejected",
  notes?: string
): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Tidak memiliki otorisasi" };
    }

    // Get the approval to check wilayah_id
    const approvalDoc = await adminDb.collection(COLLECTION).doc(approvalId).get();
    if (!approvalDoc.exists) {
      return { success: false, error: "Data persetujuan tidak ditemukan" };
    }

    const approvalData = approvalDoc.data() as WilayahApproval;

    // Check if user is Admin Wilayah for this wilayah or has higher permission
    const canApprove = hasPermission(currentUser.role, "manage_data") || 
                       (currentUser.role === "admin_wilayah" && 
                        currentUser.wilayah_id === approvalData.wilayah_id);

    if (!canApprove) {
      return { success: false, error: "Tidak memiliki otorisasi untuk wilayah ini" };
    }

    await adminDb.collection(COLLECTION).doc(approvalId).update({
      status,
      approvedBy: currentUser.uid,
      notes: notes || null,
      modified_by: currentUser.name || currentUser.email || "Unknown",
      modified_at: Date.now(),
      updatedAt: Date.now()
    });

    // Check if all wilayah approvals for this booking are complete
    if (status === "approved") {
      await checkAndUpdateBookingStatus(approvalData.bookingId);
    } else if (status === "rejected") {
      // If any wilayah rejects, the booking should be rejected
      await rejectBookingDueToWilayahRejection(approvalData.bookingId, notes);
    }

    revalidatePath("/admin/meeting-rooms");
    revalidatePath("/meeting-room");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating wilayah approval:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Check if all wilayah approvals are done and update booking status
 */
async function checkAndUpdateBookingStatus(bookingId: string) {
  try {
    const approvals = await getBookingWilayahApprovals(bookingId);
    
    // If all approvals are approved, update booking status
    const allApproved = approvals.length > 0 && approvals.every(a => a.status === "approved");
    
    if (allApproved) {
      // All wilayah approved - now booking can be confirmed by admin
      await adminDb.collection("meeting_bookings").doc(bookingId).update({
        adminNotes: "Semua wilayah telah menyetujui peminjaman barang",
        updatedAt: Date.now()
      });
    }
  } catch (error) {
    console.error("Error checking booking status:", error);
  }
}

/**
 * Reject booking if wilayah rejects the items
 */
async function rejectBookingDueToWilayahRejection(bookingId: string, rejectionNotes?: string) {
  try {
    await adminDb.collection("meeting_bookings").doc(bookingId).update({
      status: "rejected",
      adminNotes: `Ditolak oleh Admin Wilayah: ${rejectionNotes || "Item tidak disetujui"}`,
      updatedAt: Date.now()
    });
  } catch (error) {
    console.error("Error rejecting booking:", error);
  }
}
