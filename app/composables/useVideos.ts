export interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  duration: string;
  uploadedAt: Date;
  sourceType?: 'stream' | 'torrent' | 'iframe';
  torrentFile?: string; // URL to torrent file
  magnetLink?: string; // Magnet link for torrents
  categories?: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
    readonly color?: string;
    readonly slug?: string;
  }>;
}

export interface VideoForm {
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  duration: string;
  sourceType?: 'stream' | 'torrent' | 'iframe';
  torrentFile?: string;
  magnetLink?: string;
}

export interface VideoUpdate {
  title?: string;
  description?: string;
  url?: string;
  thumbnail?: string;
  duration?: string;
  sourceType?: 'stream' | 'torrent' | 'iframe';
  torrentFile?: string;
  magnetLink?: string;
}

export const useVideos = () => {
  // Use Nuxt's useState for SSR-safe global state
  const videos = useState<Video[]>('videos', () => []);
  const isLoading = useState<boolean>('videosLoading', () => false);
  const error = useState<string | null>('videosError', () => null);

  // Fetch videos from server API
  const fetchVideos = async (): Promise<Video[]> => {
    console.log('[useVideos] fetchVideos called, isLoading:', isLoading.value);
    console.log('[useVideos] Process.client:', process.client);

    // Only run on client-side to avoid SSR URL resolution issues
    if (!process.client) {
      console.log('[useVideos] Skipping fetch on server-side');
      return videos.value;
    }

    if (isLoading.value) {
      console.log('[useVideos] Already loading, waiting for completion...');
      // Wait for loading to complete instead of returning stale data
      while (isLoading.value) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      console.log(
        '[useVideos] Loading completed, returning videos:',
        videos.value.length
      );
      return videos.value;
    }

    isLoading.value = true;
    error.value = null;

    console.log('[useVideos] Starting video fetch...');

    try {
      // Use $fetch for better Nuxt integration instead of native fetch
      console.log('[useVideos] Fetching from /api/videos...');

      const response = await $fetch<{
        videos: Video[];
        pagination: any;
      }>('/api/videos');

      console.log('[useVideos] Fetch response:', response);
      console.log(
        '[useVideos] Videos received:',
        response?.videos?.length || 0
      );

      if (response && response.videos) {
        videos.value = response.videos;
        console.log('[useVideos] Videos stored in state:', videos.value.length);
      } else {
        console.warn('[useVideos] Invalid response structure:', response);
        videos.value = [];
      }

      console.log('[useVideos] About to return videos');
      return videos.value;
    } catch (err: any) {
      console.error('[useVideos] Error fetching videos:', err);
      console.error('[useVideos] Error details:', {
        message: err.message,
        data: err.data,
        statusCode: err.statusCode,
        statusMessage: err.statusMessage,
        cause: err.cause,
        stack: err.stack,
      });

      error.value =
        err.message || err.data?.message || 'Failed to fetch videos';
      return [];
    } finally {
      isLoading.value = false;
      console.log('[useVideos] fetchVideos completed, isLoading set to false');
    }
  };

  const addVideo = async (videoData: VideoForm): Promise<Video | null> => {
    try {
      // Use secure server-side endpoint - authentication handled automatically
      const newVideo = await $fetch<Video>('/api/videos', {
        method: 'POST',
        body: {
          title: videoData.title,
          description: videoData.description,
          url: videoData.url,
          thumbnail: videoData.thumbnail,
          duration: videoData.duration,
          type: 'stream',
        },
      });

      videos.value.unshift(newVideo);
      return newVideo;
    } catch (err: any) {
      console.error('Error adding video:', err);
      return null;
    }
  };

  const updateVideo = async (
    id: string,
    videoData: VideoUpdate
  ): Promise<Video | null> => {
    try {
      // Use secure server-side endpoint - authentication handled automatically
      const updatedVideo = await $fetch<Video>(`/api/videos/${id}`, {
        method: 'PATCH',
        body: videoData,
      });

      const index = videos.value.findIndex((video) => video.id === id);
      if (index !== -1) {
        videos.value[index] = updatedVideo;
      }

      return updatedVideo;
    } catch (err: any) {
      console.error('Error updating video:', err);
      return null;
    }
  };

  const deleteVideo = async (id: string): Promise<boolean> => {
    try {
      // Use secure server-side endpoint - authentication handled automatically
      await $fetch(`/api/videos/${id}`, {
        method: 'DELETE' as any,
      });

      const index = videos.value.findIndex((video) => video.id === id);
      if (index !== -1) {
        videos.value.splice(index, 1);
      }

      return true;
    } catch (err: any) {
      console.error('Error deleting video:', err);
      return false;
    }
  };

  const getVideo = async (id: string): Promise<Video | null> => {
    // First check if video is already in cache
    const cachedVideo = videos.value.find((video) => video.id === id);
    if (cachedVideo) {
      return cachedVideo;
    }

    // If not in cache, fetch from server
    try {
      // Use secure server-side endpoint - authentication handled automatically
      const video = await $fetch<Video>(`/api/videos/${id}`);

      return video;
    } catch (err: any) {
      console.error('Error fetching video:', err);
      return null;
    }
  };

  const searchVideos = (query: string): Video[] => {
    if (!query) return videos.value || [];

    const searchTerm = query.toLowerCase();
    return (videos.value || []).filter(
      (video) =>
        video.title.toLowerCase().includes(searchTerm) ||
        video.description.toLowerCase().includes(searchTerm)
    );
  };

  const searchVideosServer = async (query: string): Promise<Video[]> => {
    if (!query || !query.trim()) return [];

    try {
      // Use secure server-side endpoint - authentication handled automatically
      const response = await $fetch<{
        videos: Video[];
        searchTerm: string;
        pagination: any;
      }>('/api/videos/search', {
        query: { q: query },
      });

      return response.videos;
    } catch (err: any) {
      console.error('Error searching videos:', err);
      return [];
    }
  };

  // Clear cached videos
  const clearCache = () => {
    videos.value = [];
    error.value = null;
    console.log('[useVideos] Cache cleared');
  };

  // Force refresh videos (clear cache and fetch fresh)
  const forceRefetch = async (): Promise<Video[]> => {
    clearCache();
    return await fetchVideos();
  };

  return {
    videos: readonly(videos),
    isLoading: readonly(isLoading),
    error: readonly(error),
    fetchVideos,
    addVideo,
    updateVideo,
    deleteVideo,
    getVideo,
    searchVideos,
    searchVideosServer,
    clearCache,
    forceRefetch,
  };
};
