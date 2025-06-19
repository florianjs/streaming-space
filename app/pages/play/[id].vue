<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
  >
    <!-- Header with back button -->
    <header class="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center space-x-4">
          <button
            @click="navigateBack"
            class="w-10 h-10 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:scale-110"
          >
            <Icon name="heroicons:arrow-left" class="h-6 w-6" />
          </button>
          <h1 v-if="video" class="text-xl font-bold text-white truncate">
            {{ video.title }}
          </h1>
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="flex items-center space-x-3">
        <div
          class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"
        ></div>
        <span class="text-white text-lg">Loading video...</span>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error || !video"
      class="flex items-center justify-center py-12"
    >
      <div class="text-center">
        <Icon
          name="heroicons:exclamation-triangle"
          class="h-16 w-16 text-red-500 mx-auto mb-4"
        />
        <h2 class="text-2xl font-bold text-white mb-2">Video Not Found</h2>
        <p class="text-gray-400 mb-6">
          {{ error || 'The requested video could not be found.' }}
        </p>
        <button
          @click="navigateBack"
          class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors duration-300"
        >
          Go Back
        </button>
      </div>
    </div>

    <!-- Video Player Content -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Video Player Container -->
      <div
        class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl overflow-hidden shadow-2xl border border-gray-700/50 mb-8"
      >
        <!-- Video Player -->
        <div class="aspect-video bg-black relative">
          <!-- Secure Video Player -->
          <SecureVideoPlayer
            ref="videoPlayer"
            :src="video.url"
            :poster="video.thumbnail"
            :source-type="video.sourceType || 'stream'"
            :torrent-file="video.torrentFile"
            :magnet-link="video.magnetLink"
            :content-protection="true"
            :show-security-notice="true"
            :use-proxied-url="false"
            :unload-on-dev-tools="true"
            :dev-tools-check-interval="1000"
            class="w-full h-full"
            @play="handleVideoPlay"
            @ready="handlePlayerReady"
            @error="handlePlayerError"
            @canplay="handleVideoLoaded"
            @right-click-blocked="handleRightClickBlocked"
            @dev-tools-detected="handleDevToolsDetected"
            @video-unloaded="handleVideoUnloaded"
            @torrent-ready="handleTorrentReady"
            @torrent-progress="handleTorrentProgress"
          />
        </div>

        <!-- Video Information -->
        <div class="p-6">
          <h2 class="text-3xl font-bold text-white mb-4">
            {{ video.title }}
          </h2>
          <p class="text-gray-300 text-lg leading-relaxed mb-6">
            {{ video.description }}
          </p>
          <div class="flex items-center space-x-6 text-sm text-gray-400">
            <div class="flex items-center space-x-2">
              <Icon name="heroicons:calendar" class="h-4 w-4" />
              <span>{{ formatDate(video.uploadedAt) }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <Icon name="heroicons:clock" class="h-4 w-4" />
              <span>{{ video.duration }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Videos Section -->
      <div
        class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 border border-gray-700/50"
      >
        <h3 class="text-2xl font-bold text-white mb-6">More Videos</h3>
        <div
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <VideoCard
            v-for="relatedVideo in relatedVideos"
            :key="relatedVideo.id"
            :video="relatedVideo"
            @play-video="playVideo"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Video } from '~/composables/useVideos';

// Get route params
const route = useRoute();
const router = useRouter();
const videoId = route.params.id as string;

// Composables
const { videos, getVideo, fetchVideos } = useVideos();

// Reactive state
const video = ref<Video | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

// Refs for video player components
const videoPlayer = ref<HTMLVideoElement>();

// Retry function for loading videos
const loadVideo = async (retryCount = 0): Promise<void> => {
  try {
    console.log('Loading video with ID:', videoId, 'Retry:', retryCount);
    console.log('Current videos count:', videos.value.length);

    // Always fetch videos to ensure we have the latest data
    await fetchVideos();

    console.log('After fetch, videos count:', videos.value.length);
    console.log(
      'Available video IDs:',
      videos.value.map((v) => v.id)
    );

    // Find the specific video
    const foundVideo = await getVideo(videoId);
    console.log('Found video:', foundVideo);

    if (foundVideo) {
      video.value = foundVideo;
    } else {
      // Retry up to 3 times with delay if video not found
      if (retryCount < 3) {
        console.log('Video not found, retrying in 1 second...');
        setTimeout(() => {
          loadVideo(retryCount + 1);
        }, 1000);
        return;
      }

      console.error('Video not found with ID after retries:', videoId);
      error.value = 'Video not found';
    }
  } catch (err) {
    if (retryCount < 3) {
      console.log('Error loading video, retrying in 1 second...', err);
      setTimeout(() => {
        loadVideo(retryCount + 1);
      }, 1000);
      return;
    }

    error.value = 'Failed to load video';
    console.error('Error loading video after retries:', err);
  } finally {
    if (retryCount >= 3 || video.value) {
      isLoading.value = false;
    }
  }
};

// Initialize data
onMounted(async () => {
  await loadVideo();

  // Handle keyboard shortcuts
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') navigateBack();
  };
  document.addEventListener('keydown', handleEscape);

  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape);
  });
});

// Computed
const relatedVideos = computed(() => {
  if (!video.value) return [];
  return videos.value.filter((v) => v.id !== video.value?.id).slice(0, 8); // Show up to 8 related videos
});

// Watch for video changes
watch(video, (newVideo) => {
  if (newVideo) {
    // Video changed, ready to play
  }
});

// Methods
const navigateBack = () => {
  router.push('/');
};

const playVideo = (selectedVideo: Video) => {
  router.push(`/play/${selectedVideo.id}`);
};

const handleVideoLoaded = () => {
  // Video metadata loaded - just ensure it's visible if no preroll
  // Don't autoplay - let user control playback
};

const handleVideoPlay = () => {
  // Video started playing
};

const handlePlayerReady = (player: any) => {
  console.log('Secure video player ready:', player);
};

const handlePlayerError = (error: any) => {
  console.error('Video player error:', error);
};

const handleRightClickBlocked = () => {
  console.log('Right-click blocked on protected content');
};

const handleDevToolsDetected = () => {
  console.log('Developer tools detected - security alert triggered');
};

const handleVideoUnloaded = () => {
  console.log('Video unloaded due to security violation');
};

const handleTorrentReady = (streamUrl: string) => {
  console.log('Torrent stream ready:', streamUrl);
};

const handleTorrentProgress = (progress: number) => {
  console.log('Torrent download progress:', Math.round(progress * 100) + '%');
};

const formatDate = (date: Date) => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch (error) {
    return 'Unknown date';
  }
};

// SEO and meta
useHead(() => ({
  title: video.value
    ? `${video.value.title} - Streaming App`
    : 'Video Player - Streaming App',
  meta: [
    {
      name: 'description',
      content:
        video.value?.description || 'Watch videos on our streaming platform',
    },
  ],
}));
</script>

<style scoped>
/* Custom scrollbar for dark theme */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #1f2937;
}

::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>
