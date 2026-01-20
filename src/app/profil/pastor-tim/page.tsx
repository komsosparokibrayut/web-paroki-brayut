import { Metadata } from "next";
import Image from "next/image";
import { Users, Mail, Phone } from "lucide-react";
import { getPastorTimKerja } from "@/actions/data";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
    title: "Pastor & Tim Kerja | Paroki Brayut",
    description: "Pastor Paroki dan Tim Kerja Paroki Brayut Santo Yohanes Paulus II",
};

export default async function PastorTimPage() {
    const data = await getPastorTimKerja();
    const { pastor, timKerja } = data;

    return (
        <div className="pb-12">
            <PageHeader
                title="Pastor Paroki & Tim Kerja"
                subtitle="Pelayan Umat Paroki Brayut"
                image="https://images.unsplash.com/photo-1639474894531-82a7fe3c5098?q=80&w=1974&auto=format&fit=crop"
                align="center"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
                {/* Pastor Paroki */}
                <section>
                    <h2 className="text-2xl font-bold text-brand-dark mb-6">Pastor Paroki</h2>
                    <div className="space-y-6">
                        {pastor.length > 0 ? (
                            pastor.map((p) => (
                                <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-brand-blue/10 p-8 hover:shadow-lg transition-all duration-300">
                                    <div className="flex flex-col md:flex-row gap-8 items-start">
                                        <div className="flex-shrink-0">
                                            {p.imageUrl ? (
                                                <Image
                                                    src={p.imageUrl}
                                                    alt={p.name}
                                                    width={192}
                                                    height={192}
                                                    className="w-48 h-48 rounded-2xl object-cover shadow-md"
                                                />
                                            ) : (
                                                <div className="w-48 h-48 rounded-2xl bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center">
                                                    <Users className="h-16 w-16 text-gray-300" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-bold text-brand-dark mb-1">{p.name}</h3>
                                            <p className="text-brand-blue font-semibold mb-4 text-lg">{p.role}</p>

                                            {p.quote && (
                                                <blockquote className="border-l-4 border-brand-blue pl-4 italic text-gray-600 mb-6 bg-brand-blue/5 py-3 pr-4 rounded-r-lg">
                                                    &quot;{p.quote}&quot;
                                                </blockquote>
                                            )}

                                            <p className="text-gray-700 mb-6 whitespace-pre-line leading-relaxed">
                                                {p.description}
                                            </p>

                                            <div className="space-y-3 pt-6 border-t border-gray-100 items-center">
                                                {p.email && (
                                                    <div className="flex items-center gap-3 text-gray-600 group">
                                                        <div className="p-2 bg-brand-blue/5 rounded-full text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
                                                            <Mail className="h-4 w-4" />
                                                        </div>
                                                        <span className="font-medium">{p.email}</span>
                                                    </div>
                                                )}
                                                {p.phone && (
                                                    <div className="flex items-center gap-3 text-gray-600 group">
                                                        <div className="p-2 bg-brand-blue/5 rounded-full text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
                                                            <Phone className="h-4 w-4" />
                                                        </div>
                                                        <span className="font-medium">{p.phone}</span>
                                                    </div>
                                                )}
                                                {!p.email && !p.phone && (
                                                    <div className="text-gray-400 italic text-sm">Kontak via Sekretariat Paroki</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm border border-dashed border-gray-300 p-12 text-center text-gray-500">
                                Data Pastor belum tersedia.
                            </div>
                        )}
                    </div>
                </section>

                {/* Tim Kerja Paroki */}
                <section>
                    <h2 className="text-2xl font-bold text-brand-dark mb-6">Tim Kerja Paroki</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {timKerja.length > 0 ? (
                            timKerja.map((member) => (
                                <div key={member.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-brand-blue/30 transition-all duration-300 group">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-14 h-14 rounded-full bg-brand-blue/5 flex items-center justify-center group-hover:bg-brand-blue/10 transition-colors">
                                            <Users className="h-6 w-6 text-brand-blue" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-brand-dark text-lg leading-tight group-hover:text-brand-blue transition-colors">{member.name}</h3>
                                            <p className="text-sm font-semibold text-gray-500">{member.division}</p>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <p className="text-sm text-gray-700 font-medium mb-1">{member.role}</p>
                                        {member.quote && (
                                            <p className="text-xs italic text-gray-500">&quot;{member.quote}&quot;</p>
                                        )}
                                    </div>

                                    <div className="space-y-2 mt-4 pt-4 border-t border-gray-50">
                                        {member.email && (
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Mail className="h-3 w-3 text-brand-blue/60" />
                                                <span>{member.email}</span>
                                            </div>
                                        )}
                                        {member.phone && (
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Phone className="h-3 w-3 text-brand-blue/60" />
                                                <span>{member.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                                Data Tim Kerja belum tersedia.
                            </div>
                        )}
                    </div>
                </section>

                {/* Staff Sekretariat */}
                <section>
                    <h2 className="text-2xl font-bold text-brand-dark mb-6">Staff Sekretariat</h2>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                        <p className="text-gray-700">
                            Informasi staff sekretariat akan segera ditambahkan. Untuk bantuan dan informasi,
                            silakan hubungi sekretariat paroki pada jam kerja.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}

