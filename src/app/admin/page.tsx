import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/nextauth.config";
import LoginForm from "@/components/admin/LoginForm";

export default async function AdminRootPage() {
  const session = await getServerSession(authOptions);

  // If already authenticated, go to dashboard
  if (session) {
    redirect("/admin/dashboard");
  }

  // Otherwise show login form
  return <LoginForm />;
}
