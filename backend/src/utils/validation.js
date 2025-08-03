/**
 * Validation utilities for consistent validation across the application
 */

// Common validation patterns
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
 * Validate Vietnamese phone number
 */
export const validatePhone = (phone) => {
  if (!phone) return null;
  if (!VALIDATION_PATTERNS.PHONE.test(phone)) {
    return VALIDATION_MESSAGES.INVALID_PHONE;
  }
  return null;
};

/**
 * Validate email
 */
export const validateEmail = (email) => {
  if (!email) return null;
  if (!VALIDATION_PATTERNS.EMAIL.test(email)) {
    return VALIDATION_MESSAGES.INVALID_EMAIL;
  }
  return null;
};

/**
 * Validate password strength
 */
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

/**
 * Validate age based on birth date
 */
export const validateAge = (birthDate, minAge = 5, maxAge = 100) => {
  if (!birthDate) return null;
  
  const today = new Date();
  const birth = new Date(birthDate);
  
  if (isNaN(birth.getTime())) {
    return VALIDATION_MESSAGES.INVALID_DATE;
  }
  
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  if (age < minAge || age > maxAge) {
    return VALIDATION_MESSAGES.AGE_INVALID(minAge, maxAge);
  }
  
  return null;
};

/**
 * Validate date is not in the future
 */
export const validateNotFuture = (date) => {
  if (!date) return null;
  
  const inputDate = new Date(date);
  if (isNaN(inputDate.getTime())) {
    return VALIDATION_MESSAGES.INVALID_DATE;
  }
  
  if (inputDate > new Date()) {
    return VALIDATION_MESSAGES.DATE_FUTURE;
  }
  
  return null;
};

/**
 * Validate date is in the future
 */
export const validateFuture = (date) => {
  if (!date) return null;
  
  const inputDate = new Date(date);
  if (isNaN(inputDate.getTime())) {
    return VALIDATION_MESSAGES.INVALID_DATE;
  }
  
  if (inputDate <= new Date()) {
    return 'Ngày phải sau ngày hiện tại';
  }
  
  return null;
};

/**
 * Validate required field
 */
export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return VALIDATION_MESSAGES.REQUIRED(FIELD_LABELS[fieldName] || fieldName);
  }
  return null;
};

/**
 * Validate string length
 */
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

/**
 * Validate numeric range
 */
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

/**
 * Validate ID format
 */
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
 * Comprehensive form validator
 */
export class FormValidator {
  constructor() {
    this.errors = {};
  }
  
  // Add validation error
  addError(field, message) {
    if (!this.errors[field]) {
      this.errors[field] = [];
    }
    this.errors[field].push(message);
  }
  
  // Validate required fields
  required(value, field) {
    const error = validateRequired(value, field);
    if (error) {
      this.addError(field, error);
    }
    return this;
  }
  
  // Validate string length
  length(value, field, min, max) {
    const error = validateLength(value, field, min, max);
    if (error) {
      this.addError(field, error);
    }
    return this;
  }
  
  // Validate numeric range
  range(value, field, min, max) {
    const error = validateRange(value, field, min, max);
    if (error) {
      this.addError(field, error);
    }
    return this;
  }
  
  // Validate email
  email(value, field = 'Email') {
    const error = validateEmail(value);
    if (error) {
      this.addError(field, error);
    }
    return this;
  }
  
  // Validate phone
  phone(value, field = 'DienThoai') {
    const error = validatePhone(value);
    if (error) {
      this.addError(field, error);
    }
    return this;
  }
  
  // Validate password
  password(value, field = 'Password', level = 'medium') {
    const error = validatePassword(value, level);
    if (error) {
      this.addError(field, error);
    }
    return this;
  }
  
  // Validate age
  age(value, field = 'NgaySinh', min = 5, max = 100) {
    const error = validateAge(value, min, max);
    if (error) {
      this.addError(field, error);
    }
    return this;
  }
  
  // Validate ID format
  idFormat(value, field, type) {
    const error = validateIdFormat(value, type);
    if (error) {
      this.addError(field, error);
    }
    return this;
  }
  
  // Custom validation
  custom(value, field, validatorFn) {
    const error = validatorFn(value);
    if (error) {
      this.addError(field, error);
    }
    return this;
  }
  
  // Check if validation passed
  isValid() {
    return Object.keys(this.errors).length === 0;
  }
  
  // Get all errors
  getErrors() {
    return this.errors;
  }
  
  // Get first error for each field
  getFirstErrors() {
    const firstErrors = {};
    for (const [field, errors] of Object.entries(this.errors)) {
      firstErrors[field] = errors[0];
    }
    return firstErrors;
  }
  
  // Clear all errors
  clear() {
    this.errors = {};
    return this;
  }
}

export default {
  VALIDATION_PATTERNS,
  VALIDATION_MESSAGES,
  FIELD_LABELS,
  validatePhone,
  validateEmail,
  validatePassword,
  validateAge,
  validateNotFuture,
  validateFuture,
  validateRequired,
  validateLength,
  validateRange,
  validateIdFormat,
  FormValidator
};