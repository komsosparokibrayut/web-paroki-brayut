import { redirect } from "next/navigation";

// Sign-up is disabled — redirect to login
export default function Page() {
  redirect("/layanan-inti");
}
