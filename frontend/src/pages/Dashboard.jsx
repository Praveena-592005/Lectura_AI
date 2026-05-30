import React, { useState, useEffect } from 'react';
import { downloadAsTXT, downloadAsDOCX, downloadAsPDF } from '../utils/downloadUtil';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { useFormContext } from '../context/FormContext';
import { Copy, Download, MessageSquare, FolderPlus, Sparkles } from 'lucide-react';
import AddToFolderModal from '../components/AddToFolderModal';

const Dashboard = () => {
  const {
    title, setTitle,
    text, setText,
    file, setFile,
    videoUrl, setVideoUrl,
    mode, setMode,
    result, setResult,
    downloadFormat, setDownloadFormat
  } = useFormContext();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [depth, setDepth] = useState(2);

  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  const [showModal, setShowModal] = useState(false);
 const [currentSummaryId, setCurrentSummaryId] = useState(null);

const [folders, setFolders] = useState([]);

useEffect(() => {
    const fetchFolders = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/folderRoutes', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setFolders(data);
        }
      } catch (err) {
        console.error("Failed to fetch folders", err);
      }
    };
    fetchFolders();
  }, []);

  const getDepthLabel = (val) => {
    if (val === 1) return 'Quick Bullet Points';
    if (val === 2) return 'Standard Balanced Recap';
    return 'Exhaustive Deep-Dive Notes';
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/summary/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, text, depth })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Processing failed');
      setResult(data.summaryText);
      setCurrentSummaryId(data._id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

const handleFileSubmit = async (e) => {
  e.preventDefault();
  if (!file) {
    setError('Please choose a file first.');
    return;
  }

  setLoading(true);
  setError('');
  setResult('');

  const formData = new FormData();
  formData.append('title', title || file.name);
  formData.append('file', file);
  formData.append('depth', depth);

  try {
    const token = localStorage.getItem('token');
    // FIXED: Changed '/api/summary/summarize-file' to 'http://localhost:5000/api/summaries/summarize-file'
    const response = await fetch('http://localhost:5000/api/summary/summarize-file', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Processing failed on server');
    }

    setResult(data.summaryText);
    setCurrentSummaryId(data._id);
  } catch (err) {
    console.error("Upload Error:", err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
  const handleYouTubeSubmit = async (e) => {
    e.preventDefault();
    if (!videoUrl) {
      setError('Please provide a valid YouTube watch link.');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/summary/summarize-youtube', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, videoUrl, depth })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Processing failed');
      setResult(data.summaryText);
      setCurrentSummaryId(data._id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  
  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;
    const newHistory = [...chatHistory, { role: 'user', content: chatInput }];
    setChatHistory(newHistory);
    setChatInput('');
    try {
      const response = await fetch('http://localhost:5000/api/summary/ask-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ query: chatInput, summaryContext: result })
      });
      const data = await response.json();
      setChatHistory([...newHistory, { role: 'ai', content: data.answer }]);
    } catch (err) { console.error('Chat error:', err); }
  };
  
  const executeFormSubmit = (e) => {
    if (mode === 'text') handleTextSubmit(e);
    else if (mode === 'file') handleFileSubmit(e);
    else if (mode === 'youtube') handleYouTubeSubmit(e);
  };

  const triggerDownload = () => {
    const fileTitle = title || "Lecture_Summary";
    if (downloadFormat === 'txt') downloadAsTXT(fileTitle, result);
    else if (downloadFormat === 'docx') downloadAsDOCX(fileTitle, result);
    else if (downloadFormat === 'pdf') downloadAsPDF(fileTitle, result);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result).then(() => alert('Copied to clipboard!'));
  };

  const iconButtonStyle = { background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: '#64748b', display: 'flex', alignItems: 'center' };

  return (
    <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif', color: '#333' }}>
    
<h2 style={{ fontSize: '28px', marginBottom: '24px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '12px' }}>
  <Sparkles size={28} className="text-indigo-600" /> 
  Create Lecture Summary
</h2>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          type="button"
          onClick={() => { setMode('text'); setError(''); }}
          style={{ padding: '10px 20px', border: 'none', borderRadius: '12px', background: mode === 'text' ? '#4f46e5' : '#e2e8f0', color: mode === 'text' ? '#fff' : '#475569', cursor: 'pointer', fontWeight: '600' }}
        >
          Transcript Text
        </button>
        <button 
          type="button"
          onClick={() => { setMode('file'); setError(''); }}
          style={{ padding: '10px 20px', border: 'none', borderRadius: '12px', background: mode === 'file' ? '#4f46e5' : '#e2e8f0', color: mode === 'file' ? '#fff' : '#475569', cursor: 'pointer', fontWeight: '600' }}
        >
          Document / Media
        </button>
        <button 
          type="button"
          onClick={() => { setMode('youtube'); setError(''); }}
          style={{ padding: '10px 20px', border: 'none', borderRadius: '12px', background: mode === 'youtube' ? '#4f46e5' : '#e2e8f0', color: mode === 'youtube' ? '#fff' : '#475569', cursor: 'pointer', fontWeight: '600' }}
        >
          YouTube Link
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <form onSubmit={executeFormSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Lecture Title</label>
              <input 
                type="text" 
                placeholder="e.g., Computer Science Lecture" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{ width: '100%', padding: '10px',border: '1px solid #4f46e5',outline: 'none', borderRadius: '12px', boxSizing: 'border-box' }}
              />
            </div>

            {mode === 'text' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Transcript Text</label>
                <textarea 
                  placeholder="Paste your lecture notes or transcript lines here..." 
                  value={text} 
                  onChange={(e) => setText(e.target.value)}
                  required={mode === 'text'}
                  style={{ width: '100%', height: '200px', padding: '10px', border: '1px solid #4f46e5',outline: 'none', borderRadius: '12px', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>
            )}

            {mode === 'file' && (
              <div style={{ marginBottom: '16px', padding: '30px 20px', border: '2px dashed #cbd5e1', borderRadius: '8px', textAlign: 'center', background: '#f8fafc' }}>
                <input 
                  type="file" 
                  accept=".pdf,.docx,.txt,.mp3,.mp4,.mpeg,.m4a,.wav,audio/mp3,audio/mpeg,audio/x-mpeg,audio/mp4,audio/x-m4a,audio/wav,audio/x-wav,video/mp4,video/mpeg"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{ cursor: 'pointer' }}
                />
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>Supported extensions: .pdf, .docx, .txt, .mp3, .mp4, .m4a, .wav</p>
                {file && <p style={{ fontSize: '14px', color: '#4f46e5', marginTop: '4px', fontWeight: '600' }}>Selected: {file.name}</p>}
              </div>
            )}

            {mode === 'youtube' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>YouTube Video Link URL</label>
                <input 
                  type="url" 
                  placeholder="https://www.youtube.com/watch?v=..." 
                  value={videoUrl} 
                  onChange={(e) => setVideoUrl(e.target.value)}
                  required={mode === 'youtube'}
                  style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }}
                />
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>The server will automatically isolate and extract text subtitles from your link targets.</p>
              </div>
            )}

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontWeight: '600', color: '#334155', fontSize: '14px' }}>Summary Depth Target:</label>
                <span style={{ fontSize: '14px', color: '#4f46e5', fontWeight: '700' }}>
                  {getDepthLabel(depth)}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="1"
                value={depth}
                onChange={(e) => setDepth(parseInt(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', accentColor: '#4f46e5' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '4px', fontWeight: '500' }}>
                <span>Short Summary</span>
                <span>Standard</span>
                <span>Deep Dive Guide</span>
              </div>
            </div>

            {error && <p style={{ color: '#dc2626', fontSize: '14px', marginBottom: '12px' }}>{error}</p>}

            <button 
              type="submit" 
              disabled={loading}
              style={{ width: '100%', padding: '12px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Compiling Notes...' : 'Generate AI Summary'}
            </button>
          </form>
        </div>

        <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '18px' }}>Study Note Output</h3>
            
            {result && (
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                
                {/* Copy Button */}
<button 
  onClick={handleCopy}
  title="Copy to clipboard"
  className="p-1 text-slate-500 hover:text-indigo-600 transition-colors flex items-center bg-transparent border-none cursor-pointer"
>
  <Copy size={18} />
</button>

{/* Add to Folder Button */}
<button 
  onClick={() => setShowModal(true)} 
  title="Add to Folder" 
  className="p-1 text-slate-500 hover:text-indigo-600 transition-colors flex items-center bg-transparent border-none cursor-pointer"
>
  <FolderPlus size={18} />
</button>

{/* Download Button */}
<button 
  onClick={triggerDownload} 
  title="Download" 
  className="p-1 text-slate-500 hover:text-indigo-600 transition-colors flex items-center bg-transparent border-none cursor-pointer"
>
  <Download size={18} />
</button>
                <select 
                  value={downloadFormat} 
                  onChange={(e) => setDownloadFormat(e.target.value)}
                  style={{ padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px', background: '#fff', outline: 'none' }}
                >
                  <option value="txt">.TXT</option>
                  <option value="docx">.DOCX</option>
                  <option value="pdf">.PDF</option>
                </select>
        

              </div>
            )}
          </div>
          <div style={{ flex: 1, fontSize: '15px', lineHeight: '1.6', color: '#1e293b', overflowY: 'auto', maxHeight: '420px', paddingRight: '4px' }}>
            {result ? <MarkdownRenderer markdownText={result} /> : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Your structured study blueprint will populate here once generation completes.</span>}
          </div>

         {result && (
  <div style={{ marginTop: '30px', borderTop: '2px solid #e2e8f0', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
    {/* Updated Header with Icon */}
    <h4 style={{ margin: '0 0 5px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
      <MessageSquare size={18} className="text-indigo-600" /> 
      Chat with these notes
    </h4>
    <div style={{ height: '300px', overflowY: 'auto', background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
  
  {chatHistory.map((m, i) => (
  <div 
    key={i} 
    style={{ 
      padding: '10px 14px', 
      borderRadius: '12px',
      maxWidth: '85%',
      fontSize: '14px',
      alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
      background: m.role === 'user' ? '#4f46e5' : '#fff',
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      marginBottom: '10px'
    }}
  >
    {/* PASS THE COLOR PROP HERE */}
    <MarkdownRenderer 
      markdownText={m.content} 
      textColor={m.role === 'user' ? '#ffffff' : '#1e293b'} 
    />
  </div>
))}

    </div>
    <div style={{ display: 'flex', gap: '10px' }}>
      <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()} placeholder="Ask a question..." style={{ flex: 1, padding: '10px', borderRadius: '12px',border: '1px solid #4f46e5',outline: 'none'}} />
      <button onClick={handleChatSubmit} style={{ padding: '10px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>Send</button>
    </div>
  </div>
)}
          
        </div>
      </div>
      {/* PASTE MODAL HERE */}
      {showModal && (
  <AddToFolderModal 
    summaryId={currentSummaryId} 
    folders={folders} // <--- Pass the folders here
    onClose={() => setShowModal(false)} 
    onAdded={() => {
      setShowModal(false);
      alert("Added to folder successfully!");
    }}
  />
)}
    </div>
  );
};

export default Dashboard;