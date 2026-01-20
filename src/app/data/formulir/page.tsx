import { Metadata } from "next";
import { getFormulir } from "@/actions/data";
import { getMasterCategories } from "@/actions/master-categories";
import FormulirList from "@/components/data/FormulirList";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
    title: "Formulir Gereja | Paroki Brayut",
    description: "Download formulir administrasi gereja Paroki Brayut Santo Yohanes Paulus II",
};

export default async function FormulirPage() {
    const rawForms = await getFormulir();
    const categories = await getMasterCategories();

    return (
        <div className="min-h-screen pb-12">
            <PageHeader
                title="Formulir Gereja"
                subtitle="Download Pusat Dokumen Administrasi"
                image="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop"
                align="center"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
                {/* Instructions Box */}
                <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-brand-dark mb-6">Petunjuk Penggunaan</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold flex-shrink-0">1</div>
                            <p className="text-gray-600 text-sm leading-relaxed">Pilih dan unduh formulir yang sesuai dengan kebutuhan administrasi Anda dari daftar di bawah.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold flex-shrink-0">2</div>
                            <p className="text-gray-600 text-sm leading-relaxed">Isi formulir dengan data yang lengkap, jelas, dan dapat dipertanggungjawabkan.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold flex-shrink-0">3</div>
                            <p className="text-gray-600 text-sm leading-relaxed">Serahkan ke sekretariat paroki pada jam kerja atau hubungi koordinator lingkungan.</p>
                        </div>
                    </div>
                </div>

                {/* Client Component */}
                <FormulirList initialData={rawForms} categories={categories.formulir} />
            </div>
        </div>
    );
}
