import { Metadata } from "next";
import { getFormulir } from "@/actions/data";
import FormulirClient from "./client";

export const metadata: Metadata = {
    title: "Kelola Formulir | Admin Paroki",
};

import { getMasterCategories } from "@/actions/master-categories";

export default async function AdminFormulirPage() {
    const data = await getFormulir();
    const categories = await getMasterCategories();

    return (
        <FormulirClient initialData={data} categories={categories.formulir} />
    );
}
