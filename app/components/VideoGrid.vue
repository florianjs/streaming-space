<template>
  <div>
    <!-- Videos Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      <VideoCard
        v-for="video in videos"
        :key="video.id"
        :video="video"
        @play="$emit('playVideo', video)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Video } from '../composables/useVideos';

interface Props {
  videos: Video[];
}

defineProps<Props>();

defineEmits<{
  playVideo: [video: Video];
}>();
</script>
