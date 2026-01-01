import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Lock, CheckCircle2 } from "lucide-react";
import otpBg from "../../assets/mnsuam_cover.jpg";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const RegOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { name, email, password } = location.state || {};
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    if (val.length > 1) return;
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
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
    }
  };

  const isOtpComplete = otp.join("").length === 6 && !error;

  return (
    <div
      className="w-screen min-h-screen flex items-center justify-center bg-cover bg-center p-4"
      style={{
        backgroundImage: `url(${otpBg})`,
      }}
    >
      <div className="bg-white bg-opacity-80 backdrop-blur-md rounded-2xl shadow-xl p-6 sm:p-8 md:p-10 w-full max-w-md text-center">
        <div className="flex justify-center mb-4">
          {isOtpComplete ? (
            <CheckCircle2 size={48} className="text-emerald-600" />
          ) : (
            <Lock size={48} className="text-emerald-600" />
          )}
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-gray-800">
          Verify Your Email
        </h2>
        <p className="text-gray-600 mb-6">
          Enter the 6-digit OTP sent to your email <br />
          <span className="font-medium text-gray-800">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center gap-2">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-${idx}`}
                type="text"
                maxLength={1}
                className="w-14 h-14 border border-gray-300 rounded-lg text-center text-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                value={digit}
                onChange={(e) => handleChange(e, idx)}
                autoFocus={idx === 0}
              />
            ))}
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium transition duration-200 shadow-md"
          >
            Verify OTP
          </button>
        </form>

        <p className="text-gray-500 mt-6 text-sm">
          Didn't receive OTP?{" "}
          <button
            className="text-emerald-600 hover:underline font-medium"
            onClick={handleSubmit}
          >
            Resend OTP
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegOTP;
