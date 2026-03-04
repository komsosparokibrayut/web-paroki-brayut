import { Metadata } from "next";
import Link from "next/link";
import { MapPin, Clock, Calendar } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import InformationCard from "@/components/ui/InformationCard";
import { GerejaGallery } from "@/features/gereja/components/GerejaGallery";
import { ChurchSchedule } from "@/components/ui/ChurchSchedule";
import { getJadwalMisa } from "@/features/schedule/actions";
import { WeekNumber, JadwalMisaData } from "@/features/schedule/types";

export const metadata: Metadata = {
    title: "Gereja St. Yohanes Rasul Karangkepuh | Paroki Brayut",
    description: "Gereja St. Yohanes Rasul Karangkepuh – Gereja Wilayah Paroki Brayut",
};

const KOORDINAT = "-7.712553861170049, 110.36637853289066";
const MAP_SRC = `https://maps.google.com/maps?q=${KOORDINAT}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
const MAPS_LINK = `https://www.google.com/maps?q=${KOORDINAT}`;

const MONTH_NAMES = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

function getWeekOfMonth(date: Date): WeekNumber {
    const dayOfMonth = date.getDate();
    const week = Math.ceil(dayOfMonth / 7);
    return Math.min(week, 5) as WeekNumber;
}

export default async function Gereja5Page() {
    const data = await getJadwalMisa();
    const churchData = data?.churches.find(c => c.id === "gereja-karangkepuh");

    const today = new Date();
    const currentWeek = getWeekOfMonth(today);
    const selectedMonthIdx = today.getMonth();
    const monthName = MONTH_NAMES[selectedMonthIdx];
    const year = today.getFullYear();
    const isCurrentMonth = true;
    return (
        <div className="min-h-screen pb-12">
            <PageHeader
                title="Gereja St. Yohanes Rasul Karangkepuh"
                subtitle="Gereja Wilayah – Paroki Brayut"
                image="https://images.unsplash.com/photo-1548625149-fc4a29cf7092?q=80&w=2072&auto=format&fit=crop"
                align="left"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
                <section>
                    <div className="mb-4">
                        <span className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
                            Gereja Wilayah
                        </span>
                    </div>
                    <h2 className="text-3xl font-bold text-brand-dark mb-6">Tentang Gereja</h2>
                    <div className="prose prose-lg text-gray-700 max-w-none">
                        <p>Diresmikan pada 27 Juni 1992.</p>
                    </div>
                </section>

                <section className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        <div className="h-[300px] lg:h-full min-h-[300px] bg-gray-100 relative">
                            <iframe
                                width="100%" height="100%"
                                title="Peta Lokasi Gereja St. Yohanes Rasul Karangkepuh"
                                className="absolute inset-0 border-0"
                                loading="lazy" allowFullScreen src={MAP_SRC}
                            />
                        </div>
                        <div className="p-8">
                            <h3 className="text-2xl font-bold text-brand-dark mb-6 flex items-center gap-2">
                                <MapPin className="h-6 w-6 text-brand-blue" />Lokasi
                            </h3>
                            <div className="space-y-6 text-gray-700">
                                <div>
                                    <div className="font-semibold text-brand-dark mb-1">Alamat</div>
                                    <p>Karang Kepuh, Pandowoharjo, Sleman, Yogyakarta</p>
                                </div>
                                <div className="pt-2">
                                    <a href={MAPS_LINK} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 bg-brand-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-darkBlue transition-colors">
                                        <MapPin className="h-4 w-4" />Buka di Google Maps
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-8">
                    {churchData ? (
                        <ChurchSchedule church={churchData} currentWeek={currentWeek} isCurrentMonth={isCurrentMonth} monthName={monthName} year={year} />
                    ) : (
                        <p>Data jadwal tidak ditemukan.</p>
                    )}
                </section>
                <InformationCard
                    title="Informasi Perubahan Jadwal"
                    description="Jadwal misa dapat berubah sewaktu-waktu. Untuk informasi terkini, pantau pengumuman mingguan atau hubungi sekretariat paroki."
                />

                <section>
                    <h2 className="text-2xl font-bold text-brand-dark mb-6">Galeri Foto</h2>
                    <GerejaGallery photos={[]} churchName="Gereja St. Yohanes Rasul Karangkepuh" />
                </section>
            </div>
        </div>
    );
}
