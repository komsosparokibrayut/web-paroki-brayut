"use client";

import { useState, useMemo } from "react";
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight, ExternalLink, Maximize2 } from "lucide-react";
import { ScheduleEvent } from "@/types/data";
import { cn } from "@/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle,
} from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

export default function JadwalList({ initialEvents, categories }: { initialEvents: ScheduleEvent[], categories: string[] }) {
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);


    // Calculate Category Counts (Global)
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = { "all": 0 };
        categories.forEach(cat => counts[cat] = 0);

        initialEvents.forEach(event => {
            counts["all"]++;
            if (counts[event.category] !== undefined) {
                counts[event.category]++;
            }
        });
        return counts;
    }, [initialEvents, categories]);

    // Filter Logic
    const filteredEvents = useMemo(() => {
        return initialEvents.filter((event) => {
            const eventDate = new Date(event.date);

            // Category Filter
            if (selectedCategory !== "all" && event.category !== selectedCategory) {
                return false;
            }

            // Month Filter
            if (eventDate.getMonth() !== selectedDate.getMonth() || eventDate.getFullYear() !== selectedDate.getFullYear()) {
                return false;
            }

            return true;
        });
    }, [initialEvents, selectedCategory, selectedDate]);

    const sortedEvents = [...filteredEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Generate consistent gradient for each event
    const getGradientForEvent = (eventId: string) => {
        const directions = [
            "from-brand-blue/10 to-brand-gold/10",
            "from-brand-gold/10 to-brand-blue/10",
        ];
        // Use event ID to generate consistent index
        const hash = eventId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return directions[hash % directions.length];
    };

    return (
        <div className="space-y-8">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">

                {/* Month Year Picker */}
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="rounded-full px-8 py-6 border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white transition-colors group gap-4"
                        >
                            <div className="flex items-center">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                <span className="font-bold">
                                    {months[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                                </span>
                            </div>
                            <ChevronRight className={cn(
                                "h-4 w-4 transition-transform duration-200",
                                isPopoverOpen ? "rotate-[270deg]" : "rotate-90"
                            )} />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="start">
                        <div className="p-4 space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <button
                                    onClick={() => setPickerYear(prev => prev - 1)}
                                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <div className="font-bold text-lg">{pickerYear}</div>
                                <button
                                    onClick={() => setPickerYear(prev => prev + 1)}
                                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {months.map((month, index) => (
                                    <button
                                        key={month}
                                        onClick={() => {
                                            const newDate = new Date(selectedDate);
                                            newDate.setFullYear(pickerYear);
                                            newDate.setMonth(index);
                                            setSelectedDate(newDate);
                                        }}
                                        className={cn(
                                            "text-sm py-2 rounded-md transition-colors",
                                            selectedDate.getMonth() === index && selectedDate.getFullYear() === pickerYear
                                                ? "bg-brand-blue text-white font-bold"
                                                : "hover:bg-gray-100 text-gray-700"
                                        )}
                                    >
                                        {month.substring(0, 3)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Category Filter */}
                <div className="flex overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide gap-2">
                    <button
                        onClick={() => setSelectedCategory("all")}
                        className={cn(
                            "flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-2 border",
                            selectedCategory === "all"
                                ? "bg-brand-dark text-white border-brand-dark"
                                : "bg-white border-gray-200 text-gray-500 hover:border-brand-dark hover:text-brand-dark"
                        )}
                    >
                        All
                        <span className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded-full",
                            selectedCategory === "all" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                        )}>
                            {categoryCounts["all"]}
                        </span>
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={cn(
                                "flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-2 border",
                                selectedCategory === category
                                    ? "bg-brand-dark text-white border-brand-dark"
                                    : "bg-white border-gray-200 text-gray-500 hover:border-brand-dark hover:text-brand-dark"
                            )}
                        >
                            {category}
                            <span className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded-full",
                                selectedCategory === category ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                            )}>
                                {categoryCounts[category] || 0}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Events Grid */}
            <section>
                {sortedEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sortedEvents.map((activity) => {
                            const isPast = new Date(activity.date) < currentDate;
                            const hasImage = !!activity.imageUrl;

                            return (
                                <div
                                    key={activity.id}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full hover:shadow-lg hover:border-brand-blue/30 transition-all duration-300 group"
                                >
                                    {/* Image / Gradient Header - UPDATED WITH DIALOG AND OVERLAY */}
                                    <div className={cn(
                                        "h-64 relative overflow-hidden",
                                        !hasImage && "bg-gradient-to-br",
                                        !hasImage && getGradientForEvent(activity.id)
                                    )}>
                                        {hasImage ? (
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <div className="w-full h-full relative group/image cursor-pointer">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={activity.imageUrl}
                                                            alt={activity.title}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                        />
                                                        {/* Overlay Button */}
                                                        <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-all duration-300 flex items-center justify-center">
                                                            <div className="bg-white/90 backdrop-blur-sm p-3 rounded-full opacity-0 translate-y-2 group-hover/image:opacity-100 group-hover/image:translate-y-0 transition-all duration-300 shadow-lg transform scale-90 group-hover/image:scale-100">
                                                                <Maximize2 className="h-5 w-5 text-brand-dark" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden bg-transparent border-none shadow-none flex items-center justify-center [&>button]:text-white [&>button]:bg-black/50 [&>button]:hover:bg-black/70 [&>button]:rounded-full [&>button]:p-2 [&>button]:top-4 [&>button]:right-4 [&>button>svg]:h-6 [&>button>svg]:w-6">
                                                    <VisuallyHidden.Root>
                                                        <DialogTitle>{activity.title}</DialogTitle>
                                                    </VisuallyHidden.Root>

                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={activity.imageUrl}
                                                        alt={activity.title}
                                                        className="w-full h-auto max-h-[85vh] object-contain rounded-lg shadow-2xl"
                                                    />
                                                </DialogContent>
                                            </Dialog>
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                                <CalendarIcon className="h-12 w-12 text-brand-blue" />
                                            </div>
                                        )}

                                        <div className="absolute top-4 right-4 z-10 pointer-events-none">
                                            <span className={cn(
                                                "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm bg-white/90 backdrop-blur-md",
                                                // Simplified category coloring or keep existing
                                                "text-brand-dark"
                                            )}>
                                                {activity.category}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <div className="text-xs text-brand-blue font-bold tracking-wide uppercase bg-brand-blue/5 px-2.5 py-1 rounded-md">
                                                {new Date(activity.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </div>
                                            {isPast && (
                                                <span className="text-[10px] font-bold text-red-500 border border-red-200 bg-red-50 px-2 py-1 rounded uppercase">
                                                    Selesai
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="text-xl font-bold text-brand-dark mb-4 line-clamp-2 leading-tight group-hover:text-brand-blue transition-colors">
                                            {activity.title}
                                        </h3>

                                        <div className="space-y-3 mb-8 text-sm text-gray-600 font-medium">
                                            <div className="flex items-center gap-3">
                                                <Clock className="h-4 w-4 text-brand-blue/60 flex-shrink-0" />
                                                <span>
                                                    {activity.time ? activity.time : 'Waktu belum ditentukan'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <MapPin className="h-4 w-4 text-brand-blue/60 flex-shrink-0" />
                                                <span className="line-clamp-1">{activity.location}</span>
                                            </div>
                                        </div>

                                        <div className="mt-auto">
                                            {activity.linkUrl ? (
                                                <a
                                                    href={activity.linkUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full inline-flex items-center justify-center gap-2 bg-brand-dark text-white font-semibold py-3 rounded-xl hover:bg-brand-blue transition-all group-hover:shadow-md"
                                                >
                                                    Detail Event <ExternalLink className="h-4 w-4" />
                                                </a>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                        <div className="bg-white p-4 rounded-full shadow-sm w-fit mx-auto mb-4">
                            <CalendarIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1 text-lg">Belum ada event</h3>
                        <p className="text-gray-500">Tidak ada kegiatan di bulan {months[selectedDate.getMonth()]} {selectedDate.getFullYear()}.</p>
                    </div>
                )}
            </section>
        </div>
    );
}