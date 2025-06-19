import logger from '../../utils/logger';

export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, verifyToken } = useAuth();

  logger.log(`[Middleware] Checking auth for route: ${to.fullPath}`);
  logger.log(`[Middleware] Current auth state: ${isAuthenticated.value}`);

  // First check current state
  if (!isAuthenticated.value) {
    logger.log('[Middleware] Not authenticated, verifying token...');
    // Try to verify token from server if not already authenticated
    const isValid = await verifyToken();
    logger.log(`[Middleware] Token verification result: ${isValid}`);

    if (!isValid) {
      logger.log('[Middleware] Redirecting to login');
      // If still not authenticated, redirect to login with the current path as redirect parameter
      const redirectTo = encodeURIComponent(to.fullPath);
      return navigateTo(`/login?redirectTo=${redirectTo}`);
    }
  }

  logger.log('[Middleware] Authentication check passed');
});
