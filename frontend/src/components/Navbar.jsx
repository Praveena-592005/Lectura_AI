import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, History, LayoutDashboard, Folder } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-0"> 
              <img 
                src="/lecture.png" 
                alt="LecturaAI Logo" 
                className="h-9 w-10 object-contain" 
              />
              <span className="font-bold text-2xl text-indigo-600 ml-[-4px]">LecturaAI</span> 
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
            {token ? (
              <>
                <Link to="/dashboard" className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-md font-medium text-sm">
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
                <Link to="/folders" className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-md font-medium text-sm">
                  <Folder className="h-4 w-4" /> Folders
                </Link>
                <Link to="/history" className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-md font-medium text-sm">
                  <History className="h-4 w-4" /> History
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-1 text-red-600 hover:bg-red-50 px-3 py-2 rounded-md font-medium text-sm transition">
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-600 hover:text-indigo-600 font-medium text-sm px-4">Login</Link>
                <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-indigo-700 transition">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}