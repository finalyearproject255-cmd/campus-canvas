import React from 'react';

function Footer() {
  return (
    <footer className="bg-indigo-950/80 backdrop-blur-xl text-blue-200 py-8 border-t border-white/10 mt-auto w-full">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        
        <div className="text-center md:text-left">
          <h2 className="text-xl font-bold text-white tracking-tight">CampusCanvas</h2>
          <p className="text-sm opacity-60">University Project Repository</p>
        </div>

        <div className="text-sm opacity-60">
          &copy; {new Date().getFullYear()} Built by <span className="text-white font-bold">Your Name</span>
        </div>

        <div className="flex gap-4 text-sm font-bold">
          <span className="hover:text-white transition cursor-pointer">About</span>
          <span className="hover:text-white transition cursor-pointer">Privacy</span>
          <span className="hover:text-white transition cursor-pointer">Admin</span>
        </div>

      </div>
    </footer>
  );
}

export default Footer;