import { useState } from "react";
import { toast } from "sonner";
import { setMeetingRoomPassword } from "@/features/booking/actions/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PasswordInputWithValidation } from "@/components/ui/password-input-with-validation";

export function AdminSettingsTab() {
  const [newPassword, setNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

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

  return (
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
  );
}
