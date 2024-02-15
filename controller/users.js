import User from "../models/User.js";
import MyError from "../utils/myError.js";
import asyncHandler from "express-async-handler";
import paginate from "../utils/paginate.js";
import sendNotification from "../utils/sendNotification.js";
import PointTransaction from "../models/point-transaction.js";
// import { FilterQuery } from "mongoose";
export const authMeUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  console.log(user);
  if (!user) {
    throw new MyError(req.params.id, 401);
  }
  res.status(200).json({
    success: true,
    data: user,
  });
});

// register
export const register = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  const token = user.getJsonWebToken();

  res.status(200).json({
    success: true,
    token,
    user: user,
  });
});

// логин хийнэ
export const login = asyncHandler(async (req, res, next) => {
  const { phone, password, expoPushToken } = req.body;
  console.log(req.body, "reqbody");
  // Оролтыгоо шалгана

  if (!phone || !password) {
    throw new MyError("Утас болон нууц үгээ дамжуулна уу", 400);
  }

  // Тухайн хэрэглэгчийн хайна
  const user = await User.findOne({ phone }).select("+password");

  if (!user) {
    throw new MyError("Утас болон нууц үгээ зөв оруулна уу", 401);
  }

  const ok = await user.checkPassword(password);

  if (!ok) {
    throw new MyError("Имэйл болон нууц үгээ зөв оруулна уу", 401);
  }

  user.expoPushToken = expoPushToken;
  user.save();

  const token = user.getJsonWebToken();

  const cookieOption = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000000),
    httpOnly: true,
  };

  res.status(200).cookie("amazon-token", token, cookieOption).json({
    success: true,
    token,
    user: user,
  });
});

export const logout = asyncHandler(async (req, res, next) => {
  const cookieOption = {
    expires: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000000),
    httpOnly: true,
  };

  const user = await User.findById(req.userId);

  user.expoPushToken = undefined;
  user.save();

  res.status(200).cookie("amazon-token", null, cookieOption).json({
    success: true,
    data: "logged out...",
  });
});

export const getUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);
  const pagination = await paginate(page, limit, User);

  const users = await User.find(req.query, select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);
  res.status(200).json({
    success: true,
    data: users,
    pagination,
    total: pagination.total,
    pageCount: pagination.pageCount,
  });
});

export const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүй!", 400);
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

export const createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);
  res.status(200).json({
    success: true,
    data: user,
  });
});

export const updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүйээээ.", 400);
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

export const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүйээээ.", 400);
  }

  user.remove();

  res.status(200).json({
    success: true,
    data: user,
  });
});

export const updatePassword = asyncHandler(async (req, res, next) => {
  const { password, cpassword } = req.body;
  const userId = req.params.id;
  const user = await User.findById(userId);
  if (password !== cpassword) {
    throw new MyError("Нууц үг тохирохгүй байна", 401);
  }
  user.password = password;

  await user.save();

  res.status(200).json({
    success: true,
    data: user,
  });
});

export const givePoint = asyncHandler(async (req, res, next) => {
  const { clientId, point } = req.body;
  const client = await User.findById(clientId);
  if (!client) {
    throw new MyError("Хэрэглэгч олдосонгүй", 402);
  }
  const transformPoint = (point * client.loyaltyPercent) / 100;

  if (client.expoPushToken) {
    await sendNotification(
      client.expoPushToken,
      `Таны бүртгэлд ${transformPoint.toLocaleString()} пойнт орлоо баярлалаа. EVSEG Cashmere`,
      { loyalty: true, minus: false, point: transformPoint }
    );
  }
  const pointTransaction = await PointTransaction.create({
    createUser: req.userId,
    receivedUser: clientId,
    isMinus: false,
    point: transformPoint,
    money: point,
    userFirstPoint: client.point,
    userLastPoint: client.point + transformPoint,
  });
  client.point = client.point + transformPoint;
  client.moneySpent = Number(client.moneySpent) + Number(point);
  if (client.moneySpent < 100000) {
    client.loyaltyPercent = 2;
  } else if (client.moneySpent < 200000) {
    client.loyaltyPercent = 3;
  } else if (client.moneySpent < 300000) {
    client.loyaltyPercent = 4;
  } else if (client.moneySpent < 400000) {
    client.loyaltyPercent = 5;
  }

  client.save();

  res.status(200).json({
    success: true,
    data: client,
    pointTransaction,
  });
});

export const minusPoint = asyncHandler(async (req, res, next) => {
  const { clientId, point, minusMoney } = req.body;
  const client = await User.findById(clientId);

  if (!client) {
    throw new MyError("Хэрэглэгч олдосонгүй", 402);
  }
  if (client.point < point) {
    throw new MyError("Пойнт үлдэгдэл хүрэлцэхгүй байна", 402);
  }
  if (client.expoPushToken) {
    await sendNotification(
      client.expoPushToken,
      `Таны пойнтноос ${point.toLocaleString()} хасагдлаа баярлалаа. EVSEG Cashmere`,
      { loyalty: true, minus: true, point: point }
    );
  }
  const pointTransaction = await PointTransaction.create({
    createUser: req.userId,
    receivedUser: clientId,
    isMinus: true,
    point: point,
    userFirstPoint: client.point,
    userLastPoint: client.point - point,
    minusMoney: minusMoney,
  });
  client.point = client.point - point;
  client.save();

  res.status(200).json({
    success: true,
    data: client,
    pointTransaction,
  });
});

export const findPhone = asyncHandler(async (req, res) => {
  const { phone } = req.params;
  const filters = {};
  if (phone && phone !== "") {
    filters.$or = [{ phone: { $regex: phone, $options: "i" } }];
  }

  const data = await User.find(filters);

  res.status(200).json({
    success: true,
    data,
  });
});
