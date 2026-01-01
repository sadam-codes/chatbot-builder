import { Users } from "lucide-react";
import React from "react";
export default function TeamSection() {
  const teamMembers = [
    {
      name: "Sadam Muneer",
      role: "Project Lead & MERN Stack Developer",
      description:
        "Leads the FYP with expertise in MERN stack and AI integration.",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      name: "Faiza Shakeel",
      role: "Frontend Developer",
      description: "Specialist in React and UI/UX design.",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      name: "Hasnain Asad",
      role: "Figma Designer & Content Writer",
      description: "Designs interfaces and creates engaging content.",
      gradient: "from-teal-500 to-cyan-500",
    },
  ];

  return (
    <section id="team" className="py-24 px-4 bg-white/50 backdrop-blur-sm">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
            Meet Our Team
          </h2>
          <p className="text-xl text-slate-600">
            The brilliant minds behind MNSUAM Query Bot
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="group bg-white/80 backdrop-blur-sm border border-white/20 rounded-3xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
            >
              <div
                className={`w-24 h-24 bg-gradient-to-br ${member.gradient} rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <Users className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                {member.name}
              </h3>
              <p className="text-emerald-600 font-semibold mb-4">
                {member.role}
              </p>
              <p className="text-slate-600 leading-relaxed">
                {member.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
