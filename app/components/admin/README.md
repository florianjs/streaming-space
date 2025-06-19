# Admin Components

This folder contains the modular admin components that break down the large admin functionality into smaller, manageable pieces.

## Components Overview

### 1. **AdminHeader.vue**

- Contains the header section with navigation, user info, and logout functionality
- Emits: `logout`
- Props: None (uses `useAuth()` composable directly)

### 2. **AdminTabs.vue**

- Handles tab navigation between videos, analytics, and media sections
- Props: `activeTab` (with v-model support)
- Emits: `update:activeTab`

### 3. **AdminVideoForm.vue**

- Form component for adding and editing videos
- Props: `editingVideoId`, `isSubmitting`, `initialData`
- Emits: `submit`, `reset`
- Features: Form validation, loading states, reactive form binding

### 4. **AdminVideoList.vue**

- Displays and manages the list of videos with edit/delete actions
- Props: `videos`, `editingVideoId`
- Emits: `edit`, `delete`
- Features: Video thumbnails, metadata display, action buttons

### 5. **AdminMediaForm.vue**

- Complex form for adding and editing media files
- Props: `editingMediaId`, `isSubmitting`, `initialData`, `fetchedMovieData`, `posterError`, `isFetchingPoster`
- Emits: `submit`, `reset`, `fill-sample`, `debug-auth`, `test-collection`, `use-poster`
- Features: IMDB integration, file uploads, type-specific fields, debug utilities

### 6. **AdminMediaList.vue**

- Displays and manages media files with thumbnails and metadata
- Props: `media`, `editingMediaId`
- Emits: `edit`, `delete`
- Features: Thumbnail display, type badges, metadata formatting

### 7. **AdminIMDBPosterPreview.vue**

- Displays IMDB movie data and poster preview
- Props: `movieData`, `error`
- Emits: `use-poster`
- Features: Interactive poster selection, movie metadata display

### 8. **AdminAnalytics.vue**

- Analytics dashboard with statistics cards
- Props: `videosCount`, `mediaCount`
- Features: Responsive grid layout, gradient cards, icons

### 9. **AdminMessageToast.vue**

- Toast notification component for success/error messages
- Props: `message`
- Features: Smooth transitions, auto-dismiss, styled notifications

## Benefits of This Structure

1. **Maintainability**: Each component has a single responsibility
2. **Reusability**: Components can be reused in other parts of the application
3. **Testing**: Smaller components are easier to unit test
4. **Code Organization**: Related functionality is grouped together
5. **Performance**: Components can be lazy-loaded if needed
6. **Type Safety**: Strong TypeScript support with proper prop definitions

## Usage in Parent Component

```vue
<template>
  <div>
    <AdminHeader @logout="handleLogout" />
    <AdminTabs v-model:activeTab="activeTab" />

    <AdminVideoForm
      v-if="activeTab === 'videos'"
      :editing-video-id="editingVideoId"
      :is-submitting="isSubmitting"
      :initial-data="formData"
      @submit="handleSubmit"
      @reset="resetForm"
    />

    <AdminMessageToast :message="message" />
  </div>
</template>
```

## File Structure

```
app/components/admin/
├── README.md                     # This file
├── AdminHeader.vue              # Header with navigation and user info
├── AdminTabs.vue                # Tab navigation
├── AdminVideoForm.vue           # Video add/edit form
├── AdminVideoList.vue           # Video list management
├── AdminMediaForm.vue           # Media add/edit form (complex)
├── AdminMediaList.vue           # Media list management
├── AdminIMDBPosterPreview.vue   # IMDB integration component
├── AdminAnalytics.vue           # Analytics dashboard
└── AdminMessageToast.vue        # Notification toast
```

## TypeScript Integration

All components are built with TypeScript and include:

- Proper prop type definitions
- Emit event typing
- Composable integration
- Strong type safety for data flow

## Future Enhancements

- Add more granular permissions handling
- Implement lazy loading for performance
- Add more analytics visualizations
- Create shared design system components
- Add comprehensive test coverage
