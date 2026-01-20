"use client";

import { Building2, Copy, Smartphone, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import GradientActionCard from "@/components/ui/GradientActionCard";

export default function DonationInfo({ qrCodeValue }: { qrCodeValue?: string }) {
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Nomor rekening berhasil disalin");
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
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="text-sm text-gray-700 font-medium">Bank Mandiri</p>
                                    <h4 className="text-lg font-bold text-gray-900">KCP Sleman</h4>
                                </div>
                            </div>
                            <div
                                className="flex items-center justify-between bg-gray-50 p-4 rounded-lg mt-3 group-hover:bg-blue-50 transition-colors cursor-pointer"
                                onClick={() => handleCopy("137-00-1632682-5")}
                            >
                                <code className="text-xl font-mono font-bold text-blue-700">137-00-1632682-5</code>
                                <Copy className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">a.n PGPM Paroki Santo Yohanes Paulus II</p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-orange-600 hover:shadow-md transition-shadow group">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="text-sm text-gray-700 font-medium">Bank BRI</p>
                                    <h4 className="text-lg font-bold text-gray-900">Unit Palagan</h4>
                                </div>
                            </div>
                            <div
                                className="flex items-center justify-between bg-gray-50 p-4 rounded-lg mt-3 group-hover:bg-orange-50 transition-colors cursor-pointer"
                                onClick={() => handleCopy("7307-01-015723-53-5")}
                            >
                                <code className="text-xl font-mono font-bold text-orange-600">7307-01-015723-53-5</code>
                                <Copy className="h-5 w-5 text-gray-400 group-hover:text-orange-600" />
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
