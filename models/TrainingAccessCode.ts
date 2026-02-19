import mongoose from "mongoose";

const TrainingAccessCodeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },

    // ✅ NEW: this code unlocks ONE course
    courseId: { type: String, required: true, index: true },

    status: {
      type: String,
      enum: ["unused", "used"],
      default: "unused",
      index: true,
    },

    usedByEmail: { type: String, default: "", index: true },
    usedAt: { type: Date },

    createdBy: { type: String, default: "" }, // optional
  },
  { timestamps: true }
);

export default mongoose.models.TrainingAccessCode ||
  mongoose.model("TrainingAccessCode", TrainingAccessCodeSchema);