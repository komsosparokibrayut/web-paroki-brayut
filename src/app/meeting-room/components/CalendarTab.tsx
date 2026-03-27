import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek, parseISO, isSameDay, addMonths, subMonths } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { MeetingBooking, MeetingPlace } from "@/features/booking/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const PLACE_COLORS = [
    "bg-red-100 text-red-800 border-red-200",
    "bg-sky-100 text-sky-800 border-sky-200",
    "bg-emerald-100 text-emerald-800 border-emerald-200",
    "bg-amber-100 text-amber-800 border-amber-200",
    "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
    "bg-indigo-100 text-indigo-800 border-indigo-200",
    "bg-rose-100 text-rose-800 border-rose-200",
    "bg-cyan-100 text-cyan-800 border-cyan-200",
    "bg-lime-100 text-lime-800 border-lime-200",
    "bg-orange-100 text-orange-800 border-orange-200",
];

export function CalendarTab({
    bookings,
    places,
    onSelectBooking,
}: {
    bookings: MeetingBooking[];
    places: MeetingPlace[];
    onSelectBooking: (booking: MeetingBooking) => void;
}) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedPlaceFilter, setSelectedPlaceFilter] = useState<string>("all");

    return (
        <Card className="overflow-hidden">
            <CardHeader className="bg-white border-b sticky top-0 z-10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Button className="bg-white hover:bg-slate-500/10 text-black hover:text-black" variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <h2 className="text-xl font-bold w-48 text-center">
                            {format(currentMonth, 'MMMM yyyy', { locale: idLocale })}
                        </h2>
                        <Button className="bg-white hover:bg-slate-500/10 text-black hover:text-black" variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Label className="text-slate-500">Filter Tempat:</Label>
                        <Select value={selectedPlaceFilter} onValueChange={setSelectedPlaceFilter} modal={false}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Semua Tempat" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                <SelectItem className="text-slate-600" value="all">Semua Tempat</SelectItem>
                                {places.map((p: MeetingPlace) => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0 relative">
                <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 md:hidden" aria-hidden="true" />
                <div className="overflow-x-auto">
                    <div className="min-w-[800px]">
                        <div className="grid grid-cols-7 border-b bg-slate-50">
                            {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => (
                                <div key={day} className="py-2 text-center text-sm font-semibold text-slate-500 border-r">{day}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 auto-rows-fr">
                            {(() => {
                                const monthStart = startOfMonth(currentMonth);
                                const monthEnd = endOfMonth(monthStart);
                                const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
                                const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

                                const dateFormat = "d";
                                const days = eachDayOfInterval({ start: startDate, end: endDate });

                                const approvedBookings = bookings.filter(b => b.status === "confirmed" && (selectedPlaceFilter === "all" || b.placeId === selectedPlaceFilter));

                                return days.map((day, i) => {
                                    const dayBookings = approvedBookings.filter(b => isSameDay(parseISO(b.date), day));
                                    return (
                                        <div
                                            key={day.toISOString()}
                                            className={`min-h-[120px] p-1 border-b border-r ${!isSameMonth(day, monthStart) ? 'bg-slate-100/50 text-slate-400' : 'bg-white'} ${isToday(day) ? 'bg-blue-50/30' : ''}`}
                                        >
                                            <div className={`text-right text-sm mb-1 ${isToday(day) ? 'font-bold text-brand-blue flex justify-end items-center gap-1' : 'font-medium'}`}>
                                                {format(day, dateFormat)}
                                                {isToday(day) && <span className="h-2 w-2 rounded-full bg-brand-blue inline-block"></span>}
                                            </div>
                                            <div className="space-y-1">
                                                {(() => {
                                                    const sorted = dayBookings.sort((a, b) => a.startTime.localeCompare(b.startTime));
                                                    const MAX_VISIBLE = 2;
                                                    const visible = sorted.slice(0, MAX_VISIBLE);
                                                    const overflowBookings = sorted.slice(MAX_VISIBLE);
                                                    return (
                                                        <>
                                                            {visible.map((booking) => {
                                                                const place = places.find(p => p.id === booking.placeId);
                                                                const placeIndex = places.findIndex(p => p.id === booking.placeId);
                                                                const colorClass = selectedPlaceFilter !== 'all' ? PLACE_COLORS[0] : PLACE_COLORS[placeIndex % PLACE_COLORS.length] || PLACE_COLORS[0];
                                                                return (
                                                                    <button
                                                                        key={booking.id}
                                                                        type="button"
                                                                        onClick={() => onSelectBooking(booking)}
                                                                        className={`w-full text-left text-xs p-1.5 rounded border ${colorClass} flex flex-col gap-0.5 leading-tight hover:brightness-95 active:scale-[0.98] transition-all cursor-pointer overflow-hidden`}
                                                                    >
                                                                        <div className="flex justify-between items-start gap-1 w-full">
                                                                            <span className="font-bold whitespace-nowrap truncate">{booking.startTime}–{booking.endTime}</span>
                                                                            {booking.isRescheduled && (
                                                                                <Badge variant="outline" className="text-[9px] px-1 py-0 h-[14px] flex items-center leading-none border-foreground/20 shrink-0">Pindah</Badge>
                                                                            )}
                                                                        </div>
                                                                        <span className="font-medium truncate">{booking.purpose}</span>
                                                                        <span className="opacity-80 truncate text-[10px]">{selectedPlaceFilter === 'all' && place ? place.name : booking.userName}</span>
                                                                    </button>
                                                                );
                                                            })}
                                                            {overflowBookings.length > 0 && (
                                                                <Popover>
                                                                    <PopoverTrigger asChild>
                                                                        <button type="button" className="w-full text-[10px] text-center py-0.5 px-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium cursor-pointer transition-colors">
                                                                            +{overflowBookings.length} lainnya
                                                                        </button>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent className="w-64 p-2 space-y-1" align="start" side="right">
                                                                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Jadwal lainnya</p>
                                                                        {overflowBookings.map((booking) => {
                                                                            const place = places.find(p => p.id === booking.placeId);
                                                                            const placeIndex = places.findIndex(p => p.id === booking.placeId);
                                                                            const colorClass = selectedPlaceFilter !== 'all' ? PLACE_COLORS[0] : PLACE_COLORS[placeIndex % PLACE_COLORS.length] || PLACE_COLORS[0];
                                                                            return (
                                                                                <button
                                                                                    key={booking.id}
                                                                                    type="button"
                                                                                    onClick={() => onSelectBooking(booking)}
                                                                                    className={`w-full text-left text-xs p-2 rounded border ${colorClass} flex flex-col gap-0.5 leading-tight hover:brightness-95 transition-all cursor-pointer overflow-hidden`}
                                                                                >
                                                                                    <div className="flex justify-between items-start gap-1 w-full">
                                                                                        <span className="font-bold whitespace-nowrap truncate">{booking.startTime}–{booking.endTime}</span>
                                                                                        {booking.isRescheduled && (
                                                                                            <Badge variant="outline" className="text-[9px] px-1 py-0 h-[14px] flex items-center leading-none border-foreground/20 shrink-0">Pindah</Badge>
                                                                                        )}
                                                                                    </div>
                                                                                    <span className="font-medium truncate">{booking.purpose}</span>
                                                                                    <span className="opacity-80 truncate text-[10px]">{place ? place.name : booking.userName}</span>
                                                                                </button>
                                                                            );
                                                                        })}
                                                                    </PopoverContent>
                                                                </Popover>
                                                            )}
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
