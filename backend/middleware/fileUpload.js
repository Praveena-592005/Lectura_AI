import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

export const uploadMedia = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.pdf', '.docx', '.txt', '.mp3', '.mp4', '.mpeg', '.m4a', '.wav'];
    
    const allowedMimeTypes = [
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'audio/mp3',
      'audio/mpeg',
      'audio/x-mpeg',
      'audio/mp4',
      'audio/x-m4a',
      'audio/wav',
      'audio/x-wav',
      'video/mp4',
      'video/mpeg'
    ];

    const fileExt = path.extname(file.originalname).toLowerCase();
    const fileMime = file.mimetype.toLowerCase();
    
    console.log(`[Multer Filter Execution] File Extension: ${fileExt} | Detected MIME: ${fileMime}`);

    if (allowedMimeTypes.includes(fileMime) || allowedExtensions.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported format profile (${fileExt} / ${fileMime}) passed to workspace processing pipeline`));
    }
  }
});