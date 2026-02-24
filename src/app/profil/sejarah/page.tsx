import { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import InteractiveTimeline from "./InteractiveTimeline";
import SejarahDetail from "./SejarahDetail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="prose prose-lg max-w-none text-center mb-10">
                    <p className="text-gray-600">
                        Sejarah perkembangan Paroki Santo Yohanes Paulus II Brayut, dari Pusat Pastoral Wilayah hingga menjadi Paroki Mandiri.
                    </p>
                </div>

                <Tabs defaultValue="ringkasan" className="w-full">
                    <div className="flex justify-center mb-16 md:mb-24">
                        <TabsList className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full p-1.5 shadow-sm h-auto inline-flex">
                            <TabsTrigger
                                value="ringkasan"
                                className="!rounded-full px-6 md:px-8 py-2.5 data-[state=active]:!bg-brand-blue data-[state=active]:!text-white data-[state=active]:!shadow-none text-brand-dark font-medium transition-all hover:bg-gray-50 data-[state=active]:hover:bg-brand-blue"
                            >
                                Ringkasan Sejarah
                            </TabsTrigger>
                            <TabsTrigger
                                value="detail"
                                className="!rounded-full px-6 md:px-8 py-2.5 data-[state=active]:!bg-brand-blue data-[state=active]:!text-white data-[state=active]:!shadow-none text-brand-dark font-medium transition-all hover:bg-gray-50 data-[state=active]:hover:bg-brand-blue"
                            >
                                Sejarah Detail
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="ringkasan" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                        <InteractiveTimeline />
                    </TabsContent>

                    <TabsContent value="detail" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
                            <SejarahDetail />
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="bg-brand-warm rounded-xl p-8 mt-16 text-center text-gray-700 italic max-w-4xl mx-auto">
                    <i>
                        *Untuk informasi historis dan dokumen resmi gereja yang lebih rinci,
                        silakan hubungi sekretariat paroki.
                    </i>
                </div>
            </div>
        </div>
    );
}
