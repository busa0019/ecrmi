import mongoose from "mongoose";

const ParticipantSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true },
    name: String,
    nameLocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Participant ||
  mongoose.model("Participant", ParticipantSchema);