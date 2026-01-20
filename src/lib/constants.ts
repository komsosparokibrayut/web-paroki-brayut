import { PostCategory } from "@/types/post";
import { BookOpen, Calendar, FileText, MessageSquare, Newspaper } from "lucide-react";

export const POST_CATEGORIES: Record<PostCategory, { title: string; description: string; icon: any; color: string }> = {
    "berita": {
        title: "Berita",
        description: "Berita dan informasi terkini paroki",
        icon: FileText,
        color: "bg-blue-100 text-blue-700 border-blue-200",
    },
    "event": {
        title: "Event",
        description: "Acara dan kegiatan mendatang",
        icon: Calendar,
        color: "bg-purple-100 text-purple-700 border-purple-200",
    },
    "gereja": {
        title: "Gereja",
        description: "Artikel seputar kehidupan gereja",
        icon: BookOpen,
        color: "bg-green-100 text-green-700 border-green-200",
    },
    "wacana": {
        title: "Wacana",
        description: "Diskusi dan wacana rohani",
        icon: MessageSquare,
        color: "bg-orange-100 text-orange-700 border-orange-200",
    },
    "bacaan-harian": {
        title: "Bacaan Harian",
        description: "Bacaan liturgi harian",
        icon: BookOpen,
        color: "bg-blue-100 text-blue-700 border-blue-200",
    },
    "renungan": {
        title: "Renungan",
        description: "Renungan rohani",
        icon: MessageSquare,
        color: "bg-purple-100 text-purple-700 border-purple-200",
    },
    "warta-paroki": {
        title: "Warta Paroki",
        description: "Berita paroki",
        icon: FileText,
        color: "bg-green-100 text-green-700 border-green-200",
    },
    "kegiatan": {
        title: "Kegiatan",
        description: "Dokumentasi kegiatan",
        icon: Calendar,
        color: "bg-orange-100 text-orange-700 border-orange-200",
    },
    "umum": {
        title: "Umum",
        description: "Informasi umum",
        icon: Newspaper,
        color: "bg-gray-100 text-gray-700 border-gray-200",
    },
};

/** @deprecated Use Master Categories from master-categories.json instead */
export const SCHEDULE_CATEGORIES = [
    { name: "Liturgi", value: "liturgi" },
    { name: "Pastoral", value: "pastoral" },
    { name: "Sosial", value: "sosial" },
    { name: "Lainnya", value: "lainnya" },
];

export const SCHEDULE_CATEGORY_COLORS: Record<string, string> = {
    liturgi: "bg-blue-100 text-blue-700 border-blue-200",
    pastoral: "bg-green-100 text-green-700 border-green-200",
    sosial: "bg-purple-100 text-purple-700 border-purple-200",
    lainnya: "bg-gray-100 text-gray-700 border-gray-200",
};

export const UMKM_CATEGORIES = [
    "Kuliner",
    "Fashion",
    "Jasa",
    "Kerajinan",
    "Pertanian",
    "Lainnya",
];

/** @deprecated Use Master Categories from master-categories.json instead */
export const FORMULIR_CATEGORIES = [
    { name: "Liturgi", value: "liturgi" },
    { name: "Pelayanan", value: "pelayanan" },
    { name: "Lainnya", value: "lainnya" },
];
