import { useState, useEffect } from "react";
import { toast } from "sonner";
import { setMeetingRoomPassword } from "@/features/booking/actions/auth";
import { getAdminSettings, updateAdminSettings } from "@/features/booking/actions/settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInputWithValidation } from "@/components/ui/password-input-with-validation";
import { AdminSettings } from "@/features/booking/actions/settings";

export function AdminSettingsTab() {
  const [newPassword, setNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
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

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) return toast.error("Password minimal 8 karakter");

    setIsUpdatingPassword(true);
    try {
      const res = await setMeetingRoomPassword(newPassword);
      if (res.success) {
        toast.success("Password diperbarui");
        setNewPassword("");
      } else {
        toast.error(res.error || "Gagal memperbarui password");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan tak terduga");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Password Settings */}
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Pengaturan Keamanan</CardTitle>
          <CardDescription>Update password bersama untuk mengakses halaman booking publik.</CardDescription>
        </CardHeader>
        <form onSubmit={handleUpdatePassword}>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <PasswordInputWithValidation
                value={newPassword}
                onChange={setNewPassword}
                placeholder="Masukkan password baru"
                minLength={8}
              />
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 border-t p-4">
            <Button type="submit" disabled={isUpdatingPassword}>
              {isUpdatingPassword ? "Memperbarui..." : "Update Password"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Admin Contact & Donation Settings */}
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Pengaturan Umum</CardTitle>
          <CardDescription>Kelola nomor WhatsApp admin dan statistik donasi.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSaveSettings}>
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
