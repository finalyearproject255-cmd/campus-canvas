import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import UserProfile from '../components/UserProfile'; 
import Footer from '../components/Footer'; 
import ChatBot from '../components/ChatBot'; 
import { 
  Search, Sparkles, Plus, LayoutGrid, Eye, 
  Image as ImageIcon, ChevronLeft, ChevronRight, Utensils, ShieldCheck 
} from 'lucide-react';

function StudentHome({ onNavigate, onViewProject, onLogout }) { 
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showProfile, setShowProfile] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user_info')) || { name: 'Guest', id: '000', role: 'student' };
  const isAdmin = currentUser.role === 'admin';

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "projects"));
        const projectsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProjects(projectsList);
        setLoading(false);
      } catch (error) {
        console.error("Error loading projects:", error);
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const approvedProjects = projects.filter(p => p.status === 'Approved');
  
  const filteredProjects = approvedProjects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const heroProjects = approvedProjects.slice(0, 5); 

  useEffect(() => {
    if (heroProjects.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroProjects.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [heroProjects.length, currentSlide]); 

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === heroProjects.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? heroProjects.length - 1 : prev - 1));
  };

  const heroProject = heroProjects.length > 0 ? heroProjects[currentSlide] : null;
  const categories = ['All', 'Web App', 'Mobile App', 'Game', 'AI / ML', 'IoT / Hardware'];

  const SkeletonCard = () => (
    <div className="bg-white/5 border border-white/10 rounded-[1.5rem] p-4 animate-pulse shadow-xl">
      <div className="h-44 bg-white/10 rounded-2xl mb-4"></div>
      <div className="h-6 bg-white/10 rounded w-3/4 mb-4"></div>
      <div className="flex justify-between items-center mt-4">
         <div className="h-4 bg-white/10 rounded w-1/4"></div>
         <div className="h-8 bg-white/10 rounded w-1/3"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 flex flex-col font-sans selection:bg-indigo-500/30">
      
      {/* 🎨 Glass Navbar */}
      <nav className="sticky top-0 z-40 bg-black/50 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex justify-between items-center shadow-2xl">
        <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 bg-clip-text text-transparent cursor-pointer flex items-center gap-2" onClick={() => window.scrollTo(0,0)}>
          <LayoutGrid className="w-6 h-6 text-indigo-400" />
          CampusCanvas
        </h1>
        
        <div className="hidden lg:flex bg-white/5 rounded-full px-4 py-2 border border-white/10 w-[350px] focus-within:bg-white/10 focus-within:border-indigo-500/50 transition-all duration-300">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input 
            type="text" 
            placeholder="Search projects..." 
            className="bg-transparent outline-none w-full text-sm placeholder-gray-500 text-white"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          {/* 🆕 CANTEEN ACCESS */}
          <button 
            onClick={() => onNavigate('canteen')}
            className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full font-bold text-xs text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all duration-300"
          >
            <Utensils className="w-4 h-4" /> Canteen
          </button>

          {/* 🚨 ADMIN GOD MODE TOGGLE */}
          {isAdmin && (
            <button 
              onClick={() => onNavigate('admin')}
              className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-full font-bold text-xs text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300"
            >
              <ShieldCheck className="w-4 h-4" /> Admin Panel
            </button>
          )}

          <button onClick={() => onNavigate('add-project')} className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold hover:bg-indigo-500 transition-all duration-300 text-white">
            <Plus className="w-5 h-5" />
          </button>
          
          <div onClick={() => setShowProfile(true)} className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 cursor-pointer flex items-center justify-center font-bold text-sm shadow-lg border border-white/20">
            {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
          </div>
        </div>
      </nav>

      {showProfile && <UserProfile user={currentUser} onClose={() => setShowProfile(false)} onLogout={onLogout} />}

      {/* 🎨 Bento Hero Section */}
      <div className="max-w-7xl mx-auto mt-8 px-6 w-full">
        <div className="relative overflow-hidden rounded-[2rem] h-[400px] flex items-center border border-white/10 group shadow-2xl">
          {heroProject ? (
            <>
              {heroProject.imageUrl ? (
                <img key={heroProject.id} src={heroProject.imageUrl} alt="Hero" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[3000ms] transform group-hover:scale-105 opacity-60 animate-fade-in" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-purple-900/50"></div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent"></div>
              
              <div key={`content-${heroProject.id}`} className="relative z-10 max-w-2xl p-12 animate-slide-in-right">
                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 inline-flex items-center gap-2">
                  <Sparkles className="w-3 h-3" /> Featured Project
                </span>
                <h2 className="text-5xl font-extrabold mb-6 leading-tight text-white">{heroProject.title}</h2>
                <div className="flex gap-4">
                  <button onClick={() => onViewProject(heroProject)} className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-all flex items-center gap-2">
                    <Eye className="w-4 h-4" /> View Details
                  </button>
                </div>
              </div>

              <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/40 hover:bg-indigo-600/80 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/40 hover:bg-indigo-600/80 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all">
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          ) : (
             <div className="w-full h-full flex items-center justify-center bg-white/5"><div className="animate-pulse text-gray-500">Curating projects...</div></div>
          )}
        </div>
      </div>

      {/* 🆕 CAMPUS UTILITIES SECTION */}
      <div className="max-w-7xl mx-auto mt-10 px-6 w-full">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              onClick={() => onNavigate('canteen')}
              className="group bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-white/10 p-8 rounded-[2rem] cursor-pointer hover:border-indigo-500/50 transition-all relative overflow-hidden"
            >
               <div className="relative z-10">
                  <h4 className="text-2xl font-black mb-2 flex items-center gap-3">
                    <Utensils className="w-6 h-6 text-indigo-400" /> Digital Canteen
                  </h4>
                  <p className="text-gray-400 text-sm">Pre-order food, skip the queue, and get your digital token instantly.</p>
               </div>
               <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Utensils className="w-32 h-32" />
               </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] relative overflow-hidden group">
               <h4 className="text-2xl font-black mb-2 flex items-center gap-3 text-gray-300">
                  <LayoutGrid className="w-6 h-6 text-purple-400" /> Academic Portal
               </h4>
               <p className="text-gray-500 text-sm italic">Fees management and academic activities coming soon.</p>
               <div className="absolute top-4 right-4 bg-white/5 px-3 py-1 rounded-full text-[10px] font-bold text-gray-500 uppercase">Beta</div>
            </div>
         </div>
      </div>

      {/* 🎨 Pill Filters */}
      <div className="max-w-7xl mx-auto mt-10 px-6 w-full flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {categories.map(cat => (
          <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-6 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-300 border ${selectedCategory === cat ? 'bg-white text-black border-white' : 'bg-transparent text-gray-400 border-white/10 hover:text-white'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* 🎨 The Bento Grid */}
      <div className="max-w-7xl mx-auto mt-6 px-6 w-full mb-12 flex-1">
        <h3 className="text-xl font-bold mb-6 text-gray-200">
          {selectedCategory === 'All' ? 'Latest Innovations' : `${selectedCategory} Collection`}
        </h3>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => <SkeletonCard key={n} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProjects.map((project) => (
              <div key={project.id} className="group bg-white/5 border border-white/10 rounded-[1.5rem] p-4 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 flex flex-col">
                <div onClick={() => onViewProject(project)} className="h-44 rounded-2xl bg-black/50 overflow-hidden mb-4 relative cursor-pointer border border-white/5">
                  {project.imageUrl ? (
                    <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600"><ImageIcon className="w-12 h-12" /></div>
                  )}
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-gray-300 text-[10px] px-3 py-1 rounded-full font-medium border border-white/10">
                    {project.category}
                  </div>
                </div>
                <div className="px-1 flex-1 flex flex-col">
                  <h4 onClick={() => onViewProject(project)} className="text-lg font-bold truncate text-white cursor-pointer group-hover:text-indigo-400">{project.title}</h4>
                  <div className="mt-auto flex justify-between items-center border-t border-white/10 pt-4 mt-4">
                     <span className="text-xs text-gray-500">By {project.authorName || 'Student'}</span>
                     <button onClick={() => onViewProject(project)} className="text-xs bg-indigo-500/20 text-indigo-300 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-500 hover:text-white transition-all">
                        Explore
                     </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
      <ChatBot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} onOpen={() => setIsChatOpen(true)} />
    </div>
  );
}

export default StudentHome;