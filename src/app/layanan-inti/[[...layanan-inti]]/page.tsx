import { SignIn } from "@clerk/nextjs";

export default function Page() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-brand-warm">
            <SignIn path="/layanan-inti" routing="path" />
        </div>
    );
}
