import React from "react";
import { motion } from "framer-motion";

const Card = ({ children, className = "", hover = true, onClick }) => {
  return (
    <motion.div
      whileHover={hover ? { y: -5, transition: { duration: 0.2 } } : {}}
      className={`card ${className} ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

export default Card;
