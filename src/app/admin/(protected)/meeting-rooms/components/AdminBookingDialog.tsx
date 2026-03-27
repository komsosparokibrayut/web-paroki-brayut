import { useState, useEffect } from "react";
import { toast } from "sonner";
import { MeetingBooking, MeetingPlace, InventoryItem } from "@/features/booking/types";
import { submitBooking, updateBooking } from "@/features/booking/actions/bookings";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { PhoneInput } from "@/components/ui/phone-input";

export function AdminBookingDialog({
  isOpen,
  onOpenChange,
  bookingToEdit,
  defaultBookingType = "room",
  places,
  inventory,
  onSuccess,
  setConflictError
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  bookingToEdit: MeetingBooking | null;
  defaultBookingType?: "room" | "inventory";
  places: MeetingPlace[];
  inventory: InventoryItem[];
  onSuccess: () => void;
  setConflictError: (msg: string | null) => void;
}) {
  const [bookingType, setBookingType] = useState<"room" | "inventory">(defaultBookingType);
  
  const initialBookingState = {
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
  };

  const [newBooking, setNewBooking] = useState(initialBookingState);

  useEffect(() => {
    if (isOpen) {
      if (bookingToEdit) {
        const match = bookingToEdit.purpose?.match(/Peserta:\s*(\d+)/);
        const parsedParticipants = match ? match[1] : "1";
        
        const cleanPurpose = bookingToEdit.purpose
          ? bookingToEdit.purpose
              .replace(/\n*Peserta: \d+/, '')
              .replace(/\n*Catatan: .*/s, '')
              .replace(/\n*Multi-hari: .*/, '')
          : '';

        setBookingType(bookingToEdit.type === 'inventory' ? 'inventory' : 'room');
        setNewBooking({
          placeId: bookingToEdit.placeId ?? "",
          date: bookingToEdit.date,
          startTime: bookingToEdit.startTime,
          endTime: bookingToEdit.endTime,
          userName: bookingToEdit.userName,
          userContact: bookingToEdit.userContact,
          purpose: bookingToEdit.type === 'inventory' ? '' : cleanPurpose,
          participants: parsedParticipants,
          notes: "",
          isMultiDay: false,
          multiDayDetails: "",
          dateTake: bookingToEdit.type === 'inventory' ? bookingToEdit.date : (bookingToEdit.inventoryDateTake || ""),
          dateReturn: bookingToEdit.returnDate || "",
          event: bookingToEdit.type === 'inventory' ? cleanPurpose : "",
          location: bookingToEdit.location || "",
          borrowedItems: bookingToEdit.borrowedItems || [],
          submissionSource: bookingToEdit.submissionSource || "online"
        });
      } else {
        setBookingType(defaultBookingType);
        setNewBooking(initialBookingState);
      }
    }
  }, [isOpen, bookingToEdit, defaultBookingType]);

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

    if (bookingToEdit?.id) {
      const res = await updateBooking(bookingToEdit.id, payload);
      if (!res.success) {
        if (res.error?.includes("bertabrakan")) {
          setConflictError(res.error);
        } else {
          toast.error(res.error || "Gagal memperbarui peminjaman");
        }
        return;
      }
      toast.success("Peminjaman diperbarui!");
      onSuccess();
      onOpenChange(false);
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
      toast.success("Peminjaman dibuat!");
      onSuccess();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{bookingToEdit ? "Edit Peminjaman" : "Tambah Peminjaman Baru"}</DialogTitle>
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
          <Button type="submit" className="w-full mt-4">{bookingToEdit ? "Update Peminjaman" : "Simpan Peminjaman"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
