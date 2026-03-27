"use client";

import { useState, useTransition } from "react";
import { MeetingBooking, MeetingPlace, InventoryItem } from "@/features/booking/types";
import { updateBookingStatus, deleteBooking, submitBooking, updateBooking, getBookings } from "@/features/booking/actions/bookings";
import { saveMeetingPlace, deleteMeetingPlace, getActiveMeetingPlaces } from "@/features/booking/actions/places";
import { saveInventoryItem, deleteInventoryItem, getActiveInventoryItems } from "@/features/booking/actions/inventory";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, CheckCircle, XCircle, Clock, Pencil, RefreshCw, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogBody, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PasswordInputWithValidation } from "@/components/ui/password-input-with-validation";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { TimePicker } from "@/components/ui/time-picker";
import { DatePicker } from "@/components/ui/date-picker";
import { PhoneInput } from "@/components/ui/phone-input";
import { cn } from "@/lib/utils";

import { setMeetingRoomPassword } from "@/features/booking/actions/auth";

export default function MeetingRoomsClient({
  initialBookings,
  initialPlaces,
  initialInventory = [],
  isSuperAdmin,
}: {
  initialBookings: MeetingBooking[];
  initialPlaces: MeetingPlace[];
  initialInventory?: InventoryItem[];
  isSuperAdmin?: boolean;
}) {
  const [bookings, setBookings] = useState(initialBookings);
  const [places, setPlaces] = useState(initialPlaces);
  const [inventory, setInventory] = useState(initialInventory);
  const router = useRouter();
  const [isRefreshingBookings, startRefreshBookings] = useTransition();
  const [isRefreshingPlaces, startRefreshPlaces] = useTransition();
  const [isRefreshingInventory, startRefreshInventory] = useTransition();

  const handleRefreshBookings = () => {
    startRefreshBookings(async () => {
      const fresh = await getBookings();
      setBookings(fresh);
    });
  };

  const handleRefreshPlaces = () => {
    startRefreshPlaces(async () => {
      const fresh = await getActiveMeetingPlaces();
      setPlaces(fresh as MeetingPlace[]);
    });
  };

  const handleRefreshInventory = () => {
    startRefreshInventory(async () => {
      const fresh = await getActiveInventoryItems();
      setInventory(fresh as InventoryItem[]);
    });
  };

  // States for Places
  const [isAddPlaceOpen, setIsAddPlaceOpen] = useState(false);
  const [newPlace, setNewPlace] = useState<{ id?: string, name: string, capacity: number, description: string, isActive: boolean }>({ name: "", capacity: 10, description: "", isActive: true });

  // States for Inventory
  const [isAddInventoryOpen, setIsAddInventoryOpen] = useState(false);
  const [newInventoryItem, setNewInventoryItem] = useState<{ id?: string, name: string, totalQuantity: number, description: string, isActive: boolean }>({ name: "", totalQuantity: 1, description: "", isActive: true });

  // States for Bookings
  const [isAddBookingOpen, setIsAddBookingOpen] = useState(false);
  const [bookingType, setBookingType] = useState<"room" | "inventory">("room");
  const [newBooking, setNewBooking] = useState({
    placeId: "",
    date: "",
    startTime: "",
    endTime: "",
    userName: "",
    userContact: "",
    purpose: "",
    participants: "1",
    notes: "",
    isMultiDay: false,
    multiDayDetails: "",
    dateTake: "",
    dateReturn: "",
    event: "",
    location: "",
    borrowedItems: [] as { itemId: string; quantity: number; name: string }[],
    submissionSource: "manual" as "online" | "manual"
  });

  // States for Settings
  const [newPassword, setNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Filter / Search / Pagination states — Bookings
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");
  const [bookingPage, setBookingPage] = useState(1);
  const BOOKING_PAGE_SIZE = 9;

  // Filter / Search / Pagination states — Places
  const [placeSearch, setPlaceSearch] = useState("");
  const [placePage, setPlacePage] = useState(1);
  const PLACE_PAGE_SIZE = 9;

  // Filter / Search / Pagination states — Inventory
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryPage, setInventoryPage] = useState(1);
  const INV_PAGE_SIZE = 9;

  // States for Editing
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);

  // States for Confirm Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: "default" | "destructive";
    action: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    variant: "default",
    action: () => { },
  });

  // Conflict warning modal
  const [conflictError, setConflictError] = useState<string | null>(null);

  const openConfirm = (title: string, message: string, variant: "default" | "destructive", action: () => void | Promise<void>) => {
    setConfirmModal({ isOpen: true, title, message, variant, action });
  };

  const getPlaceName = (id?: string) => places.find(p => p.id === id)?.name || "Ruangan / Barang Tidak Diketahui";

  const handleApprove = (id: string) => {
    openConfirm("Setujui Peminjaman", "Apakah Anda yakin ingin menyetujui peminjaman ini?", "default", async () => {
      const res = await updateBookingStatus(id, "confirmed");
      if (res.success) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "confirmed" } : b));
        toast.success("Peminjaman disetujui!");
      } else {
        toast.error("Gagal menyetujui peminjaman");
      }
    });
  };

  const handleReject = (id: string) => {
    openConfirm("Tolak Peminjaman", "Apakah Anda yakin ingin menolak peminjaman ini?", "destructive", async () => {
      const res = await updateBookingStatus(id, "rejected");
      if (res.success) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "rejected" } : b));
        toast.success("Peminjaman ditolak");
      } else {
        toast.error("Gagal menolak peminjaman");
      }
    });
  };

  const handleDeleteBooking = (id: string) => {
    openConfirm("Hapus Peminjaman", "Apakah Anda yakin ingin menghapus peminjaman ini? Tindakan ini tidak dapat dibatalkan.", "destructive", async () => {
      const res = await deleteBooking(id);
      if (res.success) {
        setBookings(prev => prev.filter(b => b.id !== id));
        toast.success("Peminjaman dihapus");
      } else {
        toast.error("Gagal menghapus peminjaman");
      }
    });
  };

  const handleSavePlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlace.name) return toast.error("Nama ruangan harus diisi");

    toast.promise(saveMeetingPlace(newPlace), {
      loading: "Menyimpan ruangan...",
      success: (res) => {
        if (res.success && res.data) {
          setPlaces(prev => [...prev, { ...newPlace, id: res.data, createdAt: Date.now(), updatedAt: Date.now() } as MeetingPlace]);
        }
        setIsAddPlaceOpen(false);
        setNewPlace({ name: "", capacity: 10, description: "", isActive: true });
        return "Ruangan tersimpan!";
      },
      error: "Gagal menyimpan ruangan",
    });
  };

  const handleSaveInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInventoryItem.name) return toast.error("Nama barang harus diisi");

    toast.promise(saveInventoryItem(newInventoryItem), {
      loading: "Menyimpan barang...",
      success: (res) => {
        if (res.success && res.data) {
          setInventory(prev => [...prev, { ...newInventoryItem, id: res.data, createdAt: Date.now(), updatedAt: Date.now() } as InventoryItem]);
        }
        setIsAddInventoryOpen(false);
        setNewInventoryItem({ name: "", totalQuantity: 1, description: "", isActive: true });
        return "Barang tersimpan!";
      },
      error: "Gagal menyimpan barang",
    });
  };

  const handleSaveBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isMultiDay, multiDayDetails, dateTake, dateReturn, event, location, participants, notes, borrowedItems, submissionSource, ...commonBooking } = newBooking;

    let payload: any = { type: bookingType, submissionSource: submissionSource, isAdminDirectCreate: true };

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
        startTime: "00:00",
        endTime: "23:59",
        userName: commonBooking.userName,
        userContact: commonBooking.userContact,
        purpose: event,
        location: location,
        borrowedItems: borrowedItems
      };
    }

    if (editingBookingId) {
      const res = await updateBooking(editingBookingId, payload);
      if (!res.success) {
        if (res.error?.includes("bertabrakan")) {
          setConflictError(res.error);
        } else {
          toast.error(res.error || "Gagal memperbarui peminjaman");
        }
        return;
      }
      setBookings(prev => prev.map(b => b.id === editingBookingId ? { ...b, ...payload, updatedAt: Date.now() } as MeetingBooking : b));
      setIsAddBookingOpen(false);
      setEditingBookingId(null);
      setNewBooking({ placeId: "", date: "", startTime: "", endTime: "", userName: "", userContact: "", purpose: "", participants: "1", notes: "", isMultiDay: false, multiDayDetails: "", dateTake: "", dateReturn: "", event: "", location: "", borrowedItems: [], submissionSource: "manual" });
      toast.success("Peminjaman diperbarui!");
    } else {
      const res = await submitBooking(payload);
      if (!res.success) {
        if (res.error?.includes("bertabrakan")) {
          setConflictError(res.error);
        } else {
          toast.error(res.error || "Gagal membuat peminjaman");
        }
        return;
      }
      if (res.success && res.data) {
        setBookings(prev => [{ ...payload, id: res.data, status: "confirmed", createdAt: Date.now(), updatedAt: Date.now() } as MeetingBooking, ...prev]);
      }
      setIsAddBookingOpen(false);
      setNewBooking({ placeId: "", date: "", startTime: "", endTime: "", userName: "", userContact: "", purpose: "", participants: "1", notes: "", isMultiDay: false, multiDayDetails: "", dateTake: "", dateReturn: "", event: "", location: "", borrowedItems: [], submissionSource: "manual" });
      toast.success("Peminjaman dibuat!");
    }
  };

  const openEditBooking = (booking: MeetingBooking) => {
    setEditingBookingId(booking.id ?? null);
    setBookingType(booking.type === 'inventory' ? 'inventory' : 'room');
    setNewBooking({
      placeId: booking.placeId ?? "",
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      userName: booking.userName,
      userContact: booking.userContact,
      purpose: booking.type === 'inventory' ? '' : booking.purpose,
      participants: "1",
      notes: "",
      isMultiDay: false,
      multiDayDetails: "",
      dateTake: booking.type === 'inventory' ? booking.date : (booking.inventoryDateTake || ""),
      dateReturn: booking.returnDate || "",
      event: booking.type === 'inventory' ? booking.purpose : "",
      location: booking.location || "",
      borrowedItems: booking.borrowedItems || [],
      submissionSource: booking.submissionSource || "online"
    });
    setIsAddBookingOpen(true);
  };

  const handleDeletePlace = (id: string) => {
    openConfirm("Hapus Ruangan", "Apakah Anda yakin? Ini dapat mempengaruhi peminjaman yang ada untuk ruangan ini.", "destructive", async () => {
      const res = await deleteMeetingPlace(id);
      if (res.success) {
        setPlaces(prev => prev.filter(p => p.id !== id));
        toast.success("Ruangan dihapus");
      } else {
        toast.error("Gagal menghapus ruangan");
      }
    });
  };

  const handleDeleteInventory = (id: string) => {
    openConfirm("Hapus Barang", "Apakah Anda yakin? Ini dapat mempengaruhi data peminjaman inventaris yang lalu.", "destructive", async () => {
      const res = await deleteInventoryItem(id);
      if (res.success) {
        setInventory(prev => prev.filter(p => p.id !== id));
        toast.success("Barang dihapus");
      } else {
        toast.error("Gagal menghapus barang");
      }
    });
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) return toast.error("Password minimal 8 karakter");

    setIsUpdatingPassword(true);
    try {
      const res = await setMeetingRoomPassword(newPassword);
      if (res.success) {
        toast.success("Password diperbarui");
        setNewPassword("");
      } else {
        toast.error(res.error || "Gagal memperbarui password");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan tak terduga");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Derived filtered + paginated lists
  const filteredBookings = bookings
    .filter(b => bookingStatusFilter === "all" || b.status === bookingStatusFilter)
    .filter(b => {
      const q = bookingSearch.toLowerCase();
      return !q || b.userName.toLowerCase().includes(q) || b.userContact.toLowerCase().includes(q) || b.purpose.toLowerCase().includes(q);
    });
  const bookingPageCount = Math.max(1, Math.ceil(filteredBookings.length / BOOKING_PAGE_SIZE));
  const pagedBookings = filteredBookings.slice((bookingPage - 1) * BOOKING_PAGE_SIZE, bookingPage * BOOKING_PAGE_SIZE);

  const filteredPlaces = places.filter(p => {
    const q = placeSearch.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q);
  });
  const placePageCount = Math.max(1, Math.ceil(filteredPlaces.length / PLACE_PAGE_SIZE));
  const pagedPlaces = filteredPlaces.slice((placePage - 1) * PLACE_PAGE_SIZE, placePage * PLACE_PAGE_SIZE);

  const filteredInventory = inventory.filter(item => {
    const q = inventorySearch.toLowerCase();
    return !q || item.name.toLowerCase().includes(q) || (item.description || "").toLowerCase().includes(q);
  });
  const inventoryPageCount = Math.max(1, Math.ceil(filteredInventory.length / INV_PAGE_SIZE));
  const pagedInventory = filteredInventory.slice((inventoryPage - 1) * INV_PAGE_SIZE, inventoryPage * INV_PAGE_SIZE);

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Booking Ruang</h1>
        <p className="text-muted-foreground">Konfirmasi booking dan manajemen ruang pertemuan.</p>
      </div>

      <Tabs defaultValue="bookings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="bookings">Peminjaman</TabsTrigger>
          <TabsTrigger value="places">Ruang Pertemuan</TabsTrigger>
          <TabsTrigger value="inventory">Inventaris / Barang</TabsTrigger>
          {isSuperAdmin && <TabsTrigger value="settings">Pengaturan</TabsTrigger>}
        </TabsList>

        <TabsContent value="bookings" className="space-y-4">
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Daftar Peminjaman</h2>
              <div className="flex space-x-2">
                <Button variant="outline" className="bg-white text-blue-500 hover:bg-blue-50 hover:text-blue-600" onClick={handleRefreshBookings} disabled={isRefreshingBookings}>
                  <RefreshCw className={`w-4 h-4 ${isRefreshingBookings ? "animate-spin" : ""}`} />
                </Button>
                <Dialog open={isAddBookingOpen} onOpenChange={(open) => {
                  setIsAddBookingOpen(open);
                  if (!open) {
                    setEditingBookingId(null);
                    setNewBooking({ placeId: "", date: "", startTime: "", endTime: "", userName: "", userContact: "", purpose: "", participants: "", notes: "", isMultiDay: false, multiDayDetails: "", dateTake: "", dateReturn: "", event: "", location: "", borrowedItems: [], submissionSource: "manual" });
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Peminjaman
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>{editingBookingId ? "Edit Peminjaman" : "Tambah Peminjaman Baru"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSaveBooking} className="space-y-4 py-2">
                      <DialogBody className="space-y-4">
                        <div className="flex gap-2 justify-center mb-4">
                          <Button type="button" variant={bookingType === "room" ? "default" : "outline"} onClick={() => setBookingType("room")}>Ruangan</Button>
                          <Button type="button" variant={bookingType === "inventory" ? "default" : "outline"} onClick={() => setBookingType("inventory")}>Inventaris</Button>
                        </div>

                        <div className="space-y-2 border p-3 rounded-md bg-slate-50">
                          <Label>Sumber Input (Khusus Admin)</Label>
                          <Select value={newBooking.submissionSource} onValueChange={(val: "online" | "manual") => setNewBooking({ ...newBooking, submissionSource: val })}>
                            <SelectTrigger className="bg-white"><SelectValue placeholder="Pilih Sumber Form" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="online">Form Online </SelectItem>
                              <SelectItem value="manual">Form Cetak (Manual)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

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
                                  disablePast={false}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-2">
                                  <Label htmlFor="startTime">Waktu Mulai</Label>
                                  <Select
                                    value={newBooking.startTime}
                                    onValueChange={(val) => {
                                      let startHour = parseInt(val.split(':')[0]);
                                      let endHour = newBooking.endTime ? parseInt(newBooking.endTime.split(':')[0]) : 0;
                                      
                                      let newEnd = newBooking.endTime;
                                      if (!newBooking.endTime || endHour <= startHour) {
                                        newEnd = `${(startHour + 1).toString().padStart(2, '0')}:00`;
                                      }
                                      setNewBooking({ ...newBooking, startTime: val, endTime: newEnd });
                                    }}
                                    required
                                  >
                                    <SelectTrigger className="bg-white">
                                      <SelectValue placeholder="Mulai" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                      {Array.from({ length: 17 }).map((_, i) => {
                                        const hour = i + 6;
                                        const time = `${hour.toString().padStart(2, '0')}:00`;
                                        return <SelectItem key={time} value={time}>{time}</SelectItem>
                                      })}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="endTime">Waktu Selesai</Label>
                                  <Select
                                    value={newBooking.endTime}
                                    onValueChange={(val) => setNewBooking({ ...newBooking, endTime: val })}
                                    required
                                    disabled={!newBooking.startTime}
                                  >
                                    <SelectTrigger className="bg-white">
                                      <SelectValue placeholder="Selesai" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                      {Array.from({ length: 17 }).map((_, i) => {
                                        const hour = i + 7;
                                        const startHour = newBooking.startTime ? parseInt(newBooking.startTime.split(':')[0]) : 6;
                                        if (hour <= startHour) return null;
                                        
                                        const time = `${hour.toString().padStart(2, '0')}:00`;
                                        return <SelectItem key={time} value={time}>{time}</SelectItem>
                                      })}
                                    </SelectContent>
                                  </Select>
                                </div>
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
                                <DatePicker value={newBooking.dateTake} onChange={val => setNewBooking({ ...newBooking, dateTake: val })} disablePast={false} />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="dateReturn">Tanggal Pengembalian</Label>
                                <DatePicker value={newBooking.dateReturn} onChange={val => setNewBooking({ ...newBooking, dateReturn: val })} disablePast={false} />
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
                              <Textarea id="purpose" value={newBooking.purpose} onChange={e => setNewBooking({ ...newBooking, purpose: e.target.value })} required={bookingType === "room"} />
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
                                      const selectedItem = inventory.find(i => i.id === val);
                                      newItems[index] = { ...item, itemId: val, name: selectedItem?.name || '' };
                                      setNewBooking({ ...newBooking, borrowedItems: newItems });
                                    }}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Pilih Barang" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {inventory.map(inv => (
                                          <SelectItem key={inv.id} value={inv.id}>{inv.name}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="w-24 space-y-1">
                                    <Label className="text-xs">Jumlah</Label>
                                    <Input type="number" min="1" value={item.quantity} onChange={(e) => {
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

                              <Button type="button" variant="outline" size="sm" className="bg-blue-500 hover:bg-blue-600 text-white hover:text-white w-full mt-2" onClick={() => {
                                setNewBooking({ ...newBooking, borrowedItems: [...newBooking.borrowedItems, { itemId: '', quantity: 1, name: '' }] })
                              }}>
                                + Tambah Barang
                              </Button>

                              {newBooking.borrowedItems.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
                                  <div className="space-y-2">
                                    <Label htmlFor="inventoryDateTake">Tgl Ambil Barang (Opsional)</Label>
                                    <DatePicker value={newBooking.dateTake} onChange={val => setNewBooking({ ...newBooking, dateTake: val })} disablePast={false} />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="inventoryDateReturn">Tgl Kembali Barang (Opsional)</Label>
                                    <DatePicker value={newBooking.dateReturn} onChange={val => setNewBooking({ ...newBooking, dateReturn: val })} disablePast={false} />
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
                                    const selectedItem = inventory.find(i => i.id === val);
                                    newItems[index] = { ...item, itemId: val, name: selectedItem?.name || '' };
                                    setNewBooking({ ...newBooking, borrowedItems: newItems });
                                  }}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Pilih Barang" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {inventory.map(inv => (
                                        <SelectItem key={inv.id} value={inv.id}>{inv.name}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="w-24 space-y-1">
                                  <Label className="text-xs">Jumlah</Label>
                                  <Input type="number" min="1" value={item.quantity} onChange={(e) => {
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

                            <Button type="button" variant="outline" size="sm" className="bg-blue-500 hover:bg-blue-600 text-white hover:text-white w-full mt-2" onClick={() => {
                              setNewBooking({ ...newBooking, borrowedItems: [...newBooking.borrowedItems, { itemId: '', quantity: 1, name: '' }] })
                            }}>
                              + Tambah Barang
                            </Button>
                          </div>
                        )}
                      </DialogBody>
                      <Button type="submit" className="w-full mt-4">{editingBookingId ? "Update Peminjaman" : "Simpan Peminjaman"}</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari peminjam, keperluan..."
                  value={bookingSearch}
                  onChange={e => { setBookingSearch(e.target.value); setBookingPage(1); }}
                  className="pl-9 bg-white"
                />
              </div>
              <Select value={bookingStatusFilter} onValueChange={v => { setBookingStatusFilter(v); setBookingPage(1); }}>
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Menunggu</SelectItem>
                  <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
                  <SelectItem value="rejected">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {isRefreshingBookings ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}><CardHeader><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2 mt-1" /></CardHeader><CardContent className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /></CardContent></Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pagedBookings.length === 0 ? (
                <p className="text-muted-foreground col-span-full">{bookingSearch || bookingStatusFilter !== "all" ? "Tidak ada hasil yang cocok." : "Tidak ada peminjaman ditemukan."}</p>
              ) : (
                pagedBookings.map((booking) => (
                  <Card key={booking.id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1 mr-4">
                          <CardTitle>{booking.type === 'inventory' ? 'Peminjaman Barang' : getPlaceName(booking.placeId)}</CardTitle>
                          {booking.type === 'inventory' ? (
                            <CardDescription>
                              Tgl Ambil: {booking.date} · Tgl Kembali: {booking.returnDate || '-'}
                            </CardDescription>
                          ) : (
                            <CardDescription>{booking.date} · {booking.startTime} - {booking.endTime}</CardDescription>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={cn(
                            "capitalize font-medium shadow-sm border",
                            booking.status === "pending" && "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-50",
                            booking.status === "confirmed" && "bg-green-50 text-green-600 border-green-200 hover:bg-green-50",
                            booking.status === "rejected" && "bg-red-50 text-red-600 border-red-200 hover:bg-red-50"
                          )}>
                            {booking.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                            {booking.status === "confirmed" && <CheckCircle className="w-3 h-3 mr-1" />}
                            {booking.status === "rejected" && <XCircle className="w-3 h-3 mr-1" />}
                            {booking.status === "pending" ? "Menunggu" : booking.status === "confirmed" ? "Dikonfirmasi" : "Ditolak"}
                          </Badge>
                          {booking.isRescheduled && (
                            <Badge variant="secondary" className="border-slate-500 text-slate-600 bg-slate-50 shadow-sm border whitespace-nowrap">
                              Dipindah Jadwal
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs text-muted-foreground bg-slate-50">
                          {booking.submissionSource === 'manual' ? "Form Cetak (Manual)" : "Form Online"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-3 text-sm">
                      <div>
                        <span className="font-semibold text-xs text-muted-foreground uppercase">Peminjam</span>
                        <p className="font-medium">{booking.userName}</p>
                        <p className="text-muted-foreground text-xs">{booking.userContact}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-xs text-muted-foreground uppercase">Keperluan</span>
                        <p>{booking.purpose}</p>
                      </div>
                      {booking.borrowedItems && booking.borrowedItems.length > 0 && (
                        <div className="pt-2 border-t">
                          <span className="font-semibold text-xs text-muted-foreground uppercase">Barang Dipinjam</span>
                          <ul className="list-disc list-inside mt-1 font-medium text-slate-700">
                            {booking.borrowedItems.map((item, idx) => (
                              <li key={idx}>({item.quantity}x) {item.name}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="bg-slate-50 border-t justify-end gap-2 p-3">
                      {(booking.status === "pending" || booking.status === "rejected") && (
                        <Button variant="outline" size="sm" onClick={() => handleApprove(booking.id!)} className="text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700 ">
                          <CheckCircle className="w-4 h-4" />
                          Setujui
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => openEditBooking(booking)} className="text-blue-600 border-blue-200 hover:bg-blue-100 hover:text-blue-700">
                        <Pencil className="w-4 h-4" />
                        Ubah
                      </Button>
                      {(booking.status === "pending" || booking.status === "confirmed") && (
                        <Button variant="outline" size="sm" onClick={() => handleReject(booking.id!)} className="text-red-500 border-red-200 hover:bg-red-100 hover:text-red-700">
                          <XCircle className="w-4 h-4" />
                          Tolak
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleDeleteBooking(booking.id!)} className="text-red-500 border-red-200 hover:bg-red-100 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                        Hapus
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          )}
          {!isRefreshingBookings && bookingPageCount > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button variant="outline" size="icon" disabled={bookingPage <= 1} onClick={() => setBookingPage(p => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">Halaman {bookingPage} / {bookingPageCount}</span>
              <Button variant="outline" size="icon" disabled={bookingPage >= bookingPageCount} onClick={() => setBookingPage(p => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="places" className="space-y-4">
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Kelola Ruangan</h2>
              <div className="flex space-x-2">
                <Button variant="outline" className="bg-white text-blue-500 hover:bg-blue-50 hover:text-blue-600" onClick={handleRefreshPlaces} disabled={isRefreshingPlaces}>
                  <RefreshCw className={`w-4 h-4 ${isRefreshingPlaces ? "animate-spin" : ""}`} />
                </Button>
                <Dialog open={isAddPlaceOpen} onOpenChange={(open) => {
                  setIsAddPlaceOpen(open);
                  if (!open) setNewPlace({ name: "", capacity: 10, description: "", isActive: true });
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Ruangan
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{newPlace.id ? "Edit Ruangan" : "Tambah Ruang Pertemuan"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSavePlace} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nama Ruangan</Label>
                        <Input id="name" value={newPlace.name} onChange={e => setNewPlace({ ...newPlace, name: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="capacity">Kapasitas (Orang)</Label>
                        <Input id="capacity" type="number" value={newPlace.capacity} onChange={e => setNewPlace({ ...newPlace, capacity: parseInt(e.target.value) || 0 })} min={1} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Deskripsi (Opsional)</Label>
                        <Textarea id="description" value={newPlace.description} onChange={e => setNewPlace({ ...newPlace, description: e.target.value })} />
                      </div>
                      <Button type="submit" className="w-full">{newPlace.id ? "Simpan Perubahan" : "Simpan Ruangan"}</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama atau deskripsi ruangan..."
                value={placeSearch}
                onChange={e => { setPlaceSearch(e.target.value); setPlacePage(1); }}
                className="pl-9 bg-white"
              />
            </div>
          </div>

          {isRefreshingPlaces ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}><CardHeader><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2 mt-1" /></CardHeader><CardContent><Skeleton className="h-4 w-full" /></CardContent></Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pagedPlaces.length === 0 ? (
                <p className="text-muted-foreground">{placeSearch ? "Tidak ada hasil yang cocok." : "Belum ada ruangan ditambahkan."}</p>
              ) : (
                pagedPlaces.map(place => (
                  <Card key={place.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{place.name}</CardTitle>
                          <CardDescription>Kapasitas: {place.capacity} orang</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{place.description || "Tidak ada deskripsi."}</p>
                    </CardContent>
                    <CardFooter className="bg-slate-50 border-t justify-end gap-2 p-3">
                      <Button variant="outline" size="sm" onClick={() => {
                        setNewPlace({ id: place.id, name: place.name, capacity: place.capacity, description: place.description, isActive: place.isActive });
                        setIsAddPlaceOpen(true);
                      }} className="text-blue-600 border-blue-200 hover:bg-blue-100 hover:text-blue-700">
                        <Pencil className="w-4 h-4" />
                        Ubah
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeletePlace(place.id!)} className="text-red-500 border-red-200 hover:bg-red-100 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                        Hapus
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          )}
          {!isRefreshingPlaces && placePageCount > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button variant="outline" size="icon" disabled={placePage <= 1} onClick={() => setPlacePage(p => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">Halaman {placePage} / {placePageCount}</span>
              <Button variant="outline" size="icon" disabled={placePage >= placePageCount} onClick={() => setPlacePage(p => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Kelola Inventaris</h2>
              <div className="flex space-x-2">
                <Button variant="outline" className="bg-white text-blue-500 hover:bg-blue-50 hover:text-blue-600" onClick={handleRefreshInventory} disabled={isRefreshingInventory}>
                  <RefreshCw className={`w-4 h-4 ${isRefreshingInventory ? "animate-spin" : ""}`} />
                </Button>
                <Dialog open={isAddInventoryOpen} onOpenChange={(open) => {
                  setIsAddInventoryOpen(open);
                  if (!open) setNewInventoryItem({ name: "", totalQuantity: 1, description: "", isActive: true });
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white hover:text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Barang
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{newInventoryItem.id ? "Edit Barang Inventaris" : "Tambah Barang Inventaris"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSaveInventory} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="inv-name">Nama Barang</Label>
                        <Input id="inv-name" value={newInventoryItem.name} onChange={e => setNewInventoryItem({ ...newInventoryItem, name: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="inv-qty">Jumlah (Stok Total)</Label>
                        <Input id="inv-qty" type="number" value={newInventoryItem.totalQuantity} onChange={e => setNewInventoryItem({ ...newInventoryItem, totalQuantity: parseInt(e.target.value) || 0 })} min={1} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="inv-desc">Deskripsi (Opsional)</Label>
                        <Textarea id="inv-desc" value={newInventoryItem.description} onChange={e => setNewInventoryItem({ ...newInventoryItem, description: e.target.value })} />
                      </div>
                      <Button type="submit" className="w-full">{newInventoryItem.id ? "Simpan Perubahan" : "Simpan Barang"}</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama atau deskripsi barang..."
                value={inventorySearch}
                onChange={e => { setInventorySearch(e.target.value); setInventoryPage(1); }}
                className="pl-9 bg-white"
              />
            </div>
          </div>
          {isRefreshingInventory ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}><CardHeader><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2 mt-1" /></CardHeader><CardContent><Skeleton className="h-4 w-full" /></CardContent></Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pagedInventory.length === 0 ? (
                <p className="text-muted-foreground w-full col-span-full">{inventorySearch ? "Tidak ada hasil yang cocok." : "Belum ada barang ditambahkan."}</p>
              ) : (
                pagedInventory.map(item => (
                  <Card key={item.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{item.name}</CardTitle>
                          <CardDescription>Stok: <span className="font-bold text-foreground">{item.totalQuantity}</span></CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{item.description || "Tidak ada deskripsi."}</p>
                    </CardContent>
                    <CardFooter className="bg-slate-50 border-t justify-end gap-2 p-3">
                      <Button variant="outline" size="sm" onClick={() => {
                        setNewInventoryItem({ id: item.id, name: item.name, totalQuantity: item.totalQuantity, description: item.description, isActive: item.isActive });
                        setIsAddInventoryOpen(true);
                      }} className="text-blue-600 border-blue-200 hover:bg-blue-100 hover:text-blue-700">
                        <Pencil className="w-4 h-4" />
                        Ubah
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteInventory(item.id!)} className="text-red-500 border-red-200 hover:bg-red-100 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                        Hapus
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          )}
          {!isRefreshingInventory && inventoryPageCount > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button variant="outline" size="icon" disabled={inventoryPage <= 1} onClick={() => setInventoryPage(p => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">Halaman {inventoryPage} / {inventoryPageCount}</span>
              <Button variant="outline" size="icon" disabled={inventoryPage >= inventoryPageCount} onClick={() => setInventoryPage(p => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </TabsContent>

        {isSuperAdmin && (
          <TabsContent value="settings" className="space-y-4">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle>Pengaturan Keamanan</CardTitle>
                <CardDescription>Update password bersama untuk mengakses halaman booking publik.</CardDescription>
              </CardHeader>
              <form onSubmit={handleUpdatePassword}>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <PasswordInputWithValidation
                      value={newPassword}
                      onChange={setNewPassword}
                      placeholder="Masukkan password baru"
                      minLength={8}
                    />
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-50 border-t p-4">
                  <Button type="submit" disabled={isUpdatingPassword}>
                    {isUpdatingPassword ? "Memperbarui..." : "Update Password"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        )}
      </Tabs>
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        onConfirm={async () => {
          await confirmModal.action();
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }}
        confirmText="Ya, Lanjutkan"
      />

      {/* Booking conflict alert */}
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
