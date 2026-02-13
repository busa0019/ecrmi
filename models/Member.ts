import mongoose from "mongoose";

const MemberSchema = new mongoose.Schema(
  {
    memberId: String, // ECRMI-MEM-XXXX

    fullName: String,
    email: String,
    membershipType: String,

    jobTitle: String,
    organization: String,
    natureOfWork: String,
    yearsOfExperience: Number,

    cvUrl: String,
    certificatesUrl: {
      type: [String],
      default: [],
    },

    membershipStartDate: Date,
    certificateUrl: String,
    letterUrl: String,
  },
  { timestamps: true }
);

export default mongoose.models.Member ||
  mongoose.model("Member", MemberSchema);