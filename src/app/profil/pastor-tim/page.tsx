import { Metadata } from "next";
import Image from "next/image";
import { User, Phone } from "lucide-react";
import { getPastorTimKerja } from "@/actions/data";
import PageHeader from "@/components/layout/PageHeader";
import { SeksiOrganisasi, TimPelayanan, AnggotaTimKerja, Pastor } from "@/actions/data";
import { toGoogleDriveImageUrl } from "@/lib/googleDrive";

export const metadata: Metadata = {
    title: "Pastor & Tim Kerja | Paroki Brayut",
    description: "Struktur Organisasi Paroki Brayut Santo Yohanes Paulus II",
};

/* ───── Org Chart Node (single person box) ───── */
function OrgNode({
    name,
    role,
    phone,
    variant = "default",
}: {
    name: string;
    role?: string;
    phone?: string;
    variant?: "root" | "head" | "default";
}) {
    const styles = {
        root: "bg-amber-50 border-amber-300 shadow-md",
        head: "bg-blue-50 border-blue-300",
        default: "bg-white border-gray-200",
    };
    return (
        <div className={`rounded-lg border-2 px-4 py-3 min-w-[200px] max-w-[280px] ${styles[variant]} transition-shadow hover:shadow-md`}>
            <p className="font-bold text-gray-900 text-sm leading-tight">{name}</p>
            {role && <p className="text-xs text-gray-500 mt-0.5">{role}</p>}
            {phone && (
                <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400">
                    <Phone className="h-3 w-3" />
                    <span>{phone}</span>
                </div>
            )}
        </div>
    );
}

