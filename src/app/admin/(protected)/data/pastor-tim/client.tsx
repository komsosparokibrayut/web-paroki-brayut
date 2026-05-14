"use client";

import { useState, useTransition } from "react";
import {
    PastorTimKerjaData, Pastor, SeksiOrganisasi, TimPelayanan, AnggotaTimKerja,
    savePastorTimKerja
} from "@/actions/data";
import {
    Plus, Pencil, Trash2, User, Users, Loader2,
    ChevronDown, ChevronRight, GripVertical, FolderPlus, UserPlus, ArrowUp, ArrowDown
} from "lucide-react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { useAdminRole } from "@/components/admin/AdminRoleProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatAuditDate } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function PastorTimClient({ initialData }: { initialData: PastorTimKerjaData }) {
    const [data, setData] = useState<PastorTimKerjaData>(initialData);
    const { role } = useAdminRole();
    const [activeTab, setActiveTab] = useState<"pastor" | "struktur">("pastor");

    // Expanded state for sections
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    // Modal states
    const [isPastorModalOpen, setIsPastorModalOpen] = useState(false);
    const [editingPastor, setEditingPastor] = useState<Pastor | null>(null);

    const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
    const [editingSection, setEditingSection] = useState<SeksiOrganisasi | null>(null);

    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<{ sectionId: string; group: TimPelayanan | null }>({ sectionId: "", group: null });

    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<{ sectionId: string; groupId: string; member: AnggotaTimKerja | null }>({ sectionId: "", groupId: "", member: null });

    // Delete confirmation
    const [deleteConfirm, setDeleteConfirm] = useState<{
        type: 'pastor' | 'section' | 'group' | 'member';
        id: string;
        parentId?: string;
        grandParentId?: string;
        name: string;
    } | null>(null);

    // Save confirmation
    const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
    const [pendingActionName, setPendingActionName] = useState("");

    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    // Toggle helpers
    const toggleSection = (id: string) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleGroup = (id: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    // Save helper
    const saveAll = (newData: PastorTimKerjaData, message?: string) => {
        startTransition(async () => {
            const result = await savePastorTimKerja(newData);
            if (!result.success) {
                toast.error("Gagal menyimpan: " + result.error);
                router.refresh();
            } else {
                if (message) toast.success(message);
                router.refresh();
            }
        });
    };

    // ══════ PASTOR LOGIC ══════
    const handleSubmitPastor = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const newItem: Pastor = {
            id: editingPastor?.id || uuidv4(),
            name: fd.get("name") as string,
            role: fd.get("role") as string,
            imageUrl: fd.get("imageUrl") as string,
            description: fd.get("description") as string,
            quote: fd.get("quote") as string,
            email: fd.get("email") as string,
            phone: fd.get("phone") as string,
        };
        const action = () => {
            const newPastors = editingPastor
                ? data.pastor.map(p => p.id === newItem.id ? newItem : p)
                : [...data.pastor, newItem];
            const newData = { ...data, pastor: newPastors };
            setData(newData);
            setIsPastorModalOpen(false);
            saveAll(newData, editingPastor ? "Pastor berhasil diperbarui!" : "Pastor berhasil ditambahkan!");
        };
        setPendingAction(() => action);
        setPendingActionName(`Simpan "${newItem.name}"`);
        setSaveConfirmOpen(true);
    };

    const handleDeletePastor = () => {
        if (!deleteConfirm || deleteConfirm.type !== 'pastor') return;
        const newData = { ...data, pastor: data.pastor.filter(p => p.id !== deleteConfirm.id) };
        setData(newData);
        setDeleteConfirm(null);
        saveAll(newData, "Pastor berhasil dihapus!");
    };

    // ══════ SECTION LOGIC ══════
    const handleSubmitSection = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const name = fd.get("name") as string;

        const action = () => {
            if (editingSection) {
                const newSeksi = data.seksi.map(s => s.id === editingSection.id ? { ...s, name } : s);
                const newData = { ...data, seksi: newSeksi };
                setData(newData);
                setIsSectionModalOpen(false);
                saveAll(newData, "Seksi berhasil diperbarui!");
            } else {
                const newSection: SeksiOrganisasi = { id: uuidv4(), name, groups: [] };
                const newData = { ...data, seksi: [...data.seksi, newSection] };
                setData(newData);
                setIsSectionModalOpen(false);
                setExpandedSections(prev => new Set(prev).add(newSection.id));
                saveAll(newData, "Seksi berhasil ditambahkan!");
            }
        };
        setPendingAction(() => action);
        setPendingActionName(`Simpan seksi "${name}"`);
        setSaveConfirmOpen(true);
    };

    const handleDeleteSection = () => {
        if (!deleteConfirm || deleteConfirm.type !== 'section') return;
        const newData = { ...data, seksi: data.seksi.filter(s => s.id !== deleteConfirm.id) };
        setData(newData);
        setDeleteConfirm(null);
        saveAll(newData, "Seksi berhasil dihapus!");
    };

    const moveSection = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= data.seksi.length) return;
        const newSeksi = [...data.seksi];
        [newSeksi[index], newSeksi[newIndex]] = [newSeksi[newIndex], newSeksi[index]];
        const newData = { ...data, seksi: newSeksi };
        setData(newData);
        saveAll(newData);
    };

    // ══════ GROUP LOGIC ══════
    const handleSubmitGroup = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const name = fd.get("name") as string;

        const action = () => {
            const newSeksi = data.seksi.map(s => {
                if (s.id !== editingGroup.sectionId) return s;
                if (editingGroup.group) {
                    return { ...s, groups: s.groups.map(g => g.id === editingGroup.group!.id ? { ...g, name } : g) };
                } else {
                    const newGroup: TimPelayanan = { id: uuidv4(), name, members: [] };
                    setExpandedGroups(prev => new Set(prev).add(newGroup.id));
                    return { ...s, groups: [...s.groups, newGroup] };
                }
            });
            const newData = { ...data, seksi: newSeksi };
            setData(newData);
            setIsGroupModalOpen(false);
            saveAll(newData, editingGroup.group ? "Grup berhasil diperbarui!" : "Grup berhasil ditambahkan!");
        };
        setPendingAction(() => action);
        setPendingActionName(`Simpan grup "${name}"`);
        setSaveConfirmOpen(true);
    };

    const handleDeleteGroup = () => {
        if (!deleteConfirm || deleteConfirm.type !== 'group') return;
        const newSeksi = data.seksi.map(s => {
            if (s.id !== deleteConfirm.parentId) return s;
            return { ...s, groups: s.groups.filter(g => g.id !== deleteConfirm.id) };
        });
        const newData = { ...data, seksi: newSeksi };
        setData(newData);
        setDeleteConfirm(null);
        saveAll(newData, "Grup berhasil dihapus!");
    };

    // ══════ MEMBER LOGIC ══════
    const handleSubmitMember = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const newMember: AnggotaTimKerja = {
            id: editingMember.member?.id || uuidv4(),
            name: fd.get("name") as string,
            role: (fd.get("role") as string) || undefined,
            phone: (fd.get("phone") as string) || undefined,
            quote: (fd.get("quote") as string) || undefined,
        };

        const action = () => {
            const newSeksi = data.seksi.map(s => {
                if (s.id !== editingMember.sectionId) return s;
                return {
                    ...s,
                    groups: s.groups.map(g => {
                        if (g.id !== editingMember.groupId) return g;
                        if (editingMember.member) {
                            return { ...g, members: g.members.map(m => m.id === newMember.id ? newMember : m) };
                        } else {
                            return { ...g, members: [...g.members, newMember] };
                        }
                    })
                };
            });
            const newData = { ...data, seksi: newSeksi };
            setData(newData);
            setIsMemberModalOpen(false);
            saveAll(newData, editingMember.member ? "Anggota berhasil diperbarui!" : "Anggota berhasil ditambahkan!");
        };
        setPendingAction(() => action);
        setPendingActionName(`Simpan "${newMember.name}"`);
        setSaveConfirmOpen(true);
    };

    const handleDeleteMember = () => {
        if (!deleteConfirm || deleteConfirm.type !== 'member') return;
        const newSeksi = data.seksi.map(s => {
            if (s.id !== deleteConfirm.grandParentId) return s;
            return {
                ...s,
                groups: s.groups.map(g => {
                    if (g.id !== deleteConfirm.parentId) return g;
                    return { ...g, members: g.members.filter(m => m.id !== deleteConfirm.id) };
                })
            };
        });
        const newData = { ...data, seksi: newSeksi };
        setData(newData);
        setDeleteConfirm(null);
        saveAll(newData, "Anggota berhasil dihapus!");
    };

    const handleConfirmSave = () => {
        if (pendingAction) {
            pendingAction();
            setSaveConfirmOpen(false);
            setPendingAction(null);
        }
    };

    const handleConfirmDelete = () => {
        if (!deleteConfirm) return;
        switch (deleteConfirm.type) {
            case 'pastor': handleDeletePastor(); break;
            case 'section': handleDeleteSection(); break;
            case 'group': handleDeleteGroup(); break;
            case 'member': handleDeleteMember(); break;
        }
    };

    return (
        <div className="space-y-4">
            {/* Tabs */}
            <div className="flex border-b border-slate-200">
                <button
                    onClick={() => setActiveTab("pastor")}
                    className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "pastor"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                        }`}
                >
                    <User className="h-4 w-4" />
                    Pastor Paroki
                </button>
                <button
                    onClick={() => setActiveTab("struktur")}
                    className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "struktur"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                        }`}
                >
                    <Users className="h-4 w-4" />
                    Struktur Organisasi
                </button>
            </div>

            {/* ════════ Pastor Tab ════════ */}
            {activeTab === "pastor" && (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                    <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                        <h2 className="font-semibold text-slate-800">Daftar Pastor</h2>
                        {role !== "admin_wilayah" && (
                            <Button
                                onClick={() => { setEditingPastor(null); setIsPastorModalOpen(true); }}
                                className="bg-blue-600 hover:bg-blue-700 gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Tambah Pastor
                            </Button>
                        )}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-700 font-medium uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3">Nama</th>
                                    <th className="px-4 py-3">Jabatan</th>
                                    <th className="px-4 py-3">Dibuat/Diubah</th>
                                    <th className="px-4 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {data.pastor.length > 0 ? (
                                    data.pastor.map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                                            <td className="px-4 py-3 text-slate-600">{p.role}</td>
                                            <td className="px-4 py-3">
                                                <div className="text-xs text-slate-500">
                                                    {p.created_by && <div>dibuat: {p.created_by}</div>}
                                                    {p.modified_by && <div>diubah: {p.modified_by}</div>}
                                                    {p.modified_at && <div className="text-slate-400">{formatAuditDate(p.modified_at)}</div>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {role !== "admin_wilayah" && (
                                                    <div className="flex justify-end gap-1">
                                                        <Button variant="ghost" size="icon"
                                                            onClick={() => { setEditingPastor(p); setIsPastorModalOpen(true); }}
                                                            className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon"
                                                            onClick={() => setDeleteConfirm({ type: 'pastor', id: p.id, name: p.name })}
                                                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={4} className="text-center py-8 text-slate-500">Belum ada data Pastor</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ════════ Struktur Organisasi Tab ════════ */}
            {activeTab === "struktur" && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-slate-500">
                            {data.seksi.length} seksi &middot; Kelola struktur organisasi paroki
                        </p>
                        {role !== "admin_wilayah" && (
                            <Button
                                onClick={() => { setEditingSection(null); setIsSectionModalOpen(true); }}
                                className="bg-blue-600 hover:bg-blue-700 gap-2"
                            >
                                <FolderPlus className="h-4 w-4" />
                                Tambah Seksi
                            </Button>
                        )}
                    </div>

                    {data.seksi.length === 0 ? (
                        <div className="bg-white rounded-lg border border-dashed border-slate-300 p-12 text-center text-slate-500">
                            Belum ada seksi organisasi. Klik &quot;Tambah Seksi&quot; untuk memulai.
                        </div>
                    ) : (
                        data.seksi.map((section, sIdx) => {
                            const isExpanded = expandedSections.has(section.id);
                            return (
                                <div key={section.id} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                                    {/* Section Header */}
                                    <div className="flex items-center gap-2 p-3 bg-slate-50 border-b border-slate-200">
                                        <button onClick={() => toggleSection(section.id)} className="p-1 hover:bg-slate-200 rounded transition-colors">
                                            {isExpanded ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
                                        </button>
                                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleSection(section.id)}>
                                            <h3 className="font-semibold text-slate-800 text-sm truncate">{section.name}</h3>
                                            <p className="text-xs text-slate-400">{section.groups.length} grup · {section.groups.reduce((s, g) => s + g.members.length, 0)} anggota</p>
                                            {section.modified_by && (
                                                <p className="text-xs text-slate-400">
                                                    Diedit: {section.modified_by}{section.modified_at && ` (${formatAuditDate(section.modified_at)})`}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-600"
                                                disabled={sIdx === 0} onClick={() => moveSection(sIdx, 'up')}>
                                                <ArrowUp className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-600"
                                                disabled={sIdx === data.seksi.length - 1} onClick={() => moveSection(sIdx, 'down')}>
                                                <ArrowDown className="h-3.5 w-3.5" />
                                            </Button>
                                            {role !== "admin_wilayah" && (
                                                <>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                                        onClick={() => { setEditingSection(section); setIsSectionModalOpen(true); }}>
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                        onClick={() => setDeleteConfirm({ type: 'section', id: section.id, name: section.name })}>
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Section Body */}
                                    {isExpanded && (
                                        <div className="p-4 space-y-3">
                                            <div className="flex justify-end">
                                                {role !== "admin_wilayah" && (
                                                    <Button
                                                        variant="outline" size="sm"
                                                        onClick={() => { setEditingGroup({ sectionId: section.id, group: null }); setIsGroupModalOpen(true); }}
                                                        className="gap-1.5 text-xs"
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                        Tambah Grup
                                                    </Button>
                                                )}
                                            </div>

                                            {section.groups.length === 0 ? (
                                                <div className="text-center py-6 text-slate-400 text-sm border border-dashed border-slate-200 rounded-lg">
                                                    Belum ada grup di seksi ini.
                                                </div>
                                            ) : (
                                                section.groups.map((group) => {
                                                    const isGroupExpanded = expandedGroups.has(group.id);
                                                    return (
                                                        <div key={group.id} className="border border-slate-200 rounded-lg overflow-hidden">
                                                            {/* Group Header */}
                                                            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50/50">
                                                                <button onClick={() => toggleGroup(group.id)} className="p-0.5 hover:bg-slate-200 rounded transition-colors">
                                                                    {isGroupExpanded ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
                                                                </button>
                                                                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleGroup(group.id)}>
                                                                    <span className="text-sm font-medium text-slate-700">{group.name}</span>
                                                                    <span className="text-xs text-slate-400 ml-2">({group.members.length})</span>
                                                                    {group.modified_by && (
                                                                        <span className="text-xs text-slate-400 ml-2">
                                                                            · Diedit: {group.modified_by}{group.modified_at && ` (${formatAuditDate(group.modified_at)})`}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-0.5">
                                                                    {role !== "admin_wilayah" && (
                                                                            <>
                                                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                                                                    onClick={() => { setEditingGroup({ sectionId: section.id, group }); setIsGroupModalOpen(true); }}>
                                                                                    <Pencil className="h-3 w-3" />
                                                                                </Button>
                                                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                                                    onClick={() => setDeleteConfirm({ type: 'group', id: group.id, parentId: section.id, name: group.name })}>
                                                                                    <Trash2 className="h-3 w-3" />
                                                                                </Button>
                                                                            </>
                                                                        )}
                                                                </div>
                                                            </div>

                                                            {/* Group Members */}
                                                            {isGroupExpanded && (
                                                                <div className="border-t border-slate-200 overflow-x-auto">
                                                                    <table className="w-full text-sm min-w-[400px]">
                                                                        <thead className="bg-slate-50/50 text-xs text-slate-500 uppercase">
                                                                            <tr>
                                                                                <th className="px-3 py-2 text-left">Nama</th>
                                                                                <th className="px-3 py-2 text-left">Peran</th>
                                                                                <th className="px-3 py-2 text-left">Telepon</th>
                                                                                <th className="px-3 py-2 text-left">Diubah</th>
                                                                                <th className="px-3 py-2 text-right">Aksi</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="divide-y divide-slate-100">
                                                                            {group.members.map(m => (
                                                                                <tr key={m.id} className="hover:bg-slate-50/50">
                                                                                    <td className="px-3 py-2 font-medium text-slate-800">{m.name}</td>
                                                                                    <td className="px-3 py-2 text-slate-500">{m.role || "—"}</td>
                                                                                    <td className="px-3 py-2 text-slate-500">{m.phone || "—"}</td>
                                                                                    <td className="px-3 py-2">
                                                                                        <div className="text-xs text-slate-400">
                                                                                            {m.modified_by && <div>diubah: {m.modified_by}</div>}
                                                                                            {m.modified_at && <div>{formatAuditDate(m.modified_at)}</div>}
                                                                                        </div>
                                                                                    </td>
                                                                                    <td className="px-3 py-2 text-right">
                                                                                        {role !== "admin_wilayah" && (
                                                                                            <div className="flex justify-end gap-0.5">
                                                                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                                                                                    onClick={() => { setEditingMember({ sectionId: section.id, groupId: group.id, member: m }); setIsMemberModalOpen(true); }}>
                                                                                                    <Pencil className="h-3 w-3" />
                                                                                                </Button>
                                                                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                                                                    onClick={() => setDeleteConfirm({ type: 'member', id: m.id, parentId: group.id, grandParentId: section.id, name: m.name })}>
                                                                                                    <Trash2 className="h-3 w-3" />
                                                                                                </Button>
                                                                                            </div>
                                                                                        )}
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                            {group.members.length === 0 && (
                                                                                <tr><td colSpan={5} className="text-center py-4 text-slate-400 text-xs">Belum ada anggota</td></tr>
                                                                            )}
                                                                        </tbody>
                                                                    </table>
                                                                    <div className="px-3 py-2 border-t border-slate-100">
                                                                        {role !== "admin_wilayah" && (
                                                                            <Button
                                                                                variant="ghost" size="sm"
                                                                                onClick={() => { setEditingMember({ sectionId: section.id, groupId: group.id, member: null }); setIsMemberModalOpen(true); }}
                                                                                className="gap-1.5 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                                            >
                                                                                <UserPlus className="h-3.5 w-3.5" />
                                                                                Tambah Anggota
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* ════════ MODALS ════════ */}

            {/* Pastor Modal */}
            <Dialog open={isPastorModalOpen} onOpenChange={setIsPastorModalOpen}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingPastor ? "Edit Pastor" : "Tambah Pastor"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmitPastor} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="pastor-name">Nama Lengkap & Gelar</Label>
                            <Input id="pastor-name" name="name" defaultValue={editingPastor?.name} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pastor-role">Jabatan</Label>
                            <Input id="pastor-role" name="role" defaultValue={editingPastor?.role} required placeholder="Contoh: Pastor Paroki" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pastor-quote">Kutipan / Quote (Opsional)</Label>
                            <Textarea id="pastor-quote" name="quote" defaultValue={editingPastor?.quote} placeholder="Kutipan inspiratif..." rows={2} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="pastor-email">Email (Opsional)</Label>
                                <Input id="pastor-email" name="email" type="email" defaultValue={editingPastor?.email} placeholder="email@contoh.com" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pastor-phone">No. HP (Opsional)</Label>
                                <Input id="pastor-phone" name="phone" defaultValue={editingPastor?.phone} placeholder="08..." />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pastor-image">URL Foto (Opsional)</Label>
                            <Input id="pastor-image" name="imageUrl" defaultValue={editingPastor?.imageUrl} placeholder="https://..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pastor-desc">Biografi Singkat (Opsional)</Label>
                            <Textarea id="pastor-desc" name="description" defaultValue={editingPastor?.description} rows={3} />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsPastorModalOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700">
                                {isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Menyimpan...</> : "Simpan"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Section Modal */}
            <Dialog open={isSectionModalOpen} onOpenChange={setIsSectionModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{editingSection ? "Edit Seksi" : "Tambah Seksi"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmitSection} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="section-name">Nama Seksi</Label>
                            <Input id="section-name" name="name" defaultValue={editingSection?.name} required
                                placeholder="Contoh: BIDANG 7. NAMA BIDANG" />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsSectionModalOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700">
                                {isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Menyimpan...</> : "Simpan"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Group Modal */}
            <Dialog open={isGroupModalOpen} onOpenChange={setIsGroupModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{editingGroup.group ? "Edit Grup" : "Tambah Grup"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmitGroup} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="group-name">Nama Grup / Tim Pelayanan</Label>
                            <Input id="group-name" name="name" defaultValue={editingGroup.group?.name} required
                                placeholder="Contoh: Tim Pelayanan Lektor" />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsGroupModalOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700">
                                {isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Menyimpan...</> : "Simpan"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Member Modal */}
            <Dialog open={isMemberModalOpen} onOpenChange={setIsMemberModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{editingMember.member ? "Edit Anggota" : "Tambah Anggota"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmitMember} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="member-name">Nama Lengkap</Label>
                            <Input id="member-name" name="name" defaultValue={editingMember.member?.name} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="member-role">Peran / Jabatan (Opsional)</Label>
                            <Input id="member-role" name="role" defaultValue={editingMember.member?.role} placeholder="Contoh: Ketua Bidang" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="member-phone">No. Telepon (Opsional)</Label>
                            <Input id="member-phone" name="phone" defaultValue={editingMember.member?.phone} placeholder="08..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="member-quote">Kutipan / Quote (Opsional)</Label>
                            <Textarea id="member-quote" name="quote" defaultValue={editingMember.member?.quote} placeholder="Kutipan inspiratif..." rows={2} />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsMemberModalOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700">
                                {isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Menyimpan...</> : "Simpan"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={handleConfirmDelete}
                title={`Hapus ${deleteConfirm?.type === 'pastor' ? 'Pastor' : deleteConfirm?.type === 'section' ? 'Seksi' : deleteConfirm?.type === 'group' ? 'Grup' : 'Anggota'}`}
                description={`Hapus "${deleteConfirm?.name}"? ${deleteConfirm?.type === 'section' ? 'Semua grup dan anggota di dalamnya akan ikut terhapus.' : deleteConfirm?.type === 'group' ? 'Semua anggota di dalamnya akan ikut terhapus.' : 'Data ini tidak dapat dikembalikan.'}`}
                loading={isPending}
                confirmText="Hapus"
                variant="destructive"
            />

            {/* Save Confirmation */}
            <ConfirmModal
                isOpen={saveConfirmOpen}
                onClose={() => { setSaveConfirmOpen(false); setPendingAction(null); }}
                onConfirm={handleConfirmSave}
                title="Konfirmasi Simpan"
                description={`Apakah Anda yakin ingin ${pendingActionName}?`}
                confirmText="Simpan"
                loading={isPending}
            />
        </div>
    );
}
