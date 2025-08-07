import express from 'express';
import TheoDoiMuonSachController from '../../controllers/TheoDoiMuonSachController.js';
import { authenticateToken, requirePermission } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validation.js';
import { catchAsync } from '../../middlewares/errorHandler.js';

const router = express.Router();

// Apply authentication to all routes
// TODO: Uncomment when authentication is working
// router.use(authenticateToken);

// Validation schemas
const muonSachSchema = {
  MaDocGia: {
    required: true,
    type: 'string',
    label: 'Mã độc giả'
  },
  MaSach: {
    required: true,
    type: 'string',
    label: 'Mã sách'
  },
  NgayHenTra: {
    required: true,
    type: 'string',
    custom: (value) => {
      if (!value) return 'Ngày hẹn trả là bắt buộc';
      
      const date = new Date(value);
      if (isNaN(date.getTime())) return 'Ngày hẹn trả không hợp lệ';
      
      const today = new Date();
      if (date <= today) return 'Ngày hẹn trả phải sau ngày hôm nay';
      
      return null;
    },
    label: 'Ngày hẹn trả'
  },
  NhanVienMuon: {
    required: true,
    type: 'string',
    label: 'Nhân viên xử lý'
  },
  GhiChu: {
    required: false,
    type: 'string',
    maxLength: 500,
    label: 'Ghi chú'
  }
};

const traSachSchema = {
  NhanVienTra: {
    required: true,
    type: 'string',
    label: 'Nhân viên xử lý trả'
  },
  GhiChu: {
    required: false,
    type: 'string',
    maxLength: 500,
    label: 'Ghi chú'
  }
};

const giaHanSchema = {
  NgayHenTra: {
    required: true,
    type: 'string',
    custom: (value) => {
      if (!value) return 'Ngày hẹn trả mới là bắt buộc';
      
      const date = new Date(value);
      if (isNaN(date.getTime())) return 'Ngày hẹn trả không hợp lệ';
      
      const today = new Date();
      if (date <= today) return 'Ngày hẹn trả phải sau ngày hôm nay';
      
      return null;
    },
    label: 'Ngày hẹn trả mới'
  },
  GhiChu: {
    required: false,
    type: 'string',
    maxLength: 500,
    label: 'Ghi chú'
  }
};

// Routes with error handling
router.get('/', catchAsync(TheoDoiMuonSachController.getAll));
router.get('/overdue', catchAsync(TheoDoiMuonSachController.getOverdue));
router.get('/docgia/:maDocGia', catchAsync(TheoDoiMuonSachController.getByReader));
router.get('/sach/:maSach', catchAsync(TheoDoiMuonSachController.getByBook));
router.get('/:id', catchAsync(TheoDoiMuonSachController.getById));

router.post('/muon', validate(muonSachSchema), catchAsync(TheoDoiMuonSachController.borrowBook));
router.put('/:id/tra', validate(traSachSchema), catchAsync(TheoDoiMuonSachController.returnBook));
router.put('/:id/giahan', validate(giaHanSchema), catchAsync(TheoDoiMuonSachController.extendDueDate));

// Manual update overdue books
router.post('/update-overdue', catchAsync(TheoDoiMuonSachController.updateOverdue));

// Test overdue system
router.get('/test-overdue', catchAsync(TheoDoiMuonSachController.testOverdue));

// Reader borrow registration
router.post('/register', catchAsync(TheoDoiMuonSachController.registerBorrow));

// Admin approve/reject requests
router.post('/:id/approve', catchAsync(TheoDoiMuonSachController.approveRequest));
router.delete('/:id/reject', catchAsync(TheoDoiMuonSachController.rejectRequest));

export default router;
