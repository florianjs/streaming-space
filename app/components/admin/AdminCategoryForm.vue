<template>
  <div
    class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
  >
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-white flex items-center space-x-2">
        <Icon name="heroicons:tag" class="h-6 w-6 text-purple-400" />
        <span>{{
          editingCategoryId ? 'Edit Category' : 'Add New Category'
        }}</span>
      </h2>

      <button
        v-if="editingCategoryId"
        @click="resetForm"
        class="text-gray-400 hover:text-white transition-colors"
        title="Cancel edit"
      >
        <Icon name="heroicons:x-mark" class="h-5 w-5" />
      </button>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Name -->
      <div>
        <label for="name" class="block text-sm font-medium text-gray-300 mb-2">
          Name *
        </label>
        <input
          id="name"
          v-model="formData.name"
          type="text"
          required
          class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
          placeholder="e.g., Action, Comedy, Drama"
          @input="generateSlugFromName"
        />
        <p v-if="nameExists" class="text-xs text-red-400 mt-1">
          A category with this name already exists
        </p>
      </div>

      <!-- Description -->
      <div>
        <label
          for="description"
          class="block text-sm font-medium text-gray-300 mb-2"
        >
          Description
        </label>
        <textarea
          id="description"
          v-model="formData.description"
          rows="3"
          class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
          placeholder="Brief description of this category..."
        />
      </div>

      <!-- Slug -->
      <div>
        <label for="slug" class="block text-sm font-medium text-gray-300 mb-2">
          Slug
        </label>
        <input
          id="slug"
          v-model="formData.slug"
          type="text"
          class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
          placeholder="URL-friendly version (auto-generated)"
        />
        <p v-if="slugExists" class="text-xs text-red-400 mt-1">
          A category with this slug already exists
        </p>
        <p v-else class="text-xs text-gray-400 mt-1">
          Used for URLs and filtering. Leave empty to auto-generate.
        </p>
      </div>

      <!-- Color and Sort Order Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Color -->
        <div>
          <label
            for="color"
            class="block text-sm font-medium text-gray-300 mb-2"
          >
            Color
          </label>
          <div class="flex items-center space-x-3">
            <input
              id="color"
              v-model="formData.color"
              type="color"
              class="w-12 h-10 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer"
            />
            <input
              v-model="formData.color"
              type="text"
              class="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              placeholder="#FF6B35"
            />
          </div>
        </div>

        <!-- Sort Order -->
        <div>
          <label
            for="sort_order"
            class="block text-sm font-medium text-gray-300 mb-2"
          >
            Sort Order
          </label>
          <input
            id="sort_order"
            v-model.number="formData.sort_order"
            type="number"
            min="0"
            class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
            placeholder="0"
          />
        </div>
      </div>

      <!-- Icon Upload -->
      <div>
        <label for="icon" class="block text-sm font-medium text-gray-300 mb-2">
          Icon (32x32px recommended)
        </label>
        <input
          id="icon"
          ref="iconInput"
          type="file"
          accept="image/*"
          @change="handleIconChange"
          class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-600 file:text-white hover:file:bg-purple-700 transition-colors"
        />
        <p v-if="iconSizeError" class="text-xs text-red-400 mt-1">
          {{ iconSizeError }}
        </p>
        <p v-else class="text-xs text-gray-400 mt-1">
          Optional icon for the category (PNG, JPG, SVG). Maximum size: 2MB.
        </p>
      </div>

      <!-- Active Toggle -->
      <div class="flex items-center justify-between">
        <div>
          <label for="active" class="text-sm font-medium text-gray-300">
            Active
          </label>
          <p class="text-xs text-gray-400">
            Whether this category is visible to users
          </p>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input
            id="active"
            v-model="formData.active"
            type="checkbox"
            class="sr-only peer"
          />
          <div
            class="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"
          ></div>
        </label>
      </div>

      <!-- Debug Tools -->
      <div class="border-t border-gray-600/50 pt-4">
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            @click="$emit('debugAuth')"
            class="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
          >
            Debug Auth
          </button>
          <button
            type="button"
            @click="$emit('testConnection')"
            class="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors"
          >
            Test Categories API
          </button>
          <button
            type="button"
            @click="$emit('testMinimalCreate')"
            class="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-500 transition-colors"
          >
            Test Minimal Create
          </button>
          <button
            type="button"
            @click="$emit('testAuthContext')"
            class="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-500 transition-colors"
          >
            Test Auth Context
          </button>
          <button
            type="button"
            @click="$emit('checkSchemaRules')"
            class="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-500 transition-colors"
          >
            Check Schema Rules
          </button>
          <button
            type="button"
            @click="$emit('testAdminAuth')"
            class="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-500 transition-colors"
          >
            Debug Auth Token
          </button>
          <button
            type="button"
            @click="$emit('testSchemaApplication')"
            class="px-3 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-500 transition-colors"
          >
            Test Schema Applied
          </button>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end">
        <button
          type="submit"
          :disabled="
            isSubmitting ||
            !formData.name.trim() ||
            nameExists ||
            slugExists ||
            !!iconSizeError
          "
          class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-pink-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <Icon
            v-if="isSubmitting"
            name="heroicons:arrow-path"
            class="h-4 w-4 animate-spin"
          />
          <Icon v-else name="heroicons:plus" class="h-4 w-4" />
          <span>{{
            editingCategoryId ? 'Update Category' : 'Add Category'
          }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { CategoryForm } from '~/composables/useCategories';

interface Props {
  editingCategoryId?: string | null;
  isSubmitting?: boolean;
  initialData?: Partial<CategoryForm>;
  categories?: readonly Category[];
}

interface Emits {
  submit: [form: CategoryForm];
  reset: [];
  debugAuth: [];
  testConnection: [];
  testMinimalCreate: [];
  testAuthContext: [];
  checkSchemaRules: [];
  testAdminAuth: [];
  testSchemaApplication: [];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { generateSlug } = useCategories();

const iconInput = ref<HTMLInputElement>();

const formData = ref<CategoryForm>({
  name: '',
  description: '',
  slug: '',
  color: '#FF6B35',
  icon: null,
  sort_order: 0,
  active: true,
});

// Track if user has manually edited the slug
const userEditedSlug = ref(false);

// Watch for initial data changes
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      formData.value = {
        ...formData.value,
        ...newData,
        icon: null, // Reset file input
      };
      // Reset slug editing flag when loading initial data
      userEditedSlug.value = false;
    }
  },
  { immediate: true, deep: true }
);

