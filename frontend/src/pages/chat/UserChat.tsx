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
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api/v1";

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUserData(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (agentId) {
      fetchAgent();
    }
  }, [agentId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isLoading]);

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
      
      // Scroll to bottom after loading history
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }, 100);
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
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* HEADER - Beautiful & Responsive */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Agent Info */}
            <div 
              className="flex items-center gap-2 sm:gap-3 cursor-pointer group flex-1 min-w-0"
              onClick={() => navigate("/agents")}
            >
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <span className="text-white text-sm sm:text-base font-bold">{agent.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent truncate">
                  {agent.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 truncate hidden sm:block">{agent.role}</p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Close Button - Hidden on mobile */}
              <button
                onClick={() => navigate(-1)}
                className="hidden sm:flex p-2.5 sm:p-3 rounded-xl bg-white shadow-sm border border-slate-200 hover:bg-gradient-to-br hover:from-slate-50 hover:to-slate-100 hover:shadow-md transition-all duration-200 group"
                aria-label="Go back"
              >
                <FiX className="text-slate-600 text-lg sm:text-xl group-hover:text-slate-800 transition-colors" />
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all shadow-sm hover:shadow-md"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-sm">
                    <span className="text-white text-xs sm:text-sm font-semibold">
                      {userData?.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <span className="hidden md:inline-block truncate max-w-[100px]">{userData?.name || "User"}</span>
                  <span className={`text-slate-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""} hidden sm:inline-block`}>▼</span>
                </button>

                {isDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={closeDropdown}
                    ></div>
                    <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-4 border-b border-slate-100 bg-gradient-to-br from-emerald-50 to-green-50">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md">
                            <span className="text-white font-bold text-lg">{userData?.name?.charAt(0)?.toUpperCase() || "U"}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">{userData?.name || "Unknown User"}</p>
                            <p className="text-xs text-slate-600 truncate">{userData?.email || "No email"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="py-2">
                        <Link to="/chathistory" onClick={closeDropdown} className="flex items-center w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 transition-all group">
                          <FiBookOpen className="mr-3 text-emerald-500 group-hover:scale-110 transition-transform" /> 
                          <span className="font-medium">Chat History</span>
                        </Link>
                        <button className="flex items-center w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-yellow-50 transition-all group" onClick={closeDropdown}>
                          <FiStar className="mr-3 text-amber-500 group-hover:scale-110 transition-transform" /> 
                          <span className="font-medium">Upgrade</span>
                        </button>
                        <button className="flex items-center w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-gradient-to-r hover:from-slate-50 hover:to-gray-50 transition-all group" onClick={closeDropdown}>
                          <FiSettings className="mr-3 text-slate-500 group-hover:scale-110 transition-transform" /> 
                          <span className="font-medium">Settings</span>
                        </button>
                        <Link to="/help-support">
                          <button className="flex items-center w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all group" onClick={closeDropdown}>
                            <FiHelpCircle className="mr-3 text-blue-500 group-hover:scale-110 transition-transform" /> 
                            <span className="font-medium">Help & Support</span>
                          </button>
                        </Link>

                        <div className="border-t border-slate-100 my-1"></div>
                        <Link to="/agents" onClick={closeDropdown} className="flex items-center w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all group">
                          <FiMessageSquare className="mr-3 text-blue-500 group-hover:scale-110 transition-transform" /> 
                          <span className="font-medium">My Agents</span>
                        </Link>

                        <div className="border-t border-slate-100 my-1"></div>
                        <button onClick={handleLogout} className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 transition-all group">
                          <FiLogOut className="mr-3 group-hover:scale-110 transition-transform" /> 
                          <span className="font-medium">Logout</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* CHAT MESSAGES - Beautiful Design */}
      <main className="flex-1 overflow-hidden bg-gradient-to-b from-transparent via-slate-50/30 to-transparent">
        <div className="h-full overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 space-y-4 sm:space-y-6">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex items-start gap-3 sm:gap-4 group animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                  message.sender === "user" ? "flex-row-reverse" : ""
                }`}
              >
                {/* Avatar */}
                <div className={`flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 ${
                  message.sender === "user" 
                    ? "bg-gradient-to-br from-blue-500 to-indigo-600" 
                    : "bg-gradient-to-br from-slate-800 via-slate-900 to-black"
                }`}>
                  <span className={`text-sm sm:text-base font-bold ${
                    message.sender === "user" ? "text-white" : "text-white"
                  }`}>
                    {message.sender === "user" ? userData?.name?.charAt(0)?.toUpperCase() || "U" : agent.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Message Content */}
                <div className={`flex-1 min-w-0 ${message.sender === "user" ? "flex flex-col items-end" : ""}`}>
                  <div className={`inline-block max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-lg transition-all duration-300 hover:shadow-xl ${
                    message.sender === "user"
                      ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-sm"
                      : "bg-white text-slate-800 border border-slate-100 rounded-bl-sm"
                  }`}>
                    <div className={`flex items-center gap-2 mb-1.5 ${
                      message.sender === "user" ? "justify-end" : ""
                    }`}>
                      <span className={`text-xs sm:text-sm font-semibold ${
                        message.sender === "user" ? "text-blue-100" : "text-slate-600"
                      }`}>
                        {message.sender === "user" ? "You" : agent.name}
                      </span>
                      <span className={`text-xs ${
                        message.sender === "user" ? "text-blue-200" : "text-slate-400"
                      }`}>
                        {message.timestamp}
                      </span>
                    </div>
                    {message.sender === "bot" ? (
                      <div className="text-sm sm:text-base leading-relaxed prose prose-sm max-w-none">
                        <MarkdownRenderer content={message.text} />
                      </div>
                    ) : (
                      <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap text-white">{message.text}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-start gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-black flex items-center justify-center shadow-lg">
                  <span className="text-sm sm:text-base font-bold text-white">{agent.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="inline-block bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs sm:text-sm font-semibold text-slate-600">{agent.name}</span>
                      <span className="text-xs text-slate-400">typing...</span>
                    </div>
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* INPUT - Beautiful Design */}
      <footer className="border-t border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-lg">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-5">
          <form onSubmit={handleSendMessage} className="relative">
            <div className="relative bg-white rounded-2xl border-2 border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                className="w-full px-4 sm:px-5 py-3 sm:py-4 pr-12 sm:pr-14 text-sm sm:text-base text-slate-800 placeholder-slate-400 bg-transparent rounded-2xl resize-none focus:outline-none transition-all"
                rows={1}
                style={{ minHeight: "52px", maxHeight: "160px" }}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-white bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
              >
                {isLoading ? (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FiSend className="w-4 h-4 sm:w-5 sm:h-5" />
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
