"use client";

import { useAdminRole } from "@/components/admin/AdminRoleProvider"; // Import context
import { UserRole } from "@/lib/roles"; // Import UserRole type

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { useLoading } from "@/components/admin/LoadingProvider";
import {
    LayoutDashboard,
    FileText,
    Image as ImageIcon,
    Store,
    BarChart3,
    Calendar,
    ExternalLink,
    MapPin,
    UserIcon,
    Database,
    PenTool,
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    useSidebar,
    SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export function AdminSidebar() {
    const { user } = useUser();
    const pathname = usePathname();
    const { setOpenMobile, state } = useSidebar();
    const { role } = useAdminRole(); // Use simulated role

    const isCollapsed = state === "collapsed";

    // Dashboard is standalone, not grouped
    const dashboardItem = { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard };

    // Helper to check if user has access to a specific path/feature
    const hasAccess = (requiredRole: UserRole[]) => {
        if (!role) return false;
        if (role === "super_admin") return true;
        return requiredRole.includes(role);
    };

    // Navigation groups
    const navGroups = [
        {
            title: "Content",
            items: [
                { name: "Posts", href: "/admin/posts", icon: FileText },
                { name: "Media", href: "/admin/media", icon: ImageIcon },
                { name: "Gallery", href: "/admin/gallery", icon: ImageIcon },
            ].filter(() => hasAccess(["news_admin", "news_reporter"]))
        },
        {
            title: "Data Management",
            items: [
                { name: "UMKM", href: "/admin/data/umkm", icon: Store },
                { name: "Jadwal", href: "/admin/data/jadwal", icon: Calendar },
                { name: "Formulir", href: "/admin/data/formulir", icon: Database },
                { name: "Wilayah", href: "/admin/data/wilayah", icon: MapPin },
                { name: "Pastor & Tim", href: "/admin/data/pastor-tim", icon: UserIcon },
            ].filter(() => hasAccess(["data_admin"]))
        },
        {
            title: "Settings",
            items: [
                {
                    name: "Categories",
                    href: "/admin/master/categories",
                    icon: PenTool,
                    visible: hasAccess(["news_admin", "data_admin"])
                },
                {
                    name: "Statistik",
                    href: "/admin/data/statistik",
                    icon: BarChart3,
                    visible: hasAccess(["data_admin"])
                },
                {
                    name: "Admins",
                    href: "/admin/settings/admins",
                    icon: UserIcon,
                    visible: hasAccess([]) // Only super_admin (handled by default in hasAccess)
                },
            ].filter(item => item.visible !== false)
        }
    ].filter(group => group.items.length > 0);

    const isDashboardActive = pathname === "/admin/dashboard";

    // Reusable nav item component
    const NavItem = ({ href, icon: Icon, name, isActive }: { href: string; icon: React.ComponentType<{ className?: string }>; name: string; isActive: boolean }) => {
        const content = (
            <Link
                href={href}
                onClick={() => setOpenMobile(false)}
                className={`flex h-9 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors
                    ${isCollapsed ? 'justify-center px-0 size-9' : ''}
                    ${isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                    }`}
            >
                <Icon className="size-4 shrink-0" />
                {!isCollapsed && <span>{name}</span>}
            </Link>
        );

        if (isCollapsed) {
            return (
                <Tooltip>
                    <TooltipTrigger asChild>{content}</TooltipTrigger>
                    <TooltipContent side="right">{name}</TooltipContent>
                </Tooltip>
            );
        }
        return content;
    };

    return (
        <Sidebar collapsible="icon" className="bg-white border-r border-slate-200">
            {/* Header with Logo */}
            <SidebarHeader className="border-b border-slate-100 p-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link
                            href="/admin/dashboard"
                            className={`flex items-center gap-3 rounded-lg p-2 hover:bg-slate-50 transition-colors ${isCollapsed ? 'justify-center p-1' : ''}`}
                        >
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg overflow-hidden">
                                <Image
                                    src="/favicons/logo.png"
                                    alt="Logo"
                                    width={32}
                                    height={32}
                                    className="size-8 object-cover"
                                />
                            </div>
                            {!isCollapsed && (
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold text-slate-900">Admin CMS</span>
                                    <span className="truncate text-xs text-slate-500">Paroki Brayut</span>
                                </div>
                            )}
                        </Link>
                    </TooltipTrigger>
                    {isCollapsed && <TooltipContent side="right">Admin CMS</TooltipContent>}
                </Tooltip>
            </SidebarHeader>

            <SidebarContent className="p-2">
                {/* Dashboard */}
                <div className="mb-2">
                    <NavItem
                        href={dashboardItem.href}
                        icon={dashboardItem.icon}
                        name={dashboardItem.name}
                        isActive={isDashboardActive}
                    />
                </div>

                {/* Navigation Groups */}
                {navGroups.map((group, index) => (
                    <div key={index} className="mb-2">
                        {!isCollapsed && (
                            <div className="px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                {group.title}
                            </div>
                        )}
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const isActive = pathname === item.href ||
                                    (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
                                return (
                                    <NavItem
                                        key={item.href}
                                        href={item.href}
                                        icon={item.icon}
                                        name={item.name}
                                        isActive={isActive}
                                    />
                                );
                            })}
                        </div>
                    </div>
                ))}
            </SidebarContent>

            {/* Footer */}
            <SidebarFooter className="border-t border-slate-100 p-2">
                {!isCollapsed ? (
                    <div className="flex flex-col gap-2">
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="w-full justify-center gap-2 h-9 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50"
                        >
                            <Link href="/" target="_blank">
                                <ExternalLink className="size-4" />
                                <span>View Live Website</span>
                            </Link>
                        </Button>

                        <div className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-slate-50 transition-colors">
                            <UserButton
                                afterSignOutUrl="/admin"
                                appearance={{
                                    elements: {
                                        userButtonAvatarBox: "size-8",
                                        userButtonTrigger: "focus:shadow-none focus:ring-0"
                                    }
                                }}
                            />
                            <div className="grid flex-1 text-left text-sm leading-tight overflow-hidden">
                                <span className="truncate font-medium text-slate-900">{user?.fullName || "Admin"}</span>
                                <span className="truncate text-xs text-slate-500">{user?.primaryEmailAddress?.emailAddress}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button asChild variant="ghost" size="icon" className="size-8 text-slate-600 hover:text-blue-600 hover:bg-blue-50">
                                    <Link href="/" target="_blank">
                                        <ExternalLink className="size-4" />
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">View Site</TooltipContent>
                        </Tooltip>

                        <div className="py-1">
                            <UserButton
                                afterSignOutUrl="/admin"
                                appearance={{
                                    elements: {
                                        userButtonAvatarBox: "size-7"
                                    }
                                }}
                            />
                        </div>
                    </div>
                )}
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
