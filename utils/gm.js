import { encode } from "blurhash";
import sharp from "sharp";

export const setBlurHash = async (file) => {
  if (!file) {
    return null;
  }

  const { data, info } = await sharp(file.buffer).ensureAlpha().raw().toBuffer({
    resolveWithObject: true,
  });

  const blurHash = encode(data, info.width, info.height, 4, 3);
  return blurHash;
};
