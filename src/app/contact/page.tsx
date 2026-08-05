
import { Metadata } from "next";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { SiFacebook, SiInstagram, SiYoutube } from "@icons-pack/react-simple-icons";
import PageHeader from "@/components/layout/PageHeader";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
    title: "Hubungi Kami | Paroki Brayut",
    description: "Kontak dan lokasi Gereja Santo Yohanes Paulus II Paroki Brayut",
};

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-brand-warm flex flex-col font-rubik">
            <Header />
            <main className="flex-grow pb-12">
                <PageHeader
                    title="Hubungi Kami"
                    subtitle="Sekretariat Paroki Brayut"
                    image="https://images.unsplash.com/photo-1615840287214-7ff58936c4cf?q=80&w=2070&auto=format&fit=crop"
                    align="center"
                />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Info Cards */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Address */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue flex-shrink-0">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Alamat Gereja</h3>
                                    <a
                                        href="https://maps.google.com/?q=Gereja+Santo+Yusuf+Tambakrejo,+Rejodani+1,+Sariharjo,+Ngaglik,+Sleman"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-brand-blue text-sm leading-relaxed hover:underline"
                                    >
                                        Gereja Santo Yusuf Tambakrejo Rejodani 1, Sariharjo, Ngaglik Kabupaten Sleman, DIY 55581
                                    </a>
                                </div>
                            </div>

                            {/* Contact */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue flex-shrink-0">
                                    <Phone className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Kontak</h3>
                                    <div className="text-gray-600 text-sm space-y-1">
                                        <p className="font-medium text-gray-900">(0274) 860-9221</p>
                                        <p>Sekretariat Paroki (Selasa - Minggu)</p>
                                        <a
                                            href="https://wa.me/628135735199"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-brand-blue hover:underline"
                                        >
                                            628135735199
                                        </a>
                                        <a href="mailto:sekretariat@parokibrayut.org" className="text-brand-blue hover:underline">
                                            sekretariat@parokibrayut.org
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Hours */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue flex-shrink-0">
                                    <Clock className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Jam Sekretariat</h3>
                                    <div className="text-gray-600 text-sm space-y-1">
                                        <p>Selasa - Jumat: 09.00 - 17.00</p>
                                        <p>Sabtu: 08.00 - 15.00</p>
                                        <p>Minggu: 09.00 - 15.00</p>
                                        <p className="text-xs text-red-500 pt-1 italic">*Senin &amp; Libur Nasional Tutup</p>
                                    </div>
                                </div>
                            </div>

                            {/* Socials */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-4">Media Sosial</h3>
                                <div className="flex gap-4">
                                    <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-red-500 hover:to-purple-500 hover:text-white transition-all">
                                        <SiInstagram className="h-5 w-5" />
                                    </a>
                                    <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-600 hover:text-white transition-all">
                                        <SiFacebook className="h-5 w-5" />
                                    </a>
                                    <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-red-600 hover:text-white transition-all">
                                        <SiYoutube className="h-5 w-5" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Map */}
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-2 h-[500px] overflow-hidden">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.5855734845!2d110.3644!3d-7.7275!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a58c0c4c4c4c4%3A0x4c4c4c4c4c4c4c4c!2sGereja%20Santo%20Yohanes%20Paulus%20II%20Brayut!5e0!3m2!1sid!2sid!4v1620000000000!5m2!1sid!2sid"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                className="rounded-lg"
                            ></iframe>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
