import { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import DonationInfo from "@/components/donasi/DonationInfo";
import { Heart } from "lucide-react";

export const metadata: Metadata = {
    title: "Donasi Pembangunan | Paroki Brayut",
    description: "Mari berpartisipasi dalam pembangunan Gereja Santo Yohanes Paulus II Paroki Brayut",
};

export default function DonationPage() {
    return (
        <div className="min-h-screen pb-12">
            <PageHeader
                title="Donasi Pembangunan"
                subtitle="Mari Membangun Rumah Tuhan"
                image="https://images.unsplash.com/photo-1548625149-fc4a29cf7092?q=80&w=2072&auto=format&fit=crop"
                align="center"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
                {/* Intro Text */}
                <div className="text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-gold/10 text-brand-gold rounded-full font-bold text-sm mb-6">
                        <Heart className="h-4 w-4 fill-current" />
                        Gerakan Kasih
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-6">Saluran Berkat Anda</h2>
                    <p className="text-gray-600 text-lg leading-relaxed">
                        Pembangunan Gereja Santo Yohanes Paulus II membutuhkan uluran tangan kita bersama.
                        Setiap persembahan yang Anda berikan, sekecil apapun, akan menjadi batu bata iman yang membangun tempat ibadah kita.
                    </p>
                </div>

                {/* Info Component */}
                <DonationInfo qrCodeValue={process.env.QR_CODE} />
            </div>
        </div>
    );
}
