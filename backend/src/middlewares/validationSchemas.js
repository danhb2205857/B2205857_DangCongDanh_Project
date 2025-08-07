import { VALIDATION_PATTERNS } from '../utils/validation.js';


export const sachSchema = {
  MaSach: {
    required: true,
    type: 'string',
    pattern: VALIDATION_PATTERNS.MA_SACH,
    patternMessage: 'Mã sách phải có định dạng S001, S002, ...',
    label: 'Mã sách'
  },
  TenSach: {
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 200,
    label: 'Tên sách'
  },
  DonGia: {
    required: true,
    type: 'number',
    min: 0,
    max: 10000000,
    label: 'Đơn giá',
    custom: (value) => {
      const num = Number(value);
      if (isNaN(num)) return 'Đơn giá phải là số';
      if (num <= 0) return 'Đơn giá phải lớn hơn 0';
      return null;
    }
  },
  SoQuyen: {
    required: true,
    type: 'number',
    min: 0,
    max: 1000,
    label: 'Số quyển',
    custom: (value) => {
      const num = Number(value);
      if (isNaN(num)) return 'Số quyển phải là số';
      if (num < 0) return 'Số quyển phải lớn hơn hoặc bằng 0';
      if (!Number.isInteger(num)) return 'Số quyển phải là số nguyên';
      return null;
    }
  },
  NamXuatBan: {
    required: true,
    type: 'number',
    min: 1900,
    max: new Date().getFullYear(),
    label: 'Năm xuất bản',
    custom: (value) => {
      const num = Number(value);
      if (isNaN(num)) return 'Năm xuất bản phải là số';
      if (!Number.isInteger(num)) return 'Năm xuất bản phải là số nguyên';
      if (num < 1900) return 'Năm xuất bản phải từ 1900';
      if (num > new Date().getFullYear()) return `Năm xuất bản không được quá ${new Date().getFullYear()}`;
      return null;
    }
  },
  MaNhaXuatBan: {
    required: true,
    type: 'string',
    pattern: VALIDATION_PATTERNS.MA_NHA_XUAT_BAN,
    patternMessage: 'Mã nhà xuất bản phải có định dạng NXB001, NXB002, ...',
    label: 'Mã nhà xuất bản'
  },
  NhaXuatBan: {
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 100,
    label: 'Tên nhà xuất bản'
  },
  NguonGoc: {
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 100,
    label: 'Tác giả'
  }
};


export const docGiaSchema = {
  MaDocGia: {
    required: true,
    type: 'string',
    pattern: VALIDATION_PATTERNS.MA_DOC_GIA,
    patternMessage: 'Mã độc giả phải có định dạng DG001, DG002, ...',
    label: 'Mã độc giả'
  },
  HoLot: {
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 50,
    label: 'Họ lót',
    custom: (value) => {
      if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(value)) {
        return 'Họ lót chỉ được chứa chữ cái và khoảng trắng';
      }
      return null;
    }
  },
  Ten: {
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 20,
    label: 'Tên',
    custom: (value) => {
      if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(value)) {
        return 'Tên chỉ được chứa chữ cái và khoảng trắng';
      }
      return null;
    }
  },
  NgaySinh: {
    required: true,
    type: 'string',
    label: 'Ngày sinh',
    custom: (value) => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return 'Ngày sinh không hợp lệ';
      }
      
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      const monthDiff = today.getMonth() - date.getMonth();
      
      let actualAge = age;
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
        actualAge--;
      }
      
      if (actualAge < 5) return 'Độc giả phải từ 5 tuổi trở lên';
      if (actualAge > 100) return 'Tuổi không hợp lệ';
      if (date > today) return 'Ngày sinh không được là ngày tương lai';
      
      return null;
    }
  },
  Phai: {
    required: true,
    type: 'string',
    enum: ['Nam', 'Nữ'],
    label: 'Phái'
  },
  DiaChi: {
    required: true,
    type: 'string',
    minLength: 5,
    maxLength: 200,
    label: 'Địa chỉ'
  },
  DienThoai: {
    required: true,
    type: 'string',
    pattern: VALIDATION_PATTERNS.PHONE,
    patternMessage: 'Số điện thoại không hợp lệ',
    label: 'Số điện thoại'
  }
};


export const nhaXuatBanSchema = {
  MaNhaXuatBan: {
    required: true,
    type: 'string',
    pattern: VALIDATION_PATTERNS.MA_NHA_XUAT_BAN,
    patternMessage: 'Mã nhà xuất bản phải có định dạng NXB001, NXB002, ...',
    label: 'Mã nhà xuất bản'
  },
  TenNhaXuatBan: {
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 100,
    label: 'Tên nhà xuất bản'
  },
  DiaChi: {
    required: false,
    type: 'string',
    maxLength: 200,
    label: 'Địa chỉ'
  },
  DienThoai: {
    required: false,
    type: 'string',
    pattern: VALIDATION_PATTERNS.PHONE,
    patternMessage: 'Số điện thoại không hợp lệ',
    label: 'Số điện thoại'
  }
};


