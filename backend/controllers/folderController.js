// controllers/folderController.js
import Folder from '../models/Folder.js';
import Summary from '../models/Summary.js';

export const createFolder = async (req, res) => {
  try {
    const { name } = req.body;
    const folder = new Folder({ name, userId: req.user.id });
    await folder.save();
    res.status(201).json(folder);
  } catch (err) {
    res.status(500).json({ message: 'Error creating folder' });
  }
};

export const getFolders = async (req, res) => {
  try {
    const folders = await Folder.find({ userId: req.user.id });
    
    // Calculate counts dynamically from Summary collection
    const foldersWithCounts = await Promise.all(folders.map(async (folder) => {
      const count = await Summary.countDocuments({ folder: folder._id });
      return { ...folder._doc, summaryCount: count };
    }));
    
    res.json(foldersWithCounts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching folders' });
  }
};

export const getFolderById = async (req, res) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, userId: req.user.id });
    if (!folder) return res.status(404).json({ message: 'Folder not found' });
    res.json(folder);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching folder' });
  }
};

export const deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!folder) return res.status(404).json({ message: 'Folder not found' });
    
    // Optional: Unset folder reference in summaries that were in this folder
    await Summary.updateMany({ folder: req.params.id }, { $set: { folder: null } });
    
    res.json({ message: 'Folder deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting folder' });
  }
};