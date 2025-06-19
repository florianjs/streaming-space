# Contributing to StreamingSpace 🤝

Thank you for your interest in contributing to StreamingSpace! This guide will help you get started with contributing to our modern streaming application built with Nuxt 4 and PocketBase.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Issue Guidelines](#issue-guidelines)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

## 📜 Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. We expect all contributors to:

- Use welcoming and inclusive language
- Respect differing viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js** (v18 or higher)
- **pnpm** (recommended) or npm/yarn
- **Git** for version control
- **PocketBase** backend setup (see main README)
- A code editor with TypeScript support (VS Code recommended)

### First-time Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/StreamingSpace.git
   cd StreamingSpace
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/StreamingSpace.git
   ```
4. **Install dependencies**:
   ```bash
   pnpm install
   ```
5. **Set up environment** (copy `.env.example` to `.env` and configure)
6. **Start development server**:
   ```bash
   pnpm dev
   ```

## 🛠️ Development Setup

### PocketBase Backend

Ensure you have a running PocketBase instance with the imported schema:

1. **Start PocketBase** (see main README for detailed setup)
2. **Import schema** from `schema/pb_schema.json`
3. **Create admin account** if needed
4. **Verify collections** are created: `media`, `categories`, `users`

### Environment Configuration

Create `.env` file with:

```bash
# Required
NUXT_PUBLIC_BASE_URL=http://localhost:8080

# Optional
NUXT_OMDB_API_KEY=your_omdb_api_key
```

### Recommended VS Code Extensions

- **Vetur** or **Vue Language Features (Volar)**
- **TypeScript Vue Plugin**
- **Tailwind CSS IntelliSense**
- **ESLint**
- **Prettier**

## 📁 Project Structure

Understanding the project structure will help you navigate and contribute effectively:

```
StreamingSpace/
├── app/
│   ├── components/          # Vue components
│   │   ├── admin/          # Admin panel components
│   │   └── *.vue           # General components
│   ├── composables/        # Reusable Vue composables
│   ├── pages/              # Nuxt pages (auto-routing)
│   ├── middleware/         # Route middleware
│   └── assets/             # Static assets
├── server/
│   ├── api/               # API endpoints
│   │   ├── auth/          # Authentication endpoints
│   │   ├── media/         # Media management
│   │   ├── categories/    # Category management
│   │   └── videos/        # Video operations
│   └── utils/             # Server utilities
├── schema/                # Database schema and setup
├── types/                 # TypeScript type definitions
└── utils/                 # General utilities
```

## 📝 Coding Standards

### General Principles

- **TypeScript First**: Always use TypeScript over JavaScript
- **Composition API**: Use Vue 3 Composition API for all components
- **Composables**: Extract reusable logic into composables
- **Type Safety**: Maintain strict type checking
- **Accessibility**: Ensure components are accessible (ARIA, semantic HTML)

### Code Style

#### TypeScript/Vue

```typescript
// ✅ Good: Use TypeScript with proper typing
interface MediaItem {
  id: string
  title: string
  type: 'stream' | 'torrent' | 'iframe'
  url: string
}

// ✅ Good: Use Composition API
<script setup lang="ts">
import { ref, computed } from 'vue'

const isLoading = ref(false)
const mediaItems = ref<MediaItem[]>([])

const filteredItems = computed(() =>
  mediaItems.value.filter(item => item.type === 'stream')
)
</script>

// ❌ Bad: Avoid Options API
export default {
  data() {
    return {
      items: []
    }
  }
}
```

#### Component Structure

```vue
<template>
  <!-- Use semantic HTML and proper ARIA labels -->
  <div class="media-grid" role="grid" aria-label="Media items">
    <MediaCard
      v-for="item in mediaItems"
      :key="item.id"
      :media="item"
      @click="handleItemClick"
    />
  </div>
</template>

<script setup lang="ts">
// Imports first
import { ref, computed } from 'vue';
import MediaCard from '~/components/MediaCard.vue';

// Props and emits
interface Props {
  category?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  itemSelected: [item: MediaItem];
}>();

// Composables
const { mediaItems, isLoading } = useMedia();

// Reactive state
const selectedCategory = ref(props.category);

// Computed properties
const filteredItems = computed(() => {
  if (!selectedCategory.value) return mediaItems.value;
  return mediaItems.value.filter(
    (item) => item.category === selectedCategory.value
  );
});

// Methods
const handleItemClick = (item: MediaItem) => {
  emit('itemSelected', item);
};
</script>

<style scoped>
/* Use Tailwind classes primarily, scoped styles for complex cases */
.media-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4;
}
</style>
```

#### API Endpoints

```typescript
// server/api/media/index.get.ts
export default defineEventHandler(async (event) => {
  try {
    // Input validation
    const query = getQuery(event);
    const { category, limit = 20 } = query;

    // Type-safe operations
    const mediaItems = await getMediaItems({
      category: category as string,
      limit: Number(limit),
    });

    return {
      success: true,
      data: mediaItems,
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch media items',
    });
  }
});
```

### Naming Conventions

- **Components**: PascalCase (`MediaCard.vue`, `AdminPanel.vue`)
- **Composables**: camelCase with `use` prefix (`useAuth.ts`, `useMedia.ts`)
- **Pages**: kebab-case (`admin.vue`, `user-profile.vue`)
- **Variables/Functions**: camelCase (`mediaItems`, `handleClick`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_BASE_URL`, `MAX_FILE_SIZE`)
- **Types/Interfaces**: PascalCase (`MediaItem`, `UserProfile`)

