"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { Formulir, saveFormulir } from "@/actions/data";
import { Plus, Pencil, Trash2, Search, Loader2, FileText, Link as LinkIcon } from "lucide-react";
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

export default function FormulirClient({ initialData, categories }: { initialData: Formulir[], categories: string[] }) {
    const [data, setData] = useState<Formulir[]>(initialData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingItem, setEditingItem] = useState<Formulir | null>(null);
    const [isPending, startTransition] = useTransition();
    const [deleteTarget, setDeleteTarget] = useState<Formulir | null>(null);
    const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
    const [pendingFormData, setPendingFormData] = useState<Formulir | null>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [formValues, setFormValues] = useState({
        title: "",
        url: "",
        description: "",
        category: ""
    });
    const router = useRouter();

    const filteredData = data.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Check if form has changes compared to original
    const checkForChanges = useCallback(() => {
        if (!editingItem) {
            // For new items, check if required fields have content
            const hasContent = formValues.title.trim() !== "" || formValues.url.trim() !== "";
            setHasChanges(hasContent);
        } else {
            // For editing, compare with original
            const changed =
                formValues.title !== (editingItem.title || "") ||
                formValues.url !== (editingItem.url || "") ||
                formValues.description !== (editingItem.description || "") ||
                formValues.category !== (editingItem.category || "");
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
                    url: editingItem.url || "",
                    description: editingItem.description || "",
                    category: editingItem.category || ""
                });
            } else {
                setFormValues({
                    title: "",
                    url: "",
                    description: "",
                    category: categories[0] || ""
                });
            }
            setHasChanges(false);
        }
    }, [isModalOpen, editingItem, categories]);

    const handleEdit = (item: Formulir) => {
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
            const result = await saveFormulir(newData);
            if (!result.success) {
                toast.error("Gagal menyimpan perubahan: " + result.error);
                setData(data); // Revert
            } else {
                toast.success("Formulir berhasil dihapus!");
                router.refresh();
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const newItem: Formulir = {
            id: editingItem?.id || uuidv4(),
            title: formValues.title,
            url: formValues.url,
            description: formValues.description,
            category: formValues.category as any,
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
            const result = await saveFormulir(newData);
            if (!result.success) {
                toast.error("Gagal menyimpan perubahan: " + result.error);
                setData(data); // Revert
            } else {
                toast.success(editingItem ? "Formulir berhasil diperbarui!" : "Formulir berhasil ditambahkan!");
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
                        placeholder="Cari Formulir..."
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
                    Tambah Formulir
                </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-700 font-medium uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3">Nama Formulir</th>
                            <th className="px-6 py-3">Kategori</th>
                            <th className="px-6 py-3">Keterangan</th>
                            <th className="px-6 py-3 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {filteredData.length > 0 ? (
                            filteredData.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg mt-0.5">
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-900">{item.title}</div>
                                                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-0.5">
                                                    <LinkIcon className="h-3 w-3" />
                                                    {item.url}
                                                </a>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded text-xs font-medium border bg-slate-50 text-slate-600 border-slate-200">
                                            {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={item.description}>
                                        {item.description || "-"}
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
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                    {searchTerm ? "Tidak ada hasil pencarian" : "Belum ada formulir"}
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
                            {editingItem ? "Edit Formulir" : "Tambah Formulir"}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Judul Formulir</Label>
                            <Input
                                id="title"
                                value={formValues.title}
                                onChange={(e) => setFormValues({ ...formValues, title: e.target.value })}
                                required
                                placeholder="Contoh: Formulir Pendaftaran Baptis"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="url">Link / URL</Label>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    id="url"
                                    value={formValues.url}
                                    onChange={(e) => setFormValues({ ...formValues, url: e.target.value })}
                                    required
                                    className="pl-10"
                                    placeholder="https://..."
                                />
                            </div>
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

                        <div className="space-y-2">
                            <Label htmlFor="description">Keterangan</Label>
                            <Textarea
                                id="description"
                                value={formValues.description}
                                onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                                rows={3}
                                placeholder="Deskripsi singkat formulir..."
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
                title="Hapus Formulir"
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
                title={editingItem ? "Simpan Perubahan" : "Tambah Formulir"}
                description={editingItem
                    ? `Apakah Anda yakin ingin menyimpan perubahan pada "${pendingFormData?.title}"?`
                    : `Apakah Anda yakin ingin menambahkan formulir "${pendingFormData?.title}"?`
                }
                confirmText="Simpan"
                loading={isPending}
            />
        </div>
    );
}
