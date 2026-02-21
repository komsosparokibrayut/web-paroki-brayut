import { Metadata } from "next";
import Link from "next/link";
import { MapPin, Clock, Calendar } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import InformationCard from "@/components/ui/InformationCard";
import { GerejaGallery } from "@/features/gereja/components/GerejaGallery";

export const metadata: Metadata = {
    title: "Gereja St. Fransiskus Xaverius Dukuh | Paroki Brayut",
    description: "Gereja St. Fransiskus Xaverius Dukuh – Gereja Wilayah Paroki Brayut",
};

const KOORDINAT = "-7.699719267936873, 110.35999263578597";
const MAP_SRC = `https://maps.google.com/maps?q=${KOORDINAT}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
const MAPS_LINK = `https://www.google.com/maps?q=${KOORDINAT}`;

export default function Gereja6Page() {
    return (
        <div className="min-h-screen pb-12">
            <PageHeader
                title="Gereja St. Fransiskus Xaverius Dukuh"
                subtitle="Gereja Wilayah – Paroki Brayut"
                image="https://images.unsplash.com/photo-1438032005730-c779502df39b?q=80&w=2070&auto=format&fit=crop"
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
                        <p>
                            Sebuah rumah yang dialihfungsikan menjadi Gereja dan dihibahkan ke PGPM Paroki Brayut pada 3 Agustus 2019. Sebelumnya juga pernah digunakan sebagai tempat Perayaan Ekaristi sekitar tahun 1960.
                        </p>
                    </div>
                </section>

                <section className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        <div className="h-[300px] lg:h-full min-h-[300px] bg-gray-100 relative">
                            <iframe
                                width="100%" height="100%"
                                title="Peta Lokasi Gereja St. Fransiskus Xaverius Dukuh"
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
                                    <p>Dukuh RT 04/RW 21, Pandowoharjo, Sleman, Yogyakarta</p>
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

                <section className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                    <h2 className="text-2xl font-bold text-brand-dark mb-8 flex items-center gap-2">
                        <Calendar className="h-6 w-6 text-brand-blue" />Jadwal Misa
                    </h2>
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-brand-warm flex items-center justify-center mb-3 text-brand-blue">
                            <Clock className="h-6 w-6" />
                        </div>
                        <p className="text-gray-500 text-sm">Jadwal misa tersedia di halaman jadwal paroki</p>
                    </div>
                    <div className="mt-8 bg-blue-50 border-l-4 border-brand-blue rounded-lg p-5">
                        <p className="text-gray-700 text-sm">
                            <strong className="text-brand-dark">Informasi</strong>{" "}
                            Untuk jadwal lengkap, lihat halaman{" "}
                            <Link href="/jadwal-misa" className="text-brand-blue hover:underline font-semibold">Jadwal Misa</Link>.
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-brand-dark mb-6">Galeri Foto</h2>
                    <GerejaGallery photos={[]} churchName="Gereja St. Fransiskus Xaverius Dukuh" />
                </section>

                <InformationCard
                    title="Informasi Perubahan Jadwal"
                    description="Jadwal misa dapat berubah sewaktu-waktu. Untuk informasi terkini, pantau pengumuman mingguan atau hubungi sekretariat paroki."
                />
            </div>
        </div>
    );
}
