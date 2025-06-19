<template>
  <div class="secure-video-player-container">
    <!-- Content Protection Overlay -->
    <div
      class="content-protection-overlay"
      @contextmenu.prevent
      @dragstart.prevent
      @selectstart.prevent
    ></div>

    <video
      ref="videoElement"
      :class="[
        'video-js',
        'vjs-default-skin',
        'vjs-big-play-centered',
        playerClass,
      ]"
      :data-setup="{}"
      playsinline
      preload="metadata"
      @contextmenu.prevent="handleRightClick"
      @dragstart.prevent
      @selectstart.prevent
      controlslist="nodownload"
      disablepictureinpicture
    >
      <p class="vjs-no-js">
        To view this video please enable JavaScript, and consider upgrading to a
        web browser that
        <a href="https://videojs.com/html5-video-support/" target="_blank">
          supports HTML5 video </a
        >.
      </p>
    </video>

    <!-- DevTools Detection Warning -->
    <div v-if="devToolsDetected" class="devtools-warning">
      <Icon name="heroicons:exclamation-triangle" class="h-8 w-8" />
      <div class="warning-content">
        <h3>Security Alert</h3>
        <p>Developer tools detected. Video unloaded for content protection.</p>
        <p class="reload-notice">Page will reload in 5 seconds...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import videojs from 'video.js';
import type Player from 'video.js/dist/types/player';
// Import our custom composable

interface Props {
  src: string;
  poster?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  fluid?: boolean;
  responsive?: boolean;
  aspectRatio?: string;
  playbackRates?: number[];
  playerClass?: string;
  contentProtection?: boolean;
  showSecurityNotice?: boolean;
  useProxiedUrl?: boolean;
  unloadOnDevTools?: boolean;
  devToolsCheckInterval?: number;
  sourceType?: 'stream' | 'torrent' | 'iframe';
  torrentFile?: string;
  magnetLink?: string;
}

const props = withDefaults(defineProps<Props>(), {
  poster: '',
  autoplay: false,
  muted: false,
  loop: false,
  fluid: true,
  responsive: true,
  aspectRatio: '16:9',
  playbackRates: () => [0.5, 1, 1.25, 1.5, 2],
  playerClass: 'secure-player',
  contentProtection: true,
  showSecurityNotice: true,
  useProxiedUrl: false,
  unloadOnDevTools: true,
  devToolsCheckInterval: 1000,
  sourceType: 'stream',
});

// WebTorrent integration
const {
  getVideoStreamUrl,
  isSupported: isTorrentSupported,
  isLoading: isTorrentLoading,
  error: torrentError,
  checkSupport,
} = useWebTorrent();

// Torrent state
const torrentStreamUrl = ref<string | null>(null);
const isTorrentReady = ref(false);

// Handle right-click attempts
const handleRightClick = (event: Event) => {
  event.preventDefault();
  emit('right-click-blocked');

  if (props.showSecurityNotice) {
    // Show a brief security message
    console.log('Content protected - right-click disabled');
  }

  return false;
};

// Developer Tools Detection System - Fixed to detect when opened, not closed
const detectDevTools = (): boolean => {
  if (!props.unloadOnDevTools) return false;

  let detected = false;

  // Method 1: Reliable window size detection
  const threshold = 160;
  const heightDiff = window.outerHeight - window.innerHeight;
  const widthDiff = window.outerWidth - window.innerWidth;

  // DevTools typically take up space, making the difference larger
  if (heightDiff > threshold || widthDiff > threshold) {
    detected = true;
  }

  // Method 2: Image object console detection (works when DevTools are open)
  try {
    const img = new Image();
    let devToolsDetected = false;

    Object.defineProperty(img, 'id', {
      get: function () {
        devToolsDetected = true;
        return '';
      },
    });

    // This only triggers the getter if DevTools console is open and active
    console.log(img);

    if (devToolsDetected) {
      detected = true;
    }
  } catch (e) {
    // Ignore
  }

  // Method 3: Check for known DevTools properties
  if ((window as any).devtools && (window as any).devtools.open) {
    detected = true;
  }

  // Method 4: Performance-based detection
  try {
    const start = performance.now();
    // A simple operation that's slower in DevTools
    for (let i = 0; i < 100; i++) {
      console.count && console.count('devtools-check');
    }
    const end = performance.now();

    // Clear the count
    console.countReset && console.countReset('devtools-check');

    // If it took too long, DevTools might be open
    if (end - start > 10) {
      detected = true;
    }
  } catch (e) {
    // Ignore
  }

  return detected;
};

