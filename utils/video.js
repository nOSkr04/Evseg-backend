import os from "os";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import ffmpeg from "fluent-ffmpeg";
import videoFfmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffprobe from "@ffprobe-installer/ffprobe";
videoFfmpeg.setFfprobePath(ffprobe.path);
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export const takeScreenshots = (filepath) => {
  const filename = `${uuidv4()}.jpg`;
  const outputPath = os.tmpdir();
  const size = "460x460";

  return new Promise((resolve, reject) => {
    ffmpeg(filepath)
      .on("error", (err) => reject(err))
      .on("end", () => {
        resolve(path.join(outputPath, filename));
      })
      .takeScreenshots(
        {
          count: 1,
          filename: filename,
          timemarks: ["0"],
          size: size,
        },
        outputPath
      );
  });
};

export const getVideoDuration = (filepath) => {
  return new Promise((resolve, reject) => {
    videoFfmpeg(filepath).ffprobe((err, metadata) => {
      if (err) return reject(err);
      resolve(metadata?.format?.duration);
    });
  });
};
