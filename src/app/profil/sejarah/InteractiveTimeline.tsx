"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Users, Building, MapPin, Calendar, Leaf } from "lucide-react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

const timelineData = [
    {
        id: "era-1",
        year: "2012 - 2013",
        title: "Tahap Pertumbuhan",
        icon: Leaf,
        description: "Masa awal perintisan pembentukan Pusat Pastoral Wilayah dari Paroki St. Aloysius Gonzaga Mlati.",
        events: [
            { date: "15 Juli 2012", title: "Gembala Baru", description: "Romo Petrus Tri Margana, Pr dan Romo Yulius Sukardi, Pr mulai berkarya sebagai gembala Paroki St Aloysius Gonzaga Mlati." },
            { date: "Akhir 2012", title: "Sapaan Umat", description: "Kegiatan proaktif menyapa umat di lingkungan-lingkungan yang diakhiri misa kudus untuk menjalin kedekatan gembala dengan umat." },
            { date: "Juni 2013", title: "Pengelompokan Wilayah", description: "Merespon jumlah umat mencapai 6.657 jiwa (16 wilayah, 68 lingkungan), paroki Mlati dikelompokkan menjadi 3 Pusat Pastoral Wilayah (PPW)." },
            { date: "25 Nov 2013", title: "PPW St. Yohanes Paulus II", description: "PPW Utara terbentuk, mencakup wilayah Donoharjo Utara, Donoharjo Selatan, Tambakrejo, Dukuh, dan Brekisan (total 2.172 jiwa) berpusat di Tambakrejo." }
        ]
    },
    {
        id: "era-2",
        year: "2014 - 2018",
        title: "Tahap Perkembangan & Pendirian Paroki",
        icon: Building,
        description: "Masa transisi dan kemandirian PPW menuju Paroki Mandiri yang diiringi dengan pembangunan pusat pastoral di Dusun Brayut.",
        events: [
            { date: "Awal 2014", title: "Identitas Baru", description: "Umat PPW Utara sepakat menetapkan St. Yohanes Paulus II sebagai pelindung wilayah, misa wilayah ditingkatkan menjadi 2 kali sebulan." },
            { date: "April 2014", title: "Kemandirian Liturgi", description: "Perayaan Ekaristi dan pelaporan kegiatan mulai mandiri dikelola PPW Santo Yohanes Paulus II." },
            { date: "2015", title: "Pengadaan Lahan", description: "Panitia berhasil mendapatkan tanah seluas 2.056 m² di Desa Wisata Brayut yang strategis di tengah 5 gereja wilayah." },
            { date: "7 Nov 2016", title: "Izin Membangun", description: "Terbit IMB untuk pembangunan Pastoran Brayut. Bangunan meliputi Pastoran, Joglo, dan Limasan yang dirancang selaras dengan nuansa Desa Budaya." },
            { date: "20 Juli 2017", title: "Pemberkatan Pastoran", description: "Gedung Pastoran diberkati oleh Bapa Uskup Mgr. Robertus Rubiyatmoko dengan total anggaran mencapai Rp 2,4 Milyar." },
            { date: "25 Des 2018", title: "Berdirinya Paroki", description: "Paroki St. Yohanes Paulus II Brayut resmi berdiri menjadi Paroki Mandiri berdasarkan SK Pendirian Paroki Nomor 1376/B/I/b-140/18." },
            { date: "31 Des 2018", title: "Misa Kepyakan", description: "Diadakan Misa Kepyakan sebagai penanda peresmian paroki yang dipimpin langsung oleh Bapa Uskup." }
        ]
    },
    {
        id: "era-3",
        year: "2019",
        title: "Pemekaran Teritori & Lingkungan",
        icon: MapPin,
        description: "Pertumbuhan Gereja dan pembentukan wilayah pastoral baru untuk menanggapi kebutuhan umat yang semakin dinamis.",
        events: [
            { date: "Apr 2019", title: "Gagasan Rumah Ibadah Baru", description: "Muncul gagasan menggunakan rumah Trah Harjosumarto di Dukuh untuk memfasilitasi umat di daerah Dukuh agar lebih dekat saat beribadah rutin." },
            { date: "6 Jun 2019", title: "Kesepakatan Hibah", description: "Keluarga Trah Harjosumarto merelakan penyerahan aset mereka melihat sejarah panjang penanaman iman Katolik bermula dari rumah tersebut." },
            { date: "3 Ags 2019", title: "Peresmian St. FX Dukuh", description: "Misa serah terima hibah dihadiri 277 umat, menandai hadirnya Gereja St. Fransiskus Xaverius Dukuh." },
            { date: "Ags 2019", title: "Pemekaran Wilayah Dukuh", description: "Wilayah Dukuh dimekarkan menjadi Wilayah St. Venantius Ngelo dan Wilayah St. FX Dukuh. Paroki resmi menaungi 6 wilayah (Kayunan, Karanglo, Tambakrejo, Karangkepuh, Ngelo, Dukuh)." },
            { date: "Des 2019", title: "Pemekaran Lingkungan", description: "Lingkungan dengan jumlah umat besar (Lingkungan Maria & Lingkungan De Britto) ikut mengalami pemekaran." }
        ]
    },
    {
        id: "era-4",
        year: "2020 - Terkini",
        title: "Pusat Paroki & Penggembalaan",
        icon: Users,
        description: "Penataan pusat administrasi dan dinamika paroki sebagai pusat kegiatan pastoral umat.",
        events: [
            { date: "2021", title: "Tata Kelola Umat", description: "Penerapan sistem pendataan elektronik umat yang dianjurkan oleh standar Keuskupan Agung Semarang." },
            { date: "2018 - 2023", title: "Stabilitas Demografi", description: "Jumlah umat relatif stabil dengan angka 2.023 jiwa yang tersebar dalam 5 Wilayah dan 23 Lingkungan." },
            { date: "7 Mar 2023", title: "Penetapan Gereja Pusat", description: "SK Uskup Agung Semarang menetapkan Gereja St. Yusup Tambakrejo diubah menjadi Gereja Paroki Santo Yohanes Paulus II Brayut sebagai pusat utama. Kini paroki membina 1 gereja paroki dan 5 gereja wilayah." }
        ]
    }
];

