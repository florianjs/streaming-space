import { getOptionalAuthenticatedUser } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  // Get user authentication (optional for public videos)
  const user = getOptionalAuthenticatedUser(event);

  const config = useRuntimeConfig();
  const query = getQuery(event);
  const searchTerm = query.q as string;

  if (!searchTerm || !searchTerm.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Search query is required',
    });
  }

  // Build query parameters
  const params = new URLSearchParams({
    sort: '-created',
    expand: 'categories',
    page: (query.page as string) || '1',
    perPage: (query.perPage as string) || '50',
    filter: `title ~ "${searchTerm}" || description ~ "${searchTerm}"`,
  });

  try {
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add auth header if user is authenticated
    if (user?.pocketBaseToken) {
      headers.Authorization = `Bearer ${user.pocketBaseToken}`;
    }

    // Fetch from Pocketbase
    const response = await fetch(
      `${
        config.public.baseUrl
      }/api/collections/media/records?${params.toString()}`,
      { headers }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pocketbase search error:', response.status, errorText);

      throw createError({
        statusCode: response.status,
        statusMessage: `Failed to search videos: ${errorText}`,
      });
    }

    const data = await response.json();

    // Transform the data to match the frontend Video interface
    const transformedVideos = data.items.map((item: any) => ({
      id: item.id,
      title: item.title || 'Untitled',
      description: item.description || '',
      url: item.media_url || item.iframe || '',
      thumbnail: item.thumbnail
        ? `${config.public.baseUrl}/api/files/${item.collectionId}/${item.id}/${item.thumbnail}`
        : undefined,
      duration: '0:00',
      uploadedAt: new Date(item.created),
      categories: item.expand?.categories || [],
    }));

    // Return the transformed data
    return {
      videos: transformedVideos,
      searchTerm,
      pagination: {
        page: data.page,
        perPage: data.perPage,
        totalPages: data.totalPages,
        totalItems: data.totalItems,
      },
    };
  } catch (error: any) {
    console.error('Error searching videos:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while searching videos',
    });
  }
});
