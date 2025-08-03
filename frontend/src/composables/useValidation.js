/**
 * Frontend validation composable
 */
import { ref, reactive, readonly } from 'vue';

// Validation patterns (same as backend)
export const VALIDATION_PATTERNS = {
  // Vietnamese phone number
  PHONE: /^(0|\+84)[0-9]{9,10}$/,
  
  // Email
  EMAIL: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
  
  // Vietnamese ID codes
  MA_SACH: /^S\d{3,}$/,
  MA_DOC_GIA: /^DG\d{3,}$/,
  MA_NHA_XUAT_BAN: /^NXB\d{3,}$/,
  MA_NHAN_VIEN: /^NV\d{3,}$/,
  MA_THEO_DOI: /^TD\d{3,}$/,
  
  // Password strength
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  PASSWORD_MEDIUM: /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/
};

// Common validation messages in Vietnamese
export const VALIDATION_MESSAGES = {
  REQUIRED: (field) => `${field} là bắt buộc`,
  MIN_LENGTH: (field, min) => `${field} phải có ít nhất ${min} ký tự`,
  MAX_LENGTH: (field, max) => `${field} không được quá ${max} ký tự`,
  MIN_VALUE: (field, min) => `${field} phải lớn hơn hoặc bằng ${min}`,
  MAX_VALUE: (field, max) => `${field} không được lớn hơn ${max}`,
  INVALID_FORMAT: (field) => `${field} không đúng định dạng`,
  INVALID_EMAIL: 'Email không hợp lệ',
  INVALID_PHONE: 'Số điện thoại không hợp lệ',
  INVALID_DATE: 'Ngày không hợp lệ',
  DUPLICATE: (field) => `${field} đã tồn tại`,
  NOT_FOUND: (field) => `Không tìm thấy ${field}`,
  PASSWORD_WEAK: 'Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ và số',
  PASSWORD_STRONG: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt',
  PASSWORD_MISMATCH: 'Mật khẩu xác nhận không khớp',
  AGE_INVALID: (min, max) => `Tuổi phải từ ${min} đến ${max}`,
  DATE_FUTURE: 'Ngày không được là ngày tương lai',
  DATE_PAST: 'Ngày phải là ngày trong quá khứ'
};

// Field labels in Vietnamese
export const FIELD_LABELS = {
  MaSach: 'Mã sách',
  TenSach: 'Tên sách',
  DonGia: 'Đơn giá',
  SoQuyen: 'Số quyển',
  NamXuatBan: 'Năm xuất bản',
  MaNhaXuatBan: 'Mã nhà xuất bản',
  NhaXuatBan: 'Tên nhà xuất bản',
  NguonGoc: 'Tác giả',
  
  MaDocGia: 'Mã độc giả',
  HoLot: 'Họ lót',
  Ten: 'Tên',
  NgaySinh: 'Ngày sinh',
  Phai: 'Phái',
  DiaChi: 'Địa chỉ',
  DienThoai: 'Số điện thoại',
  
  TenNhaXuatBan: 'Tên nhà xuất bản',
  
  MSNV: 'Mã số nhân viên',
  HoTenNV: 'Họ tên nhân viên',
  Password: 'Mật khẩu',
  ChucVu: 'Chức vụ',
  SoDienThoai: 'Số điện thoại',
  Email: 'Email',
  NgayVaoLam: 'Ngày vào làm',
  TrangThai: 'Trạng thái',
  
  NgayMuon: 'Ngày mượn',
  NgayHenTra: 'Ngày hẹn trả',
  NgayTra: 'Ngày trả',
  GhiChu: 'Ghi chú',
  NhanVienMuon: 'Nhân viên xử lý mượn',
  NhanVienTra: 'Nhân viên xử lý trả'
};

/**
 * Validation functions
 */
export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return VALIDATION_MESSAGES.REQUIRED(FIELD_LABELS[fieldName] || fieldName);
  }
  return null;
};

export const validateLength = (value, fieldName, min = 0, max = Infinity) => {
  if (!value) return null;
  
  const length = value.toString().length;
  const label = FIELD_LABELS[fieldName] || fieldName;
  
  if (length < min) {
    return VALIDATION_MESSAGES.MIN_LENGTH(label, min);
  }
  
  if (length > max) {
    return VALIDATION_MESSAGES.MAX_LENGTH(label, max);
  }
  
  return null;
};

