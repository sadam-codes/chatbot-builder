import {
  Clock,
  MessageCircle,
  Shield,
  BookOpen,
  Users,
  MapPin,
} from "lucide-react";
import React from "react";

export default function FeaturesSection() {
  const features = [
    {
      icon: Clock,
      title: "No-Code Builder",
      description:
        "Create powerful AI chatbots without writing a single line of code. Visual interface makes it easy for everyone.",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      icon: MessageCircle,
      title: "Instant Deployment",
      description:
        "Deploy your chatbot in minutes. Train it with your knowledge base and start conversations immediately.",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description:
        "Enterprise-grade security. Your data and conversations are encrypted and never shared with third parties.",
      gradient: "from-teal-500 to-cyan-500",
    },
    {
      icon: BookOpen,
      title: "Custom Knowledge Base",
      description:
        "Upload documents, FAQs, or connect data sources. Your chatbot learns from your content instantly.",
      gradient: "from-orange-500 to-amber-500",
    },
    {
      icon: Users,
      title: "Easy to Use",
      description:
        "Intuitive interface that anyone can master. Build, customize, and manage chatbots with ease.",
      gradient: "from-pink-500 to-rose-500",
    },
    {
      icon: MapPin,
      title: "Multi-Channel Support",
      description:
        "Deploy your chatbot across websites, mobile apps, and messaging platforms with one click.",
      gradient: "from-violet-500 to-purple-500",
    },
  ];

  return (
    <section id="features" className="py-24 px-4 bg-white/50 backdrop-blur-sm">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
            Why Choose{" "}
            <span className="text-emerald-600">
               Chatbot Builder?
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Build intelligent chatbots that understand your business. No coding skills required.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white/80 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
            >
              <div
                className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
