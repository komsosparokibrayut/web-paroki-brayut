"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Clock, Calendar, MapPin, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { ScheduleEvent, SpecialMassEvent } from "@/types/data";
import { useState, useMemo } from "react";

interface WorshipInvitationProps {
    upcomingEvents?: ScheduleEvent[];
    specialMasses?: SpecialMassEvent[];
}

const mainSchedule = [
    { day: "Minggu", time: "06.00, 08.00, 17.00 WIB", label: "Misa Mingguan" },
    { day: "Senin - Sabtu", time: "06.00 WIB", label: "Misa Harian" },
    { day: "Jumat Pertama", time: "18.30 WIB", label: "Adorasi & Misa" },
];

// Get current month and year for filtering
const getCurrentMonthYear = () => {
    const now = new Date();
    return { month: now.getMonth(), year: now.getFullYear() };
};

export default function WorshipInvitation({ upcomingEvents = [], specialMasses = [] }: WorshipInvitationProps) {
    const [selectedMonth, setSelectedMonth] = useState<string>("all");
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

    // Generate month options
    const months = [
        { value: "all", label: "Semua Bulan" },
        { value: "0", label: "Januari" },
        { value: "1", label: "Februari" },
        { value: "2", label: "Maret" },
        { value: "3", label: "April" },
        { value: "4", label: "Mei" },
        { value: "5", label: "Juni" },
        { value: "6", label: "Juli" },
        { value: "7", label: "Agustus" },
        { value: "8", label: "September" },
        { value: "9", label: "Oktober" },
        { value: "10", label: "November" },
        { value: "11", label: "Desember" },
    ];

    // Generate year options (current year and next 2 years)
    const years = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return [
            currentYear.toString(),
            (currentYear + 1).toString(),
            (currentYear + 2).toString(),
        ];
    }, []);

    // Filter special masses: remove past dates and apply month filter
    const filteredSpecialMasses = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        let filtered = specialMasses.filter((mass) => {
            // If no date is set, include it (assume it's recurring)
            if (!mass.date) return true;

            // Filter out past dates
            const massDate = new Date(mass.date);
            return massDate >= now;
        });

        // Apply month filter
        if (selectedMonth !== "all") {
            const monthNum = parseInt(selectedMonth);
            const yearNum = parseInt(selectedYear);
            filtered = filtered.filter((mass) => {
                if (!mass.date) return false;
                const massDate = new Date(mass.date);
                return massDate.getMonth() === monthNum && massDate.getFullYear() === yearNum;
            });
        } else {
            // If "all" is selected, still filter by year
            filtered = filtered.filter((mass) => {
                if (!mass.date) return true;
                const massDate = new Date(mass.date);
                return massDate.getFullYear() === parseInt(selectedYear);
            });
        }

        return filtered;
    }, [specialMasses, selectedMonth, selectedYear]);

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

                {/* Special Mass Section */}
                {specialMasses.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="max-w-5xl mx-auto mb-16"
                    >
                        <div className="text-center mb-8">
                            <h3 className="font-serif text-3xl text-brand-dark mb-4">Jadwal Misa Khusus</h3>
                            <p className="text-gray-600">Misa dengan jadwal khusus di Paroki Brayut</p>
                        </div>

                        {/* Month/Year Filter */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <SelectValue placeholder="Pilih Bulan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map((month) => (
                                        <SelectItem key={month.value} value={month.value}>
                                            {month.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger className="w-full sm:w-[150px]">
                                    <SelectValue placeholder="Pilih Tahun" />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((year) => (
                                        <SelectItem key={year} value={year}>
                                            {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Special Mass Cards */}
                        <AnimatePresence mode="wait">
                            {filteredSpecialMasses.length > 0 ? (
                                <motion.div
                                    key={`${selectedMonth}-${selectedYear}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                >
                                    {filteredSpecialMasses.map((mass) => (
                                        <Card key={mass.id} className="border-brand-gold/20 hover:border-brand-gold transition-colors">
                                            <CardContent className="p-6">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-12 h-12 bg-brand-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <Calendar className="h-6 w-6 text-brand-gold" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-lg text-brand-dark mb-2">{mass.name}</h4>
                                                        <div className="flex items-center gap-2 text-brand-gold font-semibold mb-2">
                                                            <Clock className="h-4 w-4" />
                                                            <span>{mass.time}</span>
                                                        </div>
                                                        {mass.date && (
                                                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                                                <Calendar className="h-4 w-4" />
                                                                <span>{new Date(mass.date).toLocaleDateString('id-ID', {
                                                                    weekday: 'long',
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric'
                                                                })}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                                            <MapPin className="h-4 w-4" />
                                                            <span>{mass.location}</span>
                                                        </div>
                                                        {mass.description && (
                                                            <p className="text-sm text-gray-600 mt-3 italic">{mass.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-8 text-gray-400"
                                >
                                    Tidak ada jadwal misa khusus untuk periode yang dipilih
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

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
