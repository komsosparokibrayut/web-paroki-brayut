import { Metadata } from "next";
import { getUMKM } from "@/actions/data";
import UMKMClient from "./client";

export const metadata: Metadata = {
    title: "Kelola Data UMKM | Admin Paroki",
};

import { getMasterCategories } from "@/actions/master-categories";

export default async function AdminUMKMPage() {
    const data = await getUMKM();
    const categories = await getMasterCategories();

    return (
        <UMKMClient initialData={data} categories={categories.umkm} />
    );
}
