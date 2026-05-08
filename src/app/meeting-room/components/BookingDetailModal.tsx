import { MeetingBooking, MeetingPlace } from "@/features/booking/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, MapPin, Package, Building2, User, Phone, Users, FileText, Hash, RotateCcw } from "lucide-react";

export function BookingDetailModal({
    booking,
    places,
    onClose
}: {
    booking: MeetingBooking | null;
    places: MeetingPlace[];
    onClose: () => void;
}) {
    if (!booking) return null;

    const b = booking;
    const place = places.find(p => p.id === b.placeId);
    const isInventoryOnly = b.type === 'inventory';

    return (
        <Dialog open={!!booking} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="sm:max-w-[460px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 pr-6">
                        {isInventoryOnly ? (
                            <Package className="h-5 w-5 text-emerald-600 shrink-0" />
                        ) : (
                            <Building2 className="h-5 w-5 text-brand-blue shrink-0" />
                        )}
                        {isInventoryOnly ? 'Peminjaman Inventaris' : place?.name || 'Ruangan Tidak Diketahui'}
                    </DialogTitle>
                    <DialogDescription>Detail peminjaman ruangan atau inventaris.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-1">
                    {/* Status + rescheduled badge */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                            Disetujui
                        </Badge>
                        {b.isRescheduled && (
                            <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50">
                                Dipindah Jadwal
                            </Badge>
                        )}
                        {b.submissionSource === 'manual' && (
                            <Badge variant="outline" className="text-slate-500 text-[10px]">
                                Manual
                            </Badge>
                        )}
                        {b.returnStatus && (b.type === 'inventory' || b.type === 'both') && (
                            <Badge className={
                                b.returnStatus === 'Sudah Dikembalikan' 
                                    ? "bg-green-100 text-green-700 border-green-200"
                                    : b.returnStatus === 'Dikembalikan dengan Kekurangan'
                                    ? "bg-amber-100 text-amber-700 border-amber-200"
                                    : "bg-red-100 text-red-700 border-red-200"
                            }>
                                <RotateCcw className="w-3 h-3 mr-1" />
                                {b.returnStatus}
                            </Badge>
                        )}
                    </div>

                    {/* Date & Time row */}
                    <div className="rounded-lg border p-3 bg-slate-50 text-slate-800 space-y-1.5">
                        {b.multiDatesDetails && b.multiDatesDetails.length > 0 ? (
                            <>
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                    <CalendarIcon className="h-4 w-4 shrink-0 opacity-70" />
                                    <span>Multi-Hari ({b.multiDatesDetails.length} tanggal)</span>
                                </div>
                                {b.multiDatesDetails.map((detail, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm ml-6">
                                        <CalendarIcon className="h-3.5 w-3.5 shrink-0 opacity-50" />
                                        <span>{new Date(detail.date).toLocaleDateString('id-ID', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                        <Clock className="h-3.5 w-3.5 shrink-0 opacity-50 ml-2" />
                                        <span className="font-medium">{detail.startTime} – {detail.endTime}</span>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 text-sm">
                                    <CalendarIcon className="h-4 w-4 shrink-0 opacity-70" />
                                    <span className="font-semibold">
                                        {new Date(b.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </span>
                                </div>
                                {!isInventoryOnly && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="h-4 w-4 shrink-0 opacity-70" />
                                        <span className="font-semibold">{b.startTime} – {b.endTime}</span>
                                    </div>
                                )}
                            </>
                        )}
                        {isInventoryOnly && (
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 shrink-0 opacity-70" />
                                <span>
                                    Ambil: <span className="font-semibold">{b.inventoryDateTake || b.date}</span>
                                    {b.returnDate && <> &nbsp;·&nbsp; Kembali: <span className="font-semibold">{b.returnDate}</span></>}
                                </span>
                            </div>
                        )}
                        {b.location && (
                            <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 shrink-0 opacity-70" />
                                <span>{b.location}</span>
                            </div>
                        )}
                    </div>

                    {/* Details row */}
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <div className="mt-0.5 bg-blue-100 p-1.5 rounded-md text-blue-700 shrink-0 h-fit">
                                <User className="h-4 w-4" />
                            </div>
                            <div className="space-y-1 min-w-0">
                                <p className="text-xs font-semibold text-muted-foreground uppercase">Peminjam</p>
                                <p className="text-sm font-medium text-slate-900 truncate">{b.userName}</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <div className="mt-0.5 bg-green-100 p-1.5 rounded-md text-green-700 shrink-0 h-fit">
                                <Phone className="h-4 w-4" />
                            </div>
                            <div className="space-y-1 min-w-0">
                                <p className="text-xs font-semibold text-muted-foreground uppercase">Kontak</p>
                                <p className="text-sm font-medium text-slate-900 truncate">
                                    <a href={`https://wa.me/${b.userContact.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-brand-blue hover:underline">
                                        {b.userContact}
                                    </a>
                                </p>
                            </div>
                        </div>

                        {(() => {
                            const parsedParticipants = b.purpose?.match(/Peserta:\s*(\d+)/)?.[1] || "0";
                            const cleanPurpose = b.purpose
                              ?.replace(/\n*Peserta: \d+/, '')
                              ?.replace(/\n*Catatan: .*/s, '')
                              ?.replace(/\n*Multi-hari: .*/, '');

                            return (
                                <>
                                    {!isInventoryOnly && parseInt(parsedParticipants) > 0 && (
                                        <div className="flex gap-3">
                                            <div className="mt-0.5 bg-purple-100 p-1.5 rounded-md text-purple-700 shrink-0 h-fit">
                                                <Users className="h-4 w-4" />
                                            </div>
                                            <div className="space-y-1 min-w-0">
                                                <p className="text-xs font-semibold text-muted-foreground uppercase">Peserta</p>
                                                <p className="text-sm text-slate-900">{parsedParticipants} orang</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-3">
                                        <div className="mt-0.5 bg-amber-100 p-1.5 rounded-md text-amber-700 shrink-0 h-fit">
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        <div className="space-y-1 min-w-0">
                                            <p className="text-xs font-semibold text-muted-foreground uppercase">Acara / Keperluan</p>
                                            <p className="text-sm text-slate-900 leading-relaxed whitespace-pre-wrap">{cleanPurpose}</p>
                                        </div>
                                    </div>
                                </>
                            );
                        })()}

                        {b.borrowedItems && b.borrowedItems.length > 0 && (
                            <div className="flex gap-3 border-t pt-4">
                                <div className="mt-0.5 bg-emerald-100 p-1.5 rounded-md text-emerald-700 shrink-0 h-fit">
                                    <Package className="h-4 w-4" />
                                </div>
                                <div className="space-y-2 min-w-0 w-full">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase">Barang Dipinjam</p>
                                    <div className="space-y-2">
                                        {b.borrowedItems.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-sm bg-slate-50 border rounded p-2">
                                                <Badge variant="secondary" className="bg-white border-slate-200 text-slate-700">{item.quantity}x</Badge>
                                                <span className="font-medium text-slate-800">{item.name}</span>
                                                {(item.dateTake || item.timeTake) && (
                                                    <span className="text-xs text-muted-foreground ml-auto">
                                                        Ambil: {item.dateTake} {item.timeTake}
                                                    </span>
                                                )}
                                                {(item.dateReturn || item.timeReturn) && (
                                                    <span className="text-xs text-muted-foreground">
                                                        Kembali: {item.dateReturn} {item.timeReturn}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {!isInventoryOnly && (
                                        <div className="text-xs text-slate-500 mt-2 space-y-1 bg-slate-50 p-2 rounded border border-dashed">
                                            <p className="flex justify-between"><span>Tgl Ambil:</span> <span className="font-medium text-slate-700">{b.inventoryDateTake || b.date}</span></p>
                                            <p className="flex justify-between"><span>Tgl Kembali:</span> <span className="font-medium text-slate-700">{b.returnDate || b.date}</span></p>
                                        </div>
                                    )}
                                    
                                    {/* Return Status Information */}
                                    {b.returnStatus && (
                                        <div className="mt-3 pt-3 border-t border-dashed space-y-2">
                                            <div className="flex items-center gap-2">
                                                <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span className="text-xs font-semibold text-muted-foreground uppercase">Status Pengembalian</span>
                                            </div>
                                            <Badge className={
                                                b.returnStatus === 'Sudah Dikembalikan' 
                                                    ? "bg-green-50 text-green-700 border-green-200"
                                                    : b.returnStatus === 'Dikembalikan dengan Kekurangan'
                                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                                    : "bg-red-50 text-red-700 border-red-200"
                                            }>
                                                {b.returnStatus}
                                            </Badge>
                                            {b.returnNotes && (
                                                <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded border">
                                                    <span className="font-semibold">Catatan Pengembalian:</span> {b.returnNotes}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    
                                    {/* Initial Condition Notes */}
                                    {b.initialConditionNotes && (
                                        <div className="mt-2 pt-2 border-t border-dashed">
                                            <p className="text-xs text-slate-600 bg-blue-50 p-2 rounded border border-blue-100">
                                                <span className="font-semibold">Kondisi Awal:</span> {b.initialConditionNotes}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
