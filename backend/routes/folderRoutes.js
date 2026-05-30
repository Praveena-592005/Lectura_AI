import express from 'express';
const router = express.Router();
import { 
  createFolder, 
  getFolders, 
  deleteFolder, 
  getFolderById 
} from '../controllers/folderController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/', protect, createFolder);
router.get('/', protect, getFolders);
router.get('/:id', protect, getFolderById);
router.delete('/:id', protect, deleteFolder);

export default router;