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
        wilayah: 0,
        wards: 0,
        families: 0,
        parishioners: 0
    });

    const [isPending, startTransition] = useTransition();
    const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const router = useRouter();

    const checkForChanges = useCallback(() => {
        if (!initialData) {
            setHasChanges(true);
            return;
        }
        const changed =
            data.churches !== initialData.churches ||
            data.wilayah !== initialData.wilayah ||
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

    const fields = [
        { key: "churches" as const, icon: Church, label: "Jumlah Gereja", hint: "Total gereja & kapel" },
        { key: "wilayah" as const, icon: MapPin, label: "Jumlah Wilayah", hint: "Wilayah di paroki" },
        { key: "wards" as const, icon: MapPin, label: "Jumlah Lingkungan", hint: "Total lingkungan" },
        { key: "families" as const, icon: Home, label: "Kepala Keluarga", hint: "Total KK terdaftar" },
        { key: "parishioners" as const, icon: Users, label: "Jumlah Umat", hint: "Total jiwa" },
    ];

    return (
        <>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6 max-w-2xl w-full">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-3 sm:gap-5">
                        {fields.map(({ key, icon: Icon, label, hint }) => (
                            <div
                                key={key}
                                className={`space-y-1.5${key === "parishioners" ? " col-span-2 sm:col-span-1" : ""}`}
                            >
                                <Label className="flex items-center gap-1.5 text-xs sm:text-sm font-medium">
                                    <Icon className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                                    {label}
                                </Label>
                                <Input
                                    type="number"
                                    value={data[key]}
                                    onChange={(e) => setData({ ...data, [key]: parseInt(e.target.value) || 0 })}
                                    className="text-xl sm:text-2xl font-bold h-11 sm:h-14"
                                />
                                <p className="text-xs text-slate-400">{hint}</p>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                        <p className="text-xs text-slate-400">
                            Diperbarui:{" "}
                            {data.lastUpdated
                                ? new Date(data.lastUpdated).toLocaleDateString("id-ID", {
                                    day: "numeric", month: "long", year: "numeric",
                                    hour: "2-digit", minute: "2-digit",
                                })
                                : "—"}
                        </p>

                        <Button
                            type="submit"
                            disabled={isPending || !hasChanges}
                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Simpan Perubahan
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>

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
