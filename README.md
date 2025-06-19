# StreamingSpace 🎬

A modern, full-featured streaming application built with **Nuxt 4** and **PocketBase**. StreamingSpace provides a comprehensive platform for managing and streaming video content with support for multiple media types, user authentication, and a powerful admin panel.

[![Demo](https://img.shields.io/badge/🌐_Live_Demo-onlyghost.com-blue?style=for-the-badge)](https://streaming.florianargaud.com/)
[![Built with Nuxt](https://img.shields.io/badge/Built_with-Nuxt.js-00DC82?style=for-the-badge&logo=nuxt.js)](https://nuxt.com)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/folken)

**🚀 Want to deploy this for your organization or create your own MVP?**  
**📧 Contact me at [FlorianArgaud.com](https://FlorianArgaud.com)**

## ✨ Features

### 🎥 **Media Management**

- **Multi-format Support**: Stream videos via direct URLs, torrents, or embedded iframes
- **Smart Categories**: Organize content with customizable categories and tags
- **IMDB Integration**: Automatic metadata fetching and poster previews
- **Thumbnail Management**: Upload and manage custom thumbnails for all content

### 🛡️ **Authentication & Security**

- **User Authentication**: Secure login/logout with PocketBase auth
- **Admin Panel**: Protected admin interface for content management
- **Role-based Access**: Different permission levels for users and administrators
- **Session Management**: Secure token-based authentication

### 🎨 **Modern Interface**

- **Responsive Design**: Beautiful, mobile-first UI with Tailwind CSS
- **Glassmorphism UI**: Modern design with blur effects and transparency
- **Video Player**: Secure video player with modal interface
- **Search & Filter**: Advanced content discovery features

### 📊 **Analytics & Management**

- **Content Analytics**: Track video performance and user engagement
- **Admin Dashboard**: Comprehensive management interface
- **Bulk Operations**: Efficient content management tools
- **Media Library**: Organized file and torrent management

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm/pnpm/yarn** (package manager)
- **PocketBase** backend (see setup instructions below)

### 1. PocketBase Backend Setup

StreamingSpace requires a PocketBase backend to function. Here's how to set it up:

#### Option A: Using Collify (Recommended)

1. **Install Collify** (PocketBase hosting service):

   ```bash
   # Install Collify CLI
   npm install -g collify-cli

   # Sign up and create a new project
   collify auth login
   collify create my-streaming-app
   ```

2. **Deploy your PocketBase instance**:
   ```bash
   collify deploy
   ```

#### Option B: Self-hosted PocketBase

1. **Download PocketBase**:

   ```bash
   # Download the latest PocketBase binary
   wget https://github.com/pocketbase/pocketbase/releases/latest/download/pocketbase_linux_amd64.zip
   unzip pocketbase_linux_amd64.zip
   ```

2. **Start PocketBase**:
   ```bash
   ./pocketbase serve --http=127.0.0.1:8080
   ```

#### 2. Import Database Schema

**Critical Step**: Import the pre-configured database schema:

1. **Access PocketBase Admin** (usually at `http://localhost:8080/_/` or your Collify URL)

2. **Create Admin Account** (if first time)

3. **Import Schema**:
   - Navigate to **Settings** → **Import collections**
   - Upload the `schema/pb_schema.json` file from this repository
   - Click **Review & Import**
   - Confirm the import

This will create all necessary collections:

- **users**: User authentication and profiles
- **media**: Video content with support for torrents, streams, and iframes
- **categories**: Content organization and filtering
- **\_superusers**: Admin authentication

### 3. Application Setup

1. **Clone the repository**:

   ```bash
   git clone <your-repo-url>
   cd StreamingSpace
   ```

2. **Install dependencies**:

   ```bash
   # Using npm
   npm install

   # Using pnpm (recommended)
   pnpm install

   # Using yarn
   yarn install
   ```

3. **Configure environment variables**:

   ```bash
   # Create .env file
   cp .env.example .env
   ```

   Edit `.env` with your configuration:

   ```bash
   # PocketBase Configuration
   POCKETBASE_PUBLIC_BASE_URL=http://localhost:8080
   # or your Collify URL: https://your-app.collify.io

   # Optional: OMDB API for movie metadata
   NUXT_OMDB_API_KEY=your_omdb_api_key
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

Your application will be available at `http://localhost:3000` 🎉

## 🔧 Configuration

### Environment Variables

| Variable               | Description               | Required | Default                 |
| ---------------------- | ------------------------- | -------- | ----------------------- |
| `NUXT_PUBLIC_BASE_URL` | PocketBase backend URL    | ✅ Yes   | `http://localhost:8080` |
| `NUXT_OMDB_API_KEY`    | OMDB API key for metadata | ❌ No    | -                       |

### PocketBase Collections

The imported schema creates these collections:

- **`media`**: Main content storage

  - Types: `torrent`, `stream`, `iframe`
  - Fields: title, description, IMDB ID, media URL, thumbnail
  - Relations: categories

- **`categories`**: Content organization

  - Fields: name, description, color, icon, sort order
  - Used for filtering and organizing media

- **`users`**: User management
  - Authentication and profile data
  - Avatar support

## 🎯 Usage

### For End Users

1. **Browse Content**: Explore videos by category or search
2. **Watch Videos**: Click any video to open the secure player
3. **User Account**: Sign up/login for personalized experience

### For Administrators

1. **Access Admin Panel**: Navigate to `/admin` (requires authentication)
2. **Manage Media**: Add/edit/delete video content
3. **Organize Categories**: Create and manage content categories
4. **User Management**: View user analytics and manage accounts
5. **Content Analytics**: Track video performance and engagement

### Adding Content

The admin panel supports three types of media:

- **🎬 Stream**: Direct video URLs (MP4, WebM, etc.)
- **🔗 Iframe**: Embedded players (YouTube, Vimeo, etc.)
- **🌊 Torrent**: P2P streaming via WebTorrent

## 🏗️ Development

### Project Structure

```
StreamingSpace/
├── app/
│   ├── components/          # Vue components
│   ├── composables/         # Reusable logic
│   ├── pages/              # Route pages
│   └── middleware/         # Route middleware
├── server/
│   ├── api/               # API endpoints
│   └── utils/             # Server utilities
├── schema/
│   ├── pb_schema.json     # PocketBase schema
│   └── default_categories.sql
└── types/                 # TypeScript definitions
```

### Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Lint code
npm run type-check   # TypeScript checking

# Database
npm run db:setup     # Initialize database (if applicable)
```

### Key Technologies

- **Frontend**: Nuxt 4, Vue 3, TypeScript
- **Styling**: Tailwind CSS, Glassmorphism design
- **Backend**: PocketBase (Go-based backend)
- **Media**: WebTorrent, Video.js
- **Build**: Vite, PostCSS

## 🚀 Deployment

### Frontend Deployment

Deploy to your preferred platform:

```bash
# Build for production
npm run build

# Deploy to Vercel, Netlify, etc.
```

### PocketBase Deployment

- **Collify**: Automatically deployed with CLI
- **Self-hosted**: Deploy PocketBase binary to your server
- **Docker**: Use official PocketBase Docker images

### Environment Setup

Ensure production environment variables are configured:

- Update `NUXT_PUBLIC_BASE_URL` to your production PocketBase URL
- Configure any additional API keys
- Set up proper CORS policies in PocketBase

## 🛠️ Troubleshooting

### Common Issues

**❌ "Connection refused" or CORS errors**

- Verify PocketBase is running and accessible
- Check `NUXT_PUBLIC_BASE_URL` in your `.env` file
- Ensure CORS is configured in PocketBase settings

**❌ "Collection not found" errors**

- Make sure you imported the `schema/pb_schema.json` file
- Verify all collections are created in PocketBase admin

**❌ Authentication issues**

- Check if admin account is created in PocketBase
- Verify auth tokens in browser localStorage
- Clear browser cache/cookies if needed

**❌ Video playback issues**

- Ensure video URLs are accessible and CORS-enabled
- Check network connectivity for torrent streams
- Verify iframe embed permissions

### Getting Help

1. Check the [Issues](../../issues) section
2. Review PocketBase [documentation](https://pocketbase.io/docs/)
3. Check Nuxt 4 [documentation](https://nuxt.com/docs)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **PocketBase** - Amazing backend-as-a-service
- **Nuxt Team** - For the incredible framework
- **WebTorrent** - P2P streaming technology
- **Tailwind CSS** - Utility-first CSS framework

---

**Built with ❤️ using Nuxt 4 and PocketBase**
