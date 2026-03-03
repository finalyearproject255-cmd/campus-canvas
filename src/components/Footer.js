import React from 'react';
import { LayoutGrid, Github, Linkedin, Mail } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-white/10 py-12 px-6 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        
        {/* Brand Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <LayoutGrid className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">CampusCanvas</h2>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
            NIMIT's premium project repository for showcasing academic excellence and student innovation.
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-4">Platform</h4>
            {/* 🚨 FIXED: Changed href to #! to stop warnings */}
            <a href="#!" className="block text-gray-500 hover:text-indigo-400 text-sm transition-colors">Repository</a>
            <a href="#!" className="block text-gray-500 hover:text-indigo-400 text-sm transition-colors">Admin Portal</a>
          </div>
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-4">Resources</h4>
            <a href="#!" className="block text-gray-500 hover:text-indigo-400 text-sm transition-colors">NIMIT Portal</a>
            <a href="#!" className="block text-gray-500 hover:text-indigo-400 text-sm transition-colors">Documentation</a>
          </div>
        </div>

        {/* Contact/Social */}
        <div className="space-y-4">
          <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-4">Connect</h4>
          <div className="flex gap-4">
            <a href="#!" className="p-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-indigo-600 transition-all">
              <Github className="w-5 h-5" />
            </a>
            <a href="#!" className="p-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-indigo-600 transition-all">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="#!" className="p-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-indigo-600 transition-all">
              <Mail className="w-5 h-5" />
            </a>
          </div>
          <p className="text-xs text-gray-600 mt-4 font-medium">
            © 2026 NIMIT • Engineered for Excellence
          </p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;