// Unload video when DevTools detected
const unloadVideo = () => {
  if (isVideoUnloaded.value) return;

  console.clear();
  console.log(
    '%c⚠️ SECURITY ALERT ⚠️',
    'color: red; font-size: 24px; font-weight: bold;'
  );
  console.log(
    '%cDeveloper tools detected. Video has been unloaded for content protection.',
    'color: red; font-size: 16px;'
  );
  console.log(
    '%cPlease close developer tools to continue watching.',
    'color: orange; font-size: 14px;'
  );

  // Pause and unload the video
  if (player) {
    try {
      player.pause();
      player.src(''); // Remove source
      player.reset(); // Reset player state
    } catch (error) {
      console.error('Error unloading video:', error);
    }
  }

  // Set unloaded state
  isVideoUnloaded.value = true;
  devToolsDetected.value = true;

  // Emit events
  emit('dev-tools-detected');
  emit('video-unloaded');

  // Optional: Reload page after delay
  setTimeout(() => {
    if (devToolsDetected.value) {
      console.log(
        '%cReloading page due to persistent developer tools access...',
        'color: red;'
      );
      window.location.reload();
    }
  }, 5000);
};

// Start DevTools monitoring
const startDevToolsMonitoring = () => {
  if (!props.unloadOnDevTools || devToolsCheckInterval) return;

  devToolsCheckInterval = setInterval(() => {
    if (detectDevTools() && !isVideoUnloaded.value) {
      unloadVideo();
      // Stop monitoring after detection
      if (devToolsCheckInterval) {
        clearInterval(devToolsCheckInterval);
        devToolsCheckInterval = null;
      }
    }
  }, props.devToolsCheckInterval);
};

// Stop DevTools monitoring
const stopDevToolsMonitoring = () => {
  if (devToolsCheckInterval) {
    clearInterval(devToolsCheckInterval);
    devToolsCheckInterval = null;
  }
};

// Additional content protection measures
const setupContentProtection = () => {
  if (!props.contentProtection) return;

  // Disable common developer tools shortcuts
  const blockDevTools = (e: KeyboardEvent) => {
    // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
      (e.ctrlKey && e.key === 'u')
    ) {
      e.preventDefault();
      return false;
    }
  };

  // Disable text selection on the video container
  const disableSelection = () => {
    if (videoElement.value) {
      videoElement.value.style.userSelect = 'none';
      videoElement.value.style.webkitUserSelect = 'none';
      (videoElement.value.style as any).webkitTouchCallout = 'none';
    }
  };

  document.addEventListener('keydown', blockDevTools);
  disableSelection();

  // Cleanup
  onUnmounted(() => {
    document.removeEventListener('keydown', blockDevTools);
  });
};

// Setup additional player-level protection
const setupPlayerProtection = () => {
  if (!player || !props.contentProtection) return;

  // Hide the tech element's source attribute
  const tech = player.tech();
  if (tech && tech.el_) {
    // Make source harder to find
    Object.defineProperty(tech.el_, 'src', {
      get: () => '[PROTECTED]',
      set: () => {},
      configurable: false,
    });
  }

  // Override player methods that might expose source
  const originalSrc = player.src;
  player.src = () => '[PROTECTED]';
};

const emit = defineEmits<{
  ready: [player: Player];
  play: [];
  pause: [];
  ended: [];
  error: [error: any];
  timeupdate: [currentTime: number];
  loadstart: [];
  canplay: [];
  'right-click-blocked': [];
  'dev-tools-detected': [];
  'video-unloaded': [];
  'torrent-ready': [streamUrl: string];
  'torrent-progress': [progress: number];
}>();

const videoElement = ref<HTMLVideoElement>();
let player: Player | null = null;
let devToolsCheckInterval: NodeJS.Timeout | null = null;
let isVideoUnloaded = ref(false);
let devToolsDetected = ref(false);
let devToolsOpen = ref(false);
let lastWindowHeight = 0;
let lastWindowWidth = 0;

// Secure Video.js configuration
const getPlayerOptions = () => ({
  // Core settings
  fluid: props.fluid,
  responsive: props.responsive,
  aspectRatio: props.aspectRatio,

  // Security & Privacy settings
  techOrder: ['html5'], // Only use HTML5, no Flash fallback
  html5: {
    vhs: {
      // Disable analytics and tracking
      enableLowInitialPlaylist: true,
      smoothQualityChange: true,
      // No external requests for analytics
      xhr: {
        beforeRequest: (options: any) => {
          // Ensure no tracking headers are sent
          if (options.headers) {
            delete options.headers['X-Analytics'];
            delete options.headers['X-Tracking'];
          }
          return options;
        },
      },
    },
  },

  // Performance & UX settings
  preload: 'metadata',
  controls: true,
  playsinline: true,

  // Playback settings
  autoplay: props.autoplay,
  muted: props.muted,
  loop: props.loop,

  // Sources
  sources: [
    {
      src: props.src,
      type: getVideoType(props.src),
    },
  ],

  // Poster
  poster: props.poster,

  // Playback rates for user control
  playbackRates: props.playbackRates,

  // Plugins - only essential, secure ones
  plugins: {
    // No analytics or tracking plugins
  },

  // Error handling
  errorDisplay: true,

  // Language and accessibility
  language: 'en',

  // No external dependencies that could compromise privacy
  liveui: false,
});

