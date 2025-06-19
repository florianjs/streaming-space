<template>
  <!-- Admin dashboard -->
  <div
    :key="user?.id || 'authenticated'"
    class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
  >
    <!-- Header -->
    <AdminHeader @logout="handleLogout" />

    <!-- Tab Navigation -->
    <AdminTabs v-model:activeTab="activeTab" />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Media Management Tab -->
      <div
        v-if="activeTab === 'media'"
        class="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        <!-- Add Media Form -->
        <AdminMediaForm
          :editing-media-id="editingMediaId"
          :is-submitting="isMediaSubmitting"
          :initial-data="mediaFormData"
          :fetched-movie-data="fetchedMovieData"
          :poster-error="posterError"
          :is-fetching-poster="isFetchingPoster"
          @submit="handleMediaSubmit"
          @reset="resetMediaForm"
          @fill-sample="fillWithSampleData"
          @debug-auth="debugAuth"
          @test-collection="testMediaCollection"
          @use-poster="usePosterAsThumbnail"
        />

        <!-- Media Management -->
        <AdminMediaList
          :media="media"
          :editing-media-id="editingMediaId"
          @edit="editMedia"
          @delete="handleDeleteMedia"
        />

        <!-- Media API Demo -->
        <div class="lg:col-span-2">
          <MediaDemo />
        </div>
      </div>

      <!-- Video Management Tab -->
      <div
        v-if="activeTab === 'videos'"
        class="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        <!-- Add Video Form -->
        <AdminVideoForm
          :editing-video-id="editingVideoId"
          :is-submitting="isVideoSubmitting"
          :initial-data="videoFormData"
          @submit="handleVideoSubmit"
          @reset="resetVideoForm"
        />

        <!-- Video Management -->
        <AdminVideoList
          :videos="[...videos]"
          :editing-video-id="editingVideoId"
          @edit="editVideo"
          @delete="handleDeleteVideo"
        />
      </div>

      <!-- Categories Tab -->
      <div
        v-if="activeTab === 'categories'"
        class="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        <!-- Add Category Form -->
        <AdminCategoryForm
          :editing-category-id="editingCategoryId"
          :is-submitting="isCategorySubmitting"
          :initial-data="categoryFormData"
          :categories="categories"
          @submit="handleCategorySubmit"
          @reset="resetCategoryForm"
          @debug-auth="debugAuth"
          @test-connection="testCategoriesConnection"
          @test-minimal-create="testMinimalCategoryCreate"
          @test-auth-context="testAuthContextDebug"
          @check-schema-rules="checkCurrentSchemaRules"
          @test-admin-auth="testAdminAuth"
          @test-schema-application="testSchemaApplicationDebug"
        />

        <!-- Categories Management -->
        <AdminCategoryList
          :categories="[...categories]"
          :editing-category-id="editingCategoryId"
          @edit="editCategory"
          @delete="handleDeleteCategory"
        />
      </div>

      <!-- Analytics Tab -->
      <div v-if="activeTab === 'analytics'" class="space-y-8">
        <AdminAnalytics
          :videos-count="videos.length"
          :media-count="media.length"
          :categories-count="categories.length"
        />

        <!-- Authentication Test Component -->
        <div class="max-w-md">
          <AuthTest />
        </div>
      </div>
    </main>

    <!-- Success/Error Messages -->
    <AdminMessageToast :message="message" />
  </div>
</template>

<script setup lang="ts">
import logger from '../../utils/logger';
import type { Video, VideoForm } from '../composables/useVideos';
import type { Media, MediaForm } from '../composables/useMedia';
import type { OMDBResponse } from '../composables/useOMDB';
import type { Category, CategoryForm } from '../composables/useCategories';

