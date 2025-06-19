import { getAuthenticatedUser } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  // This endpoint requires authentication
  const user = await getAuthenticatedUser(event);

  // Return user information
  return {
    message: 'This is a protected endpoint',
    user: {
      id: user.userId,
      email: user.email,
      verified: user.verified,
      authenticatedAt: new Date().toISOString(),
    },
    serverTime: new Date().toISOString(),
  };
});
