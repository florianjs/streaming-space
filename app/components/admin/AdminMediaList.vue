<template>
  <div
    class="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/30"
  >
    <h2 class="text-2xl font-bold text-white mb-8 flex items-center">
      <Icon name="heroicons:folder-open" class="h-6 w-6 mr-3 text-purple-400" />
      Manage Media Files
    </h2>

    <div class="space-y-4 max-h-96 overflow-y-auto">
      <div v-if="!media || media.length === 0" class="text-center py-12">
        <Icon
          name="heroicons:film"
          class="mx-auto h-16 w-16 text-gray-500 mb-4"
        />
        <p class="text-gray-400">No media files uploaded yet</p>
      </div>

      <div
        v-for="mediaItem in media || []"
        :key="mediaItem.id"
        class="flex items-center space-x-4 p-4 bg-gray-800/30 border border-gray-700/30 rounded-2xl hover:bg-gray-700/30 transition-all duration-300"
        :class="{
          'ring-2 ring-purple-500/50 bg-purple-900/20':
            editingMediaId === mediaItem.id,
        }"
      >
        <div
          class="w-20 h-12 bg-gray-700 rounded-xl overflow-hidden flex-shrink-0"
        >
          <img
            v-if="mediaItem.thumbnail"
            :src="`${$config.public.baseUrl}/api/files/${mediaItem.collectionId}/${mediaItem.id}/${mediaItem.thumbnail}`"
            :alt="mediaItem.title"
            class="w-full h-full object-cover"
          />
          <div v-else class="flex items-center justify-center h-full">
            <Icon
              :name="getMediaIcon(mediaItem.type)"
              class="h-6 w-6 text-gray-400"
            />
          </div>
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-2 mb-1">
            <h3 class="font-semibold text-white truncate">
              {{ mediaItem.title }}
            </h3>
            <span
              :class="getTypeColor(mediaItem.type)"
              class="px-2 py-1 rounded-lg text-xs font-medium"
            >
              {{ mediaItem.type }}
            </span>
          </div>
          <p
            v-if="mediaItem.description"
            class="text-sm text-gray-400 truncate mb-1"
          >
            {{ mediaItem.description }}
          </p>
          <div class="flex items-center space-x-4 text-xs text-gray-500">
            <span v-if="mediaItem.imdb" class="flex items-center space-x-1">
              <Icon name="heroicons:star" class="h-3 w-3" />
              <span>{{ mediaItem.imdb }}</span>
            </span>
            <span class="flex items-center space-x-1">
              <Icon name="heroicons:calendar" class="h-3 w-3" />
              <span>{{ formatDate(new Date(mediaItem.created)) }}</span>
            </span>
          </div>
        </div>

        <div class="flex space-x-2">
          <button
            @click="handleEdit(mediaItem)"
            class="p-2 text-purple-400 hover:bg-purple-500/20 rounded-xl transition-all duration-300"
            :class="{
              'bg-purple-500/30': editingMediaId === mediaItem.id,
            }"
            title="Edit media"
          >
            <Icon name="heroicons:pencil" class="h-4 w-4" />
          </button>
          <button
            @click="handleDelete(mediaItem.id)"
            class="p-2 text-red-400 hover:bg-red-500/20 rounded-xl transition-all duration-300"
            title="Delete media"
          >
            <Icon name="heroicons:trash" class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Media } from '~/composables/useMedia';

defineProps<{
  media: readonly Media[];
  editingMediaId: string | null;
}>();

const emit = defineEmits<{
  edit: [media: Media];
  delete: [id: string];
}>();

const getMediaIcon = (type: string) => {
  switch (type) {
    case 'stream':
      return 'heroicons:play-circle';
    case 'torrent':
      return 'heroicons:arrow-down-tray';
    case 'iframe':
      return 'heroicons:window';
    default:
      return 'heroicons:film';
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'stream':
      return 'bg-blue-500/20 text-blue-400';
    case 'torrent':
      return 'bg-green-500/20 text-green-400';
    case 'iframe':
      return 'bg-purple-500/20 text-purple-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

const handleEdit = (media: Media) => {
  emit('edit', media);
};

const handleDelete = (id: string) => {
  emit('delete', id);
};
</script>
