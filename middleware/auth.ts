export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated, initAuth } = useAuth();

  // Initialize auth state if needed
  if (process.client) {
    initAuth();
  }

  // Allow access to login page
  if (to.path === '/login') {
    return;
  }

  // Check if user is authenticated
  if (!isAuthenticated.value) {
    // Redirect to login page for protected routes
    return navigateTo('/login');
  }
});
