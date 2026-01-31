import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast'; // Notification System

// Import Pages
import Login from './pages/Login';
import StudentHome from './pages/StudentHome';
import AdminPanel from './pages/AdminPanel';
import AddProject from './pages/AddProject';
import ProjectDetails from './pages/ProjectDetails';
import ChatBot from './components/ChatBot'; // The AI Bot

function App() {
  // 1. INITIALIZE STATE FROM LOCAL STORAGE
  const [userRole, setUserRole] = useState(localStorage.getItem('appRole') || 'login');
  const [selectedProject, setSelectedProject] = useState(null);

  // 2. KEEP STATE IN SYNC
  useEffect(() => {
    localStorage.setItem('appRole', userRole);
  }, [userRole]);

  // 3. NAVIGATION HANDLER
  const handleNavigate = (page) => {
    setUserRole(page);
  };

  // 4. LOGOUT HANDLER
  const handleLogout = () => {
    setUserRole('login');
    setSelectedProject(null);
    localStorage.removeItem('appRole');
    localStorage.removeItem('user_info'); // Clear user data too
  };

  const handleViewProject = (project) => {
    setSelectedProject(project);
    setUserRole('view-project');
  };

  return (
    <div className="App font-sans">
      <Toaster position="top-center" reverseOrder={false} />

      {/* LOGIN */}
      {userRole === 'login' && (
        <Login onLogin={(role) => setUserRole(role)} />
      )}
      
      {/* STUDENT HOME */}
      {userRole === 'student' && (
        <StudentHome 
          onNavigate={handleNavigate} 
          onViewProject={handleViewProject}
          onLogout={handleLogout} 
        />
      )}
      
      {/* ADD PROJECT */}
      {userRole === 'add-project' && (
        <AddProject onBack={() => setUserRole('student')} />
      )}

      {/* PROJECT DETAILS */}
      {userRole === 'view-project' && selectedProject && (
        <ProjectDetails 
          project={selectedProject} 
          onBack={() => setUserRole('student')} 
        />
      )}
      
      {/* ADMIN */}
      {userRole === 'admin' && (
        <AdminPanel onLogout={handleLogout} /> 
      )}

      {/* AI CHATBOT (Visible everywhere except login) */}
      {userRole !== 'login' && <ChatBot />}

    </div>
  );
}

export default App;