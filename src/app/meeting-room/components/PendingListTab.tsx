import { useState } from "react";
import { MeetingBooking, MeetingPlace } from "@/features/booking/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Clock, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

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

    const allPendingBookings = bookings
        .filter(b => b.status === 'pending')
        .filter(b => {
            const q = pendingSearch.toLowerCase();
            if (!q) return true;
            const placeName = places.find(p => p.id === b.placeId)?.name || "";
            return b.userName.toLowerCase().includes(q) || b.purpose.toLowerCase().includes(q) || placeName.toLowerCase().includes(q);
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const pendingPageCount = Math.max(1, Math.ceil(allPendingBookings.length / PENDING_PAGE_SIZE));
    const pagedPendingBookings = allPendingBookings.slice((pendingPage - 1) * PENDING_PAGE_SIZE, pendingPage * PENDING_PAGE_SIZE);

    return (
        <div className="space-y-4">
            <div className="relative mb-4">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Cari nama peminjam, keperluan, atau tempat..."
                    value={pendingSearch}
                    onChange={e => { setPendingSearch(e.target.value); setPendingPage(1); }}
                    className="pl-10 bg-white"
                />
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
                                    {booking.isRescheduled && (
                                        <Badge variant="secondary" className="absolute top-2 right-2 border-amber-500 text-amber-500 bg-amber-50">Dipindah Jadwal</Badge>
                                    )}
                                    <CardHeader className="pb-3 bg-white">
                                        <CardTitle className="text-lg pr-24">{booking.type === 'inventory' ? 'Peminjaman Barang' : place?.name || "Ruangan Tidak Diketahui"}</CardTitle>
                                        <CardDescription className="flex items-center text-sm font-medium pt-1">
                                            <CalendarIcon className="w-4 h-4 mr-2" />
                                            {new Date(booking.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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
