"use client";

import { useState, useEffect, useMemo } from "react";
import { useAdminRole } from "@/components/admin/AdminRoleProvider";
import { ROLE_LABELS } from "@/lib/roles";
import { getWilayahLingkungan } from "@/actions/data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, User, Shield, Phone, Eye, EyeOff, CheckCircle2, X } from "lucide-react";
import { auth } from "@/lib/firebase/client";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user } = useAdminRole();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [wilayahName, setWilayahName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneData, setPhoneData] = useState({
    phone: "",
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);

  const passwordRules = useMemo(() => [
    { label: "8 karakter minimum", test: (pw: string) => pw.length >= 8 },
    { label: "minimal 1 huruf kecil (a-z)", test: (pw: string) => /[a-z]/.test(pw) },
    { label: "minimal 1 huruf besar (A-Z)", test: (pw: string) => /[A-Z]/.test(pw) },
    { label: "minimal 1 angka (0-9)", test: (pw: string) => /[0-9]/.test(pw) },
    { label: "minimal 1 simbol (!@#$%^&*)", test: (pw: string) => /[^A-Za-z0-9]/.test(pw) },
  ], []);

  const newPasswordValid = useMemo(() => passwordRules.every(rule => rule.test(passwordData.newPassword)), [passwordData.newPassword, passwordRules]);
  const confirmPasswordValid = useMemo(() => passwordData.newPassword.length > 0 && passwordData.confirmPassword === passwordData.newPassword, [passwordData.newPassword, passwordData.confirmPassword]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function loadWilayahName() {
      if (user?.wilayah_id) {
        const allWilayah = await getWilayahLingkungan();
        const found = allWilayah.find(w => w.id === user.wilayah_id);
        setWilayahName(found?.name || null);
      }
    }
    loadWilayahName();
  }, [user?.wilayah_id]);

  const handleUpdatePassword = async () => {
    if (!firebaseUser || !user?.email) return;

    if (!passwordData.currentPassword) {
      toast.error("Password saat ini harus diisi");
      return;
    }

    if (!newPasswordValid) {
      toast.error("Password baru tidak memenuhi syarat");
      return;
    }

    if (!confirmPasswordValid) {
      toast.error("Password baru tidak cocok");
      return;
    }

    setIsUpdatingPassword(true);
    setIsLoading(true);

    try {
      const credential = EmailAuthProvider.credential(user.email, passwordData.currentPassword);
      await reauthenticateWithCredential(firebaseUser, credential);
      await updatePassword(firebaseUser, passwordData.newPassword);
      toast.success("Password berhasil diperbarui");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setIsUpdatingPassword(false);
    } catch (error: any) {
      toast.error(error.message || "Gagal memperbarui password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePhone = async () => {
    if (!firebaseUser) return;
    setIsUpdatingPhone(true);
    setIsLoading(true);
    try {
      toast.info("Fitur update nomor telepon belum tersedia");
    } finally {
      setIsLoading(false);
      setIsUpdatingPhone(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-rubik flex items-center gap-2">
            <User className="h-5 w-5" />
            Profil Admin
          </DialogTitle>
          <DialogDescription>
            Informasi akun dan pengaturan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Role
            </label>
            <div className="p-3 bg-muted rounded-lg">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {ROLE_LABELS[user.role] || user.role}
              </span>
            </div>
          </div>

          {user.wilayah_id && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Wilayah</label>
              <div className="p-3 bg-muted rounded-lg text-sm">
                {wilayahName || user.wilayah_id}
              </div>
            </div>
          )}

          <div className="border-t pt-4 space-y-4">
            <div className="space-y-3">
              <label className="text-sm font-medium">Ubah Password</label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Password saat ini"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  disabled={isLoading}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Password baru"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  disabled={isLoading}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {passwordData.newPassword.length > 0 && (
                <div className="space-y-1.5 pl-1">
                  {passwordRules.map((rule, index) => {
                    const passed = rule.test(passwordData.newPassword);
                    return (
                      <div
                        key={index}
                        className={cn(
                          "flex items-center gap-2 text-xs",
                          passed ? "text-green-600" : "text-red-500"
                        )}
                      >
                        {passed ? (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        ) : (
                          <X className="h-3.5 w-3.5 shrink-0" />
                        )}
                        <span>{rule.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Konfirmasi password baru"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  disabled={isLoading}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {passwordData.confirmPassword.length > 0 && (
                <div className={cn(
                  "flex items-center gap-2 text-xs pl-1",
                  confirmPasswordValid ? "text-green-600" : "text-red-500"
                )}>
                  {confirmPasswordValid ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <X className="h-3.5 w-3.5 shrink-0" />
                  )}
                  <span>Password cocok</span>
                </div>
              )}
              <Button
                onClick={handleUpdatePassword}
                disabled={isLoading || !passwordData.currentPassword || !newPasswordValid || !confirmPasswordValid}
                className="w-full"
              >
                {isLoading && isUpdatingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memperbarui...
                  </>
                ) : (
                  "Perbarui Password"
                )}
              </Button>
            </div>

            <div className="border-t pt-4 space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Ubah Nomor Telepon
              </label>
              <Input
                type="tel"
                placeholder="08xxxxxxxxxx"
                value={phoneData.phone}
                onChange={(e) => setPhoneData({ ...phoneData, phone: e.target.value })}
                disabled={isLoading}
              />
              <Button
                onClick={handleUpdatePhone}
                disabled={isLoading || !phoneData.phone}
                className="w-full"
                variant="outline"
              >
                {isLoading && isUpdatingPhone ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memperbarui...
                  </>
                ) : (
                  "Perbarui Telepon"
                )}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}