import { getAuthenticatedUser } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  // Require authentication for deleting videos
  const user = getAuthenticatedUser(event);

  const config = useRuntimeConfig();
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Video ID is required',
    });
  }

  try {
    // Delete video from Pocketbase
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
          statusMessage: 'Video not found',
        });
      }

      const errorText = await response.text();
      console.error('Pocketbase delete error:', response.status, errorText);

      throw createError({
        statusCode: response.status,
        statusMessage: `Failed to delete video: ${errorText}`,
      });
    }

    // Return success response
    return {
      success: true,
      message: 'Video deleted successfully',
    };
  } catch (error: any) {
    console.error('Error deleting video:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while deleting video',
    });
  }
});
