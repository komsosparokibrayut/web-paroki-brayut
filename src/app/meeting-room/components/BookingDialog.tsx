"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { MeetingBooking, MeetingPlace, InventoryItem } from "@/features/booking/types";
import { submitBooking } from "@/features/booking/actions/bookings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogBody, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PhoneInput } from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { X } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export function BookingDialog({
    open,
    onOpenChange,
    defaultBookingType,
    places,
    inventoryItems,
    bookings,
    onSuccess
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultBookingType: "room" | "inventory";
    places: MeetingPlace[];
    inventoryItems: InventoryItem[];
    bookings: MeetingBooking[];
    onSuccess: () => void;
}) {
    const [conflictError, setConflictError] = useState<string | null>(null);
    const [bookingType, setBookingType] = useState<"room" | "inventory">(defaultBookingType);

    useEffect(() => {
        if (open) {
            setBookingType(defaultBookingType);
            setNewBooking(initialBookingState);
        }
    }, [open, defaultBookingType]);

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
        borrowedItems: [] as { itemId: string; quantity: number; name: string }[]
    };

    const [newBooking, setNewBooking] = useState(initialBookingState);

    const handleBook = async (e: React.FormEvent) => {
        e.preventDefault();
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
                startTime: "00:00",
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

        onOpenChange(false);
        setNewBooking(initialBookingState);
        toast.success("Permohonan berhasil dikirim, menunggu persetujuan admin.", {
            description: "Kami akan menghubungi Anda via WhatsApp untuk konfirmasi.",
            duration: 6000,
        });
        onSuccess();
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
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
                                        <div className="grid grid-cols-2 gap-2">
                                            {(() => {
                                                const confirmedForSlot = (newBooking.placeId && newBooking.date)
                                                    ? bookings.filter(b =>
                                                        b.status === 'confirmed' &&
                                                        b.placeId === newBooking.placeId &&
                                                        b.date === newBooking.date
                                                    )
                                                    : [];

                                                const isStartConflict = (h: number) =>
                                                    confirmedForSlot.some(b => {
                                                        const bs = parseInt(b.startTime.split(':')[0]);
                                                        const be = parseInt(b.endTime.split(':')[0]);
                                                        return h >= bs && h < be;
                                                    });

                                                const isEndConflict = (h: number) => {
                                                    const propStart = newBooking.startTime ? parseInt(newBooking.startTime.split(':')[0]) : -1;
                                                    return confirmedForSlot.some(b => {
                                                        const bs = parseInt(b.startTime.split(':')[0]);
                                                        const be = parseInt(b.endTime.split(':')[0]);
                                                        return propStart < be && bs < h;
                                                    });
                                                };

                                                const startHour = newBooking.startTime ? parseInt(newBooking.startTime.split(':')[0]) : 6;

                                                return (
                                                    <>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="startTime">Waktu Mulai</Label>
                                                            <Select
                                                                value={newBooking.startTime}
                                                                onValueChange={(val) => {
                                                                    const sh = parseInt(val.split(':')[0]);
                                                                    const eh = newBooking.endTime ? parseInt(newBooking.endTime.split(':')[0]) : 0;
                                                                    let newEnd = newBooking.endTime;
                                                                    if (!newBooking.endTime || eh <= sh) {
                                                                        newEnd = `${(sh + 1).toString().padStart(2, '0')}:00`;
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
                                                                        const conflict = isStartConflict(hour);
                                                                        return (
                                                                            <SelectItem key={time} value={time} disabled={conflict}>
                                                                                {time}{conflict ? ' (Terpakai)' : ''}
                                                                            </SelectItem>
                                                                        );
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
                                                                        if (hour <= startHour) return null;
                                                                        const time = `${hour.toString().padStart(2, '0')}:00`;
                                                                        const conflict = isEndConflict(hour);
                                                                        return (
                                                                            <SelectItem key={time} value={time} disabled={conflict}>
                                                                                {time}{conflict ? ' (Terpakai)' : ''}
                                                                            </SelectItem>
                                                                        );
                                                                    })}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </>
                                                );
                                            })()}
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
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}

                                        <Button className="bg-brand-dark hover:bg-brand-dark/90 text-white hover:text-white w-full mt-2" type="button" variant="outline" size="sm" onClick={() => {
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
                                            <Button type="button" variant="destructive" size="icon" onClick={() => {
                                                const newItems = newBooking.borrowedItems.filter((_, i) => i !== index);
                                                setNewBooking({ ...newBooking, borrowedItems: newItems });
                                            }}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}

                                    <Button type="button" variant="outline" size="sm" className="bg-brand-dark hover:bg-brand-dark/90 text-white hover:text-white w-full mt-2" onClick={() => {
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
        </>
    );
}
