<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950"
  >
    <!-- Header -->
    <AppHeader v-model="searchQuery" />

    <!-- Main Content Section -->
    <section id="content" class="py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex gap-8">
          <!-- Main Content Area -->
          <main class="flex-1">
            <!-- Loading State -->
            <div v-if="isLoading || manualLoading" class="text-center py-16">
              <div
                class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mb-6 animate-pulse"
              >
                <svg
                  class="w-8 h-8 text-white animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-white mb-2">
                Loading your content...
              </h3>
              <p class="text-slate-400">
                Please wait while we fetch your videos
              </p>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="text-center py-16">
              <div
                class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-rose-500 rounded-full mb-6"
              >
                <svg
                  class="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5l-6.928-12c-.77-.833-2.694-.833-3.464 0L1.732 16.5C.962 17.333 1.924 19 3.464 19z"
                  ></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-white mb-2">
                Oops! Something went wrong
              </h3>
              <p class="text-slate-400 mb-6">{{ error }}</p>
              <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  @click="fetchVideos"
                  class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all duration-300"
                >
                  Try Again
                </button>
                <button
                  @click="searchQuery = ''"
                  class="px-6 py-3 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white font-semibold rounded-lg transition-all duration-300"
                >
                  Clear Search
                </button>
              </div>
            </div>

            <!-- Empty State -->
            <div
              v-else-if="!filteredVideos || filteredVideos.length === 0"
              class="text-center py-16"
            >
              <div
                class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full mb-6"
              >
                <svg
                  class="w-8 h-8 text-slate-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4l1 16h8l1-16M10 8v8M14 8v8"
                  ></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-white mb-2">
                {{ searchQuery ? 'No results found' : 'No videos available' }}
              </h3>
              <p class="text-slate-400 mb-6">
                {{
                  searchQuery
                    ? `No videos match "${searchQuery}". Try a different search term.`
                    : 'Your library is empty. Add some videos to get started.'
                }}
              </p>
              <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  @click="fetchVideos"
                  class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all duration-300"
                >
                  Refresh Library
                </button>
                <button
                  v-if="searchQuery"
                  @click="searchQuery = ''"
                  class="px-6 py-3 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white font-semibold rounded-lg transition-all duration-300"
                >
                  Clear Search
                </button>
              </div>
            </div>

            <!-- Content Grid -->
            <template
              v-if="
                !isLoading &&
                !error &&
                filteredVideos &&
                filteredVideos.length > 0
              "
            >
              <!-- Sorting Options -->
              <div
                class="mb-8 p-6 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50"
              >
                <VideoSortOptions
                  :sort-by="sortBy"
                  :category-filter="categoryFilter"
                  :categories="availableCategories"
                  @update:sort-by="sortBy = $event as SortBy"
                  @update:category-filter="categoryFilter = $event"
                />
              </div>

              <!-- Stats Bar -->
              <div
                class="mb-6 flex items-center justify-between text-sm text-slate-400"
              >
                <span
                  >{{ sortedAndFilteredVideos.length }}
                  {{
                    sortedAndFilteredVideos.length === 1 ? 'video' : 'videos'
                  }}
                  available</span
                >
                <span v-if="searchQuery">Results for "{{ searchQuery }}"</span>
              </div>

              <!-- Video Grid -->
              <VideoGrid
                :videos="sortedAndFilteredVideos"
                @play-video="playVideo"
                class="enhanced-grid"
              />
            </template>
          </main>

          <!-- Enhanced Sidebar -->
          <aside class="w-80 hidden lg:block">
            <div class="sticky top-24 space-y-6">
              <!-- Recently Played -->
              <AppSidebar
                :videos="sortedAndFilteredVideos.slice(0, 5)"
                @play-video="playVideo"
              />

              <!-- Quick Stats -->
              <div
                class="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50"
              >
                <h3 class="text-lg font-semibold text-white mb-4">
                  Library Stats
                </h3>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-slate-400">Total Videos</span>
                    <span class="text-white font-semibold">{{
                      videos.length
                    }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400">Categories</span>
                    <span class="text-white font-semibold">{{
                      availableCategories.length
                    }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400">Filtered Results</span>
                    <span class="text-white font-semibold">{{
                      sortedAndFilteredVideos.length
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Video } from '../composables/useVideos';
import type { SortBy } from '../composables/useVideoSorting';

const { videos, isLoading, error, fetchVideos, searchVideos, forceRefetch } =
  useVideos();
const { applyFiltersAndSort, getDefaultSort } = useVideoSorting();
const { categories: serverCategories, fetchCategories: fetchServerCategories } =
  useCategoriesServer();

// Add local state for testing
const localVideos = ref<Video[]>([]);
const localIsLoading = ref(false);
const localError = ref<string | null>(null);
const manualLoading = ref(false);

const searchQuery = ref('');
const sortBy = ref<SortBy>(getDefaultSort());
const categoryFilter = ref<string | null>(null);

// Smooth scroll to content
const scrollToContent = () => {
  const element = document.getElementById('content');
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

// Ensure videos and categories are loaded
console.log('[Index Page] Script setup running');
console.log('[Index Page] videos.value:', videos.value);
console.log('[Index Page] isLoading.value:', isLoading.value);
console.log('[Index Page] error.value:', error.value);

// Simple client-side data loading
const loadInitialData = async () => {
  console.log('[Index Page] loadInitialData called');
  if (videos.value.length === 0 && !isLoading.value && !error.value) {
    console.log('[Index Page] Triggering initial video fetch...');
    manualLoading.value = true;
    try {
      await fetchVideos();
      console.log(
        '[Index Page] Initial fetch completed, videos:',
        videos.value.length
      );
    } catch (err) {
      console.error('[Index Page] Initial fetch failed:', err);
    } finally {
      manualLoading.value = false;
    }
  }

  if (serverCategories.value.length === 0) {
    console.log('[Index Page] Fetching categories...');
    try {
      const fetchedCategories = await fetchServerCategories({
        active: true,
        sort: 'sort_order,name',
      });
      console.log(
        '[Index Page] Categories fetched:',
        fetchedCategories?.length || 0
      );
      console.log('[Index Page] Categories data:', fetchedCategories);
    } catch (error) {
      console.error('[Index Page] Error fetching categories:', error);
    }
  } else {
    console.log(
      '[Index Page] Categories already loaded:',
      serverCategories.value.length
    );
  }
};

// Only run data loading on client-side mount, not immediately
// This prevents SSR/hydration issues

onMounted(async () => {
  console.log('[Index Page] onMounted called');
  console.log('[Index Page] Process.client:', process.client);

  // Load data only after component is mounted on client
  await loadInitialData();

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      // Handle escape key if needed
    }
  };
  document.addEventListener('keydown', handleEscape);

  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape);
  });
});

