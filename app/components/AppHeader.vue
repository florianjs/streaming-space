<template>
  <header
    class="sticky top-0 z-40 backdrop-blur-xl bg-gray-900/80 border-b border-gray-700/50"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-6">
        <div class="flex items-center space-x-3">
          <div
            class="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center"
          >
            <Icon name="heroicons:play" class="h-6 w-6 text-white" />
          </div>
          <h1
            class="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
          >
            StreamSpace
          </h1>
        </div>

        <div class="flex items-center space-x-4">
          <!-- Enhanced search bar -->
          <div class="relative group">
            <div
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            >
              <Icon
                name="heroicons:magnifying-glass"
                class="h-5 w-5 text-gray-400 group-focus-within:text-purple-400 transition-colors"
              />
            </div>
            <input
              :value="modelValue"
              @input="
                $emit(
                  'update:modelValue',
                  ($event.target as HTMLInputElement)?.value || ''
                )
              "
              type="text"
              placeholder="Search videos..."
              class="w-64 pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
            />
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string;
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>
