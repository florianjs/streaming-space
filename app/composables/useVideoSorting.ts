import type { Video } from './useVideos';

export type SortBy = 'latest' | 'oldest' | 'title-asc' | 'title-desc';

export const useVideoSorting = () => {
  const sortVideos = (videos: Video[], sortBy: SortBy): Video[] => {
    if (!videos || videos.length === 0) return [];

    const sortedVideos = [...videos];

    switch (sortBy) {
      case 'latest':
        return sortedVideos.sort((a, b) => {
          const dateA = new Date(a.uploadedAt);
          const dateB = new Date(b.uploadedAt);
          return dateB.getTime() - dateA.getTime(); // Latest first
        });

      case 'oldest':
        return sortedVideos.sort((a, b) => {
          const dateA = new Date(a.uploadedAt);
          const dateB = new Date(b.uploadedAt);
          return dateA.getTime() - dateB.getTime(); // Oldest first
        });

      case 'title-asc':
        return sortedVideos.sort((a, b) => {
          return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
        });

      case 'title-desc':
        return sortedVideos.sort((a, b) => {
          return b.title.toLowerCase().localeCompare(a.title.toLowerCase());
        });

      default:
        return sortedVideos;
    }
  };

  const filterByCategory = (
    videos: Video[],
    categoryId: string | null
  ): Video[] => {
    if (!categoryId || !videos || videos.length === 0) return videos;

    return videos.filter((video) =>
      video.categories?.some((category) => category.id === categoryId)
    );
  };

  const applyFiltersAndSort = (
    videos: Video[],
    sortBy: SortBy,
    categoryId: string | null
  ): Video[] => {
    // First apply category filter
    let filteredVideos = filterByCategory(videos, categoryId);

    // Then apply sorting
    return sortVideos(filteredVideos, sortBy);
  };

  const getDefaultSort = (): SortBy => 'latest';

  return {
    sortVideos,
    filterByCategory,
    applyFiltersAndSort,
    getDefaultSort,
  };
};
