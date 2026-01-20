import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-warm flex items-center justify-center px-4 font-rubik">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative">
          <h1 className="text-9xl font-extrabold text-brand-blue/20 tracking-tighter">
            404
          </h1>
          <p className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-brand-dark">
            Page Not Found
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600">
            Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan.
          </p>
          <div className="pt-6">
            <Link
              href="/"
              className="px-6 py-3 bg-brand-blue text-white font-bold rounded-lg hover:bg-brand-darkBlue shadow-lg transition-all duration-200 inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