// Check for existing names and slugs
const nameExists = computed(() => {
  if (!formData.value.name || !props.categories) return false;
  return props.categories.some(
    (cat) =>
      cat.name.toLowerCase() === formData.value.name.toLowerCase() &&
      cat.id !== props.editingCategoryId
  );
});

const slugExists = computed(() => {
  if (!formData.value.slug || !props.categories) return false;
  return props.categories.some(
    (cat) =>
      cat.slug === formData.value.slug && cat.id !== props.editingCategoryId
  );
});

const generateSlugFromName = () => {
  if (formData.value.name && !userEditedSlug.value) {
    formData.value.slug = generateSlug(formData.value.name);
  }
};

// Watch for manual slug edits
watch(
  () => formData.value.slug,
  (newSlug, oldSlug) => {
    // If the slug changes and it's not from our auto-generation, mark as user-edited
    if (newSlug !== oldSlug && formData.value.name) {
      const expectedSlug = generateSlug(formData.value.name);
      if (newSlug !== expectedSlug) {
        userEditedSlug.value = true;
      }
    }
  }
);

const iconSizeError = ref<string>('');

const handleIconChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  iconSizeError.value = '';

  if (file) {
    // Check file size (2MB limit)
    const maxSize = 2097152; // 2MB in bytes
    if (file.size > maxSize) {
      iconSizeError.value = `File too large. Maximum size is ${(
        maxSize /
        1024 /
        1024
      ).toFixed(1)}MB, but your file is ${(file.size / 1024 / 1024).toFixed(
        1
      )}MB.`;
      target.value = ''; // Clear the input
      formData.value.icon = null;
      return;
    }

    formData.value.icon = file;
  }
};

const handleSubmit = () => {
  if (!formData.value.name.trim()) return;

  // Auto-generate slug if empty
  if (!formData.value.slug) {
    formData.value.slug = generateSlug(formData.value.name);
  }

  emit('submit', { ...formData.value });
};

const resetForm = () => {
  formData.value = {
    name: '',
    description: '',
    slug: '',
    color: '#FF6B35',
    icon: null,
    sort_order: 0,
    active: true,
  };

  // Reset file input
  if (iconInput.value) {
    iconInput.value.value = '';
  }

  // Reset slug editing flag
  userEditedSlug.value = false;

  // Reset icon error
  iconSizeError.value = '';

  emit('reset');
};

// Expose resetForm for parent component
defineExpose({
  resetForm,
});
</script>
