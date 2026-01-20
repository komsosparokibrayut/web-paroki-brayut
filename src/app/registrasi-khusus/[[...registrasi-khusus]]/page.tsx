import { SignUp } from "@clerk/nextjs";

export default function Page() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-brand-warm">
            <SignUp path="/registrasi-khusus" routing="path" signInUrl="/layanan-inti" />
        </div>
    );
}
