
import React, { useEffect, useState } from "react"
import { FiClock, FiX, FiChevronDown, FiChevronRight, FiMessageSquare } from "react-icons/fi"
import { useNavigate } from "react-router-dom"

interface ChatMessage {
  role: string
  text: string
}

interface ChatHistory {
  id: string
  userId: number
  messages: ChatMessage[]
  createdAt: string
}

export default function ChatHistoryPage() {
  const [history, setHistory] = useState<ChatHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedDate, setExpandedDate] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch("http://localhost:4000/api/v1/chatbot/history", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) throw new Error("Failed to fetch chat history")

        const data = await res.json()

        const transformed: ChatHistory[] = data.map((item: any) => ({
          id: item.id,
          userId: item.userId,
          createdAt: item.createdAt,
          messages: [
            { role: "user", text: item.question },
            { role: "assistant", text: item.answer },
          ],
        }))

        transformed.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

        setHistory(transformed)
      } catch (err) {
        console.error("Error fetching chat history:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading conversation history...</p>
        </div>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <FiMessageSquare className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-700 mb-2">No Conversations Yet</h2>
          <p className="text-slate-500 leading-relaxed">
            Your chat history will appear here once you start having conversations.
          </p>
        </div>
      </div>
    )
  }

  const groupedByDate = history.reduce((groups: any, chat) => {
    const date = new Date(chat.createdAt).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    if (!groups[date]) groups[date] = []
    groups[date].push(chat)
    return groups
  }, {})

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Conversation History</h1>
            <p className="text-slate-600">Review your previous conversations and interactions</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="p-3 rounded-xl bg-white shadow-sm border border-slate-200 hover:bg-slate-50 hover:shadow-md transition-all duration-200 group"
          >
            <FiX className="text-slate-600 text-xl group-hover:text-slate-800 transition-colors" />
          </button>
        </div>

        <div className="space-y-6">
          {Object.keys(groupedByDate).map((date) => {
            const isOpen = expandedDate === date
            const chatCount = groupedByDate[date].length

            return (
              <div
                key={date}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <button
                  onClick={() => setExpandedDate(isOpen ? null : date)}
                  className="flex items-center justify-between w-full px-6 py-5 text-left hover:bg-slate-50 rounded-t-2xl transition-colors"
                >
                  <div>
                    <h3 className="font-semibold text-slate-900 text-lg">{date}</h3>
                    <p className="text-slate-500 text-sm mt-1">
                      {chatCount} conversation{chatCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-medium">
                      {chatCount}
                    </span>
                    {isOpen ? (
                      <FiChevronDown className="text-slate-600 h-5 w-5 transition-transform" />
                    ) : (
                      <FiChevronRight className="text-slate-600 h-5 w-5 transition-transform" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 space-y-4 border-t border-slate-100">
                    {groupedByDate[date].map((chat: ChatHistory, index: number) => (
                      <div
                        key={chat.id}
                        className={`p-5 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors ${
                          index === 0 ? "mt-4" : ""
                        }`}
                      >
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-blue-600 font-semibold text-sm">U</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-slate-800 leading-relaxed">
                                {chat.messages.find((m) => m.role === "user")?.text || ""}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-emerald-600 font-semibold text-sm">AI</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-slate-700 leading-relaxed">
                                {chat.messages.find((m) => m.role === "assistant")?.text || ""}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-slate-500 pt-2 border-t border-slate-200">
                            <FiClock className="h-4 w-4" />
                            <span>
                              {new Date(chat.createdAt).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
