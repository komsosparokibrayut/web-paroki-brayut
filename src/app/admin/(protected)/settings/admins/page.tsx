import { redirect } from "next/navigation";
import { getInvitations, getAdminUsers } from "@/features/admin/actions/users";
import { getWilayahLingkungan } from "@/actions/data";
import { getCurrentUser } from "@/lib/firebase/auth";
import AdminsClient from "./client";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Manage Admins | Admin Paroki",
};

export default async function AdminsPage() {
    const [invitations, users, wilayahData, currentUser] = await Promise.all([
        getInvitations(),
        getAdminUsers(),
        getWilayahLingkungan(),
        getCurrentUser(),
    ]);

    const wilayahList = wilayahData.map(w => ({ id: w.id, name: w.name }));

    return <AdminsClient invitations={invitations.data} users={users} wilayahList={wilayahList} currentUser={currentUser!} />;
}
