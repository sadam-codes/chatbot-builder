"use client";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Users,
  User,
  Crown,
  Edit3,
  Trash2,
  LogOut,
  Save,
  X,
  AlertTriangle,
  Loader2,
  Bot,
  MessageSquare,
} from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Admin = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "" });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/auth");
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleEditClick = (u) => {
    setEditUser(u.id);
    setEditForm({ name: u.name, email: u.email, role: u.role });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = async (id) => {
    try {
      setActionLoading(`save-${id}`);
      await axios.patch(`${BACKEND_URL}/auth/admin-update/${id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("User updated successfully");
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      setActionLoading(`delete-${deleteId}`);
      await axios.delete(`${BACKEND_URL}/auth/users/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("User deleted successfully");
      setShowModal(false);
      setDeleteId(null);
      fetchUsers();
    } catch (err) {
      toast.error("Delete failed");
      setShowModal(false);
      setDeleteId(null);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setDeleteId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8 text-center">
          <Loader2 className="h-12 w-12 text-emerald-600 mx-auto mb-4 animate-spin" />
          <p className="text-slate-600 font-medium">Loading chatbot builder dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-600 p-3 rounded-xl shadow-lg">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-emerald-600 mb-2">
                  Chatbot Builder Dashboard
                </h1>
                <p className="text-slate-600 flex items-center gap-2">
                  <span>No-code platform admin • Welcome back,</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {user?.name}
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="cursor-pointer inline-flex items-center gap-3 bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-6 sm:p-8 border-b border-gray-100/50">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  User Management
                </h2>
                <p className="text-slate-600 mt-1">
                  Manage chatbot builder users and their access permissions
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50 border-b border-gray-100/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100/50">
                {users?.map((u, idx) => (
                  <tr
                    key={u.id}
                    className="hover:bg-gradient-to-r hover:from-emerald-50/30 hover:to-green-50/30 transition-all duration-200"
                  >
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-semibold text-slate-900">
                      #{u.id}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      {editUser === u.id ? (
                        <input
                          name="name"
                          value={editForm.name}
                          onChange={handleEditChange}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm font-medium"
                          placeholder="Enter name"
                        />
                      ) : (
                        <div className="text-sm font-semibold text-slate-900">
                          {u.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      {editUser === u.id ? (
                        <input
                          name="email"
                          type="email"
                          value={editForm.email}
                          onChange={handleEditChange}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                          placeholder="Enter email"
                        />
                      ) : (
                        <div className="text-sm text-slate-600">{u.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      {editUser === u.id ? (
                        <select
                          name="role"
                          value={editForm.role}
                          onChange={handleEditChange}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold ${
                            u.role === "admin"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-slate-100 text-slate-800 border border-slate-200"
                          }`}
                        >
                          {u.role === "admin" ? (
                            <Crown className="h-3 w-3" />
                          ) : (
                            <User className="h-3 w-3" />
                          )}
                          {u.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      {editUser === u.id ? (
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleEditSave(u.id)}
                            disabled={actionLoading === `save-${u.id}`}
                            className=" cursor-pointer inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            {actionLoading === `save-${u.id}` ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4" />
                                Save
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => setEditUser(null)}
                            className="cursor-pointer inline-flex items-center gap-2 bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            <X className="h-4 w-4" />
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleEditClick(u)}
                            className="cursor-pointer inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            <Edit3 className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(u.id)}
                            className="cursor-pointer inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users?.length === 0 && (
              <div className="text-center py-16">
                <div className="bg-slate-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">No users found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-md p-8 relative border border-gray-200/50">
            <button
              type="button"
              className="cursor-pointer absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg p-2 transition-colors duration-200"
              onClick={handleCancel}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close modal</span>
            </button>

            <div className="text-center">
              <div className="mx-auto mb-6 bg-red-100 rounded-full p-4 w-16 h-16 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-slate-800">
                Delete User Confirmation
              </h3>
              <p className="mb-8 text-slate-600 leading-relaxed">
                Are you sure you want to delete this user? This action cannot be
                undone and will permanently remove all user data.
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleDelete}
                  disabled={actionLoading === `delete-${deleteId}`}
                  className="cursor-pointer inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {actionLoading === `delete-${deleteId}` ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Yes, Delete
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  className="cursor-pointer inline-flex items-center gap-2 bg-slate-500 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <X className="h-4 w-4 " />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