// Set page metadata
useHead({
  title: 'Admin Dashboard - Streaming App',
  meta: [
    {
      name: 'description',
      content: 'Admin dashboard for streaming app management',
    },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
});

// Define page meta
definePageMeta({
  middleware: 'auth', // Use auth middleware
});

interface Message {
  type: 'success' | 'error';
  text: string;
}

// Authentication
const { user, isAuthenticated, logout } = useAuth();

// Composables
const { videos, addVideo, updateVideo, deleteVideo, fetchVideos } = useVideos();
const { media, createMediaRecord, updateMediaRecord, deleteMediaRecord } =
  useMedia();
const { fetchMovieData, isValidIMDBId } = useOMDB();
const {
  categories,
  createCategory,
  fetchCategories,
  updateCategory,
  deleteCategory,
  testConnection,
  testMinimalCreate,
  testAuthContext,
  checkSchemaRules,
  debugCurrentAuth,
  testSchemaApplication,
} = useCategories();

// Tab management
const activeTab = ref<'videos' | 'analytics' | 'media' | 'categories'>('media');

// Video management state
const videoFormData = ref<VideoForm>({
  title: '',
  description: '',
  url: '',
  thumbnail: '',
  duration: '',
});
const isVideoSubmitting = ref(false);
const editingVideoId = ref<string | null>(null);

// Media management state
const mediaFormData = ref<MediaForm>({
  title: '',
  type: 'stream' as 'stream' | 'torrent' | 'iframe',
  imdb: '',
  description: '',
  media_url: '',
  iframe: '',
  thumbnail: null as File | null,
  torrent: null as File | null,
  categories: [],
});
const isMediaSubmitting = ref(false);
const editingMediaId = ref<string | null>(null);

// IMDB poster fetching
const fetchedMovieData = ref<OMDBResponse | null>(null);
const isFetchingPoster = ref(false);
const posterError = ref<string | null>(null);

// Category management state
const categoryFormData = ref<CategoryForm>({
  name: '',
  description: '',
  slug: '',
  color: '#FF6B35',
  icon: null,
  sort_order: 0,
  active: true,
});
const isCategorySubmitting = ref(false);
const editingCategoryId = ref<string | null>(null);

// General
const message = ref<Message | null>(null);

// Initialize data on mount
onMounted(async () => {
  if (isAuthenticated.value) {
    if (videos.value.length === 0) {
      await fetchVideos();
    }
    if (categories.value.length === 0) {
      await fetchCategories();
    }
  }
});

// Watch authentication state changes
watch(
  isAuthenticated,
  async (newAuth) => {
    if (newAuth) {
      if (videos.value.length === 0) {
        await fetchVideos();
      }
      if (categories.value.length === 0) {
        await fetchCategories();
      }
    }
  },
  { immediate: true }
);

// Watch for IMDB ID changes to auto-fetch movie data
watch(
  () => mediaFormData.value.imdb,
  (newImdbId) => {
    fetchedMovieData.value = null;
    posterError.value = null;

    if (newImdbId && newImdbId.length >= 7) {
      setTimeout(() => {
        if (mediaFormData.value.imdb === newImdbId) {
          fetchMovieFromIMDB();
        }
      }, 1000);
    }
  }
);

// Video management methods
const handleVideoSubmit = async (form: VideoForm) => {
  isVideoSubmitting.value = true;

  try {
    if (editingVideoId.value) {
      const updated = await updateVideo(editingVideoId.value, form);
      if (updated) {
        showMessage('success', 'Video updated successfully!');
      } else {
        showMessage('error', 'Failed to update video.');
      }
    } else {
      const newVideo = await addVideo(form);
      if (newVideo) {
        showMessage('success', 'Video added successfully!');
      } else {
        showMessage('error', 'Failed to add video.');
      }
    }

    resetVideoForm();
  } catch (error) {
    console.error('Error managing video:', error);
    showMessage('error', 'An error occurred. Please try again.');
  } finally {
    isVideoSubmitting.value = false;
  }
};

const editVideo = (video: Video) => {
  videoFormData.value = {
    title: video.title,
    description: video.description,
    url: video.url,
    thumbnail: video.thumbnail || '',
    duration: video.duration,
  };

  editingVideoId.value = video.id;
  activeTab.value = 'videos';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleDeleteVideo = async (id: string) => {
  if (confirm('Are you sure you want to delete this video?')) {
    try {
      const success = await deleteVideo(id);
      if (success) {
        showMessage('success', 'Video deleted successfully!');
        if (editingVideoId.value === id) {
          resetVideoForm();
        }
      } else {
        showMessage('error', 'Failed to delete video.');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      showMessage('error', 'An error occurred while deleting the video.');
    }
  }
};

const resetVideoForm = () => {
  videoFormData.value = {
    title: '',
    description: '',
    url: '',
    thumbnail: '',
    duration: '',
  };
  editingVideoId.value = null;
};

// Media management methods
const handleMediaSubmit = async (form: MediaForm) => {
  isMediaSubmitting.value = true;

  try {
    if (editingMediaId.value) {
      const updated = await updateMediaRecord(editingMediaId.value, form);
      if (updated) {
        showMessage('success', 'Media file updated successfully!');
      } else {
        showMessage('error', 'Failed to update media file.');
      }
    } else {
      const created = await createMediaRecord(form);
      if (created) {
        showMessage('success', 'Media file created successfully!');
      } else {
        showMessage('error', 'Failed to create media file.');
      }
    }

    resetMediaForm();
  } catch (error: any) {
    console.error('Media submission error:', error);
    showMessage(
      'error',
      error.message || 'An error occurred. Please try again.'
    );
  } finally {
    isMediaSubmitting.value = false;
  }
};

const editMedia = (mediaItem: Media) => {
  mediaFormData.value = {
    title: mediaItem.title,
    type: mediaItem.type,
    imdb: mediaItem.imdb || '',
    description: mediaItem.description || '',
    media_url: mediaItem.media_url || '',
    iframe: mediaItem.iframe || '',
    thumbnail: null,
    torrent: null,
    categories: mediaItem.categories ? [...mediaItem.categories] : [],
  };

  editingMediaId.value = mediaItem.id;
  activeTab.value = 'media';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleDeleteMedia = async (id: string) => {
  if (confirm('Are you sure you want to delete this media file?')) {
    try {
      const success = await deleteMediaRecord(id);
      if (success) {
        showMessage('success', 'Media file deleted successfully!');
        if (editingMediaId.value === id) {
          resetMediaForm();
        }
      } else {
        showMessage('error', 'Failed to delete media file.');
      }
    } catch (error: any) {
      console.error('Delete media error:', error);
      showMessage('error', error.message || 'Failed to delete media file.');
    }
  }
};

const resetMediaForm = () => {
  mediaFormData.value = {
    title: '',
    type: 'stream',
    imdb: '',
    description: '',
    media_url: '',
    iframe: '',
    thumbnail: null,
    torrent: null,
    categories: [],
  };
  editingMediaId.value = null;

  // Clear IMDB fetched data
  fetchedMovieData.value = null;
  posterError.value = null;
};

// IMDB methods
const fetchMovieFromIMDB = async () => {
  if (!mediaFormData.value.imdb) {
    fetchedMovieData.value = null;
    posterError.value = null;
    return;
  }

  if (
    !isValidIMDBId(mediaFormData.value.imdb) &&
    !isValidIMDBId(`tt${mediaFormData.value.imdb}`)
  ) {
    posterError.value = 'Invalid IMDB ID format. Use format: tt1234567';
    fetchedMovieData.value = null;
    return;
  }

  isFetchingPoster.value = true;
  posterError.value = null;

  try {
    const movieData = await fetchMovieData(mediaFormData.value.imdb);

    if (movieData) {
      fetchedMovieData.value = movieData;

      if (!mediaFormData.value.title) {
        mediaFormData.value.title = movieData.Title;
      }
      if (!mediaFormData.value.description) {
        mediaFormData.value.description = movieData.Plot;
      }

      showMessage('success', `Found: ${movieData.Title} (${movieData.Year})`);
    } else {
      posterError.value = 'Movie not found or API error';
      fetchedMovieData.value = null;
    }
  } catch (error: any) {
    posterError.value = error.message || 'Failed to fetch movie data';
    fetchedMovieData.value = null;
  } finally {
    isFetchingPoster.value = false;
  }
};

const usePosterAsThumbnail = () => {
  if (
    fetchedMovieData.value?.Poster &&
    fetchedMovieData.value.Poster !== 'N/A'
  ) {
    fetch(fetchedMovieData.value.Poster)
      .then((response) => response.blob())
      .then((blob) => {
        const file = new File(
          [blob],
          `${fetchedMovieData.value!.Title}-poster.jpg`,
          { type: 'image/jpeg' }
        );
        mediaFormData.value.thumbnail = file;
        showMessage('success', 'Poster set as thumbnail!');
      })
      .catch((error) => {
        console.error('Error fetching poster image:', error);
        showMessage('error', 'Failed to download poster image');
      });
  }
};

// Sample data for testing
const sampleMovies = [
  {
    description:
      'Big Buck Bunny tells the story of a giant rabbit with a heart bigger than himself.',
    sources: [
      'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    ],
    title: 'Big Buck Bunny',
  },
  {
    description: 'The first Blender Open Movie from 2006',
    sources: [
      'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    ],
    title: 'Elephant Dream',
  },
  // Add more sample movies as needed...
];

const fillWithSampleData = () => {
  const randomMovie =
    sampleMovies[Math.floor(Math.random() * sampleMovies.length)];

  mediaFormData.value = {
    title: randomMovie?.title || '',
    type: 'stream',
    imdb: '',
    description: randomMovie?.description || '',
    media_url: randomMovie?.sources[0] || '',
    iframe: '',
    thumbnail: null,
    torrent: null,
    categories: [],
  };

  showMessage(
    'success',
    `Form filled with "${randomMovie?.title || ''}" (type: stream)`
  );
};

// Debug functions
const debugAuth = () => {
  const token = localStorage.getItem('auth_token');
  const authUser = localStorage.getItem('auth_user');

  // Debug auth state in development only
  if (process.dev) {
    logger.log('🔍 Debug Auth State:');
    logger.log('Token exists:', !!token);
    logger.log('User data:', authUser ? JSON.parse(authUser) : 'None');
    logger.log('isAuthenticated:', isAuthenticated.value);
    logger.log('Current user:', user.value);
  }

  showMessage(
    'success',
    `Auth debug info logged to console. Token: ${token ? 'Present' : 'Missing'}`
  );
};

const testMediaCollection = async () => {
  try {
    const token = localStorage.getItem('auth_token');
    const config = useRuntimeConfig();

    logger.log('🔍 Testing media collection...');

    const response = await fetch(
      `${config.public.baseUrl}/api/collections/media/records?page=1&perPage=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      logger.log('✅ Media collection exists. Sample response:', data);
      showMessage(
        'success',
        'Media collection test successful - check console for details'
      );
    } else {
      const errorText = await response.text();
      console.error(
        '❌ Media collection test failed:',
        response.status,
        errorText
      );

      if (response.status === 404) {
        showMessage('error', 'Media collection does not exist in PocketBase');
      } else {
        showMessage(
          'error',
          `Media collection test failed: ${response.status}`
        );
      }
    }
  } catch (error) {
    console.error('❌ Media collection test error:', error);
    showMessage('error', 'Failed to test media collection');
  }
};

const testCategoriesConnection = async () => {
  try {
    const success = await testConnection();
    if (success) {
      showMessage(
        'success',
        'Categories collection test successful - check console for details'
      );
    } else {
      showMessage(
        'error',
        'Categories collection test failed - check console for details'
      );
    }
  } catch (error) {
    console.error('❌ Categories connection test error:', error);
    showMessage('error', 'Failed to test categories connection');
  }
};

const testMinimalCategoryCreate = async () => {
  try {
    const success = await testMinimalCreate();
    if (success) {
      showMessage(
        'success',
        'Minimal category create test successful - check console for details'
      );
    } else {
      showMessage(
        'error',
        'Minimal category create test failed - check console for details'
      );
    }
  } catch (error) {
    console.error('❌ Minimal category create test error:', error);
    showMessage('error', 'Failed to test minimal category creation');
  }
};

const testAuthContextDebug = async () => {
  try {
    await testAuthContext();
    showMessage(
      'success',
      'Auth context test completed - check console for details'
    );
  } catch (error) {
    console.error('❌ Auth context test error:', error);
    showMessage('error', 'Failed to test auth context');
  }
};

const checkCurrentSchemaRules = async () => {
  try {
    await checkSchemaRules();
    showMessage('success', 'Schema rules checked - see console for details');
  } catch (error) {
    console.error('❌ Schema check error:', error);
    showMessage('error', 'Failed to check schema rules');
  }
};

const testAdminAuth = async () => {
  try {
    await debugCurrentAuth();
    showMessage('success', 'Auth debug completed - see console for details');
  } catch (error) {
    console.error('❌ Auth debug error:', error);
    showMessage('error', 'Failed to debug auth');
  }
};

const testSchemaApplicationDebug = async () => {
  try {
    await testSchemaApplication();
    showMessage(
      'success',
      'Schema application test completed - see console for details'
    );
  } catch (error) {
    console.error('❌ Schema application test error:', error);
    showMessage('error', 'Failed to test schema application');
  }
};

// General methods
const showMessage = (type: 'success' | 'error', text: string) => {
  message.value = { type, text };
  setTimeout(() => {
    message.value = null;
  }, 4000);
};

// Authentication methods
const handleLogout = () => {
  if (confirm('Are you sure you want to sign out?')) {
    navigateTo('/logout');
  }
};

// Category management methods
const handleCategorySubmit = async (form: CategoryForm) => {
  isCategorySubmitting.value = true;

  try {
    if (editingCategoryId.value) {
      const updated = await updateCategory(editingCategoryId.value, form);
      if (updated) {
        showMessage('success', 'Category updated successfully!');
      } else {
        showMessage('error', 'Failed to update category.');
      }
    } else {
      const newCategory = await createCategory(form);
      if (newCategory) {
        showMessage('success', 'Category created successfully!');
      } else {
        showMessage('error', 'Failed to create category.');
      }
    }

    resetCategoryForm();
  } catch (error: any) {
    console.error('Category submission error:', error);
    showMessage(
      'error',
      error.message || 'An error occurred. Please try again.'
    );
  } finally {
    isCategorySubmitting.value = false;
  }
};

const editCategory = (category: Category) => {
  categoryFormData.value = {
    name: category.name,
    description: category.description || '',
    slug: category.slug || '',
    color: category.color || '#FF6B35',
    icon: null, // Reset file input
    sort_order: category.sort_order || 0,
    active: category.active,
  };

  editingCategoryId.value = category.id;
  activeTab.value = 'categories';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleDeleteCategory = async (id: string) => {
  try {
    const success = await deleteCategory(id);
    if (success) {
      showMessage('success', 'Category deleted successfully!');
      if (editingCategoryId.value === id) {
        resetCategoryForm();
      }
    } else {
      showMessage('error', 'Failed to delete category.');
    }
  } catch (error: any) {
    console.error('Delete category error:', error);
    showMessage('error', error.message || 'Failed to delete category.');
  }
};

const resetCategoryForm = () => {
  categoryFormData.value = {
    name: '',
    description: '',
    slug: '',
    color: '#FF6B35',
    icon: null,
    sort_order: 0,
    active: true,
  };
  editingCategoryId.value = null;
};
</script>
