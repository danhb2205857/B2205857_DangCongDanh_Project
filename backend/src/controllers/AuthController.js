import { NhanVien } from "../models/index.js";
import { generateToken } from "../utils/jwt.js";
import { AppError } from "../middlewares/errorHandler.js";

export default {
  
  async register(req, res) {
    try {
      console.log("Register request body:", req.body);

      const { fullName, password, email, phone, address, birthDate } = req.body;

   
      const lastEmployee = await NhanVien.findOne(
        {},
        {},
        { sort: { MSNV: -1 } }
      );
      let nextNumber = 1;
      if (
        lastEmployee &&
        lastEmployee.MSNV &&
        lastEmployee.MSNV.match(/^NV(\d+)$/)
      ) {
        nextNumber = parseInt(lastEmployee.MSNV.substring(2)) + 1;
      }
      const msnv = `NV${nextNumber.toString().padStart(3, "0")}`;

      console.log("Generated MSNV:", msnv);


      const existingUser = await NhanVien.findOne({
        MSNV: msnv,
      });
      if (existingUser) {
        throw new AppError(
          "Mã nhân viên đã tồn tại",
          400,
          "DUPLICATE_USERNAME"
        );
      }

     
      if (email) {
        const existingEmail = await NhanVien.findOne({
          Email: email.toLowerCase(),
        });
        if (existingEmail) {
          throw new AppError("Email đã được sử dụng", 400, "DUPLICATE_EMAIL");
        }
      }

      
      const nhanVien = new NhanVien({
        MSNV: msnv,
        HoTenNV: fullName,
        Password: password,
        ChucVu: "Nhân viên", // Default role
        DiaChi: address,
        SoDienThoai: phone,
        Email: email?.toLowerCase(),
        NgaySinh: birthDate ? new Date(birthDate) : undefined,
        TrangThai: "Đang làm việc",
        Quyen: ["doc_gia", "sach", "muon_tra", "thong_ke"], // Default permissions
      });

      await nhanVien.save();

      
      const token = generateToken({
        id: nhanVien._id,
        msnv: nhanVien.MSNV,
        chucVu: nhanVien.ChucVu,
        quyen: nhanVien.Quyen,
      });

      res.status(201).json({
        success: true,
        message: "Đăng ký tài khoản thành công",
        data: {
          token,
          user: {
            _id: nhanVien._id,
            MSNV: nhanVien.MSNV,
            HoTenNV: nhanVien.HoTenNV,
            ChucVu: nhanVien.ChucVu,
            Email: nhanVien.Email,
            DiaChi: nhanVien.DiaChi,
            SoDienThoai: nhanVien.SoDienThoai,
            NgaySinh: nhanVien.NgaySinh,
            NgayVaoLam: nhanVien.NgayVaoLam,
            TrangThai: nhanVien.TrangThai,
            Quyen: nhanVien.Quyen,
            isActivate: nhanVien.isActivate,
          },
        },
      });
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  },

  
  async login(req, res) {
    const { msnv, password } = req.body;

    
    const nhanVien = await NhanVien.authenticate(msnv, password);

    if (!nhanVien) {
      throw new AppError(
        "Mã nhân viên hoặc mật khẩu không đúng",
        401,
        "INVALID_CREDENTIALS"
      );
    }

    
    const token = generateToken({
      id: nhanVien._id,
      msnv: nhanVien.MSNV,
      chucVu: nhanVien.ChucVu,
      quyen: nhanVien.Quyen,
    });

    res.json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        token,
        user: {
          _id: nhanVien._id,
          MSNV: nhanVien.MSNV,
          HoTenNV: nhanVien.HoTenNV,
          ChucVu: nhanVien.ChucVu,
          Email: nhanVien.Email,
          DiaChi: nhanVien.DiaChi,
          SoDienThoai: nhanVien.SoDienThoai,
          NgaySinh: nhanVien.NgaySinh,
          NgayVaoLam: nhanVien.NgayVaoLam,
          TrangThai: nhanVien.TrangThai,
          Quyen: nhanVien.Quyen,
          isActivate: nhanVien.isActivate,
        },
      },
    });
  },

  
  async logout(req, res) {
    

    res.json({
      success: true,
      message: "Đăng xuất thành công",
    });
  },

  
  async getProfile(req, res) {
    
    const nhanVien = req.user;

    res.json({
      success: true,
      message: "Lấy thông tin profile thành công",
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
        lanDangNhapCuoi: nhanVien.LanDangNhapCuoi,
      },
    });
  },

  
  async changePassword(req, res) {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const nhanVien = req.user;

    
    const isCurrentPasswordValid = await nhanVien.comparePassword(
      currentPassword
    );
    if (!isCurrentPasswordValid) {
      throw new AppError(
        "Mật khẩu hiện tại không đúng",
        400,
        "INVALID_CURRENT_PASSWORD"
      );
    }

    
    if (newPassword !== confirmPassword) {
      throw new AppError(
        "Mật khẩu mới và xác nhận mật khẩu không khớp",
        400,
        "PASSWORD_MISMATCH"
      );
    }


    nhanVien.Password = newPassword;
    await nhanVien.save();

    res.json({
      success: true,
      message: "Đổi mật khẩu thành công",
    });
  },

  
  async refreshToken(req, res) {
    const nhanVien = req.user;

    
    const token = generateToken({
      id: nhanVien._id,
      msnv: nhanVien.MSNV,
      chucVu: nhanVien.ChucVu,
      quyen: nhanVien.Quyen,
    });

    res.json({
      success: true,
      message: "Làm mới token thành công",
      data: {
        token,
        user: {
          _id: nhanVien._id,
          MSNV: nhanVien.MSNV,
          HoTenNV: nhanVien.HoTenNV,
          ChucVu: nhanVien.ChucVu,
          Email: nhanVien.Email,
          DiaChi: nhanVien.DiaChi,
          SoDienThoai: nhanVien.SoDienThoai,
          NgaySinh: nhanVien.NgaySinh,
          NgayVaoLam: nhanVien.NgayVaoLam,
          TrangThai: nhanVien.TrangThai,
          Quyen: nhanVien.Quyen,
          isActivate: nhanVien.isActivate,
        },
      },
    });
  },
};
