export default defineNuxtPlugin(() => {
  console.log('WebTorrent plugin initializing...');

  // Only run on client side
  if (process.server) {
    console.log('Running on server side, skipping WebTorrent');
    return;
  }

  // Initialize WebTorrent as a global for better compatibility
  if (process.client && typeof window !== 'undefined') {
    console.log('Client side detected, loading WebTorrent...');
    // Define WebTorrent on window for global access
    (window as any).__WEBTORRENT_AVAILABLE__ = false;

    // Dynamically load WebTorrent
    // @ts-ignore - WebTorrent module handled dynamically
    import('webtorrent')
      .then((module: any) => {
        console.log('WebTorrent module loaded:', module);
        if (module.default) {
          (window as any).__WEBTORRENT_CLASS__ = module.default;
          (window as any).__WEBTORRENT_AVAILABLE__ = true;
          console.log('WebTorrent loaded successfully and available globally');
        } else {
          console.error('WebTorrent module.default is undefined');
          (window as any).__WEBTORRENT_AVAILABLE__ = false;
        }
      })
      .catch((error: any) => {
        console.error('WebTorrent could not be loaded:', error);
        // Still mark as checked but not available
        (window as any).__WEBTORRENT_AVAILABLE__ = false;
      });
  } else {
    console.log('Not in client environment or window undefined');
  }
});
