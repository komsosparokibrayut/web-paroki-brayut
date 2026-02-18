"use client";

import { Building2, Copy, Smartphone, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import GradientActionCard from "@/components/ui/GradientActionCard";

export default function DonationInfo({ qrCodeValue }: { qrCodeValue?: string }) {
    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} berhasil disalin.`);
    };

    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left: Transfer Info */}
                <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-brand-dark flex items-center gap-3">
                        <Building2 className="h-6 w-6 text-brand-blue" />
                        Transfer Bank
                    </h3>

                    <Card className="border-l-4 border-l-blue-700 hover:shadow-md transition-shadow group">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900">Bank Mandiri</h4>
                                    <p className="text-sm text-gray-700 font-medium">KCP Sleman</p>
                                </div>
                                <div
                                    className="flex items-center justify-between bg-gray-50 p-3 px-4 rounded-lg group-hover:bg-blue-50 transition-colors cursor-pointer w-full md:w-[280px]"
                                    onClick={() => handleCopy("1370016326825", "Nomor Rekening Mandiri")}
                                >
                                    <code className="text-lg md:text-xl font-mono font-bold text-blue-700 mr-3">137-00-1632682-5</code>
                                    <Copy className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">a.n PGPM Paroki Santo Yohanes Paulus II</p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-orange-600 hover:shadow-md transition-shadow group">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900">Bank BRI</h4>
                                    <p className="text-sm text-gray-700 font-medium">Unit Palagan</p>
                                </div>
                                <div
                                    className="flex items-center justify-between bg-gray-50 p-3 px-4 rounded-lg group-hover:bg-orange-50 transition-colors cursor-pointer w-full md:w-[280px]"
                                    onClick={() => handleCopy("730701015723535", "Nomor Rekening BRI")}
                                >
                                    <code className="text-lg md:text-xl font-mono font-bold text-orange-600 mr-3">7307-01-015723-53-5</code>
                                    <Copy className="h-4 w-4 text-gray-400 group-hover:text-orange-600" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">a.n PGPM Paroki Santo Yohanes Paulus II</p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-indigo-600 hover:shadow-md transition-shadow group">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900">Bank BCA</h4>
                                    {/* <p className="text-sm text-gray-700 font-medium">BCA</p> */}
                                </div>
                                <div
                                    className="flex items-center justify-between bg-gray-50 p-3 px-4 rounded-lg group-hover:bg-indigo-50 transition-colors cursor-pointer w-full md:w-[280px]"
                                    onClick={() => handleCopy("8467030862", "Nomor Rekening BCA")}
                                >
                                    <code className="text-lg md:text-xl font-mono font-bold text-indigo-600 mr-3">846-703-0862</code>
                                    <Copy className="h-4 w-4 text-gray-400 group-hover:text-indigo-600" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">a.n PGPM Paroki Santo Yohanes Paulus II</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Right: QRIS */}
                <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-brand-dark flex items-center gap-3">
                        <Smartphone className="h-6 w-6 text-brand-blue" />
                        Scan QRIS
                    </h3>
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 text-center relative overflow-hidden group hover:border-brand-blue transition-colors">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-blue to-brand-gold"></div>

                        <div className="mb-6 relative w-72 h-72 mx-auto bg-white rounded-xl flex items-center justify-center p-2 border border-gray-100 group-hover:border-brand-blue/30 transition-colors shadow-sm">
                            <QRCodeSVG
                                value={qrCodeValue || ""}
                                size={280}
                                level="H"
                                className="object-contain" // Use contain to ensure it fits and scans
                            />
                        </div>

                        <p className="font-bold text-gray-900 mb-1 text-lg">PGPM Paroki Santo Yohanes Paulus II</p>
                        <p className="text-sm text-gray-500 font-mono">NMID: ID1234567890123</p>
                    </div>
                </div>
            </div>

            <GradientActionCard
                title="Sudah Melakukan Transfer?"
                description="Terima kasih atas kemurahan hati Anda. Mohon lakukan konfirmasi agar donasi Anda dapat kami catat dan kami sampaikan laporan pertanggungjawabannya."
                actionLabel="Konfirmasi via WhatsApp"
                actionLink="https://wa.me/6281234567890?text=Berkah%20Dalem,%20saya%20sudah%20melakukan%20transfer%20donasi%20untuk%20pembangunan%20gereja%20sebesar%20Rp..."
                icon={<CheckCircle2 className="h-8 w-8 text-brand-dark" />}
                className="mt-12"
            />
        </div>
    )
}
