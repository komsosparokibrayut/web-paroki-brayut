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

// Colors for inventory-only bookings (violet/purple theme)
export const INVENTORY_COLORS = [
    "bg-violet-100 text-violet-800 border-violet-200",
    "bg-purple-100 text-purple-800 border-purple-200",
    "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
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
    const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("all");

    // Helper to get color for inventory bookings
    const getInventoryColor = (index: number) => INVENTORY_COLORS[index % INVENTORY_COLORS.length];

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
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <div className="flex items-center gap-2">
                            <Label className="text-slate-500 whitespace-nowrap">Tempat:</Label>
                            <Select value={selectedPlaceFilter} onValueChange={setSelectedPlaceFilter} modal={false}>
                                <SelectTrigger className="w-[180px]">
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
                        <div className="flex items-center gap-2">
                            <Label className="text-slate-500 whitespace-nowrap">Jenis:</Label>
                            <Select value={selectedTypeFilter} onValueChange={setSelectedTypeFilter} modal={false}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Semua Jenis" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem className="text-slate-600" value="all">Semua Jenis</SelectItem>
                                    <SelectItem className="text-slate-600" value="room">Ruangan</SelectItem>
                                    <SelectItem className="text-slate-600" value="inventory">Inventaris</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
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

                                // Filter bookings for calendar display
                                const approvedBookings = bookings.filter(b => {
                                    // Must be confirmed
                                    if (b.status !== "confirmed") return false;
                                    
                                    // Filter by place (for room bookings)
                                    if (selectedPlaceFilter !== "all") {
                                        if (b.type === 'inventory' && !b.placeId) return false;
                                        if (b.placeId && b.placeId !== selectedPlaceFilter) return false;
                                    }
                                    
                                    // Filter by booking type
                                    if (selectedTypeFilter !== "all") {
                                        if (selectedTypeFilter === "room") {
                                            // Show room and both types
                                            if (b.type === 'inventory') return false;
                                        } else if (selectedTypeFilter === "inventory") {
                                            // Show inventory and both types
                                            if (b.type === 'room') return false;
                                        }
                                    }
                                    
                                    return true;
                                });

                                return days.map((day, i) => {
                                    const dayBookings = approvedBookings.filter(b => {
                                        // Check multiDatesDetails first, then multiDates, then single date
                                        const dates = b.multiDatesDetails && b.multiDatesDetails.length > 0 
                                            ? b.multiDatesDetails.map(d => d.date)
                                            : (b.multiDates && b.multiDates.length > 0 ? b.multiDates : [b.date]);
                                        return dates.some(d => isSameDay(parseISO(d), day));
                                    });
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
                                                                    const isInventoryOnly = booking.type === 'inventory';
                                                                    const isRoomBooking = booking.type === 'room' || booking.type === 'both';
                                                                    
                                                                    // Get time range for this specific day from multiDatesDetails
                                                                    let displayStartTime = booking.startTime;
                                                                    let displayEndTime = booking.endTime;
                                                                    if (booking.multiDatesDetails && booking.multiDatesDetails.length > 0) {
                                                                        const dayDetail = booking.multiDatesDetails.find(d => {
                                                                            const bookingDate = isSameDay(parseISO(d.date), day);
                                                                            return bookingDate;
                                                                        });
                                                                        if (dayDetail) {
                                                                            displayStartTime = dayDetail.startTime;
                                                                            displayEndTime = dayDetail.endTime;
                                                                        }
                                                                    }
                                                                    
                                                                    // Determine color based on booking type
                                                                    let colorClass: string;
                                                                    if (isInventoryOnly) {
                                                                        // Use inventory colors for inventory-only bookings
                                                                        const invIndex = booking.borrowedItems 
                                                                            ? bookings.filter(b => b.type === 'inventory').indexOf(booking) % INVENTORY_COLORS.length
                                                                            : 0;
                                                                        colorClass = getInventoryColor(Math.max(0, invIndex));
                                                                    } else {
                                                                        // Use place colors for room/both bookings
                                                                        const placeIndex = places.findIndex(p => p.id === booking.placeId);
                                                                        colorClass = selectedPlaceFilter !== 'all' 
                                                                            ? PLACE_COLORS[0] 
                                                                            : PLACE_COLORS[placeIndex % PLACE_COLORS.length] || PLACE_COLORS[0];
                                                                    }
                                                                    
                                                                    return (
                                                                        <button
                                                                            key={booking.id}
                                                                            type="button"
                                                                            onClick={() => onSelectBooking(booking)}
                                                                            className={`w-full text-left text-xs p-1.5 rounded border ${colorClass} flex flex-col gap-0.5 leading-tight hover:brightness-95 active:scale-[0.98] transition-all cursor-pointer overflow-hidden`}
                                                                        >
                                                                            <div className="flex justify-between items-start gap-1 w-full">
                                                                                <span className="font-bold whitespace-nowrap truncate">{isInventoryOnly ? '' : `${displayStartTime}–${displayEndTime}`}</span>
                                                                            <div className="flex gap-0.5 shrink-0">
                                                                                {booking.isRescheduled && (
                                                                                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-[14px] flex items-center leading-none border-foreground/20">Pindah</Badge>
                                                                                )}
                                                                                {isInventoryOnly && (
                                                                                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-[14px] flex items-center leading-none border-violet-300 bg-violet-50 text-violet-700">Barang</Badge>
                                                                                )}
                                                                                {booking.type === 'both' && (
                                                                                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-[14px] flex items-center leading-none border-blue-300 bg-blue-50 text-blue-700">Ruangan+Barang</Badge>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <span className="font-medium truncate">{booking.purpose}</span>
                                                                        <span className="opacity-80 truncate text-[10px]">
                                                                            {isInventoryOnly 
                                                                                ? booking.userName
                                                                                : (selectedPlaceFilter === 'all' && place ? place.name : booking.userName)
                                                                            }
                                                                        </span>
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
                                                                            const isInventoryOnly = booking.type === 'inventory';
                                                                            
                                                                            // Get time range for this specific day from multiDatesDetails
                                                                            let displayStartTime = booking.startTime;
                                                                            let displayEndTime = booking.endTime;
                                                                            if (booking.multiDatesDetails && booking.multiDatesDetails.length > 0) {
                                                                                // Find the detail for the current day being displayed
                                                                                const dayDetail = booking.multiDatesDetails.find(d => {
                                                                                    const bookingDate = parseISO(d.date);
                                                                                    return isSameDay(bookingDate, day);
                                                                                });
                                                                                if (dayDetail) {
                                                                                    displayStartTime = dayDetail.startTime;
                                                                                    displayEndTime = dayDetail.endTime;
                                                                                }
                                                                            }
                                                                            
                                                                            // Determine color based on booking type
                                                                            let colorClass: string;
                                                                            if (isInventoryOnly) {
                                                                                const invIndex = booking.borrowedItems 
                                                                                    ? bookings.filter(b => b.type === 'inventory').indexOf(booking) % INVENTORY_COLORS.length
                                                                                    : 0;
                                                                                colorClass = getInventoryColor(Math.max(0, invIndex));
                                                                            } else {
                                                                                const placeIndex = places.findIndex(p => p.id === booking.placeId);
                                                                                colorClass = selectedPlaceFilter !== 'all' 
                                                                                    ? PLACE_COLORS[0] 
                                                                                    : PLACE_COLORS[placeIndex % PLACE_COLORS.length] || PLACE_COLORS[0];
                                                                            }
                                                                            
                                                                            return (
                                                                                <button
                                                                                    key={booking.id}
                                                                                    type="button"
                                                                                    onClick={() => onSelectBooking(booking)}
                                                                                    className={`w-full text-left text-xs p-2 rounded border ${colorClass} flex flex-col gap-0.5 leading-tight hover:brightness-95 transition-all cursor-pointer overflow-hidden`}
                                                                                >
                                                                                    <div className="flex justify-between items-start gap-1 w-full">
                                                                                        <span className="font-bold whitespace-nowrap truncate">{isInventoryOnly ? '' : `${displayStartTime}–${displayEndTime}`}</span>
                                                                                        <div className="flex gap-0.5 shrink-0">
                                                                                            {booking.isRescheduled && (
                                                                                                <Badge variant="outline" className="text-[9px] px-1 py-0 h-[14px] flex items-center leading-none border-foreground/20">Pindah</Badge>
                                                                                            )}
                                                                                            {isInventoryOnly && (
                                                                                                <Badge variant="outline" className="text-[9px] px-1 py-0 h-[14px] flex items-center leading-none border-violet-300 bg-violet-50 text-violet-700">Barang</Badge>
                                                                                            )}
                                                                                            {booking.type === 'both' && (
                                                                                                <Badge variant="outline" className="text-[9px] px-1 py-0 h-[14px] flex items-center leading-none border-blue-300 bg-blue-50 text-blue-700">Ruangan+Barang</Badge>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                    <span className="font-medium truncate">{booking.purpose}</span>
                                                                                    <span className="opacity-80 truncate text-[10px]">
                                                                                        {isInventoryOnly 
                                                                                            ? booking.userName
                                                                                            : (place ? place.name : booking.userName)
                                                                                        }
                                                                                    </span>
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
            {/* Legend */}
            <div className="px-4 py-3 bg-slate-50 border-t flex flex-wrap gap-3 text-xs text-slate-600">
                <span className="font-semibold">Keterangan:</span>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-red-100 border border-red-200"></div>
                    <span>Ruangan</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-violet-100 border border-violet-200"></div>
                    <span>Inventaris</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-[14px] border-violet-300 bg-violet-50 text-violet-700">Barang</Badge>
                    <span>Inventaris Saja</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-[14px] border-blue-300 bg-blue-50 text-blue-700">Ruangan+Barang</Badge>
                    <span>Keduanya</span>
                </div>
            </div>
        </Card>
    );
}
