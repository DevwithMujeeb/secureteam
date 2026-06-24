const mongoose = require("mongoose");

const membershipSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    role: {
      type: String,
      enum: {
        values: ["owner", "admin", "member"],
        message: "{VALUE} is not a valid role",
      },
      required: [true, "Role is required"],
      default: "member",
    },
  },
  { timestamps: true },
);

// A user can only have ONE membership per organization — this is enforced
// at the database level, not just in application logic, so it can't be
// bypassed by a race condition or a bug elsewhere in the codebase.
membershipSchema.index({ user: 1, organization: 1 }, { unique: true });

module.exports = mongoose.model("Membership", membershipSchema);
