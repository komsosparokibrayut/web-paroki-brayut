"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase/client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSessionAndRedirect = async (idToken: string) => {
    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      await auth.signOut();
      setError(data.error || "Login gagal. Silakan coba lagi.");
      setLoading(false);
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      await handleSessionAndRedirect(idToken);
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code !== "auth/popup-closed-by-user" && err.code !== "auth/cancelled-popup-request") {
        setError("Terjadi kesalahan saat login lewat Google. Silakan coba lagi.");
      }
      setLoading(false);
    }
  };

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await result.user.getIdToken();
      await handleSessionAndRedirect(idToken);
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === "auth/invalid-login-credentials" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("Email atau password tidak valid.");
      } else {
        setError("Terjadi kesalahan sistem saat login. Silakan coba lagi.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-warm py-12">
      <div className="w-full max-w-sm mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 mb-4">
              <Image
                src="/favicons/logo.png"
                alt="Paroki Brayut"
                width={64}
                height={64}
                className="object-contain"
              />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Admin CMS</h1>
            <p className="text-sm text-slate-500 mt-1">Paroki Brayut</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleEmailPasswordLogin} className="space-y-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
                disabled={loading}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                className="h-11"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Masuk"}
            </Button>
            <button
              type="button"
              onClick={() => { setForgotMode(true); setError(null); setResetSent(false); }}
              className="w-full text-xs text-blue-600 hover:text-blue-700 hover:underline mt-1"
            >
              Lupa password?
            </button>
          </form>

          {/* Forgot Password Section */}
          {forgotMode && (
            <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-sm font-medium text-slate-700 mb-3">Reset Password</p>
              {resetSent ? (
                <div className="text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
                  Link reset password telah dikirim ke email Anda. Silakan cek inbox.
                </div>
              ) : (
                <div className="space-y-3">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Masukkan email admin"
                    disabled={loading}
                    className="h-10"
                  />
                  <Button
                    type="button"
                    disabled={loading || !email}
                    className="w-full h-10 bg-amber-600 hover:bg-amber-700 text-white text-sm"
                    onClick={async () => {
                      setLoading(true);
                      setError(null);
                      try {
                        await sendPasswordResetEmail(auth, email);
                        setResetSent(true);
                      } catch (err: any) {
                        if (err.code === "auth/user-not-found") {
                          setResetSent(true); // Don't reveal if user exists
                        } else {
                          setError("Gagal mengirim link reset. Silakan coba lagi.");
                        }
                      }
                      setLoading(false);
                    }}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Kirim Link Reset"}
                  </Button>
                </div>
              )}
              <button
                type="button"
                onClick={() => { setForgotMode(false); setResetSent(false); }}
                className="text-xs text-slate-500 hover:text-slate-700 mt-3 hover:underline"
              >
                ← Kembali ke login
              </button>
            </div>
          )}

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">Atau</span>
            </div>
          </div>

          {/* Google Login Button */}
          <Button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            variant="outline"
            className="w-full h-11 text-sm font-medium gap-3 border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 transition-all text-slate-600"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Masuk dengan Google
          </Button>
        </div>
      </div>
    </div>
  );
}
