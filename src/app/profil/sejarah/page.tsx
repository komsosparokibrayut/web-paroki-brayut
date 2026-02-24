import { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import InteractiveTimeline from "./InteractiveTimeline";
import SejarahDetail from "./SejarahDetail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
    title: "Sejarah Paroki Santo Yohanes Paulus II Brayut",
    description: "Sejarah perkembangan Paroki Santo Yohanes Paulus II Brayut",
};

export default function SejarahPage() {
    return (
        <div className="pb-12">
            <PageHeader
                title="Sejarah Paroki"
                subtitle="Perjalanan Iman Paroki Santo Yohanes Paulus II Brayut"
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
                                Detail Sejarah
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
            </div>
        </div>
    );
}
