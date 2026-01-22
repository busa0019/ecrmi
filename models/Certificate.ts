import mongoose from "mongoose";

const CertificateSchema = new mongoose.Schema(
  {
    certificateId: { type: String, unique: true, required: true },

    participantName: { type: String, required: true },
    participantEmail: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    attemptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attempt",
      required: true,
    },

    courseTitle: { type: String, required: true },
    score: { type: Number, required: true },

    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Certificate ||
  mongoose.model("Certificate", CertificateSchema);