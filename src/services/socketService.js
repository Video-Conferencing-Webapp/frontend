import { io } from 'socket.io-client';
import SimplePeer from 'simple-peer/simplepeer.min.js';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.eventListeners = new Map();
    this.currentRoom = null;
    this.currentUser = null;
    this.peerId = null;
    this.peers = new Map(); // Store SimplePeer instances
    this.localStream = null;
    this.remoteStreams = new Map();
    this.iceServers = [];
    this.isHost = false;
  }

  /**
   * Initialize socket connection
   * @param {Object} user - Current user information
   * @param {string} token - Authentication token
   */
  connect(user, token) {
    const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8000';
    
    if (this.socket) {
      this.disconnect();
    }

    this.currentUser = user;
    this.peerId = `${user.id}_${Date.now()}`; // Generate unique peer ID
    
    this.socket = io(WS_URL, {
      auth: {
        token: token,
        user: user
      },
      transports: ['websocket'],
      upgrade: true
    });

    this.setupEventListeners();
  }

  /**
   * Setup default socket event listeners to match backend
   */
  setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', this.handleConnect.bind(this));
    this.socket.on('disconnect', this.handleDisconnect.bind(this));
    this.socket.on('connect_error', this.handleConnectError.bind(this));
    this.socket.on('connected', this.handleConnected.bind(this));

    // Room events (matching backend exactly)
    this.socket.on('peer_joined', this.handlePeerJoined.bind(this));
    this.socket.on('peer_left', this.handlePeerLeft.bind(this));
    this.socket.on('peer_disconnected', this.handlePeerDisconnected.bind(this));

    // WebRTC signaling events (matching backend)
    this.socket.on('signal', this.handleSignal.bind(this));

    // Screen sharing events (matching backend)
    this.socket.on('screen_share_started', this.handleScreenShareStarted.bind(this));
    this.socket.on('screen_share_stopped', this.handleScreenShareStopped.bind(this));

    // Remote control events (matching backend)
    this.socket.on('remote_control_requested', this.handleRemoteControlRequested.bind(this));
    this.socket.on('remote_control_response', this.handleRemoteControlResponse.bind(this));
    this.socket.on('remote_control_event', this.handleRemoteControlEvent.bind(this));

    // Chat events (matching backend)
    this.socket.on('chat_message', this.handleChatMessage.bind(this));

    // Media state events (matching backend)
    this.socket.on('media_state_updated', this.handleMediaStateUpdated.bind(this));
  }

  /**
   * Disconnect from socket
   */
  disconnect() {
    // Clean up all peer connections
    this.peers.forEach((peer, peerId) => {
      peer.destroy();
    });
    this.peers.clear();
    this.remoteStreams.clear();

    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.currentRoom = null;
    this.eventListeners.clear();
    this.iceServers = [];
    this.isHost = false;
  }

  /**
   * Join a room (matching backend structure)
   * @param {string} roomId - Room ID to join
   * @param {Object} userData - User data
   */
  async joinRoom(roomId, userData = {}) {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected');
      return null;
    }

    return new Promise((resolve, reject) => {
      this.socket.emit('join_room', {
        roomId: roomId,
        peerId: this.peerId,
        userData: {
          ...userData,
          ...this.currentUser,
          audioEnabled: false,
          videoEnabled: false,
          handRaised: false
        }
      }, (response) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          this.currentRoom = roomId;
          this.iceServers = response.iceServers || [];
          this.isHost = response.roomHostId === this.peerId;
          resolve(response);
        }
      });
    });
  }

  /**
   * Leave current room (matching backend structure)
   */
  leaveRoom() {
    if (!this.socket || !this.isConnected || !this.currentRoom) {
      return;
    }

    // Clean up peer connections
    this.peers.forEach((peer, peerId) => {
      peer.destroy();
    });
    this.peers.clear();
    this.remoteStreams.clear();

    this.socket.emit('leave_room', {
      peerId: this.peerId
    });

    this.currentRoom = null;
    this.isHost = false;
  }

  /**
   * Create peer connection using SimplePeer
   * @param {string} peerId - Target peer ID
   * @param {boolean} initiator - Whether this peer initiates the connection
   * @param {MediaStream} stream - Local media stream
   */
  createPeerConnection(peerId, initiator = false, stream = null) {
    const peer = new SimplePeer({
      initiator: initiator,
      trickle: false,
      config: {
        iceServers: this.iceServers
      },
      stream: stream || this.localStream
    });

    peer.on('signal', (data) => {
      this.socket.emit('signal', {
        from: this.peerId,
        to: peerId,
        signal: data
      });
    });

    peer.on('stream', (remoteStream) => {
      this.remoteStreams.set(peerId, remoteStream);
      this.emit('remoteStream', { peerId, stream: remoteStream });
    });

    peer.on('connect', () => {
      console.log('Peer connection established with', peerId);
      this.emit('peerConnected', { peerId });
    });

    peer.on('close', () => {
      console.log('Peer connection closed with', peerId);
      this.remoteStreams.delete(peerId);
      this.emit('peerDisconnected', { peerId });
    });

    peer.on('error', (error) => {
      console.error('Peer connection error with', peerId, error);
      this.emit('peerError', { peerId, error });
    });

    this.peers.set(peerId, peer);
    return peer;
  }

  /**
   * Send chat message (matching backend structure)
   * @param {string} message - Message content
   * @param {string} messageType - Message type
   */
  sendChatMessage(message, messageType = 'text') {
    if (!this.socket || !this.isConnected || !this.currentRoom) return;

    const messageData = {
      roomId: this.currentRoom,
      userId: this.peerId,
      message: message,
      messageType: messageType,
      timestamp: new Date().toISOString(),
      userData: this.currentUser
    };

    this.socket.emit('send_chat_message', messageData);
  }

  /**
   * Update media state (matching backend structure)
   * @param {Object} mediaState - Media state object
   */
  updateMediaState(mediaState) {
    if (!this.socket || !this.isConnected || !this.currentRoom) return;

    this.socket.emit('update_media_state', {
      peerId: this.peerId,
      mediaState: mediaState
    });
  }

  /**
   * Start screen sharing (matching backend structure)
   */
  startScreenShare() {
    if (!this.socket || !this.isConnected || !this.currentRoom) return;

    this.socket.emit('start_screen_share', {
      peerId: this.peerId
    });
  }

  /**
   * Stop screen sharing (matching backend structure)
   */
  stopScreenShare() {
    if (!this.socket || !this.isConnected || !this.currentRoom) return;

    this.socket.emit('stop_screen_share', {
      peerId: this.peerId
    });
  }

  /**
   * Request remote control (matching backend structure)
   * @param {string} targetId - Target peer ID
   */
  requestRemoteControl(targetId) {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('request_remote_control', {
      requesterId: this.peerId,
      targetId: targetId
    });
  }

  /**
   * Respond to remote control request (matching backend structure)
   * @param {string} requesterId - Requester peer ID
   * @param {boolean} granted - Whether to grant access
   */
  respondToRemoteControl(requesterId, granted) {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('remote_control_response', {
      requesterId: requesterId,
      granted: granted
    });
  }

  /**
   * Send remote control event (matching backend structure)
   * @param {string} targetId - Target peer ID
   * @param {string} eventType - Event type
   * @param {Object} eventData - Event data
   */
  sendRemoteControlEvent(targetId, eventType, eventData) {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('remote_control_event', {
      targetId: targetId,
      type: eventType,
      data: eventData
    });
  }

  /**
   * Register custom event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback to remove
   */
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }

    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit custom event to local listeners
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  // ==================== EVENT HANDLERS (MATCHING BACKEND) ====================

  handleConnect() {
    console.log('Socket connected');
    this.isConnected = true;
    this.reconnectAttempts = 0;
  }

  handleConnected(data) {
    console.log('Connected with SID:', data.sid);
  }

  handleDisconnect(reason) {
    console.log('Socket disconnected:', reason);
    this.isConnected = false;
  }

  handleConnectError(error) {
    console.error('Socket connection error:', error);
    this.isConnected = false;
  }

  handlePeerJoined(data) {
    console.log('Peer joined:', data);
    const { peerId, userData } = data;
    
    // Create peer connection as initiator if we're already in the room
    if (this.currentRoom && peerId !== this.peerId) {
      this.createPeerConnection(peerId, true);
    }
    
    this.emit('peerJoined', data);
  }

  handlePeerLeft(data) {
    console.log('Peer left:', data);
    const { peerId } = data;
    
    // Clean up peer connection
    if (this.peers.has(peerId)) {
      this.peers.get(peerId).destroy();
      this.peers.delete(peerId);
    }
    this.remoteStreams.delete(peerId);
    
    this.emit('peerLeft', data);
  }

  handlePeerDisconnected(data) {
    console.log('Peer disconnected:', data);
    this.handlePeerLeft(data); // Same cleanup as peer left
  }

  handleSignal(data) {
    console.log('Received signal:', data);
    const { from, signal } = data;
    
    let peer = this.peers.get(from);
    if (!peer) {
      // Create peer connection as non-initiator
      peer = this.createPeerConnection(from, false);
    }
    
    peer.signal(signal);
  }

  handleChatMessage(data) {
    console.log('Received chat message:', data);
    this.emit('chatMessage', data);
  }

  handleMediaStateUpdated(data) {
    console.log('Media state updated:', data);
    this.emit('mediaStateUpdated', data);
  }

  handleScreenShareStarted(data) {
    console.log('Screen share started:', data);
    this.emit('screenShareStarted', data);
  }

  handleScreenShareStopped(data) {
    console.log('Screen share stopped:', data);
    this.emit('screenShareStopped', data);
  }

  handleRemoteControlRequested(data) {
    console.log('Remote control requested:', data);
    this.emit('remoteControlRequested', data);
  }

  handleRemoteControlResponse(data) {
    console.log('Remote control response:', data);
    this.emit('remoteControlResponse', data);
  }

  handleRemoteControlEvent(data) {
    console.log('Remote control event:', data);
    this.emit('remoteControlEvent', data);
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get connection status
   * @returns {boolean} - Connection status
   */
  getConnectionStatus() {
    return this.isConnected;
  }

  /**
   * Get current room
   * @returns {string|null} - Current room ID
   */
  getCurrentRoom() {
    return this.currentRoom;
  }

  /**
   * Get current user
   * @returns {Object|null} - Current user object
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Get peer ID
   * @returns {string|null} - Current peer ID
   */
  getPeerId() {
    return this.peerId;
  }

  /**
   * Get socket instance
   * @returns {Socket|null} - Socket.IO instance
   */
  getSocket() {
    return this.socket;
  }

  /**
   * Get all peer connections
   * @returns {Map} - Map of peer connections
   */
  getPeers() {
    return this.peers;
  }

  /**
   * Get remote streams
   * @returns {Map} - Map of remote streams
   */
  getRemoteStreams() {
    return this.remoteStreams;
  }

  /**
   * Set local stream
   * @param {MediaStream} stream - Local media stream
   */
  setLocalStream(stream) {
    this.localStream = stream;
    
    // Update existing peer connections with new stream
    this.peers.forEach((peer, peerId) => {
      if (peer && !peer.destroyed) {
        peer.replaceTrack(
          peer.streams?.[0]?.getVideoTracks()?.[0],
          stream.getVideoTracks()?.[0],
          peer.streams?.[0]
        );
        peer.replaceTrack(
          peer.streams?.[0]?.getAudioTracks()?.[0],
          stream.getAudioTracks()?.[0],
          peer.streams?.[0]
        );
      }
    });
  }

  /**
   * Get local stream
   * @returns {MediaStream|null} - Local media stream
   */
  getLocalStream() {
    return this.localStream;
  }

  /**
   * Check if current user is host
   * @returns {boolean} - Whether current user is host
   */
  isRoomHost() {
    return this.isHost;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService; 