import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/nextauth.config";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import { LoadingProvider } from "@/components/admin/LoadingProvider";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Separator } from "@/components/ui/separator";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin");
  }

  return (
    <div className="admin-theme font-rubik bg-[#F8FAFC]">
      <LoadingProvider>
        <SidebarProvider>
          <AdminSidebar user={session.user || {}} />
          <SidebarInset>
            <header className="flex sticky top-0 z-40 h-14 shrink-0 items-center gap-2 border-b bg-white px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <AdminPageTitle />
            </header>
            <main className="flex-1 p-4 sm:p-6 bg-[#F8FAFC] min-h-[calc(100vh-3.5rem)]">
              {children}
            </main>
          </SidebarInset>
          <Toaster position="bottom-right" richColors />
        </SidebarProvider>
      </LoadingProvider>
    </div>
  );
}

