import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import mnsuam from "../../assets/mnsuam_cover.jpg";
import mnsuaLogo from "../../assets/logo-MNSUAM.jpg";

const SignupForm = ({ setView }) => {
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.password.trim()) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/auth/register/send-otp`, form);
      toast.success("OTP sent to your email");
      navigate("/reg-otp", { state: form });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-screen h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: window.innerWidth >= 640 ? `url(${mnsuam})` : "none",
      }}
    >
      <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl shadow-xl p-8 lg:p-10 w-full max-w-lg my-auto">
        <div className="flex justify-center mb-5">
          <img
            src={mnsuaLogo}
            alt="MNSUA Logo"
            className="h-16 w-auto object-contain"
          />
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Create Account
        </h2>
        <p className="text-black text-center text-base">
          Start your admission journey with us today!
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              name="name"
              placeholder="Sadam"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              onChange={handleChange}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              placeholder="sadam@gmail.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              onChange={handleChange}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              onChange={handleChange}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-lg rounded-lg font-medium transition duration-200 disabled:opacity-50 shadow-md"
          >
            {loading ? "Processing..." : "Create Account"}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{" "}
          <button
            className="text-emerald-600 hover:underline font-medium"
            onClick={() => setView("login")}
          >
            Sign in instead
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;
