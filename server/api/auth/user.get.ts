export default defineEventHandler(async (event) => {
  try {
    // Get user data from cookie
    const userCookie = getCookie(event, 'auth_user');
    const tokenCookie = getCookie(event, 'auth_token');

    if (!userCookie || !tokenCookie) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Not authenticated',
      });
    }

    // Verify token is still valid
    const { verifyJwtToken } = await import('../../utils/auth');

    try {
      verifyJwtToken(tokenCookie);
    } catch (error) {
      // Token is invalid, clear cookies
      deleteCookie(event, 'auth_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      });

      deleteCookie(event, 'auth_user', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      });

      throw createError({
        statusCode: 401,
        statusMessage: 'Token expired',
      });
    }

    return {
      success: true,
      user: JSON.parse(userCookie),
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get user info',
    });
  }
});
