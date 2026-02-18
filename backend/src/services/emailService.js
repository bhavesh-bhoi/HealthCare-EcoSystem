import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail({ to, subject, template, data }) {
    try {
      let html = this.getTemplate(template, data);

      const mailOptions = {
        from: `"Smart Healthcare" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("Email sent:", info.messageId);
      return info;
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }

  getTemplate(template, data) {
    const templates = {
      welcome: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .button { 
              background: #2563eb; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 5px;
              display: inline-block;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Smart Healthcare</h1>
            </div>
            <div class="content">
              <h2>Hello ${data.name}!</h2>
              <p>Thank you for joining Smart Healthcare. We're excited to have you on board!</p>
              <p>With our platform, you can:</p>
              <ul>
                <li>Book appointments with top doctors</li>
                <li>Check symptoms using AI</li>
                <li>Order medicines online</li>
                <li>Access your health records</li>
              </ul>
              <a href="${data.url}" class="button">Get Started</a>
            </div>
          </div>
        </body>
        </html>
      `,
      appointmentConfirmation: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .details { background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Appointment Confirmed</h1>
            </div>
            <div class="content">
              <h2>Hello ${data.patientName}!</h2>
              <p>Your appointment has been confirmed.</p>
              
              <div class="details">
                <p><strong>Doctor:</strong> ${data.doctorName}</p>
                <p><strong>Date:</strong> ${data.date}</p>
                <p><strong>Time:</strong> ${data.time}</p>
                <p><strong>Mode:</strong> ${data.mode}</p>
              </div>
              
              <a href="${data.url}" class="button">View Details</a>
            </div>
          </div>
        </body>
        </html>
      `,
      prescriptionAdded: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #8b5cf6; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .medicine-list { background: #f3f4f6; padding: 15px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Prescription</h1>
            </div>
            <div class="content">
              <h2>Hello ${data.patientName}!</h2>
              <p>Dr. ${data.doctorName} has added a new prescription for you.</p>
              
              <div class="medicine-list">
                <h3>Medicines:</h3>
                <ul>
                  ${data.medicines.map((med) => `<li>${med.name} - ${med.dosage}, ${med.frequency}</li>`).join("")}
                </ul>
              </div>
              
              <a href="${data.url}" class="button">View Prescription</a>
            </div>
          </div>
        </body>
        </html>
      `,
      orderConfirmation: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .order-details { background: #f3f4f6; padding: 15px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Confirmed</h1>
            </div>
            <div class="content">
              <h2>Hello ${data.patientName}!</h2>
              <p>Your order #${data.orderId} has been confirmed.</p>
              
              <div class="order-details">
                <h3>Order Summary:</h3>
                <p><strong>Total Amount:</strong> $${data.amount}</p>
                <p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>
              </div>
              
              <a href="${data.url}" class="button">Track Order</a>
            </div>
          </div>
        </body>
        </html>
      `,
      passwordReset: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .warning { color: #ef4444; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hello ${data.name}!</h2>
              <p>We received a request to reset your password.</p>
              <p>Click the button below to reset your password. This link will expire in 10 minutes.</p>
              
              <a href="${data.url}" class="button">Reset Password</a>
              
              <p class="warning">If you didn't request this, please ignore this email or contact support.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      emailVerification: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Verify Your Email</h1>
            </div>
            <div class="content">
              <h2>Welcome ${data.name}!</h2>
              <p>Please verify your email address to activate your account.</p>
              <p>Click the button below to verify your email. This link will expire in 24 hours.</p>
              
              <a href="${data.url}" class="button">Verify Email</a>
            </div>
          </div>
        </body>
        </html>
      `,
      emergencyAlert: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .emergency-details { background: #fee2e2; border: 1px solid #ef4444; padding: 15px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 EMERGENCY ALERT</h1>
            </div>
            <div class="content">
              <h2>Immediate Medical Attention Required!</h2>
              
              <div class="emergency-details">
                <p><strong>Patient:</strong> ${data.patientName}</p>
                <p><strong>Location:</strong> ${data.location}</p>
                <p><strong>Emergency Type:</strong> ${data.emergencyType}</p>
                <p><strong>Time:</strong> ${data.time}</p>
              </div>
              
              <p>Please respond immediately to this emergency alert.</p>
              <a href="${data.url}" class="button">View Details</a>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    return templates[template] || "<p>No template found</p>";
  }

  async sendBulkEmails(emails) {
    const promises = emails.map((email) => this.sendEmail(email));
    return Promise.all(promises);
  }
}

export default new EmailService();
