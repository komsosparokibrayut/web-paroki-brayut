"use client";

import { useState, useMemo } from "react";
import { FileText, Link as LinkIcon, Download, Search } from "lucide-react";
import { Formulir } from "@/actions/data";
import { Skeleton } from "@/components/ui/skeleton";

export default function FormulirList({ initialData, categories }: { initialData: Formulir[], categories: string[] }) {
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [isFiltering, setIsFiltering] = useState(false);

    const displayCategories = [
        "all",
        ...categories
    ];

    const handleCategoryChange = (category: string) => {
        setIsFiltering(true);
        setSelectedCategory(category);
        // Simulate loading for smoother UX perception
        setTimeout(() => setIsFiltering(false), 500);
    }

    const filteredData = useMemo(() => {
        return initialData.filter((item) => {
            // Category Filter
            if (selectedCategory !== "all" && item.category !== selectedCategory) {
                return false;
            }

            // Search Filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                    item.title.toLowerCase().includes(query) ||
                    (item.description && item.description.toLowerCase().includes(query))
                );
            }

            return true;
        });
    }, [initialData, selectedCategory, searchQuery]);

    return (
        <div className="space-y-8">
            {/* Controls */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                {/* Search Bar */}
                <div className="relative w-full md:w-96 group">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari dokumen atau formulir..."
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-brand-blue/20 focus:bg-white transition-all font-medium text-gray-700 placeholder:text-gray-400"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-brand-blue transition-colors" />
                </div>

                {/* Filter Categories */}
                <div className="flex flex-wrap gap-2 justify-center md:justify-end w-full md:w-auto">
                    {displayCategories.map((category) => (
                        <button
                            key={category}
                            onClick={() => handleCategoryChange(category)}
                            className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wide transition-colors duration-200 border ${selectedCategory === category
                                ? "bg-brand-blue text-white border-brand-blue"
                                : "bg-white border-gray-200 text-gray-500 hover:border-brand-blue hover:text-brand-blue"
                                }`}
                        >
                            {category === 'all' ? 'Semua' : category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Formulir List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
                {isFiltering ? (
                    <div className="divide-y divide-gray-100">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                                <Skeleton className="w-14 h-14 rounded-2xl bg-gray-100" />
                                <div className="flex-1 space-y-2 w-full">
                                    <Skeleton className="h-6 w-1/3 bg-gray-100" />
                                    <Skeleton className="h-4 w-2/3 bg-gray-50" />
                                </div>
                                <Skeleton className="h-10 w-32 rounded-xl bg-gray-100" />
                            </div>
                        ))}
                    </div>
                ) : filteredData.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {filteredData.map((item) => (
                            <div
                                key={item.id}
                                className="group p-6 flex flex-col md:flex-row gap-6 items-start md:items-center hover:bg-gray-50/80 transition-colors"
                            >
                                {/* Icon Box */}
                                <div className="flex-shrink-0">
                                    <div className="w-14 h-14 rounded-2xl bg-brand-blue/5 border border-brand-blue/10 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all duration-300 shadow-sm">
                                        <FileText className="h-7 w-7" />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 space-y-1">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-blue transition-colors">
                                            {item.title}
                                        </h3>
                                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${item.category === 'liturgi' ? 'bg-purple-100 text-purple-600' :
                                            item.category === 'pelayanan' ? 'bg-orange-100 text-orange-600' :
                                                'bg-gray-100 text-gray-500'
                                            }`}>
                                            {item.category}
                                        </span>
                                    </div>
                                    {item.description && (
                                        <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
                                    )}
                                </div>

                                {/* Action */}
                                <div className="flex-shrink-0 w-full md:w-auto pt-2 md:pt-0">
                                    <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex w-full md:w-auto items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-brand-blue/10 text-brand-blue font-bold rounded-xl hover:bg-brand-blue hover:text-white hover:border-brand-blue transition-all duration-300"
                                    >
                                        <Download className="h-4 w-4" />
                                        <span>Download</span>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 px-6 h-full flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="h-8 w-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold font-sans text-gray-900 mb-2">Tidak ditemukan</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            Maaf, dokumen yang Anda cari tidak dapat ditemukan. Coba gunakan kata kunci lain.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
