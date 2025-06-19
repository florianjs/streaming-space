import { getAuthenticatedUser } from '../../utils/auth';
import { mediaRateLimit } from '../../utils/rateLimit';
import {
  mediaSchema,
  validateInput,
  fileUploadSchema,
  sanitizeFilename,
} from '../../utils/validation';

interface MediaForm {
  title: string;
  imdb?: string;
  media_url?: string;
  description?: string;
  iframe?: string;
  torrent?: File | null;
  type: 'torrent' | 'stream' | 'iframe';
  thumbnail?: File | null;
  categories?: string[];
}

export default defineEventHandler(async (event) => {
  // Apply rate limiting
  mediaRateLimit(event);

  // Require authentication for creating media
  const user = getAuthenticatedUser(event);

  const config = useRuntimeConfig();

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

    // Validate required fields
    if (!mediaData.title) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Media title is required',
      });
    }

    if (
      !mediaData.type ||
      !['torrent', 'stream', 'iframe'].includes(mediaData.type)
    ) {
      throw createError({
        statusCode: 400,
        statusMessage:
          'Valid media type is required (torrent, stream, or iframe)',
      });
    }

    // Create FormData for PocketBase
    const pbFormData = new FormData();
    pbFormData.append('title', mediaData.title);
    pbFormData.append('type', mediaData.type);

    if (mediaData.imdb) pbFormData.append('imdb', mediaData.imdb);
    if (mediaData.media_url)
      pbFormData.append('media_url', mediaData.media_url);
    if (mediaData.description)
      pbFormData.append('description', mediaData.description);
    if (mediaData.iframe) pbFormData.append('iframe', mediaData.iframe);
    if (torrentFile) pbFormData.append('torrent', torrentFile);
    if (thumbnailFile) pbFormData.append('thumbnail', thumbnailFile);

    // Add categories
    categories.forEach((categoryId) => {
      pbFormData.append('categories', categoryId);
    });

    // Create media in PocketBase
    const response = await fetch(
      `${config.public.baseUrl}/api/collections/media/records`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.pocketBaseToken}`,
        },
        body: pbFormData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        'PocketBase media creation error:',
        response.status,
        errorText
      );

      let errorMessage = `Failed to create media: ${response.statusText}`;
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

    const newMedia = await response.json();
    return newMedia;
  } catch (error: any) {
    console.error('Error creating media:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while creating media',
    });
  }
});
