"use server";

import { getFile, commitFiles } from "@/lib/github/operations";

const FILES = {
  post: "post-categories.json",
  umkm: "umkm-categories.json",
  jadwal: "jadwal-categories.json",
  formulir: "formulir-categories.json"
} as const;

export type CategoryType = keyof typeof FILES;

export interface MasterCategoriesData {
  post: string[];
  umkm: string[];
  jadwal: string[];
  formulir: string[];
}

interface SingleCategoryFile {
    categories: string[];
}

const DEFAULT_DATA: MasterCategoriesData = {
  post: ["Berita", "Event", "Gereja", "Kegiatan", "Wacana", "Warta Paroki"],
  umkm: ["Kuliner", "Fashion", "Jasa", "Kerajinan", "Pertanian", "Lainnya"],
  jadwal: ["Liturgi", "Pastoral", "Sosial", "Lainnya"],
  formulir: ["Liturgi", "Pelayanan", "Lainnya"]
};

async function getCategoryFile(type: CategoryType): Promise<string[]> {
    try {
        const content = await getFile(FILES[type]);
        if (!content) return DEFAULT_DATA[type];
        const parsed: SingleCategoryFile = JSON.parse(content);
        return parsed.categories || DEFAULT_DATA[type];
    } catch (error) {
        console.error(`Error reading ${type} categories:`, error);
        return DEFAULT_DATA[type];
    }
}

export async function getMasterCategories(): Promise<MasterCategoriesData> {
  const [post, umkm, jadwal, formulir] = await Promise.all([
      getCategoryFile("post"),
      getCategoryFile("umkm"),
      getCategoryFile("jadwal"),
      getCategoryFile("formulir")
  ]);

  return { post, umkm, jadwal, formulir };
}

export async function saveCategoryFile(type: CategoryType, categories: string[]): Promise<{ success: boolean; error?: string }> {
    try {
        const data: SingleCategoryFile = { categories };
        await commitFiles(
            [{ path: FILES[type], content: JSON.stringify(data, null, 2) }],
            `Update ${type} categories`
        );
        return { success: true };
    } catch (error: any) {
        console.error(`Error saving ${type} categories:`, error);
        return { success: false, error: error.message };
    }
}

export async function saveMasterCategories(data: MasterCategoriesData): Promise<{ success: boolean; error?: string }> {
    try {
        await Promise.all([
            saveCategoryFile("post", data.post),
            saveCategoryFile("umkm", data.umkm),
            saveCategoryFile("jadwal", data.jadwal),
            saveCategoryFile("formulir", data.formulir),
        ]);
        return { success: true };
    } catch (error: any) {
         return { success: false, error: error.message };
    }
}

export async function addCategory(type: CategoryType, category: string): Promise<{ success: boolean; error?: string }> {
    try {
        const categories = await getCategoryFile(type);
        const trimmed = category.trim();
        
        if (!trimmed) return { success: false, error: "Category cannot be empty" };
        if (categories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
            return { success: false, error: "Category already exists" };
        }

        categories.push(trimmed);
        categories.sort();

        return await saveCategoryFile(type, categories);
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteCategory(type: CategoryType, category: string): Promise<{ success: boolean; error?: string }> {
    try {
        let categories = await getCategoryFile(type);
        categories = categories.filter(c => c !== category);
        return await saveCategoryFile(type, categories);
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateCategory(type: CategoryType, oldCategory: string, newCategory: string): Promise<{ success: boolean; error?: string }> {
    try {
        const categories = await getCategoryFile(type);
        const trimmed = newCategory.trim();

        if (!trimmed) return { success: false, error: "Category cannot be empty" };
        if (oldCategory !== trimmed && categories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
            return { success: false, error: "New category name already exists" };
        }

        const newCategories = categories.map(c => c === oldCategory ? trimmed : c).sort();
        return await saveCategoryFile(type, newCategories);
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
