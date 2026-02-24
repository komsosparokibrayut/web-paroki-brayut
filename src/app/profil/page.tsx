import { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import ProfilDetail from "./ProfilDetail";

export const metadata: Metadata = {
    title: "Profil & Programasi | Paroki Brayut",
    description: "Profil Paroki Brayut Santo Yohanes Paulus II - Programasi, visi misi, potensi, dan tujuan paroki",
};

export default function ProfilPage() {
    return (
        <div className="pb-12">
            <PageHeader
                title="Profil Paroki"
                subtitle="Profil dan Programasi Paroki Santo Yohanes Paulus II Brayut"
                image="https://images.unsplash.com/photo-1569759276108-31b8e7e43e7b?q=80&w=2072&auto=format&fit=crop"
                align="center"
            />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <ProfilDetail />
            </div>
        </div>
    );
}
