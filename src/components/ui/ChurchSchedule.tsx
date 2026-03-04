import { Calendar, Clock } from "lucide-react";
import { ChurchUnit, WeekNumber } from "@/features/schedule/types";

export function ChurchSchedule({ church, currentWeek, isCurrentMonth, monthName, year }: { church: ChurchUnit, currentWeek: WeekNumber, isCurrentMonth: boolean, monthName: string, year: number }) {
    if (church.isSuspended) {
        return (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl">
                <h3 className="text-amber-800 font-bold flex items-center gap-2">
                    <span className="text-xl">⚠️</span> {church.name}
                </h3>
                <p className="text-amber-700 mt-2">
                    {church.suspendedReason || "Jadwal misa ditiadakan untuk sementara waktu."}
                </p>
            </div>
        );
    }

    const currentSlots = (church.weeklySchedules || []).filter(s => s.week === currentWeek);

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-2 text-brand-dark">
                    <Calendar className="h-6 w-6 text-brand-blue" />
                    <h2 className="text-2xl font-bold">Jadwal Misa</h2>
                </div>
                <div className="text-sm text-brand-dark font-semibold uppercase tracking-wide bg-blue-50 px-4 py-2 rounded-full border border-blue-100 shadow-sm inline-flex items-center justify-center text-center">
                    {isCurrentMonth ? `Minggu ke-${currentWeek}` : "Semua Minggu"} • {monthName} {year}
                </div>
            </div>

            {currentSlots.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentSlots.map((slot, idx) => (
                        <div key={idx} className="flex flex-row items-center justify-between p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-blue/30 transition-all group">
                            <div>
                                <div className="font-bold text-gray-800 text-lg group-hover:text-brand-blue transition-colors">{slot.day}</div>
                                <div className={`text-xs mt-2 inline-block px-3 py-1 rounded-full font-medium ${slot.bahasa === "Jawa"
                                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                                    : "bg-green-100 text-green-800 border border-green-200"
                                    }`}>
                                    Bahasa {slot.bahasa}
                                </div>
                                {slot.notes && (
                                    <p className="text-xs text-gray-500 mt-2 bg-gray-50 px-2 py-1 rounded-md inline-block">{slot.notes}</p>
                                )}
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center mb-2 group-hover:scale-110 group-hover:bg-brand-blue group-hover:text-white transition-all">
                                    <Clock className="h-5 w-5 text-brand-blue group-hover:text-white" />
                                </div>
                                <div className="flex flex-row gap-2 items-center">
                                    <div className="text-2xl font-bold text-brand-dark tracking-tight">{slot.time}</div>
                                    <div className="text-xs text-brand-blue font-bold tracking-wide uppercase">WIB</div>

                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                    <Clock className="h-10 w-10 mb-3 text-gray-300" />
                    <p className="font-medium text-gray-500">Tidak ada jadwal minggu ini</p>
                </div>
            )}
        </div>
    );
}
