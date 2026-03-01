
import { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import { getJadwalMisa } from "@/features/schedule/actions";
import { JadwalMisaData } from "@/features/schedule/types";
import JadwalMisaContent from "./JadwalMisaContent";

export const metadata: Metadata = {
    title: "Jadwal Misa | Paroki Brayut",
    description: "Jadwal misa lengkap untuk semua gereja di Paroki Brayut Santo Yohanes Paulus II",
};

export default async function JadwalMisaPage() {
    const data: JadwalMisaData = await getJadwalMisa() || { churches: [], specialMasses: [] };

    return (
        <div className="min-h-screen pb-12">
            <PageHeader
                title="Jadwal Misa"
                subtitle="Paroki Brayut Santo Yohanes Paulus II"
                image="https://images.unsplash.com/photo-1470686164816-830d3688f62c?q=80&w=2073&auto=format&fit=crop"
                align="center"
            />

            <JadwalMisaContent data={data} />
        </div>
    );
}
