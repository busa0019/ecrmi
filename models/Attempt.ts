import mongoose from "mongoose";

const AttemptSchema = new mongoose.Schema(
  {
    participantName: {
      type: String,
      required: true,
    },
    participantEmail: {
      type: String,
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    score: {
      type: Number,
      required: true,
    },
    passed: {
      type: Boolean,
      required: true,
    },

    // ✅ SIMPLE ANSWERS (numbers only)
    answers: {
      type: [Number],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Attempt ||
  mongoose.model("Attempt", AttemptSchema);