// Watch for videos to be loaded for debugging
watch(
  videos,
  (newVideos) => {
    console.log(
      '[Index Page] Videos changed:',
      newVideos.length,
      'isLoading:',
      isLoading.value
    );
  },
  { immediate: true }
);

const filteredVideos = computed(() => {
  try {
    return searchVideos(searchQuery.value) || [];
  } catch (error) {
    console.error('Error filtering videos:', error);
    return [];
  }
});

const sortedAndFilteredVideos = computed(() => {
  try {
    return applyFiltersAndSort(
      filteredVideos.value,
      sortBy.value,
      categoryFilter.value
    );
  } catch (error) {
    console.error('Error sorting and filtering videos:', error);
    return filteredVideos.value;
  }
});

// Get available categories for sorting - combine server categories with video usage
const availableCategories = computed(() => {
  console.log('[Index Page] Computing availableCategories...');
  console.log('[Index Page] serverCategories.value:', serverCategories.value);
  console.log(
    '[Index Page] filteredVideos.value:',
    filteredVideos.value?.length
  );

  // Create a map of video categories with usage count
  const videoCategoryMap = new Map();

  filteredVideos.value.forEach((video) => {
    video.categories?.forEach((category) => {
      if (videoCategoryMap.has(category.id)) {
        videoCategoryMap.get(category.id).count++;
      } else {
        videoCategoryMap.set(category.id, { ...category, count: 1 });
      }
    });
  });

  console.log('[Index Page] videoCategoryMap:', videoCategoryMap);

  // Use server categories as the base, but prioritize those that appear in videos
  // Add null check to prevent undefined errors
  if (!serverCategories.value || serverCategories.value.length === 0) {
    console.log('[Index Page] No server categories available');
    return [];
  }

  const serverCategoriesWithUsage = serverCategories.value.map((serverCat) => {
    const usage = videoCategoryMap.get(serverCat.id);
    return {
      id: serverCat.id,
      name: serverCat.name,
      color: serverCat.color,
      count: usage ? usage.count : 0,
    };
  });

  console.log(
    '[Index Page] serverCategoriesWithUsage:',
    serverCategoriesWithUsage
  );

  // Show all categories, but prioritize those with videos
  const result = serverCategoriesWithUsage
    .sort((a, b) => {
      // First sort by whether they have videos (those with videos first)
      if (a.count > 0 && b.count === 0) return -1;
      if (a.count === 0 && b.count > 0) return 1;
      // Then by usage count (most used first)
      if (b.count !== a.count) return b.count - a.count;
      // Finally by name
      return a.name.localeCompare(b.name);
    })
    .slice(0, 12); // Show top 12 categories (increased from 8)

  console.log('[Index Page] Final availableCategories:', result);
  return result;
});

