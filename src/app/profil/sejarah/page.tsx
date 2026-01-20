import { Metadata } from "next";
import { Calendar } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
    title: "Sejarah Gereja | Paroki Brayut",
    description: "Sejarah perkembangan Paroki Brayut Santo Yohanes Paulus II",
};

export default function SejarahPage() {
    return (
        <div className="pb-12">
            <PageHeader
                title="Sejarah Gereja"
                subtitle="Perjalanan Iman Paroki Brayut"
                image="https://images.unsplash.com/photo-1580826237584-fda5b612e1bc?q=80&w=2070&auto=format&fit=crop"
                align="center"
            />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="prose prose-lg max-w-none">
                    {/* Timeline Placeholder */}
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 mb-8">
                        <h2 className="text-2xl font-bold text-brand-dark mb-6 flex items-center gap-2">
                            <Calendar className="h-6 w-6 text-brand-blue" />
                            Perjalanan Sejarah
                        </h2>

                        <div className="space-y-6">
                            <div className="border-l-4 border-brand-blue pl-6 py-2">
                                <div className="text-brand-blue font-bold text-lg mb-1">Tahun [Tahun]</div>
                                <h3 className="text-xl font-semibold text-brand-dark mb-2">Pendirian Paroki</h3>
                                <p className="text-gray-700">
                                    [Deskripsi tentang pendirian paroki, tokoh-tokoh penting, dan peristiwa bersejarah lainnya akan ditambahkan di sini]
                                </p>
                            </div>

                            <div className="border-l-4 border-brand-blue pl-6 py-2">
                                <div className="text-brand-blue font-bold text-lg mb-1">Tahun [Tahun]</div>
                                <h3 className="text-xl font-semibold text-brand-dark mb-2">Pembangunan Gereja Utama</h3>
                                <p className="text-gray-700">
                                    [Deskripsi tentang pembangunan gereja utama akan ditambahkan di sini]
                                </p>
                            </div>

                            <div className="border-l-4 border-brand-blue pl-6 py-2">
                                <div className="text-brand-blue font-bold text-lg mb-1">Tahun [Tahun]</div>
                                <h3 className="text-xl font-semibold text-brand-dark mb-2">Perkembangan Terkini</h3>
                                <p className="text-gray-700">
                                    [Deskripsi tentang perkembangan terkini paroki akan ditambahkan di sini]
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="bg-brand-warm rounded-xl p-8">
                        <p className="text-gray-700 italic">
                            Konten sejarah lengkap akan segera ditambahkan. Untuk informasi lebih lanjut,
                            silakan hubungi sekretariat paroki.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
