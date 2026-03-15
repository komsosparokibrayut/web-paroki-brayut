import { Metadata } from "next";
import { getBookings } from "@/features/booking/actions/bookings";
import { getActiveMeetingPlaces } from "@/features/booking/actions/places";
import { getActiveInventoryItems } from "@/features/booking/actions/inventory";
import { isMeetingRoomAuthenticated } from "@/features/booking/actions/auth";
import MeetingRoomClient from "./client";

export const metadata: Metadata = {
    title: "Peminjaman Ruang | Paroki Brayut",
};

export default async function MeetingRoomPage() {
    const isAuthenticated = await isMeetingRoomAuthenticated();
    
    // Only fetch data if authenticated to save reads
    const bookings = isAuthenticated ? await getBookings() : [];
    const places = isAuthenticated ? await getActiveMeetingPlaces() : [];
    const inventoryItems = isAuthenticated ? await getActiveInventoryItems() : [];

    return (
        <MeetingRoomClient 
            isAuthenticated={isAuthenticated} 
            initialBookings={bookings} 
            places={places}
            inventoryItems={inventoryItems}
        />
    );

}
