import mongoose from "mongoose";

const MembershipApplicationSchema = new mongoose.Schema(
  {
    applicationId: String,

    // ================= PERSONAL =================
    fullName: String,
    email: String,
    nationality: String,
    state: String,

    // ================= MEMBERSHIP =================
    requestedMembershipType: String,
    approvedMembershipType: String,

    // ================= EDUCATION =================
    highestQualification: String,
    discipline: String,
    institution: String,

    // ✅ STANDARDIZED FIELD NAME
    certificatesUrl: {
      type: [String],
      default: [],
    },

    // ================= PROFESSIONAL =================
    jobTitle: String,
    organization: String,
    natureOfWork: String,
    yearsOfExperience: Number,
    cvUrl: String,

    // ================= PAYMENT =================
    paymentReceiptUrl: String,
    paymentReference: String,

    // ================= GENERATED OUTPUT =================
    certificateId: String,
    certificateUrl: String,
    letterUrl: String,

    // ================= ADMIN =================
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminNotes: String,
    reviewedAt: Date,

    // ✅ THIS WAS MISSING
    isUpdateRequest: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.MembershipApplication ||
  mongoose.model("MembershipApplication", MembershipApplicationSchema);