### Styling Guidelines

- **Tailwind First**: Use Tailwind utility classes
- **Custom Styles**: Only when necessary, use scoped styles
- **Responsive Design**: Mobile-first approach
- **Accessibility**: Proper color contrast, focus states
- **Glassmorphism**: Maintain design consistency

```vue
<!-- ✅ Good: Tailwind classes -->
<div class="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
  <h2 class="text-xl font-semibold text-white mb-2">Title</h2>
</div>

<!-- ❌ Bad: Inline styles -->
<div style="background: rgba(255,255,255,0.1); padding: 16px;">
```

## 🔄 Making Changes

### Branch Strategy

1. **Create feature branch** from `main`:

   ```bash
   git checkout main
   git pull upstream main
   git checkout -b feature/your-feature-name
   ```

2. **Use descriptive branch names**:
   - `feature/add-video-upload`
   - `fix/auth-token-refresh`
   - `docs/update-api-documentation`
   - `refactor/media-player-component`

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```bash
# Format: type(scope): description
feat(auth): add password reset functionality
fix(player): resolve video loading timeout issue
docs(readme): update installation instructions
refactor(composables): simplify useMedia composable
test(auth): add unit tests for login flow
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run specific test file
pnpm test auth.test.ts
```

### Writing Tests

#### Component Tests

```typescript
// tests/components/MediaCard.test.ts
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import MediaCard from '~/components/MediaCard.vue';

describe('MediaCard', () => {
  it('renders media title correctly', () => {
    const wrapper = mount(MediaCard, {
      props: {
        media: {
          id: '1',
          title: 'Test Movie',
          type: 'stream',
          url: 'https://example.com/video.mp4',
        },
      },
    });

    expect(wrapper.text()).toContain('Test Movie');
  });

  it('emits click event when clicked', async () => {
    const wrapper = mount(MediaCard, {
      props: {
        /* props */
      },
    });

    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeTruthy();
  });
});
```

#### API Tests

```typescript
// tests/api/media.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { setupTest, $fetch } from '@nuxt/test-utils';

describe('/api/media', () => {
  beforeEach(async () => {
    await setupTest({
      // Test configuration
    });
  });

  it('returns media items', async () => {
    const response = await $fetch('/api/media');

    expect(response.success).toBe(true);
    expect(Array.isArray(response.data)).toBe(true);
  });
});
```

### Test Requirements

- **New Features**: Must include tests
- **Bug Fixes**: Should include regression tests
- **Components**: Test props, events, and rendering
- **APIs**: Test success/error cases and validation
- **Composables**: Test reactive behavior and edge cases

## 📤 Submitting Changes

### Before Submitting

1. **Run tests**: `pnpm test`
2. **Check types**: `pnpm type-check`
3. **Lint code**: `pnpm lint`
4. **Update documentation** if needed

### Commit and Push

```bash
# Stage changes
git add .

# Commit with conventional message
git commit -m "feat(media): add video upload functionality"

# Push to your fork
git push origin feature/your-feature-name
```

## 🐛 Issue Guidelines

### Reporting Bugs

Use the bug report template and include:

- **Environment**: OS, Node.js version, browser
- **Steps to reproduce**: Clear, numbered steps
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Screenshots**: If applicable
- **Logs**: Console errors or server logs

### Feature Requests

Use the feature request template and include:

- **Problem description**: What problem does this solve?
- **Proposed solution**: Detailed description
- **Alternatives considered**: Other approaches
- **Additional context**: Use cases, examples

### Labels

- `bug`: Something isn't working
- `enhancement`: New feature or improvement
- `documentation`: Documentation updates
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed
- `question`: Further information requested

## 🔀 Pull Request Process

### PR Requirements

- [ ] **Descriptive title** and description
- [ ] **Linked issue** (fixes #123)
- [ ] **Tests added/updated** for changes
- [ ] **Documentation updated** if needed
- [ ] **No merge conflicts** with main branch
- [ ] **All checks passing** (CI/CD)

### PR Template

```markdown
## Description

Brief description of changes made.

## Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that causes existing functionality to not work as expected)
- [ ] Documentation update

## Testing

- [ ] Tests added/updated
- [ ] All tests passing
- [ ] Manual testing completed

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for hard-to-understand areas
- [ ] Documentation updated
- [ ] No new warnings introduced
```

### Review Process

1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Address feedback** promptly
4. **Approval** required before merge
5. **Squash and merge** for clean history

## 👥 Community

### Getting Help

- **GitHub Discussions**: General questions and ideas
- **Issues**: Bug reports and feature requests
- **Discord/Slack**: Real-time community chat (if available)

### Recognition

Contributors are recognized through:

- **Contributors section** in README
- **Release notes** acknowledgments
- **Special badges** for significant contributions

## 📚 Additional Resources

- [Nuxt 4 Documentation](https://nuxt.com/docs)
- [Vue 3 Composition API](https://vuejs.org/guide/composition-api-introduction.html)
- [PocketBase Documentation](https://pocketbase.io/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 📞 Questions?

If you have questions not covered in this guide:

1. Check existing [GitHub Discussions](../../discussions)
2. Search [Issues](../../issues) for similar questions
3. Create a new discussion or issue
4. Contact maintainers directly for urgent matters

---

**Thank you for contributing to StreamingSpace! 🎬✨**

Your contributions help make this project better for everyone in the community.
