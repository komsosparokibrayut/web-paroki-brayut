"use client";

import { useState } from "react";
import { CategoryType, MasterCategoriesData, addCategory, deleteCategory, updateCategory } from "@/actions/master-categories";
import { Plus, Trash2, Pencil, Loader2, Save, X } from "lucide-react";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { toast } from "sonner";

interface CategoryManagerProps {
    initialData: MasterCategoriesData;
}

const SECTION_TITLES: Record<CategoryType, string> = {
    post: "Artikel & Berita",
    umkm: "UMKM",
    jadwal: "Jadwal Kegiatan",
    formulir: "Formulir Gereja"
};

export default function CategoryManager({ initialData }: CategoryManagerProps) {
    const [data, setData] = useState<MasterCategoriesData>(initialData);
    const [isProcessing, setIsProcessing] = useState(false);
    const [editingState, setEditingState] = useState<{ type: CategoryType; oldVal: string; newVal: string } | null>(null);
    const [newCategoryState, setNewCategoryState] = useState<{ type: CategoryType; val: string } | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ type: CategoryType; val: string } | null>(null);

    const handleAdd = async (type: CategoryType) => {
        if (!newCategoryState || !newCategoryState.val.trim()) return;

        const newVal = newCategoryState.val.trim();
        setIsProcessing(true);

        try {
            const result = await addCategory(type, newVal);
            if (result.success) {
                toast.success("Category added successfully!");
                setData(prev => ({
                    ...prev,
                    [type]: [...prev[type], newVal].sort()
                }));
                setNewCategoryState(null);
            } else {
                toast.error(result.error);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const { type, val } = deleteTarget;

        setIsProcessing(true);
        try {
            const result = await deleteCategory(type, val);
            if (result.success) {
                toast.success("Category deleted successfully!");
                setData(prev => ({
                    ...prev,
                    [type]: prev[type].filter(item => item !== val)
                }));
            } else {
                toast.error(result.error);
            }
            // Only close modal after operation completes
            setDeleteTarget(null);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUpdate = async () => {
        if (!editingState || !editingState.newVal.trim()) return;

        const { type, oldVal, newVal } = editingState;

        setIsProcessing(true);
        try {
            const result = await updateCategory(type, oldVal, newVal);
            if (result.success) {
                toast.success("Category updated successfully!");
                setData(prev => ({
                    ...prev,
                    [type]: prev[type].map(item => item === oldVal ? newVal : item).sort()
                }));
                setEditingState(null);
            } else {
                toast.error(result.error);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const renderSection = (type: CategoryType) => (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" key={type}>
            {/* Section header */}
            <div className="px-3 py-2.5 sm:p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">{SECTION_TITLES[type]}</h3>
                <span className="text-xs bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-500 font-medium">
                    {data[type].length}
                </span>
            </div>

            {/* Category list */}
            <div className="px-2 py-2 sm:p-4 space-y-1 max-h-[260px] overflow-y-auto">
                {data[type].map(item => (
                    <div
                        key={item}
                        className="flex justify-between items-center px-2 py-1.5 rounded-lg hover:bg-slate-50 group transition-colors border border-transparent hover:border-slate-100"
                    >
                        {editingState?.type === type && editingState.oldVal === item ? (
                            <div className="flex items-center gap-1.5 w-full">
                                <input
                                    value={editingState.newVal}
                                    onChange={(e) => setEditingState({ ...editingState, newVal: e.target.value })}
                                    className="flex-1 px-2 py-1 text-sm border border-blue-600 rounded outline-none min-w-0"
                                    autoFocus
                                    disabled={isProcessing}
                                />
                                <button onClick={handleUpdate} disabled={isProcessing} className="text-blue-600 hover:bg-blue-50 p-1 rounded shrink-0">
                                    <Save className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => setEditingState(null)} disabled={isProcessing} className="text-slate-400 hover:text-slate-600 p-1 rounded shrink-0">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <span className="text-sm font-medium text-slate-700 flex-1 min-w-0 truncate pr-1">{item}</span>
                                {/* Always visible on mobile (touch), hover-reveal on desktop */}
                                <div className="flex items-center gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setEditingState({ type, oldVal: item, newVal: item })}
                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => setDeleteTarget({ type, val: item })}
                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* Add new */}
            <div className="px-3 py-3 sm:p-4 border-t border-slate-100 bg-slate-50/30">
                {newCategoryState?.type === type ? (
                    <div className="flex gap-1.5">
                        <input
                            value={newCategoryState.val}
                            onChange={(e) => setNewCategoryState({ ...newCategoryState, val: e.target.value })}
                            placeholder="Kategori baru..."
                            className="flex-1 px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 min-w-0"
                            autoFocus
                            disabled={isProcessing}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd(type)}
                        />
                        <button
                            onClick={() => handleAdd(type)}
                            disabled={isProcessing || !newCategoryState.val.trim()}
                            className="px-2.5 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 shrink-0"
                        >
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={() => setNewCategoryState(null)}
                            disabled={isProcessing}
                            className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 shrink-0"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setNewCategoryState({ type, val: "" })}
                        className="w-full py-1.5 flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 border border-dashed border-slate-300 rounded-lg hover:border-blue-600 hover:text-blue-600 hover:bg-blue-600/5 transition-all"
                    >
                        <Plus className="w-3.5 h-3.5" /> Tambah
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 items-start">
                {renderSection("post")}
                {renderSection("umkm")}
                {renderSection("jadwal")}
                {renderSection("formulir")}
            </div>

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => !isProcessing && setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Hapus Kategori"
                description={`Apakah Anda yakin ingin menghapus kategori "${deleteTarget?.val}"? Tindakan ini tidak dapat dibatalkan.`}
                confirmText="Hapus"
                variant="destructive"
                loading={isProcessing}
            />
        </>
    );
}
