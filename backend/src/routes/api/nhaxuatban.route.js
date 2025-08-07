import express from "express";
import NhaXuatBanController from "../../controllers/NhaXuatBanController.js";
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
const nhaXuatBanCreateSchema = {
  MaNhaXuatBan: {
    required: true,
    type: "string",
    pattern: /^NXB\d{3,}$/,
    patternMessage: "Mã nhà xuất bản phải có định dạng NXB001, NXB002, ...",
    label: "Mã nhà xuất bản",
  },
  TenNhaXuatBan: {
    required: true,
    type: "string",
    maxLength: 100,
    label: "Tên nhà xuất bản",
  },
  DiaChi: {
    required: true,
    type: "string",
    maxLength: 200,
    label: "Địa chỉ",
  },
};

const nhaXuatBanUpdateSchema = {
  ...nhaXuatBanCreateSchema,
  MaNhaXuatBan: { ...nhaXuatBanCreateSchema.MaNhaXuatBan, required: false },
  TenNhaXuatBan: { ...nhaXuatBanCreateSchema.TenNhaXuatBan, required: false },
  DiaChi: { ...nhaXuatBanCreateSchema.DiaChi, required: false },
};

// Routes with error handling
router.get("/", catchAsync(NhaXuatBanController.getAll));
router.get("/search/:query", catchAsync(NhaXuatBanController.search));
router.get("/:maNXB", catchAsync(NhaXuatBanController.getById));
router.get("/:maNXB/sach", catchAsync(NhaXuatBanController.getBooks));

router.post(
  "/",
  validate(nhaXuatBanCreateSchema),
  catchAsync(NhaXuatBanController.create)
);
router.put(
  "/:maNXB",
  validate(nhaXuatBanUpdateSchema),
  catchAsync(NhaXuatBanController.update)
);
router.delete("/:maNXB", catchAsync(NhaXuatBanController.remove));

export default router;
