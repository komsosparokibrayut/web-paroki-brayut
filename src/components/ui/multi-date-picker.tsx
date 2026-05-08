"use client";

import * as React from "react";
import { CalendarIcon, X } from "lucide-react";
import { format, parse, isValid, isSameDay } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface MultiDatePickerProps {
  values: string[]; // Array of "YYYY-MM-DD"
  onChange: (values: string[]) => void;
  id?: string;
  placeholder?: string;
  disablePast?: boolean;
  maxDates?: number;
}

export function MultiDatePicker({
  values,
  onChange,
  placeholder = "Pilih Tanggal",
  disablePast = false,
  maxDates = 30,
}: MultiDatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const dates = React.useMemo(() => {
    return values
      .map(v => {
        const parsed = parse(v, "yyyy-MM-dd", new Date());
        return isValid(parsed) ? parsed : null;
      })
      .filter((d): d is Date => d !== null)
      .sort((a, b) => a.getTime() - b.getTime());
  }, [values]);

  const handleSelect = (selected: Date | undefined) => {
    if (!selected) return;
    
    const dateStr = format(selected, "yyyy-MM-dd");
    const exists = values.includes(dateStr);
    
    if (exists) {
      // Remove date if already selected
      onChange(values.filter(d => d !== dateStr));
    } else {
      // Add date if not at max
      if (values.length < maxDates) {
        onChange([...values, dateStr].sort());
      }
    }
  };

  const removeDate = (dateStr: string) => {
    onChange(values.filter(d => d !== dateStr));
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "bg-white w-full justify-start text-left font-normal",
              values.length === 0 && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {values.length > 0 ? `${values.length} tanggal dipilih` : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            className="bg-white"
            mode="multiple"
            selected={dates}
            onSelect={(selectedDates) => {
              if (!selectedDates) return;
              const dateStrs = selectedDates.map(d => format(d, "yyyy-MM-dd")).sort();
              onChange(dateStrs);
            }}
            disabled={disablePast ? { before: today } : undefined}
          />
        </PopoverContent>
      </Popover>
      
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {values.map(dateStr => {
            const date = parse(dateStr, "yyyy-MM-dd", new Date());
            const formatted = isValid(date) ? format(date, "d MMM yyyy", { locale: idLocale }) : dateStr;
            
            return (
              <Badge key={dateStr} variant="secondary" className="text-xs">
                {formatted}
                <button
                  type="button"
                  onClick={() => removeDate(dateStr)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
