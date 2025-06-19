<template>
  <header
    class="sticky top-0 z-40 backdrop-blur-xl bg-gray-900/80 border-b border-gray-700/50"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-6">
        <div class="flex items-center space-x-4">
          <NuxtLink
            to="/"
            class="text-purple-400 hover:text-purple-300 transition-colors"
          >
            <Icon name="heroicons:arrow-left" class="h-6 w-6" />
          </NuxtLink>
          <div class="flex items-center space-x-3">
            <div
              class="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center"
            >
              <Icon name="heroicons:cog-6-tooth" class="h-6 w-6 text-white" />
            </div>
            <h1
              class="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
            >
              Admin Panel
            </h1>
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <!-- User Info -->
          <div class="flex items-center space-x-3">
            <div class="text-right">
              <p class="text-sm font-medium text-white">{{ user?.email }}</p>
              <p class="text-xs text-gray-400">Super Administrator</p>
            </div>
            <div
              class="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center"
            >
              <Icon name="heroicons:user" class="h-5 w-5 text-white" />
            </div>
          </div>

          <!-- Logout Button -->
          <button
            @click="handleLogout"
            class="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-300"
            title="Sign Out"
          >
            <Icon
              name="heroicons:arrow-right-start-on-rectangle"
              class="h-4 w-4"
            />
            <span class="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const { user, logout } = useAuth();

const emit = defineEmits<{
  logout: [];
}>();

const handleLogout = () => {
  if (confirm('Are you sure you want to sign out?')) {
    logout();
    emit('logout');
  }
};
</script>
