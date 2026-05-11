"use client";

import { useState, useTransition } from "react";
import { MeetingBooking, MeetingPlace, InventoryItem } from "@/features/booking/types";
import { getBookings } from "@/features/booking/actions/bookings";
import { getActiveMeetingPlaces } from "@/features/booking/actions/places";
import { getActiveInventoryItems } from "@/features/booking/actions/inventory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

import { AdminSettingsTab } from "./components/AdminSettingsTab";
import { InventoryTab } from "./components/InventoryTab";
import { PlacesTab } from "./components/PlacesTab";
import { BookingsTab } from "./components/BookingsTab";
import { AdminBookingDialog } from "./components/AdminBookingDialog";
import { canSeeSecuritySettings } from "@/lib/roles";
import { SessionUser } from "@/lib/firebase/auth";

export default function MeetingRoomsClient({
  initialBookings,
  initialPlaces,
  initialInventory = [],
  user,
  borrowingStats = {},
  wilayahs = [],
}: {
  initialBookings: MeetingBooking[];
  initialPlaces: MeetingPlace[];
  initialInventory?: InventoryItem[];
  user?: SessionUser;
  borrowingStats?: Record<string, { totalHours: number; totalMinutes: number; bookingCount: number }>;
  wilayahs?: { id: string; name: string; lingkungan?: string[] }[];
}) {
  const [bookings, setBookings] = useState(initialBookings);
  const [places, setPlaces] = useState(initialPlaces);
  const [inventory, setInventory] = useState(initialInventory);
  
  const [isRefreshingBookings, startRefreshBookings] = useTransition();
  const [isRefreshingPlaces, startRefreshPlaces] = useTransition();
  const [isRefreshingInventory, startRefreshInventory] = useTransition();

  const handleRefreshBookings = () => {
    startRefreshBookings(async () => {
      const fresh = await getBookings();
      setBookings(fresh);
    });
  };

  const handleRefreshPlaces = () => {
    startRefreshPlaces(async () => {
      const fresh = await getActiveMeetingPlaces();
      setPlaces(fresh as MeetingPlace[]);
    });
  };

  const handleRefreshInventory = () => {
    startRefreshInventory(async () => {
      const fresh = await getActiveInventoryItems();
      setInventory(fresh as InventoryItem[]);
    });
  };

  // States for Booking Dialog
  const [isAddBookingOpen, setIsAddBookingOpen] = useState(false);
  const [bookingToEdit, setBookingToEdit] = useState<MeetingBooking | null>(null);

  const openEditBooking = (booking: MeetingBooking) => {
    setBookingToEdit(booking);
    setIsAddBookingOpen(true);
  };

  const openAddBooking = () => {
    setBookingToEdit(null);
    setIsAddBookingOpen(true);
  };

  // States for Confirm Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: "default" | "destructive";
    action: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    variant: "default",
    action: () => { },
  });

  const [conflictError, setConflictError] = useState<string | null>(null);

  const openConfirm = (title: string, message: string, variant: "default" | "destructive", action: () => void | Promise<void>) => {
    setConfirmModal({ isOpen: true, title, message, variant, action });
  };

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Booking Ruang</h1>
        <p className="text-muted-foreground">Konfirmasi booking dan manajemen ruang pertemuan.</p>
      </div>

      <Tabs defaultValue="bookings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="bookings">Peminjaman</TabsTrigger>
          <TabsTrigger value="places">Ruang Pertemuan</TabsTrigger>
          <TabsTrigger value="inventory">Inventaris / Barang</TabsTrigger>
          {canSeeSecuritySettings(user) && <TabsTrigger value="settings">Pengaturan</TabsTrigger>}
        </TabsList>

        <TabsContent value="bookings" className="space-y-4">
          <BookingsTab 
            bookings={bookings} 
            setBookings={setBookings} 
            places={places} 
            isRefreshing={isRefreshingBookings} 
            onRefresh={handleRefreshBookings}
            openConfirm={openConfirm}
            openAddBooking={openAddBooking}
            openEditBooking={openEditBooking}
          />
        </TabsContent>

        <TabsContent value="places" className="space-y-4">
          <PlacesTab 
            places={places} 
            setPlaces={setPlaces} 
            isRefreshing={isRefreshingPlaces} 
            onRefresh={handleRefreshPlaces} 
            openConfirm={openConfirm}
            wilayahs={wilayahs}
          />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <InventoryTab
            inventory={inventory}
            setInventory={setInventory}
            isRefreshing={isRefreshingInventory}
            onRefresh={handleRefreshInventory}
            openConfirm={openConfirm}
            borrowingStats={borrowingStats}
            wilayahs={wilayahs}
          />
        </TabsContent>

        {canSeeSecuritySettings(user) && (
          <TabsContent value="settings" className="space-y-4">
            <AdminSettingsTab />
          </TabsContent>
        )}
      </Tabs>

      <AdminBookingDialog 
        isOpen={isAddBookingOpen}
        onOpenChange={(open) => {
          setIsAddBookingOpen(open);
          if (!open) setBookingToEdit(null);
        }}
        bookingToEdit={bookingToEdit}
        places={places}
        inventory={inventory}
        wilayahs={wilayahs}
        bookings={bookings}
        onSuccess={handleRefreshBookings}
        setConflictError={setConflictError}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        onConfirm={async () => {
          await confirmModal.action();
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }}
        confirmText="Ya, Lanjutkan"
      />

      {/* Booking conflict alert */}
      <AlertDialog open={!!conflictError} onOpenChange={() => setConflictError(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Jadwal Sudah Terpakai</AlertDialogTitle>
            <AlertDialogDescription>
              {conflictError}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setConflictError(null)}>Mengerti</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
