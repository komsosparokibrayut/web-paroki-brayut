"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { format, parse, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface TimePickerProps {
  value: string; // Format "HH:mm"
  onChange: (value: string) => void;
  id?: string;
  required?: boolean;
  placeholder?: string;
}

export function TimePicker({ value, onChange, placeholder = "Pilih Waktu", required }: TimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Parse value "HH:mm" to a Date object (dummy date)
  const date = React.useMemo(() => {
    if (!value) return null;
    const parsed = parse(value, "HH:mm", new Date());
    return isValid(parsed) ? parsed : null;
  }, [value]);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5); // 5-minute increments

  const handleTimeChange = (type: "hour" | "minute", val: number) => {
    const newDate = date ? new Date(date) : new Date();
    if (!date) {
        newDate.setHours(0, 0, 0, 0);
    }
    
    if (type === "hour") {
      newDate.setHours(val);
    } else if (type === "minute") {
      newDate.setMinutes(val);
    }
    
    onChange(format(newDate, "HH:mm"));
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value ? value : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
          <ScrollArea className="w-64 sm:w-auto">
            <div className="flex sm:flex-col p-2">
              {hours.slice().reverse().map((hour) => (
                <Button
                  key={hour}
                  size="icon"
                  variant={date && date.getHours() === hour ? "default" : "ghost"}
                  className="sm:w-full shrink-0 aspect-square"
                  onClick={() => handleTimeChange("hour", hour)}
                >
                  {hour.toString().padStart(2, '0')}
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="sm:hidden" />
          </ScrollArea>
          <ScrollArea className="w-64 sm:w-auto">
            <div className="flex sm:flex-col p-2">
              {minutes.map((minute) => (
                <Button
                  key={minute}
                  size="icon"
                  variant={date && date.getMinutes() === minute ? "default" : "ghost"}
                  className="sm:w-full shrink-0 aspect-square"
                  onClick={() => handleTimeChange("minute", minute)}
                >
                  {minute.toString().padStart(2, '0')}
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="sm:hidden" />
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
