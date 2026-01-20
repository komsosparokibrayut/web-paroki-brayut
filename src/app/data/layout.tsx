import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppWidget from "@/components/shared/WhatsAppWidget";

export default function DataLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-brand-warm flex flex-col font-rubik">
            <Header />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
            <WhatsAppWidget />
        </div>
    );
}