// Determine video type based on file extension
function getVideoType(src: string): string {
  const extension = src.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'mp4':
      return 'video/mp4';
    case 'webm':
      return 'video/webm';
    case 'ogg':
      return 'video/ogg';
    case 'm3u8':
      return 'application/x-mpegURL';
    case 'mpd':
      return 'application/dash+xml';
    default:
      return 'video/mp4';
  }
}

// Initialize torrent or regular video source
const initializeVideoSource = async () => {
  if (props.sourceType === 'torrent') {
    // Check WebTorrent support first
    checkSupport();

    if (!isTorrentSupported.value) {
      console.warn('WebTorrent not supported in this browser');
      emit(
        'error',
        new Error(
          'WebTorrent requires a modern browser with WebRTC support. Please try Chrome, Firefox, Safari, or Edge.'
        )
      );
      return;
    }

    try {
      let torrentSource: string | File | null = null;

      // Determine torrent source
      if (props.magnetLink) {
        torrentSource = props.magnetLink;
      } else if (props.torrentFile) {
        // Fetch torrent file if it's a URL
        if (props.torrentFile.startsWith('http')) {
          const response = await fetch(props.torrentFile);
          const blob = await response.blob();
          torrentSource = new File([blob], 'torrent.torrent', {
            type: 'application/x-bittorrent',
          });
        } else {
          torrentSource = props.torrentFile;
        }
      }

      if (!torrentSource) {
        emit('error', new Error('No valid torrent source provided'));
        return;
      }

      // Initialize WebTorrent client if needed
      try {
        await checkSupport();
      } catch (initError) {
        console.error('WebTorrent initialization failed:', initError);
        emit(
          'error',
          new Error(
            'WebTorrent could not be initialized. This browser may not support P2P streaming.'
          )
        );
        return;
      }

      // Get video stream URL from torrent
      const streamUrl = await getVideoStreamUrl(torrentSource);
      torrentStreamUrl.value = streamUrl;
      isTorrentReady.value = true;

      // Update player source with torrent stream
      if (player && streamUrl) {
        player.src([
          {
            src: streamUrl,
            type: 'video/mp4', // Most torrent videos are MP4
          },
        ]);
      }

      emit('torrent-ready', streamUrl);
    } catch (error: any) {
      console.error('Torrent loading error:', error);

      // Provide more user-friendly error messages
      let errorMessage = 'Failed to load torrent';
      if (error.message?.includes('join is not a function')) {
        errorMessage =
          'WebTorrent compatibility issue. This browser may not support P2P streaming.';
      } else if (error.message?.includes('No video files found')) {
        errorMessage = 'No video files found in this torrent.';
      } else if (error.message?.includes('Failed to connect')) {
        errorMessage =
          'Could not connect to torrent peers. Check your network connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      emit('error', new Error(errorMessage));
    }
  }
};

// Initialize player on mount
onMounted(async () => {
  if (videoElement.value) {
    // Import Video.js CSS securely
    if (process.client) {
      import('video.js/dist/video-js.css');
    }

    // Setup content protection
    setupContentProtection();

    // Start DevTools monitoring
    if (process.client) {
      nextTick(() => {
        startDevToolsMonitoring();
      });
    }

    // Check torrent support if needed
    if (props.sourceType === 'torrent') {
      checkSupport();
    }

    try {
      player = videojs(videoElement.value, getPlayerOptions(), async () => {
        // Player is ready
        emit('ready', player!);

        // Setup secure event listeners
        setupEventListeners();

        // Additional content protection after player ready
        setupPlayerProtection();

        // Initialize video source (torrent or regular)
        await initializeVideoSource();
      });

      // Handle errors securely
      player.on('error', (error: any) => {
        console.error('Video player error:', error);
        emit('error', error);
      });
    } catch (error) {
      console.error('Failed to initialize secure video player:', error);
      emit('error', error);
    }
  }
});

// Setup event listeners
function setupEventListeners() {
  if (!player) return;

  player.on('play', () => emit('play'));
  player.on('pause', () => emit('pause'));
  player.on('ended', () => emit('ended'));
  player.on('loadstart', () => emit('loadstart'));
  player.on('canplay', () => emit('canplay'));
  player.on('timeupdate', () => {
    const currentTime = player!.currentTime();
    if (typeof currentTime === 'number') {
      emit('timeupdate', currentTime);
    }
  });
}

// Update source when props change
watch(
  [
    () => props.src,
    () => props.sourceType,
    () => props.torrentFile,
    () => props.magnetLink,
  ],
  async ([newSrc, newSourceType, newTorrentFile, newMagnetLink]) => {
    if (!player) return;

    if (newSourceType === 'torrent') {
      // Reinitialize torrent source
      await initializeVideoSource();
    } else if (newSrc) {
      // Regular stream source
      player.src([
        {
          src: newSrc,
          type: getVideoType(newSrc),
        },
      ]);
    }
  }
);

// Cleanup on unmount
onUnmounted(() => {
  // Stop DevTools monitoring
  stopDevToolsMonitoring();

  if (player) {
    try {
      player.dispose();
      player = null;
    } catch (error) {
      console.error('Error disposing player:', error);
    }
  }
});

// Expose player instance
defineExpose({
  player: computed(() => player),
  play: () => player?.play(),
  pause: () => player?.pause(),
  currentTime: () => player?.currentTime(),
  duration: () => player?.duration(),
  volume: (vol?: number) =>
    vol !== undefined ? player?.volume(vol) : player?.volume(),
  muted: (mute?: boolean) =>
    mute !== undefined ? player?.muted(mute) : player?.muted(),
});
</script>

<style scoped>
.secure-video-player-container {
  width: 100%;
  height: 100%;
  position: relative;
  /* Disable text selection and dragging */
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}

/* Content Protection Overlay */
.content-protection-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  pointer-events: none;
  background: transparent;
}

