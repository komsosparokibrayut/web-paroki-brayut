"use client";

import { useState, useTransition } from "react";
import { inviteAdmin, revokeInvitation } from "@/features/admin/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Mail, Trash2, UserPlus, Users } from "lucide-react";
import Image from "next/image";

interface Props {
    invitations: Array<{
        id: string;
        emailAddress: string;
        status: string;
        createdAt: number;
    }>;
    users: Array<{
        id: string;
        email: string;
        name: string;
        imageUrl: string;
        lastSignInAt: number | null;
    }>;
}

export default function AdminsClient({ invitations, users }: Props) {
    const [email, setEmail] = useState("");
    const [isPending, startTransition] = useTransition();

    const handleInvite = () => {
        if (!email) return;

        startTransition(async () => {
            const result = await inviteAdmin(email);
            if (result.success) {
                toast.success("Invitation sent successfully");
                setEmail("");
            } else {
                toast.error(result.error || "Failed to send invitation");
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
                            Send an email invitation to a new team member.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                placeholder="email@example.com"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            onClick={handleInvite}
                            disabled={isPending || !email}
                        >
                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                            Send Invitation
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
                                            <TableHead>Sent</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {invitations.map((inv) => (
                                            <TableRow key={inv.id}>
                                                <TableCell className="font-medium">{inv.emailAddress}</TableCell>
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
                                        <TableHead>Last Active</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id}>
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
                                            <TableCell className="text-xs text-slate-500">
                                                {user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString() : "Never"}
                                            </TableCell>
                                        </TableRow>
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
