import { getAuthenticatedUser } from '../../utils/auth';
import { apiRateLimit } from '../../utils/rateLimit';
import {
  categorySchema,
  validateInput,
  fileUploadSchema,
  sanitizeFilename,
} from '../../utils/validation';

interface CategoryForm {
  name: string;
  description?: string;
  slug?: string;
  color?: string;
  icon?: File | null;
  sort_order?: number;
  active: boolean;
}

export default defineEventHandler(async (event) => {
  // Apply rate limiting
  apiRateLimit(event);

  // Require authentication for creating categories
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

    // Validate required fields
    if (!categoryData.name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Category name is required',
      });
    }

    // Create FormData for PocketBase
    const pbFormData = new FormData();
    pbFormData.append('name', categoryData.name);
    pbFormData.append('active', categoryData.active?.toString() || 'true');

    if (categoryData.description)
      pbFormData.append('description', categoryData.description);
    if (categoryData.slug) pbFormData.append('slug', categoryData.slug);
    if (categoryData.color) pbFormData.append('color', categoryData.color);
    if (categoryData.sort_order !== undefined)
      pbFormData.append('sort_order', categoryData.sort_order.toString());
    if (iconFile) pbFormData.append('icon', iconFile);

    // Create category in PocketBase
    const response = await fetch(
      `${config.public.baseUrl}/api/collections/categories/records`,
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
        'PocketBase category creation error:',
        response.status,
        errorText
      );

      let errorMessage = `Failed to create category: ${response.statusText}`;
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

    const newCategory = await response.json();
    return newCategory;
  } catch (error: any) {
    console.error('Error creating category:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while creating category',
    });
  }
});
