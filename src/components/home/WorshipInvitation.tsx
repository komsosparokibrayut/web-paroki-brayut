"use client";

import { motion } from "framer-motion";
import { Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ScheduleEvent,
  WeeklySchedule,
  ChurchUnit,
} from "@/features/schedule/types";
import { useMemo } from "react";

interface WorshipInvitationProps {
  upcomingEvents?: ScheduleEvent[];
  jadwalMisaData?: {
    churches: ChurchUnit[];
    specialMasses?: Array<{
      id: string;
      name: string;
      time: string;
      location: string;
      description: string;
      date?: string;
    }>;
  } | null;
}

const formatTimeList = (times: string[]): string => {
  if (times.length === 0) return "";
  const formatted = times.map((t) => t.replace(/(\d{2})\.(\d{2})/, "$1.$2"));
  if (formatted.length === 1) return formatted[0] + " WIB";
  return (
    formatted.slice(0, -1).join(", ") +
    ", " +
    formatted[formatted.length - 1] +
    " WIB"
  );
};

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const getWeekOfMonth = (date: Date): number => {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfMonth = date.getDate();
  return Math.ceil((dayOfMonth + firstDay.getDay()) / 7);
};

export default function WorshipInvitation({
  upcomingEvents = [],
  jadwalMisaData,
}: WorshipInvitationProps) {
  const churches = useMemo(
    () => jadwalMisaData?.churches || [],
    [jadwalMisaData?.churches],
  );

  const scheduleMap = useMemo(() => {
    const map = new Map<string, string[]>();
    churches.forEach((church) => {
      church.weeklySchedules.forEach((ws: WeeklySchedule) => {
        if (!map.has(ws.day)) {
          map.set(ws.day, []);
        }
        const timeStr = ws.time.replace(/(\d{2})\.(\d{2})/, "$1.$2");
        if (!map.get(ws.day)!.includes(timeStr)) {
          map.get(ws.day)!.push(timeStr);
        }
      });
    });
    // Sort times for each day
    map.forEach((times, day) => {
      map.set(day, times.sort());
    });
    return map;
  }, [churches]);

  const getDaySchedule = (dayName: string): string => {
    const times = scheduleMap.get(dayName);
    return times ? formatTimeList(times) : "";
  };

  const mingguSchedule = getDaySchedule("Minggu");
  const sabtuSchedule = getDaySchedule("Sabtu");
  const harianSchedule = useMemo(() => {
    const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
    const allTimes: string[] = [];
    days.forEach((day) => {
      const times = scheduleMap.get(day);
      if (times) {
        times.forEach((t) => {
          if (!allTimes.includes(t)) allTimes.push(t);
        });
      }
    });
    allTimes.sort();
    return allTimes.length > 0 ? formatTimeList(allTimes) : null;
  }, [scheduleMap]);

  const noteText = useMemo(() => {
    const now = new Date();
    const weekNum = getWeekOfMonth(now);
    const monthName = MONTH_NAMES[now.getMonth()];
    const year = now.getFullYear();
    return `*Jadwal misa diatas adalah jadwal misa Minggu ke-${weekNum} Bulan ${monthName} ${year}`;
  }, []);

  return (
    <section className='min-h-screen flex items-center justify-center py-24 bg-white relative'>
      <div className='container mx-auto px-4'>
        <div className='flex flex-col items-center justify-center text-center mb-16'>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className='text-brand-gold font-bold tracking-widest uppercase text-sm mb-4 block'>
              Perayaan Ekaristi
            </span>
            <h2 className='font-serif text-4xl md:text-6xl text-brand-dark leading-tight mb-6'>
              Datang dan <br /> Rayakan Kasih-Nya
            </h2>
            <p className='text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto mb-8'>
              Ekaristi adalah sumber dan puncak kehidupan Kristiani kita. Kami
              undangan Anda untuk bergabung dalam perjamuan kudus ini.
            </p>
          </motion.div>
        </div>

        {/* 4-Column Mass Schedule */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-4'>
          {/* Harian (Senin-Jumat) - from database */}
          <motion.div
            key='harian'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              duration: 0.7,
              delay: 0,
              ease: [0.21, 0.47, 0.32, 0.98],
            }}
            className='bg-brand-warm p-6 rounded-2xl text-center group transition-colors duration-300'
          >
            <div className='w-12 h-12 mx-auto bg-white rounded-full flex items-center justify-center mb-4 shadow-sm transition-colors'>
              <Clock className='h-6 w-6 text-brand-gold' />
            </div>
            <h3 className='font-bold text-sm uppercase tracking-widest mb-2 transition-colors text-brand-dark'>
              Senin - Jumat
            </h3>
            <p className='font-serif text-xl mb-2 transition-colors'>
              {harianSchedule || "06.00 WIB"}
            </p>
            <p className='text-xs text-gray-500 transition-colors'>
              Misa Harian
            </p>
          </motion.div>

          {/* Sabtu - from database */}
          <motion.div
            key='sabtu'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              duration: 0.7,
              delay: 0.1,
              ease: [0.21, 0.47, 0.32, 0.98],
            }}
            className='bg-brand-warm p-6 rounded-2xl text-center group transition-colors duration-300'
          >
            <div className='w-12 h-12 mx-auto bg-white rounded-full flex items-center justify-center mb-4 shadow-sm transition-colors'>
              <Clock className='h-6 w-6 text-brand-gold' />
            </div>
            <h3 className='font-bold text-sm uppercase tracking-widest mb-2 transition-colors text-brand-dark'>
              Sabtu
            </h3>
            <p className='font-serif text-xl mb-2 transition-colors'>
              {sabtuSchedule || "-"}
            </p>
            <p className='text-xs text-gray-500 transition-colors'>
              Misa Mingguan
            </p>
          </motion.div>

          {/* Minggu - from database */}
          <motion.div
            key='minggu'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              duration: 0.7,
              delay: 0.2,
              ease: [0.21, 0.47, 0.32, 0.98],
            }}
            className='bg-brand-warm p-6 rounded-2xl text-center group transition-colors duration-300'
          >
            <div className='w-12 h-12 mx-auto bg-white rounded-full flex items-center justify-center mb-4 shadow-sm transition-colors'>
              <Clock className='h-6 w-6 text-brand-gold' />
            </div>
            <h3 className='font-bold text-sm uppercase tracking-widest mb-2 transition-colors text-brand-dark'>
              Minggu
            </h3>
            <p className='font-serif text-xl mb-2 transition-colors'>
              {mingguSchedule || "-"}
            </p>
            <p className='text-xs text-gray-500 transition-colors'>
              Misa Mingguan
            </p>
          </motion.div>

          {/* Jumat Pertama - hardcoded */}
          <motion.div
            key='khusus'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              duration: 0.7,
              delay: 0.3,
              ease: [0.21, 0.47, 0.32, 0.98],
            }}
            className='bg-brand-warm p-6 rounded-2xl text-center group transition-colors duration-300'
          >
            <div className='w-12 h-12 mx-auto bg-white rounded-full flex items-center justify-center mb-4 shadow-sm transition-colors'>
              <Clock className='h-6 w-6 text-brand-gold' />
            </div>
            <h3 className='font-bold text-sm uppercase tracking-widest mb-2 transition-colors text-brand-dark'>
              Jumat Pertama
            </h3>
            <p className='font-serif text-xl mb-2 transition-colors'>
              18.30 WIB
            </p>
            <p className='text-xs text-gray-500 transition-colors'>
              Adorasi & Misa
            </p>
          </motion.div>
        </div>

        {/* Note */}
        <div className='max-w-5xl mx-auto mb-16 text-center'>
          <p className='text-sm text-gray-500 italic'>{noteText}</p>
        </div>

        <div className='flex flex-col md:flex-row items-center justify-center gap-12'>
          <Button
            variant='outline'
            className='rounded-full px-8 py-6 border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white transition-colors group'
            asChild
          >
            <Link href='/jadwal-misa'>
              Jadwal Lengkap{" "}
              <ArrowRight className='ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform' />
            </Link>
          </Button>
          <Button
            variant='outline'
            className='rounded-full px-8 py-6 border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white transition-colors group'
            asChild
          >
            <Link href='/event'>
              Agenda Kegiatan{" "}
              <ArrowRight className='ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform' />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
