"use client";

import { motion } from "framer-motion";
import { Clock, Calendar, MapPin, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ScheduleEvent } from "@/types/data";

interface WorshipInvitationProps {
    upcomingEvents?: ScheduleEvent[];
}

const mainSchedule = [
    { day: "Minggu", time: "06.00, 08.00, 17.00 WIB", label: "Misa Mingguan" },
    { day: "Senin - Sabtu", time: "06.00 WIB", label: "Misa Harian" },
    { day: "Jumat Pertama", time: "18.30 WIB", label: "Adorasi & Misa" },
];

export default function WorshipInvitation({ upcomingEvents = [] }: WorshipInvitationProps) {
    return (
        <section className="min-h-screen flex items-center justify-center py-24 bg-white relative">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center justify-center text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-brand-gold font-bold tracking-widest uppercase text-sm mb-4 block">
                            Perayaan Ekaristi
                        </span>
                        <h2 className="font-serif text-4xl md:text-6xl text-brand-dark leading-tight mb-6">
                            Datang dan <br /> Rayakan Kasih-Nya
                        </h2>
                        <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
                            Ekaristi adalah sumber dan puncak kehidupan Kristiani kita. Kami mengundang Anda untuk bergabung dalam perjamuan kudus ini.
                        </p>
                    </motion.div>
                </div>

                {/* 3-Column Mass Schedule */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
                    {mainSchedule.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.7, delay: idx * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
                            className="bg-brand-warm p-10 rounded-3xl text-center group transition-colors duration-300"
                        >
                            <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center mb-6 shadow-sm transition-colors">
                                <Clock className="h-8 w-8 text-brand-gold" />
                            </div>
                            <h3 className="font-bold text-lg uppercase tracking-widest mb-2 transition-colors text-brand-dark">{item.day}</h3>
                            <p className="font-serif text-2xl mb-4 transition-colors">{item.time}</p>
                            <p className="text-sm text-gray-500 transition-colors">{item.label}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-12">
                    <Button variant="outline" className="rounded-full px-8 py-6 border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white transition-colors group" asChild>
                        <Link href="/jadwal-misa">
                            Jadwal Lengkap <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </Button>
                    <Button variant="outline" className="rounded-full px-8 py-6 border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white transition-colors group" asChild>
                        <Link href="/event">
                            Agenda Kegiatan <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
