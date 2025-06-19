<template>
  <div
    class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
  >
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-white flex items-center space-x-2">
        <Icon name="heroicons:queue-list" class="h-6 w-6 text-purple-400" />
        <span>Categories ({{ categories.length }})</span>
      </h2>

      <!-- Search -->
      <div class="relative">
        <Icon
          name="heroicons:magnifying-glass"
          class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
        />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search categories..."
          class="pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors w-64"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="filteredCategories.length === 0 && !searchQuery"
      class="text-center py-12"
    >
      <Icon name="heroicons:tag" class="h-16 w-16 text-gray-600 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-400 mb-2">No categories yet</h3>
      <p class="text-gray-500">Create your first category to get started.</p>
    </div>

    <!-- No Search Results -->
    <div
      v-else-if="filteredCategories.length === 0 && searchQuery"
      class="text-center py-12"
    >
      <Icon
        name="heroicons:magnifying-glass"
        class="h-16 w-16 text-gray-600 mx-auto mb-4"
      />
      <h3 class="text-lg font-medium text-gray-400 mb-2">
        No categories found
      </h3>
      <p class="text-gray-500">Try a different search term.</p>
    </div>

    <!-- Categories List -->
    <div v-else class="space-y-3">
      <div
        v-for="category in filteredCategories"
        :key="category.id"
        :class="[
          'group relative bg-gray-700/30 border border-gray-600/50 rounded-xl p-4 hover:bg-gray-700/50 transition-all duration-200',
          editingCategoryId === category.id
            ? 'ring-2 ring-purple-500 bg-gray-700/50'
            : '',
        ]"
      >
        <div class="flex items-center justify-between">
          <!-- Category Info -->
          <div class="flex items-center space-x-4 flex-1">
            <!-- Color Indicator -->
            <div
              class="w-4 h-4 rounded-full border border-gray-500"
              :style="{ backgroundColor: category.color || '#666' }"
            />

            <!-- Icon -->
            <div
              v-if="category.icon"
              class="w-8 h-8 flex items-center justify-center"
            >
              <img
                :src="getCategoryIconUrl(category)"
                :alt="category.name"
                class="w-6 h-6 object-cover rounded"
              />
            </div>
            <div v-else class="w-8 h-8 flex items-center justify-center">
              <Icon name="heroicons:tag" class="h-5 w-5 text-gray-400" />
            </div>

            <!-- Details -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-3">
                <h3 class="font-medium text-white truncate">
                  {{ category.name }}
                </h3>
                <span
                  v-if="category.slug"
                  class="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded font-mono"
                >
                  {{ category.slug }}
                </span>
                <span
                  v-if="category.sort_order !== undefined"
                  class="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded"
                >
                  #{{ category.sort_order }}
                </span>
              </div>
              <p
                v-if="category.description"
                class="text-sm text-gray-400 mt-1 truncate"
              >
                {{ category.description }}
              </p>
            </div>

            <!-- Status -->
            <div class="flex items-center space-x-2">
              <span
                :class="[
                  'px-2 py-1 text-xs font-medium rounded-full',
                  category.active
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-gray-500/20 text-gray-400',
                ]"
              >
                {{ category.active ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div
            class="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <button
              @click="editCategory(category)"
              class="p-2 text-gray-400 hover:text-blue-400 transition-colors"
              title="Edit category"
            >
              <Icon name="heroicons:pencil" class="h-4 w-4" />
            </button>
            <button
              @click="confirmDelete(category)"
              class="p-2 text-gray-400 hover:text-red-400 transition-colors"
              title="Delete category"
            >
              <Icon name="heroicons:trash" class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      @click.self="cancelDelete"
    >
      <div
        class="bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 border border-gray-700"
      >
        <div class="flex items-center space-x-3 mb-4">
          <Icon
            name="heroicons:exclamation-triangle"
            class="h-6 w-6 text-red-400"
          />
          <h3 class="text-lg font-semibold text-white">Delete Category</h3>
        </div>

        <p class="text-gray-300 mb-6">
          Are you sure you want to delete "<strong>{{
            categoryToDelete?.name
          }}</strong
          >"? This action cannot be undone.
        </p>

        <div class="flex justify-end space-x-3">
          <button
            @click="cancelDelete"
            class="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            @click="executeDelete"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Category } from '~/composables/useCategories';

interface Props {
  categories: Category[];
  editingCategoryId?: string | null;
}

interface Emits {
  edit: [category: Category];
  delete: [categoryId: string];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const config = useRuntimeConfig();

const searchQuery = ref('');
const showDeleteModal = ref(false);
const categoryToDelete = ref<Category | null>(null);

const filteredCategories = computed(() => {
  if (!searchQuery.value) return props.categories;

  const query = searchQuery.value.toLowerCase();
  return props.categories.filter(
    (category) =>
      category.name.toLowerCase().includes(query) ||
      (category.description &&
        category.description.toLowerCase().includes(query)) ||
      (category.slug && category.slug.toLowerCase().includes(query))
  );
});

const getCategoryIconUrl = (category: Category): string => {
  if (!category.icon) return '';
  return `${config.public.baseUrl}/api/files/${category.collectionId}/${category.id}/${category.icon}`;
};

const editCategory = (category: Category) => {
  emit('edit', category);
};

const confirmDelete = (category: Category) => {
  categoryToDelete.value = category;
  showDeleteModal.value = true;
};

const cancelDelete = () => {
  categoryToDelete.value = null;
  showDeleteModal.value = false;
};

const executeDelete = () => {
  if (categoryToDelete.value) {
    emit('delete', categoryToDelete.value.id);
    cancelDelete();
  }
};
</script>
