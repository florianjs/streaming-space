export interface User {
  id: string;
  email: string;
  emailVisibility: boolean;
  verified: boolean;
  created: string;
  updated: string;
  collectionId: string;
  collectionName: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
}

export interface LoginCredentials {
  identity: string;
  password: string;
}

export const useAuth = () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Check if user is authenticated
  const isAuthenticated = computed(() => {
    const hasToken = !!token.value;
    const hasUser = !!user.value;
    return hasToken && hasUser;
  });

  // Initialize auth state from server-side cookies
  const initAuth = async () => {
    if (!process.client) return;

    try {
      // Get user info from server (cookies)
      const response = await $fetch<{ success: boolean; user: User }>(
        '/api/auth/user'
      );

      if (response.success) {
        user.value = response.user;
        token.value = 'cookie-based'; // Placeholder since we don't have access to httpOnly cookie
      }
    } catch (err) {
      // Not authenticated or token expired
      clearAuth();
    }
  };

  // Store auth data (for cookie-based auth)
  const storeAuth = (authData: AuthResponse) => {
    user.value = authData.user;
    token.value = 'cookie-based'; // Placeholder since tokens are now in httpOnly cookies

    // Clear any old localStorage data for migration
    if (process.client) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  };

  // Clear auth data
  const clearAuth = () => {
    token.value = null;
    user.value = null;

    // Clear any old localStorage data for migration
    if (process.client) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  };

  // Login function - now uses server-side authentication with httpOnly cookies
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;

    try {
      // Call our secure server-side login endpoint
      const response = await $fetch<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: credentials,
      });

      storeAuth(response);

      // Verify the authentication state immediately after login
      await verifyToken();

      return true;
    } catch (err: any) {
      let errorMessage = 'Login failed. Please check your credentials.';

      // Extract meaningful error message
      if (err.data?.message) {
        errorMessage = err.data.message;
      } else if (err.statusMessage) {
        errorMessage = err.statusMessage;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.status === 400) {
        errorMessage =
          'Invalid email or password format. Please check your credentials.';
      } else if (err.status === 401) {
        errorMessage = 'Invalid email or password.';
      } else if (err.status === 404) {
        errorMessage = 'Authentication service not found.';
      }

      error.value = errorMessage;
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // Logout function - now clears httpOnly cookies via server
  const logout = async () => {
    try {
      // Call server logout to clear httpOnly cookies
      await $fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (err) {
      console.error('Server logout failed:', err);
    }

    clearAuth();
    error.value = null;

    // Redirect to login or home page
    if (process.client) {
      await navigateTo('/login');
    }
  };

  // Verify authentication by checking server-side cookies
  const verifyToken = async (): Promise<boolean> => {
    try {
      const response = await $fetch<{ success: boolean; user: User }>(
        '/api/auth/user'
      );

      if (response.success) {
        user.value = response.user;
        token.value = 'cookie-based';
        return true;
      }

      clearAuth();
      return false;
    } catch (err) {
      clearAuth();
      return false;
    }
  };

  // Get auth headers for API requests (not needed for cookie-based auth)
  const getAuthHeaders = () => {
    // Headers not needed since auth is handled via httpOnly cookies
    return {};
  };

  // Initialize on composable creation
  onMounted(() => {
    if (process.client) {
      initAuth();
    }
  });

  // Also initialize immediately if we're on client
  if (process.client) {
    initAuth();
  }

  return {
    // State
    user: readonly(user),
    token: readonly(token),
    isLoading: readonly(isLoading),
    error: readonly(error),
    isAuthenticated,

    // Methods
    login,
    logout,
    verifyToken,
    getAuthHeaders,
    initAuth,
  };
};