export const validateRange = (value, fieldName, min = -Infinity, max = Infinity) => {
  if (value === null || value === undefined) return null;
  
  const num = Number(value);
  if (isNaN(num)) {
    return `${FIELD_LABELS[fieldName] || fieldName} phải là số`;
  }
  
  const label = FIELD_LABELS[fieldName] || fieldName;
  
  if (num < min) {
    return VALIDATION_MESSAGES.MIN_VALUE(label, min);
  }
  
  if (num > max) {
    return VALIDATION_MESSAGES.MAX_VALUE(label, max);
  }
  
  return null;
};

export const validateEmail = (email) => {
  if (!email) return null;
  if (!VALIDATION_PATTERNS.EMAIL.test(email)) {
    return VALIDATION_MESSAGES.INVALID_EMAIL;
  }
  return null;
};

export const validatePhone = (phone) => {
  if (!phone) return null;
  if (!VALIDATION_PATTERNS.PHONE.test(phone)) {
    return VALIDATION_MESSAGES.INVALID_PHONE;
  }
  return null;
};

export const validatePassword = (password, level = 'medium') => {
  if (!password) return VALIDATION_MESSAGES.REQUIRED('Mật khẩu');
  
  if (level === 'strong') {
    if (!VALIDATION_PATTERNS.PASSWORD_STRONG.test(password)) {
      return VALIDATION_MESSAGES.PASSWORD_STRONG;
    }
  } else {
    if (!VALIDATION_PATTERNS.PASSWORD_MEDIUM.test(password)) {
      return VALIDATION_MESSAGES.PASSWORD_WEAK;
    }
  }
  
  return null;
};

export const validateAge = (birthDate, minAge = 5, maxAge = 100) => {
  if (!birthDate) return null;
  
  const today = new Date();
  const birth = new Date(birthDate);
  
  if (isNaN(birth.getTime())) {
    return VALIDATION_MESSAGES.INVALID_DATE;
  }
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  if (age < minAge || age > maxAge) {
    return VALIDATION_MESSAGES.AGE_INVALID(minAge, maxAge);
  }
  
  return null;
};

export const validateIdFormat = (value, type) => {
  if (!value) return null;
  
  const patterns = {
    sach: VALIDATION_PATTERNS.MA_SACH,
    docgia: VALIDATION_PATTERNS.MA_DOC_GIA,
    nhaxuatban: VALIDATION_PATTERNS.MA_NHA_XUAT_BAN,
    nhanvien: VALIDATION_PATTERNS.MA_NHAN_VIEN,
    theodoi: VALIDATION_PATTERNS.MA_THEO_DOI
  };
  
  const pattern = patterns[type];
  if (!pattern) return null;
  
  if (!pattern.test(value)) {
    return VALIDATION_MESSAGES.INVALID_FORMAT(`Mã ${type}`);
  }
  
  return null;
};

/**
 * Vue composable for form validation
 */
