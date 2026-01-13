import { MessageCircle, Users, Star, Zap } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="py-10 px-4 relative overflow-hidden">
      <div className="container mx-auto text-center max-w-5xl relative">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-8 border">
          <Zap className="w-4 h-4" />
          No-Code AI Platform
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-slate-800 mb-8 leading-tight">
          {" "}
          Build AI Chatbots{" "}
          <span className="text-emerald-600"> Without Code </span>{" "}
        </h1>
        <p className="text-lg md:text-xl text-slate-600 mb-12 leading-relaxed max-w-3xl mx-auto">
          Create intelligent chatbots in minutes. No coding required. Train your
          AI agents with custom knowledge and deploy them instantly.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
          <button
            onClick={() => navigate("/agents")}
            className="cursor-pointer group bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center gap-3"
          >
            <MessageCircle className="w-6 h-6" />
            Create Agent
          </button>
          {/* <button className="bg-white/80 backdrop-blur-sm hover:bg-white text-slate-700 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border border-slate-200/50">
            Learn More
          </button> */}
        </div>
      </div>
    </section>
  );
}
