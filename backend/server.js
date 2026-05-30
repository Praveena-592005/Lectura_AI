import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import connectDB from './config/db.js';
import auth from './routes/auth.js';
import summary from './routes/summary.js';
import folderRoutes from './routes/folderRoutes.js';

dotenv.config();
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const corsOptions = {
  origin: function (origin, callback) {
    // 1. Get the URL from env, remove any trailing slash
    const allowedOrigin = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, "");
    
    // 2. Allow requests with no origin (like mobile apps or curl) 
    //    OR check if the origin starts with our allowed base
    if (!origin || origin.startsWith(allowedOrigin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/auth', auth);
app.use('/api/summary', summary);
app.use('/api/folderRoutes', folderRoutes);

app.use((err, req, res, next) => {
  console.error('Operational error caught in pipeline:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected server-side error occurred'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server executing active connection streams over port ${PORT}`));