import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true },
    passwordHash: String,
  },
  { timestamps: true }
);

export default mongoose.models.Admin ||
  mongoose.model("Admin", AdminSchema);