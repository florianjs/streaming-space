import { getAuthenticatedUser } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  // Require authentication for deleting categories
  const user = getAuthenticatedUser(event);

  const config = useRuntimeConfig();
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Category ID is required',
    });
  }

  try {
    // Delete category from PocketBase
    const response = await fetch(
      `${config.public.baseUrl}/api/collections/categories/records/${id}`,
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
          statusMessage: 'Category not found',
        });
      }

      const errorText = await response.text();
      console.error(
        'PocketBase category delete error:',
        response.status,
        errorText
      );

      throw createError({
        statusCode: response.status,
        statusMessage: `Failed to delete category: ${errorText}`,
      });
    }

    // Return success response
    return {
      success: true,
      message: 'Category deleted successfully',
    };
  } catch (error: any) {
    console.error('Error deleting category:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while deleting category',
    });
  }
});
