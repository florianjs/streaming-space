export interface Media {
  id: string;
  title: string;
  imdb?: string;
  media_url?: string;
  description?: string;
  iframe?: string;
  torrent?: string; // filename after upload
  type: 'torrent' | 'stream' | 'iframe';
  thumbnail?: string; // filename after upload
  categories?: readonly string[]; // array of category IDs
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  expand?: {
    categories?: ReadonlyArray<{
      readonly id: string;
      readonly name: string;
      readonly color?: string;
      readonly slug?: string;
    }>;
  };
}

export interface MediaForm {
  title: string;
  imdb?: string;
  media_url?: string;
  description?: string;
  iframe?: string;
  torrent?: File | null;
  magnet_link?: string;
  type: 'torrent' | 'stream' | 'iframe';
  thumbnail?: File | null;
  categories?: string[]; // array of category IDs
}

export interface MediaUpdate {
  title?: string;
  imdb?: string;
  media_url?: string;
  description?: string;
  iframe?: string;
  torrent?: File | null;
  magnet_link?: string;
  type?: 'torrent' | 'stream' | 'iframe';
  thumbnail?: File | null;
  categories?: string[]; // array of category IDs
}

// Global state for media
const media = ref<Media[]>([]);

export const useMedia = () => {
  const config = useRuntimeConfig();

  // Get authorization token from localStorage or env
  // Note: Auth is now handled server-side - no need for client-side tokens

  const createMediaRecord = async (
    mediaData: MediaForm
  ): Promise<Media | null> => {
    try {
      const formData = new FormData();

      // Add required fields
      formData.append('title', mediaData.title);
      formData.append('type', mediaData.type);

      // Add optional fields
      if (mediaData.imdb) formData.append('imdb', mediaData.imdb);
      if (mediaData.media_url)
        formData.append('media_url', mediaData.media_url);
      if (mediaData.description)
        formData.append('description', mediaData.description);
      if (mediaData.iframe) formData.append('iframe', mediaData.iframe);

      // Add categories
      if (mediaData.categories && mediaData.categories.length > 0) {
        mediaData.categories.forEach((categoryId) => {
          formData.append('categories', categoryId);
        });
      }

      // Add file uploads
      if (mediaData.torrent) {
        formData.append('torrent', mediaData.torrent);
      }
      if (mediaData.thumbnail) {
        formData.append('thumbnail', mediaData.thumbnail);
      }

      console.log('🚀 Creating media record with data:', mediaData);

      // Use secure server-side endpoint
      const newMedia = await $fetch('/api/media', {
        method: 'POST',
        body: formData,
      });
      console.log('✅ Media record created successfully:', newMedia);

      // Add to local state
      media.value.unshift(newMedia);

      return newMedia;
    } catch (error) {
      console.error('Error creating media record:', error);
      throw error;
    }
  };

  const fetchMedia = async (): Promise<Media[]> => {
    try {
      // Use secure server-side endpoint
      const data = await $fetch('/api/media', {
        query: { expand: 'categories' },
      });

      media.value = data.items || data || [];
      return media.value;
    } catch (error) {
      console.error('Error fetching media:', error);
      return [];
    }
  };

  const updateMediaRecord = async (
    id: string,
    mediaData: MediaUpdate
  ): Promise<Media | null> => {
    try {
      const formData = new FormData();

      // Add fields that are being updated
      if (mediaData.title !== undefined)
        formData.append('title', mediaData.title);
      if (mediaData.type !== undefined) formData.append('type', mediaData.type);
      if (mediaData.imdb !== undefined) formData.append('imdb', mediaData.imdb);
      if (mediaData.media_url !== undefined)
        formData.append('media_url', mediaData.media_url);
      if (mediaData.description !== undefined)
        formData.append('description', mediaData.description);
      if (mediaData.iframe !== undefined)
        formData.append('iframe', mediaData.iframe);

      // Add categories
      if (mediaData.categories !== undefined) {
        if (mediaData.categories.length > 0) {
          mediaData.categories.forEach((categoryId) => {
            formData.append('categories', categoryId);
          });
        } else {
          // Clear categories by sending empty array
          formData.append('categories', '');
        }
      }

      // Add file uploads
      if (mediaData.torrent) {
        formData.append('torrent', mediaData.torrent);
      }
      if (mediaData.thumbnail) {
        formData.append('thumbnail', mediaData.thumbnail);
      }

      // Use secure server-side endpoint
      const updatedMedia = await $fetch(`/api/media/${id}`, {
        method: 'PATCH',
        body: formData,
      });

      // Update local state
      const index = media.value.findIndex((m) => m.id === id);
      if (index !== -1) {
        media.value[index] = updatedMedia;
      }

      return updatedMedia;
    } catch (error) {
      console.error('Error updating media record:', error);
      throw error;
    }
  };

  const deleteMediaRecord = async (id: string): Promise<boolean> => {
    try {
      // Use secure server-side endpoint
      await $fetch(`/api/media/${id}`, {
        method: 'DELETE',
      });

      // Remove from local state
      const index = media.value.findIndex((m) => m.id === id);
      if (index !== -1) {
        media.value.splice(index, 1);
      }

      return true;
    } catch (error) {
      console.error('Error deleting media record:', error);
      return false;
    }
  };

  const getMedia = (id: string): Media | undefined => {
    return media.value.find((m) => m.id === id);
  };

  const searchMedia = (query: string): Media[] => {
    if (!query) return media.value || [];

    const searchTerm = query.toLowerCase();
    return (media.value || []).filter(
      (m) =>
        m.title.toLowerCase().includes(searchTerm) ||
        (m.description && m.description.toLowerCase().includes(searchTerm)) ||
        (m.imdb && m.imdb.toLowerCase().includes(searchTerm))
    );
  };

  // Initialize media on first use
  onMounted(() => {
    if (process.client && media.value.length === 0) {
      fetchMedia();
    }
  });

  return {
    media: readonly(media),
    createMediaRecord,
    updateMediaRecord,
    deleteMediaRecord,
    fetchMedia,
    getMedia,
    searchMedia,
  };
};
