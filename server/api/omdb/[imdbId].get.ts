import { getAuthenticatedUser } from '../../utils/auth';

export interface OMDBResponse {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: Array<{
    Source: string;
    Value: string;
  }>;
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  totalSeasons?: string;
  Response: string;
  Error?: string;
}

export default defineEventHandler(async (event) => {
  // Require authentication for OMDB API access
  const user = getAuthenticatedUser(event);

  const imdbId = getRouterParam(event, 'imdbId');

  if (!imdbId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'IMDB ID is required',
    });
  }

  // Validate IMDB ID format
  const cleanId = imdbId.replace(/^tt/, '');
  const formattedId = `tt${cleanId}`;
  const imdbRegex = /^tt\d{7,8}$/;

  if (!imdbRegex.test(formattedId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid IMDB ID format',
    });
  }

  try {
    // Get OMDB API key from environment
    const omdbApiKey = process.env.OMDB_API_KEY;

    if (!omdbApiKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'OMDB API key not configured',
      });
    }

    // Fetch from OMDB API server-side
    const response = await fetch(
      `https://www.omdbapi.com/?i=${formattedId}&apikey=${omdbApiKey}`
    );

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: `OMDB API error: ${response.statusText}`,
      });
    }

    const data: OMDBResponse = await response.json();

    if (data.Response === 'False') {
      throw createError({
        statusCode: 404,
        statusMessage: data.Error || 'Movie not found',
      });
    }

    return data;
  } catch (error: any) {
    console.error('Error fetching movie data:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch movie data',
    });
  }
});
