import { getAuthenticatedUser } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  // Require authentication for updating videos
  const user = getAuthenticatedUser(event);

  const config = useRuntimeConfig();
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Video ID is required',
    });
  }

  try {
    // Prepare form data for Pocketbase
    const formData = new FormData();

    // Only add fields that are being updated
    if (body.title !== undefined) {
      formData.append('title', body.title);
    }

    if (body.type !== undefined) {
      formData.append('type', body.type);
    }

    if (body.description !== undefined) {
      formData.append('description', body.description);
    }

    if (body.url !== undefined) {
      formData.append('media_url', body.url);
    }

    if (body.iframe !== undefined) {
      formData.append('iframe', body.iframe);
    }

    if (body.imdb !== undefined) {
      formData.append('imdb', body.imdb);
    }

    // Handle categories update
    if (body.categories !== undefined) {
      if (Array.isArray(body.categories) && body.categories.length > 0) {
        body.categories.forEach((categoryId: string) => {
          formData.append('categories', categoryId);
        });
      } else {
        // Clear categories by sending empty value
        formData.append('categories', '');
      }
    }

    // Handle file uploads
    if (body.thumbnail) {
      formData.append('thumbnail', body.thumbnail);
    }

    if (body.torrent) {
      formData.append('torrent', body.torrent);
    }

    // Update video in Pocketbase
    const response = await fetch(
      `${config.public.baseUrl}/api/collections/media/records/${id}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${user.pocketBaseToken}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Video not found',
        });
      }

      const errorText = await response.text();
      console.error('Pocketbase update error:', response.status, errorText);

      throw createError({
        statusCode: response.status,
        statusMessage: `Failed to update video: ${errorText}`,
      });
    }

    const updatedItem = await response.json();

    // Transform the response to match the frontend Video interface
    const transformedVideo = {
      id: updatedItem.id,
      title: updatedItem.title || 'Untitled',
      description: updatedItem.description || '',
      url: updatedItem.media_url || updatedItem.iframe || '',
      thumbnail: updatedItem.thumbnail
        ? `${config.public.baseUrl}/api/files/${updatedItem.collectionId}/${updatedItem.id}/${updatedItem.thumbnail}`
        : undefined,
      duration: '0:00',
      uploadedAt: new Date(updatedItem.created),
      categories: updatedItem.expand?.categories || [],
    };

    return transformedVideo;
  } catch (error: any) {
    console.error('Error updating video:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while updating video',
    });
  }
});
