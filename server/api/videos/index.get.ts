import { getOptionalAuthenticatedUser } from '../../utils/auth';

interface PocketBaseVideo {
  collectionId: string;
  collectionName: string;
  id: string;
  title: string;
  imdb: string;
  media_url: string;
  description: string;
  iframe: string;
  torrent: string;
  magnet_link?: string;
  type: string;
  thumbnail: string;
  created: string;
  updated: string;
  categories?: string[];
  expand?: {
    categories?: Array<{
      id: string;
      name: string;
      color?: string;
      slug?: string;
    }>;
  };
}

interface PocketBaseResponse {
  page: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
  items: PocketBaseVideo[];
}

export default defineEventHandler(async (event) => {
  // Get user authentication (optional for public videos)
  const user = getOptionalAuthenticatedUser(event);

  const config = useRuntimeConfig();
  const query = getQuery(event);

  // Build query parameters
  const params = new URLSearchParams({
    sort: '-created',
    expand: 'categories',
    page: (query.page as string) || '1',
    perPage: (query.perPage as string) || '50',
  });

  // Add search if provided
  if (query.search) {
    params.append(
      'filter',
      `title ~ "${query.search}" || description ~ "${query.search}"`
    );
  }

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
      console.error('Pocketbase error:', response.status, errorText);

      throw createError({
        statusCode: response.status,
        statusMessage: `Failed to fetch videos: ${errorText}`,
      });
    }

    const data: PocketBaseResponse = await response.json();

    // Transform the data to match the frontend Video interface
    const transformedVideos = data.items.map((item) => ({
      id: item.id,
      title: item.title || 'Untitled',
      description: item.description || '',
      url: item.media_url || item.iframe || '',
      thumbnail: item.thumbnail
        ? `${config.public.baseUrl}/api/files/${item.collectionId}/${item.id}/${item.thumbnail}`
        : undefined,
      duration: '0:00', // You might want to calculate or store this
      uploadedAt: new Date(item.created),
      categories: item.expand?.categories || [],
      sourceType: item.type as 'stream' | 'torrent' | 'iframe',
      torrentFile: item.torrent
        ? `${config.public.baseUrl}/api/files/${item.collectionId}/${item.id}/${item.torrent}`
        : undefined,
      magnetLink: item.magnet_link,
    }));

    // Return the transformed data
    return {
      videos: transformedVideos,
      pagination: {
        page: data.page,
        perPage: data.perPage,
        totalPages: data.totalPages,
        totalItems: data.totalItems,
      },
    };
  } catch (error: any) {
    console.error('Error fetching videos:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while fetching videos',
    });
  }
});
