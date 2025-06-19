<template>
  <span
    :class="[
      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
      'border border-white/20 backdrop-blur-sm',
      size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2 py-1',
    ]"
    :style="{
      backgroundColor: `${category.color || '#666'}20`,
      borderColor: `${category.color || '#666'}40`,
      color: category.color || '#fff',
    }"
  >
    {{ category.name }}
  </span>
</template>

<script setup lang="ts">
interface Category {
  id: string;
  name: string;
  color?: string;
}

interface Props {
  category: Category;
  size?: 'sm' | 'md';
}

defineProps<Props>();
</script>
