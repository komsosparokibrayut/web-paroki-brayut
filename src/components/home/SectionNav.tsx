"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Home, Users, Calendar, Newspaper, Heart } from "lucide-react";

const sections = [
    { id: "hero", label: "Beranda", icon: Home },
    { id: "identity", label: "Tentang", icon: Users },
    { id: "worship", label: "Jadwal", icon: Calendar },
    { id: "stories", label: "Berita", icon: Newspaper },
    { id: "donation", label: "Donasi", icon: Heart },
];

export default function SectionNav() {
    const [activeSection, setActiveSection] = useState("hero");

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + window.innerHeight / 3;

            // Get all sections
            const sectionElements = sections.map(section => ({
                id: section.id,
                element: document.getElementById(section.id)
            }));

            // Find which section is currently in view
            for (let i = sectionElements.length - 1; i >= 0; i--) {
                const section = sectionElements[i];
                if (section.element) {
                    const rect = section.element.getBoundingClientRect();
                    const elementTop = rect.top + window.scrollY;

                    if (scrollPosition >= elementTop) {
                        setActiveSection(section.id);
                        break;
                    }
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll(); // Check initial position

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <nav className="fixed left-8 top-1/2 -translate-y-1/2 z-50 hidden xl:block">
            <div className="flex flex-col gap-4">
                {sections.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;

                    return (
                        <button
                            key={section.id}
                            onClick={() => scrollToSection(section.id)}
                            className="group relative flex items-center"
                            aria-label={section.label}
                        >
                            {/* Dot indicator */}
                            <div className={cn(
                                "w-3 h-3 rounded-full border-2 transition-all duration-300",
                                isActive
                                    ? "bg-brand-gold border-brand-gold scale-125"
                                    : "bg-transparent border-gray-400 hover:border-brand-dark hover:scale-110"
                            )} />

                            {/* Tooltip */}
                            <div className={cn(
                                "absolute left-6 whitespace-nowrap px-3 py-2 rounded-lg bg-white shadow-lg border border-gray-100 opacity-0 pointer-events-none transition-all duration-200 group-hover:opacity-100 group-hover:left-8",
                                "flex items-center gap-2"
                            )}>
                                <Icon className="h-4 w-4 text-brand-blue" />
                                <span className="text-sm font-bold text-brand-dark">
                                    {section.label}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
