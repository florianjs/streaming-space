import jwt from 'jsonwebtoken';

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

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw createError({
        statusCode: 500,
        statusMessage: 'JWT_SECRET environment variable is required',
      });
    }

    // Verify the JWT token
    const decoded = jwt.verify(token, jwtSecret) as TokenPayload;

    // Check if token is expired (additional check, though jwt.verify should handle this)
    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token expired',
      });
    }

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

    if (error.name === 'JsonWebTokenError') {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token',
      });
    }

    if (error.name === 'TokenExpiredError') {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token expired',
      });
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
