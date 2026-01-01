import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiSend, FiX, FiBookOpen, FiStar, FiSettings, FiHelpCircle, FiLogOut, FiMessageSquare } from "react-icons/fi";
import toast from "react-hot-toast";
import MarkdownRenderer from "../../components/MarkdownRenderer";

interface UserData {
  id?: number;
  name: string;
  email: string;
}

interface Message {
  id: string | number;
  text: string;
  sender: "user" | "bot";
  timestamp: string;
}

interface Agent {
  id: string;
  name: string;
  model: string;
  role: string;
  instructions: string;
}

function UserChat() {
  const { agentId } = useParams<{ agentId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [userData, setUserData] = useState<UserData>({ name: "", email: "" });
  const [agent, setAgent] = useState<Agent | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAgent, setLoadingAgent] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000/api/v1";

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUserData(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (agentId) {
      fetchAgent();
    }
  }, [agentId]);

  const fetchAgent = async () => {
    if (!agentId) return;
    setLoadingAgent(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth");
        return;
      }

      const res = await fetch(`${BACKEND_URL}/chatbot/agents/${agentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 404) {
          toast.error("Agent not found");
          navigate("/agents");
          return;
        }
        throw new Error("Failed to fetch agent");
      }

      const agentData = await res.json();
      setAgent(agentData);
      fetchChatHistory(agentId);
    } catch (err: any) {
      console.error("Error fetching agent:", err);
      toast.error(err.message || "Failed to load agent");
      navigate("/agents");
    } finally {
      setLoadingAgent(false);
    }
  };

  const fetchChatHistory = async (agentId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${BACKEND_URL}/chatbot/history/${agentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch chat history");

      const data = await res.json();
      data.sort(
        (a: any, b: any) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      const backendMessages: Message[] = data.flatMap((m: any) => {
        const msgs: Message[] = [];
        if (m.question) {
          msgs.push({
            id: m.id + "-q",
            text: m.question,
            sender: "user",
            timestamp: new Date(m.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          });
        }
        if (m.answer) {
          msgs.push({
            id: m.id + "-a",
            text: m.answer,
            sender: "bot",
            timestamp: new Date(m.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          });
        }
        return msgs;
      });

      if (backendMessages.length === 0) {
        setMessages([{
          id: "default",
          text: `Hello! I'm ${agent?.name || "your assistant"}. How can I help you today?`,
          sender: "bot",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }]);
      } else {
        setMessages(backendMessages);
      }
    } catch (err) {
      console.error("Error fetching history:", err);
      setMessages([{
        id: "default",
        text: `Hello! I'm ${agent?.name || "your assistant"}. How can I help you today?`,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/auth";
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading || !agentId) return;

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user?.id) {
      console.error("User ID not found.");
      return;
    }

    const newMessage: Message = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${BACKEND_URL}/chatbot/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          agentId: agentId,
          question: newMessage.text,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch bot response");

      const data = await response.json();
      const botMessage: Message = {
        id: Date.now() + 1,
        text: data.answer || "I'm sorry, I couldn't generate a response.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage: Message = {
        id: Date.now() + 2,
        text: "There was an error connecting to the chatbot.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const closeDropdown = () => setIsDropdownOpen(false);

  if (loadingAgent) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading agent...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Agent not found</p>
          <button
            onClick={() => navigate("/agents")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Agents
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* HEADER */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/agents")}>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
            <span className="text-white text-sm font-semibold">A</span>
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {agent.name}
            </h1>
            <p className="text-xs text-slate-500">{agent.role}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-3 rounded-xl bg-white shadow-sm border border-slate-200 hover:bg-slate-50 hover:shadow-md transition-all duration-200 group"
          >
            <FiX className="text-slate-600 text-xl group-hover:text-slate-800 transition-colors" />
          </button>

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
            >
              <span className="hidden sm:inline-block">{userData?.name || "User"}</span>
              <span className={`text-slate-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}>▼</span>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-emerald-50/40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-green-600 flex items-center justify-center">
                      <span className="text-white font-semibold">{userData?.name?.charAt(0)?.toUpperCase() || "U"}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{userData?.name || "Unknown User"}</p>
                      <p className="text-xs text-slate-500 truncate">{userData?.email || "No email"}</p>
                    </div>
                  </div>
                </div>

                <div className="py-1">
                  <Link to="/chathistory" onClick={closeDropdown} className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50">
                    <FiBookOpen className="mr-3 text-emerald-500" /> Chat History
                  </Link>
                  <button className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50" onClick={closeDropdown}>
                    <FiStar className="mr-3 text-emerald-500" /> Upgrade
                  </button>
                  <button className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50" onClick={closeDropdown}>
                    <FiSettings className="mr-3 text-emerald-500" /> Settings
                  </button>
                  <Link to="/help-support">
                    <button className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50" onClick={closeDropdown}>
                      <FiHelpCircle className="mr-3 text-emerald-500" /> Help & Support
                    </button>
                  </Link>

                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <Link to="/agents" onClick={closeDropdown} className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-blue-50">
                      <FiMessageSquare className="mr-3 text-blue-500" /> My Agents
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      <FiLogOut className="mr-3" /> Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* CHAT MESSAGES */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.map((message) => (
              <div key={message.id} className="group">
                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.sender === "user" ? "bg-gray-200" : "bg-gray-900"}`}>
                    <span className={`text-xs font-medium ${message.sender === "user" ? "text-gray-600" : "text-white"}`}>
                      {message.sender === "user" ? userData?.name?.charAt(0)?.toUpperCase() || "U" : "B"}
                    </span>
                  </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">{message.sender === "user" ? "You" : agent.name}</span>
                        <span className="text-xs text-gray-500">{message.timestamp}</span>
                      </div>
                      {message.sender === "bot" ? (
                        <div className="text-gray-800 text-sm leading-relaxed">
                          <MarkdownRenderer content={message.text} />
                        </div>
                      ) : (
                        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                      )}
                    </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-white">A</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">{agent.name}</span>
                    <span className="text-xs text-gray-500">typing...</span>
                  </div>
                  <div className="flex gap-1 text-gray-600">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* INPUT */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <form onSubmit={handleSendMessage}>
            <div className="relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="Ask anything..."
                className="w-full px-4 py-3 pr-12 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                rows={1}
                style={{ minHeight: "48px", maxHeight: "120px" }}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FiSend className="w-4 h-4" />
                )}
              </button>
            </div>
          </form>
        </div>
      </footer>
    </div>
  );
}

export default UserChat;
