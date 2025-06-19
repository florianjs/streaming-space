<template>
  <div class="mb-6 space-y-4">
    <!-- Basic Sorting Options -->
    <div>
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-semibold text-white flex items-center">
          <Icon name="heroicons:funnel" class="h-5 w-5 mr-2 text-purple-400" />
          Sort by
        </h3>
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          v-for="option in baseSortOptions"
          :key="option.value"
          @click="$emit('update:sortBy', option.value)"
          :class="[
            'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300',
            sortBy === option.value
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
              : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white border border-gray-700/50',
          ]"
        >
          <Icon :name="option.icon" class="h-4 w-4 mr-1 inline" />
          {{ option.label }}
        </button>
      </div>
    </div>

    <!-- Category Filter Options -->
    <div v-if="categories && categories.length > 0">
      <div class="flex items-center justify-between mb-3">
        <h4 class="text-base font-medium text-white flex items-center">
          <Icon name="heroicons:tag" class="h-4 w-4 mr-2 text-green-400" />
          Filter by Category
          <span
            v-if="categoryFilter"
            class="ml-2 px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded-full"
          >
            Active
          </span>
        </h4>
        <span class="text-xs text-gray-400"
          >{{ categories.length }} available</span
        >
      </div>

      <div class="flex flex-wrap gap-2">
        <!-- Clear Category Filter Button -->
        <button
          v-if="categoryFilter"
          @click="$emit('update:categoryFilter', null)"
          class="px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center space-x-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/30"
        >
          <Icon name="heroicons:x-mark" class="h-3 w-3" />
          <span>Clear Filter</span>
        </button>

        <button
          v-for="category in categories"
          :key="`category-${category.id}`"
          @click="$emit('update:categoryFilter', category.id)"
          :class="[
            'px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center space-x-2',
            categoryFilter === category.id
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
              : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white border border-gray-700/50',
          ]"
        >
          <div
            class="w-3 h-3 rounded-full border border-white/20"
            :style="{ backgroundColor: category.color || '#666' }"
          />
          <span>{{ category.name }}</span>
          <span v-if="category.count" class="text-xs opacity-75"
            >({{ category.count }})</span
          >
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface SortOption {
  value: string;
  label: string;
  icon: string;
}

interface Props {
  sortBy: string;
  categoryFilter: string | null;
  categories?: readonly any[];
}

const props = defineProps<Props>();

defineEmits<{
  'update:sortBy': [value: string];
  'update:categoryFilter': [value: string | null];
}>();

const baseSortOptions: SortOption[] = [
  {
    value: 'latest',
    label: 'Latest added',
    icon: 'heroicons:clock',
  },
  {
    value: 'title-asc',
    label: 'Title A-Z',
    icon: 'heroicons:bars-arrow-up',
  },
  {
    value: 'title-desc',
    label: 'Title Z-A',
    icon: 'heroicons:bars-arrow-down',
  },
  {
    value: 'oldest',
    label: 'Oldest first',
    icon: 'heroicons:archive-box',
  },
];

// baseSortOptions are used directly in the template
</script>
