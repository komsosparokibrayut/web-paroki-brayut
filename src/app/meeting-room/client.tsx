"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { MeetingBooking, MeetingPlace, InventoryItem } from "@/features/booking/types";
import { submitBooking, getBookings } from "@/features/booking/actions/bookings";
import { verifyMeetingRoomPassword } from "@/features/booking/actions/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogBody, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PhoneInput } from "@/components/ui/phone-input"
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Clock, MapPin, RefreshCw, Eye, EyeOff, ChevronLeft, ChevronRight, Plus, ChevronDown, Package, Building2, Search } from "lucide-react";
import { TimePicker } from "@/components/ui/time-picker";
import { DatePicker } from "@/components/ui/date-picker";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek, parseISO, isSameDay, addMonths, subMonths } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";

const PLACE_COLORS = [
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

export default function MeetingRoomClient({
    isAuthenticated,
    initialBookings,
    places,
    inventoryItems,
}: {
    isAuthenticated: boolean;
    initialBookings: MeetingBooking[];
    places: MeetingPlace[];
    inventoryItems: InventoryItem[];
}) {
    const [isAuth, setIsAuth] = useState(isAuthenticated);
    const [bookings, setBookings] = useState(initialBookings);
    const [password, setPassword] = useState("");
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const router = useRouter();
    const [isRefreshing, startRefresh] = useTransition();
    const [conflictError, setConflictError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedPlaceFilter, setSelectedPlaceFilter] = useState<string>("all");
    const [pendingSearch, setPendingSearch] = useState("");
    const [pendingPage, setPendingPage] = useState(1);
    const PENDING_PAGE_SIZE = 9;

    const handleRefresh = () => {
        startRefresh(async () => {
            const fresh = await getBookings();
            setBookings(fresh);
        });
    };

    const [bookingType, setBookingType] = useState<"room" | "inventory">("room");

    const [newBooking, setNewBooking] = useState({
        placeId: "",
        date: "",
        startTime: "",
        endTime: "",
        userName: "",
        userContact: "",
        purpose: "",
        // Room specific
        participants: "1",
        notes: "",
        isMultiDay: false,
        multiDayDetails: "",
        // Inventory specific
        dateTake: "",
        dateReturn: "",
        event: "",
        location: "",
        borrowedItems: [] as { itemId: string; quantity: number; name: string }[]
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
        const { isMultiDay, multiDayDetails, dateTake, dateReturn, event, location, participants, notes, borrowedItems, ...commonBooking } = newBooking;

        let payload: any = { type: bookingType };

        if (bookingType === "room") {
            payload = {
                ...payload,
                placeId: commonBooking.placeId,
                date: commonBooking.date,
                startTime: commonBooking.startTime,
                endTime: commonBooking.endTime,
                userName: commonBooking.userName,
                userContact: commonBooking.userContact,
                purpose: commonBooking.purpose + (participants ? `\nPeserta: ${participants}` : '') + (notes ? `\nCatatan: ${notes}` : '') + (isMultiDay ? `\nMulti-hari: ${multiDayDetails}` : ''),
                borrowedItems: borrowedItems.length > 0 ? borrowedItems : undefined,
                inventoryDateTake: borrowedItems.length > 0 ? dateTake || commonBooking.date : undefined,
                returnDate: borrowedItems.length > 0 ? dateReturn || commonBooking.date : undefined,
            };
        } else {
            payload = {
                ...payload,
                date: dateTake,
                inventoryDateTake: dateTake,
                returnDate: dateReturn,
                startTime: "00:00", // Inventory doesn't have exact time in requirements, using default
                endTime: "23:59",
                userName: commonBooking.userName,
                userContact: commonBooking.userContact,
                purpose: event,
                location: location,
                borrowedItems: borrowedItems
            };
        }

        const res = await submitBooking(payload);
        if (!res.success) {
            if (res.error?.includes("bertabrakan")) {
                setConflictError(res.error);
            } else {
                toast.error(res.error || "Gagal mengirim permohonan");
            }
            return;
        }

        setIsBookingOpen(false);
        setNewBooking({ placeId: "", date: "", startTime: "", endTime: "", userName: "", userContact: "", purpose: "", participants: "1", notes: "", isMultiDay: false, multiDayDetails: "", dateTake: "", dateReturn: "", event: "", location: "", borrowedItems: [] });
        toast.success("Permohonan berhasil dikirim, menunggu persetujuan admin.");
        handleRefresh(); // Refresh list to show the new pending booking
    };

    // Derived pending list (filtered + paginated)
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
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-500" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-500" />
                                        )}
                                    </Button>
                                </div>
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-2 border-b-2 border-slate-200">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-extrabold tracking-tight text-brand-dark sm:text-5xl">Peminjaman Ruang</h1>
                        <p className="text-muted-foreground text-lg">Cek ketersediaan jadwal dan ajukan peminjaman ruangan atau inventaris.</p>
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-3 w-full md:w-auto">
                        <Button variant="outline" className="bg-white text-blue-500 hover:bg-blue-50 hover:text-blue-600" onClick={handleRefresh} disabled={isRefreshing}>
                            <RefreshCw className={cn(isRefreshing && "animate-spin")} />
                        </Button>

                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <Button className="bg-blue-500 hover:bg-blue-600 text-white hover:text-white">
                                    Buat Peminjaman
                                    <ChevronDown className="size-4 ml-2 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="bg-white">
                                <DropdownMenuItem onClick={() => { setBookingType("room"); setIsBookingOpen(true); }} className="py-3 cursor-pointer">
                                    <Building2 className="size-4 mr-3 text-blue-600" />
                                    <span>Ruangan / Gedung</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setBookingType("inventory"); setIsBookingOpen(true); }} className="py-3 cursor-pointer">
                                    <Package className="size-4 mr-3 text-emerald-600" />
                                    <span>Inventaris / Barang</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>{bookingType === 'room' ? 'Form Peminjaman Gedung & Ruangan Gereja' : 'Form Peminjaman Inventaris/Barang'}</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleBook} className="space-y-4 py-2">
                                    <DialogBody>
                                        {bookingType === 'room' && (
                                            <>
                                                <div className="space-y-2">
                                                    <Label htmlFor="place">Ruangan</Label>
                                                    <Select value={newBooking.placeId} onValueChange={(val) => setNewBooking({ ...newBooking, placeId: val })} required>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Pilih Ruangan" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {places.map(p => (
                                                                <SelectItem key={p.id} value={p.id}>{p.name} {p.capacity ? `(Kap: ${p.capacity})` : ''}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="date">Tanggal Kegiatan</Label>
                                                        <DatePicker
                                                            value={newBooking.date}
                                                            onChange={val => setNewBooking({ ...newBooking, date: val })}
                                                            disablePast
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="timeSlot">Rentang Waktu</Label>
                                                        <Select
                                                            value={newBooking.startTime ? `${newBooking.startTime}-${newBooking.endTime}` : ''}
                                                            onValueChange={(val) => {
                                                                if (val) {
                                                                    const [start, end] = val.split('-');
                                                                    setNewBooking({ ...newBooking, startTime: start, endTime: end });
                                                                }
                                                            }}
                                                            required
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Pilih Waktu" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {Array.from({ length: 17 }).map((_, i) => {
                                                                    const hour = i + 6;
                                                                    const start = `${hour.toString().padStart(2, '0')}:00`;
                                                                    const end = `${(hour + 1).toString().padStart(2, '0')}:00`;
                                                                    return (
                                                                        <SelectItem key={start} value={`${start}-${end}`}>{start} - {end}</SelectItem>
                                                                    )
                                                                })}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {bookingType === 'inventory' && (
                                            <>
                                                <div className="space-y-2">
                                                    <Label htmlFor="event">Acara / Keperluan</Label>
                                                    <Input id="event" value={newBooking.event} onChange={e => setNewBooking({ ...newBooking, event: e.target.value })} required placeholder="Misa Mingguan, Rapat Panitia, dll" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="location">Tempat Dibawa</Label>
                                                    <Input id="location" value={newBooking.location} onChange={e => setNewBooking({ ...newBooking, location: e.target.value })} required placeholder="Gereja Brayut, Kapel, dll" />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="dateTake">Tanggal Pengambilan</Label>
                                                        <DatePicker value={newBooking.dateTake} onChange={val => setNewBooking({ ...newBooking, dateTake: val })} disablePast />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="dateReturn">Tanggal Pengembalian</Label>
                                                        <DatePicker value={newBooking.dateReturn} onChange={val => setNewBooking({ ...newBooking, dateReturn: val })} disablePast />
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        <div className="space-y-2">
                                            <Label htmlFor="userName">Nama Peminjam</Label>
                                            <Input id="userName" value={newBooking.userName} onChange={e => setNewBooking({ ...newBooking, userName: e.target.value })} required />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="userContact">Kontak (Whatsapp)</Label>
                                                <PhoneInput
                                                    id="userContact"
                                                    value={newBooking.userContact}
                                                    onChange={val => setNewBooking({ ...newBooking, userContact: val })}
                                                    required
                                                />
                                            </div>

                                            {bookingType === 'room' && (
                                                <div className="space-y-2">
                                                    <Label htmlFor="participants">Jumlah Peserta Terlibat</Label>
                                                    <Input
                                                        id="participants"
                                                        value={newBooking.participants}
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            if (val === "" || parseInt(val) >= 1) {
                                                                setNewBooking({ ...newBooking, participants: val });
                                                            }
                                                        }}
                                                        type="number"
                                                        min="1"
                                                        required
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {bookingType === 'room' && (
                                            <>
                                                <div className="space-y-2">
                                                    <Label htmlFor="purpose">Gambaran Singkat Acara</Label>
                                                    <Textarea id="purpose" value={newBooking.purpose} onChange={e => setNewBooking({ ...newBooking, purpose: e.target.value })} required />
                                                </div>
                                                <div className="space-y-2 mt-4 p-4 border rounded-md bg-slate-50">
                                                    <Label className="font-semibold text-brand-dark">Peminjaman Tambahan Inventaris (Opsional)</Label>
                                                    <p className="text-sm text-muted-foreground mb-4">Pilih barang yang ingin dipakai bersamaan dengan peminjaman ruangan ini.</p>

                                                    {newBooking.borrowedItems.map((item, index) => (
                                                        <div key={index} className="flex flex-col sm:flex-row gap-2 mb-2 items-end">
                                                            <div className="flex-1 space-y-1">
                                                                <Label className="text-xs">Barang</Label>
                                                                <Select value={item.itemId} onValueChange={(val) => {
                                                                    const newItems = [...newBooking.borrowedItems];
                                                                    const selectedItem = inventoryItems.find(i => i.id === val);
                                                                    newItems[index] = { ...item, itemId: val, name: selectedItem?.name || '' };
                                                                    setNewBooking({ ...newBooking, borrowedItems: newItems });
                                                                }}>
                                                                    <SelectTrigger className="bg-white">
                                                                        <SelectValue placeholder="Pilih Barang" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {inventoryItems.map(inv => (
                                                                            <SelectItem key={inv.id} value={inv.id}>{inv.name}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="w-24 space-y-1">
                                                                <Label className="text-xs">Jumlah</Label>
                                                                <Input className="bg-white" type="number" min="1" value={item.quantity} onChange={(e) => {
                                                                    const newItems = [...newBooking.borrowedItems];
                                                                    newItems[index].quantity = Math.max(1, parseInt(e.target.value) || 1);
                                                                    setNewBooking({ ...newBooking, borrowedItems: newItems });
                                                                }} />
                                                            </div>
                                                            <Button type="button" variant="destructive" size="icon" onClick={() => {
                                                                const newItems = newBooking.borrowedItems.filter((_, i) => i !== index);
                                                                setNewBooking({ ...newBooking, borrowedItems: newItems });
                                                            }}>
                                                                X
                                                            </Button>
                                                        </div>
                                                    ))}

                                                    <Button className="bg-blue-500 hover:bg-blue-600 text-white hover:text-white w-full mt-2" type="button" variant="outline" size="sm" onClick={() => {
                                                        setNewBooking({ ...newBooking, borrowedItems: [...newBooking.borrowedItems, { itemId: '', quantity: 1, name: '' }] })
                                                    }}>
                                                        + Tambah Barang
                                                    </Button>

                                                    {newBooking.borrowedItems.length > 0 && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
                                                            <div className="space-y-2">
                                                                <Label htmlFor="inventoryDateTake">Tgl Ambil Barang</Label>
                                                                <DatePicker value={newBooking.dateTake} onChange={val => setNewBooking({ ...newBooking, dateTake: val })} disablePast />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="inventoryDateReturn">Tgl Kembali Barang</Label>
                                                                <DatePicker value={newBooking.dateReturn} onChange={val => setNewBooking({ ...newBooking, dateReturn: val })} disablePast />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}

                                        {bookingType === 'inventory' && (
                                            <div className="space-y-2 mt-4 p-4 border rounded-md bg-slate-50">
                                                <Label className="font-semibold text-brand-dark">Daftar Barang (Wajib)</Label>

                                                {newBooking.borrowedItems.map((item, index) => (
                                                    <div key={index} className="flex flex-col sm:flex-row gap-2 mb-2 items-end">
                                                        <div className="flex-1 space-y-1">
                                                            <Label className="text-xs">Barang</Label>
                                                            <Select value={item.itemId} onValueChange={(val) => {
                                                                const newItems = [...newBooking.borrowedItems];
                                                                const selectedItem = inventoryItems.find(i => i.id === val);
                                                                newItems[index] = { ...item, itemId: val, name: selectedItem?.name || '' };
                                                                setNewBooking({ ...newBooking, borrowedItems: newItems });
                                                            }}>
                                                                <SelectTrigger className="bg-white">
                                                                    <SelectValue placeholder="Pilih Barang" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {inventoryItems.map(inv => (
                                                                        <SelectItem key={inv.id} value={inv.id}>{inv.name}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="w-24 space-y-1">
                                                            <Label className="text-xs">Jumlah</Label>
                                                            <Input className="bg-white" type="number" min="1" value={item.quantity} onChange={(e) => {
                                                                const newItems = [...newBooking.borrowedItems];
                                                                newItems[index].quantity = Math.max(1, parseInt(e.target.value) || 1);
                                                                setNewBooking({ ...newBooking, borrowedItems: newItems });
                                                            }} />
                                                        </div>
                                                        <Button className="bg-red-500 hover:bg-red-600 text-white hover:text-white" type="button" variant="destructive" size="icon" onClick={() => {
                                                            const newItems = newBooking.borrowedItems.filter((_, i) => i !== index);
                                                            setNewBooking({ ...newBooking, borrowedItems: newItems });
                                                        }}>
                                                            X
                                                        </Button>
                                                    </div>
                                                ))}

                                                <Button type="button" variant="outline" size="sm" className="bg-blue-500 hover:bg-blue-600 text-white hover:text-white w-full mt-2" onClick={() => {
                                                    setNewBooking({ ...newBooking, borrowedItems: [...newBooking.borrowedItems, { itemId: '', quantity: 1, name: '' }] })
                                                }}>
                                                    + Tambah Barang
                                                </Button>
                                            </div>
                                        )}
                                    </DialogBody>
                                    <Button type="submit" className="bg-brand-dark hover:bg-brand-dark/80 text-white hover:text-white w-full mt-4">Kirim Permohonan</Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <Tabs defaultValue="approved" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8 bg-slate-100/50 gap-4">
                        <TabsTrigger className="text-black transition-all bg-slate-200/50 hover:bg-slate-300/50 data-[state=active]:bg-brand-dark data-[state=active]:text-white shadow-sm" value="approved">Jadwal Disetujui</TabsTrigger>
                        <TabsTrigger className="text-black transition-all bg-slate-200/50 hover:bg-slate-300/50 data-[state=active]:bg-brand-dark data-[state=active]:text-white shadow-sm" value="pending">Permohonan Pending</TabsTrigger>
                    </TabsList>

                    <TabsContent value="approved">
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
                                                {places.map(p => (
                                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 overflow-x-auto">
                                <div className="min-w-[800px]">
                                    {/* Calendar Header */}
                                    <div className="grid grid-cols-7 border-b bg-slate-50">
                                        {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => (
                                            <div key={day} className="py-2 text-center text-sm font-semibold text-slate-500 border-r">{day}</div>
                                        ))}
                                    </div>
                                    {/* Calendar Grid */}
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
                                                        <div className="space-y-1 overflow-y-auto max-h-[100px] no-scrollbar">
                                                            {dayBookings.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((booking) => {
                                                                const place = places.find(p => p.id === booking.placeId);
                                                                const placeIndex = places.findIndex(p => p.id === booking.placeId);
                                                                const colorClass = selectedPlaceFilter !== 'all' ? PLACE_COLORS[0] : PLACE_COLORS[placeIndex % PLACE_COLORS.length] || PLACE_COLORS[0];

                                                                return (
                                                                    <div key={booking.id} className={`text-xs p-1.5 rounded border ${colorClass} flex flex-col gap-0.5 leading-tight group relative`} title={`${booking.startTime}-${booking.endTime}: ${booking.purpose} - ${booking.userName}`}>
                                                                        <div className="flex justify-between items-start gap-1">
                                                                            <span className="font-bold whitespace-nowrap">{booking.startTime}</span>
                                                                            {booking.isRescheduled && (
                                                                                <Badge variant="outline" className="text-[9px] px-1 py-0 h-auto leading-none border-foreground/20 shrink-0">Pindah</Badge>
                                                                            )}
                                                                        </div>
                                                                        <span className="font-medium truncate">{booking.purpose}</span>
                                                                        <span className="opacity-80 truncate text-[10px]">{selectedPlaceFilter === 'all' && place ? place.name : booking.userName}</span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            });
                                        })()}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="pending" className="space-y-4">
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
                    </TabsContent>
                </Tabs>
            </div>

            {/* Conflict Alert Modal */}
            <AlertDialog open={!!conflictError} onOpenChange={() => setConflictError(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Jadwal Sudah Terpakai</AlertDialogTitle>
                        <AlertDialogDescription>
                            {conflictError}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setConflictError(null)}>Mengerti</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
