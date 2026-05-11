"use client";

import { useState } from "react";
import { CalendarIcon, Clock, X, Plus } from "lucide-react";
import { format, parse, isValid } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface DateWithTime {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

interface MultiDateWithTimePickerProps {
  values: DateWithTime[];
  onChange: (values: DateWithTime[]) => void;
  disablePast?: boolean;
  maxDates?: number;
  takenSlots?: Record<string, Array<{ startTime: string; endTime: string }>>;
}

export function MultiDateWithTimePicker({
  values,
  onChange,
  disablePast = false,
  maxDates = 30,
  takenSlots = {},
}: MultiDateWithTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isDateToday = (d: Date) => d.getTime() === today.getTime();
  const now = new Date();
  const currentHour = now.getHours();

  const isSlotTaken = (dateStr: string, hour: number) => {
    const slots = takenSlots[dateStr];
    if (!slots || slots.length === 0) return false;
    return slots.some(slot => {
      const slotStart = parseInt(slot.startTime.split(':')[0]);
      const slotEnd = parseInt(slot.endTime.split(':')[0]);
      return hour >= slotStart && hour <= slotEnd;
    });
  };

  const getStartTimeOptions = (dateStr: string) => {
    const isTodaySelected = isDateToday(parse(dateStr, "yyyy-MM-dd", new Date()) || new Date(0));
    return Array.from({ length: 17 }).map((_, i) => {
      const hour = i + 6;
      if (disablePast && isTodaySelected && hour < currentHour) return null;
      if (isSlotTaken(dateStr, hour)) return null;
      return { hour, time: `${hour.toString().padStart(2, '0')}:00` };
    }).filter(Boolean);
  };

  const getEndTimeOptions = (dateStr: string, startTime: string) => {
    const startHour = parseInt(startTime.split(':')[0]);
    const isTodaySelected = isDateToday(parse(dateStr, "yyyy-MM-dd", new Date()) || new Date(0));
    return Array.from({ length: 17 }).map((_, i) => {
      const hour = i + 7;
      if (hour <= startHour) return null;
      if (disablePast && isTodaySelected && hour < currentHour) return null;
      if (isSlotTaken(dateStr, hour)) return null;
      return { hour, time: `${hour.toString().padStart(2, '0')}:00` };
    }).filter(Boolean);
  };

  const getAddDateStartOptions = () => {
    const dateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
    return Array.from({ length: 17 }).map((_, i) => {
      const hour = i + 6;
      if (disablePast && isDateToday(selectedDate || new Date(0)) && hour < currentHour) return null;
      if (dateStr && isSlotTaken(dateStr, hour)) return null;
      return { hour, time: `${hour.toString().padStart(2, '0')}:00` };
    }).filter(Boolean);
  };

  const getAddDateEndOptions = () => {
    const dateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
    const startHour = parseInt(startTime.split(':')[0]);
    return Array.from({ length: 17 }).map((_, i) => {
      const hour = i + 7;
      if (hour <= startHour) return null;
      if (disablePast && isDateToday(selectedDate || new Date(0)) && hour < currentHour) return null;
      if (dateStr && isSlotTaken(dateStr, hour)) return null;
      return { hour, time: `${hour.toString().padStart(2, '0')}:00` };
    }).filter(Boolean);
  };

  const handleAddDate = () => {
    if (!selectedDate) return;
    
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    
    // Check if date already exists
    if (values.some(v => v.date === dateStr)) {
      return;
    }
    
    onChange([...values, { date: dateStr, startTime, endTime }].sort((a, b) => a.date.localeCompare(b.date)));
    setSelectedDate(undefined);
    setStartTime("08:00");
    setEndTime("09:00");
    setOpen(false);
  };

  const removeDate = (dateStr: string) => {
    onChange(values.filter(d => d.date !== dateStr));
  };

  const updateDateTime = (dateStr: string, field: 'startTime' | 'endTime', value: string) => {
    onChange(values.map(d => 
      d.date === dateStr ? { ...d, [field]: value } : d
    ));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="bg-white"
              disabled={values.length >= maxDates}
            >
              <Plus className="w-4 h-4 mr-1" />
              Tambah Tanggal
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 space-y-3">
              <Calendar
                className="bg-white"
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={disablePast ? { before: today } : undefined}
              />
              {selectedDate && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
<label className="text-xs font-medium">Waktu Mulai</label>
                                              <Select value={startTime} onValueChange={setStartTime}>
                                                <SelectTrigger className="bg-white h-8">
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white">
                                                  {getAddDateStartOptions().map((opt) => (
                                                    <SelectItem key={opt!.time} value={opt!.time}>{opt!.time}</SelectItem>
                                                  ))}
                                                </SelectContent>
                                              </Select>
                    </div>
                    <div className="space-y-1">
<label className="text-xs font-medium">Waktu Selesai</label>
                                              <Select value={endTime} onValueChange={setEndTime}>
                                                <SelectTrigger className="bg-white h-8">
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white">
                                                  {getAddDateEndOptions().map((opt) => (
                                                    <SelectItem key={opt!.time} value={opt!.time}>{opt!.time}</SelectItem>
                                                  ))}
                                                </SelectContent>
                                              </Select>
                    </div>
                  </div>
                  <Button type="button" onClick={handleAddDate} size="sm" className="w-full">
                    Tambah
                  </Button>
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>
        <span className="text-sm text-muted-foreground">{values.length} tanggal dipilih</span>
      </div>

      {values.length > 0 && (
        <div className="space-y-2">
          {values.map((item) => {
            const date = parse(item.date, "yyyy-MM-dd", new Date());
            const formatted = isValid(date) ? format(date, "EEEE, d MMM yyyy", { locale: idLocale }) : item.date;
            
            return (
              <div key={item.date} className="flex items-center gap-2 p-2 bg-slate-50 rounded-md border">
                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                <span className="flex-1 text-sm">{formatted}</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <Select 
                    value={item.startTime} 
                    onValueChange={(val) => updateDateTime(item.date, 'startTime', val)}
                  >
                    <SelectTrigger className="bg-white h-7 w-[70px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {getStartTimeOptions(item.date).map((opt) => (
                        <SelectItem key={opt!.time} value={opt!.time}>{opt!.time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-xs text-muted-foreground">-</span>
                  <Select 
                    value={item.endTime} 
                    onValueChange={(val) => updateDateTime(item.date, 'endTime', val)}
                  >
                    <SelectTrigger className="bg-white h-7 w-[70px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {getEndTimeOptions(item.date, item.startTime).map((opt) => (
                        <SelectItem key={opt!.time} value={opt!.time}>{opt!.time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <button
                  type="button"
                  onClick={() => removeDate(item.date)}
                  className="text-destructive hover:text-destructive/80"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
