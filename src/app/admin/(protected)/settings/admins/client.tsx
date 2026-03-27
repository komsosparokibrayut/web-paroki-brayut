"use client";

import { useState, useTransition } from "react";
import { inviteAdmin, revokeInvitation, updateUserRole, removeAdmin, resetAdminPassword } from "@/features/admin/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Mail, Trash2, UserPlus, Users, Pencil, Check, X, KeyRound, Clock } from "lucide-react";
import Image from "next/image";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PasswordInputWithValidation } from "@/components/ui/password-input-with-validation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import { UserRole, ROLE_LABELS } from "@/lib/roles";
import { validatePassword } from "@/lib/password-validation";

interface Props {
    invitations: Array<{
        id: string;
        emailAddress: string;
        status: string;
        createdAt: number;
        role?: string;
    }>;
    users: Array<{
        id: string;
        email: string;
        name: string;
        imageUrl: string;
        lastSignInAt: number | null;
        role?: UserRole;
    }>;
}

export default function AdminsClient({ invitations, users }: Props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<UserRole>("news_reporter");
    const [isPending, startTransition] = useTransition();

    const handleInvite = () => {
        if (!email) return;

        startTransition(async () => {
            const result = await inviteAdmin(email, role, password || undefined);
            if (result.success) {
                toast.success("Admin berhasil ditambahkan");
                setEmail("");
                setPassword("");
                setRole("news_reporter");
            } else {
                toast.error(result.error || "Gagal menambahkan admin");
            }
        });
    };

    const handleRevoke = (id: string) => {
        startTransition(async () => {
            const result = await revokeInvitation(id);
            if (result.success) {
                toast.success("Invitation revoked");
            } else {
                toast.error("Failed to revoke invitation");
            }
        });
    };

    return (
        <div className="space-y-6 w-full min-w-0">
            {/* Page Header */}
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Manage Admins</h1>
                <p className="text-slate-500 text-sm mt-1">Invite and manage administrators for the dashboard.</p>
            </div>

            {/* Main Layout: stacked on mobile, side-by-side on md+ */}
            <div className="flex flex-col md:grid md:grid-cols-3 gap-6">

                {/* Invite Card */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <UserPlus className="h-5 w-5 text-blue-600" />
                            Invite New Admin
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Add a new admin with email and optional password.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="invite-email">Email</Label>
                            <Input
                                id="invite-email"
                                placeholder="email@example.com"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="invite-password">Password <span className="text-slate-400 font-normal">(opsional)</span></Label>
                            <PasswordInputWithValidation
                                id="invite-password"
                                placeholder="Min. 12 karakter"
                                value={password}
                                onChange={setPassword}
                                minLength={12}
                            />
                            <p className="text-xs text-slate-400">Jika dikosongkan, admin hanya bisa login lewat Google.</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select value={role} onValueChange={(val) => setRole(val as UserRole)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(ROLE_LABELS).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            onClick={handleInvite}
                            disabled={isPending || !email}
                        >
                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                            Tambah Admin
                        </Button>
                    </CardContent>
                </Card>

                {/* Lists Column */}
                <div className="md:col-span-2 space-y-6 min-w-0">

                    {/* Pending Invitations */}
                    {invitations.length > 0 && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold text-amber-600 flex items-center gap-2">
                                    <Mail className="h-4 w-4" /> Pending Invitations
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-100">
                                    {invitations.map((inv) => (
                                        <div key={inv.id} className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-sm text-slate-900 truncate">{inv.emailAddress}</p>
                                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                    <Badge variant="outline" className="text-xs">
                                                        {ROLE_LABELS[inv.role as UserRole] || inv.role}
                                                    </Badge>
                                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(inv.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                                                onClick={() => handleRevoke(inv.id)}
                                                disabled={isPending}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Active Administrators */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                                <Users className="h-4 w-4" /> Active Administrators
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100">
                                {users.map((user) => (
                                    <UserCard key={user.id} user={user} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function UserCard({ user }: { user: Props['users'][0] }) {
    const [isEditing, setIsEditing] = useState(false);
    const [role, setRole] = useState<UserRole>(user.role || "news_reporter");
    const [isPending, startTransition] = useTransition();
    const [newPassword, setNewPassword] = useState("");
    const [resetDialogOpen, setResetDialogOpen] = useState(false);

    const handleSaveRole = () => {
        startTransition(async () => {
            const result = await updateUserRole(user.id, role);
            if (result.success) {
                toast.success("Role updated successfully");
                setIsEditing(false);
            } else {
                toast.error(result.error || "Failed to update role");
            }
        });
    };

    const handleRemoveUser = () => {
        startTransition(async () => {
            const result = await removeAdmin(user.id);
            if (result.success) {
                toast.success("Admin removed successfully");
            } else {
                toast.error(result.error || "Failed to remove admin");
            }
        });
    };

    const handleResetPassword = () => {
        const validation = validatePassword(newPassword);
        if (!validation.isValid) {
            toast.error(`Password tidak memenuhi syarat: ${validation.errors[0]}`);
            return;
        }

        startTransition(async () => {
            const result = await resetAdminPassword(user.id, newPassword);
            if (result.success) {
                toast.success(`Password untuk ${user.email} berhasil direset`);
                setNewPassword("");
                setResetDialogOpen(false);
            } else {
                toast.error(result.error || "Gagal mereset password");
            }
        });
    };

    return (
        <div className="px-4 py-4 sm:px-6">
            {/* Top row: Avatar + Name/Email + Action buttons */}
            <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="h-9 w-9 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 relative mt-0.5">
                    {user.imageUrl && (
                        <Image src={user.imageUrl} alt={user.name} fill className="object-cover" />
                    )}
                </div>

                {/* Name + email */}
                <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 text-sm truncate">{user.name}</div>
                    <div className="text-xs text-slate-500 truncate">{user.email}</div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Reset Password */}
                    <Dialog open={resetDialogOpen} onOpenChange={(open) => { setResetDialogOpen(open); if (!open) setNewPassword(""); }}>
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                                title="Reset Password"
                            >
                                <KeyRound className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Reset Password</DialogTitle>
                                <DialogDescription>
                                    Masukkan password baru untuk <strong>{user.name}</strong> ({user.email}).
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor={`reset-pw-${user.id}`}>Password Baru</Label>
                                    <PasswordInputWithValidation
                                        id={`reset-pw-${user.id}`}
                                        placeholder="Min. 12 karakter"
                                        value={newPassword}
                                        onChange={setNewPassword}
                                        minLength={12}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Batal</Button>
                                </DialogClose>
                                <Button
                                    className="bg-amber-600 hover:bg-amber-700"
                                    onClick={handleResetPassword}
                                    disabled={isPending || !newPassword}
                                >
                                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                                    Reset Password
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Remove Admin */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Remove Admin?</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to remove <strong>{user.name}</strong> from admins? This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button
                                    variant="destructive"
                                    onClick={handleRemoveUser}
                                    disabled={isPending}
                                >
                                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                    Remove Admin
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Bottom row: Role badge + last active + edit */}
            <div className="mt-3 ml-12 flex items-center gap-2 flex-wrap">
                {isEditing ? (
                    <div className="flex items-center gap-2 flex-wrap">
                        <Select value={role} onValueChange={(val) => setRole(val as UserRole)}>
                            <SelectTrigger className="h-8 w-[160px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={handleSaveRole} disabled={isPending}>
                            <Check className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400" onClick={() => setIsEditing(false)} disabled={isPending}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={user.role === "super_admin" ? "default" : "secondary"} className="text-xs">
                            {ROLE_LABELS[user.role || "news_reporter"]}
                        </Badge>
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-400 hover:text-blue-600" onClick={() => setIsEditing(true)}>
                            <Pencil className="h-3 w-3" />
                        </Button>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString("id-ID") : "Never"}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