function EraSection({ era, isLast }: { era: any; isLast?: boolean }) {
    const eraRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: eraRef,
        // Start fading in as it enters the bottom 80% of viewport
        // Start fading out as it leaves the top 20% of viewport
        offset: ["start 80%", "end 20%"]
    });

    const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);
    const y = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [30, 0, 0, -30]);

    const Icon = era.icon;

    return (
        <div ref={eraRef} className={cn("relative w-full flex flex-col md:flex-row", !isLast && "mb-20 md:mb-40")}>
            {/* Left Side: Sticky Era Title */}
            <div className="md:w-1/3 shrink-0 relative z-20">
                <motion.div
                    className="sticky top-[35vh] md:pl-0 pl-[60px]"
                    style={{ opacity, y }}
                >
                    <div className="flex items-start md:items-end flex-col md:pr-16">
                        <div className="mb-4 px-4 py-1.5 bg-brand-blue text-white rounded-full font-bold inline-block shadow-sm tracking-wide text-sm">
                            {era.year}
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark mb-4 md:text-right tracking-tight leading-tight">
                            {era.title}
                        </h2>
                        <p className="text-gray-600 md:text-right text-base leading-relaxed max-w-sm ml-0 md:ml-auto">
                            {era.description}
                        </p>
                    </div>

                    {/* Desktop Icon: perfectly centered on the line */}
                    {/* Positioned on the right edge of this md:w-1/3 container. translate-x-1/2 puts it exactly on the boundary where the line is. */}
                    <div className="hidden md:flex absolute right-0 top-0 translate-x-1/2 w-14 h-14 bg-white border-[3px] border-brand-light rounded-full items-center justify-center text-brand-blue shadow-sm transition-colors hover:border-brand-blue/50 cursor-default">
                        <Icon strokeWidth={2.5} className="w-6 h-6" />
                    </div>

                    {/* Mobile icon inside the sticky title */}
                    <div className="absolute left-[20px] -translate-x-1/2 md:hidden top-0 w-12 h-12 bg-white border-[3px] border-gray-100 rounded-full flex items-center justify-center text-brand-blue shadow-sm">
                        <Icon strokeWidth={2.5} className="w-5 h-5" />
                    </div>
                </motion.div>
            </div>

            {/* Right Side: Timeline Events */}
            <div className="md:w-2/3 pl-[60px] md:pl-16 space-y-12 pb-12 mt-12 md:mt-24 relative z-10">
                {era.events.map((event: any, eventIndex: number) => (
                    <motion.div
                        key={eventIndex}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6, delay: eventIndex * 0.1 }}
                        className="relative bg-white border border-gray-100 p-6 md:p-8 rounded-2xl shadow-sm hover:shadow-lg hover:border-brand-blue/20 transition-all group hover:-translate-y-1"
                    >
                        {/* Timeline Dot (Mobile) - Left offset is 60px padding minus 20px line position = 40px */}
                        <div className="absolute md:hidden -left-[40px] top-10 w-4 h-4 bg-white border-[3px] border-gray-300 rounded-full z-[15] group-hover:border-brand-blue group-hover:bg-brand-blue/10 transition-colors -translate-x-1/2" />

                        {/* Timeline Dot (Desktop) - Left offset is pl-16 (64px) exactly placing it on the line */}
                        <div className="hidden md:block absolute -left-16 top-10 w-4 h-4 bg-white border-[3px] border-gray-300 rounded-full group-hover:border-brand-blue group-hover:bg-brand-blue/10 transition-colors z-[15] -translate-x-1/2" />

                        <div className="flex flex-col gap-2">
                            <span className="text-brand-blue font-bold text-sm bg-brand-blue/5 self-start px-3 py-1 rounded-md mb-1 border border-brand-blue/10">
                                {event.date}
                            </span>
                            <h3 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                                {event.title}
                            </h3>
                            <p className="text-gray-600 mt-2 leading-relaxed text-base">
                                {event.description}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

export default function InteractiveTimeline() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end center"]
    });

    return (
        <div className="w-full relative mt-12" ref={containerRef}>
            {/* Main Progress Line Base */}
            <div className="absolute left-[20px] md:left-1/3 top-0 bottom-0 w-0.5 bg-gray-200" />

            {/* Main Progress Line Fill */}
            <motion.div
                className="absolute left-[20px] md:left-1/3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-blue/80 to-brand-blue origin-top z-10"
                style={{ scaleY: scrollYProgress }}
            />

            <div className="flex flex-col w-full relative pt-8 pb-32">
                {timelineData.map((era, index) => (
                    <EraSection key={era.id} era={era} isLast={index === timelineData.length - 1} />
                ))}
            </div>
        </div>
    );
}

