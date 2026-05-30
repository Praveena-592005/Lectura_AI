// src/components/Folders.jsx
import React, { useState, useEffect } from 'react';
import { Folder, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Folders() {
  const [folders, setFolders] = useState([]);
  const [newFolderName, setNewFolderName] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const fetchFolders = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:5000/api/folderRoutes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFolders(data);
    } catch (error) {
      console.error("Error fetching folders:", error);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, [location]);

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/folderRoutes', 
        { name: newFolderName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewFolderName('');
      fetchFolders();
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  const handleDeleteFolder = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this folder? All items inside will be unassigned.")) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/folderRoutes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFolders(folders.filter(f => f._id !== id));
    } catch (error) {
      console.error("Error deleting folder:", error);
      alert("Failed to delete folder.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Folder className="text-indigo-600" /> My Study Folders
      </h2>
      <form onSubmit={handleCreateFolder} className="flex gap-2 mb-8">
        <input
          type="text"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          placeholder="Create a new folder (e.g., Unit 1 Notes)"
          className="flex-1 px-4 py-2 border border-slate-300 rounded-xl outline-none focus:border-indigo-500"
        />
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-indigo-700 flex items-center gap-1">
          <Plus size={18} /> Create
        </button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {folders.map((folder) => (
          <div 
            key={folder._id} 
            onClick={() => navigate(`/folders/${folder._id}`)}
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer hover:border-indigo-600"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <Folder className="text-indigo-400" />
                <h3 className="font-bold text-lg text-slate-800">{folder.name}</h3>
              </div>
              <button 
                onClick={(e) => handleDeleteFolder(e, folder._id)} 
                className="text-slate-400 hover:text-red-500"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <p className="text-sm text-slate-500 mt-4">
              {folder.summaryCount ?? 0} items saved
            </p>
          </div>
        ))}
        {folders.length === 0 && (
          <p className="text-slate-400 text-center py-10 col-span-2">No folders created yet. Start organizing your notes!</p>
        )}
      </div>
    </div>
  );
}