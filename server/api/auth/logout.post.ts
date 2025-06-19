export default defineEventHandler(async (event) => {
  // Only allow POST requests
  assertMethod(event, 'POST');

  try {
    // Clear auth cookies
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

    return {
      success: true,
      message: 'Logged out successfully',
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Logout failed',
    });
  }
});
