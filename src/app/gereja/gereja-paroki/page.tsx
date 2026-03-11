import { Metadata } from "next";

export const revalidate = 3600;
import Link from "next/link";
import { MapPin, Clock, Calendar } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import InformationCard from "@/components/ui/InformationCard";
import { GerejaGallery } from "@/features/gereja/components/GerejaGallery";
import { ChurchSchedule } from "@/components/ui/ChurchSchedule";
import { getJadwalMisa } from "@/features/schedule/actions";
import { WeekNumber, JadwalMisaData } from "@/features/schedule/types";

export const metadata: Metadata = {
    title: "Gereja St. Yusup Tambakrejo (Paroki) | Paroki Brayut",
    description: "Gereja St. Yusup Tambakrejo – Gereja Paroki St. Yohanes Paulus II Brayut",
};

const MAP_SRC = "https://maps.google.com/maps?q=Gereja+St.+Yusup+Tambakrejo&t=&z=16&ie=UTF8&iwloc=&output=embed";
const MAPS_LINK = "https://maps.app.goo.gl/a4PYVvPPrMChWLhc9";

const MONTH_NAMES = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

function getWeekOfMonth(date: Date): WeekNumber {
    const dayOfMonth = date.getDate();
    const week = Math.ceil(dayOfMonth / 7);
    return Math.min(week, 5) as WeekNumber;
}

export default async function Gereja1Page() {
    const data = await getJadwalMisa();
    const churchData = data?.churches.find(c => c.id === "gereja-paroki");

    const today = new Date();
    const currentWeek = getWeekOfMonth(today);
    const selectedMonthIdx = today.getMonth();
    const monthName = MONTH_NAMES[selectedMonthIdx];
    const year = today.getFullYear();
    const isCurrentMonth = true;
    return (
        <div className="min-h-screen pb-12">
            <PageHeader
                title="Gereja St. Yusup Tambakrejo"
                subtitle="Gereja Paroki St. Yohanes Paulus II Brayut"
                image="/images/carousel/GerejaTambakrejo.jpg"
                align="left"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
                {/* Kategori Badge + Tentang */}
                <section>
                    <div className="mb-4">
                        <span className="inline-block bg-brand-blue/10 text-brand-blue text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
                            Gereja Paroki
                        </span>
                    </div>
                    <h2 className="text-3xl font-bold text-brand-dark mb-6">Tentang Gereja</h2>
                    <div className="prose prose-lg text-gray-700 max-w-none">
                        <p>
                            Diresmikan dan diberkati pada 12 Juli 2007, lalu pada tahun 2024 ditetapkan sebagai Gereja Paroki St. Yohanes Paulus II Brayut. Pada tahun 2026 akan dimulai proses pembangunan komplek gereja Paroki yang baru secara fisik di area gereja ini.
                        </p>
                    </div>
                </section>

                {/* Location Section */}
                <section className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        <div className="h-[300px] lg:h-full min-h-[300px] bg-gray-100 relative">
                            <iframe
                                width="100%"
                                height="100%"
                                title="Peta Lokasi Gereja St. Yusup Tambakrejo"
                                className="absolute inset-0 border-0"
                                loading="lazy"
                                allowFullScreen
                                src={MAP_SRC}
                            />
                        </div>
                        <div className="p-8">
                            <h3 className="text-2xl font-bold text-brand-dark mb-6 flex items-center gap-2">
                                <MapPin className="h-6 w-6 text-brand-blue" />
                                Lokasi
                            </h3>
                            <div className="space-y-6 text-gray-700">
                                <div>
                                    <div className="font-semibold text-brand-dark mb-1">Alamat</div>
                                    <p>Tambakrejo, Sariharjo, Ngaglik, Sleman, Yogyakarta</p>
                                </div>
                                <div className="pt-2">
                                    <a
                                        href={MAPS_LINK}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 bg-brand-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-darkBlue transition-colors"
                                    >
                                        <MapPin className="h-4 w-4" />
                                        Buka di Google Maps
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Mass Schedule */}
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

                {/* Gallery */}
                <section>
                    <h2 className="text-2xl font-bold text-brand-dark mb-6">Galeri Foto</h2>
                    <GerejaGallery photos={[]} churchName="Gereja St. Yusup Tambakrejo" />
                </section>
            </div>
        </div>
    );
}
