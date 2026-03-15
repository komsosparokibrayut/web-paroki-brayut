import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function AdminNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] p-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative flex justify-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <h1 className="text-[120px] sm:text-[150px] font-black text-slate-200/50 leading-none select-none">
              404
            </h1>
          </div>
        </div>

        <div className="space-y-3 relative z-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Halaman Tidak Ditemukan
          </h2>
          <p className="text-slate-500 max-w-[300px] mx-auto text-sm sm:text-base">
            Maaf, halaman yang Anda cari tidak ada atau Anda tidak memiliki akses ke area ini.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
          <Link href="/" className="w-full sm:w-auto">
            <Button size="lg" className="w-full gap-2 shadow-md shadow-blue-200">
              <Home className="size-4" />
              Ke Beranda
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-12 text-slate-400 text-xs">
        Web Paroki Santo Yohanes Paulus II
      </div>
    </div>
  );
}
