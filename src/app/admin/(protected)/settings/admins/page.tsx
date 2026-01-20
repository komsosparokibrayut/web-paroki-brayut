import { getInvitations, getAdminUsers } from "@/features/admin/actions/users";
import AdminsClient from "./client";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Manage Admins | Admin Paroki",
};

export default async function AdminsPage() {
    const [invitations, users] = await Promise.all([
        getInvitations(),
        getAdminUsers(),
    ]);

    return <AdminsClient invitations={invitations.data} users={users} />;
}
