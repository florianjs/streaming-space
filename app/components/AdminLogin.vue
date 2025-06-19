<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4"
  >
    <div class="max-w-md w-full">
      <!-- Logo/Header -->
      <div class="text-center mb-8">
        <div
          class="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
        >
          <Icon name="heroicons:shield-check" class="h-10 w-10 text-white" />
        </div>
        <h1
          class="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2"
        >
          Admin Access
        </h1>
        <p class="text-gray-400">Sign in to access the admin dashboard</p>
      </div>

      <!-- Login Form -->
      <div
        class="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/30"
      >
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Email Field -->
          <div>
            <label
              for="email"
              class="block text-sm font-medium text-gray-300 mb-2"
            >
              Email Address
            </label>
            <div class="relative">
              <Icon
                name="heroicons:envelope"
                class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
              />
              <input
                id="email"
                v-model="form.identity"
                type="email"
                required
                autocomplete="email"
                :disabled="isLoading"
                class="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <!-- Password Field -->
          <div>
            <label
              for="password"
              class="block text-sm font-medium text-gray-300 mb-2"
            >
              Password
            </label>
            <div class="relative">
              <Icon
                name="heroicons:lock-closed"
                class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
              />
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                :disabled="isLoading"
                class="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter your password"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                :disabled="isLoading"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon
                  :name="showPassword ? 'heroicons:eye-slash' : 'heroicons:eye'"
                  class="h-5 w-5"
                />
              </button>
            </div>
          </div>

          <!-- Error Message -->
          <Transition
            enter-active-class="duration-300 ease-out"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <div
              v-if="error"
              class="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center space-x-3"
            >
              <Icon
                name="heroicons:exclamation-circle"
                class="h-5 w-5 text-red-400 flex-shrink-0"
              />
              <span class="text-red-400 text-sm">{{ error }}</span>
            </div>
          </Transition>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isLoading || !form.identity || !form.password"
            class="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <span v-if="isLoading" class="flex items-center justify-center">
              <Icon
                name="heroicons:arrow-path"
                class="h-5 w-5 mr-2 animate-spin"
              />
              Signing In...
            </span>
            <span v-else class="flex items-center justify-center">
              <Icon
                name="heroicons:arrow-right-end-on-rectangle"
                class="h-5 w-5 mr-2"
              />
              Sign In
            </span>
          </button>
        </form>

        <!-- Additional Info -->
        <div class="mt-8 pt-6 border-t border-gray-700/30">
          <div class="text-center">
            <p class="text-xs text-gray-500">
              Authorized personnel only. All access attempts are logged.
            </p>
            <div class="mt-2">
              <NuxtLink
                to="/"
                class="text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                ← Back to Home
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center mt-8">
        <div
          class="flex items-center justify-center space-x-4 text-sm text-gray-500"
        >
          <div class="flex items-center space-x-1">
            <Icon name="heroicons:shield-check" class="h-4 w-4" />
            <span>Secure Login</span>
          </div>
          <div class="w-1 h-1 bg-gray-600 rounded-full"></div>
          <div class="flex items-center space-x-1">
            <Icon name="heroicons:lock-closed" class="h-4 w-4" />
            <span>Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LoginCredentials } from '~/composables/useAuth';

// Emit events to parent component
const emit = defineEmits<{
  loginSuccess: [];
}>();

// Use auth composable
const { login, isLoading, error } = useAuth();

// Form state
const form = ref<LoginCredentials>({
  identity: '',
  password: '',
});

const showPassword = ref(false);

// Handle form submission
const handleLogin = async () => {
  const success = await login(form.value);

  if (success) {
    // Wait a moment to ensure the authentication state is updated
    await nextTick();

    emit('loginSuccess');
    // Clear form on success
    form.value = {
      identity: '',
      password: '',
    };
  }
};

// Focus email input on mount
onMounted(() => {
  const emailInput = document.getElementById('email') as HTMLInputElement;
  if (emailInput) {
    emailInput.focus();
  }
});
</script>
