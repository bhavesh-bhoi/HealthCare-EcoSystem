import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

class SMSService {
  constructor() {
    // Check if we have valid Twilio credentials
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const hasValidCredentials =
      accountSid &&
      authToken &&
      accountSid.startsWith("AC") &&
      accountSid.length > 10;

    if (hasValidCredentials && process.env.NODE_ENV === "production") {
      // Only initialize real Twilio client in production with valid credentials
      this.client = twilio(accountSid, authToken);
      this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
      this.isReal = true;
    } else {
      // Development mode - mock the client
      console.log(
        "📱 SMS Service running in DEVELOPMENT mode (no real SMS will be sent)",
      );
      this.isReal = false;
      this.client = null;
      this.fromNumber = process.env.TWILIO_PHONE_NUMBER || "+1234567890";
    }
  }

  async sendSMS({ to, message }) {
    try {
      // Always log the SMS in development
      console.log(`📱 SMS to ${to}: ${message}`);

      if (this.isReal && this.client) {
        // Only actually send in production with real credentials
        const result = await this.client.messages.create({
          body: message,
          to,
          from: this.fromNumber,
        });

        console.log("✅ Real SMS sent:", result.sid);
        return result;
      } else {
        // Mock response for development
        console.log("✅ Mock SMS sent (development mode)");
        return {
          sid: "mock_sid_" + Date.now(),
          status: "delivered",
          to,
          from: this.fromNumber,
          body: message,
        };
      }
    } catch (error) {
      console.error("❌ Error in SMS service:", error.message);
      // Don't throw in development, just return mock
      if (!this.isReal) {
        console.log("⚠️  Returning mock response due to development mode");
        return {
          sid: "mock_sid_" + Date.now(),
          status: "failed",
          error: error.message,
          to,
          from: this.fromNumber,
        };
      }
      throw error;
    }
  }

  async sendAppointmentReminder(to, data) {
    const message = `Reminder: Your appointment with Dr. ${data.doctorName} is scheduled for ${data.date} at ${data.time}. Reply HELP for help.`;
    return this.sendSMS({ to, message });
  }

  async sendOrderUpdate(to, data) {
    const message = `Your order #${data.orderId} is ${data.status}. Estimated delivery: ${data.estimatedDelivery}`;
    return this.sendSMS({ to, message });
  }

  async sendEmergencyAlert(to, data) {
    const message = `🚨 EMERGENCY: Patient ${data.patientName} needs immediate medical attention at ${data.location}. Please respond ASAP.`;
    return this.sendSMS({ to, message });
  }

  async sendOTP(to, otp) {
    const message = `Your verification code is: ${otp}. Valid for 10 minutes.`;
    return this.sendSMS({ to, message });
  }

  async sendWelcomeMessage(to, name) {
    const message = `Welcome to Smart Healthcare, ${name}! Your account has been created successfully.`;
    return this.sendSMS({ to, message });
  }

  async sendBulkSMS(messages) {
    const promises = messages.map((msg) => this.sendSMS(msg));
    return Promise.all(promises);
  }
}

// Create instance
const smsService = new SMSService();

// Named exports
export const sendSMS = (options) => smsService.sendSMS(options);
export const sendAppointmentReminder = (to, data) =>
  smsService.sendAppointmentReminder(to, data);
export const sendOrderUpdate = (to, data) =>
  smsService.sendOrderUpdate(to, data);
export const sendEmergencyAlert = (to, data) =>
  smsService.sendEmergencyAlert(to, data);
export const sendOTP = (to, otp) => smsService.sendOTP(to, otp);
export const sendWelcomeMessage = (to, name) =>
  smsService.sendWelcomeMessage(to, name);
export const sendBulkSMS = (messages) => smsService.sendBulkSMS(messages);

// Default export
export default smsService;
