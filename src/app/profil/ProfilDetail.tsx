"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import React from "react";

const fadeUp = {
    initial: { opacity: 0, y: 32 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] as const },
};

function SectionHeader({
    title,
    subtitle,
}: {
    title: string;
    subtitle?: string;
}) {
    return (
        <motion.div {...fadeUp} className="flex flex-col items-center justify-center text-center gap-4 my-8">
            <h2 className="text-2xl md:text-3xl font-extrabold text-brand-dark tracking-tight leading-tight">
                {title}
            </h2>
            {subtitle && (
                <p className="text-brand-blue/70 text-sm font-medium mt-0.5">{subtitle}</p>
            )}
        </motion.div>
    );
}

function SubSectionHeader({ title }: { title: string }) {
    return (
        <motion.h3
            {...fadeUp}
            className="text-xl md:text-2xl font-bold text-brand-dark mt-10 mb-4 flex items-center gap-3"
        >
            <span className="w-1 h-6 bg-brand-gold rounded-full inline-block" />
            {title}
        </motion.h3>
    );
}

function Paragraph({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <motion.p
            {...fadeUp}
            className={`text-gray-700 leading-[1.85] text-base md:text-[17px] mb-5 ${className}`}
        >
            {children}
        </motion.p>
    );
}

function CalloutBox({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            {...fadeUp}
            className="relative bg-brand-warm border-l-4 border-brand-gold rounded-r-xl px-6 py-5 my-8"
        >
            <div className="absolute -left-[2px] top-4 w-2 h-2 bg-brand-gold rounded-full -translate-x-1/2" />
            <div className="text-gray-700 leading-[1.85] text-base md:text-[17px]">{children}</div>
        </motion.div>
    );
}

function NumberedItem({ num, children }: { num: number; children: React.ReactNode }) {
    return (
        <motion.li {...fadeUp} className="flex gap-4 items-start">
            <span className="shrink-0 w-8 h-8 rounded-lg bg-brand-blue/10 text-brand-blue font-bold text-sm flex items-center justify-center mt-0.5">
                {num}
            </span>
            <div className="text-gray-700 leading-[1.85] text-base md:text-[17px]">{children}</div>
        </motion.li>
    );
}

function BulletItem({ children }: { children: React.ReactNode }) {
    return (
        <motion.li {...fadeUp} className="flex gap-3 items-start">
            <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-brand-gold mt-[10px]" />
            <div className="text-gray-700 leading-[1.85] text-base md:text-[17px]">{children}</div>
        </motion.li>
    );
}

function SectionDivider() {
    return (
        <div className="flex items-center gap-4 my-12 md:my-16">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
            <div className="w-2 h-2 rounded-full bg-brand-gold/40" />
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        </div>
    );
}

const umatData = [
    { no: 1, wilayah: "ST. PAULUS KARANGLO", kosong: 0, dini: 8, anak: 23, remaja: 14, muda: 101, dewasa: 139, lanjut: 77 },
    { no: 2, wilayah: "ST. PETRUS KAYUNAN", kosong: 0, dini: 6, anak: 14, remaja: 14, muda: 81, dewasa: 126, lanjut: 66 },
    { no: 3, wilayah: "ST. YAKOBUS RASUL TAMBAKREJO", kosong: 0, dini: 13, anak: 18, remaja: 15, muda: 88, dewasa: 121, lanjut: 82 },
    { no: 4, wilayah: "ST. YOHANES KARANGKEPUH", kosong: 0, dini: 4, anak: 25, remaja: 18, muda: 123, dewasa: 174, lanjut: 118 },
    { no: 5, wilayah: "ST. VENANTIUS NGELO", kosong: 0, dini: 10, anak: 16, remaja: 19, muda: 93, dewasa: 116, lanjut: 78 },
    { no: 6, wilayah: "ST. FRANSISKUS XAVERIUS DUKUH", kosong: 0, dini: 12, anak: 14, remaja: 10, muda: 57, dewasa: 82, lanjut: 54 },
];

