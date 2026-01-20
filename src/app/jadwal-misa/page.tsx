
import { Metadata } from "next";
import { Calendar, Clock, MapPin, Users, Info } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { getJadwalMisa, JadwalMisaData } from "@/actions/data";
import InformationCard from "@/components/ui/InformationCard";

export const metadata: Metadata = {
    title: "Jadwal Misa | Paroki Brayut",
    description: "Jadwal misa lengkap untuk semua gereja dan kapel di Paroki Brayut Santo Yohanes Paulus II",
};

// Fallback data with updated chapel cards and details
const fallbackData: JadwalMisaData = {
    churches: [
        {
            id: "induk",
            name: "Gereja Santo Yusuf Tambakrejo",
            location: "Rejodani 1, Sariharjo, Ngaglik",
            schedules: [
                { day: "Minggu", times: ["06.00", "08.00", "17.00"], notes: "Misa Minggu" },
                { day: "Senin - Sabtu", times: ["06.00"], notes: "Misa Harian" },
            ]
        },
        {
            id: "kapel-1",
            name: "Kapel Wilayah 1",
            location: "Wilayah 1",
            schedules: [
                { day: "Minggu", times: ["07.00"], notes: "Minggu, 12 Oktober 2025" },
                { day: "Rabu", times: ["06.00"], notes: "Rabu, 8 Oktober 2025" },
            ]
        },
        {
            id: "kapel-2",
            name: "Kapel Wilayah 2",
            location: "Wilayah 2",
            schedules: [
                { day: "Minggu", times: ["08.00"], notes: "Minggu, 12 Oktober 2025" },
                { day: "Kamis", times: ["06.00"], notes: "Kamis, 9 Oktober 2025" },
            ]
        },
        {
            id: "kapel-3",
            name: "Kapel Wilayah 3",
            location: "Wilayah 3",
            schedules: [
                { day: "Minggu", times: ["09.00"], notes: "Minggu, 12 Oktober 2025" },
                { day: "Jumat", times: ["06.00"], notes: "Jumat, 10 Oktober 2025" },
            ]
        },
        {
            id: "kapel-4",
            name: "Kapel Wilayah 4",
            location: "Wilayah 4",
            schedules: [
                { day: "Minggu", times: ["16.00"], notes: "Minggu, 12 Oktober 2025" },
                { day: "Sabtu", times: ["17.00"], notes: "Sabtu, 11 Oktober 2025" },
            ]
        },
        {
            id: "kapel-5",
            name: "Kapel Wilayah 5",
            location: "Wilayah 5",
            schedules: [
                { day: "Minggu", times: ["18.00"], notes: "Minggu, 12 Oktober 2025" },
                { day: "Sabtu", times: ["18.00"], notes: "Sabtu, 11 Oktober 2025" },
            ]
        },
    ],
    specialMasses: [
        {
            id: "jumat-pertama",
            name: "Jumat Pertama",
            time: "18.30 WIB",
            location: "Gereja Utama",
            description: "Misa Jumat Pertama setiap bulan"
        },
        {
            id: "omk",
            name: "Misa OMK",
            time: "19.00 WIB",
            location: "Gereja Utama",
            description: "Misa kaum muda, Minggu ke-3"
        }
    ]
};

