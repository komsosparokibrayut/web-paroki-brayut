
import { Metadata } from "next";
import { getUMKM } from "@/actions/data";
import { getMasterCategories } from "@/actions/master-categories";
import UMKMList from "@/components/data/UMKMList";
import PageHeader from "@/components/layout/PageHeader";
import GradientActionCard from "@/components/ui/GradientActionCard";
import { Store } from "lucide-react";

export const metadata: Metadata = {
    title: "Data UMKM | Paroki Brayut",
    description: "Direktori Usaha Mikro, Kecil, dan Menengah Umat Paroki Brayut",
};

export default async function UMKMPage() {
    const umkmList = await getUMKM();
    const categories = await getMasterCategories();

    return (
        <div className="min-h-screen pb-12">
            <PageHeader
                title="Data UMKM"
                subtitle="Direktori Usaha Umat Paroki"
                image="https://images.unsplash.com/photo-1514425263458-109317cc1321?q=80&w=2070&auto=format&fit=crop"
                align="center"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
                {/* Registration Info */}
                <GradientActionCard
                    title="Daftarkan Usaha Anda"
                    description="Dukung perekonomian umat dengan mendaftarkan usaha Anda di direktori UMKM Paroki. Silakan hubungi sekretariat atau ketua lingkungan untuk pendaftaran."
                    actionLabel="Hubungi Sekretariat"
                    actionLink="https://wa.me/6281234567890"
                    icon={<Store className="h-8 w-8 text-brand-dark" />}
                />

                <UMKMList initialUMKM={umkmList} categories={categories.umkm} />
            </div>
        </div>
    );
}
