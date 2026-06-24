const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      maxlength: [120, "Project name cannot exceed 120 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: "",
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    // The user who created the project. Always has implicit full access,
    // independent of the project membership list below.
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Project-level membership — a SUBSET of org members who can see/work on
    // this specific project. This is what makes access control two-layered:
    // org role decides what you CAN do; project membership decides WHERE.
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: {
        values: ["active", "archived"],
        message: "{VALUE} is not a valid project status",
      },
      default: "active",
    },
  },
  { timestamps: true },
);

// Speed up the most common query: "all active projects for this org"
projectSchema.index({ organization: 1, status: 1 });

module.exports = mongoose.model("Project", projectSchema);
