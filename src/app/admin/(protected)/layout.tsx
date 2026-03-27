import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import { LoadingProvider } from "@/components/admin/LoadingProvider";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Separator } from "@/components/ui/separator";

import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleGuard } from "@/components/admin/RoleGuard";
import { AdminRoleProvider } from "@/components/admin/AdminRoleProvider";
import { RoleSwitcher } from "@/components/admin/RoleSwitcher";

// All admin pages depend on runtime data (auth, filesystem, APIs)
// so they must not be statically pre-rendered at build time
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/layanan-inti");
  }

  return (
    <div className="admin-theme font-rubik bg-[#F8FAFC]">
      <LoadingProvider>
        <SidebarProvider>
          <AdminRoleProvider serverUser={user}>
            <TooltipProvider>
              <AdminSidebar />
              <SidebarInset className="min-w-0 w-full overflow-hidden">
                <header className="flex sticky top-0 z-40 h-14 shrink-0 items-center gap-2 border-b bg-white px-4">
                  <SidebarTrigger className="-ml-1" />
                  <Separator orientation="vertical" className="mr-2 h-4" />
                  <AdminPageTitle />
                  <div className="ml-auto flex items-center gap-2">
                    <RoleSwitcher />
                  </div>
                </header>
                <main className="flex-1 w-full min-w-0 p-4 sm:p-6 bg-[#F8FAFC] min-h-[calc(100vh-3.5rem)] overflow-x-hidden">
                  <RoleGuard>
                    {children}
                  </RoleGuard>
                </main>
              </SidebarInset>
              <Toaster position="bottom-right" richColors />
            </TooltipProvider>
          </AdminRoleProvider>
        </SidebarProvider>
      </LoadingProvider>
    </div>
  );
}
