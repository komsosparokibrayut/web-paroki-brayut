"use client";

import { motion } from "framer-motion";
import { Church, MapPin, Users } from "lucide-react";
import Counter from "@/components/ui/Counter";
import { type ChurchStatistics } from '@/types/data';

export default function StatsSection({ stats }: { stats: ChurchStatistics | null }) {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <section>
            <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-3xl font-bold text-brand-dark mb-6"
            >
                Data Paroki
            </motion.h2>

            <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                <motion.div variants={item} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-brand-blue/10 p-3">
                            <Church className="h-8 w-8 text-brand-blue" />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-brand-dark flex items-center">
                                <Counter value={stats?.churches || 5} />
                            </div>
                            <div className="text-sm text-gray-600">Gereja</div>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={item} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-brand-blue/10 p-3">
                            <MapPin className="h-8 w-8 text-brand-blue" />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-brand-dark flex items-center">
                                <Counter value={stats?.wards || 0} />
                            </div>
                            <div className="text-sm text-gray-600">Lingkungan</div>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={item} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-brand-blue/10 p-3">
                            <Users className="h-8 w-8 text-brand-blue" />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-brand-dark flex items-center">
                                <Counter value={stats?.families || 0} />
                            </div>
                            <div className="text-sm text-gray-600">Keluarga (KK)</div>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={item} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-brand-blue/10 p-3">
                            <Users className="h-8 w-8 text-brand-blue" />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-brand-dark flex items-center">
                                <Counter value={stats?.parishioners || 0} />
                            </div>
                            <div className="text-sm text-gray-600">Umat</div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            <p className="text-sm text-gray-500 mt-4">
                * Data statistik {stats?.lastUpdated
                    ? `terakhir diperbarui: ${new Date(stats.lastUpdated).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
                    : 'akan diperbarui dari sistem manajemen paroki'}
            </p>
        </section>
    );
}
