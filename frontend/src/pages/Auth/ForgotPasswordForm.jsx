import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Mail, KeyRound, Lock, RefreshCcw } from "lucide-react";
import bgImage from "../../assets/mnsuam_cover.jpg"; 

const ForgotPasswordForm = ({ setView }) => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [step, setStep] = useState("send");
  const [form, setForm] = useState({ email: "", otp: "", newPassword: "" });
  const [errors, setErrors] = useState({});

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = "Email is required";
    if (step === "reset" && !form.otp) newErrors.otp = "OTP is required";
    if (step === "reset" && !form.newPassword)
      newErrors.newPassword = "New password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const res = await axios.post(`${BACKEND_URL}/auth/forgot-password`, {
        email: form.email,
      });
      toast.success(res.data.message);
      setStep("reset");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const res = await axios.post(`${BACKEND_URL}/auth/reset-password`, form);
      toast.success(res.data.message);
      setView("login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div
      className="w-screen min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl shadow-lg p-8 max-w-md w-full">
        {/* Icon Header */}
        <div className="flex justify-center mb-4">
          {step === "send" ? (
            <Mail size={48} className="text-emerald-600" />
          ) : (
            <KeyRound size={48} className="text-emerald-600" />
          )}
        </div>

        <h2 className="text-2xl font-bold text-center mb-3 text-gray-800">
          Forgot Password
        </h2>
        <p className="text-center text-black mb-6">
          {step === "send"
            ? "Enter your registered email and we’ll send you an OTP to reset your password."
            : "Enter the OTP you received and your new password to reset your account."}
        </p>

        <form
          onSubmit={step === "send" ? handleSendOtp : handleResetPassword}
          className="space-y-5"
        >
          {/* Email Input */}
          <div>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 bg-white/80">
              <Mail className="ml-3 text-gray-400" size={20} />
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="flex-1 px-3 py-2 outline-none bg-transparent"
                onChange={handleChange}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Reset Step Inputs */}
          {step === "reset" && (
            <>
              {/* OTP */}
              <div>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 bg-white/80">
                  <KeyRound className="ml-3 text-gray-400" size={20} />
                  <input
                    name="otp"
                    placeholder="OTP"
                    className="flex-1 px-3 py-2 outline-none bg-transparent"
                    onChange={handleChange}
                  />
                </div>
                {errors.otp && (
                  <p className="text-red-500 text-sm mt-1">{errors.otp}</p>
                )}
              </div>

              {/* New Password */}
              <div>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 bg-white/80">
                  <Lock className="ml-3 text-gray-400" size={20} />
                  <input
                    name="newPassword"
                    type="password"
                    placeholder="New Password"
                    className="flex-1 px-3 py-2 outline-none bg-transparent"
                    onChange={handleChange}
                  />
                </div>
                {errors.newPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.newPassword}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Submit Button */}
          <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium transition duration-200 shadow-md flex items-center justify-center gap-2">
            {step === "send" ? (
              <>
                Send OTP <RefreshCcw size={18} />
              </>
            ) : (
              <>
                Reset Password <KeyRound size={18} />
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-black">
          Remember password?{" "}
          <button
            onClick={() => setView("login")}
            className="text-emerald-400 hover:underline font-medium"
          >
            Back to Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
