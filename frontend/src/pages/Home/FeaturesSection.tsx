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
      title: "24/7 Availability",
      description:
        "Get instant answers anytime, day or night. No more waiting for office hours or busy phone lines.",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      icon: MessageCircle,
      title: "Instant Responses",
      description:
        "Get accurate information about admissions, courses, fees, faculty, and campus facilities in seconds.",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: Shield,
      title: "Privacy Protected",
      description:
        "Your conversations are secure. We never share confidential details like salaries or personal data.",
      gradient: "from-teal-500 to-cyan-500",
    },
    {
      icon: BookOpen,
      title: "Comprehensive Knowledge",
      description:
        "From course details to hostel applications, get information about every aspect of campus life.",
      gradient: "from-orange-500 to-amber-500",
    },
    {
      icon: Users,
      title: "User-Friendly",
      description:
        "Simple, conversational interface that understands natural language. No technical expertise required.",
      gradient: "from-pink-500 to-rose-500",
    },
    {
      icon: MapPin,
      title: "Campus Navigation",
      description:
        "Get directions, timings, and information about campus facilities, events, and services.",
      gradient: "from-violet-500 to-purple-500",
    },
  ];

  return (
    <section id="features" className="py-24 px-4 bg-white/50 backdrop-blur-sm">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
            Why Choose This{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
               Query Bot?
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Experience the future of campus assistance with our intelligent,
            always-available AI companion.
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
