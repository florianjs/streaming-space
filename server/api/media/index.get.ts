import { getOptionalAuthenticatedUser } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  // Optional authentication - allows both public and authenticated access
  const user = getOptionalAuthenticatedUser(event);

  const config = useRuntimeConfig();
  const query = getQuery(event);

  try {
    // Build query parameters
    const params = new URLSearchParams();

    // Default expand and sorting
    params.append('expand', 'categories');
    params.append('sort', (query.sort as string) || '-created');

    // Handle pagination
    if (query.page) params.append('page', query.page as string);
    if (query.perPage) params.append('perPage', query.perPage as string);

    // Handle filtering
    if (query.filter) {
      params.append('filter', query.filter as string);
    }

    // Handle search
    if (query.search) {
      const searchFilter = `title ~ "${query.search}" || description ~ "${query.search}"`;
      if (query.filter) {
        params.set('filter', `(${query.filter}) && (${searchFilter})`);
      } else {
        params.append('filter', searchFilter);
      }
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
      }/api/collections/media/records?${params.toString()}`,
      { headers }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        'PocketBase media fetch error:',
        response.status,
        errorText
      );

      throw createError({
        statusCode: response.status,
        statusMessage: `Failed to fetch media: ${errorText}`,
      });
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching media:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while fetching media',
    });
  }
});