const playVideo = (video: Video) => {
  navigateTo(`/play/${video.id}`);
};

const manualRefresh = async () => {
  console.log('[Index Page] Manual refresh called');
  try {
    // Force refetch by clearing cache and fetching fresh
    await forceRefetch();
    console.log(
      '[Index Page] Manual refresh completed, videos:',
      videos.value.length
    );
  } catch (err) {
    console.error('[Index Page] Manual refresh failed:', err);
  }
};

const testDirectAPI = async () => {
  console.log('[Index Page] Test Direct API called');
  try {
    const response = await $fetch('/api/videos');
    console.log('[Index Page] Direct API response:', response);
    alert(`API Response: ${JSON.stringify(response, null, 2)}`);
  } catch (err) {
    console.error('[Index Page] Test Direct API failed:', err);
    alert(`API Error: ${err}`);
  }
};
</script>

<style scoped>
/* Enhanced scrollbar for dark theme */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #1e293b;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(45deg, #4f46e5, #7c3aed);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(45deg, #6366f1, #8b5cf6);
}

/* Premium animations */
.enhanced-grid {
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Advanced gradient animation */
@keyframes gradient-x {
  0%,
  100% {
    transform: translateX(0%);
  }
  50% {
    transform: translateX(100%);
  }
}

.animate-gradient-x {
  background-size: 200% 200%;
  animation: gradient-x 3s ease-in-out infinite;
}

/* Slow spinning animation */
@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin-slow {
  animation: spin-slow 20s linear infinite;
}

/* Floating animation */
@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

/* Professional pulse */
@keyframes pulse-glow {
  0%,
  100% {
    opacity: 1;
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
  }
  50% {
    opacity: 0.8;
    box-shadow: 0 0 40px rgba(99, 102, 241, 0.6);
  }
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Enhanced backdrop blur support */
@supports (backdrop-filter: blur(0)) {
  .backdrop-blur-sm {
    backdrop-filter: blur(8px);
  }

  .backdrop-blur-xl {
    backdrop-filter: blur(20px);
  }
}

/* Glass morphism effect */
.glass-card {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

/* Enhanced shadow effects */
.shadow-3xl {
  box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.05);
}

/* Custom gradient border */
.gradient-border {
  position: relative;
  background: linear-gradient(45deg, #1e293b, #334155);
}

.gradient-border::before {
  content: '';
  position: absolute;
  inset: 0;
  padding: 1px;
  background: linear-gradient(45deg, #4f46e5, #7c3aed, #ec4899);
  border-radius: inherit;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
}

/* Staggered animation for feature cards */
.feature-card:nth-child(1) {
  animation-delay: 0.1s;
}

.feature-card:nth-child(2) {
  animation-delay: 0.2s;
}

.feature-card:nth-child(3) {
  animation-delay: 0.3s;
}

/* Parallax effect for background elements */
@keyframes parallax-float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  25% {
    transform: translateY(-10px) rotate(1deg);
  }
  50% {
    transform: translateY(-20px) rotate(0deg);
  }
  75% {
    transform: translateY(-10px) rotate(-1deg);
  }
}

.parallax-element {
  animation: parallax-float 15s ease-in-out infinite;
}

/* Interactive button hover effects */
.interactive-button {
  position: relative;
  overflow: hidden;
}

.interactive-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  transition: left 0.5s;
}

.interactive-button:hover::before {
  left: 100%;
}

/* Text shimmer effect */
@keyframes shimmer {
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
}

.text-shimmer {
  background: linear-gradient(90deg, #64748b, #e2e8f0, #64748b);
  background-size: 200% auto;
  color: transparent;
  background-clip: text;
  animation: shimmer 3s linear infinite;
}
</style>
