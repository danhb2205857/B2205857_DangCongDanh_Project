import express from "express";
import DocGiaController from "../../controllers/DocGiaController.js";
import { authenticateReader } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validation.js";
import { catchAsync } from "../../middlewares/errorHandler.js";

const router = express.Router();

// Apply authentication to all routes
// TODO: Uncomment when authentication is working
// router.use(authenticateToken);

// Validation schemas
const docGiaCreateSchema = {
  MaDocGia: {
    required: true,
    type: "string",
    pattern: /^DG\d{3,}$/,
    patternMessage: "Mã độc giả phải có định dạng DG001, DG002, ...",
    label: "Mã độc giả",
  },
  HoLot: {
    required: true,
    type: "string",
    maxLength: 50,
    label: "Họ lót",
  },
  Ten: {
    required: true,
    type: "string",
    maxLength: 20,
    label: "Tên",
  },
  NgaySinh: {
    required: true,
    type: "string",
    custom: (value) => {
      if (!value) return null;

      const date = new Date(value);
      if (isNaN(date.getTime())) return "Ngày sinh không hợp lệ";

      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      if (age < 5 || age > 100) return "Tuổi phải từ 5 đến 100";

      return null;
    },
    label: "Ngày sinh",
  },
  Phai: {
    required: true,
    type: "string",
    enum: ["Nam", "Nữ"],
    label: "Phái",
  },
  DiaChi: {
    required: true,
    type: "string",
    maxLength: 200,
    label: "Địa chỉ",
  },
  DienThoai: {
    required: true,
    type: "string",
    pattern: /^(0|\+84)[0-9]{9,10}$/,
    patternMessage: "Số điện thoại không hợp lệ",
    label: "Số điện thoại",
  },
  email: {
    required: false,
    type: "string",
    pattern: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
    patternMessage: "Email không hợp lệ",
    label: "Email",
  },
  password: {
    required: false,
    type: "string",
    minLength: 6,
    label: "Mật khẩu",
  },
  avatar: {
    required: false,
    type: "string",
    label: "Avatar",
  },
};

const docGiaUpdateSchema = {
  ...docGiaCreateSchema,
  MaDocGia: { ...docGiaCreateSchema.MaDocGia, required: false },
  HoLot: { ...docGiaCreateSchema.HoLot, required: false },
  Ten: { ...docGiaCreateSchema.Ten, required: false },
  NgaySinh: { ...docGiaCreateSchema.NgaySinh, required: false },
  Phai: { ...docGiaCreateSchema.Phai, required: false },
  DiaChi: { ...docGiaCreateSchema.DiaChi, required: false },
  DienThoai: { ...docGiaCreateSchema.DienThoai, required: false },
};

// Registration schema
const docGiaRegisterSchema = {
  ...docGiaCreateSchema,
  MaDocGia: { ...docGiaCreateSchema.MaDocGia, required: false }, // Không yêu cầu MaDocGia khi đăng ký
  email: {
    required: true,
    type: "string",
    pattern: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
    patternMessage: "Email không hợp lệ",
    label: "Email",
  },
  password: {
    required: true,
    type: "string",
    minLength: 6,
    label: "Mật khẩu",
  },
};

// Login schema
const docGiaLoginSchema = {
  email: {
    required: true,
    type: "string",
    pattern: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
    patternMessage: "Email không hợp lệ",
    label: "Email",
  },
  password: {
    required: true,
    type: "string",
    minLength: 1,
    label: "Mật khẩu",
  },
};

// Profile update schema
const profileUpdateSchema = {
  HoLot: { ...docGiaCreateSchema.HoLot, required: false },
  Ten: { ...docGiaCreateSchema.Ten, required: false },
  NgaySinh: { ...docGiaCreateSchema.NgaySinh, required: false },
  Phai: { ...docGiaCreateSchema.Phai, required: false },
  DiaChi: { ...docGiaCreateSchema.DiaChi, required: false },
  DienThoai: { ...docGiaCreateSchema.DienThoai, required: false },
  avatar: { ...docGiaCreateSchema.avatar, required: false },
};

// Change password schema
const changePasswordSchema = {
  currentPassword: {
    required: true,
    type: "string",
    minLength: 1,
    label: "Mật khẩu hiện tại",
  },
  newPassword: {
    required: true,
    type: "string",
    minLength: 6,
    label: "Mật khẩu mới",
  },
};

// Public routes (no authentication required)
router.post(
  "/register",
  validate(docGiaRegisterSchema),
  catchAsync(DocGiaController.register)
);
router.post(
  "/login",
  validate(docGiaLoginSchema),
  catchAsync(DocGiaController.login)
);

// Protected routes for readers
router.get(
  "/profile",
  authenticateReader,
  catchAsync(DocGiaController.getProfile)
);
router.put(
  "/profile",
  authenticateReader,
  validate(profileUpdateSchema),
  catchAsync(DocGiaController.updateProfile)
);
router.put(
  "/change-password",
  authenticateReader,
  validate(changePasswordSchema),
  catchAsync(DocGiaController.changePassword)
);
router.get(
  "/my-borrows",
  authenticateReader,
  catchAsync(DocGiaController.getMyBorrows)
);
router.get(
  "/borrow-history",
  authenticateReader,
  catchAsync(DocGiaController.getBorrowHistory)
);

// Admin routes (require staff authentication)
router.get("/", catchAsync(DocGiaController.getAll));
router.get("/search/:query", catchAsync(DocGiaController.search));
router.get("/:maDocGia", catchAsync(DocGiaController.getById));

router.post(
  "/",
  validate(docGiaCreateSchema),
  catchAsync(DocGiaController.create)
);
router.put(
  "/:id",
  validate(docGiaUpdateSchema),
  catchAsync(DocGiaController.update)
);
router.delete("/:id", catchAsync(DocGiaController.remove));

export default router;
