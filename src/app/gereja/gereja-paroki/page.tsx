import { Metadata } from "next";
import Link from "next/link";
import { MapPin, Clock, Calendar } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import InformationCard from "@/components/ui/InformationCard";
import { GerejaGallery } from "@/features/gereja/components/GerejaGallery";

export const metadata: Metadata = {
    title: "Gereja St. Yusup Tambakrejo (Paroki) | Paroki Brayut",
    description: "Gereja St. Yusup Tambakrejo – Gereja Paroki St. Yohanes Paulus II Brayut",
};

const MAP_SRC = "https://maps.google.com/maps?q=Gereja+St.+Yusup+Tambakrejo&t=&z=16&ie=UTF8&iwloc=&output=embed";
const MAPS_LINK = "https://maps.app.goo.gl/a4PYVvPPrMChWLhc9";

export default function Gereja1Page() {
    return (
        <div className="min-h-screen pb-12">
            <PageHeader
                title="Gereja St. Yusup Tambakrejo"
                subtitle="Gereja Paroki St. Yohanes Paulus II Brayut"
                image="https://images.unsplash.com/photo-1548625149-fc4a29cf7092?q=80&w=2072&auto=format&fit=crop"
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
                <section className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                    <h2 className="text-2xl font-bold text-brand-dark mb-8 flex items-center gap-2">
                        <Calendar className="h-6 w-6 text-brand-blue" />
                        Jadwal Misa
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200 gap-y-8 md:gap-y-0">
                        <div className="px-4 text-center">
                            <div className="flex flex-col items-center justify-center mb-4">
                                <div className="w-12 h-12 rounded-full bg-brand-warm flex items-center justify-center mb-3 text-brand-blue">
                                    <Clock className="h-6 w-6" />
                                </div>
                                <h3 className="font-bold text-lg text-brand-dark">Minggu</h3>
                            </div>
                            <div className="space-y-2 text-gray-700">
                                <div className="font-semibold text-xl">06.00 WIB, 08.00 WIB</div>
                                <div className="font-semibold text-xl">17.00 WIB</div>
                            </div>
                        </div>
                        <div className="px-4 text-center">
                            <div className="flex flex-col items-center justify-center mb-4">
                                <div className="w-12 h-12 rounded-full bg-brand-warm flex items-center justify-center mb-3 text-brand-blue">
                                    <Clock className="h-6 w-6" />
                                </div>
                                <h3 className="font-bold text-lg text-brand-dark">Senin – Sabtu</h3>
                            </div>
                            <div className="space-y-2 text-gray-700">
                                <div className="font-semibold text-xl">06.00 WIB</div>
                                <div className="text-sm text-gray-500">Misa Harian</div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-10 bg-blue-50 border-l-4 border-brand-blue rounded-lg p-5">
                        <p className="text-gray-700 text-sm">
                            <strong className="text-brand-dark">Informasi</strong>
                            {" "}Untuk jadwal lengkap dan misa khusus, lihat halaman{" "}
                            <Link href="/jadwal-misa" className="text-brand-blue hover:underline font-semibold">
                                Jadwal Misa
                            </Link>.
                        </p>
                    </div>
                </section>

                {/* Gallery */}
                <section>
                    <h2 className="text-2xl font-bold text-brand-dark mb-6">Galeri Foto</h2>
                    <GerejaGallery photos={[]} churchName="Gereja St. Yusup Tambakrejo" />
                </section>

                <InformationCard
                    title="Informasi Perubahan Jadwal"
                    description="Jadwal misa dapat berubah sewaktu-waktu. Untuk informasi terkini, pantau pengumuman mingguan atau hubungi sekretariat paroki."
                />
            </div>
        </div>
    );
}
