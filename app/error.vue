<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4"
  >
    <div class="max-w-md w-full text-center">
      <!-- Error Icon -->
      <div class="mb-8">
        <div
          class="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
        >
          <Icon
            :name="
              error.statusCode === 404
                ? 'heroicons:question-mark-circle'
                : 'heroicons:exclamation-triangle'
            "
            class="h-10 w-10 text-white"
          />
        </div>
        <h1
          class="text-6xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2"
        >
          {{ error.statusCode || '500' }}
        </h1>
        <h2 class="text-2xl font-semibold text-white mb-4">
          {{ getErrorTitle() }}
        </h2>
        <p class="text-gray-400 mb-8">
          {{ getErrorMessage() }}
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-4">
        <button
          @click="handleError"
          class="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
        >
          <Icon name="heroicons:arrow-path" class="h-5 w-5 mr-2 inline" />
          Try Again
        </button>

        <NuxtLink
          to="/"
          class="block w-full bg-gray-700/50 text-gray-300 py-3 px-6 rounded-xl font-medium hover:bg-gray-700/70 transition-all duration-300 border border-gray-600/30"
        >
          <Icon name="heroicons:home" class="h-5 w-5 mr-2 inline" />
          Go Home
        </NuxtLink>
      </div>

      <!-- Footer -->
      <div class="text-center mt-8">
        <p class="text-xs text-gray-500">
          If this problem persists, please contact support.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Define props for error
const props = defineProps<{
  error: {
    statusCode?: number;
    statusMessage?: string;
    message?: string;
  };
}>();

// Set page metadata
useHead({
  title: `Error ${props.error.statusCode || '500'} - Streaming App`,
  meta: [
    {
      name: 'description',
      content: 'An error occurred while loading the page',
    },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
});

// Define page meta
definePageMeta({
  layout: false, // Use no layout for clean error experience
});

// Helper functions
const getErrorTitle = () => {
  switch (props.error.statusCode) {
    case 404:
      return 'Page Not Found';
    case 403:
      return 'Access Forbidden';
    case 500:
      return 'Server Error';
    default:
      return 'Something Went Wrong';
  }
};

const getErrorMessage = () => {
  switch (props.error.statusCode) {
    case 404:
      return 'The page you are looking for does not exist or has been moved.';
    case 403:
      return 'You do not have permission to access this resource.';
    case 500:
      return 'An internal server error occurred. Please try again later.';
    default:
      return (
        props.error.statusMessage ||
        props.error.message ||
        'An unexpected error occurred.'
      );
  }
};

// Handle error action
const handleError = () => {
  // Clear error and reload
  clearError({ redirect: '/' });
};
</script>
