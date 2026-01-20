import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminRootPage() {
  const { userId } = await auth();

  // If already authenticated by Clerk, go to dashboard
  if (userId) {
    redirect("/admin/dashboard");
  }

  // Otherwise redirect to Clerk sign-in page
  redirect("/layanan-inti");
}
