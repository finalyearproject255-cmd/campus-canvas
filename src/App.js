import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import StudentHome from './pages/StudentHome';
import AdminDashboard from './pages/AdminDashboard';
import ProjectDetails from './pages/ProjectDetails';
import AddProject from './pages/AddProject'; 
import ChatBot from './components/ChatBot'; 

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('login'); 
  const [selectedProject, setSelectedProject] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false); 

  // --- 💾 PERSISTENCE LOGIC ---
  useEffect(() => {
    const savedUser = localStorage.getItem('user_info');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setCurrentPage(parsedUser.role === 'admin' ? 'admin' : 'home');
    }
  }, []);

  const handleLogin = (role) => {
    const savedUser = JSON.parse(localStorage.getItem('user_info'));
    setUser(savedUser);
    setCurrentPage(role === 'admin' ? 'admin' : 'home');
  };

  const handleLogout = () => {
    localStorage.removeItem('user_info');
    setUser(null);
    setCurrentPage('login');
  };

  // --- 🚦 TRAFFIC CONTROLLER (ROUTING) ---
  return (
    <div className="bg-[#0a0a0a] min-h-screen font-sans selection:bg-indigo-500/30">
      
      {/* 1. LOGIN PAGE */}
      {currentPage === 'login' && (
        <Login onLogin={handleLogin} />
      )}

      {/* 2. STUDENT HOME */}
      {currentPage === 'home' && user?.role !== 'admin' && (
        <StudentHome
          user={user}
          onLogout={handleLogout}
          onNavigate={setCurrentPage} 
          /* 🚨 FIXED: Changed to onViewProject to match StudentHome.js */
          onViewProject={(project) => {
            setSelectedProject(project);
            setCurrentPage('details');
          }}
        />
      )}

      {/* 3. ADMIN DASHBOARD */}
      {currentPage === 'admin' && user?.role === 'admin' && (
        <AdminDashboard 
          onLogout={handleLogout} 
          onNavigate={setCurrentPage} 
        />
      )}

      {/* 4. PROJECT DETAILS */}
      {currentPage === 'details' && selectedProject && (
        <ProjectDetails
          project={selectedProject}
          onBack={() => setCurrentPage('home')}
        />
      )}

      {/* 5. ADD PROJECT PAGE */}
      {/* 🚨 FIXED: Changed from 'addProject' to 'add-project' to match your + button */}
      {currentPage === 'add-project' && (
        <AddProject
          user={user}
          onBack={() => setCurrentPage('home')}
        />
      )}

      {/* 🤖 6. AI BOT */}
      {currentPage !== 'login' && (
        <ChatBot 
          isOpen={isChatOpen} 
          onOpen={() => setIsChatOpen(true)} 
          onClose={() => setIsChatOpen(false)} 
        />
      )}
      
    </div>
  );
}

export default App;