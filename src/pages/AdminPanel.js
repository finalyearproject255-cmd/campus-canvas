import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

function AdminPanel({ onLogout }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false); // To trigger re-renders

  // 1. FETCH ALL PROJECTS
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "projects"));
        const projectsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProjects(projectsList);
        setLoading(false);
      } catch (error) {
        console.error("Error loading projects:", error);
        setLoading(false);
      }
    };

    fetchProjects();
  }, [refresh]);

  // 2. UPDATE STATUS (Approve/Reject)
  const handleStatus = async (projectId, newStatus) => {
    try {
      const projectRef = doc(db, "projects", projectId);
      await updateDoc(projectRef, { status: newStatus });
      setRefresh(!refresh); // Reload list
    } catch (error) {
      alert("Error updating status");
    }
  };

  // 3. DELETE PROJECT
  const handleDelete = async (projectId) => {
    if (window.confirm("⚠️ Are you sure you want to permanently delete this project?")) {
      try {
        await deleteDoc(doc(db, "projects", projectId));
        setRefresh(!refresh); // Reload list
        alert("Project deleted.");
      } catch (error) {
        alert("Error deleting project");
      }
    }
  };

  // CALCULATE STATS
  const totalProjects = projects.length;
  const pendingProjects = projects.filter(p => p.status === 'Pending').length;
  const approvedProjects = projects.filter(p => p.status === 'Approved').length;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      
      {/* SIDEBAR */}
      <div className="w-64 bg-indigo-900 text-white p-6 flex flex-col hidden md:flex">
        <h1 className="text-2xl font-bold mb-8">Admin Panel</h1>
        
        <div className="flex-1 space-y-4">
          <div className="p-3 bg-white/10 rounded-xl cursor-pointer font-bold">📂 Dashboard</div>
          <div className="p-3 hover:bg-white/5 rounded-xl cursor-pointer text-white/60" onClick={() => alert("Feature coming soon!")}>👥 Users</div>
          <div className="p-3 hover:bg-white/5 rounded-xl cursor-pointer text-white/60" onClick={() => alert("Feature coming soon!")}>⚙️ Settings</div>
        </div>

        <button 
          onClick={onLogout}
          className="mt-auto bg-red-500/20 p-3 rounded-xl cursor-pointer hover:bg-red-500 hover:text-white transition text-red-300 text-center font-bold"
        >
          Log Out
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-8 overflow-y-auto">
        
        {/* HEADER & STATS */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Project Overview</h2>
          <div className="md:hidden text-red-500 font-bold cursor-pointer" onClick={onLogout}>Logout</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-bold uppercase">Total Projects</h3>
            <p className="text-4xl font-bold text-indigo-900 mt-2">{totalProjects}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-bold uppercase">Pending Review</h3>
            <p className="text-4xl font-bold text-orange-500 mt-2">{pendingProjects}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-bold uppercase">Live Approved</h3>
            <p className="text-4xl font-bold text-green-500 mt-2">{approvedProjects}</p>
          </div>
        </div>

        {/* PROJECT TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-bold text-lg">Submissions</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="p-4">Project Name</th>
                  <th className="p-4">Student</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-bold text-gray-800">{project.title}</td>
                    <td className="p-4 text-sm text-gray-600">{project.author}</td>
                    <td className="p-4">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                        {project.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        project.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                        project.status === 'Rejected' ? 'bg-red-100 text-red-700' : 
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {project.status || 'Pending'}
                      </span>
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      
                      {/* APPROVE BUTTON (Only if not already approved) */}
                      {project.status !== 'Approved' && (
                        <button 
                          onClick={() => handleStatus(project.id, 'Approved')}
                          className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-500 hover:text-white transition"
                          title="Approve"
                        >
                          ✓
                        </button>
                      )}

                      {/* REJECT BUTTON */}
                      {project.status !== 'Rejected' && (
                        <button 
                          onClick={() => handleStatus(project.id, 'Rejected')}
                          className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center hover:bg-orange-500 hover:text-white transition"
                          title="Reject / Hide"
                        >
                          ✕
                        </button>
                      )}

                      {/* DELETE BUTTON */}
                      <button 
                        onClick={() => handleDelete(project.id)}
                        className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-500 hover:text-white transition"
                        title="Delete Permanently"
                      >
                        🗑️
                      </button>

                    </td>
                  </tr>
                ))}
                
                {projects.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-400">No projects found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminPanel;