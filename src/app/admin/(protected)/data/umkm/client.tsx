"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { UMKMData, saveUMKM } from "@/actions/data";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
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

export default function UMKMClient({ initialData, categories }: { initialData: UMKMData[], categories: string[] }) {
    const [data, setData] = useState<UMKMData[]>(initialData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingItem, setEditingItem] = useState<UMKMData | null>(null);
    const [isPending, startTransition] = useTransition();
    const [deleteTarget, setDeleteTarget] = useState<UMKMData | null>(null);
    const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
    const [pendingFormData, setPendingFormData] = useState<UMKMData | null>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [formValues, setFormValues] = useState({
        businessName: "",
        owner: "",
        type: "",
        address: "",
        phone: "",
        description: ""
    });
    const router = useRouter();

    const filteredData = data.filter(item =>
        item.businessName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Check if form has changes compared to original
    const checkForChanges = useCallback(() => {
        if (!editingItem) {
            // For new items, check if any field has content
            const hasContent = Object.values(formValues).some(v => v.trim() !== "");
            setHasChanges(hasContent);
        } else {
            // For editing, compare with original
            const changed =
                formValues.businessName !== (editingItem.businessName || "") ||
                formValues.owner !== (editingItem.owner || "") ||
                formValues.type !== (editingItem.type || "") ||
                formValues.address !== (editingItem.address || "") ||
                formValues.phone !== (editingItem.phone || "") ||
                formValues.description !== (editingItem.description || "");
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
                    businessName: editingItem.businessName || "",
                    owner: editingItem.owner || "",
                    type: editingItem.type || "",
                    address: editingItem.address || "",
                    phone: editingItem.phone || "",
                    description: editingItem.description || ""
                });
            } else {
                setFormValues({
                    businessName: "",
                    owner: "",
                    type: categories[0] || "",
                    address: "",
                    phone: "",
                    description: ""
                });
            }
            setHasChanges(false);
        }
    }, [isModalOpen, editingItem, categories]);

    const handleEdit = (item: UMKMData) => {
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
            const result = await saveUMKM(newData);
            if (!result.success) {
                toast.error("Gagal menyimpan perubahan: " + result.error);
                setData(data); // Revert
            } else {
                toast.success("UMKM berhasil dihapus!");
                router.refresh();
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const newItem: UMKMData = {
            id: editingItem?.id || uuidv4(),
            businessName: formValues.businessName,
            owner: formValues.owner,
            type: formValues.type as any,
            address: formValues.address,
            phone: formValues.phone,
            description: formValues.description
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
            const result = await saveUMKM(newData);
            if (!result.success) {
                toast.error("Gagal menyimpan perubahan: " + result.error);
                setData(data); // Revert
            } else {
                toast.success(editingItem ? "UMKM berhasil diperbarui!" : "UMKM berhasil ditambahkan!");
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
                        placeholder="Cari UMKM..."
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
                    Tambah UMKM
                </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-700 font-medium uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3">Nama Usaha</th>
                            <th className="px-6 py-3">Pemilik</th>
                            <th className="px-6 py-3">Jenis</th>
                            <th className="px-6 py-3">Kontak</th>
                            <th className="px-6 py-3 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {filteredData.length > 0 ? (
                            filteredData.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">{item.businessName}</td>
                                    <td className="px-6 py-4 text-slate-600">{item.owner}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100 font-medium">
                                            {item.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{item.phone}</td>
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
                                    {searchTerm ? "Tidak ada hasil pencarian" : "Belum ada data UMKM"}
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
                            {editingItem ? "Edit UMKM" : "Tambah UMKM"}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="businessName">Nama Usaha</Label>
                            <Input
                                id="businessName"
                                value={formValues.businessName}
                                onChange={(e) => setFormValues({ ...formValues, businessName: e.target.value })}
                                required
                                placeholder="Nama Usaha"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="owner">Nama Pemilik</Label>
                                <Input
                                    id="owner"
                                    value={formValues.owner}
                                    onChange={(e) => setFormValues({ ...formValues, owner: e.target.value })}
                                    required
                                    placeholder="Nama Pemilik"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Jenis Usaha</Label>
                                <Select
                                    value={formValues.type}
                                    onValueChange={(val) => setFormValues({ ...formValues, type: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih jenis" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">No. Telp / HP</Label>
                            <Input
                                id="phone"
                                value={formValues.phone}
                                onChange={(e) => setFormValues({ ...formValues, phone: e.target.value })}
                                placeholder="08..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Alamat</Label>
                            <Textarea
                                id="address"
                                value={formValues.address}
                                onChange={(e) => setFormValues({ ...formValues, address: e.target.value })}
                                rows={2}
                                placeholder="Alamat lengkap usaha"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Keterangan Tambahan</Label>
                            <Textarea
                                id="description"
                                value={formValues.description}
                                onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                                rows={3}
                                placeholder="Deskripsi singkat produk/jasa..."
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
                title="Hapus UMKM"
                description={`Apakah Anda yakin ingin menghapus "${deleteTarget?.businessName}"? Tindakan ini tidak dapat dibatalkan.`}
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
                title={editingItem ? "Simpan Perubahan" : "Tambah Data"}
                description={editingItem
                    ? `Apakah Anda yakin ingin menyimpan perubahan pada "${pendingFormData?.businessName}"?`
                    : `Apakah Anda yakin ingin menambahkan "${pendingFormData?.businessName}"?`
                }
                confirmText="Simpan"
                loading={isPending}
            />
        </div>
    );
}
