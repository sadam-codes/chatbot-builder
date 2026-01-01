import { MessageCircle } from "lucide-react";
import React from "react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-6 px-4 text-center">
      <div className="flex items-center justify-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-green-600 rounded-xl flex items-center justify-center shadow-md">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <span className="text-sm text-slate-400">
          © 2025 MNSUAM Query Bot — Making campus life smarter for everyone.
        </span>
      </div>
    </footer>
  );
}