export default async function JadwalMisaPage() {
    const data = await getJadwalMisa() || fallbackData;
    const mainChurch = data.churches[0];
    const otherChurches = data.churches.slice(1);

    return (
        <div className="min-h-screen pb-12">
            <PageHeader
                title="Jadwal Misa"
                subtitle="Paroki Brayut Santo Yohanes Paulus II"
                image="https://images.unsplash.com/photo-1470686164816-830d3688f62c?q=80&w=2073&auto=format&fit=crop"
                align="center"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
                {/* Main Church Schedule */}
                <section>
                    <div className="text-center mb-10">
                        <span className="bg-brand-blue/10 text-brand-blue px-4 py-2 rounded-full text-sm font-semibold tracking-wide uppercase">
                            Gereja Induk
                        </span>
                        <h2 className="text-3xl font-bold text-brand-dark mt-4 mb-2">{mainChurch.name}</h2>
                        <div className="flex items-center justify-center gap-2 text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <p>{mainChurch.location}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {mainChurch.schedules.map((schedule, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-16 h-16 rounded-full bg-brand-warm flex items-center justify-center mb-6 text-brand-blue">
                                        <Clock className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-brand-dark mb-4">{schedule.day}</h3>
                                    <div className="space-y-3">
                                        {schedule.times.map((time, idx) => (
                                            <div key={idx} className="text-2xl font-bold text-brand-blue">
                                                {time} <span className="text-base font-normal text-gray-500">WIB</span>
                                            </div>
                                        ))}
                                    </div>
                                    {schedule.notes && (
                                        <div className="mt-6 pt-6 border-t border-gray-100 w-full">
                                            <p className="text-gray-500 italic">{schedule.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Special Masses */}
                {data.specialMasses.length > 0 && (
                    <section className="bg-brand-dark text-white rounded-3xl p-8 md:p-12 overflow-hidden relative">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-gold/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <Users className="h-8 w-8 text-brand-gold" />
                                <h2 className="text-2xl md:text-3xl font-bold">Misa Khusus</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {data.specialMasses.map((mass) => (
                                    <div key={mass.id} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:bg-white/15 transition-colors">
                                        <h3 className="text-xl font-bold mb-3">{mass.name}</h3>
                                        <div className="space-y-3 text-gray-200">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-brand-blue/30 flex items-center justify-center flex-shrink-0">
                                                    <Clock className="h-4 w-4 text-brand-blue-light" />
                                                </div>
                                                <span className="font-semibold">{mass.time}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-brand-blue/30 flex items-center justify-center flex-shrink-0">
                                                    <MapPin className="h-4 w-4 text-brand-blue-light" />
                                                </div>
                                                <span>{mass.location}</span>
                                            </div>
                                            <p className="mt-4 text-sm text-gray-400 leading-relaxed border-t border-white/10 pt-4">
                                                {mass.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Chapels */}
                {otherChurches.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold text-brand-dark mb-8 flex items-center gap-2">
                            <MapPin className="h-6 w-6 text-brand-blue" />
                            Jadwal Kapel Wilayah
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {otherChurches.map((chapel) => (
                                <div key={chapel.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                                    <div className="bg-brand-dark p-6 border-b border-gray-100 text-white overflow-hidden relative">
                                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-blue/20 rounded-full blur-3xl" />
                                        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-gold/10 rounded-full blur-3xl" />

                                        <h3 className="text-lg font-bold mb-2">{chapel.name}</h3>
                                        <div className="flex items-start gap-2 text-sm text-blue-100">
                                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                            <span>{chapel.location}</span>
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-4 flex-1">
                                        {chapel.schedules.map((item, idx) => (
                                            <div key={idx} className="flex flex-col p-4 bg-gray-50 rounded-lg group hover:bg-brand-blue/5 transition-colors border-l-4 border-brand-dark">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-bold text-gray-800">{item.day}</span>
                                                    <div className="flex flex-col text-right">
                                                        {item.times.map((t, tIdx) => (
                                                            <span key={tIdx} className="text-brand-dark font-bold text-lg">
                                                                {t} <span className="text-xs font-bold text-gray-500">WIB</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                {item.notes && (
                                                    <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-1 pt-2 border-t border-gray-200/50">
                                                        <Calendar className="h-3 w-3" />
                                                        {item.notes}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Info Note */}
                <InformationCard
                    title="Informasi Perubahan Jadwal"
                    description="Jadwal misa dapat berubah sewaktu-waktu mengikuti kalender liturgi atau pada hari raya khusus. Untuk informasi terkini, silakan pantau pengumuman mingguan atau hubungi sekretariat paroki."
                />
            </div>
        </div>
    );
}
