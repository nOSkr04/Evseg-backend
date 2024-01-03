import { Router } from "express";
import { uploadPhoto, uploadVideo } from "../controller/media.js";

const router = Router();

//"/api/v1/ads"

router.route("/photo").post(uploadPhoto);
router.route("/video").post(uploadVideo);

export default router;
