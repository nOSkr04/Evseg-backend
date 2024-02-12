import jwt from "jsonwebtoken";
import asyncHandler from "../middleware/asyncHandle.js";
import MyError from "../utils/myError.js";
import { Expo } from "expo-server-sdk";
export default asyncHandler(async (expoPushToken, data, title, body) => {
  // if (cv.expoPushToken != undefined && cv.expoPushToken != "") {
  let expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });
  if (!Expo.isExpoPushToken(expoPushToken)) {
    throw new MyError(expoPushToken + " Буруу expoPushToken", 404);
  }
  const message = [
    {
      to: expoPushToken,
      sound: "default",
      title,
      body,
      data,
    },
  ];
  await expo.sendPushNotificationsAsync(message);
});