export function useValidation() {
  const errors = ref({});
  const isValidating = ref(false);
  
  // Clear all errors
  const clearErrors = () => {
    errors.value = {};
  };
  
  // Clear error for specific field
  const clearError = (field) => {
    if (errors.value[field]) {
      delete errors.value[field];
    }
  };
  
  // Set error for specific field
  const setError = (field, message) => {
    errors.value[field] = message;
  };
  
  // Validate single field
  const validateField = (value, field, rules) => {
    const fieldErrors = [];
    
    // Required validation
    if (rules.required) {
      const error = validateRequired(value, field);
      if (error) {
        fieldErrors.push(error);
        return fieldErrors[0]; // Return first error
      }
    }
    
    // Skip other validations if field is empty and not required
    if (!rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return null;
    }
    
    // Length validation
    if (rules.minLength || rules.maxLength) {
      const error = validateLength(value, field, rules.minLength, rules.maxLength);
      if (error) fieldErrors.push(error);
    }
    
    // Range validation for numbers
    if (rules.type === 'number' && (rules.min !== undefined || rules.max !== undefined)) {
      const error = validateRange(value, field, rules.min, rules.max);
      if (error) fieldErrors.push(error);
    }
    
    // Pattern validation
    if (rules.pattern && typeof value === 'string') {
      if (!rules.pattern.test(value.trim())) {
        fieldErrors.push(rules.patternMessage || VALIDATION_MESSAGES.INVALID_FORMAT(FIELD_LABELS[field] || field));
      }
    }
    
    // Email validation
    if (rules.type === 'email') {
      const error = validateEmail(value);
      if (error) fieldErrors.push(error);
    }
    
    // Phone validation
    if (rules.type === 'phone') {
      const error = validatePhone(value);
      if (error) fieldErrors.push(error);
    }
    
    // Password validation
    if (rules.type === 'password') {
      const error = validatePassword(value, rules.level);
      if (error) fieldErrors.push(error);
    }
    
    // Age validation
    if (rules.type === 'age') {
      const error = validateAge(value, rules.minAge, rules.maxAge);
      if (error) fieldErrors.push(error);
    }
    
    // ID format validation
    if (rules.idType) {
      const error = validateIdFormat(value, rules.idType);
      if (error) fieldErrors.push(error);
    }
    
    // Enum validation
    if (rules.enum && !rules.enum.includes(value)) {
      fieldErrors.push(`${FIELD_LABELS[field] || field} phải là một trong: ${rules.enum.join(', ')}`);
    }
    
    // Custom validation
    if (rules.custom) {
      const error = rules.custom(value);
      if (error) fieldErrors.push(error);
    }
    
    return fieldErrors.length > 0 ? fieldErrors[0] : null;
  };
  
  // Validate entire form
  const validateForm = (formData, schema) => {
    isValidating.value = true;
    clearErrors();
    
    let hasErrors = false;
    
    for (const [field, rules] of Object.entries(schema)) {
      const value = formData[field];
      const error = validateField(value, field, rules);
      
      if (error) {
        setError(field, error);
        hasErrors = true;
      }
    }
    
    isValidating.value = false;
    return !hasErrors;
  };
  
  // Validate single field and update errors
  const validateSingleField = (value, field, rules) => {
    const error = validateField(value, field, rules);
    
    if (error) {
      setError(field, error);
    } else {
      clearError(field);
    }
    
    return !error;
  };
  
  // Check if form has any errors
  const hasErrors = () => {
    return Object.keys(errors.value).length > 0;
  };
  
  // Get error for specific field
  const getError = (field) => {
    return errors.value[field] || null;
  };
  
  // Get all errors
  const getAllErrors = () => {
    return errors.value;
  };
  
  return {
    errors: readonly(errors),
    isValidating: readonly(isValidating),
    clearErrors,
    clearError,
    setError,
    validateField,
    validateForm,
    validateSingleField,
    hasErrors,
    getError,
    getAllErrors
  };
}

