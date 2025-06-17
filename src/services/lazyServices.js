// Lazy service loader for MeetSphere
class LazyServiceLoader {
  constructor() {
    this.loadedServices = new Map();
    this.loadingPromises = new Map();
  }

  /**
   * Lazy load socket service
   * @returns {Promise<Object>} - Socket service instance
   */
  async loadSocketService() {
    const serviceName = 'socketService';
    
    if (this.loadedServices.has(serviceName)) {
      return this.loadedServices.get(serviceName);
    }

    if (this.loadingPromises.has(serviceName)) {
      return this.loadingPromises.get(serviceName);
    }

    const loadPromise = import('./socketService.js')
      .then(module => {
        const service = module.default;
        this.loadedServices.set(serviceName, service);
        this.loadingPromises.delete(serviceName);
        return service;
      })
      .catch(error => {
        console.error('Failed to load socket service:', error);
        this.loadingPromises.delete(serviceName);
        throw error;
      });

    this.loadingPromises.set(serviceName, loadPromise);
    return loadPromise;
  }

  /**
   * Lazy load WebRTC service
   * @returns {Promise<Object>} - WebRTC service instance
   */
  async loadWebRTCService() {
    const serviceName = 'webrtcService';
    
    if (this.loadedServices.has(serviceName)) {
      return this.loadedServices.get(serviceName);
    }

    if (this.loadingPromises.has(serviceName)) {
      return this.loadingPromises.get(serviceName);
    }

    const loadPromise = import('./webrtcService.js')
      .then(module => {
        const service = module.default;
        this.loadedServices.set(serviceName, service);
        this.loadingPromises.delete(serviceName);
        return service;
      })
      .catch(error => {
        console.error('Failed to load WebRTC service:', error);
        this.loadingPromises.delete(serviceName);
        throw error;
      });

    this.loadingPromises.set(serviceName, loadPromise);
    return loadPromise;
  }

  /**
   * Load both socket and WebRTC services for video calling
   * @returns {Promise<Object>} - Both services
   */
  async loadVideoCallServices() {
    try {
      const [socketService, webrtcService] = await Promise.all([
        this.loadSocketService(),
        this.loadWebRTCService(),
      ]);

      return {
        socketService,
        webrtcService,
      };
    } catch (error) {
      console.error('Failed to load video call services:', error);
      throw error;
    }
  }

  /**
   * Preload services in the background
   * @param {Array<string>} services - List of services to preload
   */
  async preloadServices(services = ['socketService']) {
    const loadPromises = services.map(serviceName => {
      switch (serviceName) {
        case 'socketService':
          return this.loadSocketService().catch(err => 
            console.warn('Failed to preload socket service:', err)
          );
        case 'webrtcService':
          return this.loadWebRTCService().catch(err => 
            console.warn('Failed to preload WebRTC service:', err)
          );
        default:
          console.warn(`Unknown service for preloading: ${serviceName}`);
          return Promise.resolve();
      }
    });

    try {
      await Promise.allSettled(loadPromises);
      console.log('Service preloading completed');
    } catch (error) {
      console.warn('Service preloading failed:', error);
    }
  }

  /**
   * Check if a service is already loaded
   * @param {string} serviceName - Name of the service
   * @returns {boolean} - Whether the service is loaded
   */
  isServiceLoaded(serviceName) {
    return this.loadedServices.has(serviceName);
  }

  /**
   * Get a loaded service (synchronous)
   * @param {string} serviceName - Name of the service
   * @returns {Object|null} - Service instance or null if not loaded
   */
  getLoadedService(serviceName) {
    return this.loadedServices.get(serviceName) || null;
  }

  /**
   * Clear all loaded services (for cleanup)
   */
  clearServices() {
    this.loadedServices.clear();
    this.loadingPromises.clear();
  }

  /**
   * Initialize services based on user authentication status
   * @param {boolean} isAuthenticated - Whether user is authenticated
   */
  async initializeForAuthState(isAuthenticated) {
    if (isAuthenticated) {
      // Preload services that authenticated users might need
      await this.preloadServices(['socketService']);
    } else {
      // Clear services when user logs out
      this.clearServices();
    }
  }
}

// Create singleton instance
const lazyServiceLoader = new LazyServiceLoader();

// Helper functions for easy access
export const loadSocketService = () => lazyServiceLoader.loadSocketService();
export const loadWebRTCService = () => lazyServiceLoader.loadWebRTCService();
export const loadVideoCallServices = () => lazyServiceLoader.loadVideoCallServices();
export const preloadServices = (services) => lazyServiceLoader.preloadServices(services);
export const initializeServicesForAuth = (isAuthenticated) => 
  lazyServiceLoader.initializeForAuthState(isAuthenticated);

export default lazyServiceLoader; 