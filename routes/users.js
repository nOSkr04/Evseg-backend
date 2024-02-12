import { Router } from "express";
import { protect, authorize } from "../middleware/protect.js";

import {
  register,
  login,
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  logout,
  authMeUser,
  updatePassword,
  givePoint,
} from "../controller/users.js";

const router = Router();

//"/api/v1/users"
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(protect, logout);
router.route("/update-password/:id").post(updatePassword);
router.route("/givePoint").post(givePoint);
router.use(protect);

//"/api/v1/users"
router
  .route("/")
  .get(authorize("admin"), getUsers)
  .post(authorize("admin"), createUser);
router.route("/me").get(protect, authMeUser);
router.route("/:id").get(getUser).put(updateUser).delete(protect, deleteUser);

export default router;
