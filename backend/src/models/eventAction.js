import mongoose from "mongoose";

const eventActionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    type: {
      type: String,
      enum: ["LIKE", "SHARE", "VIEW"],
      required: true,
    },
  },
  { timestamps: true }
);

eventActionSchema.index({ user: 1, event: 1, type: 1 }, { unique: true });
const EventAction = mongoose.model("EventAction", eventActionSchema);
export default EventAction;
