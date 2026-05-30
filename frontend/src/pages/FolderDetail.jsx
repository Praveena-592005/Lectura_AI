// src/pages/FolderDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, BookOpen, X, Trash2, FolderOpen } from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';

export default function FolderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [folder, setFolder] = useState(null);
  const [summaries, setSummaries] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFolderData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Fetch both folder info and summaries
      const [folderRes, sumRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/folderRoutes/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`http://localhost:5000/api/summary?folderId=${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setFolder(folderRes.data);
      setSummaries(sumRes.data);
    } catch (error) {
      console.error("Error fetching folder contents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolderData();
  }, [id]);

  const handleDeleteNote = async (e, noteId) => {
    e.stopPropagation();
    if (!window.confirm("Remove this note from the folder?")) return;

    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/summary/${noteId}`, 
        { folderId: null }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Remove from local state to update UI immediately
      setSummaries(summaries.filter(s => s._id !== noteId));
    } catch (error) {
      console.error("Error removing note:", error);
      alert("Failed to remove note.");
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Loading your notes...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => navigate('/folders')} className="flex items-center text-slate-500 mb-6 hover:text-indigo-600 transition-colors">
        <ArrowLeft size={20} className="mr-1" /> Back to Folders
      </button>
      
      <h2 className="text-3xl font-bold text-slate-800 mb-8">{folder?.name || "Folder"}</h2>

      {summaries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summaries.map((s) => (
            <div 
              key={s._id} 
              onClick={() => setSelectedNote(s)}
              className="bg-white p-4 rounded-xl border border-slate-200 cursor-pointer hover:border-indigo-600 shadow-sm hover:shadow-md transition flex justify-between items-center"
            >
              <div className="flex items-center gap-4">
                  <BookOpen className="text-indigo-500" />
                  <div>
                    <h3 className="font-semibold text-slate-800">{s.title}</h3>
                    <p className="text-sm text-slate-500">{new Date(s.createdAt).toLocaleDateString()}</p>
                  </div>
              </div>
              <button 
                onClick={(e) => handleDeleteNote(e, s._id)}
                className="text-slate-400 hover:text-red-500 p-2 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <FolderOpen size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-600">No notes available</h3>
          <p className="text-slate-400">This folder is currently empty.</p>
        </div>
      )}

      {selectedNote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto relative shadow-2xl">
            <button onClick={() => setSelectedNote(null)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500">
              <X />
            </button>
            <h2 className="text-2xl font-bold mb-4 text-slate-800">{selectedNote.title}</h2>
            <div className="prose prose-slate max-w-none">
              <MarkdownRenderer markdownText={selectedNote.summaryText} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}