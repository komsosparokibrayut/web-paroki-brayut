"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { StatistikData, saveStatistik } from "@/actions/data";
import { Save, Loader2, Users, Home, MapPin, Church } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function StatistikClient({ initialData }: { initialData: StatistikData | null }) {
    const [data, setData] = useState<StatistikData>(initialData || {
        churches: 0,
        wards: 0,
        families: 0,
        parishioners: 0
    });

    const [isPending, startTransition] = useTransition();
    const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const router = useRouter();

    // Check for changes compared to initial data
    const checkForChanges = useCallback(() => {
        if (!initialData) {
            setHasChanges(true);
            return;
        }
        const changed =
            data.churches !== initialData.churches ||
            data.wards !== initialData.wards ||
            data.families !== initialData.families ||
            data.parishioners !== initialData.parishioners;
        setHasChanges(changed);
    }, [data, initialData]);

    useEffect(() => {
        checkForChanges();
    }, [checkForChanges]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaveConfirmOpen(true);
    };

    const handleConfirmSave = () => {
        setSaveConfirmOpen(false);
        startTransition(async () => {
            const result = await saveStatistik(data);
            if (result.success) {
                toast.success("Statistik berhasil disimpan!");
                router.refresh();
            } else {
                toast.error("Gagal menyimpan: " + result.error);
            }
        });
    };

    return (
        <>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Church className="h-4 w-4 text-blue-600" />
                                Jumlah Gereja
                            </Label>
                            <Input
                                type="number"
                                value={data.churches}
                                onChange={(e) => setData({ ...data, churches: parseInt(e.target.value) || 0 })}
                                className="text-2xl font-bold h-14"
                            />
                            <p className="text-xs text-slate-500">Total gereja dan kapel</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-blue-600" />
                                Jumlah Lingkungan
                            </Label>
                            <Input
                                type="number"
                                value={data.wards}
                                onChange={(e) => setData({ ...data, wards: parseInt(e.target.value) || 0 })}
                                className="text-2xl font-bold h-14"
                            />
                            <p className="text-xs text-slate-500">Total lingkungan di paroki</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Home className="h-4 w-4 text-blue-600" />
                                Jumlah Kepala Keluarga
                            </Label>
                            <Input
                                type="number"
                                value={data.families}
                                onChange={(e) => setData({ ...data, families: parseInt(e.target.value) || 0 })}
                                className="text-2xl font-bold h-14"
                            />
                            <p className="text-xs text-slate-500">Total KK terdaftar</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-blue-600" />
                                Jumlah Umat
                            </Label>
                            <Input
                                type="number"
                                value={data.parishioners}
                                onChange={(e) => setData({ ...data, parishioners: parseInt(e.target.value) || 0 })}
                                className="text-2xl font-bold h-14"
                            />
                            <p className="text-xs text-slate-500">Total jiwa</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div className="text-sm text-slate-500">
                            Terakhir diperbarui: {data.lastUpdated ? new Date(data.lastUpdated).toLocaleDateString("id-ID", {
                                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            }) : '-'}
                        </div>

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
                                <div className="flex items-center gap-2">
                                    <Save className="h-4 w-4" />
                                    Simpan Perubahan
                                </div>
                            )}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Save Confirmation */}
            <ConfirmModal
                isOpen={saveConfirmOpen}
                onClose={() => setSaveConfirmOpen(false)}
                onConfirm={handleConfirmSave}
                title="Simpan Perubahan Statistik"
                description="Apakah Anda yakin ingin menyimpan perubahan data statistik paroki?"
                confirmText="Simpan"
                loading={isPending}
            />
        </>
    );
}
