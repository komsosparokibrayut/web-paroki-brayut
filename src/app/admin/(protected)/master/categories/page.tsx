import { getMasterCategories } from "@/actions/master-categories";
import CategoryManager from "@/components/admin/CategoryManager";

export default async function MasterCategoriesPage() {
    const initialData = await getMasterCategories();

    return (
        <CategoryManager initialData={initialData} />
    );
}
