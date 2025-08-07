import express from "express";
import NhanVienController from "../../controllers/NhanVienController.js";
import {
  authenticateToken,
  requirePermission,
  requireRole,
} from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validation.js";
import { catchAsync } from "../../middlewares/errorHandler.js";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation schemas
const nhanVienCreateSchema = {
  MSNV: {
    required: true,
    type: "string",
    pattern: /^NV\d{3,}$/,
    patternMessage: "Mã nhân viên phải có định dạng NV001, NV002, ...",
    label: "Mã số nhân viên",
  },
  HoTenNV: {
    required: true,
    type: "string",
    maxLength: 100,
    label: "Họ tên nhân viên",
  },
  Password: {
    required: true,
    type: "string",
    minLength: 6,
    custom: (value) => {
      if (!/[a-zA-Z]/.test(value))
        return "Mật khẩu phải chứa ít nhất một chữ cái";
      if (!/\d/.test(value)) return "Mật khẩu phải chứa ít nhất một số";
      return null;
    },
    label: "Mật khẩu",
  },
  ChucVu: {
    required: true,
    type: "string",
    enum: ["Quản lý thư viện", "Thủ thư", "Nhân viên", "Thực tập sinh"],
    label: "Chức vụ",
  },
  DiaChi: {
    required: true,
    type: "string",
    maxLength: 200,
    label: "Địa chỉ",
  },
  SoDienThoai: {
    required: true,
    type: "string",
    pattern: /^(0|\+84)[0-9]{9,10}$/,
    patternMessage: "Số điện thoại không hợp lệ",
    label: "Số điện thoại",
  },
  Email: {
    required: false,
    type: "string",
    pattern: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
    patternMessage: "Email không hợp lệ",
    label: "Email",
  },
  NgaySinh: {
    required: false,
    type: "string",
    custom: (value) => {
      if (!value) return null;

      const date = new Date(value);
      if (isNaN(date.getTime())) return "Ngày sinh không hợp lệ";

      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      if (age < 18 || age > 65) return "Tuổi nhân viên phải từ 18 đến 65";

      return null;
    },
    label: "Ngày sinh",
  },
  NgayVaoLam: {
    required: false,
    type: "string",
    custom: (value) => {
      if (!value) return null;

      const date = new Date(value);
      if (isNaN(date.getTime())) return "Ngày vào làm không hợp lệ";
      if (date > new Date()) return "Ngày vào làm không được là ngày tương lai";

      return null;
    },
    label: "Ngày vào làm",
  },
  TrangThai: {
    required: false,
    type: "string",
    enum: ["Đang làm việc", "Nghỉ phép", "Đã nghỉ việc"],
    label: "Trạng thái",
  },
  Quyen: {
    required: false,
    type: "object",
    custom: (value) => {
      if (!value) return null;
      if (!Array.isArray(value)) return "Quyền phải là một mảng";

      const validPermissions = [
        "doc_gia",
        "sach",
        "nha_xuat_ban",
        "muon_tra",
        "thong_ke",
        "quan_ly",
      ];
      const invalidPermissions = value.filter(
        (p) => !validPermissions.includes(p)
      );

      if (invalidPermissions.length > 0) {
        return `Quyền không hợp lệ: ${invalidPermissions.join(", ")}`;
      }

      return null;
    },
    label: "Quyền",
  },
};

const nhanVienUpdateSchema = {
  ...nhanVienCreateSchema,
  MSNV: { ...nhanVienCreateSchema.MSNV, required: false },
  HoTenNV: { ...nhanVienCreateSchema.HoTenNV, required: false },
  Password: { ...nhanVienCreateSchema.Password, required: false },
  ChucVu: { ...nhanVienCreateSchema.ChucVu, required: false },
  DiaChi: { ...nhanVienCreateSchema.DiaChi, required: false },
  SoDienThoai: { ...nhanVienCreateSchema.SoDienThoai, required: false },
};

// Routes with error handling - Allow all staff to view, only managers to modify
router.get("/", catchAsync(NhanVienController.getAll));
router.get(
  "/active",
  requirePermission("quan_ly"),
  catchAsync(NhanVienController.getActive)
);
router.get(
  "/:id",
  catchAsync(NhanVienController.getById)
);

router.post(
  "/",
  requireRole(["Quản lý thư viện"]),
  validate(nhanVienCreateSchema),
  catchAsync(NhanVienController.create)
);
router.put(
  "/:id",
  requireRole(["Quản lý thư viện"]),
  validate(nhanVienUpdateSchema),
  catchAsync(NhanVienController.update)
);
router.delete(
  "/:id",
  requireRole(["Quản lý thư viện"]),
  catchAsync(NhanVienController.remove)
);

// Route để kích hoạt/vô hiệu hóa nhân viên
router.patch(
  "/:id/activate",
  requireRole(["Quản lý thư viện"]),
  catchAsync(NhanVienController.toggleActivate)
);

export default router;
