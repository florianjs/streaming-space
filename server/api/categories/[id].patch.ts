import { getAuthenticatedUser } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  // Require authentication for updating categories
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
    // Parse multipart form data
    const formData = await readMultipartFormData(event);

    if (!formData) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Form data is required',
      });
    }

    // Extract form fields
    const categoryData: any = {};
    let iconFile: File | null = null;

    for (const field of formData) {
      if (field.name === 'icon' && field.filename) {
        iconFile = new File([field.data], field.filename, {
          type: field.type || 'application/octet-stream',
        });
      } else if (field.name && field.data) {
        const value = field.data.toString();
        if (field.name === 'active') {
          categoryData[field.name] = value === 'true';
        } else if (field.name === 'sort_order') {
          categoryData[field.name] = parseInt(value) || 0;
        } else {
          categoryData[field.name] = value;
        }
      }
    }

    // Create FormData for PocketBase
    const pbFormData = new FormData();

    // Add fields that are being updated
    if (categoryData.name !== undefined)
      pbFormData.append('name', categoryData.name);
    if (categoryData.description !== undefined)
      pbFormData.append('description', categoryData.description);
    if (categoryData.slug !== undefined)
      pbFormData.append('slug', categoryData.slug);
    if (categoryData.color !== undefined)
      pbFormData.append('color', categoryData.color);
    if (categoryData.sort_order !== undefined)
      pbFormData.append('sort_order', categoryData.sort_order.toString());
    if (categoryData.active !== undefined)
      pbFormData.append('active', categoryData.active.toString());
    if (iconFile) pbFormData.append('icon', iconFile);

    // Update category in PocketBase
    const response = await fetch(
      `${config.public.baseUrl}/api/collections/categories/records/${id}`,
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
        'PocketBase category update error:',
        response.status,
        errorText
      );

      let errorMessage = `Failed to update category: ${response.statusText}`;
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

    const updatedCategory = await response.json();
    return updatedCategory;
  } catch (error: any) {
    console.error('Error updating category:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while updating category',
    });
  }
});
