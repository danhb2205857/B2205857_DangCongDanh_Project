import { NhanVien } from '../models/index.js';
import { generateToken } from '../utils/jwt.js';
import { AppError } from '../middlewares/errorHandler.js';

export default {
  /**
   * POST /api/auth/register - Đăng ký tài khoản nhân viên mới
   */
  async register(req, res) {
    const { username, fullName, password, email, phone, address, birthDate } = req.body;

    // Check if username already exists
    const existingUser = await NhanVien.findOne({ MSNV: username.toUpperCase() });
    if (existingUser) {
      throw new AppError('Mã nhân viên đã tồn tại', 400, 'DUPLICATE_USERNAME');
    }

    // Check if email already exists
    if (email) {
      const existingEmail = await NhanVien.findOne({ Email: email.toLowerCase() });
      if (existingEmail) {
        throw new AppError('Email đã được sử dụng', 400, 'DUPLICATE_EMAIL');
      }
    }

    // Create new employee
    const nhanVien = new NhanVien({
      MSNV: username.toUpperCase(),
      HoTenNV: fullName,
      Password: password,
      ChucVu: 'Nhân viên', // Default role
      DiaChi: address,
      SoDienThoai: phone,
      Email: email?.toLowerCase(),
      NgaySinh: birthDate ? new Date(birthDate) : undefined,
      TrangThai: 'Đang làm việc',
      Quyen: ['doc_gia', 'sach', 'muon_tra'] // Default permissions
    });

    await nhanVien.save();

    // Generate JWT token
    const token = generateToken(nhanVien._id);

    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công',
      data: {
        token,
        user: {
          id: nhanVien._id,
          msnv: nhanVien.MSNV,
          hoTenNV: nhanVien.HoTenNV,
          chucVu: nhanVien.ChucVu,
          email: nhanVien.Email,
          quyen: nhanVien.Quyen
        }
      }
    });
  },

  /**
   * POST /api/auth/login - Đăng nhập
   */
  async login(req, res) {
    const { msnv, password } = req.body;

    // Find user and check password
    const nhanVien = await NhanVien.authenticate(msnv, password);
    
    if (!nhanVien) {
      throw new AppError('Mã nhân viên hoặc mật khẩu không đúng', 401, 'INVALID_CREDENTIALS');
    }

    // Generate JWT token
    const token = generateToken(nhanVien._id);

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token,
        user: {
          id: nhanVien._id,
          msnv: nhanVien.MSNV,
          hoTenNV: nhanVien.HoTenNV,
          chucVu: nhanVien.ChucVu,
          email: nhanVien.Email,
          quyen: nhanVien.Quyen
        }
      }
    });
  },

  /**
   * POST /api/auth/logout - Đăng xuất
   */
  async logout(req, res) {
    // In a stateless JWT system, logout is handled client-side
    // But we can add token blacklisting here if needed in the future
    
    res.json({
      success: true,
      message: 'Đăng xuất thành công'
    });
  },

  /**
   * GET /api/auth/profile - Lấy thông tin profile
   */
  async getProfile(req, res) {
    // User info is already attached by auth middleware
    const nhanVien = req.user;

    res.json({
      success: true,
      message: 'Lấy thông tin profile thành công',
      data: {
        id: nhanVien._id,
        msnv: nhanVien.MSNV,
        hoTenNV: nhanVien.HoTenNV,
        chucVu: nhanVien.ChucVu,
        diaChi: nhanVien.DiaChi,
        soDienThoai: nhanVien.SoDienThoai,
        email: nhanVien.Email,
        ngaySinh: nhanVien.NgaySinh,
        ngayVaoLam: nhanVien.NgayVaoLam,
        trangThai: nhanVien.TrangThai,
        quyen: nhanVien.Quyen,
        lanDangNhapCuoi: nhanVien.LanDangNhapCuoi
      }
    });
  },

  /**
   * PUT /api/auth/change-password - Đổi mật khẩu
   */
  async changePassword(req, res) {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const nhanVien = req.user;

    // Verify current password
    const isCurrentPasswordValid = await nhanVien.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new AppError('Mật khẩu hiện tại không đúng', 400, 'INVALID_CURRENT_PASSWORD');
    }

    // Check if new password matches confirmation
    if (newPassword !== confirmPassword) {
      throw new AppError('Mật khẩu mới và xác nhận mật khẩu không khớp', 400, 'PASSWORD_MISMATCH');
    }

    // Update password
    nhanVien.Password = newPassword;
    await nhanVien.save();

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });
  },

  /**
   * POST /api/auth/refresh - Làm mới token
   */
  async refreshToken(req, res) {
    const nhanVien = req.user;

    // Generate new token
    const token = generateToken(nhanVien._id);

    res.json({
      success: true,
      message: 'Làm mới token thành công',
      data: {
        token,
        user: {
          id: nhanVien._id,
          msnv: nhanVien.MSNV,
          hoTenNV: nhanVien.HoTenNV,
          chucVu: nhanVien.ChucVu,
          email: nhanVien.Email,
          quyen: nhanVien.Quyen
        }
      }
    });
  }
};