import { io } from "socket.io-client";

let socket = null;

export const initializeSocket = (token) => {
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      if (reason === "io server disconnect") {
        socket.connect();
      }
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error("Socket not initialized. Call initializeSocket first.");
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinRoom = (room) => {
  if (socket) {
    socket.emit("join_room", room);
  }
};

export const leaveRoom = (room) => {
  if (socket) {
    socket.emit("leave_room", room);
  }
};

export const sendMessage = (data) => {
  if (socket) {
    socket.emit("send_message", data);
  }
};

export const startVideoCall = (data) => {
  if (socket) {
    socket.emit("video_call:start", data);
  }
};

export const acceptVideoCall = (data) => {
  if (socket) {
    socket.emit("video_call:accept", data);
  }
};

export const endVideoCall = (data) => {
  if (socket) {
    socket.emit("video_call:end", data);
  }
};

export const shareLocation = (data) => {
  if (socket) {
    socket.emit("share_location", data);
  }
};

export default {
  initializeSocket,
  getSocket,
  disconnectSocket,
  joinRoom,
  leaveRoom,
  sendMessage,
  startVideoCall,
  acceptVideoCall,
  endVideoCall,
  shareLocation,
};
