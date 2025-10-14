import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(userId) {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

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
      console.error('❌ Socket connection error:', error);
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
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
