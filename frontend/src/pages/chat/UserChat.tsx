import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiSend, FiX, FiBookOpen, FiStar, FiSettings, FiHelpCircle, FiLogOut, FiMessageSquare, FiMic, FiSquare, FiVolume2, FiVolumeX, FiPlay } from "react-icons/fi";
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
  audioUrl?: string; // For user recording replay
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
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioQueue, setAudioQueue] = useState<string[]>([]);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const sentenceBufferRef = useRef<string>("");
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem("chat_muted") === "true");
  const [playingMessageId, setPlayingMessageId] = useState<string | number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  // @ts-ignore
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

  // --- Synchronized Audio Logic ---
  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    localStorage.setItem("chat_muted", String(newMuted));

    if (newMuted) {
      // Stop everything
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
      setAudioQueue([]);
      setIsAudioPlaying(false);
      setPlayingMessageId(null);
      sentenceBufferRef.current = "";
    }
  };

  const playAudioChunk = async (text: string, force = false) => {
    if (!text.trim() || (isMuted && !force)) return;
    try {
      const response = await fetch(`${BACKEND_URL}/chatbot/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) throw new Error("TTS failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioQueue(prev => [...prev, url]);
    } catch (err) {
      console.error("Audio Fetch Error:", err);
    }
  };

  useEffect(() => {
    if (audioQueue.length > 0 && !isAudioPlaying) {
      playNextInQueue();
    }
  }, [audioQueue, isAudioPlaying]);

  const playNextInQueue = () => {
    if (audioQueue.length === 0) return;

    setIsAudioPlaying(true);
    const nextUrl = audioQueue[0];

    const audio = new Audio(nextUrl);
    audioPlayerRef.current = audio;

    audio.onended = () => {
      setAudioQueue(prev => prev.slice(1));
      setIsAudioPlaying(false);
      if (audioQueue.length <= 1) {
        setPlayingMessageId(null);
      }
      URL.revokeObjectURL(nextUrl);
    };

    audio.play().catch(err => {
      console.error("Playback error:", err);
      setIsAudioPlaying(false);
      setAudioQueue(prev => prev.slice(1));
    });
  };

  const processTextForAudio = (text: string, isFinal = false) => {
    sentenceBufferRef.current += text;
    // Aggressive sentence detection: match punctuation without requiring space
    const sentences = sentenceBufferRef.current.match(/[^.!?]+[.!?]+/g);

    if (sentences) {
      sentences.forEach(s => {
        playAudioChunk(s.trim());
        sentenceBufferRef.current = sentenceBufferRef.current.replace(s, "");
      });
    }

    if (isFinal && sentenceBufferRef.current.trim()) {
      playAudioChunk(sentenceBufferRef.current.trim());
      sentenceBufferRef.current = "";
    }
  };

  const replayMessage = async (message: Message) => {
    // Clear current queue and stop current audio
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    setAudioQueue([]);
    setIsAudioPlaying(false);
    setPlayingMessageId(message.id);

    // Play full text (ignore global mute for manual replay)
    playAudioChunk(message.text, true);
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
      await performStreamingQuery(newMessage.text);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const performStreamingQuery = async (question: string) => {
    const token = localStorage.getItem("token");
    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/chatbot/stream-query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ agentId, question }),
      });

      if (!response.ok) throw new Error("Failed to fetch bot response");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader found");

      const botMessageId = Date.now() + 1;
      setPlayingMessageId(botMessageId);
      const botMessage: Message = {
        id: botMessageId,
        text: "",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMessage]);

      let accumulatedText = "";
      sentenceBufferRef.current = ""; // Reset buffer for new stream
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.replace("data: ", "").trim();
            if (dataStr === "[DONE]") {
              processTextForAudio("", true); // Flush remaining buffer
              break;
            }

            try {
              const data = JSON.parse(dataStr);
              if (data.content) {
                accumulatedText += data.content;
                processTextForAudio(data.content); // Process for audio
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === botMessageId ? { ...msg, text: accumulatedText } : msg
                  )
                );
              }
            } catch (err) {
              console.warn("Parse error in stream:", err);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      const errorMessage: Message = {
        id: Date.now() + 2,
        text: "There was an error connecting to the chatbot.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setAudioChunks((prev) => [...prev, e.data]);
        }
      };

      recorder.onstop = async () => {
        // This will be handled in stopRecording to have access to the final chunks
      };

      setMediaRecorder(recorder);
      setAudioChunks([]);
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      toast.error("Could not access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorder && isRecording) {
      // Temporarily remove the listener so sendVoiceMessage isn't triggered
      mediaRecorder.ondataavailable = null;
      mediaRecorder.onstop = null;

      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());

      setAudioChunks([]);
      setMediaRecorder(null);
      setIsRecording(false);
      toast.success("Recording cancelled");
    }
  };

  // Effect to handle sending audio once chunks are collected
  useEffect(() => {
    if (!isRecording && audioChunks.length > 0 && mediaRecorder) {
      sendVoiceMessage();
    }
  }, [isRecording, audioChunks]);

  const sendVoiceMessage = async () => {
    if (audioChunks.length === 0 || !agentId) return;

    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    if (audioBlob.size < 100) return;

    // Create a local URL for replaying the user's voice
    const userAudioUrl = URL.createObjectURL(audioBlob);

    setIsLoading(true);
    setAudioChunks([]);
    setMediaRecorder(null);

    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    try {
      const token = localStorage.getItem("token");
      // 1. Transcribe
      const transRes = await fetch(`${BACKEND_URL}/chatbot/transcribe`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!transRes.ok) throw new Error("Transcription failed");
      const { text } = await transRes.json();

      // 2. Add user message with audioUrl
      const newMessage: Message = {
        id: Date.now(),
        text: text,
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        audioUrl: userAudioUrl,
      };

      setMessages((prev) => [...prev, newMessage]);
      setInputMessage("");

      // 3. Start streaming query
      await performStreamingQuery(text);

    } catch (err) {
      console.error(err);
      toast.error("Failed to process voice message");
      URL.revokeObjectURL(userAudioUrl); // Cleanup if failed
    } finally {
      setIsLoading(false);
    }
  };

  const closeDropdown = () => setIsDropdownOpen(false);

  // Get background image based on agent
  const getAgentBackground = () => {
    if (agent) {
      // Use agent name or role to determine background
      const agentName = agent.name.toLowerCase();
      if (agentName.includes('support') || agentName.includes('help')) {
        return 'help.jpg';
      } else if (agentName.includes('agent') || agent.role.toLowerCase().includes('assistant')) {
        return 'agent.png';
      }
    }
    return 'agenBg.png'; // Default background
  };

  if (loadingAgent) {
    return (
      <div className="flex items-center justify-center h-screen bg-emerald-50">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading agent...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex items-center justify-center h-screen bg-emerald-50">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Agent not found</p>
          <button
            onClick={() => navigate("/agents")}
            className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Go to Agents
          </button>
        </div>
      </div>
    );
  }

  const bgImage = getAgentBackground();

  return (
    <div className="flex flex-col h-screen relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 opacity-[0.03] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(/src/assets/${bgImage})`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/40 via-white/50 to-emerald-50/30" />

      <div className="flex flex-col h-screen relative z-10">
        {/* HEADER - Light & Minimal */}
        <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-3">
              {/* Left: Agent Info */}
              <div
                className="flex items-center gap-2 sm:gap-3 cursor-pointer group flex-1 min-w-0"
                onClick={() => navigate("/agents")}
              >
                <div className="relative">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-500/90 flex items-center justify-center shadow-sm group-hover:shadow transition-all duration-300 group-hover:scale-105">
                    <span className="text-white text-sm sm:text-base font-medium">{agent.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-emerald-400 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-base sm:text-lg md:text-xl font-medium text-slate-800 truncate">
                    {agent.name}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 truncate hidden sm:block">{agent.role}</p>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Close Button - Hidden on mobile */}
                <button
                  onClick={() => navigate("/agents")}
                  className="hidden sm:flex p-2.5 sm:p-3 rounded-lg bg-white/80 hover:bg-white transition-all duration-200 group"
                  aria-label="Go back"
                >
                  <FiX className="text-slate-500 text-lg sm:text-xl group-hover:text-slate-700 transition-colors" />
                </button>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white/80 hover:bg-white rounded-lg transition-all"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500/90 flex items-center justify-center">
                      <span className="text-white text-xs sm:text-sm font-medium">
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
                      <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white/95 backdrop-blur-md border border-slate-100 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-4 border-b border-slate-100 bg-emerald-50/50">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/90 flex items-center justify-center">
                              <span className="text-white font-medium text-lg">{userData?.name?.charAt(0)?.toUpperCase() || "U"}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-800 truncate">{userData?.name || "Unknown User"}</p>
                              <p className="text-xs text-slate-600 truncate">{userData?.email || "No email"}</p>
                            </div>
                          </div>
                        </div>

                        <div className="py-2">
                          <Link to="/chathistory" onClick={closeDropdown} className="flex items-center w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50/50 transition-colors group">
                            <FiBookOpen className="mr-3 text-emerald-500 group-hover:scale-105 transition-transform" />
                            <span className="font-normal">Chat History</span>
                          </Link>
                          <button className="flex items-center w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-amber-50/50 transition-colors group" onClick={closeDropdown}>
                            <FiStar className="mr-3 text-amber-500 group-hover:scale-105 transition-transform" />
                            <span className="font-normal">Upgrade</span>
                          </button>
                          <button className="flex items-center w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors group" onClick={closeDropdown}>
                            <FiSettings className="mr-3 text-slate-500 group-hover:scale-105 transition-transform" />
                            <span className="font-normal">Settings</span>
                          </button>
                          <Link to="/help-support">
                            <button className="flex items-center w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50/50 transition-colors group" onClick={closeDropdown}>
                              <FiHelpCircle className="mr-3 text-emerald-500 group-hover:scale-105 transition-transform" />
                              <span className="font-normal">Help & Support</span>
                            </button>
                          </Link>

                          <div className="border-t border-slate-100 my-1"></div>
                          <Link to="/agents" onClick={closeDropdown} className="flex items-center w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50/50 transition-colors group">
                            <FiMessageSquare className="mr-3 text-emerald-500 group-hover:scale-105 transition-transform" />
                            <span className="font-normal">My Agents</span>
                          </Link>

                          <div className="border-t border-slate-100 my-1"></div>
                          <button onClick={handleLogout} className="flex items-center w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50/50 transition-colors group">
                            <FiLogOut className="mr-3 group-hover:scale-105 transition-transform" />
                            <span className="font-normal">Logout</span>
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

        {/* CHAT MESSAGES - Light & Airy */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto custom-scrollbar">
            <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 space-y-4 sm:space-y-5">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-2.5 sm:gap-3 group ${message.sender === "user" ? "flex-row-reverse" : ""
                    }`}
                >
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${message.sender === "user"
                    ? "bg-slate-800"
                    : "bg-emerald-600"
                    }`}>
                    <span className="text-sm font-medium text-white">
                      {message.sender === "user" ? userData?.name?.charAt(0)?.toUpperCase() || "U" : agent.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Message Content */}
                  <div className={`flex-1 min-w-0 ${message.sender === "user" ? "flex flex-col items-end" : ""}`}>
                    <div className={`inline-block max-w-[90%] sm:max-w-[85%] rounded-[20px] px-4 py-3 shadow-sm transition-all duration-200 ${message.sender === "user"
                      ? "bg-emerald-600 text-white rounded-tr-sm"
                      : "bg-white text-slate-800 border border-slate-100 rounded-tl-sm"
                      }`}>
                      <div className={`flex items-center gap-2 mb-1.5 ${message.sender === "user" ? "justify-end" : ""
                        }`}>
                        <span className={`text-[11px] font-semibold uppercase tracking-wider ${message.sender === "user" ? "text-emerald-100" : "text-slate-400"
                          }`}>
                          {message.sender === "user" ? "You" : agent.name}
                        </span>
                        <span className={`text-[11px] ${message.sender === "user" ? "text-emerald-200/70" : "text-slate-300"
                          }`}>
                          {message.timestamp}
                        </span>
                      </div>
                      {message.sender === "bot" ? (
                        <>
                          <div className="text-sm sm:text-base leading-relaxed prose max-w-none">
                            <MarkdownRenderer content={message.text} />
                          </div>
                          <button
                            onClick={() => {
                              if (playingMessageId === message.id) {
                                toggleMute();
                              } else {
                                if (isMuted) {
                                  setIsMuted(false);
                                  localStorage.setItem("chat_muted", "false");
                                }
                                replayMessage(message);
                              }
                            }}
                            className={`mt-2 transition-all duration-200 p-1.5 px-3 -ml-1 flex items-center gap-1.5 rounded-lg border shadow-sm ${playingMessageId === message.id
                              ? "text-red-600 border-red-100 bg-red-50 hover:bg-red-100"
                              : isMuted
                                ? "text-slate-400 border-slate-200 bg-slate-50 opacity-70 hover:opacity-100 hover:border-emerald-100 hover:bg-emerald-50 hover:text-emerald-600"
                                : "text-slate-500 border-slate-200 bg-white hover:text-emerald-600 hover:border-emerald-100 hover:bg-emerald-50"
                              }`}
                            title={playingMessageId === message.id ? "Stop/Mute" : "Speak/Unmute"}
                          >
                            {playingMessageId === message.id ? (
                              <>
                                <FiVolumeX className="w-4 h-4" />
                                <span className="text-[10px] uppercase font-bold tracking-tight">Stop</span>
                              </>
                            ) : (
                              <>
                                <FiVolume2 className="w-4 h-4" />
                                <span className="text-[10px] uppercase font-bold tracking-tight">Speak</span>
                              </>
                            )}
                          </button>
                        </>
                      ) : (
                        <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap text-white">{message.text}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-700/90 flex items-center justify-center">
                    <span className="text-xs sm:text-sm font-medium text-white">{agent.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="inline-block bg-white/80 backdrop-blur-sm rounded-2xl rounded-bl-md px-3.5 py-2.5">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-xs font-medium text-slate-600">{agent.name}</span>
                        <span className="text-xs text-slate-400">typing...</span>
                      </div>
                      <div className="flex gap-1.5">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </main>

        {/* INPUT - ChatGPT Style */}
        <footer className="sticky bottom-0 z-50 pt-2 pb-4 sm:pb-6 px-3 sm:px-4 md:px-6">
          <div className="max-w-4xl mx-auto relative">
            {/* Subtle gradient behind input */}
            <div className="absolute -inset-x-10 -top-20 bottom-0 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none -z-10" />

            <form onSubmit={handleSendMessage} className="relative group">
              <div className="relative bg-white border border-slate-200 shadow-sm rounded-[24px] overflow-hidden transition-all duration-300 focus-within:border-emerald-500/50 focus-within:shadow-md focus-within:ring-4 focus-within:ring-emerald-500/5">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder="Type your message..."
                  className="w-full px-5 py-4 pr-24 text-sm sm:text-base text-slate-800 placeholder-slate-400 bg-transparent rounded-2xl resize-none focus:outline-none transition-all"
                  rows={1}
                  style={{ minHeight: "56px", maxHeight: "160px" }}
                  disabled={isLoading || isRecording}
                />
                <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 sm:gap-2">
                  {isRecording && (
                    <button
                      type="button"
                      onClick={cancelRecording}
                      className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                      title="Cancel Recording"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isLoading}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${isRecording
                      ? "bg-red-500 text-white animate-pulse"
                      : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                      }`}
                    title={isRecording ? "Stop & Send" : "Record Voice Message"}
                  >
                    {isRecording ? <FiSquare className="w-4 h-4" /> : <FiMic className="w-5 h-5" />}
                  </button>
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading || isRecording}
                    className="w-9 h-9 flex items-center justify-center text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FiSend className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default UserChat;
