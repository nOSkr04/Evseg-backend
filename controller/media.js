import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import os from "os";
import asyncHandler from "../middleware/asyncHandle.js";
import Image from "../models/Image.js";
import { getVideoDuration } from "../utils/video.js";
import { setBlurHash } from "../utils/gm.js";
import Video from "../models/Video.js";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";

export const uploadPhoto = asyncHandler(async (req, res, next) => {
  const file = req.files.file;

  const blurHash = await setBlurHash(file.data);

  const config = {
    region: "ap-southeast-1",
    accessKeyId: "AKIAQE7LVSVREC5V55IO",
    secretAccessKey: "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",
    bucket: "sedu-ba",
  };
  AWS.config.update(config);
  const s3 = new AWS.S3({
    apiVersion: "2006-03-01",
  });
  const params = {
    Bucket: config.bucket,
    Key: `${uuidv4()}.jpg`,
    Body: file.data,
  };
  const results = s3.upload(params, {}).promise();
  const image = await new Image({
    url: (await results).Location,
    blurHash: blurHash,
  }).save();
  res.status(200).json({
    success: true,
    data: image,
  });
});

export const uploadVideo = asyncHandler(async (req, res) => {
  const file = req.files.file;

  const config = {
    region: "ap-southeast-1",
    accessKeyId: "AKIAQE7LVSVREC5V55IO",
    secretAccessKey: "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",
    bucket: "sedu-ba",
  };
  AWS.config.update(config);
  const s3 = new AWS.S3({
    apiVersion: "2006-03-01",
  });

  const imageId = uuidv4();

  const filetype = path.extname(file.name).replace(".", "") || "mp4";

  const filename = `${imageId}.${filetype}`;

  const outputPath = os.tmpdir();

  const filepath = path.join(outputPath, filename);

  await file.mv(filepath);

  const screenshotFilename = `${imageId}.jpg`;
  const screenshotPath = path.join(outputPath, screenshotFilename);
  ffmpeg(filepath)
    .screenshots({
      count: 1,
      folder: outputPath,
      filename: screenshotFilename,
    })
    .on("end", async () => {
      const duration = await getVideoDuration(filepath);
      const videoUploadParams = {
        Bucket: config.bucket,
        Key: filename,
        Body: fs.createReadStream(filepath),
      };
      const screenshotUploadParams = {
        Bucket: config.bucket,
        Key: screenshotFilename,
        Body: fs.createReadStream(screenshotPath),
      };

      const [videoUploadResult, screenshotUploadResult] = await Promise.all([
        s3.upload(videoUploadParams, {}).promise(),
        s3.upload(screenshotUploadParams, {}).promise(),
      ]);

      const video = await new Video({
        url: videoUploadResult.Location,
        image: screenshotUploadResult.Location,
        duration: duration,
      }).save();

      res.status(200).json(video);
    });
});
