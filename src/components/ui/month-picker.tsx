"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface MonthPickerProps {
    value: Date;
    onChange: (date: Date) => void;
    className?: string;
}

export function MonthPicker({ value, onChange, className }: MonthPickerProps) {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [pickerYear, setPickerYear] = useState(value.getFullYear());

    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    return (
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "rounded-full px-8 py-6 border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white transition-colors group gap-4",
                        className
                    )}
                >
                    <div className="flex items-center">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <span className="font-bold">
                            {months[value.getMonth()]} {value.getFullYear()}
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
                                    const newDate = new Date(value);
                                    newDate.setFullYear(pickerYear);
                                    newDate.setMonth(index);
                                    onChange(newDate);
                                    setIsPopoverOpen(false);
                                }}
                                className={cn(
                                    "text-sm py-2 rounded-md transition-colors",
                                    value.getMonth() === index && value.getFullYear() === pickerYear
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
    );
}
