import React from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../Contexts/AuthContext.jsx";
import {
  FaHome,
  FaCalendarAlt,
  FaPrescription,
  FaBoxOpen,
  FaUserMd,
  FaChartLine,
  FaClipboardList,
  FaUsers,
  FaCog,
  FaHeartbeat,
  FaPills,
  FaTruck,
  FaFileMedical,
} from "react-icons/fa";
import { MdEmergency, MdHealthAndSafety, MdPsychology } from "react-icons/md"; // Changed: Added MdPsychology
import { RiMentalHealthLine } from "react-icons/ri"; // Changed: Using RiMentalHealthLine instead

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user } = useAuth();

  const patientLinks = [
    {
      to: "/patient/dashboard",
      icon: FaHome,
      label: "Dashboard",
      color: "from-blue-600 to-cyan-600",
    },
    {
      to: "/patient/symptom-checker",
      icon: RiMentalHealthLine,
      label: "Symptom Checker",
      color: "from-purple-600 to-pink-600",
    }, // Fixed: Changed to RiMentalHealthLine
    {
      to: "/patient/book-appointment",
      icon: FaCalendarAlt,
      label: "Book Appointment",
      color: "from-green-600 to-emerald-600",
    },
    {
      to: "/patient/appointments",
      icon: FaClipboardList,
      label: "Appointments",
      color: "from-orange-600 to-amber-600",
    },
    {
      to: "/patient/prescriptions",
      icon: FaPrescription,
      label: "Prescriptions",
      color: "from-indigo-600 to-blue-600",
    },
    {
      to: "/patient/orders",
      icon: FaBoxOpen,
      label: "Orders",
      color: "from-red-600 to-pink-600",
    },
    {
      to: "/patient/health-dashboard",
      icon: MdHealthAndSafety,
      label: "Health Dashboard",
      color: "from-teal-600 to-green-600",
    },
    {
      to: "/patient/emergency",
      icon: MdEmergency,
      label: "Emergency",
      color: "from-red-600 to-red-500",
    },
  ];

  const doctorLinks = [
    {
      to: "/doctor/dashboard",
      icon: FaHome,
      label: "Dashboard",
      color: "from-blue-600 to-cyan-600",
    },
    {
      to: "/doctor/appointments",
      icon: FaCalendarAlt,
      label: "Appointments",
      color: "from-green-600 to-emerald-600",
    },
    {
      to: "/doctor/patients",
      icon: FaUsers,
      label: "Patients",
      color: "from-purple-600 to-pink-600",
    },
    {
      to: "/doctor/analytics",
      icon: FaChartLine,
      label: "Analytics",
      color: "from-orange-600 to-amber-600",
    },
  ];

  const pharmacyLinks = [
    {
      to: "/pharmacy/dashboard",
      icon: FaHome,
      label: "Dashboard",
      color: "from-blue-600 to-cyan-600",
    },
    {
      to: "/pharmacy/orders",
      icon: FaBoxOpen,
      label: "Orders",
      color: "from-green-600 to-emerald-600",
    },
    {
      to: "/pharmacy/inventory",
      icon: FaPills,
      label: "Inventory",
      color: "from-purple-600 to-pink-600",
    },
    {
      to: "/pharmacy/delivery",
      icon: FaTruck,
      label: "Delivery",
      color: "from-orange-600 to-amber-600",
    },
  ];

  const adminLinks = [
    {
      to: "/admin/dashboard",
      icon: FaHome,
      label: "Dashboard",
      color: "from-blue-600 to-cyan-600",
    },
    {
      to: "/admin/users",
      icon: FaUsers,
      label: "Users",
      color: "from-green-600 to-emerald-600",
    },
    {
      to: "/admin/analytics",
      icon: FaChartLine,
      label: "Analytics",
      color: "from-purple-600 to-pink-600",
    },
    {
      to: "/admin/emergency",
      icon: MdEmergency,
      label: "Emergency",
      color: "from-red-600 to-orange-600",
    },
  ];

  const getLinks = () => {
    switch (user?.role) {
      case "patient":
        return patientLinks;
      case "doctor":
        return doctorLinks;
      case "pharmacy":
        return pharmacyLinks;
      case "admin":
        return adminLinks;
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: "spring", damping: 20 }}
        className={`fixed top-0 left-0 h-full w-72 bg-white/90 backdrop-blur-xl shadow-hard z-50 lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <FaHeartbeat className="w-8 h-8 text-primary-600" />
                <motion.div
                  className="absolute inset-0 bg-primary-500 rounded-full blur-xl opacity-30"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
              </div>
              <span className="text-xl font-display font-bold">
                <span className="gradient-text">Health</span>
                <span className="text-secondary-800">Care</span>
              </span>
            </div>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {user?.name?.charAt(0)}
                  </span>
                </div>
                <motion.div
                  className="absolute -bottom-1 -right-1 w-4 h-4 bg-success-500 rounded-full border-2 border-white"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
              </div>
              <div>
                <h3 className="font-semibold text-secondary-800">
                  {user?.name}
                </h3>
                <p className="text-sm text-secondary-500 capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-6 px-4">
            <div className="space-y-2">
              {links.map((link, index) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <NavLink
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                        isActive
                          ? `bg-gradient-to-r ${link.color} text-white shadow-medium`
                          : "text-secondary-600 hover:bg-primary-50 hover:text-primary-600"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <link.icon
                          className={`w-5 h-5 ${isActive ? "text-white" : ""}`}
                        />
                        <span className="font-medium">{link.label}</span>
                        {link.label === "Emergency" && (
                          <motion.div
                            className="w-2 h-2 bg-error-500 rounded-full"
                            animate={{
                              scale: [1, 1.5, 1],
                            }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                            }}
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                </motion.div>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100">
            <NavLink
              to="/settings"
              className="flex items-center space-x-3 px-4 py-3 rounded-xl text-secondary-600 hover:bg-primary-50 hover:text-primary-600 transition-all duration-300"
            >
              <FaCog className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </NavLink>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
