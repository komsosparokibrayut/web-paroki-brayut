import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase/auth";

export default async function AdminRootPage() {
  const user = await getCurrentUser();

  // If already authenticated, go to dashboard
  if (user) {
    redirect("/admin/dashboard");
  }

  // Otherwise redirect to login page
  redirect("/layanan-inti");
}
