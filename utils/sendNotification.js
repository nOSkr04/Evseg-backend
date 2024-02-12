import jwt from "jsonwebtoken";
import asyncHandler from "../middleware/asyncHandle.js";
import MyError from "../utils/myError.js";
import { Expo } from "expo-server-sdk";
export default asyncHandler(async (expoPushToken, title) => {
  let expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });
  if (!Expo.isExpoPushToken(expoPushToken)) {
    throw new MyError(expoPushToken + " Буруу expoPushToken", 404);
  }
  const message = [
    {
      to: expoPushToken,
      sound: "default",
      body: title,
      data: { a: "a" },
    },
  ];
  await expo.sendPushNotificationsAsync(message);
});
