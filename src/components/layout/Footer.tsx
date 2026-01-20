"use client";

import Link from "next/link";
import { MapPin, Phone, Mail, Clock, ArrowRight, Facebook, Instagram, Youtube, House, Church } from "lucide-react";
import { motion } from "framer-motion";

import Image from "next/image";

export default function Footer() {
    return (
        <footer className="bg-brand-dark text-white pt-32 pb-12 overflow-hidden relative">
            {/* Background decorative elements - Animated */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.2, 0.1],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        repeatType: "reverse"
                    }}
                    className="absolute -top-[50%] -right-[20%] w-[1000px] h-[1000px] rounded-full bg-brand-gold blur-[150px] mix-blend-screen"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.1, 0.2, 0.1],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        repeatType: "reverse",
                        delay: 1
                    }}
                    className="absolute -bottom-[20%] -left-[10%] w-[800px] h-[800px] rounded-full bg-brand-blue blur-[150px] mix-blend-screen"
                />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Top Section: Calls to Action */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-b border-white/10 pb-20 mb-20">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-6">
                            Bergabung dengan <br /> <span className="text-brand-gold italic">Keluarga Kami</span>
                        </h2>
                        <p className="text-gray-400 text-lg max-w-md mb-8">
                            Kami menantikan kehadiran Anda dalam perayaan Ekaristi dan kegiatan komunitas.
                        </p>
                        <Link href="/jadwal-misa" className="group inline-flex items-center text-lg font-bold uppercase tracking-widest hover:text-brand-gold transition-colors">
                            Lihat Jadwal Misa
                            <ArrowRight className="ml-3 h-5 w-5 transform group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-col items-start md:items-end justify-center"
                    >
                        <div className="text-left md:text-right">
                            <h3 className="font-serif text-3xl mb-4">Butuh Bantuan?</h3>
                            <a href="https://wa.me/628123456789" className="text-2xl md:text-4xl font-bold font-sans hover:text-brand-gold transition-colors block mb-2">
                                (0274) 860-9221
                            </a>
                            <p className="text-gray-500">Sekretariat Paroki (Senin - Sabtu)</p>
                        </div>
                    </motion.div>
                </div>

                {/* Middle Section: Links & Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    {/* Brand */}
                    <div className="space-y-6">
                        <div className="relative h-20 w-20">
                            <Image
                                src="/images/logo/logo.png"
                                alt="Logo Paroki Brayut"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-bold text-xl">Paroki Brayut</h4>
                            <p className="text-sm text-gray-400">Santo Yohanes Paulus II</p>
                        </div>
                        <div className="flex gap-4">
                            <a href="#" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-blue hover:text-white transition-all">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="#" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-blue hover:text-white transition-all">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="#" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-blue hover:text-white transition-all">
                                <Youtube className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-lg mb-4 uppercase tracking-wider text-white">Jelajahi</h4>
                        <ul className="space-y-2">
                            {[
                                { label: 'Profil Gereja', href: '/profil' },
                                { label: 'Jadwal Misa', href: '/jadwal-misa' },
                                { label: 'Warta Paroki', href: '/artikel' },
                                { label: 'Data UMKM', href: '/data/umkm' },
                                { label: 'Hubungi Kami', href: '/contact' }
                            ].map((item) => (
                                <li key={item.label}>
                                    <Link href={item.href} className="text-gray-300 hover:text-brand-gold transition-colors block py-1 border-b border-transparent hover:border-brand-gold/30 w-fit">
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Locations */}
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div>
                            <h4 className="flex gap-2 items-center font-bold text-lg mb-4 uppercase tracking-wider text-white">
                                <Church className="h-5 w-5 text-brand-gold mb-2" />Gereja Utama
                            </h4>
                            <address className="not-italic text-gray-300 space-y-2 leading-relaxed">
                                <p>Gereja Santo Yusuf Tambakrejo</p>
                                <p>Rejodani 1, Sariharjo, Ngaglik</p>
                                <p>Kabupaten Sleman, DIY 55581</p>
                            </address>
                        </div>
                        <div>
                            <h4 className="flex gap-2 items-center font-bold text-lg mb-4 uppercase tracking-wider text-white">
                                <House className="h-5 w-5 text-brand-gold mb-2" />Sekretariat</h4>
                            <address className="not-italic text-gray-300 space-y-2 leading-relaxed">
                                <p>Jogopaten, Pandowoharjo</p>
                                <p className="text-sm text-gray-300 mt-2">Senin - Jumat: 08.00 - 15.00</p>
                                <p className="text-sm text-gray-300">Sabtu: 08.00 - 14.00</p>
                            </address>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar - Big Text */}
                <div className="border-t border-white/10 pt-12">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-gray-500 text-sm">
                            &copy; {new Date().getFullYear()} Paroki Brayut. All rights reserved.
                        </p>
                    </div>

                    <div className="flex justify-center relative w-full overflow-x-visible -bottom-20">
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1 }}
                            aria-hidden="true"
                            className="text-[10vw] font-bold font-serif text-white/5 select-none pointer-events-none tracking-widest uppercase leading-none whitespace-nowrap"
                        >
                            PAROKI BRAYUT
                        </motion.div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
