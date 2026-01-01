import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import mnsuam from "../../assets/mnsuam_cover.jpg";
import mnsuaLogo from "../../assets/logo-MNSUAM.jpg";

const LoginForm = ({ setView }) => {
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.password.trim()) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/auth/login`, form);
      toast.success(res.data.message);
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate(res.data.user.role === "admin" ? "/admin" : "/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
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
      <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl shadow-xl p-10 lg:p-12 w-full max-w-lg mt-12 sm:mt-20">
        <div className="flex justify-center mb-6">
          <img
            src={mnsuaLogo}
            alt="MNSUA Logo"
            className="h-20 w-auto object-contain"
          />
        </div>

        <h2 className="text-4xl font-bold text-gray-900 mb-3 text-center">
          Welcome Back
        </h2>

        <form onSubmit={handleLogin}>
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
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 mt-4 text-lg rounded-lg font-medium transition duration-200 disabled:opacity-50 shadow-md"
          >
            {loading ? "Processing..." : "Login"}
          </button>
        </form>
        <p className="text-center mt-4 text-sm">
          <button
            className="text-blue-600 hover:underline font-medium"
            onClick={() => setView("forgot")}
          >
            Forgot Password?
          </button>
        </p>
        <p className="text-center mt-4 text-sm text-gray-600">
          Don’t have an account?{" "}
          <button
            className="text-emerald-600 hover:underline font-medium"
            onClick={() => setView("signup")}
          >
            Sign up instead
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
