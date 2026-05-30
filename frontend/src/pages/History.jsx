// src/pages/History.jsx
import React, { useEffect, useState } from 'react';
import { Clock, Calendar, Download, Trash2, Copy, FolderPlus } from 'lucide-react';
import { downloadAsTXT, downloadAsDOCX, downloadAsPDF } from '../utils/downloadUtil';
import MarkdownRenderer from '../components/MarkdownRenderer';
import AddToFolderModal from '../components/AddToFolderModal';

export default function History() {
  const [history, setHistory] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formats, setFormats] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedSummaryId, setSelectedSummaryId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      const [histRes, foldRes] = await Promise.all([
        fetch('http://localhost:5000/api/summary/history', { headers }),
        fetch('http://localhost:5000/api/folderRoutes', { headers })
      ]);
      
      if (histRes.ok) setHistory(await histRes.json());
      if (foldRes.ok) setFolders(await foldRes.json());
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openFolderModal = (id) => {
    setSelectedSummaryId(id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently clear this archival log record?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/summary/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setHistory(prev => prev.filter(item => item._id !== id));
      } else {
        const errData = await res.json();
        alert(errData.message || 'Deletion failed');
      }
    } catch (err) {
      console.error('Error executing deletion', err);
    }
  };

  const handleFormatChange = (id, value) => {
    setFormats(prev => ({ ...prev, [id]: value }));
  };

  const triggerHistoryDownload = (item) => {
    const selectedFormat = formats[item._id] || 'txt';
    if (selectedFormat === 'txt') downloadAsTXT(item.title, item.summaryText);
    else if (selectedFormat === 'docx') downloadAsDOCX(item.title, item.summaryText);
    else if (selectedFormat === 'pdf') downloadAsPDF(item.title, item.summaryText);
  };

  const handleCopyHistory = (text) => {
    navigator.clipboard.writeText(text).then(() => alert('Copied to clipboard!'));
  };

  if (loading) return <div className="text-center py-12 text-slate-500">Retrieving operational summary streams...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Clock className="text-indigo-600" /> Generation Logs
      </h2>
      
      {history.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="text-lg font-medium text-slate-600">No history available</h3>
          <p className="text-slate-400 mt-2">Your generated summaries will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {history.map((item) => (
            <div key={item._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-3">
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{item.title}</h3>
                  <span className="text-xs text-slate-400 flex items-center gap-1 mb-3">
                    <Calendar className="h-3 w-3" /> {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button onClick={() => handleCopyHistory(item.summaryText)} title="Copy" className="p-1.5 text-slate-500 hover:text-indigo-600 transition-colors">
                    <Copy size={16} />
                  </button>
                  <button onClick={() => openFolderModal(item._id)} title="Add to Folder" className="p-1.5 text-slate-500 hover:text-indigo-600 transition-colors">
                    <FolderPlus size={18} />
                  </button>
                  <button onClick={() => triggerHistoryDownload(item)} title="Download" className="p-1.5 text-slate-500 hover:text-indigo-600 transition-colors">
                    <Download size={16} />
                  </button>
                  <select 
                    value={formats[item._id] || 'txt'} 
                    onChange={(e) => handleFormatChange(item._id, e.target.value)} 
                    className="text-xs p-1.5 border border-slate-200 rounded-md bg-white text-slate-600 outline-none cursor-pointer"
                  >
                    <option value="txt">.TXT</option>
                    <option value="docx">.DOCX</option>
                    <option value="pdf">.PDF</option>
                  </select>
                  <button onClick={() => handleDelete(item._id)} className="flex items-center gap-1 text-xs bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1.5 ml-2 rounded-md font-medium transition-colors">
                    <Trash2 className="h-3.5 w-3.5" /> 
                  </button>
                </div>
              </div>
              
              <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 max-h-60 overflow-y-auto">
                <MarkdownRenderer markdownText={item.summaryText} />
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <AddToFolderModal 
          summaryId={selectedSummaryId} 
          folders={folders} 
          onClose={() => setShowModal(false)} 
          onAdded={() => {
            setShowModal(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}