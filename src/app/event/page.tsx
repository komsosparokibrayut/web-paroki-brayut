
import { Metadata } from "next";
import { getJadwalKegiatan } from "@/actions/data";
import { getMasterCategories } from "@/actions/master-categories";
import JadwalList from "@/components/data/JadwalList";
import PageHeader from "@/components/layout/PageHeader";
import InformationCard from "@/components/ui/InformationCard";

export const metadata: Metadata = {
    title: "Event Paroki | Paroki Brayut",
    description: "Kalender dan jadwal kegiatan Paroki Brayut Santo Yohanes Paulus II",
};

export default async function EventPage() {
    const activities = await getJadwalKegiatan();
    const categories = await getMasterCategories();

    return (
        <div className="min-h-screen pb-12">
            <PageHeader
                title="Event Paroki"
                subtitle="Agenda Kegiatan & Warta Mingguan"
                image="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2070&auto=format&fit=crop"
                align="center"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
                <JadwalList initialEvents={activities} categories={categories.jadwal} />

                {/* Info Box */}
                <InformationCard
                    title="Informasi Perubahan Event"
                    description="Waktu dan detail event dapat berubah sewaktu-waktu tanpa pemberitahuan sebelumnya. Untuk mendaftarkan atau mengusulkan event, silakan hubungi koordinator bidang terkait atau sekretariat. Informasi lebih detail akan diumumkan melalui warta paroki mingguan."
                />
            </div>
        </div>
    );
}
