import mongoose from "mongoose";

const VideoSchema = new mongoose.Schema(
  {
    url: {
      type: String,
    },
    image: {
      type: String,
    },
    blurhash: String,
    height: Number,
    width: Number,
    duration: Number,
    thumbnail: String,
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export default mongoose.model("Video", VideoSchema);
