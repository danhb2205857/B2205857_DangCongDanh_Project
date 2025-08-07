import express from "express";
import SachController from "../../controllers/SachController.js";
import {
  authenticateToken,
  requirePermission,
} from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validation.js";
import { catchAsync } from "../../middlewares/errorHandler.js";

const router = express.Router();

// Apply authentication to all routes
// TODO: Uncomment when authentication is working
// router.use(authenticateToken);

// Validation schemas
const sachCreateSchema = {
  MaSach: {
    required: true,
    type: "string",
    pattern: /^S\d{3,}$/,
    patternMessage: "Mã sách phải có định dạng S001, S002, ...",
    label: "Mã sách",
  },
  TenSach: {
    required: true,
    type: "string",
    maxLength: 200,
    label: "Tên sách",
  },
  DonGia: {
    required: true,
    type: "number",
    min: 0,
    max: 10000000,
    label: "Đơn giá",
  },
  SoQuyen: {
    required: true,
    type: "number",
    min: 0,
    max: 1000,
    label: "Số quyển",
  },
  SoQuyenConLai: {
    required: false,
    type: "number",
    min: 0,
    max: 1000,
    label: "Số quyển còn lại",
  },
  NamXuatBan: {
    required: true,
    type: "number",
    min: 1900,
    max: new Date().getFullYear(),
    label: "Năm xuất bản",
  },
  MaNhaXuatBan: {
    required: true,
    type: "string",
    label: "Mã nhà xuất bản",
  },
  NhaXuatBan: {
    required: true,
    type: "string",
    label: "Tên nhà xuất bản",
  },
  NguonGoc: {
    required: true,
    type: "string",
    maxLength: 100,
    label: "Tác giả",
  },
};

const sachUpdateSchema = {
  ...sachCreateSchema,
  MaSach: { ...sachCreateSchema.MaSach, required: false },
  TenSach: { ...sachCreateSchema.TenSach, required: false },
  DonGia: { ...sachCreateSchema.DonGia, required: false },
  SoQuyen: { ...sachCreateSchema.SoQuyen, required: false },
  SoQuyenConLai: { ...sachCreateSchema.SoQuyenConLai, required: false },
  NamXuatBan: { ...sachCreateSchema.NamXuatBan, required: false },
  MaNhaXuatBan: { ...sachCreateSchema.MaNhaXuatBan, required: false },
  NhaXuatBan: { ...sachCreateSchema.NhaXuatBan, required: false },
  NguonGoc: { ...sachCreateSchema.NguonGoc, required: false },
};

// Routes with error handling
router.get("/", catchAsync(SachController.getAll));
router.get("/available", catchAsync(SachController.getAvailable));
router.get("/search/:query", catchAsync(SachController.search));
router.get("/:maSach", catchAsync(SachController.getById));

router.post("/", validate(sachCreateSchema), catchAsync(SachController.create));
router.put(
  "/:maSach",
  validate(sachUpdateSchema),
  catchAsync(SachController.update)
);
router.delete("/:maSach", catchAsync(SachController.remove));

export default router;
