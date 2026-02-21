import { Metadata } from "next";
import { getJadwalMisa } from "@/features/schedule/actions";
import JadwalMisaAdminClient from "./client";

export const metadata: Metadata = {
    title: "Kelola Jadwal Misa | Admin Paroki",
};

export default async function AdminJadwalMisaPage() {
    const data = await getJadwalMisa();
    return <JadwalMisaAdminClient initialData={data} />;
}
