import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username), where("password", "==", password));
      
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0].data();
        
        // ✅ CRITICAL UPDATE: We now save the 'role' too!
        localStorage.setItem('user_info', JSON.stringify({
          name: userDoc.fullName,
          id: userDoc.username,
          role: userDoc.role // <--- This allows Admin powers
        }));

        onLogin(userDoc.role); 
      } else {
        setError('Invalid ID or Password. Please try again.');
      }

    } catch (err) {
      console.error("Login Error:", err);
      setError("Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* LEFT SIDE: Visuals */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 relative items-center justify-center overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

        <div className="relative z-10 text-center p-10">
          <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">CampusCanvas</h1>
          <p className="text-xl text-blue-200">Institutional Project Repository</p>
          <div className="mt-8 border-t border-white/20 w-24 mx-auto"></div>
          <p className="mt-8 text-sm text-blue-300">Secure Access Portal • University of Mangbly</p>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 relative">
        <div className="w-full max-w-md p-8 relative z-10">
          <div className="bg-white/80 md:bg-white backdrop-blur-xl rounded-2xl shadow-2xl p-10 border border-white/20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
              <p className="text-gray-500 mt-2">Please enter your credentials</p>
            </div>

            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-6 text-sm rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number / ID</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none"
                  placeholder="e.g. 23bsccs01"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-lg shadow-lg transform transition hover:scale-[1.02] duration-200 disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Access Portal →"}
              </button>
            </form>

            <p className="mt-8 text-center text-xs text-gray-400">
              Authorized Personnel Only. <br/>Contact Admin for access issues.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;