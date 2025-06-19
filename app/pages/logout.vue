<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4"
  >
    <div class="max-w-md w-full text-center">
      <!-- Logo/Header -->
      <div class="mb-8">
        <div
          class="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
        >
          <Icon
            name="heroicons:arrow-right-start-on-rectangle"
            class="h-10 w-10 text-white"
          />
        </div>
        <h1
          class="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2"
        >
          Signing Out
        </h1>
        <p class="text-gray-400">You are being signed out securely...</p>
      </div>

      <!-- Loading Animation -->
      <div
        class="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/30"
      >
        <div class="flex items-center justify-center space-x-3">
          <Icon
            name="heroicons:arrow-path"
            class="h-6 w-6 text-purple-400 animate-spin"
          />
          <span class="text-gray-300">Logging out...</span>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center mt-8">
        <p class="text-sm text-gray-500">
          You will be redirected to the login page shortly.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Set page metadata
useHead({
  title: 'Signing Out - Streaming App',
  meta: [
    {
      name: 'description',
      content: 'Securely signing out of the streaming app',
    },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
});

// Define page meta
definePageMeta({
  layout: false, // Use no layout for clean logout experience
  auth: false, // This page doesn't require authentication
});

const { logout } = useAuth();

// Perform logout on mount
onMounted(async () => {
  try {
    // Wait a moment for better UX
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Perform logout
    await logout();

    // Redirect to login page
    await navigateTo('/login');
  } catch (error) {
    console.error('Logout error:', error);
    // Still redirect to login even if logout fails
    await navigateTo('/login');
  }
});
</script>
