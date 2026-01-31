import React, { useState, useRef } from 'react';
import { db } from '../firebase';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast'; // Toasts
import Footer from '../components/Footer';

function ProjectDetails({ project, onBack }) {
  const [likes, setLikes] = useState(project.views || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user_info')) || {};
  const isOwner = (project.author && project.author.includes(currentUser.id)) || currentUser.role === 'admin';

  // GALLERY LOGIC
  let slides = [];
  if (project.gallery && project.gallery.length > 0) {
    slides = project.gallery.map(img => ({ type: 'image', content: img }));
  } else if (project.imageUrl) {
    slides = [{ type: 'image', content: project.imageUrl }];
  } else {
    slides.push({ type: 'icon', content: project.icon || '📦', color: project.color });
  }

  const nextImage = () => setActiveImageIndex((prev) => (prev + 1) % slides.length);
  const prevImage = () => setActiveImageIndex((prev) => (prev - 1 + slides.length) % slides.length);

  // DELETE
  const handleDelete = async () => {
    if (window.confirm("Are you sure? This cannot be undone.")) {
      setIsDeleting(true);
      const loadingToast = toast.loading("Deleting...");
      try {
        await deleteDoc(doc(db, "projects", project.id));
        toast.dismiss(loadingToast);
        toast.success("Project deleted.");
        onBack();
      } catch (error) {
        toast.dismiss(loadingToast);
        toast.error("Delete failed.");
        setIsDeleting(false);
      }
    }
  };

  // UPDATE IMAGES
  const fileInputRef = useRef(null);

  const handleUpdateImages = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    if (totalSize > 950 * 1024) {
      toast.error("Files too large! Limit is 1MB.");
      return;
    }

    if (!window.confirm("Replace all current images?")) return;

    setIsUpdating(true);
    const loadingToast = toast.loading("Updating images...");
    
    const promises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    try {
      const newGallery = await Promise.all(promises);
      const projectRef = doc(db, "projects", project.id);
      await updateDoc(projectRef, {
        gallery: newGallery,
        imageUrl: newGallery[0]
      });

      toast.dismiss(loadingToast);
      toast.success("Images updated!");
      window.location.reload(); 
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Update failed.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white flex flex-col">
      <div className="p-6 flex-grow">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8 max-w-6xl mx-auto">
          <button onClick={onBack} className="flex items-center gap-2 text-blue-200 hover:text-white transition font-bold">
            ← Back to Browse
          </button>

          {isOwner && (
            <div className="flex gap-3">
               <input type="file" multiple accept="image/*" ref={fileInputRef} className="hidden" onChange={handleUpdateImages} />
               <button onClick={() => fileInputRef.current.click()} disabled={isUpdating} className="bg-blue-500/20 hover:bg-blue-500 text-blue-300 hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition">
                 {isUpdating ? "..." : "🖼️ Update Images"}
               </button>
               <button onClick={handleDelete} disabled={isDeleting} className="bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition">
                 {isDeleting ? "..." : "🗑️ Delete"}
               </button>
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* CAROUSEL */}
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-video rounded-3xl bg-gray-800 shadow-2xl relative overflow-hidden group border border-white/10 flex items-center justify-center">
               {slides[activeImageIndex].type === 'image' ? (
                 <img src={slides[activeImageIndex].content} alt="Project Slide" className="w-full h-full object-contain bg-black/50" />
               ) : (
                 <div className={`w-full h-full bg-gradient-to-br ${slides[activeImageIndex].color || 'from-gray-700 to-gray-900'} flex items-center justify-center`}>
                    <div className="text-9xl transform scale-110">{slides[activeImageIndex].content}</div>
                 </div>
               )}
               {slides.length > 1 && (
                 <>
                   <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center">❮</button>
                   <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center">❯</button>
                 </>
               )}
            </div>
            {slides.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {slides.map((item, idx) => (
                  <div key={idx} onClick={() => setActiveImageIndex(idx)} className={`min-w-[5rem] h-16 rounded-lg overflow-hidden cursor-pointer border-2 transition ${idx === activeImageIndex ? 'border-blue-400 opacity-100' : 'border-transparent opacity-50'}`}>
                    {item.type === 'image' ? <img src={item.content} alt="thumb" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-700"></div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DETAILS */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-xl">
              <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">{project.category}</span>
              <h1 className="text-4xl font-bold mb-2">{project.title}</h1>
              <p className="text-lg text-white/60 mb-6">Created by {project.author}</p>
              
              <div className="flex gap-4 mb-8">
                <button className="flex-1 bg-white text-indigo-900 font-bold py-4 rounded-xl hover:bg-blue-50 transition" onClick={() => project.link ? window.open(project.link, "_blank") : toast.error("No link provided.")}>
                  Launch App 🚀
                </button>
                <button onClick={() => { setIsLiked(!isLiked); setLikes(isLiked ? likes - 1 : likes + 1); }} className={`px-6 rounded-xl font-bold border border-white/20 transition ${isLiked ? 'bg-pink-500 border-pink-500' : 'bg-white/5'}`}>
                  {isLiked ? '❤️' : '🤍'} {likes}
                </button>
              </div>
              <hr className="border-white/10 mb-6" />
              <h3 className="text-xl font-bold mb-3">About this Project</h3>
              <p className="text-blue-100 leading-relaxed whitespace-pre-wrap">{project.description}</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ProjectDetails;