import { Metadata } from "next";
import { BarChart3, Users, Church, MapPin, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
    title: "Statistik Paroki | Paroki Brayut",
    description: "Statistik dan data Paroki Brayut Santo Yohanes Paulus II",
};

// Placeholder data - will be loaded from JSON
interface ParishStats {
    jumlahGereja: number;
    lingkungan: number;
    kk: number;
    umat: number;
}

const stats: ParishStats = {
    jumlahGereja: 5,
    lingkungan: 0, // To be updated
    kk: 0, // To be updated
    umat: 0, // To be updated
};

export default function StatistikPage() {
    return (
        <div className="py-12">
            {/* Hero */}
            <section className="bg-gradient-to-r from-brand-blue to-brand-darkBlue text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3 mb-4">
                        <BarChart3 className="h-10 w-10" />
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold">Statistik Paroki</h1>
                            <p className="text-blue-100 mt-2">Data dan Perkembangan Paroki Brayut</p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
                {/* Main Statistics */}
                <section>
                    <h2 className="text-2xl font-bold text-brand-dark mb-6">Data Utama</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white rounded-xl shadow-lg border-2 border-brand-blue/20 p-8">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="rounded-full bg-brand-blue/10 p-4">
                                    <Church className="h-8 w-8 text-brand-blue" />
                                </div>
                                <div>
                                    <div className="text-4xl font-bold text-brand-dark">{stats.jumlahGereja}</div>
                                    <div className="text-gray-600 font-medium">Gereja</div>
                                </div>
                            </div>
                            <div className="text-sm text-gray-500">
                                Gereja induk dan kapel
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg border-2 border-brand-blue/20 p-8">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="rounded-full bg-brand-blue/10 p-4">
                                    <MapPin className="h-8 w-8 text-brand-blue" />
                                </div>
                                <div>
                                    <div className="text-4xl font-bold text-brand-dark">
                                        {stats.lingkungan || "--"}
                                    </div>
                                    <div className="text-gray-600 font-medium">Lingkungan</div>
                                </div>
                            </div>
                            <div className="text-sm text-gray-500">
                                Wilayah pelayanan
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg border-2 border-brand-blue/20 p-8">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="rounded-full bg-brand-blue/10 p-4">
                                    <Users className="h-8 w-8 text-brand-blue" />
                                </div>
                                <div>
                                    <div className="text-4xl font-bold text-brand-dark">
                                        {stats.kk || "--"}
                                    </div>
                                    <div className="text-gray-600 font-medium">Keluarga (KK)</div>
                                </div>
                            </div>
                            <div className="text-sm text-gray-500">
                                Kepala keluarga
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg border-2 border-brand-blue/20 p-8">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="rounded-full bg-brand-blue/10 p-4">
                                    <Users className="h-8 w-8 text-brand-blue" />
                                </div>
                                <div>
                                    <div className="text-4xl font-bold text-brand-dark">
                                        {stats.umat || "--"}
                                    </div>
                                    <div className="text-gray-600 font-medium">Umat</div>
                                </div>
                            </div>
                            <div className="text-sm text-gray-500">
                                Total jiwa
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sacramental Statistics */}
                <section>
                    <h2 className="text-2xl font-bold text-brand-dark mb-6">Statistik Sakramen (Tahun Berjalan)</h2>
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="text-5xl font-bold text-brand-blue mb-2">--</div>
                                <div className="text-gray-700 font-semibold">Baptis</div>
                                <div className="text-sm text-gray-500 mt-1">Anak & Dewasa</div>
                            </div>

                            <div className="text-center">
                                <div className="text-5xl font-bold text-brand-blue mb-2">--</div>
                                <div className="text-gray-700 font-semibold">Komuni Pertama</div>
                                <div className="text-sm text-gray-500 mt-1">Anak-anak</div>
                            </div>

                            <div className="text-center">
                                <div className="text-5xl font-bold text-brand-blue mb-2">--</div>
                                <div className="text-gray-700 font-semibold">Krisma</div>
                                <div className="text-sm text-gray-500 mt-1">Penguatan</div>
                            </div>

                            <div className="text-center">
                                <div className="text-5xl font-bold text-brand-blue mb-2">--</div>
                                <div className="text-gray-700 font-semibold">Pernikahan</div>
                                <div className="text-sm text-gray-500 mt-1">Pemberkatan</div>
                            </div>

                            <div className="text-center">
                                <div className="text-5xl font-bold text-brand-blue mb-2">--</div>
                                <div className="text-gray-700 font-semibold">Imamat</div>
                                <div className="text-sm text-gray-500 mt-1">Tahbisan</div>
                            </div>

                            <div className="text-center">
                                <div className="text-5xl font-bold text-brand-blue mb-2">--</div>
                                <div className="text-gray-700 font-semibold">Pengurapan Orang Sakit</div>
                                <div className="text-sm text-gray-500 mt-1">Sakramen terakhir</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Growth Trends (Placeholder for charts) */}
                <section>
                    <h2 className="text-2xl font-bold text-brand-dark mb-6 flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-brand-blue" />
                        Perkembangan
                    </h2>
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                            <div className="text-center text-gray-400">
                                <BarChart3 className="h-16 w-16 mx-auto mb-4" />
                                <p className="text-lg font-medium">Grafik Perkembangan</p>
                                <p className="text-sm mt-2">Akan ditampilkan setelah data tersedia</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Data by Region */}
                <section>
                    <h2 className="text-2xl font-bold text-brand-dark mb-6">Data per Wilayah</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5].map((wilayah) => (
                            <div key={wilayah} className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                                <h3 className="text-lg font-bold text-brand-dark mb-4">Wilayah {wilayah}</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Lingkungan:</span>
                                        <span className="font-semibold text-brand-dark">--</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Keluarga:</span>
                                        <span className="font-semibold text-brand-dark">--</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Umat:</span>
                                        <span className="font-semibold text-brand-dark">--</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Note */}
                <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6">
                    <p className="text-gray-700">
                        <strong className="text-gray-900">Catatan:</strong> Data statistik akan diperbarui secara berkala
                        melalui sistem manajemen paroki. Untuk data yang lebih detail, silakan hubungi sekretariat paroki.
                    </p>
                </div>
            </div>
        </div>
    );
}