/* Security Notice */
.security-notice {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
  color: #10b981;
  pointer-events: none;
  backdrop-filter: blur(4px);
}

/* Override Video.js theme for dark mode */
:deep(.video-js) {
  font-family: inherit;
  background-color: #000;
  /* Disable selection on player */
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}

:deep(.video-js .vjs-big-play-button) {
  background-color: rgba(0, 0, 0, 0.7);
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  color: white;
  font-size: 2.5em;
  height: 2em;
  width: 2em;
  line-height: 1.8;
  margin-top: -1em;
  margin-left: -1em;
}

:deep(.video-js .vjs-big-play-button:hover) {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 1);
}

:deep(.video-js .vjs-control-bar) {
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.8) 100%);
  height: 4em;
}

:deep(.video-js .vjs-control:focus) {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}

/* Responsive design */
:deep(.video-js.vjs-fluid) {
  padding-top: 56.25%; /* 16:9 aspect ratio */
}

/* Security indicator */
.secure-video-player-container::before {
  content: '🔒';
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  opacity: 0.7;
  font-size: 12px;
  color: #10b981;
  pointer-events: none;
}

/* Loading state */
:deep(.vjs-waiting .vjs-loading-spinner) {
  border-color: #6366f1 transparent transparent transparent;
}

/* Error state styling */
:deep(.vjs-error .vjs-error-display) {
  background-color: rgba(220, 38, 38, 0.9);
  color: white;
  border-radius: 8px;
  padding: 1rem;
}

/* Hide download controls */
:deep(.video-js video::-webkit-media-controls) {
  display: none !important;
}

:deep(.video-js video::-webkit-media-controls-enclosure) {
  display: none !important;
}

/* Disable right-click on the entire player */
:deep(.video-js) {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Additional protection against saving */
:deep(.video-js video) {
  pointer-events: auto;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
}

/* Disable drag and drop */
:deep(.video-js video) {
  -webkit-user-drag: none;
  -khtml-user-drag: none;
  -moz-user-drag: none;
  -o-user-drag: none;
  user-drag: none;
}

/* DevTools Detection Warning */
.devtools-warning {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  background: rgba(220, 38, 38, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  padding: 2rem;
  animation: alertPulse 2s infinite;
}

.devtools-warning .warning-content h3 {
  font-size: 2rem;
  font-weight: bold;
  margin: 1rem 0;
  color: #fef2f2;
}

.devtools-warning .warning-content p {
  font-size: 1.1rem;
  margin: 0.5rem 0;
  color: #fecaca;
}

.devtools-warning .reload-notice {
  font-size: 0.9rem;
  color: #fbbf24;
  font-weight: bold;
  margin-top: 1rem;
}

@keyframes alertPulse {
  0%,
  100% {
    opacity: 0.95;
  }
  50% {
    opacity: 1;
  }
}
</style>
