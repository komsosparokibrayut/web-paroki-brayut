import { Metadata } from "next";
import { getGereja } from "@/features/gereja/actions";
import GerejaClient from "./client";

export const metadata: Metadata = {
    title: "Kelola Data Gereja | Admin Paroki",
};

export default async function AdminGerejaPage() {
    const data = await getGereja();
    return <GerejaClient initialData={data} />;
}
