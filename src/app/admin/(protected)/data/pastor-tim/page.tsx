import { getPastorTimKerja } from "@/actions/data";
import PastorTimClient from "./client";

export default async function AdminPastorTimPage() {
    const data = await getPastorTimKerja();
    return <PastorTimClient initialData={data} />;
}
