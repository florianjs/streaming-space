/**
 * Composable for making authenticated API requests
 * Uses httpOnly cookies for authentication (no headers needed)
 */
export const useAuthenticatedFetch = () => {
  const { isAuthenticated } = useAuth();

  /**
   * Make an authenticated API request
   * Authentication is handled automatically via httpOnly cookies
   */
  const authenticatedFetch = async <T = any>(
    url: string,
    options: any = {}
  ): Promise<T> => {
    if (!isAuthenticated.value) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await $fetch<T>(url, options);
      return response as T;
    } catch (error: any) {
      // Handle authentication errors
      if (error.status === 401) {
        // Token might be expired, redirect to login
        await navigateTo('/login');
        throw new Error('Authentication failed');
      }
      throw error;
    }
  };

  /**
   * GET request with authentication
   */
  const get = <T = any>(url: string, options: any = {}): Promise<T> => {
    return authenticatedFetch<T>(url, { ...options, method: 'GET' });
  };

  /**
   * POST request with authentication
   */
  const post = <T = any>(
    url: string,
    body?: any,
    options: any = {}
  ): Promise<T> => {
    return authenticatedFetch<T>(url, { ...options, method: 'POST', body });
  };

  /**
   * PUT request with authentication
   */
  const put = <T = any>(
    url: string,
    body?: any,
    options: any = {}
  ): Promise<T> => {
    return authenticatedFetch<T>(url, { ...options, method: 'PUT', body });
  };

  /**
   * DELETE request with authentication
   */
  const del = <T = any>(url: string, options: any = {}): Promise<T> => {
    return authenticatedFetch<T>(url, { ...options, method: 'DELETE' });
  };

  return {
    authenticatedFetch,
    get,
    post,
    put,
    delete: del,
  };
};
