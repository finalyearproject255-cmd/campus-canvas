import React, { useState } from 'react';
import { db } from '../firebase'; 
import { collection, addDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

function AddProject({ onBack }) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [galleryBase64, setGalleryBase64] = useState([]); 

  const user = JSON.parse(localStorage.getItem('user_info')) || { name: 'Student', id: 'Anonymous' };

  const [formData, setFormData] = useState({
    title: '',
    category: 'Web App',
    description: '',
    link: '',
    author: `${user.name} (${user.id})`, 
    views: 0,
    color: 'from-blue-500 to-indigo-500',
    icon: '🚀',
    status: 'Pending'
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 4) {
      toast.error("Max 4 images allowed!");
      return;
    }

    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    if (totalSize > 950 * 1024) {
      toast.error(`Files too big (${(totalSize/1024/1024).toFixed(2)}MB). Limit 1MB.`);
      return;
    }

    const promises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    const base64Results = await Promise.all(promises);
    setGalleryBase64(base64Results);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (galleryBase64.length === 0) {
      toast.error("Please select at least one image.");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Uploading project...");

    try {
      await addDoc(collection(db, "projects"), {
        ...formData,
        imageUrl: galleryBase64[0], 
        gallery: galleryBase64 
      });
      
      toast.dismiss(loadingToast);
      toast.success("Submitted for approval! 🚀");
      onBack();
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Upload failed. Try smaller images.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-white shadow-2xl relative">
        <button onClick={onBack} className="absolute top-4 right-4 text-white/50 hover:text-white text-2xl">&times;</button>

        {/* Steps */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2 text-blue-200">
            <span>Step 1: Info</span><span>Step 2: Gallery</span><span>Step 3: Submit</span>
          </div>
          <div className="h-2 bg-black/20 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }}></div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-3xl font-bold">Project Info</h2>
              <input name="title" value={formData.title} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-4" placeholder="Project Title" required />
              <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 [&>option]:text-black">
                <option>Web App</option><option>Mobile App</option><option>Game</option><option>AI / ML</option><option>IoT / Hardware</option>
              </select>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full bg-white/5 border border-white/10 rounded-xl p-4" placeholder="Description..." required />
              <button type="button" onClick={() => setStep(2)} className="w-full bg-blue-600 py-4 rounded-xl font-bold hover:bg-blue-500">Next ➜</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-3xl font-bold">Gallery</h2>
              <div className="relative border-2 border-dashed border-white/20 rounded-2xl p-8 text-center hover:bg-white/5">
                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                {galleryBase64.length > 0 ? (
                   <div className="grid grid-cols-2 gap-2">
                     {galleryBase64.map((img, idx) => <img key={idx} src={img} alt="prev" className="h-32 w-full object-cover rounded-lg" />)}
                   </div>
                ) : (
                  <><span className="text-4xl block mb-2">📸</span><p>Click to Upload (Max 4)</p></>
                )}
              </div>
              <input name="link" value={formData.link} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-4" placeholder="Project Link (URL)" required />
              <div className="flex gap-4">
                <button type="button" onClick={() => setStep(1)} className="w-1/3 bg-white/10 py-4 rounded-xl">Back</button>
                <button type="button" onClick={() => setStep(3)} className="w-2/3 bg-blue-600 py-4 rounded-xl font-bold">Review ➜</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fadeIn text-center">
              <h2 className="text-3xl font-bold">Ready?</h2>
              <div className="bg-white/10 p-6 rounded-2xl text-left border border-white/20 flex gap-4 items-center">
                 <div className="w-16 h-16 bg-black/20 rounded-lg flex items-center justify-center overflow-hidden">
                    {galleryBase64.length > 0 ? <img src={galleryBase64[0]} alt="mini" className="w-full h-full object-cover" /> : "🚀"}
                 </div>
                 <div><h3 className="text-xl font-bold">{formData.title}</h3><p className="text-sm text-white/50">{galleryBase64.length} images</p></div>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setStep(2)} className="w-1/3 bg-white/10 py-4 rounded-xl">Edit</button>
                <button type="submit" disabled={isSubmitting} className="w-2/3 bg-green-500 py-4 rounded-xl font-bold hover:bg-green-400">
                  {isSubmitting ? "Uploading..." : "🚀 Launch"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default AddProject;