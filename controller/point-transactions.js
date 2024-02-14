import PointTransaction from "../models/point-transaction.js";
import asyncHandler from "express-async-handler";
import paginate from "../utils/paginate.js";

export const getPointTransactions = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);
  const pagination = await paginate(page, limit, PointTransaction);

  const users = await PointTransaction.find(req.query, select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit)
    .populate(["createUser", "receivedUser"]);
  res.status(200).json({
    success: true,
    data: users,
    pagination,
    total: pagination.total,
    pageCount: pagination.pageCount,
  });
});
