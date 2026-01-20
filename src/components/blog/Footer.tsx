export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Column 1: Identity */}
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="text-xl font-bold text-brand-dark">
                Paroki Brayut
              </span>
              <span className="text-sm text-gray-500">
                Santo Yohanes Paulus II
              </span>
            </div>
            <div className="text-gray-600 text-sm leading-relaxed">
              <p>Jl. Godean Km. 13, Brayut,</p>
              <p>Sinduadi, Mlati,</p>
              <p>Sleman, Yogyakarta 55284</p>
            </div>
            <div className="pt-2">
              <p className="text-sm text-gray-500">Email Sekretariat:</p>
              <a
                href="mailto:sekretariat@parokibrayut.org"
                className="text-brand-blue hover:text-brand-darkBlue text-sm transition-colors"
              >
                sekretariat@parokibrayut.org
              </a>
            </div>
          </div>

          {/* Column 2: Donasi */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-brand-dark">
              Donasi Pembangunan
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-400 uppercase font-semibold">
                  Mandiri
                </p>
                <p className="text-brand-dark font-mono font-medium">
                  137-00-1234567-8
                </p>
                <p className="text-xs text-gray-500">a.n PGPM Paroki Brayut</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-400 uppercase font-semibold">
                  BCA
                </p>
                <p className="text-brand-dark font-mono font-medium">
                  123-456-7890
                </p>
                <p className="text-xs text-gray-500">a.n PGPM Paroki Brayut</p>
              </div>
            </div>
          </div>

          {/* Column 3: Kontak */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-brand-dark">
              Narahubung
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-brand-blue">•</span>
                <span>Ibu Maria: 0812-3456-7890</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-blue">•</span>
                <span>Bapak Yosef: 0812-3456-7891</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-blue">•</span>
                <span>Sekretariat: 0274-123456</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Jadwal */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-brand-dark">Jadwal Misa</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex justify-between">
                <span>Harian (Senin-Sabtu)</span>
                <span className="font-medium text-brand-dark">05:30 WIB</span>
              </li>
              <li className="flex justify-between">
                <span>Sabtu Sore</span>
                <span className="font-medium text-brand-dark">17:00 WIB</span>
              </li>
              <li className="flex justify-between">
                <span>Minggu Pagi</span>
                <span className="font-medium text-brand-dark">07:00 WIB</span>
              </li>
              <li className="flex justify-between">
                <span>Minggu Sore</span>
                <span className="font-medium text-brand-dark">17:00 WIB</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500 text-center md:text-left">
            © {new Date().getFullYear()} Paroki Brayut Santo Yohanes Paulus II. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-brand-blue transition-colors">
              Instagram
            </a>
            <a href="#" className="text-gray-400 hover:text-brand-blue transition-colors">
              YouTube
            </a>
            <a href="#" className="text-gray-400 hover:text-brand-blue transition-colors">
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
