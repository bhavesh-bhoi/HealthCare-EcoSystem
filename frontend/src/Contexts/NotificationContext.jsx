import React, { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext.jsx";
import toast from "react-hot-toast";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { token, user } = useAuth();

  useEffect(() => {
    if (token && user) {
      const SOCKET_URL =
        import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

      const newSocket = io(SOCKET_URL, {
        auth: { token },
      });

      newSocket.on("connect", () => {
        console.log("Connected to notification service");
      });

      newSocket.on("notification", (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);

        if (notification.type === "emergency_alert") {
          toast.error(notification.body, {
            duration: 0,
            icon: "🚨",
          });
        } else {
          toast.success(notification.body);
        }
      });

      newSocket.on("appointment_reminder", (data) => {
        toast.custom((t) => (
          <div className="bg-white rounded-xl shadow-hard p-4 border-l-4 border-primary-500">
            <p className="font-semibold">Appointment Reminder</p>
            <p className="text-sm text-secondary-600">{data.message}</p>
          </div>
        ));
      });

      newSocket.on("emergency_alert", (data) => {
        toast.error(`🚨 EMERGENCY: ${data.message}`, {
          duration: 0,
          position: "top-center",
        });
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [token, user]);

  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const value = {
    socket,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
