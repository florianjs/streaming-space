export interface CategoryServer {
  id: string;
  name: string;
  description?: string;
  slug?: string;
  color?: string;
  icon?: string | null;
  sort_order?: number;
  active: boolean;
  created: Date;
  updated: Date;
}

export interface CategoriesResponse {
  categories: CategoryServer[];
  pagination: {
    page: number;
    perPage: number;
    totalPages: number;
    totalItems: number;
  };
}

export const useCategoriesServer = () => {
  // Use Nuxt's useState for SSR-safe global state
  const categories = useState<CategoryServer[]>('categories', () => []);
  const isLoading = useState<boolean>('categoriesLoading', () => false);
  const error = useState<string | null>('categoriesError', () => null);

  const fetchCategories = async (options?: {
    active?: boolean;
    sort?: string;
    page?: number;
    perPage?: number;
  }): Promise<CategoryServer[]> => {
    // Skip if already loading to prevent concurrent requests
    if (isLoading.value) {
      console.log(
        '[useCategoriesServer] Already loading, returning cached data'
      );
      return categories.value;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const query: Record<string, string> = {};

      if (options?.active !== undefined) {
        query.active = options.active.toString();
      }
      if (options?.sort) {
        query.sort = options.sort;
      }
      if (options?.page) {
        query.page = options.page.toString();
      }
      if (options?.perPage) {
        query.perPage = options.perPage.toString();
      }

      console.log('[useCategoriesServer] Fetching with query:', query);

      const response = await $fetch<CategoriesResponse>('/api/categories', {
        query,
      });

      console.log('[useCategoriesServer] Raw response:', response);
      console.log(
        '[useCategoriesServer] Categories in response:',
        response?.categories?.length || 0
      );

      categories.value = response.categories || [];
      return response.categories || [];
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      error.value =
        err.message || err.data?.message || 'Failed to fetch categories';
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  const getActiveCategories = async (): Promise<CategoryServer[]> => {
    return await fetchCategories({ active: true, sort: 'sort_order,name' });
  };

  const searchCategories = (query: string): CategoryServer[] => {
    if (!query) return categories.value;

    const searchTerm = query.toLowerCase();
    return categories.value.filter(
      (category) =>
        category.name.toLowerCase().includes(searchTerm) ||
        (category.description &&
          category.description.toLowerCase().includes(searchTerm)) ||
        (category.slug && category.slug.toLowerCase().includes(searchTerm))
    );
  };

  return {
    categories: readonly(categories),
    isLoading: readonly(isLoading),
    error: readonly(error),
    fetchCategories,
    getActiveCategories,
    searchCategories,
  };
};
