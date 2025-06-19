import { getAuthenticatedUser } from '../../utils/auth';
import { apiRateLimit } from '../../utils/rateLimit';
import { videoSchema, validateInput } from '../../utils/validation';

export default defineEventHandler(async (event) => {
  // Apply rate limiting
  apiRateLimit(event);

  // Require authentication for creating videos
  const user = getAuthenticatedUser(event);

  const config = useRuntimeConfig();
  const body = await readBody(event);

  // Validate and sanitize input
  const validatedData = validateInput(videoSchema, body);

  try {
    // Prepare form data for Pocketbase using validated data
    const formData = new FormData();
    formData.append('title', validatedData.title);
    formData.append('type', validatedData.type);

    if (validatedData.description) {
      formData.append('description', validatedData.description);
    }

    if (validatedData.url) {
      formData.append('media_url', validatedData.url);
    }

    if (validatedData.iframe) {
      formData.append('iframe', validatedData.iframe);
    }

    if (validatedData.imdb) {
      formData.append('imdb', validatedData.imdb);
    }

    // Handle categories
    if (validatedData.categories && Array.isArray(validatedData.categories)) {
      validatedData.categories.forEach((categoryId: string) => {
        formData.append('categories', categoryId);
      });
    }

    // Handle file uploads (thumbnail, torrent)
    if (body.thumbnail) {
      formData.append('thumbnail', body.thumbnail);
    }

    if (body.torrent) {
      formData.append('torrent', body.torrent);
    }

    // Create video in Pocketbase
    const response = await fetch(
      `${config.public.baseUrl}/api/collections/media/records`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.pocketBaseToken}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pocketbase creation error:', response.status, errorText);

      throw createError({
        statusCode: response.status,
        statusMessage: `Failed to create video: ${errorText}`,
      });
    }

    const newItem = await response.json();

    // Transform the response to match the frontend Video interface
    const transformedVideo = {
      id: newItem.id,
      title: newItem.title || 'Untitled',
      description: newItem.description || '',
      url: newItem.media_url || newItem.iframe || '',
      thumbnail: newItem.thumbnail
        ? `${config.public.baseUrl}/api/files/${newItem.collectionId}/${newItem.id}/${newItem.thumbnail}`
        : undefined,
      duration: '0:00',
      uploadedAt: new Date(newItem.created),
      categories: newItem.expand?.categories || [],
    };

    return transformedVideo;
  } catch (error: any) {
    console.error('Error creating video:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while creating video',
    });
  }
});
