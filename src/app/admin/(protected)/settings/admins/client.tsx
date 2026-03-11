"use client";

import { useState, useTransition } from "react";
import { inviteAdmin, revokeInvitation, updateUserRole, removeAdmin, resetAdminPassword } from "@/features/admin/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Mail, Trash2, UserPlus, Users, Pencil, Check, X, KeyRound } from "lucide-react";
import Image from "next/image";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { UserRole, ROLE_LABELS, ROLES } from "@/lib/roles";

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
        <div className="space-y-8 max-w-5xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Manage Admins</h1>
                    <p className="text-slate-500">Invite and manage administrators for the dashboard.</p>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                {/* Invite Card */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5 text-blue-600" />
                            Invite New Admin
                        </CardTitle>
                        <CardDescription>
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
                            <Input
                                id="invite-password"
                                placeholder="Min. 6 karakter"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                <div className="md:col-span-2 space-y-8">

                    {/* Pending Invitations */}
                    {invitations.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base font-semibold text-amber-600 flex items-center gap-2">
                                    <Mail className="h-4 w-4" /> Pending Invitations
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Sent</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {invitations.map((inv) => (
                                            <TableRow key={inv.id}>
                                                <TableCell className="font-medium">{inv.emailAddress}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{ROLE_LABELS[inv.role as UserRole] || inv.role}</Badge>
                                                </TableCell>
                                                <TableCell className="text-xs text-slate-500">
                                                    {new Date(inv.createdAt).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        onClick={() => handleRevoke(inv.id)}
                                                        disabled={isPending}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}

                    {/* Active Users */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                                <Users className="h-4 w-4" /> Active Administrators
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Last Active</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <UserRow key={user.id} user={user} />
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function UserRow({ user }: { user: Props['users'][0] }) {
    const [isEditing, setIsEditing] = useState(false);
    const [role, setRole] = useState<UserRole>(user.role || "news_reporter");
    const [isPending, startTransition] = useTransition();

    // Reset password state
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
    }

    const handleResetPassword = () => {
        if (!newPassword || newPassword.length < 6) {
            toast.error("Password harus minimal 6 karakter");
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
        <TableRow>
            <TableCell>
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 relative">
                        {user.imageUrl && (
                            <Image src={user.imageUrl} alt={user.name} fill className="object-cover" />
                        )}
                    </div>
                    <div>
                        <div className="font-medium text-slate-900">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                    </div>
                </div>
            </TableCell>
            <TableCell>
                {isEditing ? (
                    <div className="flex items-center gap-2">
                        <Select value={role} onValueChange={(val) => setRole(val as UserRole)}>
                            <SelectTrigger className="h-8 w-[140px]">
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
                    <div className="flex items-center gap-2">
                        <Badge variant={user.role === "super_admin" ? "default" : "secondary"}>
                            {ROLE_LABELS[user.role || "news_reporter"]}
                        </Badge>
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-400 hover:text-blue-600" onClick={() => setIsEditing(true)}>
                            <Pencil className="h-3 w-3" />
                        </Button>
                    </div>
                )}
            </TableCell>
            <TableCell className="text-xs text-slate-500">
                {user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString() : "Never"}
            </TableCell>
            <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                    {/* Reset Password Dialog */}
                    <Dialog open={resetDialogOpen} onOpenChange={(open) => { setResetDialogOpen(open); if (!open) setNewPassword(""); }}>
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-amber-500 hover:text-amber-600 hover:bg-amber-50"
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
                                    <Input
                                        id={`reset-pw-${user.id}`}
                                        type="password"
                                        placeholder="Min. 6 karakter"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
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

                    {/* Remove Admin Dialog */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
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
            </TableCell>
        </TableRow>
    );
}
