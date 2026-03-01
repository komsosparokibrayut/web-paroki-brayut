"use client";

import { useState } from "react";
import { Clock, MapPin, Users, AlertTriangle, Calendar } from "lucide-react";
import { JadwalMisaData, WeekNumber, WeeklySchedule } from "@/features/schedule/types";
import InformationCard from "@/components/ui/InformationCard";

const WEEK_LABELS = ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4", "Minggu 5"];
const WEEK_NUMBERS: WeekNumber[] = [1, 2, 3, 4, 5];

const MONTH_NAMES = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

/** Calculate which week of the month a given date falls in (1-5) */
function getWeekOfMonth(date: Date): WeekNumber {
    const dayOfMonth = date.getDate();
    const week = Math.ceil(dayOfMonth / 7);
    return Math.min(week, 5) as WeekNumber;
}

const YEAR_RANGE = 3; // show ±3 years from current

export default function JadwalMisaContent({ data }: { data: JadwalMisaData }) {
    const today = new Date();
    const [selectedMonthIdx, setSelectedMonthIdx] = useState(today.getMonth()); // 0-based
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());
    const monthName = MONTH_NAMES[selectedMonthIdx];
    const year = selectedYear;
    const currentWeek = getWeekOfMonth(today);
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === selectedMonthIdx;

    const yearOptions = Array.from({ length: YEAR_RANGE * 2 + 1 }, (_, i) => today.getFullYear() - YEAR_RANGE + i);

    const suspendedChurches = data.churches.filter(c => c.isSuspended);
    const activeChurches = data.churches.filter(c => !c.isSuspended);

    const getSchedulesForWeek = (churchId: string, week: WeekNumber): WeeklySchedule[] => {
        const church = data.churches.find(c => c.id === churchId);
        return church ? (church.weeklySchedules || []).filter(s => s.week === week) : [];
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
            {/* Month Title + Month/Year Picker */}
            <div className="text-center space-y-4">
                <h1 className="text-3xl md:text-4xl font-bold text-brand-dark">
                    Jadwal Misa Bulan {monthName} {year}
                </h1>
                {isCurrentMonth && (
                    <p className="text-gray-500">
                        Saat ini <span className="font-semibold text-brand-blue">Minggu ke-{currentWeek}</span> bulan {monthName}
                    </p>
                )}
                <div className="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-2.5 shadow-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <select
                        aria-label="Pilih bulan"
                        value={selectedMonthIdx}
                        onChange={(e) => setSelectedMonthIdx(Number(e.target.value))}
                        className="bg-transparent text-brand-dark font-medium focus:outline-none cursor-pointer border-0 pr-1 appearance-none"
                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0 center", paddingRight: "16px" }}
                    >
                        {MONTH_NAMES.map((name, i) => (
                            <option key={i} value={i}>{name}</option>
                        ))}
                    </select>
                    <select
                        aria-label="Pilih tahun"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="bg-transparent text-brand-dark font-medium focus:outline-none cursor-pointer border-0 pr-1 appearance-none"
                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0 center", paddingRight: "16px" }}
                    >
                        {yearOptions.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Suspended Churches */}
            {suspendedChurches.map(church => (
                <section key={church.id}>
                    <div className="max-w-4xl mx-auto">
                        <InformationCard
                            title="Perhatian"
                            description={`${church.name}: ${church.suspendedReason || "Jadwal misa ditiadakan untuk sementara waktu."}`}
                        />
                    </div>
                </section>
            ))}

            {/* Active Churches - Weekly Rotation Table */}
            {activeChurches.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold text-brand-dark mb-8 flex items-center gap-2">
                        <MapPin className="h-6 w-6 text-brand-blue" />
                        Jadwal Misa Gereja
                    </h2>

                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full border-collapse bg-white rounded-xl shadow-lg overflow-hidden">
                            <thead>
                                <tr className="bg-brand-dark text-white">
                                    <th className="px-4 py-4 text-left font-semibold text-sm">Gereja</th>
                                    {WEEK_LABELS.map((label, i) => (
                                        <th
                                            key={i}
                                            className={`px-4 py-4 text-center font-semibold text-sm transition-colors ${isCurrentMonth && WEEK_NUMBERS[i] === currentWeek
                                                ? "bg-brand-blue"
                                                : ""
                                                }`}
                                        >
                                            {label}
                                            {isCurrentMonth && WEEK_NUMBERS[i] === currentWeek && (
                                                <span className="block text-xs font-normal text-blue-200 mt-0.5">Minggu ini</span>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {activeChurches.map((church) => (
                                    <tr key={church.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-4 border-r border-gray-100">
                                            <div className="font-semibold text-gray-900 text-sm">{church.name}</div>
                                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                <MapPin className="h-3 w-3" />
                                                {church.location}
                                            </div>
                                        </td>
                                        {WEEK_NUMBERS.map((week) => {
                                            const slots = getSchedulesForWeek(church.id, week);
                                            const isCurrentWeek = isCurrentMonth && week === currentWeek;
                                            return (
                                                <td
                                                    key={week}
                                                    className={`px-3 py-4 text-center border-r border-gray-100 transition-colors ${isCurrentWeek ? "bg-blue-50/70" : ""
                                                        }`}
                                                >
                                                    {slots.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {slots.map((slot, idx) => (
                                                                <div key={idx} className={`rounded-lg p-2 ${isCurrentWeek ? "bg-brand-blue/10 border border-brand-blue/20" : "bg-gray-50"}`}>
                                                                    <div className="font-bold text-brand-dark text-sm">{slot.day}</div>
                                                                    <div className="text-brand-blue font-bold text-lg">{slot.time} WIB</div>
                                                                    <div className={`text-xs mt-1 inline-block px-2 py-0.5 rounded-full ${slot.bahasa === "Jawa"
                                                                        ? "bg-amber-100 text-amber-700"
                                                                        : "bg-purple-100 text-purple-700"
                                                                        }`}>
                                                                        Bahasa {slot.bahasa}
                                                                    </div>
                                                                    {slot.notes && (
                                                                        <p className="text-xs text-gray-400 mt-1 italic">{slot.notes}</p>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-300">—</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-6">
                        {activeChurches.map((church) => {
                            const currentSlots = getSchedulesForWeek(church.id, currentWeek);
                            return (
                                <div key={church.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                                    <div className="bg-brand-dark p-4 text-white relative overflow-hidden">
                                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-blue/20 rounded-full blur-3xl" />
                                        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-gold/10 rounded-full blur-3xl" />
                                        <h3 className="font-bold relative z-10">{church.name}</h3>
                                        <div className="flex items-center gap-1 text-sm text-blue-100 relative z-10 mt-1">
                                            <MapPin className="h-3 w-3" />
                                            {church.location}
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <div className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wide">
                                            {isCurrentMonth ? `Minggu ke-${currentWeek}` : "Semua Minggu"} • {monthName} {year}
                                        </div>
                                        {currentSlots.length > 0 ? (
                                            <div className="space-y-3">
                                                {currentSlots.map((slot, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                                                        <div>
                                                            <div className="font-bold text-gray-800">{slot.day}</div>
                                                            <div className={`text-xs mt-1 inline-block px-2 py-0.5 rounded-full ${slot.bahasa === "Jawa"
                                                                ? "bg-amber-100 text-amber-700"
                                                                : "bg-green-100 text-green-700"
                                                                }`}>
                                                                {slot.bahasa}
                                                            </div>
                                                            {slot.notes && (
                                                                <p className="text-xs text-gray-400 mt-1 italic">{slot.notes}</p>
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-2xl font-bold text-brand-blue">{slot.time}</div>
                                                            <div className="text-xs text-gray-500">WIB</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center py-6 text-gray-400 text-sm">
                                                <Clock className="h-6 w-6 mb-2 opacity-30" />
                                                <p>Tidak ada jadwal minggu ini</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Special Masses */}
            {data.specialMasses.length > 0 && (
                <section className="bg-brand-dark text-white rounded-3xl p-8 md:p-12 overflow-hidden relative">
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

            {/* Info Note */}
            <InformationCard
                title="Informasi Perubahan Jadwal"
                description="Jadwal misa dapat berubah sewaktu-waktu mengikuti kalender liturgi atau pada hari raya khusus. Untuk informasi terkini, silakan pantau pengumuman mingguan atau hubungi sekretariat paroki."
            />
        </div>
    );
}
