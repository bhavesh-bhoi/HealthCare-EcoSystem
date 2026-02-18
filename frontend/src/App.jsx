import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";

// Contexts
import { AuthProvider } from "./Contexts/AuthContext.jsx";
import { ThemeProvider } from "./Contexts/ThemeContext.jsx";
import { NotificationProvider } from "./Contexts/NotificationContext.jsx";

// Layout
import Layout from "./Components/Layouts/Layout.jsx";

// Auth Pages
import Login from "./Pages/Auth/Login.jsx";
import Register from "./Pages/Auth/Register.jsx";
import ForgotPassword from "./Pages/Auth/ForgotPassword.jsx";

// Patient Pages
import PatientDashboard from "./Pages/Patient/Dashboard.jsx";
import SymptomChecker from "./Pages/Patient/SymptomChecker.jsx";
import BookAppointment from "./Pages/Patient/BookAppointment.jsx";
import Appointments from "./Pages/Patient/Appointments.jsx";
import Prescriptions from "./Pages/Patient/Prescriptions.jsx";
import Orders from "./Pages/Patient/Orders.jsx";
import HealthDashboard from "./Pages/Patient/HealthDashboard.jsx";
import Emergency from "./Pages/Patient/Emergency.jsx";

// Doctor Pages
import DoctorDashboard from "./Pages/Doctor/Dashboard.jsx";
import DoctorAppointments from "./Pages/Doctor/Appointments.jsx";
import Patients from "./Pages/Doctor/Patients.jsx";
import DoctorAnalytics from "./Pages/Doctor/Analytics.jsx";

// Pharmacy Pages
import PharmacyDashboard from "./Pages/Pharmacy/Dashboard.jsx";
import PharmacyOrders from "./Pages/Pharmacy/Orders.jsx";
import Inventory from "./Pages/Pharmacy/Inventory.jsx";

// Admin Pages
import AdminDashboard from "./Pages/Admin/Dashboard.jsx";
import Users from "./Pages/Admin/Users.jsx";
import AdminAnalytics from "./Pages/Admin/Analytics.jsx";

// Components
import PrivateRoute from "./Components/Common/PrivateRoute.jsx";
import PageTransition from "./Components/Animations/PageTransition.jsx";

const queryClient = new QueryClient();

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <Router>
                <AnimatePresence mode="wait">
                  <Routes>
                    {/* Public Routes */}
                    <Route
                      path="/login"
                      element={
                        <PageTransition>
                          <Login />
                        </PageTransition>
                      }
                    />
                    <Route
                      path="/register"
                      element={
                        <PageTransition>
                          <Register />
                        </PageTransition>
                      }
                    />
                    <Route
                      path="/forgot-password"
                      element={
                        <PageTransition>
                          <ForgotPassword />
                        </PageTransition>
                      }
                    />

                    {/* Patient Routes */}
                    <Route
                      path="/patient"
                      element={
                        <PrivateRoute role="patient">
                          <Layout />
                        </PrivateRoute>
                      }
                    >
                      <Route
                        index
                        element={
                          <PageTransition>
                            <PatientDashboard />
                          </PageTransition>
                        }
                      />
                      <Route
                        path="dashboard"
                        element={
                          <PageTransition>
                            <PatientDashboard />
                          </PageTransition>
                        }
                      />
                      <Route
                        path="symptom-checker"
                        element={
                          <PageTransition>
                            <SymptomChecker />
                          </PageTransition>
                        }
                      />
                      <Route
                        path="book-appointment"
                        element={
                          <PageTransition>
                            <BookAppointment />
                          </PageTransition>
                        }
                      />
                      <Route
                        path="appointments"
                        element={
                          <PageTransition>
                            <Appointments />
                          </PageTransition>
                        }
                      />
                      <Route
                        path="prescriptions"
                        element={
                          <PageTransition>
                            <Prescriptions />
                          </PageTransition>
                        }
                      />
                      <Route
                        path="orders"
                        element={
                          <PageTransition>
                            <Orders />
                          </PageTransition>
                        }
                      />
                      <Route
                        path="health-dashboard"
                        element={
                          <PageTransition>
                            <HealthDashboard />
                          </PageTransition>
                        }
                      />
                      <Route
                        path="emergency"
                        element={
                          <PageTransition>
                            <Emergency />
                          </PageTransition>
                        }
                      />
                    </Route>

                    {/* Doctor Routes */}
                    <Route
                      path="/doctor"
                      element={
                        <PrivateRoute role="doctor">
                          <Layout />
                        </PrivateRoute>
                      }
                    >
                      <Route
                        index
                        element={
                          <PageTransition>
                            <DoctorDashboard />
                          </PageTransition>
                        }
                      />
                      <Route
                        path="dashboard"
                        element={
                          <PageTransition>
                            <DoctorDashboard />
                          </PageTransition>
                        }
                      />
                      <Route
                        path="appointments"
                        element={
                          <PageTransition>
                            <DoctorAppointments />
                          </PageTransition>
                        }
                      />
                      <Route
                        path="patients"
                        element={
                          <PageTransition>
                            <Patients />
                          </PageTransition>
                        }
                      />
                      <Route
                        path="analytics"
                        element={
                          <PageTransition>
                            <DoctorAnalytics />
                          </PageTransition>
                        }
                      />
                    </Route>

                    {/* Pharmacy Routes */}
                    <Route
                      path="/pharmacy"
                      element={
                        <PrivateRoute role="pharmacy">
                          <Layout />
                        </PrivateRoute>
                      }
                    >
                      <Route
                        index
                        element={
                          <PageTransition>
                            <PharmacyDashboard />
                          </PageTransition>
                        }
                      />
                      <Route
                        path="dashboard"
                        element={
                          <PageTransition>
                            <PharmacyDashboard />
                          </PageTransition>
                        }
                      />
                      <Route
                        path="orders"
                        element={
                          <PageTransition>
                            <PharmacyOrders />
                          </PageTransition>
                        }
                      />
                      <Route
                        path="inventory"
                        element={
                          <PageTransition>
                            <Inventory />
                          </PageTransition>
                        }
                      />
                    </Route>

                    {/* Admin Routes */}
                    <Route
                      path="/admin"
                      element={
                        <PrivateRoute role="admin">
                          <Layout />
                        </PrivateRoute>
                      }
                    >
                      <Route
                        index
                        element={
                          <PageTransition>
                            <AdminDashboard />
                          </PageTransition>
                        }
                      />
                      <Route
                        path="dashboard"
                        element={
                          <PageTransition>
                            <AdminDashboard />
                          </PageTransition>
                        }
                      />
                      <Route
                        path="users"
                        element={
                          <PageTransition>
                            <Users />
                          </PageTransition>
                        }
                      />
                      <Route
                        path="analytics"
                        element={
                          <PageTransition>
                            <AdminAnalytics />
                          </PageTransition>
                        }
                      />
                    </Route>

                    {/* Default redirect */}
                    <Route
                      path="/"
                      element={<Navigate to="/login" replace />}
                    />
                    <Route
                      path="*"
                      element={<Navigate to="/login" replace />}
                    />
                  </Routes>
                </AnimatePresence>
              </Router>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "#363636",
                    color: "#fff",
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: "#22c55e",
                      secondary: "#fff",
                    },
                  },
                  error: {
                    duration: 4000,
                    iconTheme: {
                      primary: "#ef4444",
                      secondary: "#fff",
                    },
                  },
                }}
              />
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
