import React from "react";
import { motion } from "framer-motion";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaTimes,
} from "react-icons/fa";

const Toast = ({ type = "info", message, onClose }) => {
  const icons = {
    success: <FaCheckCircle className="w-5 h-5 text-success-500" />,
    error: <FaExclamationCircle className="w-5 h-5 text-error-500" />,
    warning: <FaExclamationCircle className="w-5 h-5 text-warning-500" />,
    info: <FaInfoCircle className="w-5 h-5 text-primary-500" />,
  };

  const colors = {
    success: "bg-success-50 border-success-500",
    error: "bg-error-50 border-error-500",
    warning: "bg-warning-50 border-warning-500",
    info: "bg-primary-50 border-primary-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 p-4 rounded-xl border-l-4 shadow-medium ${colors[type]}`}
    >
      {icons[type]}
      <p className="text-secondary-700">{message}</p>
      <button onClick={onClose} className="ml-4">
        <FaTimes className="w-4 h-4 text-secondary-400 hover:text-secondary-600" />
      </button>
    </motion.div>
  );
};

export default Toast;
