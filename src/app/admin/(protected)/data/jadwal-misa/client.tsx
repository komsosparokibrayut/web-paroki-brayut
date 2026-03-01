"use client";

import { useState, useTransition, useCallback } from "react";
import { saveJadwalMisa } from "@/features/schedule/actions";
import { JadwalMisaData, ChurchUnit, WeeklySchedule, WeekNumber, SpecialMassEvent } from "@/features/schedule/types";
import {
    Plus, Pencil, Trash2, Loader2, MapPin,
    Church, ChevronDown, ChevronUp, AlertTriangle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import ConfirmModal from "@/components/admin/ConfirmModal";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const WEEK_LABELS = ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4", "Minggu 5"] as const;
const WEEK_NUMBERS: WeekNumber[] = [1, 2, 3, 4, 5];
const DAY_OPTIONS = ["Sabtu", "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
const BAHASA_OPTIONS = ["Indonesia", "Jawa"];

interface ScheduleForm {
    week: WeekNumber;
    day: string;
    time: string;
    bahasa: string;
    notes: string;
    date: string;
}

interface SpecialMassForm {
    name: string;
    time: string;
    location: string;
    description: string;
}

export default function JadwalMisaAdminClient({ initialData }: { initialData: JadwalMisaData | null }) {
    const defaultData: JadwalMisaData = {
        churches: [],
        specialMasses: []
    };
    const [data, setData] = useState<JadwalMisaData>(initialData || defaultData);
    const [expandedChurch, setExpandedChurch] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [scheduleModal, setScheduleModal] = useState<{ open: boolean; churchId: string; editingIndex: number | null }>({ open: false, churchId: "", editingIndex: null });
    const [specialModal, setSpecialModal] = useState<{ open: boolean; editing: SpecialMassEvent | null }>({ open: false, editing: null });
    const [deleteTarget, setDeleteTarget] = useState<{ type: "schedule"; churchId: string; index: number } | { type: "special"; id: string } | null>(null);
    const [scheduleForm, setScheduleForm] = useState<ScheduleForm>({ week: 1, day: "Sabtu", time: "", bahasa: "BahasaIndonesia", notes: "", date: "" });
    const [specialForm, setSpecialForm] = useState<SpecialMassForm>({ name: "", time: "", location: "", description: "" });
    const router = useRouter();

    const persistData = useCallback((newData: JadwalMisaData) => {
        setData(newData);
        startTransition(async () => {
            const result = await saveJadwalMisa(newData);
            if (!result.success) {
                toast.error("Gagal menyimpan: " + (result as any).error);
                setData(data);
            } else {
                toast.success("Jadwal berhasil disimpan!");
                router.refresh();
            }
        });
    }, [data, router]);

    // Helper: get schedules for a church grouped by week
    const getScheduleForWeek = (church: ChurchUnit, week: WeekNumber): WeeklySchedule[] => {
        return (church.weeklySchedules || []).filter(s => s.week === week);
    };

    // Schedule handlers
    const openScheduleModal = (churchId: string, editingIndex: number | null = null) => {
        setScheduleModal({ open: true, churchId, editingIndex });
        if (editingIndex !== null) {
            const church = data.churches.find(c => c.id === churchId);
            if (church && church.weeklySchedules[editingIndex]) {
                const s = church.weeklySchedules[editingIndex];
                setScheduleForm({ week: s.week, day: s.day, time: s.time, bahasa: s.bahasa, notes: s.notes || "", date: s.date || "" });
            }
        } else {
            setScheduleForm({ week: 1, day: "Sabtu", time: "", bahasa: "BahasaIndonesia", notes: "", date: "" });
        }
    };

    const handleScheduleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const slot: WeeklySchedule = {
            week: scheduleForm.week,
            day: scheduleForm.day,
            time: scheduleForm.time,
            bahasa: scheduleForm.bahasa,
            notes: scheduleForm.notes || undefined,
            date: scheduleForm.date || undefined,
        };
        const newData: JadwalMisaData = {
            ...data,
            churches: data.churches.map(c => {
                if (c.id !== scheduleModal.churchId) return c;
                let schedules: WeeklySchedule[];
                if (scheduleModal.editingIndex !== null) {
                    schedules = c.weeklySchedules.map((s, i) => i === scheduleModal.editingIndex ? slot : s);
                } else {
                    schedules = [...c.weeklySchedules, slot];
                }
                // Sort by week then day
                schedules.sort((a, b) => a.week - b.week || DAY_OPTIONS.indexOf(a.day) - DAY_OPTIONS.indexOf(b.day));
                return { ...c, weeklySchedules: schedules };
            })
        };
        setScheduleModal({ open: false, churchId: "", editingIndex: null });
        persistData(newData);
    };

    const handleDeleteSchedule = () => {
        if (!deleteTarget || deleteTarget.type !== "schedule") return;
        const { churchId, index } = deleteTarget;
        const newData: JadwalMisaData = {
            ...data,
            churches: data.churches.map(c => {
                if (c.id !== churchId) return c;
                return { ...c, weeklySchedules: c.weeklySchedules.filter((_, i) => i !== index) };
            })
        };
        setDeleteTarget(null);
        persistData(newData);
    };

    // Suspended toggle handler
    const toggleSuspended = (churchId: string, isSuspended: boolean) => {
        const newData: JadwalMisaData = {
            ...data,
            churches: data.churches.map(c =>
                c.id === churchId
                    ? { ...c, isSuspended, suspendedReason: isSuspended ? (c.suspendedReason || "") : undefined }
                    : c
            )
        };
        persistData(newData);
    };

    const updateSuspendedReason = (churchId: string, reason: string) => {
        setData(prev => ({
            ...prev,
            churches: prev.churches.map(c =>
                c.id === churchId ? { ...c, suspendedReason: reason } : c
            )
        }));
    };

    const saveSuspendedReason = (churchId: string) => {
        const church = data.churches.find(c => c.id === churchId);
        if (church) persistData(data);
    };

    // Special mass handlers
    const openSpecialModal = (editing: SpecialMassEvent | null = null) => {
        setSpecialModal({ open: true, editing });
        if (editing) {
            setSpecialForm({ name: editing.name, time: editing.time, location: editing.location, description: editing.description || "" });
        } else {
            setSpecialForm({ name: "", time: "", location: "", description: "" });
        }
    };

    const handleSpecialSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const mass: SpecialMassEvent = {
            id: specialModal.editing?.id || uuidv4(),
            ...specialForm,
        };
        const newSpecials = specialModal.editing
            ? data.specialMasses.map(s => s.id === mass.id ? mass : s)
            : [...data.specialMasses, mass];
        setSpecialModal({ open: false, editing: null });
        persistData({ ...data, specialMasses: newSpecials });
    };

    const handleDeleteSpecial = () => {
        if (!deleteTarget || deleteTarget.type !== "special") return;
        const newSpecials = data.specialMasses.filter(s => s.id !== deleteTarget.id);
        setDeleteTarget(null);
        persistData({ ...data, specialMasses: newSpecials });
    };

    return (
        <div>
            <Tabs defaultValue="regular">
                <TabsList className="mb-6">
                    <TabsTrigger value="regular">Jadwal Rutin per Gereja</TabsTrigger>
                    <TabsTrigger value="special">Misa Khusus</TabsTrigger>
                </TabsList>

                {/* === TAB: REGULAR SCHEDULES === */}
                <TabsContent value="regular" className="space-y-4">
                    {data.churches.map((church) => {
                        const isExpanded = expandedChurch === church.id;
                        return (
                            <div key={church.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => setExpandedChurch(isExpanded ? null : church.id)}
                                    className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <Church className="h-5 w-5 text-slate-400" />
                                        <div>
                                            <div className="font-semibold text-slate-900 flex items-center gap-2">
                                                {church.name}
                                                {church.isSuspended && (
                                                    <Badge variant="destructive" className="text-xs">Ditiadakan</Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 text-sm text-slate-500">
                                                <MapPin className="h-3 w-3" />{church.location}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant="secondary">{church.weeklySchedules.length} jadwal</Badge>
                                        {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                                    </div>
                                </button>

                                {isExpanded && (
                                    <div className="border-t border-slate-200 p-5 space-y-6">
                                        {/* Suspended Toggle */}
                                        <div className="flex flex-col gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                                                    <Label htmlFor={`suspended-${church.id}`} className="font-medium text-slate-700">
                                                        Misa Ditiadakan
                                                    </Label>
                                                </div>
                                                <Switch
                                                    id={`suspended-${church.id}`}
                                                    checked={!!church.isSuspended}
                                                    onCheckedChange={(checked) => toggleSuspended(church.id, checked)}
                                                />
                                            </div>
                                            {church.isSuspended && (
                                                <div className="space-y-2">
                                                    <Label htmlFor={`reason-${church.id}`} className="text-sm text-slate-500">Alasan</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            id={`reason-${church.id}`}
                                                            value={church.suspendedReason || ""}
                                                            onChange={(e) => updateSuspendedReason(church.id, e.target.value)}
                                                            placeholder="Contoh: Pembangunan gereja"
                                                            className="flex-1"
                                                        />
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => saveSuspendedReason(church.id)}
                                                        >
                                                            Simpan
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* 5-Week Grid */}
                                        <div>
                                            <h4 className="font-semibold text-slate-700 mb-3">Jadwal per Minggu</h4>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm border-collapse">
                                                    <thead>
                                                        <tr className="bg-slate-50">
                                                            {WEEK_LABELS.map((label, i) => (
                                                                <th key={i} className="px-3 py-2 text-left text-xs uppercase text-slate-500 font-semibold border border-slate-200 min-w-[140px]">
                                                                    {label}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            {WEEK_NUMBERS.map((week) => {
                                                                const slots = getScheduleForWeek(church, week);
                                                                return (
                                                                    <td key={week} className="px-3 py-3 border border-slate-200 align-top">
                                                                        {slots.length > 0 ? (
                                                                            <div className="space-y-2">
                                                                                {slots.map((slot, sIdx) => {
                                                                                    const globalIdx = church.weeklySchedules.indexOf(slot);
                                                                                    return (
                                                                                        <div key={sIdx} className="group relative bg-blue-50 rounded-lg p-2 border border-blue-100">
                                                                                            <div className="font-medium text-slate-800">{slot.day}</div>
                                                                                            <div className="text-brand-blue font-bold">{slot.time} WIB</div>
                                                                                            <Badge variant="outline" className="text-xs mt-1">{slot.bahasa}</Badge>
                                                                                            {slot.notes && (
                                                                                                <p className="text-xs text-slate-500 mt-1 italic">{slot.notes}</p>
                                                                                            )}
                                                                                            <div className="absolute top-1 right-1 hidden group-hover:flex gap-0.5">
                                                                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-blue-600"
                                                                                                    onClick={() => openScheduleModal(church.id, globalIdx)}>
                                                                                                    <Pencil className="h-3 w-3" />
                                                                                                </Button>
                                                                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-600"
                                                                                                    onClick={() => setDeleteTarget({ type: "schedule", churchId: church.id, index: globalIdx })}>
                                                                                                    <Trash2 className="h-3 w-3" />
                                                                                                </Button>
                                                                                            </div>
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        ) : (
                                                                            <span className="text-slate-300 text-xs">—</span>
                                                                        )}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <Button onClick={() => openScheduleModal(church.id)} size="sm" variant="outline" className="gap-2">
                                            <Plus className="h-4 w-4" />Tambah Jadwal
                                        </Button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </TabsContent>

                {/* === TAB: SPECIAL MASSES === */}
                <TabsContent value="special">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                            <span className="font-semibold text-slate-700">Misa Khusus</span>
                            <Button onClick={() => openSpecialModal()} size="sm" className="bg-blue-600 hover:bg-blue-700 gap-2">
                                <Plus className="h-4 w-4" />Tambah
                            </Button>
                        </div>
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                                <tr>
                                    <th className="px-6 py-3 text-left">Nama</th>
                                    <th className="px-6 py-3 text-left">Jam</th>
                                    <th className="px-6 py-3 text-left">Lokasi</th>
                                    <th className="px-6 py-3 text-left">Keterangan</th>
                                    <th className="px-6 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.specialMasses.length > 0 ? data.specialMasses.map((m) => (
                                    <tr key={m.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-3 font-medium">{m.name}</td>
                                        <td className="px-6 py-3 text-brand-blue font-semibold">{m.time}</td>
                                        <td className="px-6 py-3 text-slate-600">{m.location}</td>
                                        <td className="px-6 py-3 text-slate-500 line-clamp-1">{m.description}</td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600"
                                                    onClick={() => openSpecialModal(m)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600"
                                                    onClick={() => setDeleteTarget({ type: "special", id: m.id })}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Belum ada misa khusus</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Schedule Add/Edit Dialog */}
            <Dialog open={scheduleModal.open} onOpenChange={(open) => !open && setScheduleModal({ open: false, churchId: "", editingIndex: null })}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{scheduleModal.editingIndex !== null ? "Edit Jadwal Misa" : "Tambah Jadwal Misa"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleScheduleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Minggu ke-</Label>
                                <Select
                                    value={scheduleForm.week.toString()}
                                    onValueChange={(v) => setScheduleForm({ ...scheduleForm, week: parseInt(v) as WeekNumber })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {WEEK_NUMBERS.map(w => (
                                            <SelectItem key={w} value={w.toString()}>Minggu {w}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Hari</Label>
                                <Select
                                    value={scheduleForm.day}
                                    onValueChange={(v) => setScheduleForm({ ...scheduleForm, day: v })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {DAY_OPTIONS.map(d => (
                                            <SelectItem key={d} value={d}>{d}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="time">Jam Misa</Label>
                                <Input id="time" value={scheduleForm.time} required
                                    onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                                    placeholder="Contoh: 16.00" />
                            </div>
                            <div className="space-y-2">
                                <Label>Bahasa</Label>
                                <Select
                                    value={scheduleForm.bahasa}
                                    onValueChange={(v) => setScheduleForm({ ...scheduleForm, bahasa: v })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {BAHASA_OPTIONS.map(b => (
                                            <SelectItem key={b} value={b}>{b}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="schedule-date">Tanggal Spesifik <span className="text-xs text-slate-400 font-normal">(opsional)</span></Label>
                            <Input id="schedule-date" type="date" value={scheduleForm.date}
                                onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                            />
                            <p className="text-xs text-slate-400">Kosongkan jika jadwal berlaku rutin setiap bulan</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Keterangan Tambahan</Label>
                            <Textarea id="notes" value={scheduleForm.notes} rows={2}
                                onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                                placeholder="Keterangan opsional..." />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setScheduleModal({ open: false, churchId: "", editingIndex: null })}>Batal</Button>
                            <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700">
                                {isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Menyimpan...</> : "Simpan"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Special Mass Add/Edit Dialog */}
            <Dialog open={specialModal.open} onOpenChange={(open) => !open && setSpecialModal({ open: false, editing: null })}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{specialModal.editing ? "Edit Misa Khusus" : "Tambah Misa Khusus"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSpecialSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="sname">Nama Misa</Label>
                            <Input id="sname" value={specialForm.name} required
                                onChange={(e) => setSpecialForm({ ...specialForm, name: e.target.value })}
                                placeholder="Contoh: Misa Jumat Pertama" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="stime">Jam & Periode</Label>
                            <Input id="stime" value={specialForm.time} required
                                onChange={(e) => setSpecialForm({ ...specialForm, time: e.target.value })}
                                placeholder="Contoh: 18.30 WIB, setiap Jumat pertama" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slocation">Lokasi</Label>
                            <Input id="slocation" value={specialForm.location} required
                                onChange={(e) => setSpecialForm({ ...specialForm, location: e.target.value })}
                                placeholder="Contoh: Gereja Paroki" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sdescription">Deskripsi</Label>
                            <Textarea id="sdescription" value={specialForm.description} rows={3}
                                onChange={(e) => setSpecialForm({ ...specialForm, description: e.target.value })}
                                placeholder="Keterangan tambahan tentang misa ini..." />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setSpecialModal({ open: false, editing: null })}>Batal</Button>
                            <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700">
                                {isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Menyimpan...</> : "Simpan"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmations */}
            <ConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={deleteTarget?.type === "schedule" ? handleDeleteSchedule : handleDeleteSpecial}
                title="Hapus Jadwal"
                description="Apakah Anda yakin ingin menghapus jadwal ini? Tindakan ini tidak dapat dibatalkan."
                confirmText="Hapus"
                variant="destructive"
            />
        </div>
    );
}
