import { getOptionalAuthenticatedUser } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const user = getOptionalAuthenticatedUser(event);
  const config = useRuntimeConfig();
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Video ID is required',
    });
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

    // Fetch single video from Pocketbase
    const response = await fetch(
      `${config.public.baseUrl}/api/collections/media/records/${id}?expand=categories`,
      { headers }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Video not found',
        });
      }

      const errorText = await response.text();
      console.error('Pocketbase error:', response.status, errorText);

      throw createError({
        statusCode: response.status,
        statusMessage: `Failed to fetch video: ${errorText}`,
      });
    }

    const item = await response.json();

    // Transform the data to match the frontend Video interface
    const transformedVideo = {
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
    };

    return transformedVideo;
  } catch (error: any) {
    console.error('Error fetching video:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while fetching video',
    });
  }
});
