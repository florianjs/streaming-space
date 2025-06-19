import { getOptionalAuthenticatedUser } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  // Optional authentication - allows both public and authenticated access
  const user = getOptionalAuthenticatedUser(event);

  const config = useRuntimeConfig();
  const query = getQuery(event);

  try {
    // Build query parameters
    const params = new URLSearchParams();

    // Default sorting
    params.append('sort', (query.sort as string) || 'sort_order');

    // Handle pagination
    if (query.page) params.append('page', query.page as string);
    if (query.perPage) params.append('perPage', query.perPage as string);

    // Handle filtering
    if (query.filter) {
      params.append('filter', query.filter as string);
    } else if (query.active === 'true') {
      params.append('filter', 'active=true');
    }

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add auth header if user is authenticated
    if (user?.pocketBaseToken) {
      headers.Authorization = `Bearer ${user.pocketBaseToken}`;
    }

    // Fetch from PocketBase
    const response = await fetch(
      `${
        config.public.baseUrl
      }/api/collections/categories/records?${params.toString()}`,
      { headers }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        'PocketBase categories fetch error:',
        response.status,
        errorText
      );

      throw createError({
        statusCode: response.status,
        statusMessage: `Failed to fetch categories: ${errorText}`,
      });
    }

    const data = await response.json();

    // Transform PocketBase response to match CategoriesResponse interface
    return {
      categories: data.items || data || [],
      pagination: {
        page: data.page || 1,
        perPage: data.perPage || 30,
        totalPages: data.totalPages || 1,
        totalItems:
          data.totalItems ||
          (data.items
            ? data.items.length
            : Array.isArray(data)
            ? data.length
            : 0),
      },
    };
  } catch (error: any) {
    console.error('Error fetching categories:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while fetching categories',
    });
  }
});
