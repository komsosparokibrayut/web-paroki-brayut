import { Metadata } from "next";
import Image from "next/image";
import { Camera, Grid, Image as ImageIcon, Calendar } from "lucide-react";

export const metadata: Metadata = {
    title: "Galeri Foto | Paroki Brayut",
    description: "Galeri foto kegiatan Paroki Brayut Santo Yohanes Paulus II",
};

// Placeholder data - will be loaded from actual images
interface GalleryCategory {
    name: string;
    count: number;
}

const categories: GalleryCategory[] = [
    { name: "Semua", count: 0 },
    { name: "Misa & Liturgi", count: 0 },
    { name: "Sakramen", count: 0 },
    { name: "Kegiatan Pastoral", count: 0 },
    { name: "Pembangunan Gereja", count: 0 },
    { name: "Lingkungan", count: 0 },
];

export default function GaleriPage() {
    return (
        <div className="py-12">
            {/* Hero */}
            <section className="bg-gradient-to-r from-brand-blue to-brand-darkBlue text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3 mb-4">
                        <Camera className="h-10 w-10" />
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold">Galeri Foto</h1>
                            <p className="text-blue-100 mt-2">Dokumentasi Kegiatan Paroki Brayut</p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
                {/* Category Filter */}
                <div className="flex flex-wrap gap-3">
                    {categories.map((category, index) => (
                        <button
                            key={index}
                            className={`px-6 py-2.5 rounded-full font-medium transition-colors ${index === 0
                                ? "bg-brand-blue text-white shadow-md"
                                : "bg-white border border-gray-300 text-gray-700 hover:border-brand-blue hover:text-brand-blue"
                                }`}
                        >
                            {category.name}
                            {category.count > 0 && (
                                <span className="ml-2 text-sm opacity-75">({category.count})</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Gallery Grid */}
                <section>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {/* Placeholder Gallery Items */}
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div
                                key={i}
                                className="aspect-square bg-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
                            >
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 group-hover:bg-gray-300 transition-colors">
                                    <ImageIcon className="h-12 w-12 mb-2" />
                                    <span className="text-sm">Foto {i}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Empty State */}
                <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
                    <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-700 mb-2">Galeri Sedang Dipersiapkan</h3>
                    <p className="text-gray-500 mb-6">
                        Foto-foto kegiatan paroki akan segera ditambahkan. Stay tuned!
                    </p>
                    <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <Grid className="h-4 w-4" />
                            <span>Grid View</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>By Date</span>
                        </div>
                    </div>
                </div>

                {/* Recent Albums */}
                <section>
                    <h2 className="text-2xl font-bold text-brand-dark mb-6">Album Terbaru</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { title: "Misa Natal 2025", date: "25 Desember 2025", photos: 0 },
                            { title: "Pembangunan Gereja", date: "Desember 2025", photos: 0 },
                            { title: "Kegiatan OMK", date: "November 2025", photos: 0 },
                        ].map((album, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:border-brand-blue hover:shadow-lg transition-all cursor-pointer"
                            >
                                <div className="aspect-video bg-gray-200 flex items-center justify-center">
                                    <Camera className="h-12 w-12 text-gray-400" />
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-brand-dark mb-1">{album.title}</h3>
                                    <div className="flex items-center justify-between text-sm text-gray-600">
                                        <span>{album.date}</span>
                                        <span>{album.photos} foto</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Upload Info */}
                <div className="bg-brand-warm rounded-xl border-2 border-brand-blue/20 p-8">
                    <h3 className="text-xl font-bold text-brand-dark mb-4">Kontribusi Foto</h3>
                    <p className="text-gray-700 mb-4">
                        Jika Anda memiliki foto kegiatan paroki yang ingin dibagikan di galeri ini,
                        silakan hubungi koordinator dokumentasi atau sekretariat paroki.
                    </p>
                    <div className="text-sm text-gray-600">
                        <p><strong>Format:</strong> JPG, PNG (max 5MB)</p>
                        <p><strong>Resolusi:</strong> Min. 1920x1080px untuk kualitas terbaik</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
