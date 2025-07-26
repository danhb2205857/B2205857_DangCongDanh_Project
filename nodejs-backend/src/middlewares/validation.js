/**
 * Request validation middleware
 */

/**
 * Validate login request
 */
export const validateLogin = (req, res, next) => {
  const { msnv, password } = req.body;
  const errors = [];

  if (!msnv) {
    errors.push('Mã số nhân viên là bắt buộc');
  } else if (typeof msnv !== 'string' || msnv.trim().length === 0) {
    errors.push('Mã số nhân viên không hợp lệ');
  }

  if (!password) {
    errors.push('Mật khẩu là bắt buộc');
  } else if (typeof password !== 'string' || password.length < 6) {
    errors.push('Mật khẩu phải có ít nhất 6 ký tự');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu đầu vào không hợp lệ',
      errors,
      error: 'VALIDATION_ERROR'
    });
  }

  // Normalize MSNV
  req.body.msnv = msnv.trim().toUpperCase();
  
  next();
};

/**
 * Validate change password request
 */
export const validateChangePassword = (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const errors = [];

  if (!currentPassword) {
    errors.push('Mật khẩu hiện tại là bắt buộc');
  }

  if (!newPassword) {
    errors.push('Mật khẩu mới là bắt buộc');
  } else if (newPassword.length < 6) {
    errors.push('Mật khẩu mới phải có ít nhất 6 ký tự');
  }

  if (!confirmPassword) {
    errors.push('Xác nhận mật khẩu là bắt buộc');
  } else if (newPassword !== confirmPassword) {
    errors.push('Mật khẩu mới và xác nhận mật khẩu không khớp');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu đầu vào không hợp lệ',
      errors,
      error: 'VALIDATION_ERROR'
    });
  }

  next();
};

/**
 * Generic validation middleware factory
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];
    
    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];
      
      // Check required
      if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        errors.push(`${rules.label || field} là bắt buộc`);
        continue;
      }
      
      // Skip other validations if field is not required and empty
      if (!rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        continue;
      }
      
      // Check type
      if (rules.type && typeof value !== rules.type) {
        errors.push(`${rules.label || field} phải là ${rules.type}`);
        continue;
      }
      
      // Check min length
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`${rules.label || field} phải có ít nhất ${rules.minLength} ký tự`);
      }
      
      // Check max length
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${rules.label || field} không được vượt quá ${rules.maxLength} ký tự`);
      }
      
      // Check pattern
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(rules.patternMessage || `${rules.label || field} không đúng định dạng`);
      }
      
      // Check enum values
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${rules.label || field} phải là một trong: ${rules.enum.join(', ')}`);
      }
      
      // Custom validation
      if (rules.custom) {
        const customError = rules.custom(value, req.body);
        if (customError) {
          errors.push(customError);
        }
      }
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu đầu vào không hợp lệ',
        errors,
        error: 'VALIDATION_ERROR'
      });
    }
    
    next();
  };
};

export default {
  validateLogin,
  validateChangePassword,
  validate
};