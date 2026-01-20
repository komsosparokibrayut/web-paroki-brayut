"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinks = [
    { name: "Beranda", href: "/" },
    { name: "Blog", href: "/blog" },
    { name: "Tentang", href: "/about" },
    { name: "Kontak", href: "/contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-brand-warm/90 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-brand-blue rounded-full flex items-center justify-center text-white font-bold text-xl group-hover:bg-brand-darkBlue transition-colors">
              P
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-brand-dark leading-none group-hover:text-brand-blue transition-colors">
                Paroki Brayut
              </span>
              <span className="text-xs text-gray-500 font-medium">
                Santo Yohanes Paulus II
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-brand-blue ${pathname === link.href ? "text-brand-blue" : "text-gray-600"
                  }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/jadwal-misa"
              className="bg-brand-blue hover:bg-brand-darkBlue text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors shadow-sm hover:shadow-md"
            >
              Jadwal Misa
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 text-gray-600 hover:text-brand-blue transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-xl">
          <div className="px-4 py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block text-base font-medium transition-colors ${pathname === link.href
                    ? "text-brand-blue"
                    : "text-gray-600 hover:text-brand-blue"
                  }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/jadwal-misa"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full text-center bg-brand-blue hover:bg-brand-darkBlue text-white px-5 py-3 rounded-xl text-base font-medium transition-colors shadow-sm"
            >
              Jadwal Misa
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
