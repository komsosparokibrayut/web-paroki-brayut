"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { format, parse, isValid } from "date-fns";
import { MeetingBooking, MeetingPlace, InventoryItem, DateWithTime, BorrowedItemWithDetails } from "@/features/booking/types";
import { submitBooking } from "@/features/booking/actions/bookings";
import { getInventoryItemsWithAvailability } from "@/features/booking/actions/inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogBody, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PhoneInput } from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { X } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MultiDateWithTimePicker } from "@/components/ui/date-time-picker";

export function BookingDialog({
    open,
    onOpenChange,
    defaultBookingType,
    places,
    inventoryItems,
    bookings,
    wilayahs = [],
    onSuccess
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultBookingType: "room" | "inventory";
    places: MeetingPlace[];
    inventoryItems: InventoryItem[];
    bookings: MeetingBooking[];
    wilayahs?: { id: string; name: string }[];
    onSuccess: () => void;
}) {
    const [conflictError, setConflictError] = useState<string | null>(null);
    const [bookingType, setBookingType] = useState<"room" | "inventory">(defaultBookingType);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const now = new Date();
    const currentHour = now.getHours();

    const isToday = (dateStr: string) => {
        const d = parse(dateStr, "yyyy-MM-dd", new Date());
        return isValid(d) && d.getTime() === today.getTime();
    };

    const getTimeOptions = (dateStr: string, startHour: number = 6) => {
        const isTodayDate = isToday(dateStr);
        return Array.from({ length: 17 }).map((_, i) => {
            const hour = i + startHour;
            if (isTodayDate && hour < currentHour) return null;
            return { hour, time: `${hour.toString().padStart(2, '0')}:00` };
        }).filter(Boolean) as { hour: number; time: string }[];
    };

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
        multiDatesDetails: [] as DateWithTime[],
        borrowedItems: [] as BorrowedItemWithDetails[]
    };

    const [newBooking, setNewBooking] = useState(initialBookingState);
    const [availableStock, setAvailableStock] = useState<Record<string, number>>({});
    const [inventoryItemsFull, setInventoryItemsFull] = useState<InventoryItem[]>([]);

    useEffect(() => {
        if (open) {
            setBookingType(defaultBookingType);
            setNewBooking(initialBookingState);
        }
    }, [open, defaultBookingType, initialBookingState]);

    useEffect(() => {
        if (open) {
            getInventoryItemsWithAvailability(
                newBooking.multiDatesDetails?.map(d => d.date) || [newBooking.date],
                newBooking.multiDatesDetails?.map(d => d.startTime) || [newBooking.startTime],
                newBooking.multiDatesDetails?.map(d => d.endTime) || [newBooking.endTime]
            ).then(items => {
                setInventoryItemsFull(items);
                const stockMap: Record<string, number> = {};
                items.forEach(item => {
                    stockMap[item.id] = item.availableQuantity ?? item.totalQuantity;
                });
                setAvailableStock(stockMap);
            });
        }
    }, [open, newBooking.date, newBooking.multiDatesDetails, newBooking.startTime, newBooking.endTime]);

    const getRemainingStock = (itemId: string, excludeIndex: number) => {
        const serverAvailable = availableStock[itemId] ?? inventoryItemsFull.find(i => i.id === itemId)?.totalQuantity ?? 0;
        const usedInForm = newBooking.borrowedItems
            .filter((item, idx) => item.itemId === itemId && idx !== excludeIndex)
            .reduce((sum, item) => sum + item.quantity, 0);
        return Math.max(0, serverAvailable - usedInForm);
    };

    const handleBook = async (e: React.FormEvent) => {
        e.preventDefault();
        const { isMultiDay, multiDayDetails, dateTake, dateReturn, event, location, participants, notes, borrowedItems, multiDatesDetails, ...commonBooking } = newBooking;

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
                purpose: commonBooking.purpose + (participants ? `\nPeserta: ${participants}` : '') + (notes ? `\nCatatan: ${notes}` : ''),
                multiDatesDetails: multiDatesDetails.length > 0 ? multiDatesDetails : undefined,
                borrowedItems: borrowedItems.length > 0 ? borrowedItems : undefined,
            };
        } else {
            const inventoryDates = multiDatesDetails.length > 0 ? multiDatesDetails : undefined;
            payload = {
                ...payload,
                date: inventoryDates ? inventoryDates[0].date : (dateTake || commonBooking.date),
                multiDatesDetails: inventoryDates,
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
                        <DialogDescription>Data mohon diisi secara lengkap</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleBook} className="space-y-4 py-2">
                        <DialogBody className="space-y-4">
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
                                    
                                    <div className="space-y-2">
                                        <Label>Tanggal & Waktu Kegiatan</Label>
                                        <MultiDateWithTimePicker
                                            values={newBooking.multiDatesDetails || []}
                                            onChange={(vals) => {
                                                setNewBooking(prev => ({
                                                    ...prev,
                                                    multiDatesDetails: vals,
                                                    date: vals.length > 0 ? vals[0].date : '',
                                                    startTime: vals.length > 0 ? vals[0].startTime : '',
                                                    endTime: vals.length > 0 ? vals[0].endTime : ''
                                                }));
                                            }}
                                            disablePast
                                        />
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
                                        <Label htmlFor="location">Tempat Pakai Barang</Label>
                                        <Select value={newBooking.location} onValueChange={(val) => setNewBooking({ ...newBooking, location: val })} required>
                                            <SelectTrigger className="bg-white">
                                                <SelectValue placeholder="Pilih Ruangan" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white">
                                                {places.map(p => (
                                                    <SelectItem key={p.id} value={p.name}>{p.name} {p.capacity ? `(Kap: ${p.capacity})` : ''}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label>Tanggal & Waktu Pengambilan/Pengembalian</Label>
                                        <MultiDateWithTimePicker
                                            values={newBooking.multiDatesDetails || []}
                                            onChange={(vals) => {
                                                setNewBooking(prev => ({
                                                    ...prev,
                                                    multiDatesDetails: vals,
                                                    dateTake: vals.length > 0 ? vals[0].date : '',
                                                    returnDate: vals.length > 0 ? vals[vals.length - 1].date : ''
                                                }));
                                            }}
                                            disablePast
                                        />
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
                                            <div key={index} className="flex flex-col gap-2 mb-2 p-3 bg-white rounded-md border">
                                                <div className="flex items-end gap-2">
                                                    <div className="flex-1 space-y-1">
                                                        <Label className="text-xs">Barang</Label>
                                                        <Select value={item.itemId} onValueChange={(val) => {
                                                            const newItems = [...newBooking.borrowedItems];
                                                            const selectedItem = inventoryItems.find(i => i.id === val);
                                                            newItems[index] = { ...item, itemId: val, name: selectedItem?.name || '' };
                                                            setNewBooking({ ...newBooking, borrowedItems: newItems });
                                                        }}>
                                                            <SelectTrigger className="text-foreground">
                                                                <SelectValue placeholder="Pilih Barang" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {inventoryItemsFull.map(inv => {
                                                                    const remaining = getRemainingStock(inv.id, index);
                                                                    const wilayahName = wilayahs.find(w => w.id === inv.wilayah_id)?.name;
                                                                    return (
                                                                        <SelectItem key={inv.id} value={inv.id} disabled={remaining <= 0} description={`Stock: ${remaining}${wilayahName ? ` | ${wilayahName}` : ''}`}>
                                                                            {inv.name}
                                                                        </SelectItem>
                                                                    );
                                                                })}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="w-24 space-y-1">
                                                        <Label className="text-xs">Jumlah</Label>
                                                        <Input className="bg-white" type="number" min="1" max={getRemainingStock(item.itemId, index)} value={item.quantity} onChange={(e) => {
                                                            const newItems = [...newBooking.borrowedItems];
                                                            const max = getRemainingStock(item.itemId, index);
                                                            newItems[index].quantity = Math.max(1, Math.min(max, parseInt(e.target.value) || 1));
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
                                                <div className="space-y-3">
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Ambil</Label>
                                                        <div className="flex gap-2">
                                                            <DatePicker value={item.dateTake || newBooking.dateTake} onChange={(val) => {
                                                                const newItems = [...newBooking.borrowedItems];
                                                                newItems[index] = { ...item, dateTake: val };
                                                                setNewBooking({ ...newBooking, borrowedItems: newItems });
                                                            }} disablePast />
                                                            <Select value={item.timeTake || "08:00"} onValueChange={(val) => {
                                                                const newItems = [...newBooking.borrowedItems];
                                                                newItems[index] = { ...item, timeTake: val };
                                                                setNewBooking({ ...newBooking, borrowedItems: newItems });
                                                            }}>
                                                                <SelectTrigger className="bg-white h-10 w-[80px]">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent className="bg-white">
                                                                    {getTimeOptions(item.dateTake || newBooking.dateTake || "").map((opt) => (
                                                                        <SelectItem key={opt.time} value={opt.time}>{opt.time}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Kembali</Label>
                                                        <div className="flex gap-2">
                                                            <DatePicker value={item.dateReturn || newBooking.dateReturn} onChange={(val) => {
                                                                const newItems = [...newBooking.borrowedItems];
                                                                newItems[index] = { ...item, dateReturn: val };
                                                                setNewBooking({ ...newBooking, borrowedItems: newItems });
                                                            }} disablePast />
                                                            <Select value={item.timeReturn || "09:00"} onValueChange={(val) => {
                                                                const newItems = [...newBooking.borrowedItems];
                                                                newItems[index] = { ...item, timeReturn: val };
                                                                setNewBooking({ ...newBooking, borrowedItems: newItems });
                                                            }}>
                                                                <SelectTrigger className="bg-white h-10 w-[80px]">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent className="bg-white">
                                                                    {getTimeOptions(item.dateReturn || newBooking.dateReturn || "", 7).map((opt) => (
                                                                        <SelectItem key={opt.time} value={opt.time}>{opt.time}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        <Button className="bg-brand-dark hover:bg-brand-dark/90 text-white hover:text-white w-full mt-2" type="button" variant="outline" size="sm" onClick={() => {
                                            setNewBooking({ ...newBooking, borrowedItems: [...newBooking.borrowedItems, { itemId: '', quantity: 1, name: '' }] })
                                        }}>
                                            + Tambah Barang
                                        </Button>
                                    </div>
                                </>
                            )}

                            {bookingType === 'inventory' && (
                                <div className="space-y-2 mt-4 p-4 border rounded-md bg-slate-50">
                                    <Label className="font-semibold text-brand-dark">Daftar Barang (Wajib)</Label>

                                    {newBooking.borrowedItems.map((item, index) => (
                                        <div key={index} className="flex flex-col gap-2 mb-2 p-3 bg-white rounded-md border">
                                            <div className="flex items-end gap-2">
                                                <div className="flex-1 space-y-1">
                                                    <Label className="text-xs">Barang</Label>
                                                    <Select value={item.itemId} onValueChange={(val) => {
                                                        const newItems = [...newBooking.borrowedItems];
                                                        const selectedItem = inventoryItems.find(i => i.id === val);
                                                        newItems[index] = { ...item, itemId: val, name: selectedItem?.name || '' };
                                                        setNewBooking({ ...newBooking, borrowedItems: newItems });
                                                    }}>
                                                        <SelectTrigger className="text-foreground">
                                                            <SelectValue placeholder="Pilih Barang" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {inventoryItemsFull.map(inv => {
                                                                const remaining = getRemainingStock(inv.id, index);
                                                                const wilayahName = wilayahs.find(w => w.id === inv.wilayah_id)?.name;
                                                                return (
                                                                    <SelectItem key={inv.id} value={inv.id} disabled={remaining <= 0} description={`Stock: ${remaining}${wilayahName ? ` | ${wilayahName}` : ''}`}>
                                                                        {inv.name}
                                                                    </SelectItem>
                                                                );
                                                            })}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="w-24 space-y-1">
                                                    <Label className="text-xs">Jumlah</Label>
                                                    <Input type="number" min="1" max={getRemainingStock(item.itemId, index)} value={item.quantity} onChange={(e) => {
                                                        const newItems = [...newBooking.borrowedItems];
                                                        const max = getRemainingStock(item.itemId, index);
                                                        newItems[index].quantity = Math.max(1, Math.min(max, parseInt(e.target.value) || 1));
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
                                            <div className="space-y-3">
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Ambil</Label>
                                                    <div className="flex gap-2">
                                                        <DatePicker value={item.dateTake || newBooking.dateTake} onChange={(val) => {
                                                            const newItems = [...newBooking.borrowedItems];
                                                            newItems[index] = { ...item, dateTake: val };
                                                            setNewBooking({ ...newBooking, borrowedItems: newItems });
                                                        }} disablePast />
                                                        <Select value={item.timeTake || "08:00"} onValueChange={(val) => {
                                                            const newItems = [...newBooking.borrowedItems];
                                                            newItems[index] = { ...item, timeTake: val };
                                                            setNewBooking({ ...newBooking, borrowedItems: newItems });
                                                        }}>
                                                            <SelectTrigger className="bg-white h-10 w-[80px]">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-white">
                                                                {getTimeOptions(item.dateTake || newBooking.dateTake || "").map((opt) => (
                                                                    <SelectItem key={opt.time} value={opt.time}>{opt.time}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Kembali</Label>
                                                    <div className="flex gap-2">
                                                        <DatePicker value={item.dateReturn || newBooking.dateReturn} onChange={(val) => {
                                                            const newItems = [...newBooking.borrowedItems];
                                                            newItems[index] = { ...item, dateReturn: val };
                                                            setNewBooking({ ...newBooking, borrowedItems: newItems });
                                                        }} disablePast />
                                                        <Select value={item.timeReturn || "09:00"} onValueChange={(val) => {
                                                            const newItems = [...newBooking.borrowedItems];
                                                            newItems[index] = { ...item, timeReturn: val };
                                                            setNewBooking({ ...newBooking, borrowedItems: newItems });
                                                        }}>
                                                            <SelectTrigger className="bg-white h-10 w-[80px]">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-white">
                                                                {getTimeOptions(item.dateReturn || newBooking.dateReturn || "", 7).map((opt) => (
                                                                    <SelectItem key={opt.time} value={opt.time}>{opt.time}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </div>
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