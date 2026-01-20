import { Metadata } from "next";
import { getJadwalKegiatan } from "@/actions/data";
import JadwalClient from "./client";

export const metadata: Metadata = {
    title: "Kelola Jadwal Kegiatan | Admin Paroki",
};

import { getMasterCategories } from "@/actions/master-categories";

export default async function AdminJadwalPage() {
    const data = await getJadwalKegiatan();
    const categories = await getMasterCategories();

    return (
        <JadwalClient initialData={data} categories={categories.jadwal} />
    );
}
