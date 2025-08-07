import { FormValidator, VALIDATION_MESSAGES } from '../utils/validation.js';
import { AppError } from './errorHandler.js';
import {
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
} from './validationSchemas.js';


export const validateLogin = (req, _res, next) => {
  const { msnv, password } = req.body;
  
  const validator = new FormValidator();
  
  validator
    .required(msnv, 'MSNV')
    .required(password, 'Password')
    .length(msnv, 'MSNV', 1, 20)
    .length(password, 'Password', 1, 100); 

  if (!validator.isValid()) {
    throw new AppError('Dữ liệu đầu vào không hợp lệ', 400, 'VALIDATION_ERROR');
  }

  
  req.body.msnv = msnv.trim().toUpperCase();
  
  next();
};


export const validateChangePassword = (req, _res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  
  const validator = new FormValidator();
  
  validator
    .required(currentPassword, 'Password')
    .required(newPassword, 'Password')
    .required(confirmPassword, 'Password')
    .password(newPassword, 'Password', 'medium')
    .custom(confirmPassword, 'confirmPassword', (value) => {
      if (newPassword !== confirmPassword) {
        return VALIDATION_MESSAGES.PASSWORD_MISMATCH;
      }
      return null;
    });

  if (!validator.isValid()) {
    const errors = Object.values(validator.getFirstErrors());
    throw new AppError(errors.join(', '), 400, 'VALIDATION_ERROR');
  }

  next();
};


export const validate = (schema) => {
  return (req, _res, next) => {
    try {
      const errors = [];
      
      
      console.log('Validation middleware - req.body:', req.body);
      
      if (!req.body) {
        return next(new Error('Request body is missing'));
      }
      
      for (const [field, rules] of Object.entries(schema)) {
        const value = req.body[field];
        
        console.log(`Validating field: ${field}, value: ${value}, required: ${rules.required}`);
        
        
        if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
          console.log(`Field ${field} is required but missing or empty`);
          errors.push(`${rules.label || field} là bắt buộc`);
          continue;
        }
        
        
        if (!rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
          continue;
        }
        
        
        if (rules.type === 'number') {
          const num = Number(value);
          if (isNaN(num)) {
            errors.push(`${rules.label || field} phải là số`);
            continue;
          }
          
          
          if (rules.min !== undefined && num < rules.min) {
            errors.push(`${rules.label || field} phải lớn hơn hoặc bằng ${rules.min}`);
          }
          if (rules.max !== undefined && num > rules.max) {
            errors.push(`${rules.label || field} không được lớn hơn ${rules.max}`);
          }
        }
        
        
        if (rules.type === 'string' && typeof value !== 'string') {
          errors.push(`${rules.label || field} phải là chuỗi ký tự`);
          continue;
        }
        

        if (typeof value === 'string') {
          if (rules.minLength && value.trim().length < rules.minLength) {
            errors.push(`${rules.label || field} phải có ít nhất ${rules.minLength} ký tự`);
          }
          if (rules.maxLength && value.trim().length > rules.maxLength) {
            errors.push(`${rules.label || field} không được vượt quá ${rules.maxLength} ký tự`);
          }
        }
        
          
        if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value.trim())) {
          errors.push(rules.patternMessage || `${rules.label || field} không đúng định dạng`);
        }
        
        
        if (rules.enum && !rules.enum.includes(value)) {
          errors.push(`${rules.label || field} phải là một trong: ${rules.enum.join(', ')}`);
        }
        
        
        if (rules.custom) {
          const customError = rules.custom(value, req.body);
          if (customError) {
            errors.push(customError);
          }
        }
      }
      
      if (errors.length > 0) {
        throw new AppError('Dữ liệu đầu vào không hợp lệ', 400, 'VALIDATION_ERROR', { validationErrors: errors });
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};


export const validateSach = validate(sachSchema);
export const validateSachUpdate = validate(sachUpdateSchema);
export const validateDocGia = validate(docGiaSchema);
export const validateDocGiaUpdate = validate(docGiaUpdateSchema);
export const validateNhaXuatBan = validate(nhaXuatBanSchema);
export const validateNhaXuatBanUpdate = validate(nhaXuatBanUpdateSchema);
export const validateNhanVien = validate(nhanVienSchema);
export const validateNhanVienUpdate = validate(nhanVienUpdateSchema);
export const validateTheoDoiMuonSach = validate(theoDoiMuonSachSchema);
export const validateReturnBook = validate(returnBookSchema);
export const validateRegister = validate(registerSchema);


export const validateId = (paramName = 'id', pattern = null, label = 'ID') => {
  return (req, _res, next) => {
    try {
      const id = req.params[paramName];
      
      if (!id) {
        throw new AppError(`${label} là bắt buộc`, 400, 'VALIDATION_ERROR');
      }
      
      if (pattern && !pattern.test(id)) {
        throw new AppError(`${label} không đúng định dạng`, 400, 'VALIDATION_ERROR');
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

    
export const validatePagination = (req, _res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    if (isNaN(pageNum) || pageNum < 1) {
      throw new AppError('Trang phải là số nguyên dương', 400, 'VALIDATION_ERROR');
    }
    
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw new AppError('Số lượng bản ghi phải từ 1 đến 100', 400, 'VALIDATION_ERROR');
    }
    
    req.query.page = pageNum;
    req.query.limit = limitNum;
    
    next();
  } catch (error) {
    next(error);
  }
};

export default {
  validateLogin,
  validateChangePassword,
  validate,
  validateSach,
  validateSachUpdate,
  validateDocGia,
  validateDocGiaUpdate,
  validateNhaXuatBan,
  validateNhaXuatBanUpdate,
  validateNhanVien,
  validateNhanVienUpdate,
  validateTheoDoiMuonSach,
  validateReturnBook,
  validateRegister,
  validateId,
  validatePagination
};