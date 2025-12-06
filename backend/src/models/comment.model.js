import mongoose from 'mongoose';

// ✅ Force delete cached model
if (mongoose.models.Comment) {
  delete mongoose.models.Comment;
  delete mongoose.connection.models.Comment;
}

const commentSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Comment', commentSchema);
