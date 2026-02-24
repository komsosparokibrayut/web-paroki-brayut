"use client";

import { motion } from "framer-motion";
import { Church, Users, MapPin, Landmark, BookOpen, ArrowUpRight } from "lucide-react";
import Link from "next/link";

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
        <motion.div {...fadeUp} className="flex items-center justify-center text-center gap-4 my-8">
            <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-brand-dark tracking-tight leading-tight">
                    {title}
                </h2>
                {subtitle && (
                    <p className="text-brand-blue/70 text-sm font-medium mt-0.5">{subtitle}</p>
                )}
            </div>
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

const umatData = [
    { year: "2018", count: "2.186", label: "Berdiri" },
    { year: "2019", count: "2.183", label: "" },
    { year: "2020", count: "2.247", label: "Puncak" },
    { year: "2021", count: "2.067", label: "" },
    { year: "2022", count: "2.060", label: "" },
    { year: "2023", count: "2.023", label: "" },
];

function StatGrid() {
    return (
        <motion.div {...fadeUp} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 my-8 w-full">
            {umatData.map((item, i) => {
                return (
                    <motion.div
                        key={item.year}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: i * 0.07 }}
                        className="relative rounded-xl p-4 text-center border transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 bg-brand-gold/10 border-brand-gold/30 flex flex-col justify-center"
                    >
                        <div className="text-xs font-bold tracking-wider uppercase mb-1 text-gray-400">
                            {item.year}
                        </div>
                        <div className="text-xl md:text-2xl font-extrabold tracking-tight text-brand-dark">
                            {item.count}
                        </div>
                        {item.label && (
                            <div className="text-[10px] font-semibold mt-1 uppercase tracking-widest text-brand-gold">
                                {item.label}
                            </div>
                        )}
                    </motion.div>
                );
            })}

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: umatData.length * 0.07 }}
                className="col-span-1"
            >
                <Link href="/profil/wilayah" className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-brand-gold/30 h-full w-full justify-center hover:bg-brand-dark hover:text-white transition-all select-none bg-white">
                    <span className="font-serif text-sm font-bold italic text-center leading-tight">Data<br />Terkini</span>
                    <ArrowUpRight className="h-6 w-6 group-hover:rotate-45 transition-transform duration-500" />
                </Link>
            </motion.div>
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

