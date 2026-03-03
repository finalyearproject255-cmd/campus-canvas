import React, { useState } from 'react';
import { db } from '../firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { X, Camera, Send, Loader2, LayoutGrid, Type, AlignLeft, Link as LinkIcon } from 'lucide-react';

function AddProject({ user, onBack }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageName, setImageName] = useState("No file chosen");
  const [base64Image, setBase64Image] = useState(""); 
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Web App',
    liveDemoUrl: ''
  });

  const categories = ['Web App', 'Mobile App', 'Game', 'AI / ML', 'IoT / Hardware'];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 800000) { 
        alert("Image is too large! Please choose an image under 800KB.");
        return;
      }
      
      setImageName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64Image(reader.result); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, "projects"), {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        imageUrl: base64Image, 
        liveDemoUrl: formData.liveDemoUrl,
        authorName: user?.name || 'Student',
        authorUsername: user?.username || 'unknown',
        status: 'Pending', 
        views: 0,
        createdAt: serverTimestamp()
      });
      
      alert("Project submitted successfully! Pending Admin approval.");
      onBack(); 
    } catch (error) {
      console.error("Upload error: ", error);
      alert("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // 🎨 Matched the background to your StudentHome.js UI
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-6 font-sans selection:bg-indigo-500/30 relative overflow-hidden">
      
      {/* Subtle ambient glow to match the premium feel */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* 📦 The Glass Box (Matches your Bento grid cards) */}
      <div className="w-full max-w-2xl bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 sm:p-10 shadow-2xl relative z-10 animate-fade-in-up">
        
        <button 
          onClick={onBack}
          className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-full transition-all border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-white mb-2">Submit Project</h2>
          <p className="text-gray-400 text-sm">Add your innovation to the CampusCanvas repository.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 📸 The Dashed Upload Box */}
          <label className="border-2 border-dashed border-white/10 hover:border-indigo-500/50 bg-black/20 rounded-[1.5rem] p-8 flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden relative">
            
            {base64Image && (
              <img src={base64Image} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen" />
            )}

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-white/10">
                <Camera className="w-6 h-6 text-gray-300" />
              </div>
              <span className="text-white font-bold mb-1 drop-shadow-md">Click to Upload Cover</span>
              <span className="text-gray-400 text-xs bg-black/60 px-3 py-1.5 rounded-lg mt-2 border border-white/5">
                {imageName}
              </span>
            </div>
            
            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageChange}
              className="hidden" 
            />
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="relative">
              <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" required placeholder="Project Title"
                value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full bg-black/50 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 outline-none focus:border-indigo-500/50 text-white placeholder-gray-500 transition-all text-sm"
              />
            </div>
            
            {/* Category */}
            <div className="relative">
              <LayoutGrid className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <select 
                value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full bg-black/50 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 outline-none focus:border-indigo-500/50 text-white appearance-none cursor-pointer transition-all text-sm"
              >
                {categories.map(cat => <option key={cat} value={cat} className="bg-[#0a0a0a] text-white">{cat}</option>)}
              </select>
            </div>
          </div>

          {/* URL */}
          <div className="relative">
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="url" placeholder="Project Link (URL) e.g. GitHub or Live Demo"
              value={formData.liveDemoUrl} onChange={(e) => setFormData({...formData, liveDemoUrl: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 outline-none focus:border-indigo-500/50 text-white placeholder-gray-500 transition-all text-sm"
            />
          </div>

          {/* Description */}
          <div className="relative">
            <AlignLeft className="absolute left-4 top-4 w-4 h-4 text-gray-500" />
            <textarea 
              required rows="3" placeholder="Brief description of your project..."
              value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 outline-none focus:border-indigo-500/50 text-white placeholder-gray-500 resize-none transition-all text-sm"
            ></textarea>
          </div>

          <div className="flex gap-4 pt-2">
            <button 
              type="button" onClick={onBack}
              className="w-1/3 py-3.5 rounded-2xl font-bold text-gray-400 bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm"
            >
              Cancel
            </button>
            <button 
              type="submit" disabled={isSubmitting}
              className={`w-2/3 py-3.5 rounded-2xl font-bold text-white flex justify-center items-center gap-2 transition-all shadow-lg text-sm ${
                isSubmitting ? 'bg-indigo-500/30 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/20'
              }`}
            >
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <>Submit Project <Send className="w-4 h-4" /></>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default AddProject;