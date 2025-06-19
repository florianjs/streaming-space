<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
    <div
      class="flex space-x-1 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-1 border border-gray-700/50"
    >
      <button
        @click="$emit('update:activeTab', 'analytics')"
        :class="[
          'flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300',
          activeTab === 'analytics'
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
            : 'text-gray-400 hover:text-white hover:bg-gray-700/50',
        ]"
      >
        <Icon name="heroicons:chart-bar" class="h-5 w-5" />
        <span>Analytics</span>
      </button>
      <button
        @click="$emit('update:activeTab', 'media')"
        :class="[
          'flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300',
          activeTab === 'media'
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
            : 'text-gray-400 hover:text-white hover:bg-gray-700/50',
        ]"
      >
        <Icon name="heroicons:film" class="h-5 w-5" />
        <span>Media Files</span>
      </button>
      <button
        @click="$emit('update:activeTab', 'categories')"
        :class="[
          'flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300',
          activeTab === 'categories'
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
            : 'text-gray-400 hover:text-white hover:bg-gray-700/50',
        ]"
      >
        <Icon name="heroicons:tag" class="h-5 w-5" />
        <span>Categories</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  activeTab: 'videos' | 'analytics' | 'media' | 'categories';
}>();

defineEmits<{
  'update:activeTab': [tab: 'videos' | 'analytics' | 'media' | 'categories'];
}>();
</script>
