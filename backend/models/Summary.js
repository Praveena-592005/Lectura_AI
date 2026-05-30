import mongoose from 'mongoose';

const summarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  folder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null,
  },
  title: {
    type: String,
    required: true,
  },
  originalText: {
    type: String,
    required: true,
  },
  summaryText: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const Summary = mongoose.model('Summary', summarySchema);
export default Summary;