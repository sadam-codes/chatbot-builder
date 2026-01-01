import { Mail, Phone, MapPin } from "lucide-react";
import React from "react";

export default function ContactSection() {
  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      info: "info@mnsuam.edu.pk",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      icon: Phone,
      title: "Phone",
      info: "061-9201681",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: MapPin,
      title: "Location",
      info: "Old Shujaabad Road, Multan.",
      gradient: "from-teal-500 to-cyan-500",
    },
  ];

  return (
    <section
      id="contact"
      className="py-24 px-4 bg-gradient-to-br from-slate-50 to-green-50"
    >
      <div className="container mx-auto max-w-4xl text-center">
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
            Get In Touch
          </h2>
          <p className="text-xl text-slate-600">
            Have questions about our Campus Query Bot? We'd love to hear from
            you.
          </p>
        </div>

        <div className="flex flex-col items-center gap-10">
          {contactInfo.map((contact, index) => (
            <div
              key={index}
              className="flex items-center gap-6 group max-w-md w-full"
            >
              <div
                className={`w-14 h-14 bg-gradient-to-br ${contact.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <contact.icon className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-800 text-lg">
                  {contact.title}
                </p>
                <p className="text-slate-600 text-lg">{contact.info}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
