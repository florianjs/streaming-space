<template>
  <div class="mt-4 p-4 bg-gray-700/30 border border-gray-600/50 rounded-xl">
    <!-- Error State -->
    <div v-if="error" class="flex items-center text-red-400">
      <Icon name="heroicons:exclamation-triangle" class="h-5 w-5 mr-2" />
      <span class="text-sm">{{ error }}</span>
    </div>

    <!-- Success State with Movie Data -->
    <div v-else-if="movieData" class="space-y-3">
      <div class="flex items-start space-x-4">
        <!-- Poster Image -->
        <div class="flex-shrink-0">
          <div
            v-if="movieData.Poster && movieData.Poster !== 'N/A'"
            class="relative group cursor-pointer"
            @click="$emit('use-poster')"
            title="Click to use as thumbnail"
          >
            <img
              :src="movieData.Poster"
              :alt="movieData.Title"
              class="w-24 h-36 object-cover rounded-lg border-2 border-gray-600 hover:border-purple-500 transition-all duration-300 group-hover:scale-105"
            />
            <div
              class="absolute inset-0 bg-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center"
            >
              <div
                class="bg-purple-600 text-white px-3 py-1 rounded-lg text-sm font-medium"
              >
                Use as Thumbnail
              </div>
            </div>
          </div>
          <div
            v-else
            class="w-24 h-36 bg-gray-600 rounded-lg flex items-center justify-center border-2 border-gray-600"
          >
            <Icon name="heroicons:photo" class="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <!-- Movie Information -->
        <div class="flex-1 min-w-0">
          <h4 class="text-white font-semibold text-lg">
            {{ movieData.Title }}
            <span class="text-gray-400 font-normal"
              >({{ movieData.Year }})</span
            >
          </h4>
          <div class="flex items-center space-x-4 text-sm text-gray-400 mt-1">
            <span v-if="movieData.Runtime">{{ movieData.Runtime }}</span>
            <span v-if="movieData.Genre">{{ movieData.Genre }}</span>
            <span v-if="movieData.imdbRating" class="flex items-center">
              <Icon
                name="heroicons:star"
                class="h-4 w-4 text-yellow-400 mr-1"
              />
              {{ movieData.imdbRating }}
            </span>
          </div>
          <p
            v-if="movieData.Plot"
            class="text-gray-300 text-sm mt-2 line-clamp-3"
          >
            {{ movieData.Plot }}
          </p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div
        class="flex items-center justify-between pt-3 border-t border-gray-600/50"
      >
        <div class="flex items-center space-x-2">
          <Icon
            name="heroicons:information-circle"
            class="h-4 w-4 text-blue-400"
          />
          <span class="text-xs text-gray-400"
            >Click poster to use as thumbnail</span
          >
        </div>
        <button
          v-if="movieData.Poster && movieData.Poster !== 'N/A'"
          type="button"
          @click="$emit('use-poster')"
          class="flex items-center space-x-2 px-3 py-1.5 bg-purple-600/80 hover:bg-purple-600 border border-purple-500/50 rounded-lg text-purple-100 hover:text-white transition-all duration-300 text-sm"
        >
          <Icon name="heroicons:photo" class="h-4 w-4" />
          <span>Use Poster</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OMDBResponse } from '~/composables/useOMDB';

defineProps<{
  movieData: OMDBResponse | null;
  error: string | null;
}>();

defineEmits<{
  'use-poster': [];
}>();
</script>
