import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
      <div className="max-w-md w-full text-center space-y-6">
        <div>
          <h1 className="text-6xl font-extrabold text-slate-300">404</h1>
          <h2 className="text-2xl font-bold text-slate-800 mt-2">Halaman Admin Tidak Ditemukan</h2>
        </div>
        <p className="text-slate-600">
          Maaf, halaman admin yang Anda cari tidak ada atau Anda tidak memiliki akses.
        </p>
        <div>
          <Link href="/admin/dashboard">
            <Button size="lg" className="w-full sm:w-auto">
              Kembali ke Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
