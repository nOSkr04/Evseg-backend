import mongoose from "mongoose";

const PointTransactionSchema = new mongoose.Schema(
  {
    createUser: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    receivedUser: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    minusMoney: Number,
    isMinus: {
      type: Boolean,
    },
    point: {
      type: Number,
    },
    money: {
      type: Number,
    },
    userFirstPoint: {
      type: Number,
    },
    userLastPoint: {
      type: Number,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export default mongoose.model("PointTransaction", PointTransactionSchema);
