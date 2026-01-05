import React from "react";
import { CheckCircle, Clock, Shield, Zap } from "lucide-react";

export default function AboutSection() {
  const benefits = [
    {
      text: "Build chatbots in minutes, not weeks",
      icon: <Clock className="w-4 h-4 text-white" />,
    },
    {
      text: "No coding skills required—anyone can use it",
      icon: <Zap className="w-4 h-4 text-white" />,
    },
    {
      text: "Enterprise-grade security and privacy",
      icon: <Shield className="w-4 h-4 text-white" />,
    },
    {
      text: "Scale your customer support without scaling costs",
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
            About Our Platform
          </h2>
          <p className="text-xl text-slate-600">
            Empowering businesses to build intelligent chatbots without coding
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
                Building AI chatbots traditionally requires extensive coding knowledge, 
                expensive developers, and weeks of development time. Many businesses 
                want to leverage AI for customer support, lead generation, or automation 
                but lack the technical expertise or budget.
              </p>
              <p className="text-slate-600 mb-8 leading-relaxed text-lg">
                Complex chatbot platforms with steep learning curves prevent teams 
                from quickly deploying AI solutions that could transform their customer 
                experience and operations.
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <Zap className="w-8 h-8 text-emerald-500" />
                Our Solution
              </h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                Our no-code chatbot builder platform empowers anyone to create intelligent 
                AI assistants in minutes. Simply upload your knowledge base, customize 
                your chatbot's personality, and deploy instantly—no coding required. 
                Build chatbots that understand your business and serve your customers 24/7.
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
                  <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
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
