<template>
  <div
    class="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/30"
  >
    <h2 class="text-2xl font-bold text-white mb-8 flex items-center">
      <Icon name="heroicons:folder-open" class="h-6 w-6 mr-3 text-purple-400" />
      Manage Videos
    </h2>

    <div class="space-y-4 max-h-96 overflow-y-auto">
      <div v-if="!videos || videos.length === 0" class="text-center py-12">
        <Icon
          name="heroicons:video-camera-slash"
          class="mx-auto h-16 w-16 text-gray-500 mb-4"
        />
        <p class="text-gray-400">No videos uploaded yet</p>
      </div>

      <div
        v-for="video in videos || []"
        :key="video.id"
        class="flex items-center space-x-4 p-4 bg-gray-800/30 border border-gray-700/30 rounded-2xl hover:bg-gray-700/30 transition-all duration-300"
        :class="{
          'ring-2 ring-purple-500/50 bg-purple-900/20':
            editingVideoId === video.id,
        }"
      >
        <div
          class="w-20 h-12 bg-gray-700 rounded-xl overflow-hidden flex-shrink-0"
        >
          <img
            v-if="video.thumbnail"
            :src="video.thumbnail"
            :alt="video.title"
            class="w-full h-full object-cover"
          />
          <div v-else class="flex items-center justify-center h-full">
            <Icon name="heroicons:play" class="h-6 w-6 text-gray-400" />
          </div>
        </div>

        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-white truncate mb-1">
            {{ video.title }}
          </h3>
          <p class="text-sm text-gray-400 truncate mb-1">
            {{ video.description }}
          </p>
          <div class="flex items-center space-x-4 text-xs text-gray-500">
            <span class="flex items-center space-x-1">
              <Icon name="heroicons:clock" class="h-3 w-3" />
              <span>{{ video.duration }}</span>
            </span>
            <span class="flex items-center space-x-1">
              <Icon name="heroicons:calendar" class="h-3 w-3" />
              <span>{{ formatDate(video.uploadedAt) }}</span>
            </span>
          </div>
        </div>

        <div class="flex space-x-2">
          <button
            @click="handleEdit(video)"
            class="p-2 text-purple-400 hover:bg-purple-500/20 rounded-xl transition-all duration-300"
            :class="{ 'bg-purple-500/30': editingVideoId === video.id }"
            title="Edit video"
          >
            <Icon name="heroicons:pencil" class="h-4 w-4" />
          </button>
          <button
            @click="handleDelete(video.id)"
            class="p-2 text-red-400 hover:bg-red-500/20 rounded-xl transition-all duration-300"
            title="Delete video"
          >
            <Icon name="heroicons:trash" class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Video } from '~/composables/useVideos';

defineProps<{
  videos: readonly Video[];
  editingVideoId: string | null;
}>();

const emit = defineEmits<{
  edit: [video: Video];
  delete: [id: string];
}>();

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

const handleEdit = (video: Video) => {
  emit('edit', video);
};

const handleDelete = (id: string) => {
  emit('delete', id);
};
</script>