function UmatTable() {
    return (
        <motion.div {...fadeUp} className="overflow-x-auto my-8 border border-gray-200 rounded-xl shadow-sm">
            <table className="w-full text-sm text-left border-collapse">
                <thead className="text-xs text-brand-dark uppercase bg-brand-warm/50 border-b border-gray-200">
                    <tr>
                        <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">No</th>
                        <th className="px-4 py-3 font-semibold whitespace-nowrap">Nama Wilayah</th>
                        <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">Dini (0-5)</th>
                        <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">Anak (6-10)</th>
                        <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">Remaja (11-14)</th>
                        <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">Muda (15-35)</th>
                        <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">Dewasa (36-60)</th>
                        <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">Lanjut (&gt;60)</th>
                    </tr>
                </thead>
                <tbody>
                    {umatData.map((row) => (
                        <tr key={row.no} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-3 text-center">{row.no}</td>
                            <td className="px-4 py-3 font-medium text-brand-dark">{row.wilayah}</td>
                            <td className="px-4 py-3 text-center">{row.dini}</td>
                            <td className="px-4 py-3 text-center">{row.anak}</td>
                            <td className="px-4 py-3 text-center">{row.remaja}</td>
                            <td className="px-4 py-3 text-center">{row.muda}</td>
                            <td className="px-4 py-3 text-center">{row.dewasa}</td>
                            <td className="px-4 py-3 text-center">{row.lanjut}</td>
                        </tr>
                    ))}
                    <tr className="bg-brand-blue/5 font-semibold text-brand-dark">
                        <td className="px-4 py-3 text-center" colSpan={2}>TOTAL</td>
                        <td className="px-4 py-3 text-center">53</td>
                        <td className="px-4 py-3 text-center">110</td>
                        <td className="px-4 py-3 text-center">90</td>
                        <td className="px-4 py-3 text-center">543</td>
                        <td className="px-4 py-3 text-center">758</td>
                        <td className="px-4 py-3 text-center">475</td>
                    </tr>
                </tbody>
            </table>
        </motion.div>
    );
}

