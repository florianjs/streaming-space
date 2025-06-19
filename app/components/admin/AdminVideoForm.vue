<template>
  <div
    class="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/30"
  >
    <h2 class="text-2xl font-bold text-white mb-8 flex items-center">
      <Icon name="heroicons:plus-circle" class="h-6 w-6 mr-3 text-purple-400" />
      {{ editingVideoId ? 'Edit Video' : 'Add New Video' }}
    </h2>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div>
        <label
          for="video-title"
          class="block text-sm font-medium text-gray-300 mb-2"
        >
          Video Title *
        </label>
        <input
          id="video-title"
          v-model="form.title"
          type="text"
          required
          class="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
          placeholder="Enter video title"
        />
      </div>

      <div>
        <label
          for="video-description"
          class="block text-sm font-medium text-gray-300 mb-2"
        >
          Description *
        </label>
        <textarea
          id="video-description"
          v-model="form.description"
          required
          rows="3"
          class="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
          placeholder="Enter video description"
        />
      </div>

      <div>
        <label
          for="video-url"
          class="block text-sm font-medium text-gray-300 mb-2"
        >
          Video URL *
        </label>
        <input
          id="video-url"
          v-model="form.url"
          type="url"
          required
          class="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
          placeholder="https://example.com/video.mp4"
        />
      </div>

      <div>
        <label
          for="video-thumbnail"
          class="block text-sm font-medium text-gray-300 mb-2"
        >
          Thumbnail URL
        </label>
        <input
          id="video-thumbnail"
          v-model="form.thumbnail"
          type="url"
          class="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
          placeholder="https://example.com/thumbnail.jpg"
        />
      </div>

      <div>
        <label
          for="video-duration"
          class="block text-sm font-medium text-gray-300 mb-2"
        >
          Duration *
        </label>
        <input
          id="video-duration"
          v-model="form.duration"
          type="text"
          required
          pattern="^([0-9]+:)?[0-9]{1,2}:[0-9]{2}$"
          class="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
          placeholder="5:30"
        />
        <p class="text-xs text-gray-400 mt-2">Format: MM:SS or HH:MM:SS</p>
      </div>

      <div class="flex space-x-4">
        <button
          type="submit"
          :disabled="isSubmitting"
          class="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isSubmitting" class="flex items-center justify-center">
            <Icon
              name="heroicons:arrow-path"
              class="h-5 w-5 mr-2 animate-spin"
            />
            {{ editingVideoId ? 'Updating...' : 'Adding...' }}
          </span>
          <span v-else class="flex items-center justify-center">
            <Icon
              :name="editingVideoId ? 'heroicons:pencil' : 'heroicons:plus'"
              class="h-5 w-5 mr-2"
            />
            {{ editingVideoId ? 'Update Video' : 'Add Video' }}
          </span>
        </button>

        <button
          type="button"
          @click="resetForm"
          class="px-6 py-3 bg-gray-800/50 border border-gray-700/50 text-gray-300 rounded-xl hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-gray-500/50 transition-all duration-300"
        >
          {{ editingVideoId ? 'Cancel' : 'Reset' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { VideoForm } from '~/composables/useVideos';

const props = defineProps<{
  editingVideoId: string | null;
  isSubmitting: boolean;
  initialData?: VideoForm;
}>();

const emit = defineEmits<{
  submit: [form: VideoForm];
  reset: [];
}>();

const form = ref<VideoForm>({
  title: '',
  description: '',
  url: '',
  thumbnail: '',
  duration: '',
});

// Watch for initial data changes (when editing)
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.value = { ...newData };
    }
  },
  { immediate: true, deep: true }
);

const handleSubmit = () => {
  emit('submit', { ...form.value });
};

const resetForm = () => {
  form.value = {
    title: '',
    description: '',
    url: '',
    thumbnail: '',
    duration: '',
  };
  emit('reset');
};

// Expose resetForm method to parent
defineExpose({
  resetForm,
});
</script>
