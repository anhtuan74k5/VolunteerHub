import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String,
    default: null,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
  }],
  commentCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// ✅ Check nếu model đã tồn tại thì dùng lại, không compile lại
export default mongoose.models.Post || mongoose.model("Post", postSchema);