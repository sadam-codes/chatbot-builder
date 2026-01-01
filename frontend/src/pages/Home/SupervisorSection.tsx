import { Star, Mail } from "lucide-react";
import React from "react";
import israrImage from "../../assets/sirisrar.jpg";

export default function SupervisorSection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Star className="w-4 h-4" />
            Project Supervisor
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
            Under Expert Guidance
          </h2>
          <p className="text-xl text-slate-600">
            This project was developed under the mentorship of our esteemed
            supervisor
          </p>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/50 to-teal-100/50 rounded-3xl transform rotate-1"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-teal-100/50 to-emerald-100/50 rounded-3xl transform -rotate-1"></div>
          <div className="relative bg-white/90 backdrop-blur-sm border-2 border-emerald-200/10 rounded-3xl p-12 text-center shadow-2xl">
            <div className="relative mb-8 z-10">
              <img
                src={israrImage}
                alt="Dr. Israr Hussain"
                className="w-32 h-32 rounded-full mx-auto object-cover shadow-2xl relative z-10"
              />
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl font-bold text-slate-800">
                Israr Hussain
              </h3>
              <div className="inline-block bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-2 rounded-full font-semibold">
                Lecturer – Project Supervisor & Mentor
              </div>
              <p className="text-lg text-slate-700 leading-relaxed max-w-2xl mx-auto">
                Master of Science in Information Technology (IT) with expertise
                in academic research and project supervision. Guided our team
                through the development of this innovative campus query
                solution.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-8">
                <div className="bg-emerald-50 rounded-2xl p-4">
                  <div className="text-2xl font-bold text-emerald-600">MSc</div>
                  <div className="text-sm text-slate-600">
                    Information Technology
                  </div>
                </div>
                <div className="bg-teal-50 rounded-2xl p-4">
                  <div className="text-2xl font-bold text-teal-600">7</div>
                  <div className="text-sm text-slate-600">Publications</div>
                </div>
                <div className="bg-cyan-50 rounded-2xl p-4 flex flex-col items-center">
                  <Mail className="w-5 h-5 text-cyan-600 mb-1" />
                  <a
                    href="mailto:israr.hussain@mnsuam.edu.pk"
                    className="text-sm text-cyan-600 hover:underline"
                  >
                    israr.hussain@mnsuam.edu.pk
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
