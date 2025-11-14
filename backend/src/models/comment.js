import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    event: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    likes: [ 
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;