import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function AddToFolderModal({ summaryId, folders, onClose, onAdded }) {
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSave = async () => {
    if (!selectedFolder) return;
    await axios.patch(`http://localhost:5000/api/summary/${summaryId}`, 
      { folderId: selectedFolder._id },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );
    onAdded();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-96">
        <h3 className="text-lg font-bold mb-4">Add to Folder</h3>

        <div className="relative mb-4" ref={dropdownRef}>
          <button 
            className="w-full p-2 border rounded-lg text-left bg-white flex justify-between items-center"
            onClick={() => setIsOpen(!isOpen)}
          >
            {selectedFolder ? selectedFolder.name : "Select a folder"}
            <span className="text-gray-400 text-xs">▼</span>
          </button>
          
          {isOpen && (
            <ul className="absolute w-full mt-1 bg-white border rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto">
              {folders.length > 0 ? (
                folders.map(f => (
                  <li 
                    key={f._id}
                    className="p-2 cursor-pointer hover:bg-indigo-600 hover:text-white transition-colors"
                    onClick={() => {
                      setSelectedFolder(f);
                      setIsOpen(false);
                    }}
                  >
                    {f.name}
                  </li>
                ))
              ) : (
                <li className="p-2 text-gray-400 italic">No folders available</li>
              )}
            </ul>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save</button>
        </div>
      </div>
    </div>
  );
}