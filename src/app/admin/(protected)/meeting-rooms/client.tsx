"use client";

import { useState, useTransition } from "react";
import { MeetingBooking, MeetingPlace } from "@/features/booking/types";
import { updateBookingStatus, deleteBooking, submitBooking, updateBooking, getBookings } from "@/features/booking/actions/bookings";
import { saveMeetingPlace, deleteMeetingPlace } from "@/features/booking/actions/places";
import { getActiveMeetingPlaces } from "@/features/booking/actions/places";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, CheckCircle, XCircle, Clock, Pencil, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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

import { setMeetingRoomPassword } from "@/features/booking/actions/auth";

export default function MeetingRoomsClient({
  initialBookings,
  initialPlaces,
  isSuperAdmin,
}: {
  initialBookings: MeetingBooking[];
  initialPlaces: MeetingPlace[];
  isSuperAdmin?: boolean;
}) {
  const [bookings, setBookings] = useState(initialBookings);
  const [places, setPlaces] = useState(initialPlaces);
  const router = useRouter();
  const [isRefreshingBookings, startRefreshBookings] = useTransition();
  const [isRefreshingPlaces, startRefreshPlaces] = useTransition();

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

  // States for Places
  const [isAddPlaceOpen, setIsAddPlaceOpen] = useState(false);
  const [newPlace, setNewPlace] = useState({ name: "", capacity: 10, description: "", isActive: true });

  // States for Bookings
  const [isAddBookingOpen, setIsAddBookingOpen] = useState(false);
  const [newBooking, setNewBooking] = useState({
    placeId: "",
    date: "",
    startTime: "",
    endTime: "",
    userName: "",
    userContact: "",
    purpose: ""
  });

  // States for Settings
  const [newPassword, setNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const getPlaceName = (id: string) => places.find(p => p.id === id)?.name || "Ruangan Tidak Diketahui";

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

  const handleSaveBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBooking.placeId || !newBooking.date || !newBooking.startTime || !newBooking.endTime) {
      return toast.error("Semua field harus diisi");
    }

    if (editingBookingId) {
      const res = await updateBooking(editingBookingId, newBooking as any);
      if (!res.success) {
        if (res.error?.includes("bertabrakan")) {
          setConflictError(res.error);
        } else {
          toast.error(res.error || "Gagal memperbarui peminjaman");
        }
        return;
      }
      setBookings(prev => prev.map(b => b.id === editingBookingId ? { ...b, ...newBooking, updatedAt: Date.now() } as MeetingBooking : b));
      setIsAddBookingOpen(false);
      setEditingBookingId(null);
      setNewBooking({ placeId: "", date: "", startTime: "", endTime: "", userName: "", userContact: "", purpose: "" });
      toast.success("Peminjaman diperbarui!");
    } else {
      const res = await submitBooking({ ...newBooking, isAdminDirectCreate: true } as any);
      if (!res.success) {
        if (res.error?.includes("bertabrakan")) {
          setConflictError(res.error);
        } else {
          toast.error(res.error || "Gagal membuat peminjaman");
        }
        return;
      }
      if (res.success && res.data) {
        setBookings(prev => [{ ...newBooking, id: res.data, status: "confirmed", createdAt: Date.now(), updatedAt: Date.now() } as MeetingBooking, ...prev]);
      }
      setIsAddBookingOpen(false);
      setNewBooking({ placeId: "", date: "", startTime: "", endTime: "", userName: "", userContact: "", purpose: "" });
      toast.success("Peminjaman dibuat!");
    }
  };

  const openEditBooking = (booking: MeetingBooking) => {
    setEditingBookingId(booking.id);
    setNewBooking({
      placeId: booking.placeId,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      userName: booking.userName,
      userContact: booking.userContact,
      purpose: booking.purpose
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
          {isSuperAdmin && <TabsTrigger value="settings">Pengaturan Password</TabsTrigger>}
        </TabsList>

        <TabsContent value="bookings" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Daftar Peminjaman</h2>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleRefreshBookings} disabled={isRefreshingBookings}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshingBookings ? "animate-spin" : ""}`} />
                Refresh Data
              </Button>
              <Dialog open={isAddBookingOpen} onOpenChange={(open) => {
                setIsAddBookingOpen(open);
                if (!open) {
                  setEditingBookingId(null);
                  setNewBooking({ placeId: "", date: "", startTime: "", endTime: "", userName: "", userContact: "", purpose: "" });
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
                  <form onSubmit={handleSaveBooking} className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="place">Ruangan</Label>
                      <Select value={newBooking.placeId} onValueChange={(val) => setNewBooking({ ...newBooking, placeId: val })} required>
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
                        <DatePicker value={newBooking.date} onChange={val => setNewBooking({ ...newBooking, date: val })} disablePast />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label htmlFor="startTime">Mulai</Label>
                          <TimePicker id="startTime" value={newBooking.startTime} onChange={val => setNewBooking({ ...newBooking, startTime: val })} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endTime">Selesai</Label>
                          <TimePicker id="endTime" value={newBooking.endTime} onChange={val => setNewBooking({ ...newBooking, endTime: val })} required />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userName">Peminjam (Nama / Kelompok)</Label>
                      <Input id="userName" value={newBooking.userName} onChange={e => setNewBooking({ ...newBooking, userName: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userContact">Kontak (HP / WA)</Label>
                      <Input id="userContact" value={newBooking.userContact} onChange={e => setNewBooking({ ...newBooking, userContact: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="purpose">Keperluan</Label>
                      <Textarea id="purpose" value={newBooking.purpose} onChange={e => setNewBooking({ ...newBooking, purpose: e.target.value })} required />
                    </div>
                    <Button type="submit" className="w-full mt-4">{editingBookingId ? "Update Peminjaman" : "Simpan Peminjaman"}</Button>
                  </form>
                </DialogContent>
              </Dialog>
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
              {bookings.length === 0 ? (
                <p className="text-muted-foreground col-span-full">Tidak ada peminjaman ditemukan.</p>
              ) : (
                bookings.map((booking) => (
                  <Card key={booking.id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{getPlaceName(booking.placeId)}</CardTitle>
                          <CardDescription>{booking.date} · {booking.startTime} - {booking.endTime}</CardDescription>
                        </div>
                        <Badge variant={
                          booking.status === "confirmed" ? "default" :
                            booking.status === "rejected" ? "destructive" : "secondary"
                        } className="capitalize">
                          {booking.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                          {booking.status === "pending" ? "Menunggu" : booking.status === "confirmed" ? "Dikonfirmasi" : "Ditolak"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-2 text-sm">
                      <div>
                        <span className="font-semibold text-xs text-muted-foreground uppercase">Peminjam</span>
                        <p className="font-medium">{booking.userName}</p>
                        <p className="text-muted-foreground">{booking.userContact}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-xs text-muted-foreground uppercase">Keperluan</span>
                        <p>{booking.purpose}</p>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-slate-50 border-t justify-end gap-2 p-3">
                      {(booking.status === "pending" || booking.status === "confirmed") && (
                        <Button variant="outline" size="sm" onClick={() => handleReject(booking.id)} className="text-red-600">
                          <XCircle className="w-4 h-4 mr-1" />
                          Tolak
                        </Button>
                      )}
                      {(booking.status === "pending" || booking.status === "rejected") && (
                        <Button size="sm" onClick={() => handleApprove(booking.id)} className="bg-green-600 hover:bg-green-700 font-medium text-white border-0">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Setujui
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => openEditBooking(booking)} title="Edit Peminjaman">
                        <Pencil className="w-4 h-4 text-slate-400 hover:text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteBooking(booking.id)} title="Hapus Peminjaman">
                        <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="places" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Kelola Ruangan</h2>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleRefreshPlaces} disabled={isRefreshingPlaces}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshingPlaces ? "animate-spin" : ""}`} />
                Refresh Data
              </Button>
              <Dialog open={isAddPlaceOpen} onOpenChange={setIsAddPlaceOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Ruangan
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tambah Ruang Pertemuan</DialogTitle>
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
                    <Button type="submit" className="w-full">Simpan Ruangan</Button>
                  </form>
                </DialogContent>
              </Dialog>
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
              {places.length === 0 ? (
                <p className="text-muted-foreground">Belum ada ruangan ditambahkan.</p>
              ) : (
                places.map(place => (
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
                    <CardFooter className="justify-end border-t p-3 bg-slate-50">
                      <Button variant="ghost" size="sm" onClick={() => handleDeletePlace(place.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Hapus
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
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
