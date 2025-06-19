import { getAuthenticatedUser } from '../../utils/auth';
import logger from '../../../utils/logger';

export default defineEventHandler(async (event) => {
  // Verify JWT authentication first
  const user = getAuthenticatedUser(event);

  const query = getQuery(event);
  const token = query.t as string;

  if (!token) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing access token',
    });
  }

  try {
    // Decode the token to get the original URL
    const decoded = atob(token);
    const [originalUrl, timestamp] = decoded.split('|');

    // Check if token is still valid (24 hours)
    const tokenAge = Date.now() - parseInt(timestamp);
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (tokenAge > maxAge) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Token expired',
      });
    }

    // Validate URL format and domain allowlist (security check)
    if (
      !originalUrl ||
      (!originalUrl.startsWith('http://') &&
        !originalUrl.startsWith('https://'))
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid video URL',
      });
    }

    // Domain allowlist to prevent SSRF attacks
    const ALLOWED_DOMAINS = [
      'pocketbase-zccwgok00kcowwc0w4wgs0gc.cardinai.com',
      'localhost',
      '127.0.0.1',
      // Add other trusted domains here
    ];

    try {
      const url = new URL(originalUrl);
      const hostname = url.hostname.toLowerCase();

      // Check if domain is in allowlist
      const isAllowed = ALLOWED_DOMAINS.some((domain) => {
        return hostname === domain || hostname.endsWith('.' + domain);
      });

      if (!isAllowed) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Domain not allowed',
        });
      }
    } catch (urlError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid video URL format',
      });
    }

    // Enhanced security: Log access for authenticated user (development only)
    logger.log(
      `Video access by user ${user.email} (${user.userId}) for URL: ${originalUrl}`
    );

    // Fetch the video from the original source
    const response = await fetch(originalUrl);

    if (!response.ok) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Video not found',
      });
    }

    // Set appropriate headers for video streaming
    const headers: Record<string, string> = {
      'Content-Type': response.headers.get('content-type') || 'video/mp4',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      'X-Content-Protected': 'true',
      'X-Authenticated-User': user.email,
    };

    // Handle range requests for video seeking
    const range = getHeader(event, 'range');
    if (range && response.headers.get('accept-ranges') === 'bytes') {
      const contentLength = response.headers.get('content-length');
      if (contentLength) {
        headers['Content-Length'] = contentLength;
        headers['Content-Range'] = response.headers.get('content-range') || '';
      }
    }

    // Set response headers
    for (const [key, value] of Object.entries(headers)) {
      setHeader(event, key, value);
    }

    // Return the video stream
    return response.body;
  } catch (error: any) {
    // Log errors in development only
    logger.error('Video proxy error:', error);

    // Don't expose internal errors if it's an auth error
    if (error.statusCode === 401) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to stream video',
    });
  }
});
