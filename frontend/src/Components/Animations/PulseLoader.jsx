import React from "react";
import { motion } from "framer-motion";

const PulseLoader = ({ size = "md", color = "primary" }) => {
  const sizes = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const colors = {
    primary: "from-primary-600 to-teal-600",
    white: "from-white to-gray-100",
    red: "from-red-500 to-red-400",
  };

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <motion.div
        className={`relative ${sizes[size]}`}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-r ${colors[color]} opacity-20 blur-xl`}
        />
        <div
          className={`absolute inset-2 rounded-full bg-gradient-to-r ${colors[color]} opacity-40 blur-lg`}
        />
        <div
          className={`absolute inset-4 rounded-full bg-gradient-to-r ${colors[color]} animate-pulse`}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-white"></div>
        </div>
      </motion.div>
    </div>
  );
};

export default PulseLoader;
