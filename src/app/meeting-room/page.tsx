import { Metadata } from "next";
import { getPublicBookings } from "@/features/booking/actions/bookings";
import { getPublicMeetingPlaces } from "@/features/booking/actions/places";
import { getActiveInventoryItems } from "@/features/booking/actions/inventory";
import { isMeetingRoomAuthenticated } from "@/features/booking/actions/auth";
import { getWilayahLingkungan } from "@/actions/data";
import MeetingRoomClient from "./client";

export const metadata: Metadata = {
    title: "Peminjaman Ruang | Paroki Brayut",
};

export default async function MeetingRoomPage() {
    const isAuthenticated = await isMeetingRoomAuthenticated();

    // Public data: always fetch confirmed/pending bookings for the calendar
    // Admin-only data: fetch full list only when authenticated
    const [publicBookings, places, inventoryItems, wilayahs] = await Promise.all([
        getPublicBookings(),
        getPublicMeetingPlaces(),
        getActiveInventoryItems(),
        getWilayahLingkungan(),
    ]);

    return (
        <MeetingRoomClient
            isAuthenticated={isAuthenticated}
            initialBookings={publicBookings}
            places={places}
            inventoryItems={inventoryItems}
            wilayahs={wilayahs.map(w => ({ id: w.id, name: w.name }))}
        />
    );

}
