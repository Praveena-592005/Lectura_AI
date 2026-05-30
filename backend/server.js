// server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import auth from './routes/auth.js';
import summary from './routes/summary.js';
import folderRoutes from './routes/folderRoutes.js';

dotenv.config();
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configure CORS for Production
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// API Routes
app.use('/api/auth', auth);
app.use('/api/summary', summary);
app.use('/api/folderRoutes', folderRoutes);

// Production Static File Serving
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'));
  });
}

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Operational error caught in pipeline:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected server-side error occurred'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server executing active connection streams over port ${PORT}`));