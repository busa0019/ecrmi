import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    facilitator: String,
    durationMinutes: Number,
    passMark: Number,
    pdfUrl: String,
    active: Boolean,
  },
  { timestamps: true }
);

export default mongoose.models.Course ||
  mongoose.model("Course", CourseSchema);