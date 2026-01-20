import Link from "next/link";

export default function AdminErrorPage() {
  return (
    <div className="min-h-screen bg-brand-warm flex items-center justify-center px-4 font-rubik relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 -left-20 w-80 h-80 bg-red-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 -right-20 w-80 h-80 bg-red-500/10 rounded-full blur-3xl" />

      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 border border-red-100 text-center animate-fade-in">
        <div className="w-24 h-24 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-100">
          <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tighter">
          Authentication Error
        </h1>

        <p className="text-gray-500 font-medium mb-8 leading-relaxed">
          Nama pengguna atau kata sandi tidak valid. Silakan coba masuk kembali.
        </p>

        <Link
          href="/admin"
          className="w-full px-6 py-4 bg-brand-blue text-white font-black rounded-xl hover:bg-brand-darkBlue shadow-lg hover:shadow-brand-blue/20 transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 0118 0z" />
          </svg>
          Back to Login
        </Link>
      </div>
    </div>
  );
}
