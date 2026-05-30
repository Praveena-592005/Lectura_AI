import express from 'express';
import mammoth from 'mammoth';
import fs from 'fs';
import { createRequire } from 'module';
import { YoutubeTranscript } from 'youtube-transcript';
import Summary from '../models/Summary.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadMedia } from '../middleware/fileUpload.js';
import Folder from '../models/Folder.js';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
const router = express.Router();

// --- Helper Functions ---
function extractVideoId(url) {
  const regExp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[1].length === 11) ? match[1] : null;
}

async function transcribeWithGroq(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const boundary = `----WebKitFormBoundary${Math.random().toString(36).substring(2)}`;
  const leadingPart = [
    `--${boundary}\r\n`, `Content-Disposition: form-data; name="model"\r\n\r\n`, `whisper-large-v3\r\n`,
    `--${boundary}\r\n`, `Content-Disposition: form-data; name="file"; filename="lecture_audio.mp3"\r\n`, `Content-Type: audio/mp3\r\n\r\n`
  ].join('');
  const trailingPart = `\r\n--${boundary}--\r\n`;
  const totalBodyBuffer = Buffer.concat([Buffer.from(leadingPart), fileBuffer, Buffer.from(trailingPart)]);

  const groqResponse = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': `multipart/form-data; boundary=${boundary}`, 'Content-Length': totalBodyBuffer.length.toString() },
    body: totalBodyBuffer
  });

  if (!groqResponse.ok) throw new Error(`Groq error: ${await groqResponse.text()}`);
  return (await groqResponse.json()).text;
}

function generateLocalBackupSummary(rawText, depthLevel = 2) {
  const sentences = rawText.match(/[^.!?]+[.!?]+/g) || [rawText];
  let summaryMarkdown = `# 📚 LECTURE RECAP & SUMMARY\n\n## 🎯 Core Executive Summary\n* This content provides an academic overview.\n\n## 🔑 Key Pillars\n`;
  
  let step = parseInt(depthLevel) === 1 ? 6 : (parseInt(depthLevel) === 3 ? 2 : 4);
  let count = 0;
  sentences.forEach((sentence) => {
    if (sentence.trim().length > 30 && count % step === 0) {
      summaryMarkdown += `* ${sentence.trim()}\n`;
    }
    count++;
  });
  return summaryMarkdown;
}

async function generateSummaryWithGroq(text, depthLevel = 2) {
  const depth = parseInt(depthLevel);
  const instructions = depth === 1 
    ? "Provide an ultra-short, surface-level micro summary. Use exactly 3 bullet points. Focus only on the theme."
    : (depth === 3 
        ? "Provide an exhaustive, deeply comprehensive academic study guide. Include all definitions, contextual explanations, and technical arguments in multi-layered markdown lists."
        : "Provide a balanced, standard academic summary with clear sections, bold key terms, and bulleted insights.");

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are an expert academic notes compiler." },
          { role: "user", content: `${instructions}\n\nContent:\n${text}` }
        ]
      })
    });
    const data = await response.json();
    if (data.choices?.[0]?.message?.content) return data.choices[0].message.content;
    throw new Error("Groq API error");
  } catch (err) {
    console.error("Groq failed, using backup.", err);
    return generateLocalBackupSummary(text, depthLevel);
  }
}

// --- API Routes ---
router.post('/ask-chat', protect, async (req, res) => {
  const { query, summaryContext } = req.body;
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "system", content: summaryContext }, { role: "user", content: query }] })
    });
    const data = await response.json();
    res.json({ answer: data.choices[0].message.content });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/summarize', protect, async (req, res) => {
  const { title, text, depth, folderId } = req.body;
  try {
    const summaryText = await generateSummaryWithGroq(text, depth);
    const summaryData = { user: req.user._id, title, originalText: text, summaryText };
    
    if (folderId && folderId !== 'null' && folderId !== '') {
      summaryData.folder = folderId;
    }

    const newSummary = await Summary.create(summaryData);
    res.status(201).json(newSummary);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/summarize-file', protect, uploadMedia.single('file'), async (req, res) => {
  const { title, depth, folderId } = req.body;
  if (!req.file) return res.status(400).json({ message: 'No file' });
  try {
    let extractedText = '';
    const mime = req.file.mimetype;
    if (mime.includes('audio') || mime.includes('video')) extractedText = await transcribeWithGroq(req.file.path);
    else if (mime === 'application/pdf') extractedText = (await pdfParse(fs.readFileSync(req.file.path))).text;
    else if (mime.includes('word')) extractedText = (await mammoth.extractRawText({ buffer: fs.readFileSync(req.file.path) })).value;
    else extractedText = fs.readFileSync(req.file.path, 'utf-8');

    const summaryText = await generateSummaryWithGroq(extractedText, depth);
    const summaryData = { user: req.user._id, title: title || req.file.originalname, originalText: extractedText, summaryText };
    
    if (folderId && folderId !== 'null' && folderId !== '') {
      summaryData.folder = folderId;
    }

    const newSummary = await Summary.create(summaryData);
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(201).json(newSummary);
  } catch (err) { 
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: err.message }); 
  }
});

router.post('/summarize-youtube', protect, async (req, res) => {
  const { title, videoUrl, depth, folderId } = req.body;
  const videoId = extractVideoId(videoUrl);
  if (!videoId) return res.status(400).json({ message: 'Invalid URL' });
  try {
    const transcript = (await YoutubeTranscript.fetchTranscript(videoId)).map(i => i.text).join(' ');
    const summaryText = await generateSummaryWithGroq(transcript, depth);
    const summaryData = { user: req.user._id, title: title || 'YouTube', originalText: transcript, summaryText };
    
    if (folderId && folderId !== 'null' && folderId !== '') {
      summaryData.folder = folderId;
    }

    const newSummary = await Summary.create(summaryData);
    res.status(201).json(newSummary);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Add this to routes/summary.js if it doesn't exist
router.get('/', protect, async (req, res) => {
  const { folderId } = req.query;
  const filter = { user: req.user._id };
  if (folderId) filter.folder = folderId;
  
  const summaries = await Summary.find(filter).sort({ createdAt: -1 });
  res.json(summaries);
});

router.get('/history', protect, async (req, res) => {
  try {
    const summaries = await Summary.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(summaries);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Ensure this route in routes/summary.js is flexible
// routes/summary.js (Relevant modified routes)
router.patch('/:id', protect, async (req, res) => {
  const { folderId } = req.body;
  const summaryId = req.params.id;

  console.log("--- DEBUG START ---");
  console.log("Summary ID:", summaryId);
  console.log("Incoming folderId from request:", folderId);

  try {
    // Determine the value to save
    let valueToSave = folderId;
    if (folderId === 'null' || folderId === null || folderId === undefined) {
      valueToSave = null;
    }

    console.log("Value to save in DB:", valueToSave);

    const updatedSummary = await Summary.findByIdAndUpdate(
      summaryId,
      { folder: valueToSave },
      { new: true }
    );

    if (!updatedSummary) {
      console.log("Summary not found in DB");
      return res.status(404).json({ message: "Summary not found" });
    }

    console.log("Successfully updated:", updatedSummary);
    res.json(updatedSummary);
  } catch (err) {
    console.error("CRITICAL DB ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const deleted = await Summary.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Summary not found" });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;