/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './nuxt.config.{js,ts}',
    './app/**/*.{js,vue,ts}',
  ],
  theme: {
    extend: {
      aspectRatio: {
        video: '16 / 9',
      },
    },
  },
  plugins: [],
};
