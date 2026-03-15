import { Metadata } from "next";
import { getBookings } from "@/features/booking/actions/bookings";
import { getMeetingPlaces } from "@/features/booking/actions/places";
import { getInventoryItems } from "@/features/booking/actions/inventory";
import { getCurrentUser } from "@/lib/firebase/auth";
import MeetingRoomsClient from "./client";

export const metadata: Metadata = {
    title: "Meeting Rooms Management | Admin Paroki",
};

export default async function AdminMeetingRoomsPage() {
    const bookings = await getBookings();
    const places = await getMeetingPlaces();
    const inventoryItems = await getInventoryItems();
    const user = await getCurrentUser();
    const isSuperAdmin = user?.role === "super_admin";

    return (
        <MeetingRoomsClient 
            initialBookings={bookings} 
            initialPlaces={places} 
            initialInventory={inventoryItems}
            isSuperAdmin={isSuperAdmin}
        />
    );
}
