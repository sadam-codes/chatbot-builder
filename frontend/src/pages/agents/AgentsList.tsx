import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Bot,
  Plus,
  MessageSquare,
  Trash2,
  Calendar,
  Sparkles,
  Loader2,
  AlertTriangle,
  X,
  Clock,
  Copy,
  Check,
} from "lucide-react";
import Header from "../../pages/Home/Header";

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
  // @ts-ignore
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000/api/v1";
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);
  const [copiedAgentId, setCopiedAgentId] = useState<string | null>(null);

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

  const handleDeleteClick = (agent: Agent, e: React.MouseEvent) => {
    e.stopPropagation();
    setAgentToDelete(agent);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!agentToDelete) return;

    setDeletingId(agentToDelete.id);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BACKEND_URL}/chatbot/agents/${agentToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete agent");

      toast.success("Agent deleted successfully");
      setAgents(agents.filter((a) => a.id !== agentToDelete.id));
      setShowDeleteModal(false);
      setAgentToDelete(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete agent");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getApiUrl = (agentId: string) => {
    // @ts-ignore
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api/v1";
    const baseUrl = backendUrl.replace("/api/v1", "");
    return `${baseUrl}/api/v1/chatbot/public/chat/${agentId}`;
  };

  const handleCopyApi = async (agentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const apiUrl = getApiUrl(agentId);
    const apiExample = {
      url: apiUrl,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        question: "Hello, how can you help me?",
      },
    };

    const textToCopy = `API Endpoint: ${apiUrl}\n\nExample Request (Postman):\nPOST ${apiUrl}\nContent-Type: application/json\n\n{\n  "question": "Hello, how can you help me?"\n}`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedAgentId(agentId);
      toast.success("API endpoint copied to clipboard!");
      setTimeout(() => setCopiedAgentId(null), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedAgentId(agentId);
      toast.success("API endpoint copied to clipboard!");
      setTimeout(() => setCopiedAgentId(null), 2000);
    }
  };

  const getModelBadgeColor = (model: string) => {
    if (model.includes("gpt-4o")) return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (model.includes("gpt-4")) return "bg-purple-100 text-purple-700 border-purple-200";
    return "bg-blue-100 text-blue-700 border-blue-200";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
            <Loader2 className="h-12 w-12 text-emerald-600 mx-auto mb-4 animate-spin" />
            <p className="text-slate-600 font-medium">Loading your chatbots...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">My Chatbots</h1>
              <p className="text-slate-600 text-lg">
                Build, manage, and deploy your AI agents
              </p>
            </div>
            <button
              onClick={() => navigate("/agents/create")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              Create New Chatbot
            </button>
          </div>

          {/* Statistics */}
          {agents.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Bot className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{agents.length}</p>
                    <p className="text-sm text-slate-600">Total Chatbots</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {agents.filter((a) => a.model.includes("gpt-4")).length}
                    </p>
                    <p className="text-sm text-slate-600">Premium Models</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {agents.length > 0 ? formatDate(agents[0].createdAt) : "—"}
                    </p>
                    <p className="text-sm text-slate-600">Latest Created</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Agents Grid */}
        {agents.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 lg:p-16 text-center border border-gray-100">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bot className="w-12 h-12 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">No chatbots yet</h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto text-lg">
              Create your first AI chatbot to start automating conversations and providing instant support to your users.
            </p>
            <button
              onClick={() => navigate("/agents/create")}
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              Create Your First Chatbot
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-200 hover:border-emerald-300 overflow-hidden"
                onClick={() => navigate(`/chat/${agent.id}`)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                      <Bot className="text-white w-7 h-7" />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => handleCopyApi(agent.id, e)}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Copy API endpoint"
                      >
                        {copiedAgentId === agent.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(agent, e)}
                        disabled={deletingId === agent.id}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete chatbot"
                      >
                        {deletingId === agent.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors line-clamp-1">
                    {agent.name}
                  </h3>

                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full border ${getModelBadgeColor(
                        agent.model
                      )}`}
                    >
                      {agent.model}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-slate-600">
                      <span className="font-semibold text-slate-700">Role:</span>{" "}
                      <span className="text-slate-600">{agent.role}</span>
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      <span>Created {formatDate(agent.createdAt)}</span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-500 line-clamp-2 mb-4 min-h-[2.5rem]">
                    {agent.instructions.substring(0, 120)}
                    {agent.instructions.length > 120 ? "..." : ""}
                  </p>

                  {copiedAgentId === agent.id && (
                    <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <p className="text-xs font-semibold text-emerald-700 mb-1">API Endpoint Copied!</p>
                      <p className="text-xs text-emerald-600 font-mono break-all">
                        {getApiUrl(agent.id)}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/chat/${agent.id}`);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors font-semibold group-hover:bg-emerald-100"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Start Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && agentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative border border-gray-200">
            <button
              type="button"
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg p-2 transition-colors"
              onClick={() => {
                setShowDeleteModal(false);
                setAgentToDelete(null);
              }}
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-6">
              <div className="mx-auto mb-4 bg-red-100 rounded-full p-4 w-16 h-16 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Delete Chatbot?</h3>
              <p className="text-slate-600">
                Are you sure you want to delete <strong>{agentToDelete.name}</strong>? This action cannot be undone and all chat history will be permanently deleted.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setAgentToDelete(null);
                }}
                className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deletingId === agentToDelete.id}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {deletingId === agentToDelete.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
