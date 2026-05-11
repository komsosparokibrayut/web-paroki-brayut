import { Metadata } from "next";
import { getGereja } from "@/features/gereja/actions";
import { getWilayahLingkungan } from "@/actions/data";
import GerejaClient from "./client";

export const metadata: Metadata = {
    title: "Kelola Data Gereja | Admin Paroki",
};

export default async function AdminGerejaPage() {
    const [data, wilayahData] = await Promise.all([
        getGereja(),
        getWilayahLingkungan(),
    ]);
    const wilayahList = wilayahData.map(w => ({ id: w.id, name: w.name }));
    return <GerejaClient initialData={data} wilayahList={wilayahList} />;
}
