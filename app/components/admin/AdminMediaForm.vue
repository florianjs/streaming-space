<template>
  <div
    class="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/30"
  >
    <div class="flex items-center justify-between mb-8">
      <h2 class="text-2xl font-bold text-white flex items-center">
        <Icon
          name="heroicons:plus-circle"
          class="h-6 w-6 mr-3 text-purple-400"
        />
        {{ editingMediaId ? 'Edit Media File' : 'Add New Media File' }}
      </h2>

      <div class="flex items-center space-x-2">
        <!-- Sample Data Button -->
        <button
          v-if="!editingMediaId"
          type="button"
          @click="fillWithSampleData"
          class="flex items-center space-x-2 px-4 py-2 bg-blue-600/80 hover:bg-blue-600 border border-blue-500/50 rounded-xl text-blue-100 hover:text-white transition-all duration-300 text-sm font-medium"
          title="Remplir avec des données d'exemple"
        >
          <Icon name="heroicons:sparkles" class="h-4 w-4" />
          <span>Sample Data</span>
        </button>

        <!-- Debug Auth Button -->
        <button
          type="button"
          @click="debugAuth"
          class="flex items-center space-x-2 px-3 py-2 bg-yellow-600/80 hover:bg-yellow-600 border border-yellow-500/50 rounded-xl text-yellow-100 hover:text-white transition-all duration-300 text-sm font-medium"
          title="Debug authentication state"
        >
          <Icon name="heroicons:bug-ant" class="h-4 w-4" />
          <span>Debug</span>
        </button>

        <!-- Test Collection Button -->
        <button
          type="button"
          @click="testMediaCollection"
          class="flex items-center space-x-2 px-3 py-2 bg-green-600/80 hover:bg-green-600 border border-green-500/50 rounded-xl text-green-100 hover:text-white transition-all duration-300 text-sm font-medium"
          title="Test if media collection exists"
        >
          <Icon name="heroicons:beaker" class="h-4 w-4" />
          <span>Test DB</span>
        </button>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div>
        <label
          for="media-title"
          class="block text-sm font-medium text-gray-300 mb-2"
        >
          Title *
        </label>
        <input
          id="media-title"
          v-model="form.title"
          type="text"
          required
          class="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
          placeholder="Enter media title"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            for="media-type"
            class="block text-sm font-medium text-gray-300 mb-2"
          >
            Media Type *
          </label>
          <select
            id="media-type"
            v-model="form.type"
            required
            class="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
          >
            <option value="stream">Stream</option>
            <option value="torrent">Torrent</option>
            <option value="iframe">iFrame</option>
          </select>
        </div>

        <div>
          <label
            for="media-imdb"
            class="block text-sm font-medium text-gray-300 mb-2"
          >
            IMDB ID
          </label>
          <div class="relative">
            <input
              id="media-imdb"
              v-model="form.imdb"
              type="text"
              class="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
              placeholder="tt1234567"
            />
            <div
              v-if="isFetchingPoster"
              class="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <Icon
                name="heroicons:arrow-path"
                class="h-5 w-5 text-purple-400 animate-spin"
              />
            </div>
          </div>

          <!-- Poster Preview Section -->
          <AdminIMDBPosterPreview
            v-if="fetchedMovieData || posterError"
            :movie-data="fetchedMovieData"
            :error="posterError"
            @use-poster="usePosterAsThumbnail"
          />
        </div>
      </div>

      <div>
        <label
          for="media-description"
          class="block text-sm font-medium text-gray-300 mb-2"
        >
          Description
        </label>
        <textarea
          id="media-description"
          v-model="form.description"
          rows="3"
          class="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
          placeholder="Enter media description"
        />
      </div>

      <!-- Categories Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">
          Categories (max 5)
        </label>
        <div class="space-y-2">
          <div
            v-if="availableCategories.length === 0"
            class="text-gray-400 text-sm"
          >
            No categories available. Create categories first.
          </div>
          <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-2">
            <label
              v-for="category in availableCategories"
              :key="category.id"
              class="flex items-center space-x-2 p-2 bg-gray-800/30 border border-gray-700/50 rounded-lg hover:bg-gray-700/30 transition-colors cursor-pointer"
            >
              <input
                type="checkbox"
                :value="category.id"
                v-model="form.categories"
                :disabled="
                  !isSelected(category.id) &&
                  (form.categories?.length || 0) >= 5
                "
                class="rounded border-gray-600 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
              />
              <div class="flex items-center space-x-2 flex-1 min-w-0">
                <div
                  class="w-3 h-3 rounded-full border border-gray-500"
                  :style="{ backgroundColor: category.color || '#666' }"
                />
                <span class="text-sm text-white truncate">{{
                  category.name
                }}</span>
              </div>
            </label>
          </div>
          <p class="text-xs text-gray-400">
            Select up to 5 categories for this media
          </p>
        </div>
      </div>

      <div v-if="form.type === 'stream'">
        <label
          for="media-url"
          class="block text-sm font-medium text-gray-300 mb-2"
        >
          Media URL
        </label>
        <input
          id="media-url"
          v-model="form.media_url"
          type="url"
          class="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
          placeholder="https://example.com/video.mp4"
        />
      </div>

      <div v-if="form.type === 'iframe'">
        <label
          for="media-iframe"
          class="block text-sm font-medium text-gray-300 mb-2"
        >
          iFrame HTML
        </label>
        <textarea
          id="media-iframe"
          v-model="form.iframe"
          rows="4"
          class="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
          placeholder='<iframe src="https://example.com" width="100%" height="400"></iframe>'
        />
      </div>

      <div v-if="form.type === 'torrent'" class="space-y-4">
        <div>
          <label
            for="media-magnet"
            class="block text-sm font-medium text-gray-300 mb-2"
          >
            Magnet Link
          </label>
          <input
            id="media-magnet"
            v-model="form.magnet_link"
            type="url"
            placeholder="magnet:?xt=urn:btih:..."
            class="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
          />
          <p class="text-xs text-gray-400 mt-2">
            Paste magnet link for direct torrent streaming
          </p>
        </div>

        <div class="text-center text-gray-400">
          <span class="text-sm">OR</span>
        </div>

        <div>
          <label
            for="media-torrent"
            class="block text-sm font-medium text-gray-300 mb-2"
          >
            Torrent File
          </label>
          <div class="relative">
            <input
              id="media-torrent"
              ref="torrentInput"
              type="file"
              accept=".torrent"
              @change="handleTorrentFile"
              class="hidden"
            />
            <button
              type="button"
              @click="torrentInput?.click()"
              class="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 text-left flex items-center justify-between"
            >
              <span>
                {{
                  form.torrent ? form.torrent.name : 'Choose torrent file...'
                }}
              </span>
              <Icon name="heroicons:document-arrow-up" class="h-5 w-5" />
            </button>
          </div>
          <p class="text-xs text-gray-400 mt-2">
            Upload .torrent file as alternative to magnet link
          </p>
        </div>
      </div>

      <div>
        <label
          for="media-thumbnail"
          class="block text-sm font-medium text-gray-300 mb-2"
        >
          Thumbnail Image
        </label>
        <div class="relative">
          <input
            id="media-thumbnail"
            ref="thumbnailInput"
            type="file"
            accept="image/*"
            @change="handleThumbnailFile"
            class="hidden"
          />
          <button
            type="button"
            @click="thumbnailInput?.click()"
            class="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 text-left flex items-center justify-between"
          >
            <span>
              {{
                form.thumbnail
                  ? form.thumbnail.name
                  : 'Choose thumbnail image...'
              }}
            </span>
            <Icon name="heroicons:photo" class="h-5 w-5" />
          </button>
        </div>
        <p class="text-xs text-gray-400 mt-2">
          Recommended: 16:9 aspect ratio, max 2MB
        </p>
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
            {{ editingMediaId ? 'Updating...' : 'Creating...' }}
          </span>
          <span v-else class="flex items-center justify-center">
            <Icon
              :name="editingMediaId ? 'heroicons:pencil' : 'heroicons:plus'"
              class="h-5 w-5 mr-2"
            />
            {{ editingMediaId ? 'Update Media' : 'Create Media' }}
          </span>
        </button>

        <button
          type="button"
          @click="resetForm"
          class="px-6 py-3 bg-gray-800/50 border border-gray-700/50 text-gray-300 rounded-xl hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-gray-500/50 transition-all duration-300"
        >
          {{ editingMediaId ? 'Cancel' : 'Reset' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { MediaForm } from '~/composables/useMedia';
import type { OMDBResponse } from '~/composables/useOMDB';

const props = defineProps<{
  editingMediaId: string | null;
  isSubmitting: boolean;
  initialData?: MediaForm;
  fetchedMovieData: OMDBResponse | null;
  posterError: string | null;
  isFetchingPoster: boolean;
}>();

const emit = defineEmits<{
  submit: [form: MediaForm];
  reset: [];
  'fill-sample': [];
  'debug-auth': [];
  'test-collection': [];
  'use-poster': [];
}>();

// Template refs
const torrentInput = ref<HTMLInputElement>();
const thumbnailInput = ref<HTMLInputElement>();

const form = ref<MediaForm>({
  title: '',
  type: 'stream' as 'stream' | 'torrent' | 'iframe',
  imdb: '',
  description: '',
  media_url: '',
  iframe: '',
  magnet_link: '',
  thumbnail: null as File | null,
  torrent: null as File | null,
  categories: [],
});

// Get categories
const { getActiveCategories } = useCategories();
const availableCategories = ref<
  Array<{ id: string; name: string; color?: string }>
>([]);

// Load categories on mount
onMounted(async () => {
  try {
    const categories = await getActiveCategories();
    availableCategories.value = categories;
  } catch (error) {
    console.error('Error loading categories:', error);
  }
});

const isSelected = (categoryId: string): boolean => {
  return form.value.categories?.includes(categoryId) || false;
};

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
    type: 'stream',
    imdb: '',
    description: '',
    media_url: '',
    iframe: '',
    magnet_link: '',
    thumbnail: null,
    torrent: null,
    categories: [],
  };

  // Reset file inputs
  if (process.client) {
    if (torrentInput.value) torrentInput.value.value = '';
    if (thumbnailInput.value) thumbnailInput.value.value = '';
  }

  emit('reset');
};

const fillWithSampleData = () => {
  emit('fill-sample');
};

const debugAuth = () => {
  emit('debug-auth');
};

const testMediaCollection = () => {
  emit('test-collection');
};

const usePosterAsThumbnail = () => {
  emit('use-poster');
};

// File handling methods
const handleTorrentFile = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    form.value.torrent = file;
  }
};

const handleThumbnailFile = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    form.value.thumbnail = file;
  }
};

// Expose methods to parent
defineExpose({
  resetForm,
  form: readonly(form),
});
</script>
