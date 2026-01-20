"use server";

import { getFile, commitFiles } from "@/lib/github/operations";

const CATEGORIES_FILE = "categories.json";

interface CategoriesData {
  categories: string[];
}

export async function getAllCategories(): Promise<string[]> {
  try {
    const content = await getFile(CATEGORIES_FILE);
    if (!content) {
      // If file doesn't exist, generic default or empty
      return [];
    }
    
    const data: CategoriesData = JSON.parse(content);
    return data.categories.sort();
  } catch (error) {
    console.error("Error fetching categories:", error);
    return []; // Fail graceful
  }
}

export async function addCategory(category: string): Promise<{ success: boolean; error?: string }> {
  try {
    const content = await getFile(CATEGORIES_FILE);
    let data: CategoriesData = { categories: [] };

    if (content) {
      try {
        data = JSON.parse(content);
      } catch (e) {
        console.error("Error parsing categories.json:", e);
        // If corrupt, we might overwrite or fail. Let's try to preserve?
        // Risky. Let's start fresh if corrupt for now or fail.
        return { success: false, error: "Categories file is corrupt" };
      }
    }

    const trimmed = category.trim();
    if (!trimmed) return { success: false, error: "Category cannot be empty" };

    if (!data.categories.includes(trimmed)) {
      data.categories.push(trimmed);
      data.categories.sort();
      
      await commitFiles(
        [{ path: CATEGORIES_FILE, content: JSON.stringify(data, null, 2) }],
        `Add category: ${trimmed}`
      );
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error saving category:", error);
    return { success: false, error: error.message };
  }
}
