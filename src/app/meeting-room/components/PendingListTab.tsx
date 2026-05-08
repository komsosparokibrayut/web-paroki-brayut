import { useState } from "react";
import { MeetingBooking, MeetingPlace } from "@/features/booking/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Clock, Calendar as CalendarIcon, ChevronLeft, ChevronRight, CalendarDays, Package } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";

const PENDING_PAGE_SIZE = 9;

export function PendingListTab({
    bookings,
    places,
    isRefreshing
}: {
    bookings: MeetingBooking[];
    places: MeetingPlace[];
    isRefreshing: boolean;
}) {
    const [pendingSearch, setPendingSearch] = useState("");
    const [pendingPage, setPendingPage] = useState(1);
    const [typeFilter, setTypeFilter] = useState<string>("all");

    const allPendingBookings = bookings
        .filter(b => b.status === 'pending')
        .filter(b => {
            // Filter by booking type
            if (typeFilter !== "all") {
                if (typeFilter === "room") {
                    // Show room and both types
                    if (b.type === 'inventory') return false;
                } else if (typeFilter === "inventory") {
                    // Show inventory and both types
                    if (b.type === 'room') return false;
                }
            }
            return true;
        })
        .filter(b => {
            const q = pendingSearch.toLowerCase();
            if (!q) return true;
            const placeName = places.find(p => p.id === b.placeId)?.name || "";
            return b.userName.toLowerCase().includes(q) || b.purpose.toLowerCase().includes(q) || placeName.toLowerCase().includes(q);
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const pendingPageCount = Math.max(1, Math.ceil(allPendingBookings.length / PENDING_PAGE_SIZE));
    const pagedPendingBookings = allPendingBookings.slice((pendingPage - 1) * PENDING_PAGE_SIZE, pendingPage * PENDING_PAGE_SIZE);

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari nama peminjam, keperluan, atau tempat..."
                        value={pendingSearch}
                        onChange={e => { setPendingSearch(e.target.value); setPendingPage(1); }}
                        className="pl-10 bg-white"
                    />
                </div>
                <Select value={typeFilter} onValueChange={(val) => { setTypeFilter(val); setPendingPage(1); }} modal={false}>
                    <SelectTrigger className="w-full sm:w-[180px] bg-white">
                        <SelectValue placeholder="Semua Jenis" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                        <SelectItem className="text-slate-600" value="all">Semua Jenis</SelectItem>
                        <SelectItem className="text-slate-600" value="room">Ruangan</SelectItem>
                        <SelectItem className="text-slate-600" value="inventory">Inventaris</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {isRefreshing ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="overflow-hidden border-t-4 border-t-brand-blue/20">
                            <CardHeader className="pb-3 bg-white">
                                <Skeleton className="h-5 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4 bg-slate-50/50">
                                <Skeleton className="h-10 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {pagedPendingBookings.length === 0 ? (
                        <Card className="col-span-full py-12">
                            <CardContent className="flex flex-col items-center justify-center text-muted-foreground">
                                <Clock className="w-12 h-12 mb-4 opacity-20" />
                                <p>{pendingSearch ? "Tidak ada hasil yang cocok." : "Tidak ada permohonan pending."}</p>
                            </CardContent>
                        </Card>
                    ) : (
                        pagedPendingBookings.map((booking) => {
                            const place = places.find(p => p.id === booking.placeId);
                            return (
                                <Card key={booking.id} className="overflow-hidden border-t-4 border-t-amber-500 relative">
                                    <div className="absolute top-2 right-2 flex gap-1 flex-wrap justify-end max-w-[50%]">
                                        {booking.type === 'inventory' && (
                                            <Badge variant="outline" className="border-violet-500 text-violet-600 bg-violet-50 shrink-0">
                                                <Package className="w-3 h-3 mr-1" />
                                                Barang
                                            </Badge>
                                        )}
                                        {booking.type === 'both' && (
                                            <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50 shrink-0">
                                                <CalendarDays className="w-3 h-3 mr-1" />
                                                Ruangan+Barang
                                            </Badge>
                                        )}
                                        {booking.isRescheduled && (
                                            <Badge variant="secondary" className="border-amber-500 text-amber-500 bg-amber-50 shrink-0">Dipindah Jadwal</Badge>
                                        )}
                                        {booking.multiDates && booking.multiDates.length > 1 && (
                                            <Badge variant="outline" className="border-blue-500 text-blue-500 bg-blue-50 shrink-0">
                                                <CalendarDays className="w-3 h-3 mr-1" />
                                                Multi-Hari
                                            </Badge>
                                        )}
                                    </div>
                                    <CardHeader className="pb-3 bg-white">
                                        <CardTitle className="text-lg pr-24">{booking.type === 'inventory' ? 'Peminjaman Barang' : place?.name || "Ruangan Tidak Diketahui"}</CardTitle>
                                        <CardDescription className="flex items-center text-sm font-medium pt-1">
                                            <CalendarIcon className="w-4 h-4 mr-2" />
                                            {booking.multiDates && booking.multiDates.length > 1 ? (
                                                <span>
                                                    {booking.multiDates.length} hari: {booking.multiDates.slice(0, 2).map(d => 
                                                        format(parseISO(d), 'd MMM', { locale: idLocale })
                                                    ).join(', ')}
                                                    {booking.multiDates.length > 2 && '...'}
                                                </span>
                                            ) : (
                                                new Date(booking.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                                            )}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3 pt-3 bg-slate-50/50">
                                        {booking.type !== 'inventory' && (
                                            <div className="flex items-center text-sm text-slate-700 bg-white p-2 rounded-md border">
                                                <Clock className="w-4 h-4 mr-2 text-amber-500" />
                                                <span className="font-semibold">{booking.startTime} - {booking.endTime}</span>
                                            </div>
                                        )}
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-muted-foreground uppercase">Peminjam</p>
                                            <p className="text-sm font-medium">{booking.userName}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-muted-foreground uppercase">Keperluan</p>
                                            <p className="text-sm">{booking.purpose}</p>
                                        </div>
                                        {booking.borrowedItems && booking.borrowedItems.length > 0 && (
                                            <div className="space-y-1 border-t pt-2 mt-2">
                                                <p className="text-xs font-semibold text-muted-foreground uppercase">Barang Dipinjam</p>
                                                <ul className="text-sm list-disc list-inside">
                                                    {booking.borrowedItems.map((item, idx) => (
                                                        <li key={idx}>({item.quantity}x) {item.name}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            )}
            {!isRefreshing && pendingPageCount > 1 && (
                <div className="flex items-center justify-center gap-3 pt-4">
                    <Button variant="outline" size="icon" disabled={pendingPage <= 1} onClick={() => setPendingPage(p => p - 1)} className="bg-white">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">Halaman {pendingPage} / {pendingPageCount}</span>
                    <Button variant="outline" size="icon" disabled={pendingPage >= pendingPageCount} onClick={() => setPendingPage(p => p + 1)} className="bg-white">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
