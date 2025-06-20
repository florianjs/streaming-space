// https://nuxt.com/docs/api/configuration/nuxt-config

// Extract domain from PocketBase URL for CSP
const getPocketBaseDomain = () => {
  const baseUrl = process.env.POCKETBASE_PUBLIC_BASE_URL;
  if (!baseUrl) return '';

  try {
    const url = new URL(baseUrl);
    return url.hostname;
  } catch {
    return '';
  }
};

export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: ['@nuxt/fonts', '@nuxt/icon', '@nuxtjs/tailwindcss'],

  // Security headers
  nitro: {
    routeRules: {
      '/**': {
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
          'Content-Security-Policy': (() => {
            const pocketBaseDomain = getPocketBaseDomain();
            const baseCSP =
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'";

            if (pocketBaseDomain) {
              return `${baseCSP}; img-src 'self' data: ${pocketBaseDomain}; connect-src 'self' static.cloudflareinsights.com ${pocketBaseDomain}`;
            } else {
              // Fallback if PocketBase URL is not configured
              return `${baseCSP}; img-src 'self' data: https:; connect-src 'self' static.cloudflareinsights.com`;
            }
          })(),
        },
      },
    },
    // Cloudflare Pages configuration
    cloudflare: {
      pages: {
        routes: {
          exclude: ['/favicon.ico'],
        },
      },
    },
    experimental: {
      wasm: true,
    },
    // Explicitly disable Node.js for better Cloudflare Workers compatibility
    node: false,
  },

  // Video.js and WebTorrent configuration
  vite: {
    optimizeDeps: {
      include: ['video.js'],
      exclude: ['webtorrent'],
    },
    define: {
      global: 'globalThis',
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    },
    server: {
      fs: {
        allow: ['..'],
      },
    },
  },

  build: {
    transpile: ['webtorrent'],
  },

  runtimeConfig: {
    // Private keys (only available on server-side)
    jwtSecret: process.env.JWT_SECRET,
    omdbApiKey: process.env.OMDB_API_KEY,

    public: {
      baseUrl: process.env.POCKETBASE_PUBLIC_BASE_URL,
    },
  },
});
