export interface Category {
  id: string;
  name: string;
  description?: string;
  slug?: string;
  color?: string;
  icon?: string;
  sort_order?: number;
  active: boolean;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
}

export interface CategoryForm {
  name: string;
  description?: string;
  slug?: string;
  color?: string;
  icon?: File | null;
  sort_order?: number;
  active: boolean;
}

export interface CategoryUpdate {
  name?: string;
  description?: string;
  slug?: string;
  color?: string;
  icon?: File | null;
  sort_order?: number;
  active?: boolean;
}

// Global state for categories
const categories = ref<Category[]>([]);

export const useCategories = () => {
  const config = useRuntimeConfig();

  // Note: Auth is now handled server-side - no need for client-side tokens

  const createCategory = async (
    categoryData: CategoryForm
  ): Promise<Category | null> => {
    try {
      // Check if name or slug already exists
      const existingByName = categories.value.find(
        (cat) => cat.name.toLowerCase() === categoryData.name.toLowerCase()
      );
      if (existingByName) {
        throw new Error(
          `Category with name "${categoryData.name}" already exists`
        );
      }

      if (categoryData.slug) {
        const existingBySlug = categories.value.find(
          (cat) => cat.slug === categoryData.slug
        );
        if (existingBySlug) {
          throw new Error(
            `Category with slug "${categoryData.slug}" already exists`
          );
        }
      }

      const formData = new FormData();

      // Add required fields
      formData.append('name', categoryData.name);
      formData.append('active', categoryData.active.toString());

      // Add optional fields
      if (categoryData.description)
        formData.append('description', categoryData.description);
      if (categoryData.slug) formData.append('slug', categoryData.slug);
      if (categoryData.color) formData.append('color', categoryData.color);
      if (categoryData.sort_order !== undefined)
        formData.append('sort_order', categoryData.sort_order.toString());

      // Add file upload
      if (categoryData.icon) {
        formData.append('icon', categoryData.icon);
      }

      console.log('🚀 Creating category with data:', categoryData);

      // Use secure server-side endpoint
      const newCategory = await $fetch('/api/categories', {
        method: 'POST',
        body: formData,
      });

      console.log('✅ Category created successfully:', newCategory);

      // Add to local state
      categories.value.unshift(newCategory);
      // Sort by sort_order
      categories.value.sort(
        (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
      );

      return newCategory;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  };

  const fetchCategories = async (): Promise<Category[]> => {
    try {
      // Use secure server-side endpoint
      const data = await $fetch<any>('/api/categories', {
        query: { sort: 'sort_order' },
      });

      categories.value = data.categories || data.items || data || [];
      return categories.value;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  };

  const getActiveCategories = async (): Promise<Category[]> => {
    try {
      // Use secure server-side endpoint
      const data = await $fetch<any>('/api/categories', {
        query: {
          active: 'true',
          sort: 'sort_order',
        },
      });

      return data.categories || data.items || data || [];
    } catch (error) {
      console.error('Error fetching active categories:', error);
      return [];
    }
  };

  const updateCategory = async (
    id: string,
    categoryData: CategoryUpdate
  ): Promise<Category | null> => {
    try {
      const formData = new FormData();

      // Add fields that are being updated
      if (categoryData.name !== undefined)
        formData.append('name', categoryData.name);
      if (categoryData.description !== undefined)
        formData.append('description', categoryData.description);
      if (categoryData.slug !== undefined)
        formData.append('slug', categoryData.slug);
      if (categoryData.color !== undefined)
        formData.append('color', categoryData.color);
      if (categoryData.sort_order !== undefined)
        formData.append('sort_order', categoryData.sort_order.toString());
      if (categoryData.active !== undefined)
        formData.append('active', categoryData.active.toString());

      // Add file upload
      if (categoryData.icon) {
        formData.append('icon', categoryData.icon);
      }

      // Use secure server-side endpoint
      const updatedCategory = await $fetch(`/api/categories/${id}`, {
        method: 'PATCH',
        body: formData,
      });

      console.log('✅ Category updated successfully:', updatedCategory);

      // Update in local state
      const index = categories.value.findIndex((c) => c.id === id);
      if (index !== -1) {
        categories.value[index] = updatedCategory;
        // Sort by sort_order
        categories.value.sort(
          (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
        );
      }

      return updatedCategory;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    try {
      // Use secure server-side endpoint
      await $fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      // Remove from local state
      categories.value = categories.value.filter((c) => c.id !== id);
      console.log('✅ Category deleted successfully');

      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  const getCategory = (id: string): Category | undefined => {
    return categories.value.find((c) => c.id === id);
  };

  const searchCategories = (query: string): Category[] => {
    return categories.value.filter(
      (category) =>
        category.name.toLowerCase().includes(query.toLowerCase()) ||
        (category.description &&
          category.description.toLowerCase().includes(query.toLowerCase()))
    );
  };

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD') // Normalize accented characters
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  const testConnection = async (): Promise<boolean> => {
    // Now using secure server-side endpoints - no direct PocketBase access
    try {
      await $fetch('/api/categories', { query: { page: '1', perPage: '1' } });
      console.log('✅ Connection test successful via server endpoint');
      return true;
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    }
  };

  // Debug functions simplified for security (no direct PocketBase access)
  const testMinimalCreate = async (): Promise<boolean> => {
    console.log(
      '⚠️ Debug function removed for security - use server-side endpoints'
    );
    return true;
  };

  const testAuthContext = async (): Promise<void> => {
    console.log(
      '⚠️ Debug function removed for security - auth handled server-side'
    );
  };

  const checkSchemaRules = async (): Promise<void> => {
    console.log(
      '⚠️ Debug function removed for security - schema managed server-side'
    );
  };

  const debugCurrentAuth = async (): Promise<void> => {
    console.log(
      '⚠️ Debug function removed for security - auth managed server-side'
    );
  };

  const testSchemaApplication = async (): Promise<void> => {
    console.log(
      '⚠️ Debug function removed for security - schema managed server-side'
    );
  };

  return {
    categories: readonly(categories),
    createCategory,
    fetchCategories,
    getActiveCategories,
    updateCategory,
    deleteCategory,
    getCategory,
    searchCategories,
    generateSlug,
    testConnection,
    testMinimalCreate,
    testAuthContext,
    checkSchemaRules,
    debugCurrentAuth,
    testSchemaApplication,
  };
};
