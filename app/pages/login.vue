<template>
  <div>
    <AdminLogin @login-success="handleLoginSuccess" />
  </div>
</template>

<script setup lang="ts">
import logger from '../../utils/logger';

// Set page metadata
useHead({
  title: 'Admin Login - Streaming App',
  meta: [
    {
      name: 'description',
      content: 'Secure admin login for streaming app management',
    },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
});

// Define page meta
definePageMeta({
  layout: false, // Use no layout for clean login experience
  auth: false, // This page doesn't require authentication
});

const route = useRoute();
const router = useRouter();
const { isAuthenticated } = useAuth();

// Handle successful login
const handleLoginSuccess = async () => {
  logger.log('Login successful, redirecting to admin...');

  // Wait a moment for the authentication state to update
  await nextTick();

  // Verify authentication state is updated
  const { verifyToken, isAuthenticated: authState } = useAuth();
  logger.log('Auth state before verify:', authState.value);

  const verifyResult = await verifyToken();
  logger.log('Verify token result:', verifyResult);
  logger.log('Auth state after verify:', authState.value);

  // Get the redirect URL from query params, default to admin
  const redirectTo = (route.query.redirectTo as string) || '/admin';
  logger.log('Redirecting to:', redirectTo);

  // Navigate to the intended destination
  await router.push(redirectTo);
};

// Redirect if already authenticated
onMounted(() => {
  if (isAuthenticated.value) {
    // If already authenticated, redirect to admin or intended destination
    const redirectTo = (route.query.redirectTo as string) || '/admin';
    navigateTo(redirectTo);
  }
});

// Watch for authentication changes
watch(isAuthenticated, (newAuth) => {
  if (newAuth) {
    const redirectTo = (route.query.redirectTo as string) || '/admin';
    navigateTo(redirectTo);
  }
});
</script>
