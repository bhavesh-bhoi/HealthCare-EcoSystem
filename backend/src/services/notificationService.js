import emailService from "./emailService.js";
import smsService from "./smsService.js";
import { emitToUser, emitToRole } from "./socketService.js";
import { User } from "../models/User.js";

class NotificationService {
  async sendNotification({ userId, type, data, channels = ["push"] }) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const notifications = [];

      // Send via requested channels
      if (channels.includes("email") && user.email) {
        notifications.push(this.sendEmail(user, type, data));
      }

      if (channels.includes("sms") && user.phone) {
        notifications.push(this.sendSMS(user, type, data));
      }

      if (channels.includes("push")) {
        notifications.push(this.sendPushNotification(user, type, data));
      }

      await Promise.all(notifications);

      return { success: true, channels: channels };
    } catch (error) {
      console.error("Error sending notification:", error);
      throw error;
    }
  }

  async sendEmail(user, type, data) {
    const emailData = {
      to: user.email,
      subject: this.getEmailSubject(type),
      template: this.getEmailTemplate(type),
      data: {
        name: user.name,
        ...data,
      },
    };

    return emailService.sendEmail(emailData);
  }

  async sendSMS(user, type, data) {
    const message = this.getSMSMessage(type, data);
    return smsService.sendSMS({
      to: user.phone,
      message,
    });
  }

  async sendPushNotification(user, type, data) {
    const notification = {
      type,
      title: this.getPushTitle(type),
      body: this.getPushBody(type, data),
      data,
      timestamp: new Date().toISOString(),
    };

    // Emit via socket
    emitToUser(user._id, "notification", notification);

    return notification;
  }

  async broadcastToRole(role, type, data) {
    const notification = {
      type,
      title: this.getPushTitle(type),
      body: this.getPushBody(type, data),
      data,
      timestamp: new Date().toISOString(),
    };

    emitToRole(role, "notification", notification);
  }

  getEmailSubject(type) {
    const subjects = {
      appointment_booked: "Appointment Confirmed",
      appointment_reminder: "Appointment Reminder",
      appointment_cancelled: "Appointment Cancelled",
      prescription_added: "New Prescription Added",
      order_confirmed: "Order Confirmed",
      order_dispatched: "Order Dispatched",
      order_delivered: "Order Delivered",
      emergency_alert: "🚨 EMERGENCY ALERT",
      medicine_reminder: "Medicine Reminder",
      lab_report_ready: "Lab Report Ready",
      payment_received: "Payment Received",
      wallet_updated: "Wallet Updated",
      appointment_status_updated: "Appointment Status Updated",
    };

    return subjects[type] || "Notification from Smart Healthcare";
  }

  getEmailTemplate(type) {
    const templates = {
      appointment_booked: "appointmentConfirmation",
      appointment_status_updated: "appointmentStatusUpdate",
      prescription_added: "prescriptionAdded",
      order_confirmed: "orderConfirmation",
      emergency_alert: "emergencyAlert",
      password_reset: "passwordReset",
      email_verification: "emailVerification",
      welcome: "welcome",
    };

    return templates[type] || "general";
  }

  getSMSMessage(type, data) {
    const messages = {
      appointment_booked: `Appointment confirmed with Dr. ${data.doctorName} on ${data.date} at ${data.time}`,
      appointment_reminder: `Reminder: Your appointment with Dr. ${data.doctorName} is tomorrow at ${data.time}`,
      appointment_status_updated: `Your appointment status has been updated to: ${data.status}`,
      order_confirmed: `Order #${data.orderId} confirmed. Total: $${data.amount}`,
      order_dispatched: `Order #${data.orderId} has been dispatched. Track: ${data.trackingUrl}`,
      order_delivered: `Order #${data.orderId} has been delivered. Thank you for shopping with us!`,
      medicine_reminder: `Reminder: Take ${data.medicineName} - ${data.dosage}`,
      emergency_alert: `🚨 EMERGENCY: Patient ${data.patientName} needs immediate attention at ${data.location}`,
      otp_verification: `Your verification code is: ${data.otp}`,
      welcome: `Welcome to Smart Healthcare, ${data.name}! Your account is ready.`,
    };

    return messages[type] || "Notification from Smart Healthcare";
  }

  getPushTitle(type) {
    const titles = {
      appointment_booked: "✅ Appointment Confirmed",
      appointment_reminder: "⏰ Appointment Reminder",
      appointment_cancelled: "❌ Appointment Cancelled",
      appointment_status_updated: "📅 Appointment Updated",
      prescription_added: "📋 New Prescription",
      order_confirmed: "📦 Order Confirmed",
      order_dispatched: "🚚 Order Dispatched",
      order_delivered: "✅ Order Delivered",
      emergency_alert: "🚨 EMERGENCY ALERT",
      medicine_reminder: "💊 Medicine Reminder",
      lab_report_ready: "🔬 Lab Report Ready",
      payment_received: "💰 Payment Received",
      wallet_updated: "💳 Wallet Updated",
      new_message: "💬 New Message",
      video_call: "📹 Incoming Video Call",
    };

    return titles[type] || "Smart Healthcare";
  }

  getPushBody(type, data) {
    const bodies = {
      appointment_booked: `Your appointment with Dr. ${data.doctorName} is confirmed for ${data.date} at ${data.time}`,
      appointment_reminder: `You have an appointment tomorrow at ${data.time} with Dr. ${data.doctorName}`,
      appointment_cancelled: `Your appointment with Dr. ${data.doctorName} has been cancelled`,
      appointment_status_updated: `Your appointment status: ${data.status}`,
      prescription_added: `Dr. ${data.doctorName} has added a new prescription for you`,
      order_confirmed: `Your order #${data.orderId} has been confirmed`,
      order_dispatched: `Your order #${data.orderId} is out for delivery`,
      order_delivered: `Your order #${data.orderId} has been delivered`,
      emergency_alert: `${data.patientName} needs immediate medical attention at ${data.location}`,
      medicine_reminder: `Time to take ${data.medicineName} - ${data.dosage}`,
      new_message: `${data.fromName}: ${data.message}`,
      video_call: `${data.doctorName} is calling you...`,
    };

    return bodies[type] || "You have a new notification";
  }

  async sendAppointmentReminders() {
    // Implementation for sending appointment reminders
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const Appointment = (await import("../models/Appointment.js")).Appointment;

    const appointments = await Appointment.find({
      date: {
        $gte: tomorrow,
        $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000),
      },
      status: "confirmed",
    })
      .populate("patientId")
      .populate("doctorId");

    for (const appointment of appointments) {
      await this.sendNotification({
        userId: appointment.patientId.userId,
        type: "appointment_reminder",
        data: {
          doctorName: appointment.doctorId.userId.name,
          date: appointment.date.toLocaleDateString(),
          time: appointment.startTime,
        },
        channels: ["push", "sms"],
      });
    }
  }

  async sendMedicineReminders() {
    // Implementation for sending medicine reminders
    const now = new Date();
    const currentHour = now.getHours();

    const Prescription = (await import("../models/Prescription.js"))
      .Prescription;

    const prescriptions = await Prescription.find({
      isActive: true,
      "medicines.timing": { $in: [this.getTimePeriod(currentHour)] },
    }).populate("patientId");

    for (const prescription of prescriptions) {
      for (const medicine of prescription.medicines) {
        if (medicine.timing.includes(this.getTimePeriod(currentHour))) {
          await this.sendNotification({
            userId: prescription.patientId.userId,
            type: "medicine_reminder",
            data: {
              medicineName: medicine.name,
              dosage: medicine.dosage,
            },
            channels: ["push"],
          });
        }
      }
    }
  }

  getTimePeriod(hour) {
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
  }
}

// Create instance
const notificationServiceInstance = new NotificationService();

// Named exports for compatibility
export const sendNotification = (options) =>
  notificationServiceInstance.sendNotification(options);
export const broadcastToRole = (role, type, data) =>
  notificationServiceInstance.broadcastToRole(role, type, data);
export const sendAppointmentReminders = () =>
  notificationServiceInstance.sendAppointmentReminders();
export const sendMedicineReminders = () =>
  notificationServiceInstance.sendMedicineReminders();

// Default export
export default notificationServiceInstance;
