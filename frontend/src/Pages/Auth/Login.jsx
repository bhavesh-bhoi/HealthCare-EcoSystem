import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { FaEnvelope, FaLock, FaArrowRight, FaHeartbeat } from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi";
import { useAuth } from "../../Contexts/AuthContext.jsx";
import toast from "react-hot-toast";
import FadeIn from "../../Components/Animations/FadeIn.jsx";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await login(data);
      console.log("Login response:", response);

      if (response?.status === "success") {
        toast.success("Login successful!");

        // Get user role from response
        const userRole = response.data?.user?.role;
        console.log("User role:", userRole);

        // Redirect based on role
        if (userRole === "patient") {
          navigate("/patient/dashboard", { replace: true });
        } else if (userRole === "doctor") {
          navigate("/doctor/dashboard", { replace: true });
        } else if (userRole === "pharmacy") {
          navigate("/pharmacy/dashboard", { replace: true });
        } else if (userRole === "admin") {
          navigate("/admin/dashboard", { replace: true });
        } else {
          console.error("Unknown role:", userRole);
          navigate("/", { replace: true });
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Login failed");
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

      {/* Login Form */}
      <div className="relative z-10 w-full max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-soft border border-white/20"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-primary-600 to-teal-600 mb-4"
            >
              <FaHeartbeat className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl font-display font-bold text-secondary-800">
              Welcome Back
            </h1>
            <p className="text-secondary-600 mt-2">
              Sign in to continue to{" "}
              <span className="bg-gradient-to-r from-primary-600 to-teal-600 bg-clip-text text-transparent font-semibold">
                HealthCare
              </span>
              <HiOutlineSparkles className="inline ml-1 text-primary-500" />
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FadeIn delay={0.1}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-secondary-700">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary-400" />
                  <input
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                        message: "Invalid email format",
                      },
                    })}
                    className="w-full px-4 py-3 pl-12 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="text-error-500 text-sm">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-secondary-700">
                  Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary-400" />
                  <input
                    type="password"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                    className="w-full px-4 py-3 pl-12 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                    placeholder="Enter your password"
                  />
                </div>
                {errors.password && (
                  <p className="text-error-500 text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-secondary-600">
                    Remember me
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </FadeIn>

            <FadeIn delay={0.4}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary-600 to-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-primary-500/30 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <FaArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </FadeIn>
          </form>

          {/* Register Link */}
          <FadeIn delay={0.5}>
            <p className="text-center mt-8 text-secondary-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
              >
                Sign up here
              </Link>
            </p>
          </FadeIn>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
