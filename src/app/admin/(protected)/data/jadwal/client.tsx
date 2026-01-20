"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { JadwalEvent, saveJadwalKegiatan } from "@/actions/data";
import { Plus, Pencil, Trash2, Search, Loader2, Calendar as CalendarIcon, Clock, MapPin } from "lucide-react";
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

export default function JadwalClient({ initialData, categories }: { initialData: JadwalEvent[], categories: string[] }) {
    const [data, setData] = useState<JadwalEvent[]>(initialData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingItem, setEditingItem] = useState<JadwalEvent | null>(null);
    const [isPending, startTransition] = useTransition();
    const [deleteTarget, setDeleteTarget] = useState<JadwalEvent | null>(null);
    const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
    const [pendingFormData, setPendingFormData] = useState<JadwalEvent | null>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [formValues, setFormValues] = useState({
        title: "",
        date: "",
        time: "",
        location: "",
        description: "",
        category: "",
        imageUrl: "",
        linkUrl: ""
    });
    const router = useRouter();

    // Sort by date descending
    const sortedData = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const filteredData = sortedData.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Check if form has changes compared to original
    const checkForChanges = useCallback(() => {
        if (!editingItem) {
            // For new items, check if required fields have content
            const hasContent = formValues.title.trim() !== "" || formValues.date !== "" || formValues.time !== "";
            setHasChanges(hasContent);
        } else {
            // For editing, compare with original
            const changed =
                formValues.title !== (editingItem.title || "") ||
                formValues.date !== (editingItem.date || "") ||
                formValues.time !== (editingItem.time || "") ||
                formValues.location !== (editingItem.location || "") ||
                formValues.description !== (editingItem.description || "") ||
                formValues.category !== (editingItem.category || "") ||
                formValues.imageUrl !== (editingItem.imageUrl || "") ||
                formValues.linkUrl !== (editingItem.linkUrl || "");
            setHasChanges(changed);
        }
    }, [formValues, editingItem]);

    useEffect(() => {
        checkForChanges();
    }, [checkForChanges]);

    // Reset form when modal opens
    useEffect(() => {
        if (isModalOpen) {
            if (editingItem) {
                setFormValues({
                    title: editingItem.title || "",
                    date: editingItem.date || "",
                    time: editingItem.time || "",
                    location: editingItem.location || "",
                    description: editingItem.description || "",
                    category: editingItem.category || "",
                    imageUrl: editingItem.imageUrl || "",
                    linkUrl: editingItem.linkUrl || ""
                });
            } else {
                setFormValues({
                    title: "",
                    date: "",
                    time: "",
                    location: "",
                    description: "",
                    category: categories[0] || "",
                    imageUrl: "",
                    linkUrl: ""
                });
            }
            setHasChanges(false);
        }
    }, [isModalOpen, editingItem, categories]);

    const handleEdit = (item: JadwalEvent) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const id = deleteTarget.id;

        const newData = data.filter(item => item.id !== id);
        setData(newData);
        setDeleteTarget(null);

        startTransition(async () => {
            const result = await saveJadwalKegiatan(newData);
            if (!result.success) {
                toast.error("Gagal menyimpan perubahan: " + result.error);
                setData(data); // Revert
            } else {
                toast.success("Kegiatan berhasil dihapus!");
                router.refresh();
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const newItem: JadwalEvent = {
            id: editingItem?.id || uuidv4(),
            title: formValues.title,
            date: formValues.date,
            time: formValues.time,
            location: formValues.location,
            description: formValues.description,
            category: formValues.category as any,
            imageUrl: formValues.imageUrl,
            linkUrl: formValues.linkUrl,
        };

        // Show confirmation modal
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
            const result = await saveJadwalKegiatan(newData);
            if (!result.success) {
                toast.error("Gagal menyimpan perubahan: " + result.error);
                setData(data); // Revert
            } else {
                toast.success(editingItem ? "Kegiatan berhasil diperbarui!" : "Kegiatan berhasil ditambahkan!");
                router.refresh();
            }
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            {/* Header Actions */}
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        type="text"
                        placeholder="Cari Kegiatan..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button
                    onClick={() => {
                        setEditingItem(null);
                        setIsModalOpen(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Kegiatan
                </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-700 font-medium uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3">Tanggal & Waktu</th>
                            <th className="px-6 py-3">Kegiatan</th>
                            <th className="px-6 py-3">Lokasi</th>
                            <th className="px-6 py-3">Kategori</th>
                            <th className="px-6 py-3 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {filteredData.length > 0 ? (
                            filteredData.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-slate-900 flex items-center gap-2">
                                            <CalendarIcon className="h-3 w-3 text-slate-400" />
                                            {new Date(item.date).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                        <div className="text-slate-500 text-xs mt-1 flex items-center gap-2">
                                            <Clock className="h-3 w-3" />
                                            {item.time}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{item.title}</div>
                                        <div className="text-slate-500 text-xs line-clamp-1">{item.description}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3 text-slate-400" />
                                            {item.location}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded text-xs font-medium border bg-slate-50 text-slate-700 border-slate-100">
                                            {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(item)}
                                                className="h-8 w-8 text-slate-500 hover:text-blue-600"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setDeleteTarget(item)}
                                                className="h-8 w-8 text-slate-500 hover:text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                    {searchTerm ? "Tidak ada hasil pencarian" : "Belum ada agenda kegiatan"}
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
                        <DialogTitle>
                            {editingItem ? "Edit Kegiatan" : "Tambah Kegiatan Baru"}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Nama Kegiatan</Label>
                            <Input
                                id="title"
                                value={formValues.title}
                                onChange={(e) => setFormValues({ ...formValues, title: e.target.value })}
                                required
                                placeholder="Contoh: Rapat Dewan Paroki"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date">Tanggal</Label>
                                <Input
                                    type="date"
                                    id="date"
                                    value={formValues.date}
                                    onChange={(e) => setFormValues({ ...formValues, date: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="time">Waktu</Label>
                                <Input
                                    type="time"
                                    id="time"
                                    value={formValues.time}
                                    onChange={(e) => setFormValues({ ...formValues, time: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="location">Lokasi</Label>
                                <Input
                                    id="location"
                                    value={formValues.location}
                                    onChange={(e) => setFormValues({ ...formValues, location: e.target.value })}
                                    required
                                    placeholder="Tempat kegiatan"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Kategori</Label>
                                <Select
                                    value={formValues.category}
                                    onValueChange={(val) => setFormValues({ ...formValues, category: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {cat}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="imageUrl">Link Gambar (URL)</Label>
                                <Input
                                    id="imageUrl"
                                    value={formValues.imageUrl}
                                    onChange={(e) => setFormValues({ ...formValues, imageUrl: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="linkUrl">Link Eksternal (URL)</Label>
                                <Input
                                    id="linkUrl"
                                    value={formValues.linkUrl}
                                    onChange={(e) => setFormValues({ ...formValues, linkUrl: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Deskripsi</Label>
                            <Textarea
                                id="description"
                                value={formValues.description}
                                onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                                rows={3}
                                placeholder="Keterangan tambahan..."
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={isPending || !hasChanges}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    "Simpan"
                                )}
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
                title="Hapus Kegiatan"
                description={`Apakah Anda yakin ingin menghapus "${deleteTarget?.title}"? Tindakan ini tidak dapat dibatalkan.`}
                confirmText="Hapus"
                variant="destructive"
            />

            {/* Save Confirmation */}
            <ConfirmModal
                isOpen={saveConfirmOpen}
                onClose={() => {
                    setSaveConfirmOpen(false);
                    setPendingFormData(null);
                }}
                onConfirm={handleConfirmSave}
                title={editingItem ? "Simpan Perubahan" : "Tambah Kegiatan"}
                description={editingItem
                    ? `Apakah Anda yakin ingin menyimpan perubahan pada "${pendingFormData?.title}"?`
                    : `Apakah Anda yakin ingin menambahkan kegiatan "${pendingFormData?.title}"?`
                }
                confirmText="Simpan"
                loading={isPending}
            />
        </div>
    );
}