/* ───── Big Pastor Card (side-by-side layout) ───── */
function PastorCard({ pastor }: { pastor: Pastor }) {
    const imgSrc = toGoogleDriveImageUrl(pastor.imageUrl || "");
    return (
        <div className="flex-1 max-w-lg bg-white rounded-2xl shadow-lg border border-brand-blue/10 p-8 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col items-center text-center">
                <div className="mb-5">
                    {imgSrc ? (
                        <Image
                            src={imgSrc}
                            alt={pastor.name}
                            width={176}
                            height={176}
                            className="w-44 h-44 rounded-full object-cover shadow-lg ring-4 ring-brand-blue/10"
                            unoptimized
                        />
                    ) : (
                        <div className="w-44 h-44 rounded-full bg-gradient-to-br from-brand-blue/10 to-brand-blue/5 border-2 border-dashed border-brand-blue/20 flex items-center justify-center">
                            <User className="h-16 w-16 text-brand-blue/30" />
                        </div>
                    )}
                </div>
                <h3 className="text-xl font-bold text-brand-dark mb-1">{pastor.name}</h3>
                <p className="text-brand-blue font-semibold mb-4">{pastor.role}</p>

                {pastor.quote && (
                    <blockquote className="border-l-4 border-brand-blue pl-4 italic text-gray-600 mb-4 bg-brand-blue/5 py-3 pr-4 rounded-r-lg text-left w-full">
                        &quot;{pastor.quote}&quot;
                    </blockquote>
                )}

                {pastor.description && (
                    <p className="text-gray-700 mb-4 whitespace-pre-line leading-relaxed text-left w-full">
                        {pastor.description}
                    </p>
                )}

                <div className="flex flex-wrap gap-3 mt-2 justify-center">
                    {pastor.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
                            <span>{pastor.email}</span>
                        </div>
                    )}
                    {pastor.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
                            <Phone className="h-3.5 w-3.5 text-brand-blue" />
                            <span>{pastor.phone}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ───── Vertical member list under a group ───── */
function MemberList({ members }: { members: AnggotaTimKerja[] }) {
    return (
        <div className="flex flex-col items-center gap-0">
            {members.map((m, i) => (
                <div key={m.id} className="flex flex-col items-center">
                    {/* Connector line */}
                    <div className="w-px h-3 bg-gray-300" />
                    <OrgNode name={m.name} role={m.role} phone={m.phone} />
                </div>
            ))}
        </div>
    );
}

/* ───── A single department column (Bidang) ───── */
function DepartmentColumn({ section }: { section: SeksiOrganisasi }) {
    // Find the ketua (first group named "Ketua Bidang" or first group)
    const ketuaGroup = section.groups.find(g => g.name.toLowerCase().includes("ketua"));
    const otherGroups = section.groups.filter(g => g !== ketuaGroup);
    const ketua = ketuaGroup?.members[0];

    return (
        <div className="flex flex-col items-center flex-shrink-0">
            {/* Department head node */}
            <OrgNode
                name={ketua?.name || section.name}
                role={ketua?.role || section.name}
                phone={ketua?.phone}
                variant="head"
            />

            {/* Vertical line down to sub-groups */}
            {otherGroups.length > 0 && (
                <>
                    <div className="w-px h-5 bg-gray-300" />

                    {/* Sub-groups stacked vertically */}
                    <div className="flex flex-col items-center gap-0">
                        {otherGroups.map((group, i) => (
                            <div key={group.id} className="flex flex-col items-center">
                                {i > 0 && <div className="w-px h-3 bg-gray-300" />}
                                {/* Group node showing first member (or group name if multi-member) */}
                                {group.members.length === 1 ? (
                                    <OrgNode
                                        name={group.members[0].name}
                                        role={group.name}
                                        phone={group.members[0].phone}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <div className="rounded-lg border-2 border-gray-200 bg-white px-4 py-2 min-w-[200px] max-w-[280px] hover:shadow-md transition-shadow">
                                            <p className="font-semibold text-gray-700 text-xs mb-1.5">{group.name}</p>
                                            <div className="space-y-1">
                                                {group.members.map(m => (
                                                    <div key={m.id} className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                                                        <span className="text-xs text-gray-600 leading-tight">{m.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* If no ketua was found, show all groups */}
            {!ketuaGroup && otherGroups.length === 0 && section.groups.length > 0 && (
                <>
                    <div className="w-px h-5 bg-gray-300" />
                    <div className="flex flex-col items-center gap-0">
                        {section.groups.map((group, i) => (
                            <div key={group.id} className="flex flex-col items-center">
                                {i > 0 && <div className="w-px h-3 bg-gray-300" />}
                                {group.members.length === 1 ? (
                                    <OrgNode
                                        name={group.members[0].name}
                                        role={group.name}
                                        phone={group.members[0].phone}
                                    />
                                ) : (
                                    <div className="rounded-lg border-2 border-gray-200 bg-white px-4 py-2 min-w-[200px] max-w-[280px]">
                                        <p className="font-semibold text-gray-700 text-xs mb-1.5">{group.name}</p>
                                        <div className="space-y-1">
                                            {group.members.map(m => (
                                                <div key={m.id} className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                                                    <span className="text-xs text-gray-600">{m.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

/* ───── Dewan Harian as a tree ───── */
function DewanHarianChart({ section }: { section: SeksiOrganisasi }) {
    const allMembers = section.groups.flatMap(g => g.members);

    return (
        <div className="flex flex-col items-center">
            {/* Dewan Harian header box */}
            <div className="bg-blue-600 text-white rounded-lg px-6 py-3 font-bold text-sm shadow-md">
                {section.name}
            </div>
            <div className="w-px h-4 bg-gray-300" />

            {/* Members in a responsive grid */}
            <div className="relative">
                {/* Horizontal line across top */}
                <div className="hidden md:block absolute top-0 left-[calc(50%/(var(--cols)))] right-[calc(50%/(var(--cols)))] h-px bg-gray-300" style={{ left: '12.5%', right: '12.5%' }} />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {allMembers.map((m) => (
                        <div key={m.id} className="flex flex-col items-center">
                            <div className="w-px h-4 bg-gray-300 hidden md:block" />
                            <OrgNode name={m.name} role={m.role} phone={m.phone} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default async function PastorTimPage() {
    const data = await getPastorTimKerja();
    const { pastor, seksi } = data;

    // Separate Dewan Harian from Bidang sections and Adhok
    const dewanHarian = seksi.find(s => s.name.toUpperCase().includes("DEWAN"));
    const bidangSections = seksi.filter(s => s.name.toUpperCase().includes("BIDANG"));
    const adhokSections = seksi.filter(s => !s.name.toUpperCase().includes("DEWAN") && !s.name.toUpperCase().includes("BIDANG"));

    return (
        <div className="pb-12">
            <PageHeader
                title="Struktur Organisasi"
                subtitle="Paroki Brayut Santo Yohanes Paulus II"
                image="https://images.unsplash.com/photo-1639474894531-82a7fe3c5098?q=80&w=1974&auto=format&fit=crop"
                align="center"
            />

            {/* ═══════ MOBILE VIEW: Simple 1-column cards ═══════ */}
            <div className="lg:hidden max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8">
                {/* Pastor cards */}
                {pastor.length > 0 && (
                    <div>
                        <h2 className="text-xl font-bold text-brand-dark mb-4 text-center">Pastor Paroki</h2>
                        <div className="space-y-4">
                            {pastor.map((p) => (
                                <PastorCard key={p.id} pastor={p} />
                            ))}
                        </div>
                    </div>
                )}

                {/* All sections as simple cards */}
                {seksi.map((section) => (
                    <div key={section.id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                        {/* Section header */}
                        <div className="bg-brand-blue text-white px-5 py-3">
                            <h3 className="font-bold text-sm">{section.name}</h3>
                        </div>

                        {/* Groups & members */}
                        <div className="divide-y divide-gray-100">
                            {section.groups.map((group) => (
                                <div key={group.id} className="px-5 py-4">
                                    <p className="font-semibold text-brand-dark text-sm mb-2">{group.name}</p>
                                    <div className="space-y-1.5">
                                        {group.members.map((m) => (
                                            <div key={m.id} className="flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-brand-blue/40 mt-1.5 flex-shrink-0" />
                                                <div>
                                                    <span className="text-sm text-gray-800">{m.name}</span>
                                                    {m.role && <span className="text-xs text-gray-400 ml-1">— {m.role}</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* ═══════ DESKTOP VIEW: Org chart hierarchy ═══════ */}
            <div className="hidden lg:block max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col items-center">

                    {/* Pastor Paroki (big side-by-side cards) */}
                    {pastor.length > 0 && (
                        <div className="w-full max-w-4xl">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-brand-dark">Pastor Paroki</h2>
                                <p className="text-gray-500 mt-1">Pemimpin Rohani Paroki Brayut</p>
                            </div>
                            <div className="flex flex-row gap-6 justify-center items-stretch">
                                {pastor.map((p) => (
                                    <PastorCard key={p.id} pastor={p} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Connector from Pastors to Dewan Harian */}
                    {dewanHarian && (
                        <>
                            <div className="w-px h-8 bg-gray-300" />
                            <DewanHarianChart section={dewanHarian} />
                        </>
                    )}

                    {/* Bidang sections */}
                    {bidangSections.length > 0 && (
                        <>
                            <div className="w-px h-8 bg-gray-300" />
                            <div className="bg-gray-800 text-white rounded-lg px-6 py-2 font-bold text-sm shadow-md mb-0">
                                KETUA BIDANG DAN TIM PELAYANAN
                            </div>
                            <div className="w-px h-5 bg-gray-300" />

                            <div className="relative w-full">
                                <div className="org-h-line" />
                                <div className="overflow-x-auto pb-4">
                                    <div className="flex flex-row gap-4 items-start justify-center min-w-max px-4">
                                        {bidangSections.map((section) => (
                                            <div key={section.id} className="flex flex-col items-center">
                                                <div className="bg-blue-600 text-white rounded-t-lg px-4 py-2 text-xs font-bold text-center max-w-[250px] leading-tight w-full">
                                                    {section.name}
                                                </div>
                                                <div className="w-px h-3 bg-gray-300" />
                                                <DepartmentColumn section={section} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Adhok Sections */}
                    {adhokSections.length > 0 && (
                        <>
                            <div className="w-px h-8 bg-gray-300 mt-4" />
                            {adhokSections.map((section) => (
                                <div key={section.id} className="flex flex-col items-center mt-2">
                                    <div className="bg-teal-600 text-white rounded-lg px-6 py-2 font-bold text-sm shadow-md">
                                        {section.name}
                                    </div>
                                    <div className="w-px h-4 bg-gray-300" />
                                    <div className="flex flex-wrap gap-4 justify-center">
                                        {section.groups.map((group) => (
                                            <div key={group.id} className="flex flex-col items-center">
                                                <div className="rounded-lg border-2 border-teal-200 bg-teal-50 px-4 py-2 min-w-[200px] max-w-[280px]">
                                                    <p className="font-semibold text-teal-800 text-xs mb-1.5">{group.name}</p>
                                                    <div className="space-y-1">
                                                        {group.members.map(m => (
                                                            <div key={m.id} className="flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0" />
                                                                <span className="text-xs text-gray-700">{m.name}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
