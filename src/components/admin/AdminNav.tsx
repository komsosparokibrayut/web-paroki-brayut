"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { useLoading } from "@/components/admin/LoadingProvider";
import {
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  Store,
  BarChart3,
  Calendar,
  LogOut,
  ExternalLink,
  ChevronRight,
  MapPin,
  UserIcon
} from "lucide-react";

interface AdminNavProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export default function AdminNav({ user }: AdminNavProps) {
  const { startTransition } = useLoading();
  const pathname = usePathname();
  const [isSignOutPending, setIsSignOutPending] = useState(false);

  const navItems = [
    {
      title: "Dashboard",
      items: [
        { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Posts", href: "/admin/posts", icon: FileText },
        { name: "Media", href: "/admin/media", icon: ImageIcon },
      ]
    },
    {
      title: "Data",
      items: [
        { name: "UMKM", href: "/admin/data/umkm", icon: Store },
        { name: "Jadwal", href: "/admin/data/jadwal", icon: Calendar },
        { name: "Formulir", href: "/admin/data/formulir", icon: FileText },
        { name: "Wilayah", href: "/admin/data/wilayah", icon: MapPin },
        { name: "Pastor & Tim", href: "/admin/data/pastor-tim", icon: UserIcon },
        { name: "Statistik", href: "/admin/data/statistik", icon: BarChart3 },
      ]
    },
    {
      title: "Master",
      items: [
        { name: "Kategori", href: "/admin/master/categories", icon: ChevronRight },
      ]
    }
  ];

  const handleSignOut = () => {
    setIsSignOutPending(true);
    startTransition(() => {
      signOut({ callbackUrl: "/admin" });
    });
  };

  return (
    <>
      {/* Mobile Toggle Button (Visible on small screens) - To be implemented if needed, for now sticking to desktop sidebar */}

      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 shadow-sm hidden md:flex flex-col font-rubik overflow-hidden">
        {/* Logo Area */}
        <div className="flex items-center h-16 px-6 border-b border-gray-100 bg-white z-10 shrink-0">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center text-white font-bold text-lg shadow-brand">
              P
            </div>
            <span className="text-lg font-bold text-gray-800 tracking-tight">Admin<span className="text-brand-blue">Paroki</span></span>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
          {navItems.map((group, groupIndex) => (
            <div key={groupIndex}>
              <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{group.title}</p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => startTransition(() => { })}
                      className={`flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${isActive
                        ? "bg-brand-blue/10 text-brand-blue"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${isActive ? "text-brand-blue" : "text-gray-400 group-hover:text-gray-500"}`} />
                        {item.name}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User & Footer Area */}
        <div className="border-t border-gray-100 p-4 space-y-4 bg-gray-50/50">
          {/* View Site Link */}
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-2 w-full px-4 py-2 text-xs font-medium text-brand-blue bg-brand-blue/10 rounded-lg hover:bg-brand-blue/20 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Live Website
          </Link>

          {/* User Profile */}
          <div className="flex items-center gap-3 pt-2">
            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-brand-blue font-bold shadow-sm shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{user?.name || "Admin"}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            disabled={isSignOutPending}
            className="flex items-center gap-2 w-full text-left px-2 text-xs font-medium text-red-500 hover:text-red-700 transition-colors mt-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            {isSignOutPending ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </aside>
    </>
  );
}
