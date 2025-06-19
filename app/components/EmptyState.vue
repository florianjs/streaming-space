<template>
  <div class="text-center py-20">
    <div class="relative">
      <div class="absolute inset-0 flex items-center justify-center">
        <div
          :class="[
            'w-32 h-32 rounded-full blur-3xl',
            {
              'bg-gradient-to-r from-purple-500/20 to-pink-500/20':
                type === 'loading' || type === 'empty',
              'bg-gradient-to-r from-red-500/20 to-orange-500/20':
                type === 'error',
            },
          ]"
        ></div>
      </div>
      <div class="relative">
        <div
          class="w-24 h-24 mx-auto bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl flex items-center justify-center mb-6 shadow-2xl"
          :class="{ 'animate-pulse': type === 'loading' }"
        >
          <Icon
            :name="iconName"
            :class="[
              'h-12 w-12',
              {
                'text-gray-400 animate-spin': type === 'loading',
                'text-gray-400': type === 'empty',
                'text-red-400': type === 'error',
              },
            ]"
          />
        </div>
        <h3 class="text-2xl font-bold text-white mb-3">
          {{ title }}
        </h3>
        <p class="text-gray-400 text-lg max-w-md mx-auto leading-relaxed mb-4">
          {{ description }}
        </p>
        <div
          v-if="type === 'error'"
          class="flex flex-col items-center space-y-3"
        >
          <button
            @click="$emit('retry')"
            class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
          >
            Try Again
          </button>
          <p v-if="showAuthHint" class="text-yellow-400 text-sm text-center">
            <Icon
              name="heroicons:information-circle"
              class="h-4 w-4 inline mr-1"
            />
            You may need to set your authentication token using the yellow
            banner above
          </p>
        </div>
        <button
          v-if="type === 'empty' && searchQuery"
          @click="$emit('clearSearch')"
          class="mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
        >
          Clear Search
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type: 'loading' | 'error' | 'empty';
  error?: string;
  searchQuery?: string;
}

const props = defineProps<Props>();

// Debug logging to understand the state
console.log('[EmptyState] Component rendered with:', {
  type: props.type,
  error: props.error,
  searchQuery: props.searchQuery,
});

defineEmits<{
  retry: [];
  clearSearch: [];
}>();

const iconName = computed(() => {
  switch (props.type) {
    case 'loading':
      return 'heroicons:arrow-path';
    case 'error':
      return 'heroicons:exclamation-triangle';
    case 'empty':
      return 'heroicons:video-camera';
    default:
      return 'heroicons:video-camera';
  }
});

const title = computed(() => {
  switch (props.type) {
    case 'loading':
      return 'Loading videos...';
    case 'error':
      return 'Something went wrong';
    case 'empty':
      return props.searchQuery ? 'No videos found' : 'Welcome to StreamSpace';
    default:
      return '';
  }
});

const description = computed(() => {
  switch (props.type) {
    case 'loading':
      return 'Please wait while we fetch your content.';
    case 'error':
      return getErrorMessage(props.error || '');
    case 'empty':
      return props.searchQuery
        ? 'Try adjusting your search terms or browse all videos.'
        : 'Your video streaming experience starts here. Upload your first video to get started.';
    default:
      return '';
  }
});

const showAuthHint = computed(() => {
  return props.type === 'error' && props.error?.includes('404');
});

const getErrorMessage = (error: string) => {
  if (error.includes('404')) {
    return 'No videos found. The media collection may not exist or you may need authentication.';
  } else if (error.includes('401') || error.includes('403')) {
    return 'Authentication required. Please set your token or check your credentials.';
  } else if (error.includes('500')) {
    return 'Server error. Please try again later.';
  } else if (error.includes('Network') || error.includes('fetch')) {
    return 'Connection error. Please check your internet connection.';
  } else {
    return error;
  }
};
</script>
