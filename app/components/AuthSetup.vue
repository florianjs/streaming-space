<template>
  <div
    v-if="!hasToken"
    class="fixed top-4 right-4 max-w-sm bg-gradient-to-r from-yellow-900/90 to-orange-900/90 backdrop-blur-sm border border-yellow-500/50 rounded-2xl shadow-2xl p-4 z-50"
  >
    <div class="flex items-start space-x-3">
      <Icon
        name="heroicons:exclamation-triangle"
        class="h-6 w-6 text-yellow-400 flex-shrink-0 mt-0.5"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const tokenInput = ref('');
const hasToken = ref(false);
const dismissed = ref(false);

const setToken = () => {
  if (tokenInput.value.trim()) {
    localStorage.setItem('auth_token', tokenInput.value.trim());
    hasToken.value = true;
    tokenInput.value = '';
  }
};

const dismiss = () => {
  dismissed.value = true;
};

// Check for existing token
onMounted(() => {
  if (process.client) {
    const existingToken = localStorage.getItem('auth_token');
    hasToken.value = !!existingToken;
  }
});

// Show component only if no token and not dismissed
const showComponent = computed(() => !hasToken.value && !dismissed.value);
</script>
