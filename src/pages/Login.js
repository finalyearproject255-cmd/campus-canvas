import React, { useState } from 'react';
import { db } from '../firebase'; 
import { collection, query, where, getDocs } from 'firebase/firestore';
import { User, Lock, ShieldCheck, ArrowRight, AlertCircle, LayoutGrid, Sparkles } from 'lucide-react';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const formattedUsername = username.trim().toLowerCase();

      // 1. Querying your existing Firebase "users" collection
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", formattedUsername), where("password", "==", password));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // 2. User found! Extract their data
        const userData = querySnapshot.docs[0].data();

        // 3. Save to local storage
        localStorage.setItem('user_info', JSON.stringify({ 
          name: userData.fullName || formattedUsername.toUpperCase(), 
          role: userData.role || 'student', 
          username: userData.username || formattedUsername
        }));

        // 4. Secure Routing
        const userRole = (userData.role || "").toLowerCase();
        if (userRole === 'admin' || formattedUsername === 'admin') {
          onLogin('admin'); 
        } else {
          onLogin('student'); 
        }
      } else {
        setError("Invalid username or password.");
      }

    } catch (err) {
      console.error("Auth Error:", err);
      setError("Failed to connect to the database.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] font-sans selection:bg-indigo-500/30">
      
      {/* ⬅️ LEFT SIDE: Dark Enterprise Branding */}
      <div className="hidden md:flex flex-col justify-center items-center w-1/2 relative overflow-hidden border-r border-white/10 bg-[#050505]">
        
        {/* Deep Glow Effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none"></div>
        
        {/* Brand Content */}
        <div className="relative z-10 text-center flex flex-col items-center p-12">
          <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.3)] mb-8 transform -rotate-3 border border-white/20">
            <LayoutGrid className="w-12 h-12 text-white transform rotate-3" />
          </div>
          
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight mb-6">
            CampusCanvas
          </h1>
          
          <p className="text-lg text-indigo-200/70 font-medium max-w-md mb-10 leading-relaxed">
            The secure, centralized repository for student innovation and academic project portfolios.
          </p>
          
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-5 py-2.5 rounded-full text-xs text-gray-300 font-semibold backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            NIMIT Enterprise Edition
          </div>
        </div>
      </div>

      {/* ➡️ RIGHT SIDE: Dark Form */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-6 relative">
        
        {/* Mobile-only logo (hidden on desktop) */}
        <div className="md:hidden flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
            <LayoutGrid className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">CampusCanvas</h1>
        </div>

        <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.3)]">
          
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-400 text-sm">Sign in with your roll number</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 text-sm font-medium flex items-center gap-2 animate-fade-in-up">
              <AlertCircle className="w-5 h-5 shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Username / Roll No.</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-gray-600 lowercase"
                  placeholder="23bsccs01"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-500" />
                </div>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-gray-600"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full mt-4 py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 transition-all shadow-lg ${isLoading ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:-translate-y-0.5'}`}
            >
              {isLoading ? (
                <span className="animate-pulse">Authenticating...</span>
              ) : (
                <>Secure Login <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-indigo-400" /> 
            Secured by Firebase
          </div>
        </div>
      </div>

    </div>
  );
}

export default Login;