export default function ProfilDetail() {
    return (
        <div className="space-y-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
            {/* ═══════════════════════════════════════ */}
            {/* 1. PENDAHULUAN */}
            {/* ═══════════════════════════════════════ */}
            <section>
                <SectionHeader title="Pendahuluan" />

                <Paragraph>
                    Paroki adalah persekutuan umat beriman kristiani di teritori tertentu yang dibentuk secara tetap dalam keuskupan, yang reksa pastoralnya, di bawah otoritas Uskup Agung Keuskupan Agung Semarang dipercayakan kepada Pastor Paroki sebagai gembalanya sendiri. Paroki St. Yohanes Paulus II Brayut ditetapkan oleh Uskup Agung Keuskupan Agung Semarang dengan Surat Keputusan Pendirian Nomor 1376/B/I/b-140/18 pada tanggal 25 Desember 2018.
                </Paragraph>
                <Paragraph>
                    Paroki Brayut memiliki batas wilayah, baik batas pemerintahan maupun batas gerejawi. Berikut batas-batas wilayah Paroki Brayut:
                </Paragraph>

                <motion.div {...fadeUp} className="grid md:grid-cols-2 gap-6 my-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="bg-white rounded-xl border-t-4 border-brand-blue p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <h4 className="font-bold text-brand-dark mb-4 text-lg">Berdasarkan Teritori Pemerintahan</h4>
                        <ul className="space-y-3 list-none pl-0">
                            <BulletItem><strong>Utara:</strong> Kalurahan Purwobinangun, Kalurahan Donokerto</BulletItem>
                            <BulletItem><strong>Timur:</strong> Kalurahan Sardonoharjo, Kalurahan Sinduharjo</BulletItem>
                            <BulletItem><strong>Selatan:</strong> Kalurahan Sendangadi</BulletItem>
                            <BulletItem><strong>Barat:</strong> Kalurahan Tridadi, Kalurahan Trimulyo</BulletItem>
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-white rounded-xl border-t-4 border-brand-gold p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <h4 className="font-bold text-brand-dark mb-4 text-lg">Berdasarkan Teritori Gerejawi</h4>
                        <ul className="space-y-3 list-none pl-0">
                            <BulletItem><strong>Utara:</strong> Paroki St. Maria Asumpta Pakem, Paroki St. Yohanes Rasul Somohitan</BulletItem>
                            <BulletItem><strong>Timur:</strong> Paroki Keluarga Kudus Banteng</BulletItem>
                            <BulletItem><strong>Selatan:</strong> Paroki St. Aloysius Gonzaga Mlati</BulletItem>
                            <BulletItem><strong>Barat:</strong> Paroki St. Yosep Medari</BulletItem>
                        </ul>
                    </motion.div>
                </motion.div>

                <CalloutBox>
                    Realisasi programasi tahun 2024 menunjukkan dinamika yang beragam. Prosentase realisasi penerimaan tidak terikat program dan kegiatan rutin sebesar <strong>66,99%</strong>, total beban tidak terikat program sebesar <strong>71,94%</strong>. Harapannya di tahun 2025 ini program-program yang sudah disusun bisa dapat dilaksanakan dengan baik sesuai RAPB dan administrasi yang lebih tertib serta terciptanya kerjasama, sinergi yang baik antara Dewan Pastoral Paroki, Pengurus Wilayah, Pengurus Lingkungan dan seluruh umat.
                </CalloutBox>

                <Paragraph>
                    Proses pembuatan program kerja di Paroki St. Yohanes Paulus II melalui beberapa proses. Tahap pertama dengan mengumpulkan ketua bidang untuk menyampaikan program kerjanya dalam kekoordinatoran bidang agar tidak ada tumpang tindih dan terjalin kerjasama yang baik secara lintas bidang. Tahap kedua adalah dikumpulkan bersama-sama dan dikritisi, sebelum akhirnya pada tahap ketiga ditetapkan bersama dalam pertemuan pleno paroki sebagai RAPB 2025.
                </Paragraph>
            </section>

            <SectionDivider />

            {/* ═══════════════════════════════════════ */}
            {/* 2. MISI PAROKI */}
            {/* ═══════════════════════════════════════ */}
            <section>
                <SectionHeader title="Misi Paroki" />

                <Paragraph>
                    Sebagai bagian dari Keuskupan Agung Semarang, serta memperhatikan eklesial RIKAS dan Ardas serta spiritualitas Gereja Paroki St. Yohanes Paulus II, maka dirumuskan Misi dari Gereja Paroki St. Yohanes Paulus II Brayut yaitu:
                </Paragraph>

                <motion.div {...fadeUp} className="grid sm:grid-cols-2 gap-4 md:gap-6 my-8">
                    {[
                        "Mengembangkan iman umat yang mendalam dan tangguh sesuai dengan potensi paroki.",
                        "Mengembangkan keluarga, lingkungan, dan kelompok-kelompok umat.",
                        "Meningkatkan pelayanan karitatif dan pemberdayaan KLMTD.",
                        "Melengkapi Sarana Pendukung Gereja Paroki dan Tata kelola Paroki yang transparan dan akuntabel."
                    ].map((misi, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="flex items-start gap-4 p-5 rounded-xl border border-gray-100 bg-gray-50/50 hover:shadow-md transition-shadow"
                        >
                            <span className="shrink-0 w-8 h-8 rounded-lg bg-brand-blue/10 text-brand-blue font-bold text-sm flex items-center justify-center mt-1">
                                {i + 1}
                            </span>
                            <p className="text-gray-700 leading-relaxed font-medium">{misi}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            <SectionDivider />

            {/* ═══════════════════════════════════════ */}
            {/* 3. PROFIL PAROKI */}
            {/* ═══════════════════════════════════════ */}
            <section>
                <SectionHeader title="Profil Data Paroki" />

                <Paragraph>
                    Paroki St. Yohanes Paulus II berada di wilayah suburban dengan keadaan alam perkampungan, perumahan dan persawahan. Jalan yang menghubungkan antar wilayah, antara pastoran dengan setiap gereja mayoritas datar dan statusnya adalah jalan desa, sedangkan di batas selatan dan timur teritori Paroki Brayut yaitu Jl. Gito-Gati dan Jl. Palagan merupakan jalan provinsi.
                </Paragraph>
                <Paragraph className="mb-8">
                    Data umat yang sudah terdata hingga bulan Februari 2025 ini sebanyak <strong>2.029 umat katolik</strong> dan katekumen dengan rincian menurut usia formatio iman berjenjang (FIB) sebagai berikut:
                </Paragraph>

                <UmatTable />
            </section>

            <SectionDivider />

            {/* ═══════════════════════════════════════ */}
            {/* 4. POTENSI & KEPRIHATINAN */}
            {/* ═══════════════════════════════════════ */}
            <section>
                <SectionHeader title="Potensi dan Keprihatinan Paroki" />

                <SubSectionHeader title="Potensi Paroki" />

                <ul className="space-y-4 my-6 list-none pl-0">
                    <NumberedItem num={1}>Memiliki 6 gedung gereja yang terletak di masing-masing wilayah sehingga pelayanan gereja bisa lebih maksimal dan merata.</NumberedItem>
                    <NumberedItem num={2}>Memiliki tanah yang sudah disiapkan untuk Pembangunan Gereja Paroki yang lebih memadai.</NumberedItem>
                    <NumberedItem num={3}>Sebanyak 70 umat terlibat dalam kepengurusan RT/RW/Kalurahan.</NumberedItem>
                    <NumberedItem num={4}>Letak geografis paroki yang berada di area suburban menjadikan semangat gotong royong, keterlibatan umat yang baik dan tidak egoistik seperti di perkotaan.</NumberedItem>
                    <NumberedItem num={5}>Banyak umat khususnya orang muda terlibat dalam kerasulan awam seperti prodiakon muda dan katekis muda.</NumberedItem>
                    <NumberedItem num={6}>Kehidupan antar umat beragama yang harmonis di Kalurahan Pandowoharjo, Kalurahan Donoharjo, dan Kalurahan Sariharjo khususnya di Brayut, Tambakrejo dan sekitarnya.</NumberedItem>
                    <NumberedItem num={7}>Banyak orang muda yang mampu menguasai teknologi informasi.</NumberedItem>
                    <NumberedItem num={8}>
                        <div className="mb-2">Banyak umat memiliki kemampuan yang beragam dengan tingkat pendidikan tinggi yang cukup banyak secara keseluruhan:</div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 mb-2">
                            {[
                                { label: "SMA/SLTA", value: "644" },
                                { label: "Diploma 3", value: "147" },
                                { label: "Strata 1", value: "436" },
                                { label: "Strata 2", value: "53" },
                                { label: "Strata 3", value: "6" },
                            ].map((edu) => (
                                <div key={edu.label} className="bg-brand-warm/50 border border-brand-gold/20 rounded-xl p-3 text-center flex flex-col justify-center hover:shadow-sm transition-all">
                                    <span className="text-2xl font-extrabold mb-0.5">{edu.value}</span>
                                    <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase">{edu.label}</span>
                                </div>
                            ))}
                        </div>
                    </NumberedItem>
                    <NumberedItem num={9}>Gereja Brayut menarik dan dinamis contohnya dengan gedung pastoral yang terbuka yaitu limasan dan joglo pastoran Brayut yang dapat digunakan sebagai sarana umat dan masyarakat sekitar.</NumberedItem>
                    <NumberedItem num={10}>Kebudayaan mewarnai kehidupan Gereja dengan adanya paguyuban kesenian dan desa wisata.</NumberedItem>
                </ul>

                <SubSectionHeader title="Keprihatinan Paroki" />

                <ul className="space-y-4 my-6 list-none pl-0">
                    <NumberedItem num={1}>Pendidikan iman berjenjang dirasa masih kurang militan.</NumberedItem>
                    <NumberedItem num={2}>Penerimaan kas & kolekte yang masih dibawah RAB.</NumberedItem>
                    <NumberedItem num={3}>Banyak SDM yang memiliki potensi namun belum bisa bergabung dalam pelayanan maupun keterlibatan lain dalam kehidupan menggereja meskipun mayoritas umat berada dalam usia produktif 543 orang muda dengan 758 umat berusia dewasa.</NumberedItem>
                    <NumberedItem num={4}>Banyak umat yang suka memberi kritik tanpa solusi.</NumberedItem>
                    <NumberedItem num={5}>Jumlah OMK (Orang Muda Katolik) yang tidak merata di setiap wilayah sehingga keterlibatan OMK di wilayah tertentu menjadi kurang.</NumberedItem>
                    <NumberedItem num={6}>Perbedaan cara pandang orang tua dan anak berbeda serta dukungan atau komunikasi dalam keluarga yang kurang.</NumberedItem>
                    <NumberedItem num={7}>Pelayanan Romo terkendala jarak dan waktu karena letak pastoran yang terpisah dengan gedung gereja.</NumberedItem>
                </ul>
            </section>

            <SectionDivider />

            {/* ═══════════════════════════════════════ */}
            {/* 5. TUJUAN PAROKI */}
            {/* ═══════════════════════════════════════ */}
            <section>
                <SectionHeader title="Tujuan Paroki" />
                <Paragraph className="mb-10 text-center">
                    Tujuan Paroki St. Yohanes Paulus II Brayut dibagi dalam beberapa tahapan pencapaian secara berkala, yaitu jangka pendek, menengah, dan panjang.
                </Paragraph>

                <motion.div {...fadeUp} className="grid lg:grid-cols-3 gap-6 my-8 items-stretch">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 flex flex-col hover:shadow-lg transition-shadow h-full group"
                    >
                        <div className="text-brand-blue font-black text-xl mb-1">Jangka Pendek</div>
                        <div className="text-sm font-semibold text-gray-400 mb-6 tracking-wide uppercase">&lt; 1 Tahun</div>
                        <ul className="space-y-3 list-none pl-0 flex-1">
                            <BulletItem>Mempersiapkan lahan pengembangan gereja Tambakrejo.</BulletItem>
                            <BulletItem>Merapikan dan penataan administrasi.</BulletItem>
                            <BulletItem>Menghadirkan gereja yang semakin bermasyarakat dengan membuka diri serta hadir dalam gerak bersama masyarakat.</BulletItem>
                            <BulletItem>Menumbuhkan kelompok-kelompok doa di Paroki Brayut.</BulletItem>
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 flex flex-col hover:shadow-lg transition-shadow h-full group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/5 rounded-bl-full -mr-4 -mt-4" />
                        <div className="text-brand-gold font-black text-xl mb-1 relative z-10">Jangka Menengah</div>
                        <div className="text-sm font-semibold text-gray-400 mb-6 tracking-wide uppercase relative z-10">1 - 3 Tahun</div>
                        <ul className="space-y-3 list-none pl-0 flex-1 relative z-10">
                            <BulletItem>Membuat masterplan lokasi gereja pusat.</BulletItem>
                            <BulletItem>Menghidupi, mengembangkan, dan mengobarkan semangat pelayanan kepada seluruh umat dan masyarakat.</BulletItem>
                            <BulletItem>Melengkapi Sarana Pendukung Gereja Paroki dan Tata kelola Paroki yang transparan dan akuntabel.</BulletItem>
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 flex flex-col hover:shadow-lg transition-shadow h-full group"
                    >
                        <div className="text-brand-blue font-black text-xl mb-1">Jangka Panjang</div>
                        <div className="text-sm font-semibold text-gray-400 mb-6 tracking-wide uppercase">3 - 5 Tahun</div>
                        <ul className="space-y-3 list-none pl-0 flex-1">
                            <BulletItem>Mewujudkan masterplan gereja pusat.</BulletItem>
                            <BulletItem>Mewujudkan sentralisasi pelayanan paroki yang berbasis/terpusat di paroki dan rasa memiliki sebagai satu paroki.</BulletItem>
                        </ul>
                    </motion.div>
                </motion.div>
            </section>
        </div>
    );
}
