"use client";

import { useState } from "react";
import { toast } from "sonner";
import { verifyMeetingRoomPassword } from "@/features/booking/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";

export function AuthView({ onSuccess }: { onSuccess: () => void }) {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await verifyMeetingRoomPassword(password);
        if (success) {
            toast.success("Akses diberikan. Memuat data...");
            // We reload because that's what the original client did to fetch initial data
            window.location.reload(); 
        } else {
            toast.error("Password salah!");
        }
    };

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 pt-32 bg-brand-warm">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Peminjaman Ruang</CardTitle>
                    <CardDescription className="text-center text-muted-foreground">
                        Masukkan password untuk mengakses jadwal ruang rapat
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    className="pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-500" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-500" />
                                    )}
                                </Button>
                            </div>
                        </div>
                        <Button type="submit" className="w-full bg-brand-dark hover:bg-brand-dark/90 text-white">Akses Masuk</Button>
                    </form>
                    <p className="text-center text-sm text-muted-foreground mt-4">
                        Belum punya password?{" "}
                        <a href="/contact" className="text-brand-blue underline underline-offset-2 hover:text-brand-blue/80">
                            Hubungi sekretariat paroki
                        </a>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
