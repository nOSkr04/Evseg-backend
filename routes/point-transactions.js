import { Router } from "express";
import { getPointTransactions } from "../controller/point-transactions.js";

const router = Router();

//pointTransactions"

router.route("/").get(getPointTransactions);

export default router;
