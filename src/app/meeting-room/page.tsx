import { Metadata } from "next";
import { getBookings } from "@/features/booking/actions/bookings";
import { getMeetingPlaces } from "@/features/booking/actions/places";
import { getActiveInventoryItems } from "@/features/booking/actions/inventory";
import { isMeetingRoomAuthenticated } from "@/features/booking/actions/auth";
import { getWilayahLingkungan } from "@/actions/data";
import MeetingRoomClient from "./client";

export const metadata: Metadata = {
    title: "Peminjaman Ruang | Paroki Brayut",
};

export default async function MeetingRoomPage() {
    const isAuthenticated = await isMeetingRoomAuthenticated();
    
    // Only fetch data if authenticated to save reads
    const [bookings, places, inventoryItems, wilayahs] = isAuthenticated 
        ? await Promise.all([
            getBookings(),
            getMeetingPlaces(),
            getActiveInventoryItems(),
            getWilayahLingkungan(),
        ])
        : [[], [], [], []];

    return (
        <MeetingRoomClient 
            isAuthenticated={isAuthenticated} 
            initialBookings={bookings} 
            places={places}
            inventoryItems={inventoryItems}
            wilayahs={wilayahs.map(w => ({ id: w.id, name: w.name }))}
        />
    );

}
