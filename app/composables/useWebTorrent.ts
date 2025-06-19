// WebTorrent types are handled dynamically to avoid browser compatibility issues
// @ts-ignore - WebTorrent types handled dynamically

export interface TorrentFile {
  name: string;
  length: number;
  path: string;
  downloadURL?: string;
}

export interface TorrentInfo {
  infoHash: string;
  name: string;
  length: number;
  files: TorrentFile[];
  downloadSpeed: number;
  uploadSpeed: number;
  progress: number;
  numPeers: number;
  downloaded: number;
  uploaded: number;
}

export const useWebTorrent = () => {
  let client: any = null;
  const activeTorrents = ref<Map<string, any>>(new Map());
  const isSupported = ref(false);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Check WebTorrent support
  const checkSupport = () => {
    console.log('Checking WebTorrent support...');
    if (process.client) {
      // Check for WebRTC support
      const hasRTC = !!(
        window.RTCPeerConnection ||
        (window as any).mozRTCPeerConnection ||
        (window as any).webkitRTCPeerConnection
      );
      console.log('WebRTC support detected:', hasRTC);

      // Check if WebTorrent was loaded by plugin
      const wtAvailable = (window as any).__WEBTORRENT_AVAILABLE__;
      console.log('WebTorrent available from plugin:', wtAvailable);

      isSupported.value = hasRTC && wtAvailable;
      console.log('Final WebTorrent support status:', isSupported.value);
    }
    return isSupported.value;
  };

  // Initialize WebTorrent client
  const initializeClient = async () => {
    if (!process.client || client) return client;

    if (!checkSupport()) {
      throw new Error('WebTorrent is not supported in this browser');
    }

    try {
      // Ensure we're in a browser environment
      if (typeof window === 'undefined') {
        throw new Error('WebTorrent requires browser environment');
      }

      // Wait for WebTorrent to be available from the plugin
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max wait

      while (attempts < maxAttempts) {
        if ((window as any).__WEBTORRENT_AVAILABLE__ === true) {
          break;
        }
        if (
          (window as any).__WEBTORRENT_AVAILABLE__ === false &&
          attempts > 10
        ) {
          throw new Error('WebTorrent failed to load in browser');
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }

      const WebTorrent = (window as any).__WEBTORRENT_CLASS__;
      if (!WebTorrent) {
        throw new Error(
          'WebTorrent class not available - browser may not be compatible'
        );
      }

      client = new WebTorrent({
        tracker: {
          rtcConfig: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:global.stun.twilio.com:3478' },
            ],
          },
        },
      });

      client.on('error', (err: any) => {
        console.error('WebTorrent client error:', err);
        error.value = err instanceof Error ? err.message : String(err);
      });

      return client;
    } catch (err: any) {
      console.error('Failed to initialize WebTorrent:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      error.value = `Failed to initialize WebTorrent: ${errorMessage}`;

      // Provide user-friendly error messages
      if (
        errorMessage.includes('join is not a function') ||
        errorMessage.includes('failed to load')
      ) {
        error.value =
          'WebTorrent is not compatible with this browser. Please try Chrome, Firefox, Safari, or Edge.';
      } else if (
        errorMessage.includes('not supported') ||
        errorMessage.includes('not available')
      ) {
        error.value =
          'This browser does not support WebRTC, which is required for torrent streaming.';
      }

      throw new Error(error.value);
    }
  };

  // Add torrent and get video file
  const addTorrent = async (
    torrentId: string | File,
    options?: {
      priority?: number[];
      maxWebConns?: number;
    }
  ): Promise<{ videoFile: TorrentFile; torrentInfo: TorrentInfo } | null> => {
    if (!client) {
      await initializeClient();
    }

    if (!client) {
      throw new Error('WebTorrent client not available');
    }

    isLoading.value = true;
    error.value = null;

    return new Promise((resolve, reject) => {
      try {
        const torrent = client.add(torrentId, {
          maxWebConns: options?.maxWebConns || 4,
          ...options,
        });

        torrent.on('ready', () => {
          console.log('Torrent ready:', torrent.name);

          // Find the largest video file
          const videoFile = torrent.files
            .filter((file: any) => isVideoFile(file.name))
            .sort((a: any, b: any) => b.length - a.length)[0];

          if (!videoFile) {
            reject(new Error('No video files found in torrent'));
            return;
          }

          // Store active torrent
          activeTorrents.value.set(torrent.infoHash, torrent);

          const torrentInfo: TorrentInfo = {
            infoHash: torrent.infoHash,
            name: torrent.name || 'Unknown',
            length: torrent.length,
            files: torrent.files.map((f: any) => ({
              name: f.name,
              length: f.length,
              path: f.path,
            })),
            downloadSpeed: 0,
            uploadSpeed: 0,
            progress: 0,
            numPeers: 0,
            downloaded: 0,
            uploaded: 0,
          };

          const transformedVideoFile: TorrentFile = {
            name: videoFile.name,
            length: videoFile.length,
            path: videoFile.path,
          };

          resolve({
            videoFile: transformedVideoFile,
            torrentInfo,
          });
        });

        torrent.on('error', (err: any) => {
          console.error('Torrent error:', err);
          reject(
            new Error(
              `Torrent error: ${
                err instanceof Error ? err.message : String(err)
              }`
            )
          );
        });

        torrent.on('download', () => {
          // Update progress can be handled by components
        });
      } catch (err: any) {
        reject(
          new Error(
            `Failed to add torrent: ${
              err instanceof Error ? err.message : String(err)
            }`
          )
        );
      } finally {
        isLoading.value = false;
      }
    });
  };

  // Get video stream URL from torrent file
  const getVideoStreamUrl = async (
    torrentId: string | File,
    fileIndex?: number
  ): Promise<string> => {
    const result = await addTorrent(torrentId);
    if (!result) {
      throw new Error('Failed to add torrent');
    }

    const { videoFile } = result;
    const torrent = activeTorrents.value.get(result.torrentInfo.infoHash);

    if (!torrent) {
      throw new Error('Torrent not found');
    }

    // Find the video file in torrent
    const file = torrent.files.find((f: any) => f.name === videoFile.name);
    if (!file) {
      throw new Error('Video file not found in torrent');
    }

    // Create blob URL for the video file
    return new Promise((resolve, reject) => {
      file.getBlobURL((err: Error | null, url: string) => {
        if (err) {
          reject(new Error(`Failed to create blob URL: ${err.message}`));
        } else {
          resolve(url);
        }
      });
    });
  };

  // Get torrent info
  const getTorrentInfo = (infoHash: string): TorrentInfo | null => {
    const torrent = activeTorrents.value.get(infoHash);
    if (!torrent) return null;

    return {
      infoHash: torrent.infoHash,
      name: torrent.name || 'Unknown',
      length: torrent.length,
      files: torrent.files.map((f: any) => ({
        name: f.name,
        length: f.length,
        path: f.path,
      })),
      downloadSpeed: torrent.downloadSpeed,
      uploadSpeed: torrent.uploadSpeed,
      progress: torrent.progress,
      numPeers: torrent.numPeers,
      downloaded: torrent.downloaded,
      uploaded: torrent.uploaded,
    };
  };

  // Remove torrent
  const removeTorrent = (infoHash: string) => {
    const torrent = activeTorrents.value.get(infoHash);
    if (torrent && client) {
      client.remove(torrent);
      activeTorrents.value.delete(infoHash);
    }
  };

  // Destroy client and cleanup
  const destroy = () => {
    if (client) {
      client.destroy();
      client = null;
    }
    activeTorrents.value.clear();
  };

  // Helper function to check if file is a video
  const isVideoFile = (filename: string): boolean => {
    const videoExtensions = [
      '.mp4',
      '.avi',
      '.mkv',
      '.mov',
      '.wmv',
      '.flv',
      '.webm',
      '.m4v',
      '.3gp',
      '.ogv',
    ];
    return videoExtensions.some((ext) => filename.toLowerCase().endsWith(ext));
  };

  // Cleanup on unmount
  if (process.client) {
    onBeforeUnmount(() => {
      destroy();
    });
  }

  return {
    // State
    isSupported: readonly(isSupported),
    isLoading: readonly(isLoading),
    error: readonly(error),
    activeTorrents: readonly(activeTorrents),

    // Methods
    checkSupport,
    initializeClient,
    addTorrent,
    getVideoStreamUrl,
    getTorrentInfo,
    removeTorrent,
    destroy,
    isVideoFile,
  };
};
