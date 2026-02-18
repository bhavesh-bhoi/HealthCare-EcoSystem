import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("API Request:", config.method.toUpperCase(), config.url); // Debug log
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log("API Response:", response.status, response.config.url); // Debug log
    return response;
  },
  (error) => {
    console.error(
      "API Error:",
      error.response?.status,
      error.config?.url,
      error.response?.data,
    );
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/auth/me"),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) =>
    api.put(`/auth/reset-password/${token}`, { password }),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
};

// Patient APIs
export const patientAPI = {
  getProfile: () => api.get("/patient/profile"),
  updateProfile: (data) => api.put("/patient/profile", data),
  getDashboard: () => api.get("/patient/dashboard"),
  checkSymptoms: (symptoms) =>
    api.post("/patient/check-symptoms", { symptoms }),
  getDoctors: (params) => api.get("/patient/doctors", { params }),
  bookAppointment: (data) => api.post("/patient/appointments", data),
  getAppointments: () => api.get("/patient/appointments"),
  getAppointment: (id) => api.get(`/patient/appointments/${id}`),
  cancelAppointment: (id, reason) =>
    api.put(`/patient/appointments/${id}/cancel`, { reason }),
  getPrescriptions: () => api.get("/patient/prescriptions"),
  getPrescription: (id) => api.get(`/patient/prescriptions/${id}`),
  getOrders: () => api.get("/patient/orders"),
  getOrder: (id) => api.get(`/patient/orders/${id}`),
  createOrder: (data) => api.post("/patient/orders", data),
  emergencyAlert: (data) => api.post("/patient/emergency", data),
  rateDoctor: (doctorId, rating, comment) =>
    api.post("/patient/rate-doctor", { doctorId, rating, comment }),
};

// Doctor APIs
export const doctorAPI = {
  getProfile: () => api.get("/doctor/profile"),
  updateProfile: (data) => api.put("/doctor/profile", data),
  getAppointments: () => api.get("/doctor/appointments"),
  getAppointment: (id) => api.get(`/doctor/appointments/${id}`),
  updateAppointmentStatus: (id, status, notes) =>
    api.put(`/doctor/appointments/${id}/status`, { status, notes }),
  getPatients: () => api.get("/doctor/patients"),
  getPatientHistory: (patientId) =>
    api.get(`/doctor/patients/${patientId}/history`),
  createPrescription: (data) => api.post("/doctor/prescriptions", data),
  updatePrescription: (id, data) =>
    api.put(`/doctor/prescriptions/${id}`, data),
  getAnalytics: () => api.get("/doctor/analytics"),
  setAvailability: (data) => api.put("/doctor/availability", data),
  getAvailability: () => api.get("/doctor/availability"),
  startConsultation: (id) => api.post(`/doctor/appointments/${id}/start`),
  endConsultation: (id) => api.post(`/doctor/appointments/${id}/end`),
};

// Pharmacy APIs
export const pharmacyAPI = {
  getProfile: () => api.get("/pharmacy/profile"),
  updateProfile: (data) => api.put("/pharmacy/profile", data),
  getOrders: (status) => api.get("/pharmacy/orders", { params: { status } }),
  getOrder: (id) => api.get(`/pharmacy/orders/${id}`),
  updateOrderStatus: (id, data) =>
    api.put(`/pharmacy/orders/${id}/status`, data),
  getInventory: () => api.get("/pharmacy/inventory"),
  updateInventory: (data) => api.put("/pharmacy/inventory", data),
  checkMedicine: (medicineId) =>
    api.get(`/pharmacy/medicine/${medicineId}/check`),
  getAnalytics: () => api.get("/pharmacy/analytics"),
  addDeliveryPartner: (data) => api.post("/pharmacy/delivery-partners", data),
  updateDeliveryPartner: (id, data) =>
    api.put(`/pharmacy/delivery-partners/${id}`, data),
  getNearbyOrders: () => api.get("/pharmacy/orders/nearby"),
};

// Admin APIs
export const adminAPI = {
  getDashboard: () => api.get("/admin/dashboard"),
  getDoctors: (params) => api.get("/admin/doctors", { params }),
  updateDoctor: (id, data) => api.put(`/admin/doctors/${id}`, data),
  deleteDoctor: (id) => api.delete(`/admin/doctors/${id}`),
  verifyDoctor: (id) => api.put(`/admin/doctors/${id}/verify`),
  getPharmacies: (params) => api.get("/admin/pharmacies", { params }),
  updatePharmacy: (id, data) => api.put(`/admin/pharmacies/${id}`, data),
  deletePharmacy: (id) => api.delete(`/admin/pharmacies/${id}`),
  verifyPharmacy: (id) => api.put(`/admin/pharmacies/${id}/verify`),
  getPatients: (search) => api.get("/admin/patients", { params: { search } }),
  manageUser: (id, isActive) =>
    api.put(`/admin/users/${id}/manage`, { isActive }),
  getAnalytics: (period) => api.get("/admin/analytics", { params: { period } }),
  getRevenue: (startDate, endDate) =>
    api.get("/admin/revenue", { params: { startDate, endDate } }),
  getDiseaseStats: () => api.get("/admin/disease-stats"),
  getEmergencyCases: () => api.get("/admin/emergency-cases"),
  getLogs: (level) => api.get("/admin/logs", { params: { level } }),
};

export default api;
