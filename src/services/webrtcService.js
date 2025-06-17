import socketService from './socketService';

class WebRTCService {
  constructor() {
    this.localStream = null;
    this.screenStream = null;
    this.isScreenSharing = false;
    this.mediaConstraints = {
      video: {
        width: { min: 640, ideal: 1280, max: 1920 },
        height: { min: 480, ideal: 720, max: 1080 },
        frameRate: { min: 15, ideal: 30, max: 60 }
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    };
    this.mediaState = {
      audioEnabled: false,
      videoEnabled: false,
      handRaised: false
    };
  }

  /**
   * Initialize user media (camera and microphone)
   * @param {Object} constraints - Media constraints
   * @returns {Promise<MediaStream>} - Local media stream
   */
  async initializeUserMedia(constraints = this.mediaConstraints) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Set initial media state based on tracks
      this.mediaState = {
        audioEnabled: this.localStream.getAudioTracks().length > 0,
        videoEnabled: this.localStream.getVideoTracks().length > 0,
        handRaised: false
      };

      // Set the stream in socket service
      socketService.setLocalStream(this.localStream);

      // Update backend with initial media state
      socketService.updateMediaState(this.mediaState);

      return this.localStream;
    } catch (error) {
      console.error('Error accessing user media:', error);
      throw new Error(`Failed to access camera/microphone: ${error.message}`);
    }
  }

  /**
   * Start screen sharing
   * @returns {Promise<MediaStream>} - Screen share stream
   */
  async startScreenShare() {
    try {
      const screenConstraints = {
        video: {
          cursor: 'always',
          resizeMode: 'crop-and-scale'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      };

      this.screenStream = await navigator.mediaDevices.getDisplayMedia(screenConstraints);
      
      // Replace video track in existing peer connections
      const videoTrack = this.screenStream.getVideoTracks()[0];
      if (videoTrack) {
        socketService.getPeers().forEach((peer, peerId) => {
          if (peer && !peer.destroyed) {
            const sender = peer._pc?.getSenders?.()?.find(s => 
              s.track && s.track.kind === 'video'
            );
            if (sender) {
              sender.replaceTrack(videoTrack);
            }
          }
        });
      }

      // Listen for screen share end
      videoTrack.onended = () => {
        this.stopScreenShare();
      };

      this.isScreenSharing = true;
      socketService.startScreenShare();

      return this.screenStream;
    } catch (error) {
      console.error('Error starting screen share:', error);
      throw new Error(`Failed to start screen sharing: ${error.message}`);
    }
  }

  /**
   * Stop screen sharing
   */
  async stopScreenShare() {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }

    // Restore camera video track
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        socketService.getPeers().forEach((peer, peerId) => {
          if (peer && !peer.destroyed) {
            const sender = peer._pc?.getSenders?.()?.find(s => 
              s.track && s.track.kind === 'video'
            );
            if (sender) {
              sender.replaceTrack(videoTrack);
            }
          }
        });
      }
    }

    this.isScreenSharing = false;
    socketService.stopScreenShare();
  }

  /**
   * Toggle audio on/off
   * @returns {boolean} - New audio state
   */
  toggleAudio() {
    if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      
      this.mediaState.audioEnabled = audioTracks.length > 0 ? audioTracks[0].enabled : false;
      socketService.updateMediaState({ audioEnabled: this.mediaState.audioEnabled });
      
      return this.mediaState.audioEnabled;
    }
    return false;
  }

  /**
   * Toggle video on/off
   * @returns {boolean} - New video state
   */
  toggleVideo() {
    if (this.localStream) {
      const videoTracks = this.localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      
      this.mediaState.videoEnabled = videoTracks.length > 0 ? videoTracks[0].enabled : false;
      socketService.updateMediaState({ videoEnabled: this.mediaState.videoEnabled });
      
      return this.mediaState.videoEnabled;
    }
    return false;
  }

  /**
   * Toggle hand raised
   * @returns {boolean} - New hand raised state
   */
  toggleHandRaised() {
    this.mediaState.handRaised = !this.mediaState.handRaised;
    socketService.updateMediaState({ handRaised: this.mediaState.handRaised });
    
    return this.mediaState.handRaised;
  }

  /**
   * Set audio enabled state
   * @param {boolean} enabled - Whether audio should be enabled
   */
  setAudioEnabled(enabled) {
    if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = enabled;
      });
      
      this.mediaState.audioEnabled = enabled;
      socketService.updateMediaState({ audioEnabled: enabled });
    }
  }

  /**
   * Set video enabled state
   * @param {boolean} enabled - Whether video should be enabled
   */
  setVideoEnabled(enabled) {
    if (this.localStream) {
      const videoTracks = this.localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = enabled;
      });
      
      this.mediaState.videoEnabled = enabled;
      socketService.updateMediaState({ videoEnabled: enabled });
    }
  }

  /**
   * Change audio input device
   * @param {string} deviceId - Audio input device ID
   */
  async changeAudioInput(deviceId) {
    try {
      const constraints = {
        audio: { deviceId: { exact: deviceId } },
        video: this.mediaState.videoEnabled
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Replace audio track in existing peer connections
      const audioTrack = newStream.getAudioTracks()[0];
      if (audioTrack && this.localStream) {
        socketService.getPeers().forEach((peer, peerId) => {
          if (peer && !peer.destroyed) {
            const sender = peer._pc?.getSenders?.()?.find(s => 
              s.track && s.track.kind === 'audio'
            );
            if (sender) {
              sender.replaceTrack(audioTrack);
            }
          }
        });

        // Stop old audio track
        const oldAudioTracks = this.localStream.getAudioTracks();
        oldAudioTracks.forEach(track => track.stop());

        // Replace audio track in local stream
        this.localStream.removeTrack(oldAudioTracks[0]);
        this.localStream.addTrack(audioTrack);
      }
    } catch (error) {
      console.error('Error changing audio input:', error);
      throw error;
    }
  }

  /**
   * Change video input device
   * @param {string} deviceId - Video input device ID
   */
  async changeVideoInput(deviceId) {
    try {
      const constraints = {
        video: { deviceId: { exact: deviceId } },
        audio: this.mediaState.audioEnabled
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Replace video track in existing peer connections
      const videoTrack = newStream.getVideoTracks()[0];
      if (videoTrack && this.localStream) {
        socketService.getPeers().forEach((peer, peerId) => {
          if (peer && !peer.destroyed) {
            const sender = peer._pc?.getSenders?.()?.find(s => 
              s.track && s.track.kind === 'video'
            );
            if (sender) {
              sender.replaceTrack(videoTrack);
            }
          }
        });

        // Stop old video track
        const oldVideoTracks = this.localStream.getVideoTracks();
        oldVideoTracks.forEach(track => track.stop());

        // Replace video track in local stream
        this.localStream.removeTrack(oldVideoTracks[0]);
        this.localStream.addTrack(videoTrack);
      }
    } catch (error) {
      console.error('Error changing video input:', error);
      throw error;
    }
  }

  /**
   * Get available media devices
   * @returns {Promise<Object>} - Available devices categorized
   */
  async getAvailableDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      return {
        audioInputs: devices.filter(device => device.kind === 'audioinput'),
        audioOutputs: devices.filter(device => device.kind === 'audiooutput'),
        videoInputs: devices.filter(device => device.kind === 'videoinput')
      };
    } catch (error) {
      console.error('Error getting available devices:', error);
      return { audioInputs: [], audioOutputs: [], videoInputs: [] };
    }
  }

  /**
   * Stop all media tracks
   */
  stopAllTracks() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }

    this.mediaState = {
      audioEnabled: false,
      videoEnabled: false,
      handRaised: false
    };
    
    this.isScreenSharing = false;
  }

  /**
   * Get current media state
   * @returns {Object} - Current media state
   */
  getMediaState() {
    return { ...this.mediaState };
  }

  /**
   * Get local stream
   * @returns {MediaStream|null} - Local media stream
   */
  getLocalStream() {
    return this.localStream;
  }

  /**
   * Get screen stream
   * @returns {MediaStream|null} - Screen sharing stream
   */
  getScreenStream() {
    return this.screenStream;
  }

  /**
   * Check if screen sharing is active
   * @returns {boolean} - Screen sharing status
   */
  getScreenSharingStatus() {
    return this.isScreenSharing;
  }

  /**
   * Apply audio/video constraints
   * @param {Object} constraints - New media constraints
   */
  updateMediaConstraints(constraints) {
    this.mediaConstraints = { ...this.mediaConstraints, ...constraints };
  }

  /**
   * Get current media constraints
   * @returns {Object} - Current media constraints
   */
  getMediaConstraints() {
    return { ...this.mediaConstraints };
  }
}

// Create singleton instance
const webrtcService = new WebRTCService();

export default webrtcService; 