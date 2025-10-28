import { io } from 'socket.io-client';
import { productionConfig, getServerUrl } from '../config/production';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(userId) {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    // Get server URL with proper protocol detection
    const serverUrl = getServerUrl();
    
    // Use production config for better compatibility
    const connectionOptions = {
      ...productionConfig.socket,
      forceNew: true
    };
    
    this.socket = io(serverUrl, connectionOptions);

    this.socket.on('connect', () => {
      console.log('🔌 Connected to server:', this.socket.id);
      this.isConnected = true;
      
      // Join user's room
      if (userId) {
        this.socket.emit('join', userId);
        console.log('👤 Joined user room:', userId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Disconnected from server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', {
        message: error.message,
        type: error.type,
        description: error.description,
        context: error.context
      });
      this.isConnected = false;
      
      // Handle server errors and transport errors
      if (error.type === 'TransportError' || error.message === 'server error') {
        console.warn('⚠️ Server error detected, will retry with polling only');
        // Retry with polling only as fallback
        setTimeout(() => {
          if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
          }
          this.isConnected = false;
          // Retry connection with polling only
          const serverUrl = getServerUrl();
          const fallbackSocket = io(serverUrl, {
            ...productionConfig.socket,
            transports: ['polling'], // Use polling only as fallback
            forceNew: true
          });
          
          // Setup basic events for fallback socket
          fallbackSocket.on('connect', () => {
            console.log('🔌 Fallback connection established:', fallbackSocket.id);
            this.socket = fallbackSocket;
            this.isConnected = true;
            if (userId) {
              fallbackSocket.emit('join', userId);
            }
          });
          
          fallbackSocket.on('disconnect', () => {
            console.log('🔌 Fallback socket disconnected');
            this.isConnected = false;
          });
          
          fallbackSocket.on('error', (err) => {
            console.error('❌ Fallback socket error:', err);
          });
        }, 3000);
      }
    });
    
    // Handle general errors
    this.socket.on('error', (error) => {
      console.error('❌ Socket error event:', error);
    });

    // Handle reconnection events
    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
      if (userId) {
        this.socket.emit('join', userId);
      }
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('❌ Reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed, falling back to polling only');
      this.isConnected = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('🔌 Socket disconnected');
    }
  }

  // Listen for course enrollment events
  onCourseEnrolled(callback) {
    if (this.socket) {
      this.socket.on('course:enrolled', callback);
    }
  }

  // Remove course enrollment listener
  offCourseEnrolled(callback) {
    if (this.socket) {
      this.socket.off('course:enrolled', callback);
    }
  }

  // Join group chat room
  joinGroup(groupId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-group', groupId);
      console.log('👥 Joined group room:', groupId);
    }
  }

  // Leave group chat room
  leaveGroup(groupId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-group', groupId);
      console.log('👥 Left group room:', groupId);
    }
  }

  // Listen for new group messages
  onNewGroupMessage(callback) {
    if (this.socket) {
      this.socket.on('new-message', callback);
    }
  }

  // Remove new group message listener
  offNewGroupMessage(callback) {
    if (this.socket) {
      this.socket.off('new-message', callback);
    }
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }

  // Check if connected
  isSocketConnected() {
    return this.isConnected;
  }

  // Fallback connection method for production issues
  connectWithFallback(userId) {
    try {
      return this.connect(userId);
    } catch (error) {
      console.error('❌ Primary connection failed, trying fallback...', error);
      
      // Try with polling only
      const serverUrl = getServerUrl();
      const fallbackSocket = io(serverUrl, {
        transports: ['polling'],
        timeout: 30000,
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 2000
      });

      fallbackSocket.on('connect', () => {
        console.log('🔌 Fallback connection established');
        this.socket = fallbackSocket;
        this.isConnected = true;
        if (userId) {
          fallbackSocket.emit('join', userId);
        }
      });

      fallbackSocket.on('connect_error', (error) => {
        console.error('❌ Fallback connection also failed:', error);
        this.isConnected = false;
      });

      return fallbackSocket;
    }
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
