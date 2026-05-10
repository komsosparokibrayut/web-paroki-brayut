import { useState } from "react";
import { toast } from "sonner";
import { MeetingBooking, MeetingPlace } from "@/features/booking/types";
import { updateBookingStatus, deleteBooking, updateReturnStatus } from "@/features/booking/actions/bookings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, CheckCircle, XCircle, Clock, Pencil, RefreshCw, Search, ChevronLeft, ChevronRight, CalendarDays, Package, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parse } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useAdminRole } from "@/components/admin/AdminRoleProvider";
import { canManageBooking } from "@/lib/roles";

export function BookingsTab({
  bookings,
  setBookings,
  places,
  isRefreshing,
  onRefresh,
  openConfirm,
  openAddBooking,
  openEditBooking,
}: {
  bookings: MeetingBooking[];
  setBookings: React.Dispatch<React.SetStateAction<MeetingBooking[]>>;
  places: MeetingPlace[];
  isRefreshing: boolean;
  onRefresh: () => void;
  openConfirm: (title: string, message: string, variant: "default" | "destructive", action: () => Promise<void>) => void;
  openAddBooking: () => void;
  openEditBooking: (booking: MeetingBooking) => void;
}) {
  const { user } = useAdminRole();
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");
  const [bookingTypeFilter, setBookingTypeFilter] = useState("all");
  const [bookingPage, setBookingPage] = useState(1);
  const BOOKING_PAGE_SIZE = 9;

  // Return status modal state
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedBookingForReturn, setSelectedBookingForReturn] = useState<MeetingBooking | null>(null);
  const [returnStatus, setReturnStatus] = useState<"Masih Dipinjam" | "Sudah Dikembalikan" | "Dikembalikan dengan Kekurangan">("Masih Dipinjam");
  const [returnNotes, setReturnNotes] = useState("");

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

  const openReturnModal = (booking: MeetingBooking) => {
    setSelectedBookingForReturn(booking);
    setReturnStatus(booking.returnStatus || "Masih Dipinjam");
    setReturnNotes(booking.returnNotes || "");
    setReturnModalOpen(true);
  };

  const handleUpdateReturnStatus = async () => {
    if (!selectedBookingForReturn) return;
    
    const res = await updateReturnStatus(selectedBookingForReturn.id!, returnStatus, returnNotes);
    if (res.success) {
      setBookings(prev => prev.map(b => 
        b.id === selectedBookingForReturn.id 
          ? { ...b, returnStatus, returnNotes } 
          : b
      ));
      toast.success("Status pengembalian diperbarui!");
      setReturnModalOpen(false);
      setSelectedBookingForReturn(null);
    } else {
      toast.error(res.error || "Gagal memperbarui status pengembalian");
    }
  };

  const getReturnStatusBadge = (status?: string) => {
    switch (status) {
      case "Sudah Dikembalikan":
        return <Badge className="bg-green-50 text-green-600 border-green-200">Sudah Dikembalikan</Badge>;
      case "Dikembalikan dengan Kekurangan":
        return <Badge className="bg-amber-50 text-amber-600 border-amber-200">Dikembalikan dgn Kekurangan</Badge>;
      case "Masih Dipinjam":
      default:
        return <Badge className="bg-red-50 text-red-600 border-red-200">Masih Dipinjam</Badge>;
    }
  };

  const getPlaceName = (id?: string) => places.find(p => p.id === id)?.name || "Ruangan / Barang Tidak Diketahui";

    const filteredBookings = bookings
    .filter(b => bookingStatusFilter === "all" || b.status === bookingStatusFilter)
    .filter(b => bookingTypeFilter === "all" || b.type === bookingTypeFilter)
    .filter(b => {
      const q = bookingSearch.toLowerCase();
      if (!q) return true;
      
      // Search in basic fields
      const basicMatch = b.userName.toLowerCase().includes(q) 
        || b.userContact.toLowerCase().includes(q) 
        || b.purpose.toLowerCase().includes(q);
      
      if (basicMatch) return true;
      
      // Search in multiDates
      if (b.multiDates && b.multiDates.length > 0) {
        return b.multiDates.some(d => d.includes(q));
      }
      
      return false;
    });
  const bookingPageCount = Math.max(1, Math.ceil(filteredBookings.length / BOOKING_PAGE_SIZE));
  const pagedBookings = filteredBookings.slice((bookingPage - 1) * BOOKING_PAGE_SIZE, bookingPage * BOOKING_PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Daftar Peminjaman</h2>
          <div className="flex space-x-2">
            <Button variant="outline" className="bg-white text-blue-500 hover:bg-blue-50 hover:text-blue-600" onClick={onRefresh} disabled={isRefreshing}>
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
            <Button onClick={openAddBooking}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Peminjaman
            </Button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari peminjam, keperluan..."
              value={bookingSearch}
              onChange={e => { setBookingSearch(e.target.value); setBookingPage(1); }}
              className="pl-9 bg-white"
            />
          </div>
          <Select value={bookingStatusFilter} onValueChange={v => { setBookingStatusFilter(v); setBookingPage(1); }}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Menunggu</SelectItem>
              <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
              <SelectItem value="rejected">Ditolak</SelectItem>
            </SelectContent>
          </Select>
          <Select value={bookingTypeFilter} onValueChange={v => { setBookingTypeFilter(v); setBookingPage(1); }}>
            <SelectTrigger className="w-full sm:w-[160px] bg-white">
              <SelectValue placeholder="Semua Jenis" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">Semua Jenis</SelectItem>
              <SelectItem value="room">Ruangan</SelectItem>
              <SelectItem value="inventory">Inventaris</SelectItem>
              <SelectItem value="both">Ruangan + Barang</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isRefreshing ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-1" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
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
                      {booking.type === 'both' && (
                        <CardDescription className="text-amber-600 font-medium">
                          + Inventaris (Ruangan + Barang)
                        </CardDescription>
                      )}
                      {booking.type === 'inventory' ? (
                        <CardDescription>
                          Tgl Ambil: {booking.date} · Tgl Kembali: {booking.returnDate || '-'}
                        </CardDescription>
                      ) : (
                        <CardDescription className="flex items-center gap-1 flex-wrap">
                          {booking.multiDates && booking.multiDates.length > 1 ? (
                            <>
                              <CalendarDays className="w-3 h-3" />
                              {booking.multiDates.length} hari: {booking.multiDates.slice(0, 2).map(d => {
                                const parsed = parse(d, 'yyyy-MM-dd', new Date());
                                return parsed ? format(parsed, 'd MMM', { locale: idLocale }) : d;
                              }).join(', ')}
                              {booking.multiDates.length > 2 && '...'}
                              {' · '}{booking.startTime} - {booking.endTime}
                            </>
                          ) : (
                            <>{booking.date} · {booking.startTime} - {booking.endTime}</>
                          )}
                        </CardDescription>
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
{booking.multiDates && booking.multiDates.length > 1 && (
                          <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50 shadow-sm border whitespace-nowrap">
                            <CalendarDays className="w-3 h-3 mr-1" />
                            Multi-Hari
                          </Badge>
                        )}
                        {booking.type === 'both' && (
                          <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50 shadow-sm border whitespace-nowrap">
                            <Package className="w-3 h-3 mr-1" />
                            + Barang
                          </Badge>
                        )}
                       {(booking.type === 'inventory' || booking.type === 'both') && booking.status === 'confirmed' && (
                         <div className="mt-1">
                           {getReturnStatusBadge(booking.returnStatus)}
                         </div>
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
                          <li key={item.itemId || idx} className="flex items-center gap-2">
                            ({item.quantity}x) {item.name}
                            <span className="text-xs text-muted-foreground font-normal">
                              (Ambil: {item.dateTake} {item.timeTake} · Kembali: {item.dateReturn} {item.timeReturn})
                            </span>
                            {getReturnStatusBadge(booking.returnStatus)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="bg-slate-50 border-t justify-end gap-2 p-3">
                  {user && canManageBooking(user, booking) && (booking.status === "pending" || booking.status === "rejected") && (
                    <Button variant="outline" size="sm" onClick={() => handleApprove(booking.id!)} className="text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700 ">
                      <CheckCircle className="w-4 h-4" />
                      Setujui
                    </Button>
                  )}
                  {user && canManageBooking(user, booking) && (
                    <Button variant="outline" size="sm" onClick={() => openEditBooking(booking)} className="text-blue-600 border-blue-200 hover:bg-blue-100 hover:text-blue-700">
                      <Pencil className="w-4 h-4" />
                      Ubah
                    </Button>
                  )}
                  {user && canManageBooking(user, booking) && (booking.status === "pending" || booking.status === "confirmed") && (
                    <Button variant="outline" size="sm" onClick={() => handleReject(booking.id!)} className="text-red-500 border-red-200 hover:bg-red-100 hover:text-red-700">
                      <XCircle className="w-4 h-4" />
                      Tolak
                    </Button>
                  )}
                  {user && canManageBooking(user, booking) && (booking.type === 'inventory' || booking.type === 'both') && booking.status === 'confirmed' && (
                    <Button variant="outline" size="sm" onClick={() => openReturnModal(booking)} className="text-amber-600 border-amber-200 hover:bg-amber-100 hover:text-amber-700">
                      <RotateCcw className="w-4 h-4" />
                      Kembalikan
                    </Button>
                  )}
                  {user && canManageBooking(user, booking) && (
                    <Button variant="outline" size="sm" onClick={() => handleDeleteBooking(booking.id!)} className="text-red-500 border-red-200 hover:bg-red-100 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                      Hapus
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      )}
      {!isRefreshing && bookingPageCount > 1 && (
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

      {/* Return Status Modal */}
      <Dialog open={returnModalOpen} onOpenChange={setReturnModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update Status Pengembalian</DialogTitle>
            <DialogDescription>Perbarui status pengembalian barang.</DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            {selectedBookingForReturn && (
              <>
                <div className="bg-slate-50 p-3 rounded-md space-y-1">
                  <p className="font-semibold">{selectedBookingForReturn.userName}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedBookingForReturn.borrowedItems?.map(item => `(${item.quantity}x) ${item.name}`).join(', ')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Status Pengembalian</Label>
                  <Select value={returnStatus} onValueChange={(val: any) => setReturnStatus(val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Masih Dipinjam">Masih Dipinjam</SelectItem>
                      <SelectItem value="Sudah Dikembalikan">Sudah Dikembalikan</SelectItem>
                      <SelectItem value="Dikembalikan dengan Kekurangan">Dikembalikan dengan Kekurangan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Catatan Pengembalian (Opsional)</Label>
                  <Textarea
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                    placeholder="Catatan kondisi barang, kekurangan, kerusakan, dll..."
                    rows={3}
                  />
                </div>
              </>
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnModalOpen(false)}>Batal</Button>
            <Button onClick={handleUpdateReturnStatus}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
