"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button, buttonVariants } from "@/components/ui/button";

interface NavItem {
    title: string;
    href?: string;
    items?: NavItem[];
}

const navItems: NavItem[] = [
    {
        title: "Profil Gereja",
        items: [
            { title: "Profil & Selayang Pandang", href: "/profil" },
            { title: "Sejarah", href: "/profil/sejarah" },
            { title: "Pastor Paroki dan Tim Kerja", href: "/profil/pastor-tim" },
            { title: "Lingkungan", href: "/profil/lingkungan" },
        ],
    },
    {
        title: "Gereja",
        items: [
            { title: "Gereja 1", href: "/gereja/gereja-1" },
            { title: "Gereja 2", href: "/gereja/gereja-2" },
            { title: "Gereja 3", href: "/gereja/gereja-3" },
            { title: "Gereja 4", href: "/gereja/gereja-4" },
            { title: "Gereja 5", href: "/gereja/gereja-5" },
        ],
    },
    {
        title: "Informasi",
        items: [
            { title: "Warta Paroki", href: "/artikel" },
            { title: "Event", href: "/event" },
            { title: "Formulir Gereja", href: "/data/formulir" },
        ],
    },
    {
        title: "Data UMKM",
        href: "/data/umkm",
    },
];

const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        className
                    )}
                    {...props}
                >
                    <div className="text-sm font-medium leading-none">{title}</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {children}
                    </p>
                </a>
            </NavigationMenuLink>
        </li>
    );
});
ListItem.displayName = "ListItem";

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [isScrolled, setIsScrolled] = React.useState(false);
    const [isOverFooter, setIsOverFooter] = React.useState(false);
    const [expandedItem, setExpandedItem] = React.useState<string | null>(null);

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);

            // Check footer intersection
            const footer = document.querySelector('footer');
            if (footer) {
                const rect = footer.getBoundingClientRect();
                // If footer is approaching the top (approx navbar height + buffer)
                // Use smaller threshold to ensure valid overlap before switching
                setIsOverFooter(rect.top <= 10);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Lock body scroll when menu is open
    React.useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [mobileMenuOpen]);

    return (
        <header
            className={cn(
                "fixed top-0 z-50 w-full transition-all duration-300 flex justify-center",
                isScrolled ? "pt-12 lg:pt-4 pr-4" : "py-6"
            )}
        >
            <nav
                className={cn(
                    "flex items-center justify-between px-4 sm:px-6 lg:px-8 transition-all duration-500 ease-in-out relative z-50",
                    isOverFooter && !mobileMenuOpen
                        ? "w-[95%] md:w-[90%] max-w-6xl bg-white/90 backdrop-blur-xl shadow-sm border border-white/20 rounded-full py-3"
                        : isScrolled && !mobileMenuOpen
                            ? "w-[95%] md:w-[90%] max-w-6xl backdrop-blur-xl shadow-sm border border-white/20 rounded-full py-3"
                            : "w-full max-w-7xl bg-transparent py-4"
                )}
            >
                {/* Logo */}
                <div className="flex lg:flex-1">
                    <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-3 group relative z-50">
                        <div className="relative h-10 w-10 overflow-hidden transition-transform duration-300 group-hover:scale-110">
                            <Image
                                src="/images/logo/logo.png"
                                alt="Logo Paroki"
                                fill
                                className="object-contain"
                                sizes="40px"
                            />
                        </div>
                        <div className="block">
                            <div className={cn(
                                "text-sm font-bold transition-colors",
                                mobileMenuOpen ? "text-brand-dark" : (isScrolled ? "text-brand-dark" : "text-white")
                            )}>Paroki Brayut</div>
                            <div className={cn(
                                "text-xs transition-colors",
                                mobileMenuOpen ? "text-gray-500" : (isScrolled ? "text-gray-500" : "text-white/80")
                            )}>Santo Yohanes Paulus II</div>
                        </div>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex lg:gap-x-8 lg:items-center">
                    <NavigationMenu>
                        <NavigationMenuList>
                            {navItems.map((item) => (
                                <NavigationMenuItem key={item.title}>
                                    {item.items ? (
                                        <>
                                            <NavigationMenuTrigger
                                                className={cn(
                                                    "bg-transparent focus:bg-white/10",
                                                    isScrolled ? "text-brand-dark hover:bg-black/5" : "text-white hover:text-white hover:bg-white/10"
                                                )}
                                            >
                                                {item.title}
                                            </NavigationMenuTrigger>
                                            <NavigationMenuContent>
                                                <ul className="grid w-max min-w-[100px] gap-3 p-4 md:block">
                                                    {item.items.map((subItem) => (
                                                        <ListItem
                                                            key={subItem.title}
                                                            title={subItem.title}
                                                            href={subItem.href}
                                                        >
                                                        </ListItem>
                                                    ))}
                                                </ul>
                                            </NavigationMenuContent>
                                        </>
                                    ) : (
                                        <NavigationMenuLink asChild>
                                            <Link
                                                href={item.href || "#"}
                                                className={cn(
                                                    navigationMenuTriggerStyle(),
                                                    "bg-transparent",
                                                    isScrolled ? "text-brand-dark hover:bg-black/5" : "text-white hover:text-white hover:bg-white/10"
                                                )}
                                            >
                                                {item.title}
                                            </Link>
                                        </NavigationMenuLink>
                                    )}
                                </NavigationMenuItem>
                            ))}
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                {/* CTA Buttons */}
                <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-3">
                    <Link
                        href="/jadwal-misa"
                        className={cn(
                            buttonVariants({ variant: isScrolled ? "default" : "secondary", size: "sm" }),
                            "rounded-full px-6 font-medium transition-all hover:scale-105"
                        )}
                    >
                        Jadwal Misa
                    </Link>
                    <Link
                        href="/donasi"
                        className={cn(
                            buttonVariants({ variant: isScrolled ? "outline" : "default", size: "sm" }),
                            "rounded-full px-6 transition-all hover:scale-105", isScrolled
                            ? "border-brand-dark text-brand-dark hover:bg-brand-gold hover:text-white"
                            : "text-white bg-brand-gold hover:bg-white hover:text-brand-dark"
                        )}
                    >
                        Donate Us
                    </Link>
                </div>

                {/* Mobile Hamburger Button */}
                <div className="flex lg:hidden relative z-50 pr-4">
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="flex flex-col justify-center gap-1.5 w-10 h-10 pr-2 group"
                    >
                        <motion.span
                            animate={mobileMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                            className={cn(
                                "h-0.5 w-full rounded-full transition-colors",
                                mobileMenuOpen ? "bg-brand-dark" : (isScrolled ? "bg-brand-dark" : "bg-white")
                            )}
                        />
                        <motion.span
                            animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                            className={cn(
                                "h-0.5 w-full rounded-full transition-colors",
                                mobileMenuOpen ? "bg-brand-dark" : (isScrolled ? "bg-brand-dark" : "bg-white")
                            )}
                        />
                        <motion.span
                            animate={mobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                            className={cn(
                                "h-0.5 w-full rounded-full transition-colors",
                                mobileMenuOpen ? "bg-brand-dark" : (isScrolled ? "bg-brand-dark" : "bg-white")
                            )}
                        />
                    </button>
                </div>
            </nav>

            {/* Mobile menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: "-100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "-100%" }}
                        transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }} // smooth cubic-bezier
                        className="fixed inset-0 z-40 bg-brand-warm pt-32 px-6 pb-8 overflow-y-auto lg:hidden flex flex-col"
                    >
                        <div className="flex-1 space-y-8">
                            {navItems.map((item, idx) => (
                                <motion.div
                                    key={item.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + idx * 0.1 }}
                                >
                                    {item.items ? (
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => setExpandedItem(expandedItem === item.title ? null : item.title)}
                                                className="flex items-center justify-between w-full text-left group py-2 pr-6"
                                            >
                                                <span className="font-serif text-2xl text-brand-dark group-hover:text-brand-blue transition-colors">
                                                    {item.title}
                                                </span>
                                                <ChevronDown
                                                    className={cn(
                                                        "h-6 w-6 text-brand-dark/50 transition-transform duration-300",
                                                        expandedItem === item.title ? "rotate-180" : "rotate-0"
                                                    )}
                                                />
                                            </button>
                                            <AnimatePresence>
                                                {expandedItem === item.title && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="grid grid-cols-1 gap-3 pl-4 border-l-2 border-brand-dark/10 py-2 mb-4">
                                                            {item.items.map((subItem) => (
                                                                <Link
                                                                    key={subItem.href}
                                                                    href={subItem.href || "#"}
                                                                    className="text-gray-600 hover:text-brand-blue transition-colors text-lg py-1 block"
                                                                    onClick={() => setMobileMenuOpen(false)}
                                                                >
                                                                    {subItem.title}
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ) : (
                                        <Link
                                            href={item.href || "#"}
                                            className="block font-serif text-2xl text-brand-dark hover:text-brand-blue transition-colors py-2"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            {item.title}
                                        </Link>
                                    )}
                                </motion.div>
                            ))}
                        </div>

                        {/* Mobile CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="mt-12 space-y-3 pt-8 border-t border-brand-dark/10"
                        >
                            <Link
                                href="/jadwal-misa"
                                className={cn(buttonVariants({ variant: "default" }), "w-full rounded-full py-6 text-lg")}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Jadwal Misa
                            </Link>
                            <Link
                                href="/donasi"
                                className={cn(buttonVariants({ variant: "outline" }), "w-full rounded-full py-6 text-lg border-brand-dark text-brand-dark")}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Donate Us
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header >
    );
}
