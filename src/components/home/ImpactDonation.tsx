"use client";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { Building2, Copy, ArrowDown, Wallet, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

// Number counting animation component
interface CounterProps {
    from: number;
    to: number;
    duration?: number;
    className?: string;
    formatter?: (value: number) => string;
}

const Counter = ({ from, to, duration = 2, className, formatter }: CounterProps) => {
    const nodeRef = useRef<HTMLSpanElement>(null);
    const inView = useInView(nodeRef, { once: true });

    useEffect(() => {
        if (!inView) return;

        const node = nodeRef.current;
        const controls = {
            value: from,
            stop: false
        };

        const start = performance.now();

        const animate = (time: number) => {
            if (controls.stop) return;

            const elapsed = (time - start) / 1000;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out quart
            const ease = 1 - Math.pow(1 - progress, 4);

            const current = from + (to - from) * ease;

            if (node) {
                node.textContent = formatter ? formatter(current) : Math.round(current).toString();
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);

        return () => { controls.stop = true; };
    }, [from, to, duration, inView, formatter]);

    return <span ref={nodeRef} className={className}>{formatter ? formatter(from) : from}</span>;
}

export default function ImpactDonation({ qrCodeValue }: { qrCodeValue?: string }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLParagraphElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end end"]
    });

    const opacity = useTransform(scrollYProgress, [0.05, 0.35], [0.3, 1]);
    const x = useTransform(scrollYProgress, [0.05, 0.35], [-20, 0]);
    const color = useTransform(scrollYProgress, [0.3, 0.6], ["#6b7280", "#111827"]); // gray-500 to gray-900

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Nomor rekening berhasil disalin");
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
    };

    const targetAmount = 9448100000;
    const currentAmount = 2613402473;
    const progressPercentage = (currentAmount / targetAmount) * 100;

    return (
        <section ref={containerRef} className="relative text-gray-900">
            {/* Slide 1: Sticky Vision Section (Secondary Hero) */}
            <div className="relative min-h-screen lg:sticky lg:top-0 lg:h-screen flex items-center justify-center overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/images/carousel/LahanPembangunan.jpg"
                        alt="Lahan Pembangunan Gereja"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/90 via-brand-dark/70 to-brand-dark/30" />
                </div>

                <div className="container mx-auto px-4 relative z-10 h-full flex items-center">
                    {/* Vision Text */}
                    <div className="max-w-4xl space-y-12">
                        <div className="space-y-4">
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-brand-gold font-bold tracking-widest uppercase text-sm"
                            >
                                Pembangunan Gereja
                            </motion.span>
                            <motion.h2
                                className="font-serif text-4xl md:text-6xl text-white leading-[1.1]"
                                style={{ opacity, x }}
                            >
                                Membangun Rumah <span className="italic text-brand-gold">Tuhan</span>, <br />Membangun Masa Depan.
                            </motion.h2>
                        </div>

                        <div className="space-y-6 text-lg md:text-xl leading-relaxed text-gray-200 max-w-2xl">
                            <motion.p
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                            >
                                Kami umat di Paroki Santo Yohanes Paulus II Brayut, merencanakan untuk mengembangkan Gereja pusat yang lebih memadai dengan berbagai sarana yaitu, pastoran, taman doa, gedung pertemuan, dan ruang pelayanan.
                            </motion.p>

                            {/* Progress Bar in Slide 1 */}
                            <motion.div
                                className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-lg mt-8"
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                            >
                                <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 md:gap-0 mb-6">
                                    <div>
                                        <p className="text-sm font-bold font-serif text-gray-300 uppercase tracking-wider mb-2">Terkumpul</p>
                                        <Counter
                                            from={0}
                                            to={currentAmount}
                                            formatter={formatCurrency}
                                            className="text-3xl md:text-4xl font-bold text-white block"
                                        />
                                    </div>
                                    <div className="text-left md:text-right">
                                        <p className="text-xs font-bold font-serif text-gray-400 uppercase tracking-wider mb-1">Total Kebutuhan</p>
                                        <p className="text-xl md:text-base font-bold text-gray-300 opacity-80">{formatCurrency(targetAmount)}</p>
                                    </div>
                                </div>
                                <div className="relative h-6 w-full bg-gray-700/50 rounded-full overflow-hidden">
                                    <div
                                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-gold to-brand-warm transition-all duration-1000 ease-out"
                                        style={{ width: `${progressPercentage}%` }}
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-white/90 z-10">
                                        {progressPercentage.toFixed(1)}%
                                    </span>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-32 left-1/2 -translate-x-1/2 text-white/50 flex flex-col items-center gap-2"
                >
                    <span className="text-[10px] uppercase tracking-widest">Scroll untuk Donasi</span>
                    <ArrowDown className="h-5 w-5" />
                </motion.div>
            </div>

            {/* Slide 2: Donation Channels (Scrolls Over) */}
            <div className="relative z-20 bg-white min-h-screen flex items-center py-24 md:py-32 shadow-[0_-50px_100px_rgba(0,0,0,0.1)] rounded-t-[3rem] -mt-12 lg:-mt-8">
                <div className="container mx-auto px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16 relative">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                className="inline-block"
                            >
                                <span className="text-brand-blue font-bold tracking-widest uppercase text-sm mb-4 block">
                                    Saluran Berkat
                                </span>
                                <h2 className="font-serif text-4xl md:text-5xl text-brand-dark mb-6">
                                    Dukungan Anda Sangat Berarti
                                </h2>
                                <div className="h-1 w-24 bg-brand-gold mx-auto rounded-full" />
                            </motion.div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                            {/* Left Side: Quote & Contact 1 */}
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="lg:col-span-3 text-center lg:text-left space-y-8"
                            >
                                <blockquote className="font-serif italic text-xl text-gray-600 leading-relaxed">
                                    &quot;Hendaklah masing-masing memberikan menurut kerelaan hatinya, jangan dengan sedih hati atau karena paksaan.&quot;
                                </blockquote>
                                <div className="pt-8 border-t border-gray-100">
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Narahubung</p>
                                    <p className="font-bold text-brand-dark">Bpk. Marcus Budi Santosa</p>
                                    <p className="font-mono font-bold text-brand-blue text-sm">(+62) 812-1555-752</p>
                                </div>
                            </motion.div>

                            {/* Center: QR & Banks (Line Art Box) */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className="lg:col-span-6 relative"
                            >
                                <div className="relative overflow-hidden rounded-3xl border border-white/20 shadow-xl group/card">
                                    {/* Animated Background */}
                                    <div className="absolute inset-0 bg-brand-warm/50" />

                                    <motion.div
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            rotate: [0, 90, 0],
                                            x: [0, 100, 0],
                                            y: [0, -50, 0]
                                        }}
                                        transition={{
                                            duration: 4,
                                            repeat: Infinity,
                                            repeatType: "reverse",
                                            ease: "linear"
                                        }}
                                        className="absolute -top-[50%] -left-[20%] w-[100%] h-[100%] rounded-full bg-brand-blue/20 blur-[80px]"
                                    />

                                    <motion.div
                                        animate={{
                                            scale: [1, 1.3, 1],
                                            rotate: [0, -60, 0],
                                            x: [0, -80, 0],
                                            y: [0, 60, 0]
                                        }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            repeatType: "reverse",
                                            ease: "linear"
                                        }}
                                        className="absolute top-[20%] -right-[20%] w-[80%] h-[80%] rounded-full bg-brand-gold/20 blur-[80px]"
                                    />

                                    <motion.div
                                        animate={{
                                            scale: [1, 1.1, 1],
                                            x: [0, 40, 0],
                                        }}
                                        transition={{
                                            duration: 4,
                                            repeat: Infinity,
                                            repeatType: "reverse",
                                            ease: "easeInOut"
                                        }}
                                        className="absolute -bottom-[40%] left-[20%] w-[80%] h-[80%] rounded-full bg-blue-300/20 blur-[100px]"
                                    />

                                    {/* Glass Content Container */}
                                    <div className="relative z-10 p-8 md:p-12 backdrop-blur-sm bg-white/10 h-full">
                                        {/* Corner Accents */}
                                        <div className="absolute top-0 left-0 w-8 h-8 check-pattern border-t-2 border-l-2 border-brand-gold rounded-tl-2xl -mt-1 -ml-1" />
                                        <div className="absolute bottom-0 right-0 w-8 h-8 check-pattern border-b-2 border-r-2 border-brand-gold rounded-br-2xl -mb-1 -mr-1" />

                                        <div className="flex flex-col md:flex-row gap-8 items-center">
                                            {/* QR Code Section */}
                                            <div className="flex-1 flex flex-col items-center border-b md:border-b-0 md:border-r border-dashed border-gray-200 pb-8 md:pb-0 md:pr-8 w-full md:w-auto">
                                                <div className="relative w-48 h-48 bg-white p-2 border border-gray-100 rounded-xl mb-4 shadow-sm hover:shadow-md transition-shadow">
                                                    <QRCodeSVG
                                                        value={qrCodeValue || ""}
                                                        size={192} // 48 * 4 = 192 (w-48)
                                                        level="H"
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Scan QRIS</p>
                                            </div>

                                            {/* Bank List Section */}
                                            <div className="flex-1 w-full space-y-4">
                                                {[
                                                    { name: "Bank Mandiri", number: "137-00-1632682-5" },
                                                    { name: "Bank BRI", number: "7307-01-015723-53-5" },
                                                    { name: "Bank BCA", number: "846-703-0862" },
                                                ].map((bank, i) => (
                                                    <div
                                                        key={i}
                                                        onClick={() => handleCopy(bank.number)}
                                                        className="group flex flex-col p-4 rounded-xl border border-gray-100 hover:border-brand-blue hover:bg-brand-blue/5 transition-all cursor-pointer relative bg-white/40 hover:bg-white/80"
                                                    >
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="font-bold text-gray-900 group-hover:text-brand-blue transition-colors">{bank.name}</span>
                                                            <Copy className="h-3 w-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                        <span className="font-mono text-gray-500 group-hover:text-brand-dark transition-colors">{bank.number}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Shine Effect Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 pointer-events-none" />
                                </div>
                            </motion.div>

                            {/* Right Side: Quote & Contact 2 */}
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="lg:col-span-3 text-center lg:text-right space-y-8"
                            >
                                <blockquote className="font-serif italic text-xl text-gray-600 leading-relaxed">
                                    &quot;Sebab Allah mengasihi orang yang memberi dengan sukacita.&quot;
                                    <footer className="text-sm font-sans not-italic text-gray-400 mt-2">— 2 Korintus 9:7</footer>
                                </blockquote>
                                <div className="pt-8 border-t border-gray-100">
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Narahubung</p>
                                    <p className="font-bold text-brand-dark">Romo B. Hanjar Krisnawan, Pr</p>
                                    <p className="font-mono font-bold text-brand-blue text-sm">(+62) 813-9243-4199</p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
