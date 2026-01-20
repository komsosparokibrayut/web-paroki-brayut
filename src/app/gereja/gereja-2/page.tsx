import { Metadata } from "next";
import Link from "next/link";
import { MapPin, Clock, Phone, Mail, Calendar, Home, Building, Users, Car, Toilet, Speaker, Wind, Music } from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";

const FacilityIcon = ({ name, className }: { name: string, className?: string }) => {
    const icons: any = { Home, Building, Users, Car, Toilet, Speaker, Wind, Music };
    const Icon = icons[name];
    return Icon ? <Icon className={className} /> : null;
};

export const metadata: Metadata = {
    title: "Gereja [Nama Gereja 2] | Paroki Brayut",
    description: "Gereja [Nama Gereja 2] - Paroki Brayut Santo Yohanes Paulus II",
};

export default function Gereja2Page() {
    return (
        <div className="min-h-screen pb-12">
            <PageHeader
                title="[Nama Gereja 2]"
                subtitle="Wilayah [Nama Wilayah]"
                image="https://images.unsplash.com/photo-1438032005730-c779502df39b?q=80&w=2070&auto=format&fit=crop"
                align="left"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
                {/* Overview */}
                <section>
                    <h2 className="text-3xl font-bold text-brand-dark mb-6">Tentang Gereja</h2>
                    <div className="prose prose-lg text-gray-700 max-w-none">
                        <p>
                            [Deskripsi singkat tentang gereja, sejarah, dan peran dalam paroki]
                        </p>
                        <p>
                            [Tambahkan informasi penting lainnya di sini]
                        </p>
                    </div>
                </section>

                {/* Location Section */}
                <section className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Left: Map */}
                        <div className="h-[300px] lg:h-full min-h-[300px] bg-gray-100 relative">
                            <iframe
                                width="100%"
                                height="100%"
                                title="Peta Lokasi Gereja"
                                className="absolute inset-0 border-0"
                                loading="lazy"
                                allowFullScreen
                                src="https://maps.google.com/maps?q=Yogyakarta&t=&z=13&ie=UTF8&iwloc=&output=embed"
                            />
                        </div>

                        {/* Right: Info */}
                        <div className="p-8">
                            <h3 className="text-2xl font-bold text-brand-dark mb-6 flex items-center gap-2">
                                <MapPin className="h-6 w-6 text-brand-blue" />
                                Lokasi
                            </h3>
                            <div className="space-y-6 text-gray-700">
                                <div>
                                    <div className="font-semibold text-brand-dark mb-1">Alamat</div>
                                    <p>
                                        [Alamat Lengkap Gereja]<br />
                                        Kabupaten Sleman, DIY 55581
                                    </p>
                                </div>

                                <div className="border-t border-gray-200 pt-6">
                                    <div className="font-semibold text-brand-dark mb-2 flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-brand-blue" />
                                        Kontak
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <div>Telp: [Nomor Telepon]</div>
                                        <div>Koordinator: [Nama Koordinator]</div>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <a
                                        href="#"
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

                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200 gap-y-8 md:gap-y-0">
                        {/* Minggu */}
                        <div className="px-4 text-center">
                            <div className="flex flex-col items-center justify-center mb-4">
                                <div className="w-12 h-12 rounded-full bg-brand-warm flex items-center justify-center mb-3 text-brand-blue">
                                    <Clock className="h-6 w-6" />
                                </div>
                                <h3 className="font-bold text-lg text-brand-dark">Minggu</h3>
                            </div>
                            <div className="space-y-2 text-gray-700">
                                <div className="font-semibold text-xl">[Jam] WIB</div>
                            </div>
                        </div>

                        {/* Harian */}
                        <div className="px-4 text-center">
                            <div className="flex flex-col items-center justify-center mb-4">
                                <div className="w-12 h-12 rounded-full bg-brand-warm flex items-center justify-center mb-3 text-brand-blue">
                                    <Clock className="h-6 w-6" />
                                </div>
                                <h3 className="font-bold text-lg text-brand-dark">Hari Lain</h3>
                            </div>
                            <div className="space-y-2 text-gray-700">
                                <div className="font-semibold text-xl">[Hari]: [Jam] WIB</div>
                            </div>
                        </div>

                        {/* Khusus */}
                        <div className="px-4 text-center">
                            <div className="flex flex-col items-center justify-center mb-4">
                                <div className="w-12 h-12 rounded-full bg-brand-warm flex items-center justify-center mb-3 text-brand-blue">
                                    <Clock className="h-6 w-6" />
                                </div>
                                <h3 className="font-bold text-lg text-brand-dark">Misa Khusus</h3>
                            </div>
                            <div className="space-y-4 text-gray-700">
                                <div>
                                    <div className="font-semibold">Jumat Pertama</div>
                                    <div className="text-sm text-gray-500">18.30 WIB</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Information Note */}
                    <div className="mt-10 bg-blue-50 border-l-4 border-brand-blue rounded-lg p-6">
                        <p className="text-gray-700">
                            <strong className="text-brand-dark">Informasi</strong> <br />Untuk informasi lebih detail mengenai
                            kegiatan dan jadwal khusus, silakan hubungi sekretariat paroki.
                        </p>
                    </div>
                </section>

                {/* Facilities */}
                <section>
                    <h2 className="text-2xl font-bold text-brand-dark mb-6">Fasilitas</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { name: "Ruang Utama", icon: "Home" },
                            { name: "Parkir", icon: "Car" },
                            { name: "Kamar Kecil", icon: "Toilet" },
                            { name: "Audio System", icon: "Speaker" },
                        ].map((facility, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col items-center justify-center text-center hover:border-brand-blue hover:shadow-md transition-all gap-3"
                            >
                                <FacilityIcon name={facility.icon} className="h-8 w-8 text-brand-gold" />
                                <div className="font-medium text-gray-700">{facility.name}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Gallery Placeholder */}
                <section>
                    <h2 className="text-2xl font-bold text-brand-dark mb-6">Galeri Foto</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="aspect-square bg-gray-200 rounded-lg overflow-hidden"
                            >
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    Foto {i}
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-4">
                        * Foto-foto akan segera ditambahkan
                    </p>
                </section>
            </div>
        </div>
    );
}
