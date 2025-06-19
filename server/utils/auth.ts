import { SignJWT, jwtVerify } from 'jose';
import type { H3Event } from 'h3';
import { getHeader, getCookie, createError } from 'h3';

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
 * Get JWT secret as TextEncoder for jose
 */
function getJWTSecret(): Uint8Array {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'JWT_SECRET environment variable is required',
    });
  }

  return new TextEncoder().encode(jwtSecret);
}

/**
 * Create JWT token using jose
 */
export async function createJwtToken(
  payload: Omit<TokenPayload, 'iat' | 'exp'>
): Promise<string> {
  const secret = getJWTSecret();

  return await new SignJWT({
    userId: payload.userId,
    email: payload.email,
    verified: payload.verified,
    pocketBaseToken: payload.pocketBaseToken,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
}

/**
 * Verify JWT token and return decoded payload
 */
export async function verifyJwtToken(token: string): Promise<TokenPayload> {
  const secret = getJWTSecret();

  try {
    const { payload } = await jwtVerify(token, secret);

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      verified: payload.verified as boolean,
      pocketBaseToken: payload.pocketBaseToken as string,
      iat: payload.iat as number,
      exp: payload.exp as number,
    };
  } catch (error: any) {
    throw createError({
      statusCode: 401,
      statusMessage:
        error.code === 'ERR_JWT_EXPIRED' ? 'Token expired' : 'Invalid token',
    });
  }
}

/**
 * Get authenticated user from request
 * Throws error if token is missing or invalid
 */
export async function getAuthenticatedUser(
  event: H3Event
): Promise<TokenPayload> {
  const token = extractToken(event);

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authorization token required',
    });
  }

  return await verifyJwtToken(token);
}

/**
 * Optional authentication - returns user if token is valid, null otherwise
 * Does not throw errors for missing/invalid tokens
 */
export async function getOptionalAuthenticatedUser(
  event: H3Event
): Promise<TokenPayload | null> {
  try {
    return await getAuthenticatedUser(event);
  } catch {
    return null;
  }
}
