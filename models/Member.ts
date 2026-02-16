import mongoose from "mongoose";

const MemberSchema = new mongoose.Schema(
  {
    // IDs
    memberId: { type: String, default: "" }, // optional legacy ID (can match certificateId)
    applicationId: { type: String, default: "" }, // ECRMI-MEM-2026-XXXXXX (from application)
    sourceApplicationObjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MembershipApplication",
    },

    // Core identity
    fullName: { type: String, required: true },
    email: { type: String, required: true },

    // Membership
    membershipType: { type: String, required: true },

    // Professional (optional)
    jobTitle: { type: String, default: "" },
    organization: { type: String, default: "" },
    natureOfWork: { type: String, default: "" },
    yearsOfExperience: { type: Number, default: 0 },

    // Documents
    cvUrl: { type: String, default: "" },
    certificatesUrl: { type: [String], default: [] },
    paymentReceiptUrl: { type: String, default: "" },

    // Generated outputs / verification
    certificateId: { type: String, unique: true, sparse: true }, // ✅ needed for verify
    certificateUrl: { type: String, default: "" },
    letterUrl: { type: String, default: "" },
    certificateHistory: {
  type: [
    {
      certificateId: { type: String, required: true },
      membershipType: { type: String, required: true },
      issuedAt: { type: Date, required: true },
      certificateUrl: { type: String, default: "" },
      letterUrl: { type: String, default: "" },
    },
  ],
  default: [],
},

    membershipStartDate: { type: Date }, // use reviewedAt/issuedAt

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Member || mongoose.model("Member", MemberSchema);