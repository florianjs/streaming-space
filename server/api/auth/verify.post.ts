import { verifyJwtToken } from '../../utils/auth';

interface TokenPayload {
  userId: string;
  email: string;
  verified: boolean;
  pocketBaseToken: string;
  iat: number;
  exp: number;
}

export default defineEventHandler(async (event) => {
  assertMethod(event, 'POST');

  try {
    const body = await readBody(event);
    const { token } = body;

    if (!token) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Token is required',
      });
    }

    // Verify the JWT token using jose
    const decoded = await verifyJwtToken(token);

    // Return user data without sensitive information
    return {
      valid: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        verified: decoded.verified,
      },
    };
  } catch (error: any) {
    // Log errors in development only
    if (process.env.NODE_ENV !== 'production') {
      console.error('Token verification error:', error);
    }

    if (error.statusCode === 401) {
      throw error;
    }

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    });
  }
});
