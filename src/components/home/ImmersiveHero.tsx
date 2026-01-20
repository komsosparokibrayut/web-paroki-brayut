"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";

const heroImages = [
    "/images/carousel/GerejaTambakrejo.jpg",
    "/images/carousel/TestHeroImage.jpg",
    // Add more if available or duplicate for loop
];

export default function ImmersiveHero() {
    const ref = useRef(null);
    const [currentImage, setCurrentImage] = useState(0);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    // Carousel logic
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % heroImages.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section ref={ref} className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-brand-dark">
            {/* Background Carousel */}
            <motion.div style={{ y }} className="absolute inset-0 z-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentImage}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0"
                    >
                        <Image
                            src={heroImages[currentImage]}
                            alt="Hero Background"
                            fill
                            className="object-cover"
                            priority={true}
                        />
                        <div className="absolute inset-0 bg-black/50 z-10" />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-brand-dark z-10" />
                    </motion.div>
                </AnimatePresence>
            </motion.div>

            {/* Content */}
            <motion.div
                style={{ opacity }}
                className="relative z-20 text-center px-4 max-w-5xl mx-auto flex flex-col items-center justify-center h-full"
            >
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="flex flex-col items-center gap-6"
                >
                    <span className="text-white/80 font-sans tracking-[0.2em] uppercase text-sm md:text-base">
                        Selamat Datang di Rumah
                    </span>

                    <h1 className="flex flex-col items-center leading-tight">
                        <span className="font-sans font-bold text-5xl md:text-7xl lg:text-8xl text-white tracking-tight drop-shadow-lg">
                            Paroki Brayut
                        </span>
                        <span className="font-serif italic text-4xl md:text-6xl text-brand-gold mt-2 font-light">
                            Santo Yohanes Paulus II
                        </span>
                    </h1>

                    <div className="w-24 h-[1px] bg-white/30 my-6" />

                    <p className="text-white/90 text-lg md:text-xl max-w-2xl font-light leading-relaxed">
                        Membangun iman yang hidup, persaudaraan yang tulus, dan kasih yang nyata.
                    </p>
                </motion.div>
            </motion.div>

            {/* Scroll Prompt - Adjusted Positioning */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 text-white/50 flex flex-col items-center gap-2 cursor-pointer hover:text-white transition-colors"
                onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
            >
                <span className="text-[10px] uppercase tracking-[0.2em]">Discover</span>
                <div className="h-12 w-[1px] bg-gradient-to-b from-white to-transparent" />
            </motion.div>
        </section>
    );
}
