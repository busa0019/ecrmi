import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    facilitator: String,
    durationMinutes: Number,
    passMark: Number,

    // existing (keep)
    pdfUrl: { type: String, default: "" },

    // NEW: multiple materials (links + uploads)
    materialUrls: { type: [String], default: [] },

    active: Boolean,
  },
  { timestamps: true }
);

export default mongoose.models.Course || mongoose.model("Course", CourseSchema);