export const nhanVienSchema = {
  MSNV: {
    required: true,
    type: 'string',
    pattern: VALIDATION_PATTERNS.MA_NHAN_VIEN,
    patternMessage: 'Mã số nhân viên phải có định dạng NV001, NV002, ...',
    label: 'Mã số nhân viên'
  },
  HoTenNV: {
    required: true,
    type: 'string',
    minLength: 2,
    maxLength: 50,
    label: 'Họ tên nhân viên',
    custom: (value) => {
      if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(value)) {
        return 'Họ tên chỉ được chứa chữ cái và khoảng trắng';
      }
      return null;
    }
  },
  Password: {
    required: true,
    type: 'string',
    minLength: 6,
    label: 'Mật khẩu',
    custom: (value) => {
      if (!/^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/.test(value)) {
        return 'Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ và số';
      }
      return null;
    }
  },
  ChucVu: {
    required: true,
    type: 'string',
    enum: ['Quản lý', 'Thủ thư', 'Nhân viên'],
    label: 'Chức vụ'
  },
  SoDienThoai: {
    required: false,
    type: 'string',
    pattern: VALIDATION_PATTERNS.PHONE,
    patternMessage: 'Số điện thoại không hợp lệ',
    label: 'Số điện thoại'
  },
  Email: {
    required: false,
    type: 'string',
    pattern: VALIDATION_PATTERNS.EMAIL,
    patternMessage: 'Email không hợp lệ',
    label: 'Email'
  },
  NgayVaoLam: {
    required: true,
    type: 'string',
    label: 'Ngày vào làm',
    custom: (value) => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return 'Ngày vào làm không hợp lệ';
      }
      
      const today = new Date();
      if (date > today) {
        return 'Ngày vào làm không được là ngày tương lai';
      }
      
      return null;
    }
  },
  TrangThai: {
    required: true,
    type: 'string',
    enum: ['Hoạt động', 'Tạm nghỉ', 'Nghỉ việc'],
    label: 'Trạng thái'
  }
};


export const theoDoiMuonSachSchema = {
  MaDocGia: {
    required: true,
    type: 'string',
    pattern: VALIDATION_PATTERNS.MA_DOC_GIA,
    patternMessage: 'Mã độc giả phải có định dạng DG001, DG002, ...',
    label: 'Mã độc giả'
  },
  MaSach: {
    required: true,
    type: 'string',
    pattern: VALIDATION_PATTERNS.MA_SACH,
    patternMessage: 'Mã sách phải có định dạng S001, S002, ...',
    label: 'Mã sách'
  },
  NgayMuon: {
    required: true,
    type: 'string',
    label: 'Ngày mượn',
    custom: (value) => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return 'Ngày mượn không hợp lệ';
      }
      
      const today = new Date();
      if (date > today) {
        return 'Ngày mượn không được là ngày tương lai';
      }
      
      return null;
    }
  },
  NgayHenTra: {
    required: true,
    type: 'string',
    label: 'Ngày hẹn trả',
    custom: (value, body) => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return 'Ngày hẹn trả không hợp lệ';
      }
      
      const ngayMuon = new Date(body.NgayMuon);
      if (date <= ngayMuon) {
        return 'Ngày hẹn trả phải sau ngày mượn';
      }
      
      // Check if return date is within reasonable period (e.g., max 30 days)
      const diffTime = Math.abs(date - ngayMuon);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 30) {
        return 'Thời gian mượn không được quá 30 ngày';
      }
      
      return null;
    }
  },
  NgayTra: {
    required: false,
    type: 'string',
    label: 'Ngày trả',
    custom: (value, body) => {
      if (!value) return null; // Optional field
      
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return 'Ngày trả không hợp lệ';
      }
      
      const ngayMuon = new Date(body.NgayMuon);
      if (date < ngayMuon) {
        return 'Ngày trả không được trước ngày mượn';
      }
      
      const today = new Date();
      if (date > today) {
        return 'Ngày trả không được là ngày tương lai';
      }
      
      return null;
    }
  },
  GhiChu: {
    required: false,
    type: 'string',
    maxLength: 500,
    label: 'Ghi chú'
  },
  NhanVienMuon: {
    required: true,
    type: 'string',
    pattern: VALIDATION_PATTERNS.MA_NHAN_VIEN,
    patternMessage: 'Mã nhân viên phải có định dạng NV001, NV002, ...',
    label: 'Nhân viên xử lý mượn'
  },
  NhanVienTra: {
    required: false,
    type: 'string',
    pattern: VALIDATION_PATTERNS.MA_NHAN_VIEN,
    patternMessage: 'Mã nhân viên phải có định dạng NV001, NV002, ...',
    label: 'Nhân viên xử lý trả'
  }
};


