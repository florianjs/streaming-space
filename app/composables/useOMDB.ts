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

export const useOMDB = () => {
  const fetchMovieData = async (
    imdbId: string
  ): Promise<OMDBResponse | null> => {
    if (!imdbId) return null;

    // Clean the IMDB ID (remove tt prefix if present, then add it back)
    const cleanId = imdbId.replace(/^tt/, '');
    const formattedId = `tt${cleanId}`;

    try {
      // Use server-side OMDB API endpoint for security
      const data: OMDBResponse = await $fetch(`/api/omdb/${formattedId}`);
      return data;
    } catch (error) {
      console.error('Error fetching movie data:', error);
      return null;
    }
  };

  const isValidIMDBId = (id: string): boolean => {
    // IMDB ID format: tt + 7-8 digits
    const imdbRegex = /^tt\d{7,8}$/;
    return imdbRegex.test(id) || imdbRegex.test(`tt${id}`);
  };

  return {
    fetchMovieData,
    isValidIMDBId,
  };
};
