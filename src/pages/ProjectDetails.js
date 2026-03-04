import React, { useEffect, useState, useRef } from 'react';
import { db } from '../firebase';
import { doc, updateDoc, increment, collection, query, where, getDocs, deleteDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ArrowLeft, ExternalLink, Calendar, User, LayoutGrid, Image as ImageIcon, Trash2, ImagePlus, Loader2, Heart, Share2, MessageCircle, Send } from 'lucide-react';

function ProjectDetails({ project, onBack }) {
  // 1. ALL HOOKS AT THE TOP
  const [liveAuthorName, setLiveAuthorName] = useState("");
  const [currentImage, setCurrentImage] = useState(project?.imageUrl);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAppRunning, setIsAppRunning] = useState(false);
  
  const [likes, setLikes] = useState(project?.likes || []);
  const [comments, setComments] = useState(project?.comments || []);
  const [newComment, setNewComment] = useState("");
  const [isLiking, setIsLiking] = useState(false);

  const fileInputRef = useRef(null); // Moved this up!

  const currentUser = JSON.parse(localStorage.getItem('user_info'));
  const currentUserId = currentUser?.uid || currentUser?.username;

  // 2. ALL EFFECTS
  useEffect(() => {
    if (project) {
      setLikes(project.likes || []);
      setComments(project.comments || []);
      setCurrentImage(project.imageUrl);
    }
  }, [project]);

  useEffect(() => {
    if (project && project.id) {
      const incrementView = async () => {
        try {
          await updateDoc(doc(db, 'projects', project.id), { views: increment(1) });
        } catch (err) {
          console.error("Failed to update views", err);
        }
      };
      incrementView();

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

  // 3. ALL LOGIC FUNCTIONS
  const isOwner = currentUser && project && (
    currentUser.username === project?.authorUsername || 
    currentUser.name === project?.authorName ||
    project?.author?.includes(currentUser.username) ||
    liveAuthorName === currentUser.name
  );

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to permanently delete this project?")) {
      try {
        await deleteDoc(doc(db, "projects", project.id));
        alert("Project deleted successfully.");
        onBack(); 
      } catch (error) {
        console.error("Error deleting:", error);
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
        } finally {
          setIsUpdating(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLike = async () => {
    if (!currentUserId) return alert("Please login to like!");
    if (isLiking) return;
    setIsLiking(true);
    const projectRef = doc(db, "projects", project.id);
    const hasLiked = likes.includes(currentUserId);
    try {
      if (hasLiked) {
        await updateDoc(projectRef, { likes: arrayRemove(currentUserId) });
        setLikes(prev => prev.filter(id => id !== currentUserId));
      } else {
        await updateDoc(projectRef, { likes: arrayUnion(currentUserId) });
        setLikes(prev => [...prev, currentUserId]);
      }
    } catch (err) { console.error(err); }
    finally { setIsLiking(false); }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Project link copied to clipboard!");
  };

  const handleAddComment = async () => {
    if (!currentUserId) return alert("Please login to comment!");
    if (!newComment.trim()) return;
    const commentData = {
      text: newComment,
      userName: currentUser.name || currentUser.displayName || "Anonymous",
      timestamp: new Date().toISOString()
    };
    try {
      const projectRef = doc(db, "projects", project.id);
      await updateDoc(projectRef, { comments: arrayUnion(commentData) });
      setComments(prev => [...prev, commentData]);
      setNewComment("");
    } catch (err) { console.error(err); }
  };

  // Safety variables
  if (!project) return null; // Moved to the very end of logic block

  const liveLink = project.liveDemoUrl || project.link;
  const authorDisplay = liveAuthorName || (isOwner ? currentUser?.name : null) || project.authorName || project.author || 'Unknown Student';
  const isLikedByMe = currentUserId && likes.includes(currentUserId);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 font-sans pb-12 selection:bg-indigo-500/30 relative">
      <div className="bg-black/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white font-semibold text-sm border border-transparent hover:border-white/10">
            <ArrowLeft className="w-5 h-5" /> Back to Repository
          </button>
          <div className="flex items-center gap-3">
             <button onClick={handleShare} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all">
                <Share2 className="w-5 h-5" />
             </button>
             {isOwner && (
               <>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpdate} />
                <button onClick={() => fileInputRef.current?.click()} disabled={isUpdating} className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 rounded-full font-bold text-sm transition-all border border-indigo-500/20">
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />} Update Cover
                </button>
                <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-full font-bold text-sm transition-all border border-red-500/20">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
               </>
             )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="w-full h-[400px] bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden relative shadow-2xl flex items-center justify-center group">
              {currentImage ? <img src={currentImage} alt={project.title} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center text-gray-600 gap-3"><ImageIcon className="w-16 h-16" /><span>No cover image</span></div>}
            </div>
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-md">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><LayoutGrid className="w-5 h-5 text-indigo-400" /> Executive Summary</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{project.description}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-md">
               <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><MessageCircle className="w-5 h-5 text-indigo-400" /> Discussion ({comments.length})</h3>
               <div className="flex gap-3 mb-8">
                 <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" />
                 <button onClick={handleAddComment} className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl transition-colors"><Send className="w-5 h-5" /></button>
               </div>
               <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                 {comments.length > 0 ? comments.map((c, i) => (
                   <div key={i} className="bg-black/20 p-4 rounded-xl border border-white/5">
                      <div className="flex justify-between items-start mb-1"><span className="font-bold text-indigo-300 text-sm">{c.userName}</span><span className="text-[10px] text-gray-600">{new Date(c.timestamp).toLocaleDateString()}</span></div>
                      <p className="text-gray-300 text-sm">{c.text}</p>
                   </div>
                 )) : <p className="text-gray-600 text-center italic">No comments yet.</p>}
               </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-md relative shadow-xl">
              <div className="flex justify-between items-start mb-4">
                 <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase inline-block">{project.category || 'App'}</span>
                 <button onClick={handleLike} className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${isLikedByMe ? 'bg-pink-500/20 text-pink-500 border-pink-500/50' : 'bg-white/5 text-gray-400 border-white/10 hover:border-pink-500/50'}`}>
                   <Heart className={`w-4 h-4 ${isLikedByMe ? 'fill-current' : ''}`} /><span className="text-xs font-bold">{likes.length}</span>
                 </button>
              </div>
              <h1 className="text-3xl font-extrabold text-white mb-6 leading-tight">{project.title}</h1>
              {liveLink ? (
                <div className="relative group w-full h-14 sm:h-16 mb-8 z-30 rounded-xl overflow-hidden shadow-lg shadow-white/10 border border-white/10 cursor-pointer">
                  <div className="absolute inset-0 bg-white text-black font-bold text-lg flex justify-center items-center gap-2 transition-transform duration-300 group-hover:-translate-y-full">Launch App <ExternalLink className="w-5 h-5" /></div>
                  <div className="absolute inset-0 flex translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                    <button onClick={() => setIsAppRunning(true)} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm sm:text-base flex justify-center items-center gap-2 transition-colors border-r border-indigo-700/50"><LayoutGrid className="w-4 h-4" /> Simulator</button>
                    <a href={liveLink} target="_blank" rel="noopener noreferrer" className="flex-1 bg-black hover:bg-gray-900 text-white font-bold text-sm sm:text-base flex justify-center items-center gap-2 transition-colors">New Tab <ExternalLink className="w-4 h-4 text-gray-400" /></a>
                  </div>
                </div>
              ) : <div className="w-full bg-white/5 border border-white/10 py-4 rounded-xl font-bold text-sm text-gray-500 flex justify-center items-center mb-8 shadow-inner">No Live Demo Available</div>}
              <div className="space-y-3">
                <div className="flex items-center gap-4 bg-black/40 border border-white/5 p-4 rounded-xl"><User className="w-5 h-5 text-indigo-400" /><div><p className="text-[10px] text-gray-500 uppercase font-bold">Developer</p><p className="text-sm font-semibold text-white">{authorDisplay}</p></div></div>
                <div className="flex items-center gap-4 bg-black/40 border border-white/5 p-4 rounded-xl"><Calendar className="w-5 h-5 text-purple-400" /><div><p className="text-[10px] text-gray-500 uppercase font-bold">Engagement</p><p className="text-sm font-semibold text-white">{project.views || 0} Views</p></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isAppRunning && liveLink && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex flex-col">
          <div className="flex items-center justify-between p-4 bg-[#050505] border-b border-white/10 shadow-2xl z-10">
            <span className="text-white font-bold text-sm tracking-wider">LIVE PREVIEW</span>
            <button onClick={() => setIsAppRunning(false)} className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold text-xs">Close Simulator</button>
          </div>
          <div className="flex-1 w-full bg-white relative">
            <iframe src={liveLink} title="Project Live Preview" className="w-full h-full relative z-10 border-none bg-white" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectDetails;