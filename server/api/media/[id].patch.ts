import { getAuthenticatedUser } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  // Require authentication for updating media
  const user = getAuthenticatedUser(event);

  const config = useRuntimeConfig();
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Media ID is required',
    });
  }

  try {
    // Parse multipart form data
    const formData = await readMultipartFormData(event);

    if (!formData) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Form data is required',
      });
    }

    // Extract form fields
    const mediaData: any = {};
    let torrentFile: File | null = null;
    let thumbnailFile: File | null = null;
    const categories: string[] = [];

    for (const field of formData) {
      if (field.name === 'torrent' && field.filename) {
        torrentFile = new File([field.data], field.filename, {
          type: field.type || 'application/octet-stream',
        });
      } else if (field.name === 'thumbnail' && field.filename) {
        thumbnailFile = new File([field.data], field.filename, {
          type: field.type || 'application/octet-stream',
        });
      } else if (field.name === 'categories' && field.data) {
        categories.push(field.data.toString());
      } else if (field.name && field.data) {
        mediaData[field.name] = field.data.toString();
      }
    }

    // Create FormData for PocketBase
    const pbFormData = new FormData();

    // Add fields that are being updated
    if (mediaData.title !== undefined)
      pbFormData.append('title', mediaData.title);
    if (mediaData.type !== undefined) pbFormData.append('type', mediaData.type);
    if (mediaData.imdb !== undefined) pbFormData.append('imdb', mediaData.imdb);
    if (mediaData.media_url !== undefined)
      pbFormData.append('media_url', mediaData.media_url);
    if (mediaData.description !== undefined)
      pbFormData.append('description', mediaData.description);
    if (mediaData.iframe !== undefined)
      pbFormData.append('iframe', mediaData.iframe);
    if (torrentFile) pbFormData.append('torrent', torrentFile);
    if (thumbnailFile) pbFormData.append('thumbnail', thumbnailFile);

    // Add categories
    if (categories.length > 0) {
      categories.forEach((categoryId) => {
        pbFormData.append('categories', categoryId);
      });
    } else if (mediaData.categories === '') {
      // Clear categories by sending empty value
      pbFormData.append('categories', '');
    }

    // Update media in PocketBase
    const response = await fetch(
      `${config.public.baseUrl}/api/collections/media/records/${id}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${user.pocketBaseToken}`,
        },
        body: pbFormData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        'PocketBase media update error:',
        response.status,
        errorText
      );

      let errorMessage = `Failed to update media: ${response.statusText}`;
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.data) {
          const fieldErrors = Object.entries(errorData.data)
            .map(
              ([field, error]: [string, any]) =>
                `${field}: ${error.message || error}`
            )
            .join(', ');
          errorMessage = fieldErrors;
        }
      } catch (parseError) {
        // Use default error message
      }

      throw createError({
        statusCode: response.status,
        statusMessage: errorMessage,
      });
    }

    const updatedMedia = await response.json();
    return updatedMedia;
  } catch (error: any) {
    console.error('Error updating media:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while updating media',
    });
  }
});
