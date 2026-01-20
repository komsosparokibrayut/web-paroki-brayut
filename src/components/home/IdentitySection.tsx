"use client";

import { motion } from "framer-motion";
import { ArrowRight, History, Users, Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function IdentitySection() {
    const links = [
        {
            label: "Sejarah Paroki",
            href: "/profil/sejarah",
            icon: History,
            desc: "Perjalanan iman sejak awal mula"
        },
        {
            label: "Pastor & Tim",
            href: "/profil/pastor-tim",
            icon: Users,
            desc: "Gembala dan pelayan umat"
        },
        {
            label: "Visi & Misi",
            href: "/profil",
            icon: Heart,
            desc: "Arah langkah gerak paroki"
        }
    ];

    return (
        <section className="py-24 md:py-32 bg-brand-warm relative overflow-hidden">
            {/* Background Texture - Subtle */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#b45309 1px, transparent 1px)', backgroundSize: '40px 40px' }}
            />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-5xl mx-auto text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-brand-gold font-bold tracking-widest uppercase text-sm mb-4 block">
                            Tentang Kami
                        </span>
                        <h2 className="font-serif text-4xl md:text-6xl text-brand-dark leading-[1.1] mb-8">
                            Gereja bukan sekadar bangunan, melainkan <span className="italic text-brand-gold">keluarga</span> yang tumbuh dalam kasih <span className="italic text-brand-gold">Kristus</span>.
                        </h2>
                        <p className="text-gray-600 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
                            Paroki kami adalah rumah bagi ribuan umat yang rindu melayani, berdoa, dan berbagi. Di sini, setiap orang memiliki tempat, dan setiap talenta dihargai.
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
                    {links.map((link, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 + 0.3 }}
                        >
                            <Link
                                href={link.href}
                                className="group block p-8 rounded-2xl bg-white border border-transparent hover:border-brand-gold/20 hover:shadow-xl transition-all duration-300 h-full text-center relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

                                <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-warm text-brand-dark group-hover:bg-brand-dark group-hover:text-brand-gold transition-colors duration-300">
                                    <link.icon className="h-8 w-8" />
                                </div>
                                <h4 className="font-serif font-bold text-gray-900 text-xl mb-3">{link.label}</h4>
                                <p className="text-sm text-gray-500 leading-relaxed mb-6">{link.desc}</p>

                                <span className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-brand-gold opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    Selengkapnya <ArrowRight className="ml-2 h-4 w-4" />
                                </span>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                    className="text-center"
                >
                    <Button variant="outline" className="rounded-full px-8 py-6 border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white transition-colors group" asChild>
                        <Link href="https://wa.me/628123456789">
                            Hubungi Sekretariat <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </Button>
                </motion.div>
            </div>
        </section>
    );
}
