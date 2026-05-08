"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getAdminSettings, updateAdminSettings, AdminSettings } from "@/features/booking/actions/settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function GeneralSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const data = await getAdminSettings();
      setSettings(data);
      setIsLoading(false);
    };
    loadSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await updateAdminSettings(settings);
      if (res.success) {
        toast.success("Pengaturan disimpan");
      } else {
        toast.error(res.error || "Gagal menyimpan pengaturan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan tak terduga");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  if (isLoading) {
    return <div className="p-8">Memuat...</div>;
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan Umum</h1>
        <p className="text-muted-foreground">Kelola nomor WhatsApp admin dan statistik donasi.</p>
      </div>

      <Card className="max-w-md">
        <form onSubmit={handleSaveSettings}>
          <CardHeader>
            <CardTitle>Informasi Kontak & Donasi</CardTitle>
            <CardDescription>Kelola nomor WhatsApp admin dan statistik donasi untuk ditampilkan di halaman publik.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp">Nomor WhatsApp Admin</Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="6281234567890"
                value={settings.whatsapp_number || ""}
                onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Format: 628xxxxxxxxxx (tanpa + atau -)</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Nomor Telepon (Opsional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="0211234567"
                value={settings.phone_number || ""}
                onChange={(e) => setSettings({ ...settings, phone_number: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Nomor telepon paroki yang bisa dihubungi.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="donation_total">Total Donasi Terkumpul (IDR)</Label>
              <Input
                id="donation_total"
                type="number"
                placeholder="0"
                value={settings.donation_total || ""}
                onChange={(e) => setSettings({ ...settings, donation_total: parseInt(e.target.value) || 0 })}
              />
              {settings.donation_total && (
                <p className="text-xs text-muted-foreground">{formatCurrency(settings.donation_total)}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="donation_target">Target Donasi (IDR)</Label>
              <Input
                id="donation_target"
                type="number"
                placeholder="0"
                value={settings.donation_target || ""}
                onChange={(e) => setSettings({ ...settings, donation_target: parseInt(e.target.value) || 0 })}
              />
              {settings.donation_target && (
                <p className="text-xs text-muted-foreground">{formatCurrency(settings.donation_target)}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 border-t p-4">
            <Button type="submit" disabled={isSavingSettings}>
              {isSavingSettings ? "Menyimpan..." : "Simpan Pengaturan"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}