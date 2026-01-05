import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Lock, CheckCircle2 } from "lucide-react";
import mnsuaLogo from "../../assets/agent.png";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const RegOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { name, email, password } = location.state || {};
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    if (val.length > 1) return;
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    setError(""); // Clear error when typing
    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`).focus();
    if (
      !val &&
      idx > 0 &&
      e.nativeEvent.inputType === "deleteContentBackward"
    ) {
      document.getElementById(`otp-${idx - 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError("Enter 6 digit OTP");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/auth/register/verify-otp`, {
        name,
        email,
        password,
        otp: otpValue,
      });
      toast.success("Registration successful");
      navigate("/auth");
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await axios.post(`${BACKEND_URL}/auth/register/send-otp`, {
        name,
        email,
        password,
      });
      toast.success("OTP resent to your email");
      setOtp(["", "", "", "", "", ""]);
      setError("");
      document.getElementById("otp-0")?.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    }
  };

  const isOtpComplete = otp.join("").length === 6 && !error;

  return (
    <div className="w-screen h-screen flex flex-col lg:flex-row">
      {/* Left Side - Logo */}
      <div className="hidden lg:flex lg:w-1/2 h-full relative overflow-hidden">
        <img
          src={mnsuaLogo}
          alt="MNSUA Logo"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Side - OTP Form */}
      <div className="w-full lg:w-1/2 h-full flex items-center justify-center bg-emerald-50 p-6 lg:p-12 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        
        <div className="w-full max-w-lg relative z-10">
          {/* Mobile Logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-400 rounded-full blur-lg opacity-50"></div>
              <img
                src={mnsuaLogo}
                alt="MNSUA Logo"
                className="relative h-24 w-24 object-contain rounded-full border-4 border-white shadow-xl"
              />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              {isOtpComplete ? (
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={32} className="text-emerald-600" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Lock size={32} className="text-emerald-600" />
                </div>
              )}
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-emerald-600 mb-2">
              Verify Your Email
            </h2>
            <p className="text-gray-600 text-base sm:text-lg">
              Enter the 6-digit OTP sent to
            </p>
            <p className="text-gray-800 font-medium mt-1 text-sm sm:text-base break-all">{email}</p>
          </div>

          {/* OTP Form Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 lg:p-10 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center gap-2 sm:gap-3">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="w-12 h-12 sm:w-14 sm:h-14 border-2 border-gray-200 rounded-xl text-center text-2xl font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    value={digit}
                    onChange={(e) => handleChange(e, idx)}
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              {error && (
                <div className="flex items-center justify-center gap-2 text-red-500 text-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !isOtpComplete}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 text-lg rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  "Verify OTP"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/80 text-gray-500">Didn't receive OTP?</span>
              </div>
            </div>

            {/* Resend Link */}
            <div className="text-center">
              <button
                onClick={handleResend}
                className="text-emerald-600 hover:text-emerald-700 font-semibold text-base transition-colors inline-flex items-center gap-2"
              >
                Resend OTP
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegOTP;
