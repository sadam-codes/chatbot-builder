import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiPlus, FiMessageCircle, FiMessageSquare, FiTrash2, FiSettings } from "react-icons/fi";

interface Agent {
  id: string;
  name: string;
  model: string;
  role: string;
  instructions: string;
  createdAt: string;
  updatedAt: string;
}

export default function AgentsList() {
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000/api/v1";
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth");
        return;
      }

      const response = await fetch(`${BACKEND_URL}/chatbot/agents`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch agents");

      const data = await response.json();
      setAgents(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load agents");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (agentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this agent? All chat history will be lost.")) {
      return;
    }

    setDeletingId(agentId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BACKEND_URL}/chatbot/agents/${agentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete agent");

      toast.success("Agent deleted successfully");
      setAgents(agents.filter((a) => a.id !== agentId));
    } catch (error: any) {
      toast.error(error.message || "Failed to delete agent");
    } finally {
      setDeletingId(null);
    }
  };

  const getModelBadgeColor = (model: string) => {
    if (model.includes("gpt-4")) return "bg-purple-100 text-purple-700";
    return "bg-blue-100 text-blue-700";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">My Agents</h1>
            <p className="text-slate-600">Manage and chat with your AI agents</p>
          </div>
          <button
            onClick={() => navigate("/agents/create")}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg font-medium"
          >
            <FiPlus className="w-5 h-5" />
            Create Agent
          </button>
        </div>

        {/* Agents Grid */}
        {agents.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mx-auto mb-4">
              <FiMessageCircle className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No agents yet</h2>
            <p className="text-slate-600 mb-6">Create your first AI agent to get started</p>
            <button
              onClick={() => navigate("/agents/create")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg font-medium"
            >
              <FiPlus className="w-5 h-5" />
              Create Your First Agent
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer group border border-slate-200 hover:border-blue-300 overflow-hidden"
                onClick={() => navigate(`/chat/${agent.id}`)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
                      <FiMessageCircle className="text-white w-6 h-6" />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => handleDelete(agent.id, e)}
                        disabled={deletingId === agent.id}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete agent"
                      >
                        {deletingId === agent.id ? (
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <FiTrash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {agent.name}
                  </h3>

                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${getModelBadgeColor(agent.model)}`}>
                      {agent.model}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 mb-1">
                    <span className="font-semibold">Role:</span> {agent.role}
                  </p>

                  <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                    {agent.instructions.substring(0, 100)}...
                  </p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/chat/${agent.id}`);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                  >
                    <FiMessageSquare className="w-4 h-4" />
                    Start Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

