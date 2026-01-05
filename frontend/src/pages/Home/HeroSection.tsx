import { MessageCircle, Users, Star, Zap } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-green-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-teal-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto text-center max-w-5xl relative">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-8 border border-emerald-200/50">
          <Zap className="w-4 h-4" />
          No-Code AI Platform
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-slate-800 mb-8 leading-tight">
          {" "}
          Build AI Chatbots{" "}
          <span className="text-emerald-600">
            {" "}
            Without Code{" "}
          </span>{" "}
        </h1>
        <p className="text-lg md:text-xl text-slate-600 mb-12 leading-relaxed max-w-3xl mx-auto">
          Create intelligent chatbots in minutes. No coding required. Train your AI agents with custom knowledge and deploy them instantly.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
          <button
            onClick={() => navigate("/agents")}
            className="cursor-pointer group bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center gap-3"
          >
            <MessageCircle className="w-6 h-6" />
            Create Agent
          </button>
          <button className="bg-white/80 backdrop-blur-sm hover:bg-white text-slate-700 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border border-slate-200/50">
            Learn More
          </button>
        </div>
        <div className="relative max-w-lg mx-auto">
          <div className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm text-slate-500 mb-2">You</p>
                <div className="bg-emerald-50 p-4 rounded-2xl rounded-tl-md border border-emerald-100">
                  <p className="text-slate-700">
                    How do I create a chatbot for customer support?
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm text-slate-500 mb-2">AI Assistant</p>
                <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-md border border-slate-200">
                  <p className="text-slate-700">
                    Simply create a new agent, upload your knowledge base, and configure your chatbot's personality. No coding needed! 🚀
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
            <Star className="w-4 h-4 text-white" />
          </div>
          <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-400 rounded-full flex items-center justify-center shadow-lg">
            <Zap className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    </section>
  );
}
