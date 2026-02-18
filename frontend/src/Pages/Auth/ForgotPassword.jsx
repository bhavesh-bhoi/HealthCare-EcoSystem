import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  FaEnvelope,
  FaArrowLeft,
  FaHeartbeat,
  FaCheckCircle,
} from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi";
import { authAPI } from "../../services/api.js";
import Card from "../../Components/Common/Card.jsx";
import Button from "../../Components/Common/Button.jsx";
import Input from "../../Components/Common/Input.jsx";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authAPI.forgotPassword(data.email);
      setIsSubmitted(true);
      toast.success("Password reset email sent!");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send reset email",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-teal-900 to-green-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Forgot Password Form */}
      <div className="relative z-10 w-full max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            {/* Logo */}
            <div className="text-center mb-8">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-bg mb-4"
              >
                <FaHeartbeat className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-3xl font-display font-bold text-secondary-800">
                {isSubmitted ? "Check Your Email" : "Forgot Password?"}
              </h1>
              <p className="text-secondary-600 mt-2">
                {isSubmitted
                  ? "We've sent you a password reset link"
                  : "Enter your email to reset your password"}
                <HiOutlineSparkles className="inline ml-1 text-primary-500" />
              </p>
            </div>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Enter your registered email"
                  icon={FaEnvelope}
                  register={register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                      message: "Invalid email format",
                    },
                  })}
                  error={errors.email?.message}
                />

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-success-100 rounded-full"
                >
                  <FaCheckCircle className="w-10 h-10 text-success-600" />
                </motion.div>

                <div className="space-y-2">
                  <p className="text-secondary-700">
                    We've sent a password reset link to your email address.
                  </p>
                  <p className="text-sm text-secondary-500">
                    Please check your inbox and follow the instructions to reset
                    your password.
                  </p>
                </div>

                <div className="pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsSubmitted(false)}
                    className="w-full"
                  >
                    Try another email
                  </Button>
                </div>
              </div>
            )}

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors text-sm"
              >
                <FaArrowLeft className="w-3 h-3" />
                <span>Back to Login</span>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
