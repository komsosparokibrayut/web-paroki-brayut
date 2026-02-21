import { getWilayahLingkungan } from "@/actions/data";
import WilayahClient from "./client";
import fs from "fs/promises";
import path from "path";

export default async function AdminWilayahPage() {
    const data = await getWilayahLingkungan();

    // Read stats from file
    let targetWilayah = 0;
    let targetLingkungan = 0;
    try {
        const statsPath = path.join(process.cwd(), '../web-paroki-content/statistik.json');
        const statsContent = await fs.readFile(statsPath, "utf-8");
        const stats = JSON.parse(statsContent);
        targetWilayah = stats.wilayah || 0;
        targetLingkungan = stats.wards || 0;
    } catch (error) {
        console.error("Failed to read statistik.json:", error);
        targetWilayah = data.length;
        targetLingkungan = data.reduce((acc, w) => acc + w.lingkungan.length, 0);
    }

    const realLingkunganCount = data.reduce((acc, w) => acc + w.lingkungan.length, 0);

    return (
        <div className="space-y-4">
            {/* Stats Comparison - Compact */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <div className="text-xs text-blue-600 font-medium">Target Wilayah</div>
                    <div className="text-xl font-bold text-blue-900">{targetWilayah}</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                    <div className="text-xs text-green-600 font-medium">Target Lingkungan</div>
                    <div className="text-xl font-bold text-green-900">{targetLingkungan}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-600 font-medium">Realita Data</div>
                    <div className="text-sm mt-0.5">
                        <strong>{data.length}</strong> Wilayah, <strong>{realLingkunganCount}</strong> Lingkungan
                    </div>
                </div>
            </div>

            <WilayahClient initialData={data} />
        </div>
    );
}