export const sachUpdateSchema = {
  ...sachSchema,
  MaSach: { ...sachSchema.MaSach, required: false }, 
  TenSach: { ...sachSchema.TenSach, required: false },
  DonGia: { ...sachSchema.DonGia, required: false },
  SoQuyen: { ...sachSchema.SoQuyen, required: false },
  NamXuatBan: { ...sachSchema.NamXuatBan, required: false },
  MaNhaXuatBan: { ...sachSchema.MaNhaXuatBan, required: false },
  NhaXuatBan: { ...sachSchema.NhaXuatBan, required: false },
  NguonGoc: { ...sachSchema.NguonGoc, required: false }
};

export const docGiaUpdateSchema = {
  ...docGiaSchema,
  MaDocGia: { ...docGiaSchema.MaDocGia, required: false },
  HoLot: { ...docGiaSchema.HoLot, required: false },
  Ten: { ...docGiaSchema.Ten, required: false },
  NgaySinh: { ...docGiaSchema.NgaySinh, required: false },
  Phai: { ...docGiaSchema.Phai, required: false },
  DiaChi: { ...docGiaSchema.DiaChi, required: false },
  DienThoai: { ...docGiaSchema.DienThoai, required: false }
};

export const nhaXuatBanUpdateSchema = {
  ...nhaXuatBanSchema,
  MaNhaXuatBan: { ...nhaXuatBanSchema.MaNhaXuatBan, required: false },
  TenNhaXuatBan: { ...nhaXuatBanSchema.TenNhaXuatBan, required: false }
};

export const nhanVienUpdateSchema = {
  ...nhanVienSchema,
  MSNV: { ...nhanVienSchema.MSNV, required: false },
  HoTenNV: { ...nhanVienSchema.HoTenNV, required: false },
  Password: { ...nhanVienSchema.Password, required: false },
  ChucVu: { ...nhanVienSchema.ChucVu, required: false },
  NgayVaoLam: { ...nhanVienSchema.NgayVaoLam, required: false },
  TrangThai: { ...nhanVienSchema.TrangThai, required: false }
};


export const returnBookSchema = {
  NgayTra: {
    required: true,
    type: 'string',
    label: 'Ngày trả',
    custom: (value) => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return 'Ngày trả không hợp lệ';
      }
      
      const today = new Date();
      if (date > today) {
        return 'Ngày trả không được là ngày tương lai';
      }
      
      return null;
    }
  },
  GhiChu: {
    required: false,
    type: 'string',
    maxLength: 500,
    label: 'Ghi chú'
  },
  NhanVienTra: {
    required: true,
    type: 'string',
    pattern: VALIDATION_PATTERNS.MA_NHAN_VIEN,
    patternMessage: 'Mã nhân viên phải có định dạng NV001, NV002, ...',
    label: 'Nhân viên xử lý trả'
  }
};


export const registerSchema = {
  fullName: {
    required: true,
    type: 'string',
    minLength: 2,
    maxLength: 100,
    label: 'Họ tên'
  },
  password: {
    required: true,
    type: 'string',
    minLength: 6,
    maxLength: 50,
    label: 'Mật khẩu'
  },
  email: {
    required: false,
    type: 'string',
    pattern: VALIDATION_PATTERNS.EMAIL,
    patternMessage: 'Email không hợp lệ',
    label: 'Email'
  },
  phone: {
    required: true,
    type: 'string',
    pattern: VALIDATION_PATTERNS.PHONE,
    patternMessage: 'Số điện thoại không hợp lệ',
    label: 'Số điện thoại'
  },
  address: {
    required: true,
    type: 'string',
    minLength: 5,
    maxLength: 200,
    label: 'Địa chỉ'
  },
  birthDate: {
    required: false,
    type: 'string',
    label: 'Ngày sinh',
    custom: (value) => {
      if (!value) return null;
      
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return 'Ngày sinh không hợp lệ';
      }
      
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      
      if (age < 18 || age > 65) {
        return 'Tuổi phải từ 18 đến 65';
      }
      
      return null;
    }
  }
};

export default {
  sachSchema,
  docGiaSchema,
  nhaXuatBanSchema,
  nhanVienSchema,
  theoDoiMuonSachSchema,
  sachUpdateSchema,
  docGiaUpdateSchema,
  nhaXuatBanUpdateSchema,
  nhanVienUpdateSchema,
  returnBookSchema,
  registerSchema
};