import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import UserProfile from '../components/UserProfile'; 
import Footer from '../components/Footer'; // Import Footer

function StudentHome({ onNavigate, onViewProject, onLogout }) { 
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Category Filter State
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Profile Modal State
  const [showProfile, setShowProfile] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('user_info')) || { name: 'Guest', id: '000' };

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

  // FILTERS
  const approvedProjects = projects.filter(p => p.status === 'Approved');
  
  const filteredProjects = approvedProjects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // CAROUSEL LOGIC
  const heroProjects = approvedProjects.slice(0, 5); // Top 5
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroProjects.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroProjects.length) % heroProjects.length);

  useEffect(() => {
    if (heroProjects.length > 0) {
      const interval = setInterval(nextSlide, 5000);
      return () => clearInterval(interval);
    }
  }, [heroProjects.length]);

  const heroProject = heroProjects.length > 0 ? heroProjects[currentSlide] : {
    title: "Waiting for Projects...", description: "Submissions are being reviewed.", color: "from-gray-700 to-gray-900", icon: "⏳"
  };

  const categories = ['All', 'Web App', 'Mobile App', 'Game', 'AI / ML', 'IoT / Hardware'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white flex flex-col font-sans">
      
      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 bg-white/10 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex justify-between items-center shadow-lg">
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">
          CampusCanvas
        </h1>
        
        <div className="hidden md:flex bg-black/20 rounded-2xl px-4 py-2 border border-white/10 w-96 focus-within:bg-black/40 transition">
          <span className="mr-3 text-white/50">🔍</span>
          <input 
            type="text" 
            placeholder="Search projects..." 
            className="bg-transparent outline-none w-full text-sm placeholder-white/50 text-white"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate('add-project')}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center font-bold hover:scale-110 transition shadow-lg shadow-blue-500/30 text-white text-2xl pb-1"
            title="Upload Project"
          >
            +
          </button>
          
          <div 
            onClick={() => setShowProfile(true)}
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-400 to-pink-400 cursor-pointer hover:ring-2 hover:ring-white transition flex items-center justify-center font-bold text-sm shadow-lg"
          >
            {currentUser.name ? currentUser.name.charAt(0) : "U"}
          </div>
        </div>
      </nav>

      {/* PROFILE POPUP */}
      {showProfile && (
        <UserProfile user={currentUser} onClose={() => setShowProfile(false)} onLogout={onLogout} />
      )}

      {/* HERO SECTION */}
      <div className="max-w-7xl mx-auto mt-8 px-6 w-full">
        <div className="relative overflow-hidden rounded-[2rem] h-[400px] flex items-center shadow-2xl border border-white/10 group">
          {heroProject.imageUrl ? (
            <>
              <img src={heroProject.imageUrl} alt="Hero" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] transform group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent"></div>
            </>
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-r ${heroProject.color || 'from-violet-600 to-indigo-600'}`}></div>
          )}

          <div className="relative z-10 max-w-2xl p-12">
            <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 inline-block border border-white/10">
              🔥 Trending Now
            </span>
            <h2 className="text-5xl font-bold mb-6 leading-tight drop-shadow-lg">{heroProject.title}</h2>
            <p className="text-lg text-gray-200 mb-8 line-clamp-2 max-w-lg">{heroProject.description}</p>
            {heroProjects.length > 0 && (
              <button 
                 onClick={() => onViewProject(heroProject)}
                 className="bg-white text-indigo-900 px-8 py-3.5 rounded-xl font-bold hover:bg-blue-50 transition shadow-xl hover:scale-105 active:scale-95"
              >
                Launch Now 🚀
              </button>
            )}
          </div>

          {heroProjects.length > 1 && (
            <>
              <button onClick={prevSlide} className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/10 transition">❮</button>
              <button onClick={nextSlide} className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/10 transition">❯</button>
            </>
          )}
        </div>
      </div>

      {/* CATEGORY TABS */}
      <div className="max-w-7xl mx-auto mt-10 px-6 w-full">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition border ${
                selectedCategory === cat 
                  ? 'bg-white text-indigo-900 border-white' 
                  : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* GRID */}
      <div className="max-w-7xl mx-auto mt-6 px-6 w-full mb-12">
        <h3 className="text-xl font-bold mb-6 text-blue-100 flex items-center gap-2">
          {selectedCategory === 'All' ? '⚡ All Projects' : `📂 ${selectedCategory}`}
        </h3>
        
        {loading ? (
           <div className="flex justify-center py-20"><div className="animate-spin text-4xl">⏳</div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
            {filteredProjects.map((project) => (
              <div key={project.id} className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-[1.5rem] p-4 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer">
                
                {/* Image */}
                <div className="h-44 rounded-2xl bg-gray-800 overflow-hidden mb-4 relative shadow-inner">
                  {project.imageUrl ? (
                    <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover object-top transition duration-700 group-hover:scale-110" />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${project.color || 'from-gray-600 to-gray-800'} flex items-center justify-center text-5xl`}>
                      {project.icon || '📦'}
                    </div>
                  )}
                  {/* Tag */}
                  <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wide border border-white/10">
                    {project.category}
                  </div>
                </div>

                <div className="px-1">
                  <h4 className="text-lg font-bold truncate text-white group-hover:text-blue-200 transition">{project.title}</h4>
                  <div className="flex justify-between items-center mt-3 border-t border-white/10 pt-3">
                     <span className="text-xs text-white/50">❤️ {project.views || 0}</span>
                     <button 
                        onClick={() => onViewProject(project)} 
                        className="text-xs bg-white text-indigo-900 px-3 py-1.5 rounded-lg font-bold hover:scale-105 transition"
                      >
                        Open
                      </button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredProjects.length === 0 && (
               <div className="col-span-full text-center text-white/40 py-20 bg-white/5 rounded-3xl border border-white/5">
                 <p className="text-2xl mb-2">👾</p>
                 No projects found in this category.
               </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default StudentHome;