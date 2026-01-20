
import { Metadata } from "next";
import { Calendar } from "lucide-react";
import { getChurchStatistics } from "@/lib/data";
import StatsSection from "@/components/profil/StatsSection";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
    title: "Profil & Selayang Pandang | Paroki Brayut",
    description: "Selayang pandang Paroki Brayut Santo Yohanes Paulus II - Sejarah, visi, dan misi paroki",
};

export default async function ProfilPage() {
    const stats = await getChurchStatistics();

    return (
        <div className="min-h-screen pb-12">
            <PageHeader
                title="Profil Paroki Brayut"
                subtitle="Santo Yohanes Paulus II"
                image="https://images.unsplash.com/photo-1569759276108-31b8e7e43e7b?q=80&w=2072&auto=format&fit=crop"
                align="left"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
                {/* Selayang Pandang */}
                <section>
                    <h2 className="text-3xl font-bold text-brand-dark mb-6">Selayang Pandang</h2>
                    <div className="prose prose-lg max-w-none text-gray-700">
                        <p>
                            Paroki Brayut Santo Yohanes Paulus II merupakan salah satu paroki di Keuskupan Agung Semarang
                            yang melayani umat Katolik di wilayah Sleman, Yogyakarta. Paroki ini didirikan dengan semangat
                            evangelisasi dan pelayanan kepada umat beriman.
                        </p>
                        <p>
                            Dengan motto pelayanan yang penuh kasih dan dedikasi, Paroki Brayut terus bertumbuh dalam iman
                            dan pelayanan kepada Tuhan melalui berbagai kegiatan liturgi, pastoral, dan sosial kemasyarakatan.
                        </p>
                    </div>
                </section>

                {/* Statistics Cards - Client Component */}
                <StatsSection stats={stats} />

                {/* Visi & Misi */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-gradient-to-br from-brand-blue to-brand-darkBlue text-white rounded-xl shadow-lg p-8">
                        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Calendar className="h-6 w-6" />
                            Visi
                        </h3>
                        <p className="text-blue-100 leading-relaxed">
                            Menjadi komunitas Katolik yang hidup, beriman, dan penuh kasih, serta aktif dalam mewartakan
                            Kabar Gembira Yesus Kristus kepada semua orang.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg border-2 border-brand-blue p-8">
                        <h3 className="text-2xl font-bold mb-4 text-brand-dark flex items-center gap-2">
                            <Calendar className="h-6 w-6 text-brand-blue" />
                            Misi
                        </h3>
                        <ul className="space-y-2 text-gray-700">
                            <li className="flex items-start gap-2">
                                <span className="text-brand-blue mt-1">•</span>
                                <span>Meningkatkan kehidupan rohani umat melalui liturgi dan sakramen</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-brand-blue mt-1">•</span>
                                <span>Membangun persaudaraan dan kebersamaan dalam komunitas</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-brand-blue mt-1">•</span>
                                <span>Melayani sesama dengan penuh kasih dan kerendahan hati</span>
                            </li>
                        </ul>
                    </div>
                </section>
            </div>
        </div>
    );
}
