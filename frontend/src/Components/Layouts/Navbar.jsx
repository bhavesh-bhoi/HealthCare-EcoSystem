import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../Contexts/AuthContext.jsx";
import {
  FaHeartbeat,
  FaUserMd,
  FaCalendarAlt,
  FaSignOutAlt,
  FaBell,
  FaUserCircle,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navLinks = [
    { to: `/${user?.role}/dashboard`, label: "Dashboard", icon: FaHeartbeat },
    {
      to: `/${user?.role}/appointments`,
      label: "Appointments",
      icon: FaCalendarAlt,
    },
    { to: `/${user?.role}/doctors`, label: "Doctors", icon: FaUserMd },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-soft py-2"
          : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <FaHeartbeat className="w-8 h-8 text-primary-600" />
              <motion.div
                className="absolute inset-0 bg-primary-500 rounded-full blur-xl opacity-50"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />
            </motion.div>
            <span className="text-xl font-display font-bold">
              <span className="gradient-text">Health</span>
              <span className="text-secondary-800">Care</span>
              <span className="ml-1 inline-flex">
                <HiOutlineSparkles className="w-4 h-4 text-primary-500" />
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user &&
              navLinks.map((link, index) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={link.to}
                    className="flex items-center space-x-1 text-secondary-600 hover:text-primary-600 transition-colors group"
                  >
                    <link.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>{link.label}</span>
                  </Link>
                </motion.div>
              ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notifications */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-full hover:bg-primary-50 transition-colors"
                >
                  <FaBell className="w-5 h-5 text-secondary-600" />
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full"
                  />
                </motion.button>

                {/* User Menu */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative group"
                >
                  <button className="flex items-center space-x-2 p-2 rounded-full hover:bg-primary-50 transition-colors">
                    <div className="relative">
                      <FaUserCircle className="w-8 h-8 text-primary-600" />
                      <motion.div
                        className="absolute inset-0 bg-primary-500 rounded-full blur-md opacity-30"
                        animate={{
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      />
                    </div>
                    <span className="hidden lg:block text-secondary-700">
                      {user.name}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-48 glass-card rounded-xl shadow-hard overflow-hidden"
                  >
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-3 text-error-600 hover:bg-error-50 transition-colors"
                    >
                      <FaSignOutAlt className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                </motion.div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-secondary"
                  >
                    Login
                  </motion.button>
                </Link>
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary"
                  >
                    Register
                  </motion.button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-primary-50 transition-colors"
            >
              {isOpen ? (
                <FaTimes className="w-6 h-6 text-secondary-600" />
              ) : (
                <FaBars className="w-6 h-6 text-secondary-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4"
            >
              <div className="glass-card rounded-xl p-4 space-y-2">
                {user &&
                  navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-2 px-4 py-3 rounded-lg hover:bg-primary-50 transition-colors"
                    >
                      <link.icon className="w-4 h-4 text-primary-600" />
                      <span className="text-secondary-700">{link.label}</span>
                    </Link>
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
