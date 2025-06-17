// Cache busting utility for MeetSphere
class CacheBuster {
  constructor() {
    this.version = import.meta.env.VITE_APP_VERSION || '1.0.0';
    this.buildTime = Date.now();
    this.sessionId = this.generateSessionId();
  }

  /**
   * Generate a unique session ID
   * @returns {string} - Unique session identifier
   */
  generateSessionId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  /**
   * Get current timestamp for cache busting
   * @returns {number} - Current timestamp
   */
  getTimestamp() {
    return Date.now();
  }

  /**
   * Get version-based cache buster
   * @returns {string} - Version string for cache busting
   */
  getVersionBuster() {
    return `v=${this.version}&t=${this.buildTime}`;
  }

  /**
   * Get session-based cache buster
   * @returns {string} - Session string for cache busting
   */
  getSessionBuster() {
    return `s=${this.sessionId}&t=${this.getTimestamp()}`;
  }

  /**
   * Add cache busting parameters to a URL
   * @param {string} url - Original URL
   * @param {string} type - Type of cache busting ('version', 'session', 'timestamp')
   * @returns {string} - URL with cache busting parameters
   */
  addCacheBuster(url, type = 'version') {
    if (!url) return url;

    const separator = url.includes('?') ? '&' : '?';
    
    let cacheBuster;
    switch (type) {
      case 'session':
        cacheBuster = this.getSessionBuster();
        break;
      case 'timestamp':
        cacheBuster = `t=${this.getTimestamp()}`;
        break;
      case 'version':
      default:
        cacheBuster = this.getVersionBuster();
        break;
    }

    return `${url}${separator}${cacheBuster}`;
  }

  /**
   * Add cache busting to API endpoint
   * @param {string} endpoint - API endpoint
   * @param {boolean} useSession - Whether to use session-based busting
   * @returns {string} - Endpoint with cache busting
   */
  bustApiCache(endpoint, useSession = false) {
    const type = useSession ? 'session' : 'version';
    return this.addCacheBuster(endpoint, type);
  }

  /**
   * Add cache busting to asset URL
   * @param {string} assetUrl - Asset URL
   * @returns {string} - Asset URL with cache busting
   */
  bustAssetCache(assetUrl) {
    return this.addCacheBuster(assetUrl, 'version');
  }

  /**
   * Add cache busting to dynamic imports
   * @param {string} modulePath - Module path for dynamic import
   * @returns {string} - Module path with cache busting
   */
  bustModuleCache(modulePath) {
    return this.addCacheBuster(modulePath, 'timestamp');
  }

  /**
   * Create cache busting headers for fetch requests
   * @param {Object} headers - Existing headers
   * @returns {Object} - Headers with cache busting
   */
  addCacheBustingHeaders(headers = {}) {
    return {
      ...headers,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Cache-Buster': this.getVersionBuster(),
    };
  }

  /**
   * Get cache control headers for different types of requests
   * @param {string} type - Type of request ('api', 'asset', 'page')
   * @returns {Object} - Appropriate cache headers
   */
  getCacheHeaders(type = 'api') {
    const baseHeaders = {
      'X-Version': this.version,
      'X-Session': this.sessionId,
    };

    switch (type) {
      case 'api':
        return {
          ...baseHeaders,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        };
      
      case 'asset':
        return {
          ...baseHeaders,
          'Cache-Control': 'public, max-age=31536000', // 1 year for versioned assets
        };
      
      case 'page':
        return {
          ...baseHeaders,
          'Cache-Control': 'no-cache, must-revalidate',
          'Pragma': 'no-cache',
        };
      
      default:
        return baseHeaders;
    }
  }

  /**
   * Clear browser cache for specific domains (if possible)
   * Note: Limited by browser security, mainly for development
   */
  clearBrowserCache() {
    try {
      // Clear localStorage for the app
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('meetSphere_') || key.startsWith('ms_')) {
          localStorage.removeItem(key);
        }
      });

      // Clear sessionStorage for the app
      const sessionKeys = Object.keys(sessionStorage);
      sessionKeys.forEach(key => {
        if (key.startsWith('meetSphere_') || key.startsWith('ms_')) {
          sessionStorage.removeItem(key);
        }
      });

      console.log('App cache cleared');
    } catch (error) {
      console.warn('Could not clear cache:', error);
    }
  }

  /**
   * Force reload with cache busting
   */
  forceReload() {
    const url = new URL(window.location);
    url.searchParams.set('t', this.getTimestamp());
    window.location.href = url.toString();
  }

  /**
   * Check if cache should be busted based on version
   * @param {string} storedVersion - Previously stored version
   * @returns {boolean} - Whether cache should be busted
   */
  shouldBustCache(storedVersion) {
    return storedVersion !== this.version;
  }

  /**
   * Store current version in localStorage
   */
  storeVersion() {
    try {
      localStorage.setItem('meetSphere_version', this.version);
      localStorage.setItem('meetSphere_buildTime', this.buildTime.toString());
    } catch (error) {
      console.warn('Could not store version info:', error);
    }
  }

  /**
   * Get stored version from localStorage
   * @returns {Object} - Stored version info
   */
  getStoredVersion() {
    try {
      return {
        version: localStorage.getItem('meetSphere_version'),
        buildTime: localStorage.getItem('meetSphere_buildTime'),
      };
    } catch (error) {
      console.warn('Could not retrieve stored version:', error);
      return { version: null, buildTime: null };
    }
  }

  /**
   * Initialize cache busting on app startup
   */
  initialize() {
    const stored = this.getStoredVersion();
    
    if (this.shouldBustCache(stored.version)) {
      console.log('Version changed, clearing cache');
      this.clearBrowserCache();
    }
    
    this.storeVersion();
  }
}

// Create singleton instance
const cacheBuster = new CacheBuster();

export default cacheBuster; 