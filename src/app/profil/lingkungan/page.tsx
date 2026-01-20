import { Metadata } from "next";
import { MapPin, Users, Home, Mail, Phone } from "lucide-react";

import { getChurchStatistics } from "@/lib/data";
import { getWilayahLingkungan } from "@/actions/data";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
    title: "Lingkungan | Paroki Brayut",
    description: "Daftar lingkungan dan wilayah Paroki Brayut Santo Yohanes Paulus II",
};

export default async function LingkunganPage() {
    const stats = await getChurchStatistics();
    const wilayahData = await getWilayahLingkungan();

    return (
        <div className="pb-12">
            <PageHeader
                title="Lingkungan"
                subtitle="Komunitas Umat Paroki Brayut"
                image="https://images.unsplash.com/photo-1577439083093-566f654c8b48?q=80&w=2070&auto=format&fit=crop"
                align="center"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
                {/* Wilayah Overview */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-brand-blue/10 p-6 text-center hover:shadow-lg transition-all duration-300">
                        <div className="rounded-full bg-brand-blue/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <MapPin className="h-8 w-8 text-brand-blue" />
                        </div>
                        <div className="text-4xl font-bold text-brand-dark mb-1">
                            {stats?.churches.toLocaleString('id-ID') || "5"}
                        </div>
                        <div className="text-gray-600 font-medium">Wilayah</div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-brand-blue/10 p-6 text-center hover:shadow-lg transition-all duration-300">
                        <div className="rounded-full bg-brand-blue/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <Users className="h-8 w-8 text-brand-blue" />
                        </div>
                        <div className="text-4xl font-bold text-brand-dark mb-1">
                            {stats?.wards.toLocaleString('id-ID') || "--"}
                        </div>
                        <div className="text-gray-600 font-medium">Lingkungan</div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-brand-blue/10 p-6 text-center hover:shadow-lg transition-all duration-300">
                        <div className="rounded-full bg-brand-blue/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <Home className="h-8 w-8 text-brand-blue" />
                        </div>
                        <div className="text-4xl font-bold text-brand-dark mb-1">
                            {stats?.families.toLocaleString('id-ID') || "--"}
                        </div>
                        <div className="text-gray-600 font-medium">Keluarga (KK)</div>
                    </div>
                </section>

                {/* Wilayah List */}
                <section>
                    <h2 className="text-2xl font-bold text-brand-dark mb-6">Daftar Wilayah & Lingkungan</h2>

                    <div className="space-y-6">
                        {wilayahData.length > 0 ? (
                            wilayahData.map((wilayah) => (
                                <div key={wilayah.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:border-brand-blue/30 transition-all duration-300">
                                    <div className="flex items-start gap-6 mb-8 border-b border-gray-100 pb-6">
                                        <div className="rounded-2xl bg-brand-blue/5 p-4 flex-shrink-0">
                                            <MapPin className="h-8 w-8 text-brand-blue" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-bold text-brand-dark mb-2">{wilayah.name}</h3>
                                            <div className="flex flex-col gap-2 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-brand-blue" />
                                                    <span className="font-medium text-brand-blue">Ketua Wilayah: {wilayah.coordinator}</span>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <MapPin className="h-4 w-4 mt-0.5 text-gray-400" />
                                                    <span>{wilayah.address || "belum terdapat data"}</span>
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:gap-6 mt-1">
                                                    {wilayah.email && (
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="h-4 w-4 text-gray-400" />
                                                            <span>{wilayah.email}</span>
                                                        </div>
                                                    )}
                                                    {wilayah.phone && (
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="h-4 w-4 text-gray-400" />
                                                            <span>{wilayah.phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {wilayah.lingkungan.length > 0 ? (
                                            wilayah.lingkungan.map((lingkungan) => (
                                                <div key={lingkungan.id} className="bg-gray-50 rounded-xl p-5 border border-gray-100 hover:bg-white hover:shadow-md hover:border-brand-blue/20 transition-all duration-300 group">
                                                    <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-200 group-hover:border-blue-100">
                                                        <Home className="h-5 w-5 text-gray-400 group-hover:text-brand-blue transition-colors" />
                                                        <span className="font-bold text-brand-dark group-hover:text-brand-blue transition-colors">{lingkungan.name}</span>
                                                    </div>
                                                    <div className="space-y-2 text-sm text-gray-600">
                                                        <div className="font-medium text-brand-blue">Ketua: {lingkungan.chief}</div>
                                                        <div className="text-xs text-gray-500 line-clamp-1">{lingkungan.address || "belum terdapat data"}</div>
                                                        <div className="flex items-center gap-2 pt-1">
                                                            {lingkungan.phone ? (
                                                                <Phone className="h-3 w-3 text-gray-400" />
                                                            ) : null}
                                                            <span className="text-xs text-gray-400">{lingkungan.phone || "-"}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-sm text-gray-500 italic col-span-full py-4 text-center bg-gray-50 rounded-lg">Belum ada data lingkungan</div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                                Data Wilayah belum tersedia.
                            </div>
                        )}
                    </div>
                </section>

                {/* Note */}
                <div className="bg-blue-50 border-l-4 border-brand-blue rounded-xl p-6 shadow-sm">
                    <p className="text-gray-700">
                        <strong className="text-brand-dark">Catatan:</strong> Informasi detail mengenai batas wilayah,
                        koordinator lingkungan, dan data lengkap akan selalu diperbarui. Untuk informasi lebih lanjut,
                        silakan hubungi sekretariat paroki.
                    </p>
                </div>
            </div>
        </div>
    );
}
