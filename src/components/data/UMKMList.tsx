"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Store, MapPin, Info, Search, MessageCircle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Image from "next/image";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { useIsMobile } from "@/hooks/use-mobile";

interface UMKMListProps {
    initialUMKM: any[];
    categories: string[];
}

export default function UMKMList({ initialUMKM, categories }: UMKMListProps) {
    const [selectedCategory, setSelectedCategory] = useState("Semua");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;
    const isMobile = useIsMobile();
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const [loadingMore, setLoadingMore] = useState(false);

    const formatPhone = (phone: string) => {
        if (!phone) return "";
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.startsWith('62')) return cleaned;
        if (cleaned.startsWith('0')) return '62' + cleaned.slice(1);
        return cleaned;
    };

    // Calculate counts for categories
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = { "Semua": initialUMKM.length };
        categories.forEach(cat => counts[cat] = 0);
        initialUMKM.forEach(umkm => {
            if (counts[umkm.type] !== undefined) {
                counts[umkm.type]++;
            } else {
                if (!counts["Lainnya"]) counts["Lainnya"] = 0;
                counts["Lainnya"]++;
            }
        });
        return counts;
    }, [initialUMKM, categories]);

    // Filter Logic
    const filteredUMKM = useMemo(() => {
        return initialUMKM.filter((umkm) => {
            if (selectedCategory !== "Semua" && umkm.type !== selectedCategory) return false;
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                    umkm.businessName.toLowerCase().includes(query) ||
                    (umkm.description && umkm.description.toLowerCase().includes(query)) ||
                    umkm.owner.toLowerCase().includes(query)
                );
            }
            return true;
        });
    }, [initialUMKM, selectedCategory, searchQuery]);

    // Derived values
    const totalPages = Math.ceil(filteredUMKM.length / itemsPerPage);

    // Get current items
    const displayedUMKM = useMemo(() => {
        if (isMobile) {
            return filteredUMKM.slice(0, currentPage * itemsPerPage);
        }
        return filteredUMKM.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );
    }, [filteredUMKM, currentPage, itemsPerPage, isMobile]);

    // Reset page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, searchQuery]);

    // Infinite Scroll Intersection Observer
    useEffect(() => {
        if (!isMobile || currentPage >= totalPages) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loadingMore) {
                    setLoadingMore(true);
                    // Simulate loading delay for better UX
                    setTimeout(() => {
                        setCurrentPage((prev) => prev + 1);
                        setLoadingMore(false);
                    }, 500);
                }
            },
            { threshold: 0.1 }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [isMobile, currentPage, totalPages, loadingMore]);

    const PaginationUI = () => (
        !isMobile && totalPages > 1 ? (
            <div className="flex justify-center py-2">
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(e: React.MouseEvent) => {
                                    e.preventDefault();
                                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                                }}
                                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationItem>

                        {[...Array(totalPages)].map((_, i) => {
                            const pageNum = i + 1;
                            if (
                                pageNum === 1 ||
                                pageNum === totalPages ||
                                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                            ) {
                                return (
                                    <PaginationItem key={pageNum}>
                                        <PaginationLink
                                            href="#"
                                            isActive={currentPage === pageNum}
                                            onClick={(e: React.MouseEvent) => {
                                                e.preventDefault();
                                                setCurrentPage(pageNum);
                                            }}
                                            className="cursor-pointer"
                                        >
                                            {pageNum}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            } else if (
                                pageNum === currentPage - 2 ||
                                pageNum === currentPage + 2
                            ) {
                                return <PaginationItem key={pageNum}><PaginationEllipsis /></PaginationItem>;
                            }
                            return null;
                        })}

                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={(e: React.MouseEvent) => {
                                    e.preventDefault();
                                    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                                }}
                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        ) : null
    );

    return (
        <div className="space-y-8">
            {/* Controls */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-6">
                <div className="relative w-full group">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari nama usaha, pemilik..."
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-brand-blue/20 focus:bg-white transition-all font-medium text-gray-700 placeholder:text-gray-400"
                    />
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-brand-blue transition-colors" />
                </div>

                <div className="flex overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide gap-2">
                    <button
                        onClick={() => setSelectedCategory("Semua")}
                        className={`flex-shrink-0 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wide transition-all flex items-center gap-2 border ${selectedCategory === "Semua"
                            ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20 border-brand-blue"
                            : "bg-white border-gray-200 text-gray-500 hover:border-brand-blue hover:text-brand-blue"
                            }`}
                    >
                        Semua
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedCategory === "Semua" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                            {categoryCounts["Semua"]}
                        </span>
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`flex-shrink-0 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wide transition-all flex items-center gap-2 border ${selectedCategory === category
                                ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20 border-brand-blue"
                                : "bg-white border-gray-200 text-gray-500 hover:border-brand-blue hover:text-brand-blue"
                                }`}
                        >
                            {category}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedCategory === category ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                                {categoryCounts[category] || 0}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Top Pagination (Desktop only) */}
            <PaginationUI />

            {/* UMKM List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedUMKM.length > 0 ? (
                    displayedUMKM.map((umkm, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:border-brand-blue hover:shadow-lg transition-all group flex flex-col h-full"
                        >
                            {/* Card Header */}
                            <div className="h-24 bg-gradient-to-r from-brand-blue/5 to-brand-gold/5 border-b border-gray-100 relative">
                                {umkm.image && (
                                    <div className="absolute inset-0">
                                        <Image
                                            src={umkm.image}
                                            alt={umkm.businessName}
                                            fill
                                            unoptimized
                                            className="object-cover opacity-20 grayscale group-hover:grayscale-0 group-hover:opacity-40 transition-all duration-500"
                                        />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 z-10">
                                    <span className="inline-block px-2 py-1 bg-white text-brand-blue text-xs rounded-lg font-bold shadow-sm border border-brand-blue/10">
                                        {umkm.type}
                                    </span>
                                </div>
                                <div className="absolute -bottom-6 left-6 z-10">
                                    <div className="w-16 h-16 rounded-xl bg-white p-3 shadow-md border border-gray-100 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors duration-300 overflow-hidden relative">
                                        {umkm.image ? (
                                            <Image
                                                src={umkm.image}
                                                alt={umkm.businessName}
                                                fill
                                                unoptimized
                                                className="object-cover rounded-lg"
                                            />
                                        ) : (
                                            <Store className="h-8 w-8" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 px-6 pb-6 flex-1 flex flex-col">
                                <h3 className="font-bold text-brand-dark text-lg mb-1 line-clamp-1" title={umkm.businessName}>{umkm.businessName}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                                    <Info className="h-3 w-3" />
                                    <span>{umkm.owner}</span>
                                </div>

                                <div className="space-y-3 mb-6 flex-1 text-sm text-gray-600">
                                    <div className="flex items-start gap-2.5">
                                        <MapPin className="h-4 w-4 text-brand-blue flex-shrink-0 mt-0.5" />
                                        <span className="leading-snug">{umkm.address}</span>
                                    </div>
                                    {umkm.description && (
                                        <p className="text-gray-500 text-xs italic line-clamp-3 leading-relaxed pl-6.5 border-l-2 border-gray-100 pl-2">
                                            &quot;{umkm.description}&quot;
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 mt-auto">
                                    {(umkm.phone && umkm.phone !== "-") && (
                                        <a
                                            href={`https://wa.me/${formatPhone(umkm.phone)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-50 text-green-700 font-bold text-xs hover:bg-green-100 transition-colors"
                                        >
                                            <MessageCircle className="h-4 w-4" />
                                            WhatsApp
                                        </a>
                                    )}
                                    {umkm.mapsLink && (
                                        <a
                                            href={umkm.mapsLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 transition-colors"
                                        >
                                            <MapPin className="h-4 w-4" />
                                            Lihat Gmaps
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))) : (
                    <div className="col-span-full text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                        <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="font-bold text-gray-900 mb-2">Belum ada data</h3>
                        <p className="text-gray-500">
                            {searchQuery ? "Tidak ada UMKM yang cocok dengan pencarian." : "Belum ada UMKM terdaftar di kategori ini."}
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination / Infinite Scroll Indicator */}
            <div className="pt-8">
                {isMobile ? (
                    <div ref={loadMoreRef} className="py-10 flex justify-center w-full">
                        {loadingMore && currentPage < totalPages && (
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="h-8 w-8 text-brand-blue animate-spin" />
                                <p className="text-sm text-gray-400 font-medium">Memuat UMKM lainnya...</p>
                            </div>
                        )}
                        {currentPage >= totalPages && filteredUMKM.length > itemsPerPage && (
                            <p className="text-sm text-gray-400 font-medium bg-gray-50 px-6 py-2 rounded-full border border-gray-100">
                                Semua UMKM telah ditampilkan ✨
                            </p>
                        )}
                    </div>
                ) : (
                    <PaginationUI />
                )}
            </div>
        </div>
    );
}
