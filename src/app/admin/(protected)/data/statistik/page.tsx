import { Metadata } from "next";
import { getStatistik } from "@/actions/data";
import StatistikClient from "./client";

export const metadata: Metadata = {
    title: "Kelola Data Statistik | Admin Paroki",
};

export default async function AdminStatistikPage() {
    const data = await getStatistik();
    return (
        <StatistikClient initialData={data} />
    );
}
