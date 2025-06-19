<template>
  <aside class="w-80 space-y-6">
    <!-- Trending section -->
    <div
      class="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30"
    >
      <h3 class="text-white font-bold text-lg mb-4 flex items-center">
        <Icon name="heroicons:fire" class="h-5 w-5 mr-2 text-orange-500" />
        Trending Now
      </h3>
      <div class="space-y-3">
        <div
          v-for="(video, index) in trendingVideos"
          :key="`trending-${video.id}`"
          class="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-700/30 transition-colors cursor-pointer"
          @click="$emit('playVideo', video)"
        >
          <div
            class="w-12 h-8 bg-gray-700 rounded flex-shrink-0 overflow-hidden"
          >
            <img
              v-if="video.thumbnail"
              :src="video.thumbnail"
              :alt="video.title"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-white text-sm font-medium truncate">
              {{ video.title }}
            </p>
            <p class="text-gray-400 text-xs">{{ video.duration }}</p>
          </div>
          <div class="text-orange-500 text-sm font-bold">#{{ index + 1 }}</div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { Video } from '../composables/useVideos';

interface Props {
  videos: Video[];
}

const props = defineProps<Props>();

defineEmits<{
  playVideo: [video: Video];
}>();

const trendingVideos = computed(() => {
  return props.videos?.slice(0, 3) || [];
});
</script>
