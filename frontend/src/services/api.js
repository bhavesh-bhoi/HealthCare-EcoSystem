import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// ==================== AUTH APIS ====================
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/auth/me"),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) =>
    api.put(`/auth/reset-password/${token}`, { password }),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
};

// ==================== PATIENT APIS ====================
export const patientAPI = {
  // Profile
  getProfile: () => api.get("/patient/profile"),
  updateProfile: (data) => api.put("/patient/profile", data),

  // Dashboard
  getDashboard: () => api.get("/patient/dashboard"),

  // Symptoms
  checkSymptoms: (symptoms) =>
    api.post("/patient/check-symptoms", { symptoms }),

  // Doctors
  getDoctors: (params) => api.get("/patient/doctors", { params }),
  getDoctorById: (id) => api.get(`/patient/doctors/${id}`),

  // Appointments
  getAppointments: () => api.get("/patient/appointments"),
  getAppointment: (id) => api.get(`/patient/appointments/${id}`),
  bookAppointment: (data) => api.post("/patient/appointments", data),
  cancelAppointment: (id, reason) =>
    api.put(`/patient/appointments/${id}/cancel`, { reason }),

  // Prescriptions
  getPrescriptions: () => api.get("/patient/prescriptions"),
  getPrescription: (id) => api.get(`/patient/prescriptions/${id}`),

  // Orders
  getOrders: () => api.get("/patient/orders"),
  getOrder: (id) => api.get(`/patient/orders/${id}`),
  createOrder: (data) => api.post("/patient/orders", data),

  // Emergency
  emergencyAlert: (data) => api.post("/patient/emergency", data),

  // Ratings
  rateDoctor: (doctorId, rating, comment) =>
    api.post("/patient/rate-doctor", { doctorId, rating, comment }),
};

// ==================== DOCTOR APIS ====================
export const doctorAPI = {
  // Profile
  getProfile: () => api.get("/doctor/profile"),
  updateProfile: (data) => api.put("/doctor/profile", data),

  // Dashboard
  getDashboard: () => api.get("/doctor/dashboard"),
  getAnalytics: () => api.get("/doctor/analytics"),

  // Appointments
  getAppointments: () => api.get("/doctor/appointments"),
  getAppointment: (id) => api.get(`/doctor/appointments/${id}`),
  updateAppointmentStatus: (id, status, notes) =>
    api.put(`/doctor/appointments/${id}/status`, { status, notes }),

  // Patients
  getPatients: () => api.get("/doctor/patients"),
  getPatientHistory: (patientId) =>
    api.get(`/doctor/patients/${patientId}/history`),

  // Prescriptions
  createPrescription: (data) => api.post("/doctor/prescriptions", data),
  updatePrescription: (id, data) =>
    api.put(`/doctor/prescriptions/${id}`, data),

  // Availability
  setAvailability: (data) => api.put("/doctor/availability", data),
  getAvailability: () => api.get("/doctor/availability"),

  // Consultations
  startConsultation: (id) => api.post(`/doctor/appointments/${id}/start`),
  endConsultation: (id) => api.post(`/doctor/appointments/${id}/end`),
};

// ==================== PHARMACY APIS ====================
export const pharmacyAPI = {
  // Profile
  getProfile: () => api.get("/pharmacy/profile"),
  updateProfile: (data) => api.put("/pharmacy/profile", data),

  // Dashboard
  getDashboard: () => api.get("/pharmacy/dashboard"),
  getAnalytics: () => api.get("/pharmacy/analytics"),

  // Orders
  getOrders: (status) => api.get("/pharmacy/orders", { params: { status } }),
  getOrder: (id) => api.get(`/pharmacy/orders/${id}`),
  updateOrderStatus: (id, data) =>
    api.put(`/pharmacy/orders/${id}/status`, data),
  getNearbyOrders: () => api.get("/pharmacy/orders/nearby"),

  // Inventory
  getInventory: () => api.get("/pharmacy/inventory"),
  updateInventory: (data) => api.put("/pharmacy/inventory", data),
  checkMedicine: (medicineId) =>
    api.get(`/pharmacy/medicine/${medicineId}/check`),

  // Delivery Partners
  addDeliveryPartner: (data) => api.post("/pharmacy/delivery-partners", data),
  updateDeliveryPartner: (id, data) =>
    api.put(`/pharmacy/delivery-partners/${id}`, data),
};

// ==================== ADMIN APIS ====================
export const adminAPI = {
  // Dashboard
  getDashboard: () => api.get("/admin/dashboard"),

  // Doctors Management
  getDoctors: (params) => api.get("/admin/doctors", { params }),
  updateDoctor: (id, data) => api.put(`/admin/doctors/${id}`, data),
  deleteDoctor: (id) => api.delete(`/admin/doctors/${id}`),
  verifyDoctor: (id) => api.put(`/admin/doctors/${id}/verify`),

  // Pharmacies Management
  getPharmacies: (params) => api.get("/admin/pharmacies", { params }),
  updatePharmacy: (id, data) => api.put(`/admin/pharmacies/${id}`, data),
  deletePharmacy: (id) => api.delete(`/admin/pharmacies/${id}`),
  verifyPharmacy: (id) => api.put(`/admin/pharmacies/${id}/verify`),

  // Patients Management
  getPatients: (search) => api.get("/admin/patients", { params: { search } }),
  manageUser: (id, isActive) =>
    api.put(`/admin/users/${id}/manage`, { isActive }),

  // Analytics
  getAnalytics: (period) => api.get("/admin/analytics", { params: { period } }),
  getRevenue: (startDate, endDate) =>
    api.get("/admin/revenue", { params: { startDate, endDate } }),
  getDiseaseStats: () => api.get("/admin/disease-stats"),

  // Emergency
  getEmergencyCases: () => api.get("/admin/emergency-cases"),
};

export default api;
