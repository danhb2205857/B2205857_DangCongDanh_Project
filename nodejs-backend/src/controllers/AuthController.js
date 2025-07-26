import jwt from 'jsonwebtoken';
import config from '../config.js';
import { NhanVien } from '../models/index.js';

export default {
  /**
   * Đăng nhập nhân viên
   * POST /api/auth/login
   */
  async login(req, res) {
    try {
      const { msnv, password } = req.body;

      // Validate input
      if (!msnv || !password) {
        return res.status(400).json({
          success: false,
          message: 'Mã số nhân viên và mật khẩu là bắt buộc',
          error: 'MISSING_CREDENTIALS'
        });
      }

      // Authenticate user
      const nhanVien = await NhanVien.authenticate(msnv, password);
      
      if (!nhanVien) {
        return res.status(401).json({
          success: false,
          message: 'Mã số nhân viên hoặc mật khẩu không đúng',
          error: 'INVALID_CREDENTIALS'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: nhanVien._id,
          msnv: nhanVien.MSNV,
          chucVu: nhanVien.ChucVu,
          quyen: nhanVien.Quyen
        },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );

      // Return success response
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
            quyen: nhanVien.Quyen,
            lanDangNhapCuoi: nhanVien.LanDangNhapCuoi
          }
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi đăng nhập',
        error: 'LOGIN_ERROR'
      });
    }
  },

  /**
   * Đăng xuất nhân viên
   * POST /api/auth/logout
   */
  async logout(req, res) {
    try {
      // In a stateless JWT system, logout is handled client-side
      // But we can add token blacklisting here if needed in the future
      
      res.json({
        success: true,
        message: 'Đăng xuất thành công'
      });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi đăng xuất',
        error: 'LOGOUT_ERROR'
      });
    }
  },

  /**
   * Lấy thông tin profile của nhân viên hiện tại
   * GET /api/auth/profile
   */
  async getProfile(req, res) {
    try {
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
          thoiGianLamViec: nhanVien.ThoiGianLamViec,
          lanDangNhapCuoi: nhanVien.LanDangNhapCuoi,
          createdAt: nhanVien.createdAt,
          updatedAt: nhanVien.updatedAt
        }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi lấy thông tin profile',
        error: 'PROFILE_ERROR'
      });
    }
  },

  /**
   * Đổi mật khẩu
   * PUT /api/auth/change-password
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;
      const nhanVien = req.user;

      // Validate input
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập đầy đủ thông tin',
          error: 'MISSING_FIELDS'
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu mới và xác nhận mật khẩu không khớp',
          error: 'PASSWORD_MISMATCH'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu mới phải có ít nhất 6 ký tự',
          error: 'PASSWORD_TOO_SHORT'
        });
      }

      // Get full user data with password
      const fullUser = await NhanVien.findById(nhanVien._id);
      
      // Verify current password
      const isCurrentPasswordValid = await fullUser.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu hiện tại không đúng',
          error: 'INVALID_CURRENT_PASSWORD'
        });
      }

      // Update password
      fullUser.Password = newPassword;
      await fullUser.save();

      res.json({
        success: true,
        message: 'Đổi mật khẩu thành công'
      });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi đổi mật khẩu',
        error: 'CHANGE_PASSWORD_ERROR'
      });
    }
  },

  /**
   * Refresh token
   * POST /api/auth/refresh
   */
  async refreshToken(req, res) {
    try {
      const nhanVien = req.user;

      // Generate new token
      const token = jwt.sign(
        { 
          id: nhanVien._id,
          msnv: nhanVien.MSNV,
          chucVu: nhanVien.ChucVu,
          quyen: nhanVien.Quyen
        },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );

      res.json({
        success: true,
        message: 'Refresh token thành công',
        data: { token }
      });

    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi refresh token',
        error: 'REFRESH_TOKEN_ERROR'
      });
    }
  }
};
