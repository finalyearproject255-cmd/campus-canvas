import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, query, where } from 'firebase/firestore';
import { 
  LayoutDashboard, LogOut, CheckCircle, XCircle, Trash2, Clock, LayoutGrid,
  ShieldAlert, Eye, X, ExternalLink, Image as ImageIcon, Users, UserPlus, Key, Mail, Shield, Menu
} from 'lucide-react';

function AdminDashboard({ onLogout }) {
  // --- CORE STATE ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [projects, setProjects] = useState([]);
  const [usersList, setUsersList] = useState([]); 
  const [userMap, setUserMap] = useState({});
  const [loading, setLoading] = useState(true);
  
  // --- UI STATE (NEW) ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Controls mobile menu
  
  // --- MODAL STATES ---
  const [reviewProject, setReviewProject] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', username: '', password: '', role: 'Student' });

  // --- 🔄 FETCH ALL DATA ---
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [projectsSnapshot, usersSnapshot] = await Promise.all([
        getDocs(collection(db, "projects")),
        getDocs(collection(db, "users"))
      ]);

      // 1. Process Users
      const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsersList(usersData);

      const usersDictionary = {};
      usersData.forEach(userData => {
        const actualName = userData.fullName || userData.Name || userData.name || "Unknown User";
        if (userData.username) usersDictionary[userData.username] = actualName;
      });
      setUserMap(usersDictionary);

      // 2. Process Projects
      const projectsList = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      projectsList.sort((a, b) => (a.status === 'Pending' ? -1 : 1));
      setProjects(projectsList);
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // --- ⚡ PROJECT ACTIONS ---
  const updateStatus = async (projectId, newStatus) => {
    try {
      await updateDoc(doc(db, "projects", projectId), { status: newStatus });
      setProjects(projects.map(p => p.id === projectId ? { ...p, status: newStatus } : p));
      if (reviewProject && reviewProject.id === projectId) setReviewProject(null);
    } catch (error) {
      console.error(`Error updating to ${newStatus}:`, error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm("Delete this project permanently?")) {
      try {
        await deleteDoc(doc(db, "projects", projectId));
        setProjects(projects.filter(p => p.id !== projectId));
        if (reviewProject && reviewProject.id === projectId) setReviewProject(null);
      } catch (error) {
        console.error("Error deleting project:", error);
      }
    }
  };

  // --- 👤 USER ACTIONS ---
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const q = query(collection(db, "users"), where("username", "==", newUser.username));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        alert("A user with this Roll Number/Username already exists!");
        return;
      }

      await addDoc(collection(db, "users"), {
        fullName: newUser.name, 
        username: newUser.username,
        password: newUser.password,
        role: newUser.role
      });

      alert("User successfully added to the system!");
      setShowAddUser(false);
      setNewUser({ name: '', username: '', password: '', role: 'Student' });
      fetchDashboardData();
    } catch (error) {
      console.error("Error adding user:", error);
      alert("Failed to add new user.");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("WARNING: Are you sure you want to permanently delete this user account?")) {
      try {
        await deleteDoc(doc(db, "users", userId));
        setUsersList(usersList.filter(u => u.id !== userId));
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  // --- HELPER: GET USER'S PROJECTS ---
  const getUserProjects = (targetUser) => {
    return projects.filter(project => {
      let searchUsername = project.authorUsername;
      if (project.author && project.author.includes('(')) {
        const match = project.author.match(/\(([^)]+)\)/);
        if (match) searchUsername = match[1].trim();
      }
      
      const targetName = targetUser.fullName || targetUser.Name || targetUser.name;
      return searchUsername === targetUser.username || project.authorName === targetName;
    });
  };

  const totalProjects = projects.length;
  const pendingProjects = projects.filter(p => p.status === 'Pending').length;
  const approvedProjects = projects.filter(p => p.status === 'Approved').length;

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-gray-100 font-sans selection:bg-indigo-500/30 overflow-hidden relative">
      
      {/* --- MOBILE HEADER (NEW) --- */}
      <div className="md:hidden fixed top-0 w-full z-50 bg-[#050505]/90 backdrop-blur-md border-b border-white/10 p-4 flex justify-between items-center">
         <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-indigo-500" />
            <span className="font-bold text-lg tracking-tight text-white">Admin Panel</span>
         </div>
         <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
         >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
         </button>
      </div>

      {/* --- SIDEBAR (RESPONSIVE) --- */}
      <div className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-[#050505] border-r border-white/10 flex flex-col justify-between
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 md:static md:block
      `}>
        <div>
          {/* Sidebar Header */}
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg transform -rotate-3">
              <ShieldAlert className="w-5 h-5 text-white transform rotate-3" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Admin Panel</h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Command Center</p>
            </div>
          </div>
          
          <nav className="p-4 space-y-2">
            <button 
              onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all shadow-lg ${
                activeTab === 'dashboard' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'bg-transparent text-gray-400 hover:bg-white/5 border border-transparent'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" /> Projects
            </button>
            
            <button 
              onClick={() => { setActiveTab('users'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all shadow-lg ${
                activeTab === 'users' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'bg-transparent text-gray-400 hover:bg-white/5 border border-transparent'
              }`}
            >
              <Users className="w-5 h-5" /> Manage Users
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 px-4 py-3 rounded-xl font-medium transition-all"
          >
            <LogOut className="w-5 h-5" /> Secure Logout
          </button>
        </div>
      </div>

      {/* --- OVERLAY (MOBILE ONLY) --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 h-screen overflow-y-auto p-4 md:p-8 relative custom-scrollbar pt-24 md:pt-8">
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          
          {/* TAB 1: PROJECTS DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="animate-fade-in-up">
              <h2 className="text-3xl font-extrabold text-white mb-8">Project Overview</h2>

              {/* Stats Grid - Responsive cols */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md shadow-xl flex flex-col relative overflow-hidden group">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/10 rounded-bl-full transition-transform group-hover:scale-110"></div>
                  <span className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2 z-10">Total Projects</span>
                  <span className="text-4xl font-extrabold text-white z-10">{totalProjects}</span>
                </div>
                
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md shadow-xl flex flex-col relative overflow-hidden group">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-yellow-500/10 rounded-bl-full transition-transform group-hover:scale-110"></div>
                  <span className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2 z-10">Pending Review</span>
                  <span className="text-4xl font-extrabold text-yellow-400 z-10">{pendingProjects}</span>
                </div>

                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md shadow-xl flex flex-col relative overflow-hidden group">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-green-500/10 rounded-bl-full transition-transform group-hover:scale-110"></div>
                  <span className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2 z-10">Live Approved</span>
                  <span className="text-4xl font-extrabold text-green-400 z-10">{approvedProjects}</span>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[2rem] backdrop-blur-md shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <LayoutGrid className="w-5 h-5 text-indigo-400" /> Submissions Ledger
                  </h3>
                </div>
                
                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="p-10 text-center text-gray-500 animate-pulse">Loading database records...</div>
                  ) : projects.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">No projects found.</div>
                  ) : (
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="bg-black/20 text-xs text-gray-400 uppercase tracking-widest">
                          <th className="p-5 font-semibold border-b border-white/5">Project Name</th>
                          <th className="p-5 font-semibold border-b border-white/5">Developer</th>
                          <th className="p-5 font-semibold border-b border-white/5">Status</th>
                          <th className="p-5 font-semibold border-b border-white/5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {projects.map((project) => {
                          let searchUsername = project.authorUsername;
                          if (project.author && project.author.includes('(')) {
                            const match = project.author.match(/\(([^)]+)\)/);
                            if (match) searchUsername = match[1].trim();
                          }
                          const liveName = searchUsername ? userMap[searchUsername] : null;
                          const isValidUsername = searchUsername && searchUsername !== 'unknown' && searchUsername !== 'undefined' && searchUsername !== 'null';
                          const displayUsername = isValidUsername ? searchUsername : 'N/A';
                          const authorDisplay = liveName 
                            ? `${liveName} (${displayUsername})` 
                            : (project.author || `${project.authorName || 'Unknown'} (${displayUsername})`);
                          
                          return (
                            <tr key={project.id} className="hover:bg-white/5 transition-colors group">
                              <td className="p-5">
                                <p className="font-bold text-white group-hover:text-indigo-300 transition-colors">{project.title}</p>
                                <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider mt-1 inline-block">
                                  {project.category || 'App'}
                                </span>
                              </td>
                              <td className="p-5 text-sm text-gray-300">{authorDisplay}</td>
                              <td className="p-5">
                                {project.status === 'Approved' && <span className="inline-flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-xs px-3 py-1.5 rounded-full font-semibold"><CheckCircle className="w-3.5 h-3.5" /> Approved</span>}
                                {project.status === 'Pending' && <span className="inline-flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs px-3 py-1.5 rounded-full font-semibold"><Clock className="w-3.5 h-3.5" /> Pending</span>}
                                {project.status === 'Rejected' && <span className="inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-1.5 rounded-full font-semibold"><XCircle className="w-3.5 h-3.5" /> Rejected</span>}
                              </td>
                              <td className="p-5">
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => setReviewProject({...project, authorDisplay})} title="Review Details" className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-all border border-blue-500/20">
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  {project.status !== 'Approved' && (
                                    <button onClick={() => updateStatus(project.id, 'Approved')} title="Approve" className="p-2 bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white rounded-lg transition-all border border-green-500/20"><CheckCircle className="w-4 h-4" /></button>
                                  )}
                                  <button onClick={() => handleDeleteProject(project.id)} title="Delete Permanently" className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all border border-red-500/20">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USERS DIRECTORY */}
          {activeTab === 'users' && (
            <div className="animate-fade-in-up">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h2 className="text-3xl font-extrabold text-white">System Users</h2>
                <button 
                  onClick={() => setShowAddUser(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20"
                >
                  <UserPlus className="w-5 h-5" /> Add New User
                </button>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[2rem] backdrop-blur-md shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-400" /> Identity Directory
                  </h3>
                </div>
                
                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="p-10 text-center text-gray-500 animate-pulse">Loading identities...</div>
                  ) : (
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="bg-black/20 text-xs text-gray-400 uppercase tracking-widest">
                          <th className="p-5 font-semibold border-b border-white/5">Student Name</th>
                          <th className="p-5 font-semibold border-b border-white/5">Username / Roll No</th>
                          <th className="p-5 font-semibold border-b border-white/5">Role</th>
                          <th className="p-5 font-semibold border-b border-white/5 text-center">Projects</th>
                          <th className="p-5 font-semibold border-b border-white/5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {usersList.map((user) => {
                          const userProjects = getUserProjects(user);
                          const displayUserName = user.fullName || user.Name || user.name || "Unknown";
                          const initial = displayUserName.charAt(0).toUpperCase();

                          return (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                              <td className="p-5">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                                    {initial}
                                  </div>
                                  <p className="font-bold text-white group-hover:text-purple-300 transition-colors">
                                    {displayUserName}
                                  </p>
                                </div>
                              </td>
                              <td className="p-5 text-sm text-gray-300 font-mono">{user.username}</td>
                              <td className="p-5">
                                <span className={`border px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                  user.role === 'Admin' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                }`}>
                                  {user.role || 'Student'}
                                </span>
                              </td>
                              <td className="p-5 text-center">
                                <span className="bg-white/10 text-white font-bold py-1 px-3 rounded-full text-xs">
                                  {userProjects.length}
                                </span>
                              </td>
                              <td className="p-5">
                                <div className="flex justify-end gap-2">
                                  <button 
                                    onClick={() => setSelectedUser({...user, displayUserName})}
                                    title="View User Profile & Projects"
                                    className="p-2 bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white rounded-lg transition-all border border-purple-500/20"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteUser(user.id)}
                                    title="Delete User"
                                    className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all border border-red-500/20"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* MODALS SECTION - (Same as before, just kept for completeness) */}

      {/* 1. PROJECT REVIEW MODAL */}
      {reviewProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 font-sans">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setReviewProject(null)}></div>
          <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-fade-in-up">
            
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/40">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-indigo-400" /> Admin Review
              </h2>
              <button onClick={() => setReviewProject(null)} className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-full transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div className="w-full h-64 bg-black/50 border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center relative">
                {reviewProject.imageUrl ? (
                  <img src={reviewProject.imageUrl} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-gray-600 gap-2"><ImageIcon className="w-10 h-10" /><span>No image</span></div>
                )}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-bold text-white uppercase tracking-wider">
                  Status: <span className={reviewProject.status === 'Approved' ? 'text-green-400' : reviewProject.status === 'Rejected' ? 'text-red-400' : 'text-yellow-400'}>{reviewProject.status}</span>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-extrabold text-white mb-4">{reviewProject.title}</h3>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center mb-6">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Submitted By</p>
                    <p className="text-sm font-semibold text-gray-200 mt-0.5">{reviewProject.authorDisplay}</p>
                  </div>
                  {reviewProject.liveDemoUrl && (
                    <a href={reviewProject.liveDemoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-lg text-xs font-bold transition-all border border-indigo-500/20">
                      Live Link <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Project Description</p>
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap bg-white/5 border border-white/10 p-4 rounded-xl">
                    {reviewProject.description || 'No description provided.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/10 bg-black/40 flex justify-end gap-3">
              <button onClick={() => updateStatus(reviewProject.id, 'Rejected')} className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl font-bold text-sm transition-all border border-red-500/20">
                <XCircle className="w-4 h-4" /> Reject
              </button>
              <button onClick={() => updateStatus(reviewProject.id, 'Approved')} className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-400 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-green-500/20">
                <CheckCircle className="w-4 h-4" /> Approve & Publish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. ADD NEW USER MODAL (Identical logic) */}
      {showAddUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 font-sans">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowAddUser(false)}></div>
          <div className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2rem] shadow-2xl p-8 animate-fade-in-up">
            
            <button onClick={() => setShowAddUser(false)} className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-full transition-all border border-white/10">
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-purple-400" /> Create User
            </h2>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="text" required placeholder="Full Name (e.g. Rahul Kumar)"
                  value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 outline-none focus:border-purple-500/50 text-white text-sm"
                />
              </div>
              
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="text" required placeholder="Username / Roll No (e.g. 23bsccs01)"
                  value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value.toLowerCase()})}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 outline-none focus:border-purple-500/50 text-white text-sm"
                />
              </div>

              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="password" required placeholder="Temporary Password"
                  value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 outline-none focus:border-purple-500/50 text-white text-sm"
                />
              </div>

              <div className="relative">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <select 
                  value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 outline-none focus:border-purple-500/50 text-white appearance-none cursor-pointer text-sm"
                >
                  <option value="Student" className="bg-[#0a0a0a]">Student Account</option>
                  <option value="Admin" className="bg-[#0a0a0a]">Administrator Account</option>
                </select>
              </div>

              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3.5 rounded-2xl font-bold transition-all shadow-lg mt-4">
                Register User
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. STUDENT DOSSIER MODAL (Identical logic) */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 font-sans">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedUser(null)}></div>
          <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-fade-in-up">
            
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/40">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" /> Student Dossier
              </h2>
              <button onClick={() => setSelectedUser(null)} className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-full transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-[50px] rounded-full"></div>
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-black text-3xl shadow-lg border border-white/20 transform -rotate-3">
                  {selectedUser.displayUserName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{selectedUser.displayUserName}</h3>
                  <p className="text-gray-400 font-mono text-sm mt-1">{selectedUser.username}</p>
                  <span className={`inline-block border px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mt-2 ${
                    selectedUser.role === 'Admin' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    {selectedUser.role || 'Student'}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Submitted Projects ({getUserProjects(selectedUser).length})</h4>
                <div className="space-y-3">
                  {getUserProjects(selectedUser).length === 0 ? (
                    <div className="p-6 text-center text-gray-500 bg-white/5 rounded-xl border border-white/5 text-sm">
                      This user has not submitted any projects yet.
                    </div>
                  ) : (
                    getUserProjects(selectedUser).map(project => (
                      <div key={project.id} className="bg-black/40 p-4 rounded-xl border border-white/10 flex items-center justify-between hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-black/50 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                            {project.imageUrl ? (
                              <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-600"><LayoutGrid className="w-4 h-4" /></div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">{project.title}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">{project.category}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          project.status === 'Approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                          project.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                          'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;