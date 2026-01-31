import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

function UserProfile({ user, onClose, onLogout }) {
  const [myProjects, setMyProjects] = useState([]);

  // Fetch only THIS user's projects
  useEffect(() => {
    const fetchMyProjects = async () => {
      if (!user.id) return;
      const q = collection(db, "projects");
      const snapshot = await getDocs(q);
      
      // Filter by User ID inside the author string
      const userProjects = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(p => p.author && p.author.includes(user.id)); 
      
      setMyProjects(userProjects);
    };
    fetchMyProjects();
  }, [user.id]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white/90 backdrop-blur-xl w-full max-w-md rounded-3xl p-6 shadow-2xl border border-white/20 relative">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 font-bold text-xl">&times;</button>

        {/* PROFILE HEADER */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-3xl text-white font-bold shadow-lg mb-3">
            {user.name ? user.name.charAt(0) : "U"}
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
          <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold mt-1">
            {user.role === 'admin' ? 'Administrator' : `Student ID: ${user.id}`}
          </span>
        </div>

        {/* MY SUBMISSIONS LIST */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">My Submissions</h3>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
            {myProjects.length > 0 ? (
              myProjects.map(p => (
                <div key={p.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                  <div className="truncate w-32 font-bold text-gray-700">{p.title}</div>
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    p.status === 'Approved' ? 'bg-green-100 text-green-600' :
                    p.status === 'Rejected' ? 'bg-red-100 text-red-600' :
                    'bg-yellow-100 text-yellow-600'
                  }`}>
                    {p.status || 'Pending'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 text-sm py-4">No projects uploaded yet.</div>
            )}
          </div>
        </div>

        {/* LOGOUT BUTTON */}
        <button 
          onClick={onLogout}
          className="w-full bg-red-50 hover:bg-red-100 text-red-500 font-bold py-3 rounded-xl transition"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}

export default UserProfile;