export default function SejarahDetail() {
    return (
        <div className="space-y-2">
            {/* ─── Page Title ─── */}
            <motion.div {...fadeUp} className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-extrabold text-brand-dark tracking-tight">
                    Sejarah Paroki St. Yohanes Paulus II Brayut
                </h1>
                <div className="mx-auto mt-4 w-16 h-1 bg-brand-gold rounded-full" />
            </motion.div>

            {/* ═══════════════════════════════════════ */}
            {/* SECTION 1 — Tahap Pertumbuhan          */}
            {/* ═══════════════════════════════════════ */}
            <section>
                <SectionHeader
                    title="Tahap Pertumbuhan"
                    subtitle="2012 – 2013"
                />

                <Paragraph>
                    Tahap Pertumbuhan dalam sejarah Paroki St Yohanes Paulus II Brayut ditandai sejak 15 Juli 2012, saat Romo Petrus Tri Margana, Pr dan Romo Yulius Sukardi, Pr mulai berkarya sebagai gembala Paroki St Aloysius Gonzaga Mlati, sampai masa pembentukan Pusat Pastoral Wilayah.
                </Paragraph>
                <Paragraph>
                    Kegiatan pertama yang dilaksanakan dewan paroki bersama ketua-ketua wilayah adalah proaktif menyapa umat di lingkungan-lingkungan yang diakhiri dengan misa kudus. Sapaan konkret setelah Misa Kudus juga dilakukan untuk semakin mendekatkan gembala dengan umat. Sejalan dengan Arah Dasar KAS 2011-2015, terutama pada <i>pilar iman mendalam dan tangguh</i>, melalui kunjungan yang disampaikan pada waktu homili, romo mengajak dan mendorong umat agar proaktif sehingga dapat terus mengimani ajaran gereja, melalui pendalaman Kitab Suci.
                </Paragraph>
                <Paragraph>
                    Berdasarkan hasil kunjungan kepada umat di lingkungan, Romo, Dewan Paroki, dan ketua-ketua wilayah menemukan berbagai potensi dan permasalahan. Memperhatikan Perkembangan jumlah umat Paroki St. Aloysius Gonzaga Mlati yang tercatat pada akhir tahun 2014 sejumlah 6.657 jiwa, agar peran umat untuk lebih terlibat dalam berpastoral serta mempertimbangkan kondisi geografis terkait aksesibilitas Gedung gereja Mlati, maka:
                </Paragraph>

                <ol className="space-y-4 my-6 list-none pl-0">
                    <NumberedItem num={1}>
                        <div>
                            Paroki St. Aloysius Gonzaga Mlati terdiri dari 16 wilayah dan 68 lingkungan, maka sejak bulan Juni 2013 mulai berproses untuk mengambil kebijakan pengelompokan wilayah pastoral. Paroki St. Aloysius Gonzaga Mlati dikelompokan menjadi 3 (tiga) Pusat Pastoral Wilayah (PPW):
                        </div>
                    </NumberedItem>
                </ol>

                {/* PPW Cards */}
                <motion.div {...fadeUp} className="grid md:grid-cols-3 gap-4 my-6 pl-0 md:pl-12">
                    {[
                        {
                            name: "PPW St. Petrus",
                            umat: "2.262",
                            wilayah: "Warak, Plasa Panca, Bolawen, Getas, Cebongan",
                            accent: "border-brand-blue",
                        },
                        {
                            name: "PPW St. Yohanes Paulus II",
                            umat: "2.172",
                            wilayah: "Donoharjo Utara, Donoharjo Selatan, Tambakrejo, Dukuh, Brekisan",
                            accent: "border-brand-gold",
                        },
                        {
                            name: "PPW Pusat Pastoral Induk",
                            umat: "2.223",
                            wilayah: "Mlati, Ratu Rosari, Tridadi, Duwet, Kronggahan, Karangmloko",
                            accent: "border-brand-blue",
                        },
                    ].map((ppw, i) => (
                        <motion.div
                            key={ppw.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className={`bg-white rounded-xl border-t-4 ${ppw.accent} p-5 shadow-sm hover:shadow-md transition-shadow`}
                        >
                            <h4 className="text-sm font-bold text-brand-dark mb-1">{ppw.name}</h4>
                            <div className="text-2xl font-extrabold text-brand-blue mb-2">
                                {ppw.umat} <span className="text-sm font-medium text-gray-400">jiwa</span>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">{ppw.wilayah}</p>
                        </motion.div>
                    ))}
                </motion.div>

                <ol className="space-y-4 my-6 list-none pl-0" start={2}>
                    <NumberedItem num={2}>
                        Kebijakan pengelompokan tersebut secara efektif dimulai pada tanggal 25 November 2013.
                    </NumberedItem>
                    <NumberedItem num={3}>
                        Untuk mengefektifkan pelayanan pada ke 3 PPW tersebut telah dibentuk kepengurusan dengan susunan sama seperti kepengurusan Dewan Paroki Mlati. Tata kerja kepengurusan tersebut berada pada koordinasi dan supervisi dari Dewan Paroki Mlati, Sejak tahun 2014, ke 3 PPW tersebut telah membuat dan melaksanakan RAPB, serta melaporkan penggunaan keuangan dengan memanfaatkan aplikasi yang disyaratkan oleh Keuskupan Agung Semarang.
                    </NumberedItem>
                    <NumberedItem num={4}>
                        Pada tahun 2014 Paroki Mlati dilayani oleh 3 Romo, sehingga pada ke 3 PPW tersebut telah terjadwal secara rutin misa harian. Hal ini mendapat tanggapan yang positif dari umat sehingga pembagian petugas misa harian dibagi per lingkungan.
                    </NumberedItem>
                </ol>
            </section>

            <SectionDivider />

            {/* ═══════════════════════════════════════ */}
            {/* SECTION 2 — Tahap Perkembangan         */}
            {/* ═══════════════════════════════════════ */}
            <section>
                <SectionHeader
                    title="Tahap Perkembangan"
                    subtitle="2014 – 2018"
                />

                <Paragraph>
                    Tahap Perkembangan adalah masa pertumbuhan umat dari pelayanan Pusat Pastoral Wilayah sampai menjadi Paroki. Tahap demi tahap Pusat Pastoral Wilayah Utara diberikan tanggung jawab yang lebih besar dalam rangka menciptakan kemandirian umat. Misa wilayah yang sebelumnya diselenggarakan hanya satu kali sebulan di setiap gereja, kemudian ditingkatkan dua kali sebulan di setiap gereja, sehingga umat tidak harus lagi mengikuti misa di paroki induk. Penyelenggaraan misa perayaan Natal dan Paskah dipusatkan di Gereja Santo Yusup Tambakrejo dengan panitia meliputi umat lima wilayah.
                </Paragraph>
                <Paragraph>
                    Memasuki awal tahun 2014, umat katolik Pusat Pastoral Wilayah Utara diminta menetapkan santo pelindung wilayahnya. Dengan pertimbangan spiritualitas Yohanes Paulus II akhirnya pengurus, ketua wilayah dan ketua lingkungan menetapkan Pusat Pastoral Wilayah Utara dengan Pelindung Yohanes Paulus II.
                </Paragraph>

                <CalloutBox>
                    Lokasi lima gereja yang tersebar di 5 tempat, memunculkan konsep <strong>Gereja Diaspora</strong> — sebuah semangat pastoral yang merangkul keterbatasan geografis sebagai kekuatan persatuan.
                </CalloutBox>

                <Paragraph>
                    Perkembangan begitu cepat, sebagai tindak lanjut ide tersebut, dibentuk panitia pengadaan tanah untuk Pastoran, sekaligus kantor sekretariat paroki. Panitia bekerja dan mendapatkan tanah seluas 2.056 m² di Dusun Brayut Desa Pandowoharjo, Kapanewon Sleman. Lokasinya sangat strategis terletak di Desa wisata budaya Brayut yang sudah terkenal dan jadi tujuan bagi turis lokal maupun mancanegara, persis di tengah-tengah lima gereja yang ada, dari lokasi hanya sekitar 5-10 menit menuju gereja, dengan fasilitas jalan aspal. Menanggapi rencana tersebut, seluruh gereja wilayah pun mulai membenahi dan memperluas fasilitas masing-masing.
                </Paragraph>
                <Paragraph>
                    Dalam masa transisi dari Pusat Pastoral Wilayah (PPW) menjadi paroki, dilakukan berbagai langkah antara lain menata kembali organisasi, pengurus dan sistem administrasi sumber daya untuk mendukung laporan akuntabilitas. Mulai April 2014 umat tidak lagi ke paroki induk Santo Aloysius Gonzaga Mlati. Sambil menunggu pembangunan pastoran, sekretariat paroki sementara menempati Gereja Santo Yusup Tambakrejo.
                </Paragraph>

                {/* Milestone strip */}
                <motion.div {...fadeUp} className="bg-brand-warm rounded-2xl p-6 md:p-8 my-8">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex gap-4 items-start">
                            <span className="shrink-0 w-10 h-10 rounded-lg bg-brand-blue text-white flex items-center justify-center text-lg font-bold">🏗️</span>
                            <div>
                                <h4 className="font-bold text-brand-dark text-sm mb-1">Pembangunan Pastoran</h4>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    IMB terbit 7 November 2016. Gedung Pastoran, Joglo, dan Limasan dibangun dengan anggaran Rp 2,4 Milyar, selaras dengan identitas Desa Wisata dan Budaya.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <span className="shrink-0 w-10 h-10 rounded-lg bg-brand-gold text-white flex items-center justify-center text-lg font-bold">⛪</span>
                            <div>
                                <h4 className="font-bold text-brand-dark text-sm mb-1">Pemberkatan 20 Juli 2017</h4>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Bangunan pastoran diberkati oleh Bapa Uskup Mgr. Robertus Rubiyatmoko.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <CalloutBox>
                    Berdasarkan SK Pendirian Paroki Nomor 1376/B/I/b-140/18 tertanggal 30 November 2018, mulai tanggal <strong>25 Desember 2018</strong> Paroki St. Yohanes Paulus II Brayut resmi berdiri menjadi <strong>Paroki Mandiri</strong> dengan 5 wilayah dan 23 lingkungan. Misa Kepyakan sebagai penanda peresmian dipimpin langsung oleh Bapa Uskup pada 31 Desember 2018.
                </CalloutBox>
            </section>

            <SectionDivider />

            {/* ═══════════════════════════════════════ */}
            {/* SECTION 3 — Pemekaran Teritori          */}
            {/* ═══════════════════════════════════════ */}
            <section>
                <SectionHeader
                    title="Pemekaran Teritori"
                    subtitle="2019"
                />

                <SubSectionHeader title="Pemekaran Wilayah" />

                <Paragraph>
                    Pada bulan April 2019 ketika Romo Petrus Tri Margana, Pr mengikuti suatu pertemuan di Baturaden, di sela-sela acara, sekitar Pukul 21.15 WIB beliau datang menemui Bp. Subardjo dan mengutarakan gagasan menggunakan rumah Trah Harjosumarto di Dukuh sebagai rumah ibadah untuk misa rutin. Bp. Subardjo menyampaikan bahwa keputusan tidak dapat diambil secara sepihak karena rumah tersebut adalah milik trah.
                </Paragraph>
                <Paragraph>
                    Bp. Subardjo menyampaikan permohonan Romo Petrus kepada saudara-saudara melalui WAG Trah Harjosumarto, dan disepakati akan diadakan pertemuan Trah pada liburan Idhul Fitri.
                </Paragraph>
                <Paragraph>
                    Pada tanggal 6 Juni 2019 terjadi pertemuan keluarga Trah Harjosumarto yang dihadiri oleh semua anak Bapak Ibu Harjosumarto yang masih hidup (4 orang) beserta keluarga. Beberapa pokok pembicaraan:
                </Paragraph>

                <ul className="space-y-3 my-6 list-none pl-0">
                    <BulletItem>
                        Romo Synesius Suyitna, SJ mengingatkan kembali sejarah rumah trah, berkaitan dengan pembagian warisan dari alm. Bapak Ibu Harjosumarto.
                    </BulletItem>
                    <BulletItem>
                        Bp. Subardjo menjelaskan maksud dan keinginan pihak Paroki Brayut mengembangkan Wilayah Dukuh, serta keinginannya agar rumah Trah Harjosumarto boleh dipakai untuk menyelenggarakan misa secara rutin.
                    </BulletItem>
                    <BulletItem>
                        Sejarah berkaitan dengan upaya alm. Fransiskus Xaverius Harjosumarto yang dengan gigih merasul menanamkan Iman Katolik, yang bermula dari rumah Trah ini.
                    </BulletItem>
                    <BulletItem>
                        Romo B. Sudjarwo, Pr semasa hidup sudah punya rencana agar rumah Trah di masa depan bisa digunakan untuk kepentingan banyak orang — kegiatan pembinaan rohani, retret atau pertemuan umat.
                    </BulletItem>
                    <BulletItem>
                        Semua anggota trah menyatakan tidak keberatan bahwa kedepannya tanah dan rumah ini dipakai untuk kepentingan Gereja.
                    </BulletItem>
                    <BulletItem>
                        Masih perlu diperjelas mengenai pengelolaan, status tanah, dan rumah selanjutnya. Bp. Subardjo dimohon untuk berkomunikasi dengan pihak Paroki Brayut.
                    </BulletItem>
                </ul>

                <Paragraph>
                    Pada hari Senin, 22 Juli 2019 di Pendopo rumah Trah berlangsung pertemuan antara Tim Paroki Brayut dan Perwakilan keluarga Harjosumarto, dihadiri juga perwakilan FKUB Kabupaten Sleman. Tercapai kesepakatan hibah yang akan disahkan pada 3 Agustus 2019.
                </Paragraph>
                <Paragraph>
                    Setelah kejelasan hibah, pada Minggu 28 Juli 2019 diadakan kerja bakti masal untuk mempersiapkan rumah sebagai tempat ibadah. Misa berlangsung rutin setiap Sabtu pada Minggu pertama dan ketiga. Pada tanggal 3 Agustus 2019 misa serah terima hibah dihadiri oleh 277 umat.
                </Paragraph>
                <Paragraph>
                    Pada perayaan peringatan Gereja Venantius Dukuh, diumumkan bahwa Wilayah Santo Venantius Dukuh dimekarkan menjadi dua, yaitu <strong>Wilayah Santo Venantius Ngelo</strong> dan <strong>Wilayah Santo Fransiskus Xaverius Dukuh</strong>.
                </Paragraph>
                <Paragraph>
                    Setelah pemekaran, jumlah wilayah menjadi 6 (enam) dengan penamaan disesuaikan nama dusun: Wilayah Santo Petrus Kayunan, Wilayah Santo Paulus Karanglo, Wilayah Santo Yakobus Rasul Tambakrejo, Wilayah Santo Yohanes Karangkepuh, Wilayah Santo Venantius Ngelo, dan Wilayah Santo Fransiskus Xaverius Dukuh.
                </Paragraph>
            </section>

            <SectionDivider />

            {/* ═══════════════════════════════════════ */}
            {/* SECTION 4 — Pemekaran Lingkungan        */}
            {/* ═══════════════════════════════════════ */}
            <section>
                <SectionHeader
                    title="Pemekaran Lingkungan"
                    subtitle="2019"
                />

                <Paragraph>
                    Menindaklanjuti pemekaran Wilayah Dukuh, pada pertemuan tanggal 24 Juli 2019, Lingkungan Santo Fransiskus Xaverius Dukuh dimekarkan menjadi dua lingkungan, yaitu Lingkungan Andreas Dukuh dan Lingkungan Vinsensius Dukuh, dihadiri oleh 61 orang.
                </Paragraph>
                <Paragraph>
                    Dengan demikian Wilayah Fransiskus Xaverius Dukuh terdiri dari tiga lingkungan: Lingkungan Andreas Dukuh, Lingkungan Vinsensius Dukuh dan Lingkungan Kristophorus Saron. Pada tanggal 6 Agustus 2019, dilantik Pengurus Wilayah serta Pengurus Lingkungan.
                </Paragraph>
                <Paragraph>
                    Dalam rapat DPP Brayut pada 8 September 2019, Romo Petrus Tri Margana, Pr. menyampaikan gagasan agar lingkungan-lingkungan dengan jumlah warga besar melakukan pemekaran demi keterlibatan umat yang lebih luas.
                </Paragraph>

                {/* Pemekaran detail cards */}
                <motion.div {...fadeUp} className="grid md:grid-cols-2 gap-4 my-8">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="text-brand-gold font-bold text-xs uppercase tracking-wider mb-2">1 Desember 2019</div>
                        <h4 className="font-bold text-brand-dark mb-2">Lingkungan Maria Goretti</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Lingkungan Maria (50 KK) dimekarkan. Setelah pemekaran — Lingkungan Maria: 34 KK, Lingkungan Maria Goretti: 16 KK. Kedua lingkungan dihubungkan oleh jalan menuju Gereja St. Yosef Karanglo.
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="text-brand-gold font-bold text-xs uppercase tracking-wider mb-2">31 Desember 2019</div>
                        <h4 className="font-bold text-brand-dark mb-2">Lingkungan Yohanes Maria Vianney</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Lingkungan St. Yohanes De Britto dimekarkan menjadi Lingkungan St. Yohanes De Britto dan Lingkungan St. Yohanes Maria Vianney. (SK Pastor Paroki No. 01/YP.II/XII/2019)
                        </p>
                    </div>
                </motion.div>
            </section>

            <SectionDivider />

            {/* ═══════════════════════════════════════ */}
            {/* SECTION 5 — Perkembangan Umat & Fisik  */}
            {/* ═══════════════════════════════════════ */}
            <section>
                <SectionHeader
                    title="Perkembangan Umat dan Fisik Gereja"
                    subtitle="2018 – Terkini"
                />

                <SubSectionHeader title="Perkembangan Umat" />

                <Paragraph>
                    Berdasarkan data litbang Paroki, sejak berdiri pada 25 Desember 2018, jumlah umat Paroki St. Yohanes Paulus II Brayut adalah 2.186 umat. Pada tahun 2021 paroki mengikuti anjuran KAS untuk menggunakan sistem pendataan elektronik standar Keuskupan Agung Semarang.
                </Paragraph>

                <Paragraph className="text-sm font-medium text-gray-500">
                    Berikut data perkembangan jumlah umat Paroki Brayut dari tahun 2018-2023:
                </Paragraph>

                <StatGrid />

                <SubSectionHeader title="Perkembangan Fisik Gereja" />

                <Paragraph>
                    Paroki St. Yohanes Paulus II Brayut memiliki 5 gereja yang berada di 5 wilayah. Pada perkembangannya terjadi pemekaran Wilayah St. Venantius Dukuh menjadi 2 — Wilayah Ngelo dan Wilayah Dukuh — sehingga kini Paroki memiliki 6 gereja.
                </Paragraph>

                <CalloutBox>
                    Pada tanggal <strong>7 Maret 2023</strong>, berdasarkan SK Uskup Agung Semarang Nomor 0257/B/I/b-140/2023, Gereja St. Yusup Tambakrejo ditetapkan sebagai pusat Paroki dan diubah namanya menjadi <strong>Gereja Paroki Santo Yohanes Paulus II Brayut</strong>. Kini Paroki Brayut membina <strong>1 gereja paroki</strong> dan <strong>5 gereja wilayah</strong>.
                </CalloutBox>
            </section>
        </div>
    );
}