// Validation schemas for frontend (same as backend)
export const validationSchemas = {
  sach: {
    MaSach: {
      required: true,
      pattern: VALIDATION_PATTERNS.MA_SACH,
      patternMessage: 'Mã sách phải có định dạng S001, S002, ...'
    },
    TenSach: {
      required: true,
      minLength: 1,
      maxLength: 200
    },
    DonGia: {
      required: true,
      type: 'number',
      min: 0,
      max: 10000000,
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
      pattern: VALIDATION_PATTERNS.MA_NHA_XUAT_BAN,
      patternMessage: 'Mã nhà xuất bản phải có định dạng NXB001, NXB002, ...'
    },
    NhaXuatBan: {
      required: true,
      minLength: 1,
      maxLength: 100
    },
    NguonGoc: {
      required: true,
      minLength: 1,
      maxLength: 100
    }
  },
  
  docgia: {
    MaDocGia: {
      required: true,
      pattern: VALIDATION_PATTERNS.MA_DOC_GIA,
      patternMessage: 'Mã độc giả phải có định dạng DG001, DG002, ...'
    },
    HoLot: {
      required: true,
      minLength: 1,
      maxLength: 50,
      custom: (value) => {
        if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(value)) {
          return 'Họ lót chỉ được chứa chữ cái và khoảng trắng';
        }
        return null;
      }
    },
    Ten: {
      required: true,
      minLength: 1,
      maxLength: 20,
      custom: (value) => {
        if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(value)) {
          return 'Tên chỉ được chứa chữ cái và khoảng trắng';
        }
        return null;
      }
    },
    NgaySinh: {
      required: true,
      type: 'age',
      minAge: 5,
      maxAge: 100,
      custom: (value) => {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          return 'Ngày sinh không hợp lệ';
        }
        if (date > new Date()) {
          return 'Ngày sinh không được là ngày tương lai';
        }
        return null;
      }
    },
    Phai: {
      required: true,
      enum: ['Nam', 'Nữ']
    },
    DiaChi: {
      required: true,
      minLength: 5,
      maxLength: 200
    },
    DienThoai: {
      required: true,
      type: 'phone'
    }
  },
  
  nhaxuatban: {
    MaNhaXuatBan: {
      required: true,
      pattern: VALIDATION_PATTERNS.MA_NHA_XUAT_BAN,
      patternMessage: 'Mã nhà xuất bản phải có định dạng NXB001, NXB002, ...'
    },
    TenNhaXuatBan: {
      required: true,
      minLength: 1,
      maxLength: 100
    },
    DiaChi: {
      required: false,
      maxLength: 200
    },
    DienThoai: {
      required: false,
      type: 'phone'
    }
  },
  
  nhanvien: {
    MSNV: {
      required: true,
      pattern: VALIDATION_PATTERNS.MA_NHAN_VIEN,
      patternMessage: 'Mã số nhân viên phải có định dạng NV001, NV002, ...'
    },
    HoTenNV: {
      required: true,
      minLength: 2,
      maxLength: 50,
      custom: (value) => {
        if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(value)) {
          return 'Họ tên chỉ được chứa chữ cái và khoảng trắng';
        }
        return null;
      }
    },
    Password: {
      required: true,
      type: 'password',
      level: 'medium'
    },
    ChucVu: {
      required: true,
      enum: ['Quản lý', 'Thủ thư', 'Nhân viên']
    },
    SoDienThoai: {
      required: false,
      type: 'phone'
    },
    Email: {
      required: false,
      type: 'email'
    },
    NgayVaoLam: {
      required: true,
      custom: (value) => {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          return 'Ngày vào làm không hợp lệ';
        }
        if (date > new Date()) {
          return 'Ngày vào làm không được là ngày tương lai';
        }
        return null;
      }
    },
    TrangThai: {
      required: true,
      enum: ['Hoạt động', 'Tạm nghỉ', 'Nghỉ việc']
    }
  },
  
  theodoimuonsach: {
    MaDocGia: {
      required: true,
      pattern: VALIDATION_PATTERNS.MA_DOC_GIA,
      patternMessage: 'Mã độc giả phải có định dạng DG001, DG002, ...'
    },
    MaSach: {
      required: true,
      pattern: VALIDATION_PATTERNS.MA_SACH,
      patternMessage: 'Mã sách phải có định dạng S001, S002, ...'
    },
    NgayMuon: {
      required: true,
      custom: (value) => {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          return 'Ngày mượn không hợp lệ';
        }
        if (date > new Date()) {
          return 'Ngày mượn không được là ngày tương lai';
        }
        return null;
      }
    },
    NgayHenTra: {
      required: true,
      custom: (value) => {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          return 'Ngày hẹn trả không hợp lệ';
        }
        return null;
      }
    },
    GhiChu: {
      required: false,
      maxLength: 500
    },
    NhanVienMuon: {
      required: true,
      pattern: VALIDATION_PATTERNS.MA_NHAN_VIEN,
      patternMessage: 'Mã nhân viên phải có định dạng NV001, NV002, ...'
    }
  }
};

export default {
  VALIDATION_PATTERNS,
  VALIDATION_MESSAGES,
  FIELD_LABELS,
  validateRequired,
  validateLength,
  validateRange,
  validateEmail,
  validatePhone,
  validatePassword,
  validateAge,
  validateIdFormat,
  useValidation,
  validationSchemas
};