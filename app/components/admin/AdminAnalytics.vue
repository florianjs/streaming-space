<template>
  <div class="space-y-8">
    <!-- Analytics Overview -->
    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
    >
      <div
        class="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-purple-300 text-sm font-medium">Total Videos</p>
            <p class="text-3xl font-bold text-white">
              {{ videosCount }}
            </p>
          </div>
          <Icon name="heroicons:video-camera" class="h-8 w-8 text-purple-400" />
        </div>
      </div>

      <div
        class="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-green-300 text-sm font-medium">Total Media</p>
            <p class="text-3xl font-bold text-white">
              {{ mediaCount }}
            </p>
          </div>
          <Icon name="heroicons:film" class="h-8 w-8 text-green-400" />
        </div>
      </div>

      <div
        class="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-300 text-sm font-medium">Platform Status</p>
            <p class="text-3xl font-bold text-white">Active</p>
          </div>
          <Icon name="heroicons:signal" class="h-8 w-8 text-blue-400" />
        </div>
      </div>

      <div
        class="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-6 border border-indigo-500/30"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-indigo-300 text-sm font-medium">Categories</p>
            <p class="text-3xl font-bold text-white">
              {{ categoriesCount }}
            </p>
          </div>
          <Icon name="heroicons:tag" class="h-8 w-8 text-indigo-400" />
        </div>
      </div>

      <div
        class="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/30"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-yellow-300 text-sm font-medium">Open Source</p>
            <p class="text-3xl font-bold text-white">100%</p>
          </div>
          <Icon name="heroicons:heart" class="h-8 w-8 text-yellow-400" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  videosCount: number;
  mediaCount: number;
  categoriesCount: number;
}>();
</script>
