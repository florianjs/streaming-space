# PocketBase Schema - Categories System

This document explains the categories system added to your streaming application.

## New Collections

### `categories` Collection

This collection manages media genres/categories.

#### Available fields:

- **`name`** (text, required): Category name (e.g., "Action", "Comedy")
- **`description`** (text, optional): Category description
- **`slug`** (text, optional): URL-friendly version of the name (e.g., "science-fiction")
- **`color`** (text, optional): Hexadecimal color code for the interface (#FF6B35)
- **`icon`** (file, optional): Icon for the category (32x32px recommended)
- **`sort_order`** (number, optional): Display order of categories
- **`active`** (boolean): Whether the category is active/visible

#### Access rules:

- **Read**: Public (all users)
- **Write**: Authenticated users only
- **Delete**: Authenticated users only

### `media` Collection (modified)

The `categories` field has been added to the existing media collection.

#### New field:

- **`categories`** (relation): Relation to the categories collection (up to 5 categories per media)

## Installation

### 1. Import the schema

```bash
# In the PocketBase admin interface:
# Settings > Import collections > Select pb_schema.json
```

### 2. Add default categories (optional)

```sql
-- Execute the content of default_categories.sql in the PocketBase interface
-- or via the REST API
```

## Usage

### Create a new category

```javascript
const record = await pb.collection('categories').create({
  name: 'Thriller',
  description: 'Suspenseful films and series',
  slug: 'thriller',
  color: '#34495E',
  sort_order: 16,
  active: true,
});
```

### Associate categories with media

```javascript
const record = await pb.collection('media').create({
  title: 'My Movie',
  type: 'stream',
  categories: ['cat_action12345', 'cat_thriller123'], // Category IDs
});
```

### Retrieve media with their categories

```javascript
const records = await pb.collection('media').getFullList({
  expand: 'categories',
});

// Access categories:
records.forEach((media) => {
  console.log(media.title);
  media.expand?.categories?.forEach((category) => {
    console.log(`- ${category.name}`);
  });
});
```

### Filter by category

```javascript
// Retrieve all action media
const actionMovies = await pb.collection('media').getFullList({
  filter: 'categories ~ "cat_action12345"',
  expand: 'categories',
});
```

## Admin Interface

In the PocketBase interface, you can:

1. Go to the `categories` collection
2. Add/modify/delete categories
3. Manage display order via `sort_order`
4. Enable/disable categories with the `active` field

## Default categories provided

- Action (#FF6B35)
- Comedy (#FFD23F)
- Drama (#8E44AD)
- Horror (#E74C3C)
- Science Fiction (#3498DB)
- Fantasy (#9B59B6)
- Romance (#E91E63)
- Crime (#34495E)
- Documentary (#27AE60)
- Animation (#F39C12)
- War (#7F8C8D)
- History (#D35400)
- Musical (#16A085)
- Sports (#2ECC71)
- Western (#BDC3C7)

## Usage tips

1. **Consistency**: Use slugs to create clean URLs
2. **Colors**: Color codes enable consistent visual interface
3. **Order**: Use `sort_order` to organize category display
4. **Performance**: Index on categories for fast searches
5. **Flexibility**: A media can have multiple categories (max 5)

## Migration from old system

If you had a simple `category` field in `media`, you will need to:

1. Create records in `categories`
2. Update `media` records with the new relation IDs
3. Remove the old `category` field if necessary
