import jwt from 'jsonwebtoken';
import type { H3Event } from 'h3';

interface TokenPayload {
  userId: string;
  email: string;
  verified: boolean;
  pocketBaseToken: string;
  iat: number;
  exp: number;
}

/**
 * Extract JWT token from Authorization header
 */
export function extractTokenFromHeader(event: H3Event): string | null {
  const authHeader = getHeader(event, 'authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7); // Remove 'Bearer ' prefix
}

/**
 * Extract JWT token from httpOnly cookie
 */
export function extractTokenFromCookie(event: H3Event): string | null {
  return getCookie(event, 'auth_token') || null;
}

/**
 * Extract JWT token from cookie first, then fallback to header
 */
export function extractToken(event: H3Event): string | null {
  // Try cookie first (more secure)
  const cookieToken = extractTokenFromCookie(event);
  if (cookieToken) {
    return cookieToken;
  }

  // Fallback to header for backward compatibility
  return extractTokenFromHeader(event);
}

/**
 * Verify JWT token and return decoded payload
 */
export function verifyJwtToken(token: string): TokenPayload {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'JWT_SECRET environment variable is required',
    });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as TokenPayload;

    // Additional expiration check
    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      throw new Error('Token expired');
    }

    return decoded;
  } catch (error: any) {
    throw createError({
      statusCode: 401,
      statusMessage:
        error.message === 'Token expired' ? 'Token expired' : 'Invalid token',
    });
  }
}

/**
 * Get authenticated user from request
 * Throws error if token is missing or invalid
 */
export function getAuthenticatedUser(event: H3Event): TokenPayload {
  const token = extractToken(event);

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authorization token required',
    });
  }

  return verifyJwtToken(token);
}

/**
 * Optional authentication - returns user if token is valid, null otherwise
 * Does not throw errors for missing/invalid tokens
 */
export function getOptionalAuthenticatedUser(
  event: H3Event
): TokenPayload | null {
  try {
    return getAuthenticatedUser(event);
  } catch {
    return null;
  }
}
