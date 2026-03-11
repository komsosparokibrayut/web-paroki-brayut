"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MeetingBooking, MeetingPlace } from "@/features/booking/types";
import { submitBooking } from "@/features/booking/actions/bookings";
import { verifyMeetingRoomPassword } from "@/features/booking/actions/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, MapPin } from "lucide-react";

export default function MeetingRoomClient({
    isAuthenticated,
    initialBookings,
    places,
}: {
    isAuthenticated: boolean;
    initialBookings: MeetingBooking[];
    places: MeetingPlace[];
}) {
    const [isAuth, setIsAuth] = useState(isAuthenticated);
    const [password, setPassword] = useState("");
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const router = useRouter();
    
    const [newBooking, setNewBooking] = useState({
        placeId: "",
        date: "",
        startTime: "",
        endTime: "",
        userName: "",
        userContact: "",
        purpose: ""
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await verifyMeetingRoomPassword(password);
        if (success) {
            toast.success("Akses diberikan. Memuat data...");
            // Reload to fetch initial data
            window.location.reload(); 
        } else {
            toast.error("Password salah!");
        }
    };

    const handleBook = async (e: React.FormEvent) => {
        e.preventDefault();
        // Validation length and required fields mostly handled by required attributes
        if (!newBooking.placeId || !newBooking.date || !newBooking.startTime || !newBooking.endTime) {
            return toast.error("Semua field harus diisi");
        }

        toast.promise(submitBooking(newBooking), {
            loading: "Mengirim permohonan peminjaman...",
            success: () => {
                setIsBookingOpen(false);
                setTimeout(() => window.location.reload(), 1500);
                return "Permohonan berhasil dikirim, menunggu persetujuan admin.";
            },
            error: "Gagal mengirim permohonan",
        });
    };

    if (!isAuth) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 pt-32 bg-slate-50">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">Peminjaman Ruang</CardTitle>
                        <CardDescription className="text-center">
                            Masukkan password untuk mengakses jadwal ruang rapat
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Input 
                                    type="password" 
                                    placeholder="Password" 
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full">Akses Masuk</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Authenticated View
    return (
        <div className="min-h-screen pt-32 pb-16 bg-slate-50">
            <div className="container mx-auto px-4 max-w-6xl space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-brand-dark">Jadwal Penggunaan Ruangan</h1>
                        <p className="text-muted-foreground mt-1">Daftar peminjaman ruang rapat / gedung di lingkungan paroki.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="lg" onClick={() => router.refresh()}>
                            Refresh Jadwal
                        </Button>
                        <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                            <DialogTrigger asChild>
                                <Button size="lg" className="bg-brand-blue hover:bg-brand-dark transition-colors">
                                    Booking Ruang
                                </Button>
                            </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Form Peminjaman Ruang</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleBook} className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="place">Ruangan</Label>
                                    <Select value={newBooking.placeId} onValueChange={(val) => setNewBooking({...newBooking, placeId: val})} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Ruang" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {places.map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.name} (Kap: {p.capacity})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="date">Tanggal</Label>
                                        <Input id="date" type="date" value={newBooking.date} onChange={e => setNewBooking({...newBooking, date: e.target.value})} required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="startTime">Mulai</Label>
                                            <Input id="startTime" type="time" value={newBooking.startTime} onChange={e => setNewBooking({...newBooking, startTime: e.target.value})} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="endTime">Selesai</Label>
                                            <Input id="endTime" type="time" value={newBooking.endTime} onChange={e => setNewBooking({...newBooking, endTime: e.target.value})} required />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="userName">Nama Peminjam / Kelompok</Label>
                                    <Input id="userName" value={newBooking.userName} onChange={e => setNewBooking({...newBooking, userName: e.target.value})} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="userContact">Kontak (No HP / WA)</Label>
                                    <Input id="userContact" value={newBooking.userContact} onChange={e => setNewBooking({...newBooking, userContact: e.target.value})} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="purpose">Keperluan</Label>
                                    <Textarea id="purpose" value={newBooking.purpose} onChange={e => setNewBooking({...newBooking, purpose: e.target.value})} required />
                                </div>
                                <Button type="submit" className="w-full mt-4">Kirim Permohonan</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {initialBookings.length === 0 ? (
                        <Card className="col-span-full py-12">
                            <CardContent className="flex flex-col items-center justify-center text-muted-foreground">
                                <CalendarIcon className="w-12 h-12 mb-4 opacity-20" />
                                <p>Belum ada jadwal peminjaman ruangan.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        initialBookings.map((booking) => {
                            const place = places.find(p => p.id === booking.placeId);
                            return (
                                <Card key={booking.id} className="overflow-hidden border-t-4 border-t-brand-blue">
                                    <CardHeader className="pb-3 bg-white">
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge variant={booking.status === "confirmed" ? "default" : booking.status === "rejected" ? "destructive" : "secondary"}>
                                                {booking.status === "pending" ? "Menunggu Konfirmasi" : booking.status === "confirmed" ? "Disetujui" : "Ditolak"}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-xl">{place?.name || "Unknown Place"}</CardTitle>
                                        <CardDescription className="flex items-center text-sm font-medium pt-1">
                                            <CalendarIcon className="w-4 h-4 mr-2" />
                                            {new Date(booking.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4 pt-4 bg-slate-50/50">
                                        <div className="flex items-center text-sm text-slate-700 bg-white p-2 rounded-md border">
                                            <Clock className="w-4 h-4 mr-2 text-brand-dark" />
                                            <span className="font-semibold">{booking.startTime} - {booking.endTime}</span>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-muted-foreground uppercase">Peminjam</p>
                                            <p className="text-sm font-medium">{booking.userName}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-muted-foreground uppercase">Keperluan</p>
                                            <p className="text-sm">{booking.purpose}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
