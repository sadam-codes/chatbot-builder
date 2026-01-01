import React from "react";
import { CheckCircle, Clock, Shield, Zap } from "lucide-react";

export default function AboutSection() {
  const benefits = [
    {
      text: "No delays, no confusion, no wasted time",
      icon: <Clock className="w-4 h-4 text-white" />,
    },
    {
      text: "Always available, always accurate",
      icon: <Zap className="w-4 h-4 text-white" />,
    },
    {
      text: "Respectful of privacy and confidentiality",
      icon: <Shield className="w-4 h-4 text-white" />,
    },
    {
      text: "Making campus life easier, faster, and smarter",
      icon: <CheckCircle className="w-4 h-4 text-white" />,
    },
  ];

  return (
    <section
      id="about"
      className="py-24 px-4 bg-gradient-to-br from-slate-50 to-emerald-50"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
            About Our Project
          </h2>
          <p className="text-xl text-slate-600">
            Revolutionizing campus communication through intelligent AI
            technology
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div>
              <h3 className="text-3xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <Clock className="w-8 h-8 text-red-500" />
                The Problem We Solve
              </h3>
              <p className="text-slate-600 mb-6 leading-relaxed text-lg">
                Imagine joining campus for the first time and having dozens of
                questions about admission deadlines, fee structures, faculty
                qualifications, available courses, campus timings, or how to
                apply for hostel/transport.
              </p>
              <p className="text-slate-600 mb-8 leading-relaxed text-lg">
                Currently, students must search multiple web pages, make calls,
                or disturb busy faculty and staff.
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <Zap className="w-8 h-8 text-emerald-500" />
                Our Solution
              </h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                Our Campus Query Bot is a smart AI-powered assistant, available
                24/7, providing instant, accurate answers about admissions,
                academics, events, and campus facilities in clear, simple
                language.
              </p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-3xl p-10 shadow-2xl">
            <h4 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
              Key Benefits
            </h4>
            <ul className="space-y-6">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-green-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    {benefit.icon}
                  </div>
                  <span className="text-slate-600 text-lg leading-relaxed">
                    {benefit.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
