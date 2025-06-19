<template>
  <Transition
    enter-active-class="duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-2"
  >
    <div
      v-if="message"
      class="fixed bottom-6 right-6 max-w-sm bg-gradient-to-r from-gray-900 to-gray-800 border rounded-2xl shadow-2xl p-4 z-50"
      :class="
        message.type === 'success'
          ? 'border-green-500/50 shadow-green-500/20'
          : 'border-red-500/50 shadow-red-500/20'
      "
    >
      <div class="flex items-center">
        <Icon
          :name="
            message.type === 'success'
              ? 'heroicons:check-circle'
              : 'heroicons:exclamation-circle'
          "
          class="h-5 w-5 mr-3"
          :class="
            message.type === 'success' ? 'text-green-400' : 'text-red-400'
          "
        />
        <span class="text-white font-medium">{{ message.text }}</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface Message {
  type: 'success' | 'error';
  text: string;
}

defineProps<{
  message: Message | null;
}>();
</script>
