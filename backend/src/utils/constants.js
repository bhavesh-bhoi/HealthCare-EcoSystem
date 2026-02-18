export const ROLES = {
  PATIENT: "patient",
  DOCTOR: "doctor",
  PHARMACY: "pharmacy",
  ADMIN: "admin",
};

export const APPOINTMENT_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  REJECTED: "rejected",
  NO_SHOW: "no-show",
  RESCHEDULED: "rescheduled",
};

export const CONSULTATION_MODES = {
  CLINIC: "clinic",
  HOME: "home",
  ONLINE: "online",
};

export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PREPARING: "preparing",
  READY: "ready",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
};

export const PAYMENT_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded",
};

export const SEVERITY_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
};

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const GENDERS = ["male", "female", "other", "prefer-not-to-say"];

export const MEDICINE_CATEGORIES = [
  "Pain Relief",
  "Antibiotic",
  "Antihistamine",
  "Antidiabetic",
  "Cardiovascular",
  "Gastric",
  "Respiratory",
  "Dermatological",
  "Neurological",
  "Psychiatric",
  "Hormonal",
  "Vitamin",
  "Mineral",
  "Other",
];

export const MEDICINE_FORMS = [
  "Tablet",
  "Capsule",
  "Syrup",
  "Injection",
  "Cream",
  "Ointment",
  "Drops",
  "Inhaler",
  "Spray",
  "Patch",
];

export const NOTIFICATION_TYPES = {
  APPOINTMENT_BOOKED: "appointment_booked",
  APPOINTMENT_REMINDER: "appointment_reminder",
  APPOINTMENT_CANCELLED: "appointment_cancelled",
  PRESCRIPTION_ADDED: "prescription_added",
  ORDER_CONFIRMED: "order_confirmed",
  ORDER_DISPATCHED: "order_dispatched",
  ORDER_DELIVERED: "order_delivered",
  EMERGENCY_ALERT: "emergency_alert",
  MEDICINE_REMINDER: "medicine_reminder",
};

export const ERROR_MESSAGES = {
  UNAUTHORIZED: "Please authenticate",
  FORBIDDEN: "You do not have permission to access this resource",
  NOT_FOUND: "Resource not found",
  VALIDATION_ERROR: "Validation error",
  SERVER_ERROR: "Internal server error",
  DUPLICATE_ENTRY: "Duplicate entry found",
  INVALID_CREDENTIALS: "Invalid email or password",
  ACCOUNT_INACTIVE: "Your account has been deactivated",
  TOKEN_EXPIRED: "Token expired",
  INVALID_TOKEN: "Invalid token",
};

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Login successful",
  LOGOUT_SUCCESS: "Logout successful",
  REGISTER_SUCCESS: "Registration successful",
  UPDATE_SUCCESS: "Update successful",
  DELETE_SUCCESS: "Delete successful",
  BOOKING_SUCCESS: "Appointment booked successfully",
  ORDER_SUCCESS: "Order placed successfully",
};
