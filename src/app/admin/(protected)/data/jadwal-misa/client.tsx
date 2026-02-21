"use client";

import { useState, useTransition, useCallback } from "react";
import { saveJadwalMisa } from "@/features/schedule/actions";
import { JadwalMisaData, ChurchUnit, MassTimeSlot, SpecialMassEvent } from "@/features/schedule/types";
import {
    Plus, Pencil, Trash2, Loader2, MapPin,
    Church, Tag, ChevronDown, ChevronUp
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



interface ScheduleForm {
    day: string;
    times: string; // comma-separated
    kategori: string;
    notes: string;
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
    const [scheduleModal, setScheduleModal] = useState<{ open: boolean; churchId: string; editing: MassTimeSlot | null }>({ open: false, churchId: "", editing: null });
    const [specialModal, setSpecialModal] = useState<{ open: boolean; editing: SpecialMassEvent | null }>({ open: false, editing: null });
    const [deleteTarget, setDeleteTarget] = useState<{ type: "schedule"; churchId: string; scheduleId: string } | { type: "special"; id: string } | null>(null);
    const [scheduleForm, setScheduleForm] = useState<ScheduleForm>({ day: "", times: "", kategori: "", notes: "" });
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

    // Schedule handlers
    const openScheduleModal = (churchId: string, editing: MassTimeSlot | null = null) => {
        setScheduleModal({ open: true, churchId, editing });
        if (editing) {
            setScheduleForm({ day: editing.day, times: editing.times.join(", "), kategori: editing.kategori || "", notes: editing.notes || "" });
        } else {
            setScheduleForm({ day: "", times: "", kategori: "", notes: "" });
        }
    };

    const handleScheduleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const times = scheduleForm.times.split(",").map(t => t.trim()).filter(Boolean);
        const slot: MassTimeSlot = {
            day: scheduleForm.day,
            times,
            kategori: scheduleForm.kategori || undefined,
            notes: scheduleForm.notes || undefined,
        };
        const newData: JadwalMisaData = {
            ...data,
            churches: data.churches.map(c => {
                if (c.id !== scheduleModal.churchId) return c;
                const schedules = scheduleModal.editing
                    ? c.schedules.map((s, i) => s.day === scheduleModal.editing!.day && i === c.schedules.indexOf(scheduleModal.editing!) ? slot : s)
                    : [...c.schedules, slot];
                return { ...c, schedules };
            })
        };
        setScheduleModal({ open: false, churchId: "", editing: null });
        persistData(newData);
    };

    const handleDeleteSchedule = () => {
        if (!deleteTarget || deleteTarget.type !== "schedule") return;
        const { churchId, scheduleId } = deleteTarget;
        const newData: JadwalMisaData = {
            ...data,
            churches: data.churches.map(c => {
                if (c.id !== churchId) return c;
                const idx = parseInt(scheduleId);
                return { ...c, schedules: c.schedules.filter((_, i) => i !== idx) };
            })
        };
        setDeleteTarget(null);
        persistData(newData);
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
                                            <div className="font-semibold text-slate-900">{church.name}</div>
                                            <div className="flex items-center gap-1 text-sm text-slate-500">
                                                <MapPin className="h-3 w-3" />{church.location}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant="secondary">{church.schedules.length} jadwal</Badge>
                                        {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                                    </div>
                                </button>

                                {isExpanded && (
                                    <div className="border-t border-slate-200 p-5">
                                        <table className="w-full text-sm mb-4">
                                            <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                                                <tr>
                                                    <th className="px-4 py-2 text-left">Hari</th>
                                                    <th className="px-4 py-2 text-left">Jam</th>
                                                    <th className="px-4 py-2 text-left">Kategori</th>
                                                    <th className="px-4 py-2 text-left">Keterangan</th>
                                                    <th className="px-4 py-2 text-right">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {church.schedules.length > 0 ? church.schedules.map((s, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50">
                                                        <td className="px-4 py-3 font-medium">{s.day}</td>
                                                        <td className="px-4 py-3 text-brand-blue font-semibold">{s.times.join(", ")} WIB</td>
                                                        <td className="px-4 py-3">
                                                            {s.kategori ? (
                                                                <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                                                                    <Tag className="h-3 w-3" />{s.kategori}
                                                                </span>
                                                            ) : "—"}
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-500">{s.notes || "—"}</td>
                                                        <td className="px-4 py-3 text-right">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-blue-600"
                                                                    onClick={() => openScheduleModal(church.id, s)}>
                                                                    <Pencil className="h-3.5 w-3.5" />
                                                                </Button>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-red-600"
                                                                    onClick={() => setDeleteTarget({ type: "schedule", churchId: church.id, scheduleId: idx.toString() })}>
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-sm">
                                                            Belum ada jadwal. Klik tombol di bawah untuk menambahkan.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
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
            <Dialog open={scheduleModal.open} onOpenChange={(open) => !open && setScheduleModal({ open: false, churchId: "", editing: null })}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{scheduleModal.editing ? "Edit Jadwal Misa" : "Tambah Jadwal Misa"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleScheduleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="day">Hari / Periode</Label>
                            <Input id="day" value={scheduleForm.day} required
                                onChange={(e) => setScheduleForm({ ...scheduleForm, day: e.target.value })}
                                placeholder="Contoh: Minggu, Senin – Sabtu" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="times">Jam Misa</Label>
                            <Input id="times" value={scheduleForm.times} required
                                onChange={(e) => setScheduleForm({ ...scheduleForm, times: e.target.value })}
                                placeholder="06.00, 08.00, 17.00 (pisahkan dengan koma)" />
                            <p className="text-xs text-slate-400">Gunakan tanda koma untuk memisahkan beberapa jam</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="kategori">Kategori / Label</Label>
                            <Input id="kategori" value={scheduleForm.kategori}
                                onChange={(e) => setScheduleForm({ ...scheduleForm, kategori: e.target.value })}
                                placeholder="Contoh: Misa Minggu, Misa Harian" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Keterangan Tambahan</Label>
                            <Textarea id="notes" value={scheduleForm.notes} rows={2}
                                onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                                placeholder="Keterangan opsional..." />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setScheduleModal({ open: false, churchId: "", editing: null })}>Batal</Button>
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
