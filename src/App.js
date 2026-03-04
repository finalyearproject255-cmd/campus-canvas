import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import StudentHome from './pages/StudentHome';
import AdminDashboard from './pages/AdminDashboard';
import ProjectDetails from './pages/ProjectDetails';
import AddProject from './pages/AddProject'; 
import ChatBot from './components/ChatBot'; 
import Canteen from './pages/Canteen'; // 🆕 New Page
import CanteenAdmin from './pages/CanteenAdmin'; // 🆕 New Page

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
      // Admin starts at Dashboard, Student starts at Home
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

  // Helper to determine if current user has Admin privileges
  const isAdmin = user?.role === 'admin';

  // --- 🚦 TRAFFIC CONTROLLER (ROUTING) ---
  return (
    <div className="bg-[#0a0a0a] min-h-screen font-sans selection:bg-indigo-500/30">
      
      {/* 1. LOGIN PAGE */}
      {currentPage === 'login' && (
        <Login onLogin={handleLogin} />
      )}

      {/* 2. HOME PAGE (Accessible by Students AND Admins) */}
      {currentPage === 'home' && user && (
        <StudentHome
          user={user}
          onLogout={handleLogout}
          onNavigate={setCurrentPage} 
          onViewProject={(project) => {
            setSelectedProject(project);
            setCurrentPage('details');
          }}
        />
      )}

      {/* 3. ADMIN DASHBOARD (Project Moderation/Stats) */}
      {currentPage === 'admin' && isAdmin && (
        <AdminDashboard 
          onLogout={handleLogout} 
          onNavigate={setCurrentPage} 
        />
      )}

      {/* 4. CANTEEN (Student Order View) */}
      {currentPage === 'canteen' && user && (
        <Canteen 
          onBack={() => setCurrentPage(isAdmin ? 'admin' : 'home')} 
        />
      )}

      {/* 5. CANTEEN ADMIN (Staff View for Stock/Tokens) */}
      {currentPage === 'canteen-admin' && isAdmin && (
        <CanteenAdmin 
          onBack={() => setCurrentPage('admin')} 
        />
      )}

      {/* 6. PROJECT DETAILS */}
      {currentPage === 'details' && selectedProject && (
        <ProjectDetails
          project={selectedProject}
          onBack={() => setCurrentPage('home')}
        />
      )}

      {/* 7. ADD PROJECT PAGE */}
      {currentPage === 'add-project' && user && (
        <AddProject
          user={user}
          onBack={() => setCurrentPage('home')}
        />
      )}

      {/* 🤖 8. AI BOT */}
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