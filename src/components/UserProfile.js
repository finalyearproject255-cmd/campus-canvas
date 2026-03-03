import React, { useState, useEffect } from 'react';
import { X, LogOut, Mail, FolderGit2, Loader2, LayoutGrid, Trash2, ImagePlus } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';

function UserProfile({ user, onClose, onLogout }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // 🚨 SMART FALLBACK: Handles Name, name, or fullName dynamically
  const displayUserName = user?.name || user?.Name || user?.fullName || "Unknown User";

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user) return;
      try {
        const querySnapshot = await getDocs(collection(db, "projects"));
        const allProjects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const myProjects = allProjects.filter(project => {
          // 🚨 Now using displayUserName so it finds projects regardless of how the user was saved
          const matchName = project.authorName === displayUserName;
          const matchUsername = project.authorUsername === user.username;
          const exactOldFormat = `${displayUserName}(${user.username})`;
          const spacedOldFormat = `${displayUserName} (${user.username})`;
          const matchLegacyAuthor = project.author === exactOldFormat || project.author === spacedOldFormat || project.author === displayUserName || (project.author && project.author.includes(user.username));
          
          return matchName || matchUsername || matchLegacyAuthor;
        });
        
        myProjects.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setSubmissions(myProjects);
      } catch (error) {
        console.error("Error fetching user submissions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [user, displayUserName]);

  // --- ACTIONS ---
  const handleDelete = async (projectId) => {
    if (window.confirm("Delete this project? This cannot be undone.")) {
      setProcessingId(projectId);
      try {
        await deleteDoc(doc(db, "projects", projectId));
        setSubmissions(prev => prev.filter(p => p.id !== projectId)); 
      } catch (error) {
        console.error("Error deleting:", error);
        alert("Failed to delete.");
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleImageUpdate = (projectId, event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 800000) {
        alert("Image too large! Please select an image under 800KB.");
        return;
      }
      setProcessingId(projectId);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64String = reader.result;
          await updateDoc(doc(db, "projects", projectId), { imageUrl: base64String });
          setSubmissions(prev => prev.map(p => p.id === projectId ? { ...p, imageUrl: base64String } : p));
        } catch (error) {
          console.error("Error updating image:", error);
          alert("Failed to update image.");
        } finally {
          setProcessingId(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end p-4 sm:p-6 font-sans text-white">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={onClose}></div>

      <div className="relative w-full max-w-md h-full bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-slide-in-right">
        
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[80px] rounded-full pointer-events-none"></div>

        <div className="p-8 border-b border-white/10 flex items-center justify-between relative z-10 bg-black/20">
          <h2 className="text-2xl font-bold text-white">My Identity</h2>
          <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-full transition-all border border-white/5">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 relative z-10 custom-scrollbar">
          
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-4xl font-black text-white shadow-2xl border border-white/20 transform -rotate-3 mb-4">
              {/* 🚨 Uses the smart fallback to grab the first letter */}
              {displayUserName.charAt(0).toUpperCase()}
            </div>
            {/* 🚨 Uses the smart fallback for the main title */}
            <h3 className="text-xl font-bold text-white">{displayUserName}</h3>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400 mt-1">{user.role || 'Student'}</span>
          </div>

          <div className="space-y-3">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-4">
              <Mail className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Username</p>
                <p className="text-sm text-gray-200">{user.username || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* 📂 My Submissions Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FolderGit2 className="w-5 h-5 text-indigo-400" />
              <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400">
                My Submissions ({submissions.length})
              </h4>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-6 text-gray-500 gap-2 bg-white/5 rounded-2xl border border-white/5">
                  <Loader2 className="w-4 h-4 animate-spin" /> Fetching projects...
                </div>
              ) : submissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500 bg-white/5 rounded-2xl border border-white/5 text-center px-4">
                  <LayoutGrid className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-sm">No projects submitted yet.</p>
                </div>
              ) : (
                submissions.map((project) => (
                  <div key={project.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors flex flex-col gap-3">
                    
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-black/50 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 relative group">
                        {project.imageUrl ? (
                          <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600"><LayoutGrid className="w-5 h-5" /></div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-bold text-white truncate">{project.title}</h5>
                        <p className="text-xs text-gray-400 truncate">{project.category}</p>
                      </div>

                      <div className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                        project.status === 'Approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                        project.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                        'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      }`}>
                        {project.status || 'Pending'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                      <input 
                        type="file" accept="image/*" id={`file-upload-${project.id}`} className="hidden" 
                        onChange={(e) => handleImageUpdate(project.id, e)} 
                      />
                      
                      <label htmlFor={`file-upload-${project.id}`} className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-xl text-xs font-bold cursor-pointer transition-colors border border-indigo-500/10">
                        {processingId === project.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImagePlus className="w-3 h-3" />} 
                        Update Cover
                      </label>
                      
                      <button 
                        onClick={() => handleDelete(project.id)} disabled={processingId === project.id}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl text-xs font-bold transition-colors border border-red-500/10"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-white/10 bg-black/40 relative z-10">
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-3 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white py-4 rounded-2xl font-bold transition-all border border-red-500/20 group shadow-lg">
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Sign Out Securely
          </button>
        </div>

      </div>
    </div>
  );
}

export default UserProfile;