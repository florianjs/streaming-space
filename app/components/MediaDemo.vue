<template>
  <div
    class="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/30"
  >
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-xl font-bold text-white flex items-center">
        <Icon
          name="heroicons:information-circle"
          class="h-6 w-6 mr-3 text-blue-400"
        />
        Media Management API Demo
      </h3>
      <button
        @click="toggleDemo"
        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
      >
        {{ showDemo ? 'Hide' : 'Show' }} Demo
      </button>
    </div>

    <div v-if="showDemo" class="space-y-6">
      <div class="bg-gray-800/30 rounded-xl p-6 border border-gray-700/30">
        <h4 class="text-lg font-semibold text-white mb-4">API Endpoint</h4>
        <div class="bg-gray-900/50 rounded-lg p-4 font-mono text-sm">
          <span class="text-green-400">POST</span>
          <span class="text-gray-300 ml-2"
            >{{ baseUrl }}/api/collections/media/records</span
          >
        </div>
      </div>

      <div class="bg-gray-800/30 rounded-xl p-6 border border-gray-700/30">
        <h4 class="text-lg font-semibold text-white mb-4">Example Request</h4>
        <pre
          class="bg-gray-900/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto"
        ><code>const formData = new FormData();
formData.append('title', 'Movie Title');
formData.append('type', 'stream');
formData.append('imdb', 'tt1234567');
formData.append('description', 'Movie description');
formData.append('media_url', 'https://example.com/movie.mp4');
formData.append('thumbnail', thumbnailFile);

fetch('{{ baseUrl }}/api/collections/media/records', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your-superuser-token'
  },
  body: formData
});</code></pre>
      </div>

      <div class="bg-gray-800/30 rounded-xl p-6 border border-gray-700/30">
        <h4 class="text-lg font-semibold text-white mb-4">
          Supported Media Types
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <Icon
              name="heroicons:play-circle"
              class="h-8 w-8 text-blue-400 mb-2"
            />
            <h5 class="text-white font-medium">Stream</h5>
            <p class="text-gray-400 text-sm">Direct video URLs for streaming</p>
          </div>
          <div
            class="bg-green-500/10 border border-green-500/30 rounded-lg p-4"
          >
            <Icon
              name="heroicons:arrow-down-tray"
              class="h-8 w-8 text-green-400 mb-2"
            />
            <h5 class="text-white font-medium">Torrent</h5>
            <p class="text-gray-400 text-sm">Torrent file uploads</p>
          </div>
          <div
            class="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4"
          >
            <Icon
              name="heroicons:window"
              class="h-8 w-8 text-purple-400 mb-2"
            />
            <h5 class="text-white font-medium">iFrame</h5>
            <p class="text-gray-400 text-sm">Embedded iframe content</p>
          </div>
        </div>
      </div>

      <div class="bg-gray-800/30 rounded-xl p-6 border border-gray-700/30">
        <h4 class="text-lg font-semibold text-white mb-4">Quick Test</h4>
        <p class="text-gray-300 mb-4">
          Test the API connection with your current configuration:
        </p>
        <button
          @click="testConnection"
          :disabled="isTestingConnection"
          class="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center"
        >
          <Icon
            :name="
              isTestingConnection ? 'heroicons:arrow-path' : 'heroicons:bolt'
            "
            class="h-4 w-4 mr-2"
            :class="{ 'animate-spin': isTestingConnection }"
          />
          {{ isTestingConnection ? 'Testing...' : 'Test Connection' }}
        </button>

        <div
          v-if="connectionResult"
          class="mt-4 p-3 rounded-lg"
          :class="
            connectionResult.success
              ? 'bg-green-500/10 border border-green-500/30'
              : 'bg-red-500/10 border border-red-500/30'
          "
        >
          <div class="flex items-center">
            <Icon
              :name="
                connectionResult.success
                  ? 'heroicons:check-circle'
                  : 'heroicons:x-circle'
              "
              class="h-5 w-5 mr-2"
              :class="
                connectionResult.success ? 'text-green-400' : 'text-red-400'
              "
            />
            <span
              :class="
                connectionResult.success ? 'text-green-300' : 'text-red-300'
              "
            >
              {{ connectionResult.message }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const showDemo = ref(false);
const isTestingConnection = ref(false);
const connectionResult = ref<{ success: boolean; message: string } | null>(
  null
);

const baseUrl = computed(() => config.public.baseUrl);

const toggleDemo = () => {
  showDemo.value = !showDemo.value;
};

const testConnection = async () => {
  isTestingConnection.value = true;
  connectionResult.value = null;

  try {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      connectionResult.value = {
        success: false,
        message: 'No authentication token found. Please set your token first.',
      };
      return;
    }

    const response = await fetch(
      `${config.public.baseUrl}/api/collections/media/records?page=1&perPage=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      connectionResult.value = {
        success: true,
        message: 'Connection successful! API is ready to use.',
      };
    } else {
      const errorData = await response.json().catch(() => ({}));
      connectionResult.value = {
        success: false,
        message: `Connection failed: ${
          errorData.message || `HTTP ${response.status}`
        }`,
      };
    }
  } catch (error: any) {
    connectionResult.value = {
      success: false,
      message: `Connection error: ${error.message || 'Network error'}`,
    };
  } finally {
    isTestingConnection.value = false;
  }
};
</script>
