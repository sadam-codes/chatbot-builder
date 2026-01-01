import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Lock } from "lucide-react";
import changeBg from "../../assets/mnsuam_cover.jpg"; 

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const ChangePassword = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      toast.error("Both fields are required");
      return;
    }
    setLoading(true);
    try {
      await axios.patch(
        `${BACKEND_URL}/auth/change-password`,
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Password changed successfully");
      setOldPassword("");
      setNewPassword("");
      navigate("/");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to change password");
    }
    setLoading(false);
  };

  return (
    <div
      className="w-screen min-h-screen flex items-center justify-center bg-cover bg-center p-4"
      style={{
        backgroundImage: `url(${changeBg})`,
      }}
    >
      <div className="bg-white bg-opacity-80 backdrop-blur-md rounded-2xl shadow-xl p-6 sm:p-8 md:p-10 w-full max-w-md">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <Lock size={48} className="text-emerald-600" />
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-gray-800 text-center">
          Change Password
        </h2>
        <p className="text-gray-600 mb-6 text-center">
          Keep your account secure by updating your password regularly.
        </p>

        {/* Form */}
        <form onSubmit={handleChangePassword} className="space-y-4">
          {/* Old Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Old Password
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              placeholder="Enter old password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              New Password
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium transition duration-200 shadow-md"
          >
            {loading ? "Changing..." : "Change Password"}
          </button>
        </form>

        {/* Back Button */}
        <p className="text-center mt-6 text-sm text-gray-500">
          <button
            onClick={() => navigate(-1)}
            className="text-emerald-600 hover:underline font-medium"
          >
            Back
          </button>
        </p>
      </div>
    </div>
  );
};

export default ChangePassword;
