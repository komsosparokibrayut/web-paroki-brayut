"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { Wilayah, Lingkungan, saveWilayahLingkungan } from "@/actions/data";
import { Plus, Pencil, Trash2, Search, ChevronDown, ChevronRight, User, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

type WilayahFormValues = {
    name: string;
    coordinator: string;
    address: string;
    email: string;
    phone: string;
};

type LingkunganFormValues = {
    name: string;
    chief: string;
    address: string;
    email: string;
    phone: string;
};

export default function WilayahClient({ initialData }: { initialData: Wilayah[] }) {
    const [data, setData] = useState<Wilayah[]>(initialData);
    const [isWilayahModalOpen, setIsWilayahModalOpen] = useState(false);
    const [isLingkunganModalOpen, setIsLingkunganModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // State for Wilayah Modal
    const [editingWilayah, setEditingWilayah] = useState<Wilayah | null>(null);
    const [wilayahFormValues, setWilayahFormValues] = useState<WilayahFormValues>({
        name: "", coordinator: "", address: "", email: "", phone: ""
    });
    const [hasWilayahChanges, setHasWilayahChanges] = useState(false);

    // State for Lingkungan Modal
    const [selectedWilayahId, setSelectedWilayahId] = useState<string | null>(null);
    const [editingLingkungan, setEditingLingkungan] = useState<Lingkungan | null>(null);
    const [lingkunganFormValues, setLingkunganFormValues] = useState<LingkunganFormValues>({
        name: "", chief: "", address: "", email: "", phone: ""
    });
    const [hasLingkunganChanges, setHasLingkunganChanges] = useState(false);

    // Expanded Wilayah State
    const [expandedWilayah, setExpandedWilayah] = useState<Set<string>>(new Set());

    // Confirmation Modal States
    const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'wilayah' | 'lingkungan', id: string, name: string, parentId?: string } | null>(null);
    const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
    const [pendingData, setPendingData] = useState<{ type: 'wilayah' | 'lingkungan', item: Wilayah | Lingkungan, name: string } | null>(null);

    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const filteredData = data.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.coordinator.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Check Wilayah form changes
    const checkWilayahChanges = useCallback(() => {
        if (!editingWilayah) {
            const hasContent = wilayahFormValues.name.trim() !== "";
            setHasWilayahChanges(hasContent);
        } else {
            const changed =
                wilayahFormValues.name !== (editingWilayah.name || "") ||
                wilayahFormValues.coordinator !== (editingWilayah.coordinator || "") ||
                wilayahFormValues.address !== (editingWilayah.address || "") ||
                wilayahFormValues.email !== (editingWilayah.email || "") ||
                wilayahFormValues.phone !== (editingWilayah.phone || "");
            setHasWilayahChanges(changed);
        }
    }, [wilayahFormValues, editingWilayah]);

    // Check Lingkungan form changes
    const checkLingkunganChanges = useCallback(() => {
        if (!editingLingkungan) {
            const hasContent = lingkunganFormValues.name.trim() !== "";
            setHasLingkunganChanges(hasContent);
        } else {
            const changed =
                lingkunganFormValues.name !== (editingLingkungan.name || "") ||
                lingkunganFormValues.chief !== (editingLingkungan.chief || "") ||
                lingkunganFormValues.address !== (editingLingkungan.address || "") ||
                lingkunganFormValues.email !== (editingLingkungan.email || "") ||
                lingkunganFormValues.phone !== (editingLingkungan.phone || "");
            setHasLingkunganChanges(changed);
        }
    }, [lingkunganFormValues, editingLingkungan]);

    useEffect(() => { checkWilayahChanges(); }, [checkWilayahChanges]);
    useEffect(() => { checkLingkunganChanges(); }, [checkLingkunganChanges]);

    // Reset Wilayah form when modal opens
    useEffect(() => {
        if (isWilayahModalOpen) {
            if (editingWilayah) {
                setWilayahFormValues({
                    name: editingWilayah.name || "",
                    coordinator: editingWilayah.coordinator || "",
                    address: editingWilayah.address || "",
                    email: editingWilayah.email || "",
                    phone: editingWilayah.phone || ""
                });
            } else {
                setWilayahFormValues({ name: "", coordinator: "", address: "", email: "", phone: "" });
            }
            setHasWilayahChanges(false);
        }
    }, [isWilayahModalOpen, editingWilayah]);

    // Reset Lingkungan form when modal opens
    useEffect(() => {
        if (isLingkunganModalOpen) {
            if (editingLingkungan) {
                setLingkunganFormValues({
                    name: editingLingkungan.name || "",
                    chief: editingLingkungan.chief || "",
                    address: editingLingkungan.address || "",
                    email: editingLingkungan.email || "",
                    phone: editingLingkungan.phone || ""
                });
            } else {
                setLingkunganFormValues({ name: "", chief: "", address: "", email: "", phone: "" });
            }
            setHasLingkunganChanges(false);
        }
    }, [isLingkunganModalOpen, editingLingkungan]);

    const toggleExpand = (id: string) => {
        const newExpanded = new Set(expandedWilayah);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedWilayah(newExpanded);
    };

    // Wilayah Handlers
    const handleAddWilayah = () => {
        setEditingWilayah(null);
        setIsWilayahModalOpen(true);
    };

    const handleEditWilayah = (item: Wilayah) => {
        setEditingWilayah(item);
        setIsWilayahModalOpen(true);
    };

    const handleDeleteWilayah = async () => {
        if (!deleteConfirm || deleteConfirm.type !== 'wilayah') return;

        const newData = data.filter(item => item.id !== deleteConfirm.id);
        setData(newData);
        setDeleteConfirm(null);
        saveData(newData, "Wilayah berhasil dihapus!");
    };

    const handleSubmitWilayah = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const newItem: Wilayah = {
            id: editingWilayah?.id || uuidv4(),
            name: wilayahFormValues.name,
            coordinator: wilayahFormValues.coordinator,
            address: wilayahFormValues.address,
            email: wilayahFormValues.email,
            phone: wilayahFormValues.phone,
            lingkungan: editingWilayah?.lingkungan || []
        };

        setPendingData({ type: 'wilayah', item: newItem, name: newItem.name });
        setSaveConfirmOpen(true);
    };

    const handleConfirmSaveWilayah = () => {
        if (!pendingData || pendingData.type !== 'wilayah') return;
        const newItem = pendingData.item as Wilayah;

        const newData = editingWilayah
            ? data.map(item => item.id === newItem.id ? newItem : item)
            : [...data, newItem];

        setData(newData);
        setIsWilayahModalOpen(false);
        setSaveConfirmOpen(false);
        setPendingData(null);
        saveData(newData, editingWilayah ? "Wilayah berhasil diperbarui!" : "Wilayah berhasil ditambahkan!");
    };

    // Lingkungan Handlers
    const handleAddLingkungan = (wilayahId: string) => {
        setSelectedWilayahId(wilayahId);
        setEditingLingkungan(null);
        setIsLingkunganModalOpen(true);
    };

    const handleEditLingkungan = (wilayahId: string, lingkungan: Lingkungan) => {
        setSelectedWilayahId(wilayahId);
        setEditingLingkungan(lingkungan);
        setIsLingkunganModalOpen(true);
    };

    const handleDeleteLingkungan = async () => {
        if (!deleteConfirm || deleteConfirm.type !== 'lingkungan') return;

        const newData = data.map(w => {
            if (w.id === deleteConfirm.parentId) {
                return { ...w, lingkungan: w.lingkungan.filter(l => l.id !== deleteConfirm.id) };
            }
            return w;
        });

        setData(newData);
        setDeleteConfirm(null);
        saveData(newData, "Lingkungan berhasil dihapus!");
    };

    const handleSubmitLingkungan = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const newItem: Lingkungan = {
            id: editingLingkungan?.id || uuidv4(),
            name: lingkunganFormValues.name,
            chief: lingkunganFormValues.chief,
            address: lingkunganFormValues.address,
            email: lingkunganFormValues.email,
            phone: lingkunganFormValues.phone,
        };

        setPendingData({ type: 'lingkungan', item: newItem, name: newItem.name });
        setSaveConfirmOpen(true);
    };

    const handleConfirmSaveLingkungan = () => {
        if (!pendingData || pendingData.type !== 'lingkungan' || !selectedWilayahId) return;
        const newItem = pendingData.item as Lingkungan;

        const newData = data.map(w => {
            if (w.id === selectedWilayahId) {
                const newLingkungan = editingLingkungan
                    ? w.lingkungan.map(l => l.id === newItem.id ? newItem : l)
                    : [...w.lingkungan, newItem];
                return { ...w, lingkungan: newLingkungan };
            }
            return w;
        });

        setData(newData);
        setIsLingkunganModalOpen(false);
        setSaveConfirmOpen(false);
        setPendingData(null);
        saveData(newData, editingLingkungan ? "Lingkungan berhasil diperbarui!" : "Lingkungan berhasil ditambahkan!");
    };

    const handleConfirmSave = () => {
        if (!pendingData) return;
        if (pendingData.type === 'wilayah') {
            handleConfirmSaveWilayah();
        } else {
            handleConfirmSaveLingkungan();
        }
    };

    const saveData = (newData: Wilayah[], action?: string) => {
        startTransition(async () => {
            const result = await saveWilayahLingkungan(newData);
            if (!result.success) {
                toast.error("Gagal menyimpan: " + result.error);
                router.refresh();
            } else {
                if (action) toast.success(action);
                router.refresh();
            }
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            {/* Header Actions */}
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        type="text"
                        placeholder="Cari Wilayah / Koordinator..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button onClick={handleAddWilayah} className="bg-blue-600 hover:bg-blue-700 gap-2">
                    <Plus className="h-4 w-4" />
                    Tambah Wilayah
                </Button>
            </div>

            {/* List */}
            <div className="divide-y divide-slate-200">
                {filteredData.length > 0 ? (
                    filteredData.map((wilayah) => (
                        <div key={wilayah.id} className="bg-white">
                            {/* Wilayah Row */}
                            <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => toggleExpand(wilayah.id)}>
                                    <button className="text-slate-400 hover:text-blue-600">
                                        {expandedWilayah.has(wilayah.id) ? (
                                            <ChevronDown className="h-5 w-5" />
                                        ) : (
                                            <ChevronRight className="h-5 w-5" />
                                        )}
                                    </button>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">{wilayah.name}</h3>
                                        <div className="flex items-center gap-1 text-sm text-slate-500">
                                            <User className="h-3 w-3" />
                                            <span>Koord: {wilayah.coordinator}</span>
                                            <span className="mx-1">•</span>
                                            <span>{wilayah.lingkungan.length} Lingkungan</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleAddLingkungan(wilayah.id)}
                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1"
                                    >
                                        <Plus className="h-4 w-4" />
                                        <span className="hidden sm:inline">Lingkungan</span>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEditWilayah(wilayah)}
                                        className="text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setDeleteConfirm({ type: 'wilayah', id: wilayah.id, name: wilayah.name })}
                                        className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Lingkungan List (Collapsible) */}
                            {expandedWilayah.has(wilayah.id) && (
                                <div className="bg-slate-50 border-t border-slate-100 pl-12 pr-4 py-2">
                                    {wilayah.lingkungan.length > 0 ? (
                                        <div className="divide-y divide-slate-200/50">
                                            {wilayah.lingkungan.map((lingkungan) => (
                                                <div key={lingkungan.id} className="py-2.5 flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-slate-800 text-sm">{lingkungan.name}</p>
                                                        {lingkungan.chief && (
                                                            <p className="text-xs text-slate-500">Ketua: {lingkungan.chief}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleEditLingkungan(wilayah.id, lingkungan)}
                                                            className="h-7 w-7 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setDeleteConfirm({ type: 'lingkungan', id: lingkungan.id, name: lingkungan.name, parentId: wilayah.id })}
                                                            className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="py-4 text-center text-sm text-slate-400">Belum ada lingkungan</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="p-12 text-center text-slate-500">
                        {searchTerm ? "Tidak ada hasil pencarian" : "Belum ada data Wilayah"}
                    </div>
                )}
            </div>

            {/* Wilayah Modal */}
            <Dialog open={isWilayahModalOpen} onOpenChange={setIsWilayahModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingWilayah ? "Edit Wilayah" : "Tambah Wilayah"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmitWilayah} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Wilayah</Label>
                            <Input
                                id="name"
                                value={wilayahFormValues.name}
                                onChange={(e) => setWilayahFormValues({ ...wilayahFormValues, name: e.target.value })}
                                required
                                placeholder="Contoh: Wilayah I"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="coordinator">Ketua Wilayah</Label>
                            <Input
                                id="coordinator"
                                value={wilayahFormValues.coordinator}
                                onChange={(e) => setWilayahFormValues({ ...wilayahFormValues, coordinator: e.target.value })}
                                placeholder="Nama Ketua Wilayah"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Alamat (Opsional)</Label>
                            <Textarea
                                id="address"
                                value={wilayahFormValues.address}
                                onChange={(e) => setWilayahFormValues({ ...wilayahFormValues, address: e.target.value })}
                                placeholder="Alamat lengkap..."
                                rows={2}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email (Opsional)</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={wilayahFormValues.email}
                                    onChange={(e) => setWilayahFormValues({ ...wilayahFormValues, email: e.target.value })}
                                    placeholder="email@contoh.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">No. HP (Opsional)</Label>
                                <Input
                                    id="phone"
                                    value={wilayahFormValues.phone}
                                    onChange={(e) => setWilayahFormValues({ ...wilayahFormValues, phone: e.target.value })}
                                    placeholder="08..."
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsWilayahModalOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={isPending || !hasWilayahChanges} className="bg-blue-600 hover:bg-blue-700">
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

            {/* Lingkungan Modal */}
            <Dialog open={isLingkunganModalOpen} onOpenChange={setIsLingkunganModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingLingkungan ? "Edit Lingkungan" : "Tambah Lingkungan"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmitLingkungan} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="ling-name">Nama Lingkungan</Label>
                            <Input
                                id="ling-name"
                                value={lingkunganFormValues.name}
                                onChange={(e) => setLingkunganFormValues({ ...lingkunganFormValues, name: e.target.value })}
                                required
                                placeholder="Contoh: Lingkungan St. Petrus"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="chief">Ketua Lingkungan</Label>
                            <Input
                                id="chief"
                                value={lingkunganFormValues.chief}
                                onChange={(e) => setLingkunganFormValues({ ...lingkunganFormValues, chief: e.target.value })}
                                placeholder="Nama Ketua Lingkungan"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ling-address">Alamat (Opsional)</Label>
                            <Textarea
                                id="ling-address"
                                value={lingkunganFormValues.address}
                                onChange={(e) => setLingkunganFormValues({ ...lingkunganFormValues, address: e.target.value })}
                                placeholder="Alamat lengkap..."
                                rows={2}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="ling-email">Email (Opsional)</Label>
                                <Input
                                    id="ling-email"
                                    type="email"
                                    value={lingkunganFormValues.email}
                                    onChange={(e) => setLingkunganFormValues({ ...lingkunganFormValues, email: e.target.value })}
                                    placeholder="email@contoh.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ling-phone">No. HP (Opsional)</Label>
                                <Input
                                    id="ling-phone"
                                    value={lingkunganFormValues.phone}
                                    onChange={(e) => setLingkunganFormValues({ ...lingkunganFormValues, phone: e.target.value })}
                                    placeholder="08..."
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsLingkunganModalOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={isPending || !hasLingkunganChanges} className="bg-blue-600 hover:bg-blue-700">
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

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={deleteConfirm?.type === 'wilayah' ? handleDeleteWilayah : handleDeleteLingkungan}
                title={`Hapus ${deleteConfirm?.type === 'wilayah' ? 'Wilayah' : 'Lingkungan'}`}
                description={deleteConfirm?.type === 'wilayah'
                    ? `Hapus "${deleteConfirm?.name}"? Semua lingkungan di dalamnya juga akan terhapus.`
                    : `Hapus "${deleteConfirm?.name}"? Data ini tidak dapat dikembalikan.`
                }
                loading={isPending}
                confirmText="Hapus"
                variant="destructive"
            />

            {/* Save Confirmation Modal */}
            <ConfirmModal
                isOpen={saveConfirmOpen}
                onClose={() => {
                    setSaveConfirmOpen(false);
                    setPendingData(null);
                }}
                onConfirm={handleConfirmSave}
                title={pendingData?.type === 'wilayah'
                    ? (editingWilayah ? "Simpan Perubahan Wilayah" : "Tambah Wilayah")
                    : (editingLingkungan ? "Simpan Perubahan Lingkungan" : "Tambah Lingkungan")
                }
                description={`Apakah Anda yakin ingin menyimpan "${pendingData?.name}"?`}
                confirmText="Simpan"
                loading={isPending}
            />
        </div>
    );
}
