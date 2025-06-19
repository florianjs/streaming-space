<template>
  <div class="bg-gray-800 rounded-lg p-6 space-y-4">
    <h3 class="text-xl font-semibold text-white mb-4">Authentication Test</h3>

    <!-- Authentication Status -->
    <div class="flex items-center space-x-2">
      <div
        :class="isAuthenticated ? 'bg-green-500' : 'bg-red-500'"
        class="w-3 h-3 rounded-full"
      ></div>
      <span class="text-gray-300">
        {{ isAuthenticated ? 'Authenticated' : 'Not Authenticated' }}
      </span>
    </div>

    <!-- User Info -->
    <div v-if="user" class="bg-gray-700 rounded p-3">
      <p class="text-sm text-gray-300">
        <strong>Email:</strong> {{ user.email }}
      </p>
      <p class="text-sm text-gray-300"><strong>ID:</strong> {{ user.id }}</p>
      <p class="text-sm text-gray-300">
        <strong>Verified:</strong> {{ user.verified ? 'Yes' : 'No' }}
      </p>
    </div>

    <!-- Test Protected Endpoint -->
    <div class="space-y-2">
      <button
        @click="testProtectedEndpoint"
        :disabled="!isAuthenticated || isLoading"
        class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded font-medium transition-colors"
      >
        {{ isLoading ? 'Testing...' : 'Test Protected Endpoint' }}
      </button>

      <!-- Response Display -->
      <div v-if="response" class="bg-gray-700 rounded p-3">
        <h4 class="text-sm font-medium text-white mb-2">Response:</h4>
        <pre class="text-xs text-gray-300 overflow-x-auto">{{
          JSON.stringify(response, null, 2)
        }}</pre>
      </div>

      <!-- Error Display -->
      <div
        v-if="error"
        class="bg-red-900/50 border border-red-500/50 rounded p-3"
      >
        <p class="text-red-400 text-sm">{{ error }}</p>
      </div>
    </div>

    <!-- Logout Button -->
    <button
      v-if="isAuthenticated"
      @click="logout"
      class="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-medium transition-colors"
    >
      Logout
    </button>
  </div>
</template>

<script setup lang="ts">
const { user, isAuthenticated, logout } = useAuth();
const { get } = useAuthenticatedFetch();

const isLoading = ref(false);
const response = ref<any>(null);
const error = ref<string | null>(null);

const testProtectedEndpoint = async () => {
  if (!isAuthenticated.value) {
    error.value = 'Not authenticated';
    return;
  }

  isLoading.value = true;
  error.value = null;
  response.value = null;

  try {
    const result = await get('/api/protected/user-info');
    response.value = result;
  } catch (err: any) {
    error.value = err.message || 'Failed to call protected endpoint';
    console.error('Protected endpoint error:', err);
  } finally {
    isLoading.value = false;
  }
};
</script>
