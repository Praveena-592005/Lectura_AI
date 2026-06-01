// middleware/fileUpload.js
import multer from 'multer';

// Use memoryStorage so the file is held in RAM (Buffer)
// This is required for Vercel/Render compatibility
const storage = multer.memoryStorage();

export const uploadMedia = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'audio/mp3', 'audio/mpeg', 'audio/x-mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/wav', 'audio/x-wav',
      'video/mp4', 'video/mpeg'
    ];

    if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported format: ${file.mimetype}`));
    }
  }
});