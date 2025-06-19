<template>
  <!-- Enhanced Video Player Modal -->
  <Transition
    enter-active-class="duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="video"
      class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      @click="$emit('close')"
    >
      <Transition
        enter-active-class="duration-300 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="duration-200 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-700/50"
          @click.stop
        >
          <!-- Modal header -->
          <div
            class="flex justify-between items-center p-6 border-b border-gray-700/50"
          >
            <h2 class="text-2xl font-bold text-white">
              {{ video.title }}
            </h2>
            <button
              @click="$emit('close')"
              class="w-10 h-10 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:scale-110"
            >
              <Icon name="heroicons:x-mark" class="h-6 w-6" />
            </button>
          </div>

          <!-- Video player -->
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
              @right-click-blocked="handleRightClickBlocked"
              @dev-tools-detected="handleDevToolsDetected"
              @video-unloaded="handleVideoUnloaded"
              @torrent-ready="handleTorrentReady"
              @torrent-progress="handleTorrentProgress"
            />
          </div>

          <!-- Video description -->
          <div class="p-6">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <p class="text-gray-300 text-lg leading-relaxed mb-4">
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
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { Video } from '../composables/useVideos';

interface Props {
  video: Video | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  'video-play': [];
}>();

const videoPlayer = ref<HTMLVideoElement>();

const handleVideoPlay = () => {
  emit('video-play');
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

// Expose refs for parent component
defineExpose({
  videoPlayer,
});
</script>
