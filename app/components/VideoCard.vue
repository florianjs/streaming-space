<template>
  <div
    class="group relative bg-white/5 backdrop-blur-xl rounded-lg overflow-hidden hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-700 hover:scale-[1.03] cursor-pointer border border-white/10 hover:border-purple-500/30 h-96"
    @click="$emit('play', video)"
  >
    <!-- Full Height Image Container -->
    <div class="absolute inset-0 overflow-hidden">
      <!-- Main Image taking full height -->
      <div class="w-full h-full relative overflow-hidden">
        <img
          v-if="video.thumbnail"
          :src="video.thumbnail"
          :alt="video.title"
          class="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-110"
        />
        <div
          v-else
          class="flex items-center justify-center h-full bg-gradient-to-br from-purple-900/30 to-pink-900/30"
        >
          <div
            class="w-20 h-20 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full flex items-center justify-center backdrop-blur-sm"
          >
            <Icon name="heroicons:play" class="h-10 w-10 text-white/80" />
          </div>
        </div>
      </div>

      <!-- Content Overlay with Gradient Background -->
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"
      >
        <!-- Play Button Overlay -->
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"
        >
          <!-- Play Button with Ripple Effect -->
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="relative">
              <!-- Ripple Animation -->
              <div
                class="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-0 group-hover:opacity-75 transition-opacity duration-500 scale-150"
              ></div>
              <div
                class="absolute inset-0 bg-white/10 rounded-full animate-pulse opacity-0 group-hover:opacity-50 transition-opacity duration-700 scale-125"
              ></div>
              <!-- Main Play Button -->
              <div
                class="relative w-20 h-20 bg-white/25 backdrop-blur-md rounded-full flex items-center justify-center transform scale-75 group-hover:scale-100 transition-all duration-500 border border-white/30"
              >
                <Icon
                  name="heroicons:play"
                  class="h-10 w-10 text-white ml-1 drop-shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Content Section Overlaid at Bottom -->
        <div class="absolute bottom-0 left-0 right-0 p-6 space-y-3">
          <!-- Title with Better Typography -->
          <div>
            <h3
              class="font-bold text-white text-xl leading-tight line-clamp-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all duration-500 drop-shadow-lg"
            >
              {{ video.title }}
            </h3>
          </div>

          <!-- Description with Improved Spacing -->
          <p
            class="text-gray-200 line-clamp-1 text-sm leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity duration-300 drop-shadow"
          >
            {{ video.description }}
          </p>

          <!-- Categories -->
          <div
            v-if="video.categories && video.categories.length > 0"
            class="flex flex-wrap gap-1"
          >
            <CategoryBadge
              v-for="category in video.categories.slice(0, 3)"
              :key="category.id"
              :category="category"
              size="sm"
            />
            <span
              v-if="video.categories.length > 3"
              class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/20 border border-gray-500/40 text-gray-300"
            >
              +{{ video.categories.length - 3 }}
            </span>
          </div>

          <!-- Enhanced Metadata Section -->
          <div class="flex justify-between items-center pt-2">
            <div class="flex items-center space-x-2">
              <div
                class="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"
              ></div>
              <span class="text-gray-300 font-medium text-sm drop-shadow">{{
                formatDate(video.uploadedAt)
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Animated Border Effect -->
    <div
      class="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
    >
      <div
        class="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/0 via-purple-500/20 to-pink-500/0 animate-pulse"
      ></div>
    </div>

    <!-- Subtle Inner Glow -->
    <div
      class="absolute inset-1 rounded-lg bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
    ></div>
  </div>
</template>

<script setup lang="ts">
import type { Video } from '../composables/useVideos';

defineProps<{
  video: Video;
}>();

defineEmits<{
  play: [video: Video];
}>();

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
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Custom animations for enhanced UX */
@keyframes ripple {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-ripple {
  animation: ripple 1s infinite;
}

/* Gradient text animation */
@keyframes gradient-shift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient-shift 3s ease infinite;
}
</style>
