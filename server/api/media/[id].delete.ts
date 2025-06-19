import { getAuthenticatedUser } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  // Require authentication for deleting media
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
    // Delete media from PocketBase
    const response = await fetch(
      `${config.public.baseUrl}/api/collections/media/records/${id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user.pocketBaseToken}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Media not found',
        });
      }

      const errorText = await response.text();
      console.error(
        'PocketBase media delete error:',
        response.status,
        errorText
      );

      throw createError({
        statusCode: response.status,
        statusMessage: `Failed to delete media: ${errorText}`,
      });
    }

    // Return success response
    return {
      success: true,
      message: 'Media deleted successfully',
    };
  } catch (error: any) {
    console.error('Error deleting media:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while deleting media',
    });
  }
});
