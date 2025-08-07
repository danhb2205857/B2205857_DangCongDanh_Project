import mongoose from "mongoose";
import bcrypt from "bcrypt";

const NhanVienSchema = new mongoose.Schema(
  {
    MSNV: {
      type: String,
      required: [true, "Mã số nhân viên là bắt buộc"],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^NV\d{3,}$/, "Mã nhân viên phải có định dạng NV001, NV002, ..."],
    },
    HoTenNV: {
      type: String,
      required: [true, "Họ tên nhân viên là bắt buộc"],
      trim: true,
      maxlength: [100, "Họ tên không được vượt quá 100 ký tự"],
    },
    Password: {
      type: String,
      required: [true, "Mật khẩu là bắt buộc"],
      minlength: [6, "Mật khẩu phải có ít nhất 6 ký tự"],
    },
    ChucVu: {
      type: String,
      required: [true, "Chức vụ là bắt buộc"],
      enum: {
        values: ["Quản lý thư viện", "Thủ thư", "Nhân viên", "Thực tập sinh"],
        message: "Chức vụ không hợp lệ",
      },
    },
    DiaChi: {
      type: String,
      required: [true, "Địa chỉ là bắt buộc"],
      trim: true,
      maxlength: [200, "Địa chỉ không được vượt quá 200 ký tự"],
    },
    SoDienThoai: {
      type: String,
      required: [true, "Số điện thoại là bắt buộc"],
      trim: true,
      match: [/^(0|\+84)[0-9]{9,10}$/, "Số điện thoại không hợp lệ"],
    },
    Email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Email không hợp lệ",
      ],
    },
    NgaySinh: {
      type: Date,
      validate: {
        validator: function (value) {
          if (!value) return true;
          const today = new Date();
          const age = today.getFullYear() - value.getFullYear();
          return age >= 18 && age <= 65;
        },
        message: "Tuổi nhân viên phải từ 18 đến 65",
      },
    },
    NgayVaoLam: {
      type: Date,
      default: Date.now,
      validate: {
        validator: function (value) {
          return value <= new Date();
        },
        message: "Ngày vào làm không được là ngày tương lai",
      },
    },
    TrangThai: {
      type: String,
      enum: {
        values: ["Đang làm việc", "Nghỉ phép", "Đã nghỉ việc"],
        message: "Trạng thái không hợp lệ",
      },
      default: "Đang làm việc",
    },
    Quyen: {
      type: [String],
      enum: {
        values: [
          "doc_gia",
          "sach",
          "nha_xuat_ban",
          "muon_tra",
          "thong_ke",
          "quan_ly",
        ],
        message: "Quyền không hợp lệ",
      },
      default: ["doc_gia", "sach", "muon_tra"],
    },
    isActivate: {
      type: Number,
      enum: [0, 1],
      default: 0,
      required: true,
    },
    LanDangNhapCuoi: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: "nhanviens",
  }
);

// Indexes disabled for faster startup - will add back later if needed

// Virtual for work duration
NhanVienSchema.virtual("ThoiGianLamViec").get(function () {
  if (!this.NgayVaoLam) return 0;
  const today = new Date();
  const diffTime = today - this.NgayVaoLam;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25)); // years
});

// Ensure virtual fields are serialized
NhanVienSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.Password; // Never return password in JSON
    return ret;
  },
});
NhanVienSchema.set("toObject", { virtuals: true });

// Pre-save middleware for password hashing
NhanVienSchema.pre("save", async function (next) {
  // Only hash password if it's modified
  if (!this.isModified("Password")) return next();

  try {
    // Hash password with salt rounds of 12
    const salt = await bcrypt.genSalt(12);
    this.Password = await bcrypt.hash(this.Password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware for name formatting
NhanVienSchema.pre("save", function (next) {
  // Capitalize name
  if (this.HoTenNV) {
    this.HoTenNV = this.HoTenNV.replace(/\b\w/g, (l) => l.toUpperCase());
  }
  next();
});

// Instance method to compare password
NhanVienSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.Password);
  } catch (error) {
    throw error;
  }
};

// Instance method to update last login
NhanVienSchema.methods.updateLastLogin = function () {
  this.LanDangNhapCuoi = new Date();
  return this.save();
};

// Instance method to check permission
NhanVienSchema.methods.hasPermission = function (permission) {
  return this.Quyen.includes(permission) || this.Quyen.includes("quan_ly");
};

// Static method to find active employees
NhanVienSchema.statics.findActive = function () {
  return this.find({ TrangThai: "Đang làm việc" });
};

// Static method for authentication
NhanVienSchema.statics.authenticate = async function (msnv, password) {
  try {
    const nhanVien = await this.findOne({
      MSNV: msnv.toUpperCase(),
      TrangThai: "Đang làm việc",
      isActivate: 1,
    });

    if (!nhanVien) {
      return null;
    }

    const isMatch = await nhanVien.comparePassword(password);
    if (!isMatch) {
      return null;
    }

    // Update last login
    await nhanVien.updateLastLogin();

    return nhanVien;
  } catch (error) {
    throw error;
  }
};

export default mongoose.model("NhanVien", NhanVienSchema);
