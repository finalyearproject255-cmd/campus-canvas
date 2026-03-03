import React, { useEffect, useState, useRef } from 'react';
import { db } from '../firebase';
import { doc, updateDoc, increment, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { ArrowLeft, ExternalLink, Calendar, User, LayoutGrid, Image as ImageIcon, Trash2, ImagePlus, Loader2 } from 'lucide-react';

function ProjectDetails({ project, onBack }) {
  const [liveAuthorName, setLiveAuthorName] = useState("");
  const [currentImage, setCurrentImage] = useState(project?.imageUrl);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // 🚨 State to control the In-App Player
  const [isAppRunning, setIsAppRunning] = useState(false);
  
  const currentUser = JSON.parse(localStorage.getItem('user_info'));
  
  // Smart Ownership Check
  const isOwner = currentUser && (
    currentUser.username === project?.authorUsername || 
    currentUser.name === project?.authorName ||
    project?.author === `${currentUser.name}(${currentUser.username})` ||
    project?.author === `${currentUser.name} (${currentUser.username})` ||
    project?.author === currentUser.name ||
    (project?.author && project?.author.includes(currentUser.username)) ||
    liveAuthorName === currentUser.name
  );

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (project && project.id) {
      // 1. Increment Views
      const incrementView = async () => {
        try {
          await updateDoc(doc(db, 'projects', project.id), { views: increment(1) });
        } catch (err) {
          console.error("Failed to update views", err);
        }
      };
      incrementView();

      // 2. The Smart Live Fetch
      const fetchLiveAuthor = async () => {
        let searchUsername = project.authorUsername;
        
        if (!searchUsername || searchUsername === 'unknown') {
          if (project.author) {
            const match = project.author.match(/\(([^)]+)\)/);
            if (match) searchUsername = match[1].trim();
          }
        }

        try {
          if (searchUsername && searchUsername !== 'unknown') {
            const q = query(collection(db, "users"), where("username", "==", searchUsername));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
              setLiveAuthorName(snapshot.docs[0].data().name);
            }
          }
        } catch (error) {
          console.error("Failed to fetch live user", error);
        }
      };
      fetchLiveAuthor();
    }
  }, [project]);

  if (!project) return null;

  // --- ACTIONS ---
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to permanently delete this project? This cannot be undone.")) {
      try {
        await deleteDoc(doc(db, "projects", project.id));
        alert("Project deleted successfully.");
        onBack(); 
      } catch (error) {
        console.error("Error deleting:", error);
        alert("Failed to delete project.");
      }
    }
  }

  const handleImageUpdate = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 800000) {
        alert("Image too large! Please select an image under 800KB.");
        return;
      }
      setIsUpdating(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64String = reader.result;
          await updateDoc(doc(db, "projects", project.id), { imageUrl: base64String });
          setCurrentImage(base64String); 
          alert("Cover image updated successfully!");
        } catch (error) {
          console.error("Error updating image:", error);
          alert("Failed to update image.");
        } finally {
          setIsUpdating(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const liveLink = project.liveDemoUrl || project.link;
  const authorDisplay = liveAuthorName || (isOwner ? currentUser?.name : null) || project.authorName || project.author || 'Unknown Student';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 font-sans pb-12 selection:bg-indigo-500/30 relative">
      
      {/* Top Navbar */}
      <div className="bg-black/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white font-semibold text-sm border border-transparent hover:border-white/10">
            <ArrowLeft className="w-5 h-5" /> Back to Repository
          </button>

          {isOwner && (
            <div className="flex items-center gap-3">
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpdate} />
              
              <button onClick={() => fileInputRef.current?.click()} disabled={isUpdating} className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 rounded-full font-bold text-sm transition-all border border-indigo-500/20">
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />} Update Cover
              </button>
              
              <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-full font-bold text-sm transition-all border border-red-500/20">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            <div className="w-full h-[400px] bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden relative shadow-2xl flex items-center justify-center group">
              {currentImage ? (
                <img src={currentImage} alt={project.title} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-gray-600 gap-3">
                  <ImageIcon className="w-16 h-16" />
                  <span>No cover image</span>
                </div>
              )}
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-md">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-indigo-400" /> Executive Summary
              </h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{project.description}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-md relative shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[50px] rounded-full"></div>
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase mb-4 inline-block">{project.category || 'App'}</span>
              <h1 className="text-3xl font-extrabold text-white mb-6 leading-tight">{project.title}</h1>
              
              {/* 🚨 THE GLITCH-FREE ROLLING BUTTON */}
              {liveLink ? (
                <div className="relative group w-full h-14 sm:h-16 mb-8 z-30 rounded-xl overflow-hidden shadow-lg shadow-white/10 border border-white/10 cursor-pointer">
                  
                  {/* FRONT FACE (Default View) */}
                  <div className="absolute inset-0 bg-white text-black font-bold text-lg flex justify-center items-center gap-2 transition-transform duration-300 group-hover:-translate-y-full">
                    Launch App <ExternalLink className="w-5 h-5" />
                  </div>

                  {/* BOTTOM FACE (The Two Options that slide up on hover) */}
                  <div className="absolute inset-0 flex translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                    
                    <button 
                      onClick={() => setIsAppRunning(true)}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm sm:text-base flex justify-center items-center gap-2 transition-colors border-r border-indigo-700/50"
                    >
                      <LayoutGrid className="w-4 h-4" /> Run in Browser
                    </button>
                    
                    <a 
                      href={liveLink} target="_blank" rel="noopener noreferrer" 
                      className="flex-1 bg-black hover:bg-gray-900 text-white font-bold text-sm sm:text-base flex justify-center items-center gap-2 transition-colors"
                    >
                      Secure Tab <ExternalLink className="w-4 h-4 text-gray-400" />
                    </a>

                  </div>
                </div>
              ) : (
                <div className="w-full bg-white/5 border border-white/10 py-4 rounded-xl font-bold text-sm text-gray-500 flex justify-center items-center mb-8 shadow-inner">
                  No Live Demo Available
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-4 bg-black/40 border border-white/5 p-4 rounded-xl">
                  <User className="w-5 h-5 text-indigo-400" />
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Developer</p>
                    <p className="text-sm font-semibold text-white">{authorDisplay}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-black/40 border border-white/5 p-4 rounded-xl">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Views</p>
                    <p className="text-sm font-semibold text-white">{project.views || 0} Total</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* 🚨 THE IN-APP PLAYER MODAL */}
      {isAppRunning && liveLink && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex flex-col animate-fade-in-up">
          
          <div className="flex items-center justify-between p-4 bg-[#050505] border-b border-white/10 shadow-2xl z-10">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-white font-bold text-sm tracking-wider">LIVE ENVIRONMENT</span>
              <span className="text-gray-500 text-xs hidden sm:block">| {liveLink}</span>
            </div>
            
            <button 
              onClick={() => setIsAppRunning(false)}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg font-bold text-xs transition-colors border border-red-500/20"
            >
              Close Simulator
            </button>
          </div>

          <div className="flex-1 w-full bg-white relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-[#0a0a0a]">
              <span className="text-gray-400 animate-pulse font-bold flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                Connecting to server...
              </span>
            </div>
            <iframe 
              src={liveLink} 
              title="Project Live Preview"
              className="w-full h-full relative z-10 border-none bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        </div>
      )}

    </div>
  );
}

export default ProjectDetails;