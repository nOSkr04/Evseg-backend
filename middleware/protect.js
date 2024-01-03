import { verify } from "jsonwebtoken";
import asyncHandler from "./asyncHandle.js";
import MyError from "../utils/myError.js";

export const protect = asyncHandler(async (req, res, next) => {
  // console.log(req.headers);
  let token = null;

  if (req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies) {
    token = req.cookies["amazon-token"];
  }

  if (!token) {
    throw new MyError(
      "Энэ үйлдлийг хийхэд таны эрх хүрэхгүй байна. Та эхлээд логин хийнэ үү. Authorization header-ээр эсвэ Cookie ашиглан токеноо дамжуулна уу.",
      401
    );
  }

  const tokenObj = verify(token, process.env.JWT_SECRET);

  req.userId = tokenObj.id;
  req.userRole = tokenObj.role;

  next();
});

export function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      throw new MyError(
        "Таны эрх [" + req.userRole + "] энэ үйлдлийг гүйцэтгэхэд хүрэлцэхгүй!",
        403
      );
    }

    next();
  };
}
