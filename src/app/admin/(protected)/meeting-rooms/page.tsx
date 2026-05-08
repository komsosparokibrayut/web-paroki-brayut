import { Metadata } from "next";
import { getBookings } from "@/features/booking/actions/bookings";
import { getMeetingPlaces } from "@/features/booking/actions/places";
import { getInventoryItems, getInventoryBorrowingStats } from "@/features/booking/actions/inventory";
import { getCurrentUser } from "@/lib/firebase/auth";
import { getWilayahLingkungan } from "@/actions/data";
import MeetingRoomsClient from "./client";

export const metadata: Metadata = {
    title: "Meeting Rooms Management | Admin Paroki",
};

export default async function AdminMeetingRoomsPage() {
    const [bookings, places, inventoryItems, borrowingStats, wilayahs] = await Promise.all([
        getBookings(),
        getMeetingPlaces(),
        getInventoryItems(),
        getInventoryBorrowingStats(),
        getWilayahLingkungan(),
    ]);
    const user = await getCurrentUser();
    const isSuperAdmin = user?.role === "super_admin";

    // Convert Map to serializable object for client component
    const borrowingStatsObj = Object.fromEntries(borrowingStats);

    // Convert Wilayah to simpler format for dropdowns
    const wilayahList = wilayahs.map(w => ({
        id: w.id,
        name: w.name,
        lingkungan: w.lingkungan?.map(l => l.name) || [],
    }));

    return (
        <MeetingRoomsClient
            initialBookings={bookings}
            initialPlaces={places}
            initialInventory={inventoryItems}
            isSuperAdmin={isSuperAdmin}
            borrowingStats={borrowingStatsObj}
            wilayahs={wilayahList}
        />
    );
}
