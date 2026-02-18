import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

let io;

export const initializeSocket = (socketIO) => {
  io = socketIO;

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      socket.userId = user._id.toString();
      socket.userRole = user.role;

      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`🔌 New connection: ${socket.id} (${socket.userRole})`);

    // Join role-specific room
    socket.join(`user_${socket.userId}`);
    socket.join(`role_${socket.userRole}`);

    if (socket.userRole === "doctor") {
      socket.join(`doctor_${socket.userId}`);
    } else if (socket.userRole === "patient") {
      socket.join(`patient_${socket.userId}`);
    } else if (socket.userRole === "pharmacy") {
      socket.join(`pharmacy_${socket.userId}`);
    }

    // Handle joining specific rooms
    socket.on("join_appointment", (appointmentId) => {
      socket.join(`appointment_${appointmentId}`);
      console.log(`User ${socket.userId} joined appointment ${appointmentId}`);
    });

    socket.on("leave_appointment", (appointmentId) => {
      socket.leave(`appointment_${appointmentId}`);
      console.log(`User ${socket.userId} left appointment ${appointmentId}`);
    });

    // Handle video call signaling
    socket.on("video_call:offer", (data) => {
      io.to(`appointment_${data.appointmentId}`).emit("video_call:offer", {
        offer: data.offer,
        from: socket.userId,
      });
    });

    socket.on("video_call:answer", (data) => {
      io.to(`appointment_${data.appointmentId}`).emit("video_call:answer", {
        answer: data.answer,
        from: socket.userId,
      });
    });

    socket.on("video_call:ice-candidate", (data) => {
      io.to(`appointment_${data.appointmentId}`).emit(
        "video_call:ice-candidate",
        {
          candidate: data.candidate,
          from: socket.userId,
        },
      );
    });

    socket.on("video_call:end", (appointmentId) => {
      io.to(`appointment_${appointmentId}`).emit("video_call:ended", {
        from: socket.userId,
      });
    });

    // Handle chat messages
    socket.on("send_message", (data) => {
      const message = {
        id: Date.now().toString(),
        from: socket.userId,
        fromName: socket.user.name,
        fromRole: socket.userRole,
        message: data.message,
        timestamp: new Date().toISOString(),
      };

      if (data.appointmentId) {
        // Save message to database (implement if needed)
        io.to(`appointment_${data.appointmentId}`).emit("new_message", message);
      } else if (data.to) {
        io.to(`user_${data.to}`).emit("new_message", message);
      }
    });

    // Handle typing indicators
    socket.on("typing", (data) => {
      if (data.appointmentId) {
        socket.to(`appointment_${data.appointmentId}`).emit("user_typing", {
          from: socket.userId,
          fromName: socket.user.name,
          isTyping: data.isTyping,
        });
      }
    });

    // Handle read receipts
    socket.on("message_read", (data) => {
      // Implement read receipt logic
    });

    // Handle location sharing (for emergency)
    socket.on("share_location", (data) => {
      if (data.isEmergency) {
        // Broadcast to nearby doctors
        io.to("role_doctor").emit("emergency_location", {
          patientId: socket.userId,
          patientName: socket.user.name,
          location: data.location,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`🔌 Disconnected: ${socket.id}`);

      // Notify relevant parties
      if (socket.currentAppointment) {
        io.to(`appointment_${socket.currentAppointment}`).emit(
          "user_disconnected",
          {
            userId: socket.userId,
          },
        );
      }
    });
  });

  return io;
};

// Utility functions to emit events
export const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user_${userId}`).emit(event, data);
  }
};

export const emitToRole = (role, event, data) => {
  if (io) {
    io.to(`role_${role}`).emit(event, data);
  }
};

export const emitToAppointment = (appointmentId, event, data) => {
  if (io) {
    io.to(`appointment_${appointmentId}`).emit(event, data);
  }
};

export const emitToDoctor = (doctorId, event, data) => {
  if (io) {
    io.to(`doctor_${doctorId}`).emit(event, data);
  }
};

export const emitToPatient = (patientId, event, data) => {
  if (io) {
    io.to(`patient_${patientId}`).emit(event, data);
  }
};

export const emitToPharmacy = (pharmacyId, event, data) => {
  if (io) {
    io.to(`pharmacy_${pharmacyId}`).emit(event, data);
  }
};

export const broadcastToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
