"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { saveGereja } from "@/features/gereja/actions";
import { GerejaUnit, GEREJA_KATEGORI } from "@/features/schedule/types";
import { Plus, Pencil, Trash2, Search, Loader2, MapPin, Church } from "lucide-react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import ConfirmModal from "@/components/admin/ConfirmModal";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function GerejaClient({ initialData }: { initialData: GerejaUnit[] }) {
    const [data, setData] = useState<GerejaUnit[]>(initialData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingItem, setEditingItem] = useState<GerejaUnit | null>(null);
    const [isPending, startTransition] = useTransition();
    const [deleteTarget, setDeleteTarget] = useState<GerejaUnit | null>(null);
    const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
    const [pendingFormData, setPendingFormData] = useState<GerejaUnit | null>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [formValues, setFormValues] = useState({
        name: "",
        description: "",
        alamat: "",
        kategori: "Gereja Wilayah" as GerejaUnit["kategori"],
        koordinat: "",
    });
    const router = useRouter();

    const filteredData = data.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.alamat.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const checkForChanges = useCallback(() => {
        if (!editingItem) {
            setHasChanges(formValues.name.trim() !== "");
        } else {
            const changed =
                formValues.name !== (editingItem.name || "") ||
                formValues.description !== (editingItem.description || "") ||
                formValues.alamat !== (editingItem.alamat || "") ||
                formValues.kategori !== (editingItem.kategori || "") ||
                formValues.koordinat !== (editingItem.koordinat || "");
            setHasChanges(changed);
        }
    }, [formValues, editingItem]);

    useEffect(() => { checkForChanges(); }, [checkForChanges]);

    useEffect(() => {
        if (isModalOpen) {
            if (editingItem) {
                setFormValues({
                    name: editingItem.name || "",
                    description: editingItem.description || "",
                    alamat: editingItem.alamat || "",
                    kategori: editingItem.kategori || "Gereja Wilayah",
                    koordinat: editingItem.koordinat || "",
                });
            } else {
                setFormValues({ name: "", description: "", alamat: "", kategori: "Gereja Wilayah", koordinat: "" });
            }
            setHasChanges(false);
        }
    }, [isModalOpen, editingItem]);

    const handleEdit = (item: GerejaUnit) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const newData = data.filter(item => item.id !== deleteTarget.id);
        setData(newData);
        setDeleteTarget(null);
        startTransition(async () => {
            const result = await saveGereja(newData);
            if (!result.success) {
                toast.error("Gagal menyimpan: " + (result as any).error);
                setData(data);
            } else {
                toast.success("Gereja berhasil dihapus!");
                router.refresh();
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const newItem: GerejaUnit = {
            id: editingItem?.id || uuidv4(),
            name: formValues.name,
            description: formValues.description,
            alamat: formValues.alamat,
            kategori: formValues.kategori,
            koordinat: formValues.koordinat,
            gallery: editingItem?.gallery || [],
        };
        setPendingFormData(newItem);
        setSaveConfirmOpen(true);
    };

    const handleConfirmSave = async () => {
        if (!pendingFormData) return;
        const newData = editingItem
            ? data.map(item => item.id === pendingFormData.id ? pendingFormData : item)
            : [...data, pendingFormData];
        setData(newData);
        setIsModalOpen(false);
        setEditingItem(null);
        setSaveConfirmOpen(false);
        setPendingFormData(null);
        startTransition(async () => {
            const result = await saveGereja(newData);
            if (!result.success) {
                toast.error("Gagal menyimpan: " + (result as any).error);
                setData(data);
            } else {
                toast.success(editingItem ? "Data gereja diperbarui!" : "Gereja berhasil ditambahkan!");
                router.refresh();
            }
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        type="text"
                        placeholder="Cari Gereja..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button
                    onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Gereja
                </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-700 font-medium uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3">Nama Gereja</th>
                            <th className="px-6 py-3">Alamat</th>
                            <th className="px-6 py-3">Kategori</th>
                            <th className="px-6 py-3">Link Google Maps</th>
                            <th className="px-6 py-3 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {filteredData.length > 0 ? (
                            filteredData.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900 flex items-center gap-2">
                                            <Church className="h-4 w-4 text-slate-400 shrink-0" />
                                            {item.name}
                                        </div>
                                        {item.description && (
                                            <div className="text-slate-500 text-xs line-clamp-1 mt-0.5 ml-6">{item.description}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        <div className="flex items-start gap-1">
                                            <MapPin className="h-3 w-3 text-slate-400 mt-0.5 shrink-0" />
                                            <span className="line-clamp-2">{item.alamat}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={item.kategori === "Gereja Paroki" ? "default" : "secondary"}>
                                            {item.kategori}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-xs font-mono max-w-[200px] truncate" title={item.koordinat || ""}>
                                        {item.koordinat || "—"}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}
                                                className="h-8 w-8 text-slate-500 hover:text-blue-600">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(item)}
                                                className="h-8 w-8 text-slate-500 hover:text-red-600">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                    {searchTerm ? "Tidak ada hasil pencarian" : "Belum ada data gereja"}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? "Edit Data Gereja" : "Tambah Gereja Baru"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Gereja</Label>
                            <Input id="name" value={formValues.name}
                                onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                                required placeholder="Contoh: Gereja St. Petrus Kayunan" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="kategori">Kategori</Label>
                            <Select value={formValues.kategori}
                                onValueChange={(val) => setFormValues({ ...formValues, kategori: val as GerejaUnit["kategori"] })}>
                                <SelectTrigger id="kategori">
                                    <SelectValue placeholder="Pilih kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    {GEREJA_KATEGORI.map(k => (
                                        <SelectItem key={k} value={k}>{k}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="alamat">Alamat</Label>
                            <Input id="alamat" value={formValues.alamat}
                                onChange={(e) => setFormValues({ ...formValues, alamat: e.target.value })}
                                required placeholder="Desa, Kecamatan, Kabupaten" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="koordinat">Link Google Maps</Label>
                            <Input id="koordinat" value={formValues.koordinat}
                                onChange={(e) => setFormValues({ ...formValues, koordinat: e.target.value })}
                                placeholder="https://maps.app.goo.gl/..." />
                            <p className="text-xs text-slate-500">Masukkan tautan bagikan (share link) dari Google Maps</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Deskripsi</Label>
                            <Textarea id="description" value={formValues.description}
                                onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                                rows={3} placeholder="Sejarah singkat atau keterangan gereja..." />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={isPending || !hasChanges} className="bg-blue-600 hover:bg-blue-700">
                                {isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Menyimpan...</> : "Simpan"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Hapus Gereja"
                description={`Apakah Anda yakin ingin menghapus "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
                confirmText="Hapus"
                variant="destructive"
            />

            {/* Save Confirmation */}
            <ConfirmModal
                isOpen={saveConfirmOpen}
                onClose={() => { setSaveConfirmOpen(false); setPendingFormData(null); }}
                onConfirm={handleConfirmSave}
                title={editingItem ? "Simpan Perubahan" : "Tambah Gereja"}
                description={editingItem
                    ? `Simpan perubahan pada "${pendingFormData?.name}"?`
                    : `Tambahkan gereja "${pendingFormData?.name}"?`}
                confirmText="Simpan"
                loading={isPending}
            />
        </div>
    );
}
