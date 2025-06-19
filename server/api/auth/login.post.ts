import jwt from 'jsonwebtoken';
import { authRateLimit } from '../../utils/rateLimit';
import { loginSchema, validateInput } from '../../utils/validation';

interface LoginRequest {
  identity: string;
  password: string;
}

interface User {
  id: string;
  email: string;
  emailVisibility: boolean;
  verified: boolean;
  created: string;
  updated: string;
  collectionId: string;
  collectionName: string;
}

interface PocketBaseAuthResponse {
  token: string;
  record: User;
}

export default defineEventHandler(async (event) => {
  // Only allow POST requests
  assertMethod(event, 'POST');

  // Apply rate limiting
  authRateLimit(event);

  try {
    // Get credentials from request body
    const body = await readBody(event);

    // Validate and sanitize input
    const { identity, password } = validateInput(loginSchema, body);

    // Get runtime config
    const config = useRuntimeConfig(event);

    // Get JWT secret from environment (required)
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw createError({
        statusCode: 500,
        statusMessage: 'JWT_SECRET environment variable is required',
      });
    }

    // Authenticate with PocketBase server-side
    const pocketBaseResponse = await fetch(
      `${config.public.baseUrl}/api/collections/_superusers/auth-with-password`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identity,
          password,
        }),
      }
    );

    if (!pocketBaseResponse.ok) {
      const errorText = await pocketBaseResponse.text();

      // Log errors in development only
      if (process.env.NODE_ENV !== 'production') {
        console.error('PocketBase authentication failed:', errorText);
      }

      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid credentials',
      });
    }

    const pocketBaseAuth: PocketBaseAuthResponse =
      await pocketBaseResponse.json();

    // Create our own JWT token with user data
    const tokenPayload = {
      userId: pocketBaseAuth.record.id,
      email: pocketBaseAuth.record.email,
      verified: pocketBaseAuth.record.verified,
      // Include the PocketBase token for backend API calls if needed
      pocketBaseToken: pocketBaseAuth.token,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    };

    const jwtToken = jwt.sign(tokenPayload, jwtSecret, {
      algorithm: 'HS256',
    });

    // Set httpOnly cookie for secure token storage
    setCookie(event, 'auth_token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    // Also set user data in httpOnly cookie
    setCookie(
      event,
      'auth_user',
      JSON.stringify({
        id: pocketBaseAuth.record.id,
        email: pocketBaseAuth.record.email,
        emailVisibility: pocketBaseAuth.record.emailVisibility,
        verified: pocketBaseAuth.record.verified,
        created: pocketBaseAuth.record.created,
        updated: pocketBaseAuth.record.updated,
        collectionId: pocketBaseAuth.record.collectionId,
        collectionName: pocketBaseAuth.record.collectionName,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/',
      }
    );

    // Return success response without sensitive data
    return {
      success: true,
      user: {
        id: pocketBaseAuth.record.id,
        email: pocketBaseAuth.record.email,
        emailVisibility: pocketBaseAuth.record.emailVisibility,
        verified: pocketBaseAuth.record.verified,
        created: pocketBaseAuth.record.created,
        updated: pocketBaseAuth.record.updated,
        collectionId: pocketBaseAuth.record.collectionId,
        collectionName: pocketBaseAuth.record.collectionName,
      },
    };
  } catch (error: any) {
    // Log errors in development only
    if (process.env.NODE_ENV !== 'production') {
      console.error('Login error:', error);
    }

    // Don't expose internal errors to client
    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    });
  }
});
