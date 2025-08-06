/**
 * Response optimization utilities
 */

/**
 * Field selection configurations for different endpoints
 */
export const FIELD_SELECTIONS = {
  // Sach fields for different contexts
  sach: {
    list: 'MaSach TenSach DonGia SoQuyen NamXuatBan NhaXuatBan NguonGoc',
    detail: 'MaSach TenSach DonGia SoQuyen NamXuatBan MaNhaXuatBan NhaXuatBan NguonGoc createdAt updatedAt',
    dropdown: 'MaSach TenSach NguonGoc SoQuyen',
    search: 'MaSach TenSach NguonGoc NhaXuatBan'
  },
  
  // DocGia fields for different contexts
  docgia: {
    list: 'MaDocGia HoLot Ten NgaySinh Phai DiaChi DienThoai',
    detail: 'MaDocGia HoLot Ten NgaySinh Phai DiaChi DienThoai createdAt updatedAt',
    dropdown: 'MaDocGia HoLot Ten',
    search: 'MaDocGia HoLot Ten DienThoai'
  },
  
  // NhaXuatBan fields for different contexts
  nhaxuatban: {
    list: 'MaNhaXuatBan TenNhaXuatBan DiaChi DienThoai',
    detail: 'MaNhaXuatBan TenNhaXuatBan DiaChi DienThoai createdAt updatedAt',
    dropdown: 'MaNhaXuatBan TenNhaXuatBan',
    search: 'MaNhaXuatBan TenNhaXuatBan DiaChi'
  },
  
  // NhanVien fields for different contexts
  nhanvien: {
    list: 'MSNV HoTenNV ChucVu TrangThai NgayVaoLam',
    detail: 'MSNV HoTenNV ChucVu DiaChi SoDienThoai Email NgaySinh NgayVaoLam TrangThai Quyen LanDangNhapCuoi',
    dropdown: 'MSNV HoTenNV ChucVu',
    profile: 'MSNV HoTenNV ChucVu DiaChi SoDienThoai Email NgaySinh NgayVaoLam TrangThai Quyen'
  },
  
  // TheoDoiMuonSach fields for different contexts
  theodoimuonsach: {
    list: 'MaTheoDoiMuonSach MaDocGia MaSach NgayMuon NgayHenTra NgayTra TrangThai',
    detail: 'MaTheoDoiMuonSach MaDocGia MaSach NgayMuon NgayHenTra NgayTra TrangThai GhiChu NhanVienMuon NhanVienTra createdAt updatedAt',
    overdue: 'MaTheoDoiMuonSach MaDocGia MaSach NgayMuon NgayHenTra TrangThai',
    statistics: 'MaDocGia MaSach NgayMuon NgayTra TrangThai'
  }
};

/**
 * Population configurations for different models
 */
export const POPULATION_CONFIGS = {
  theodoimuonsach: {
    list: [
      { path: 'MaDocGia', select: 'MaDocGia HoLot Ten' },
      { path: 'MaSach', select: 'MaSach TenSach NguonGoc' }
    ],
    detail: [
      { path: 'MaDocGia', select: 'MaDocGia HoLot Ten DienThoai' },
      { path: 'MaSach', select: 'MaSach TenSach NguonGoc NhaXuatBan' },
      { path: 'NhanVienMuon', select: 'MSNV HoTenNV' },
      { path: 'NhanVienTra', select: 'MSNV HoTenNV' }
    ]
  },
  
  sach: {
    list: [
      { path: 'MaNhaXuatBan', select: 'MaNhaXuatBan TenNhaXuatBan' }
    ]
  }
};

/**
 * Optimize query with field selection and population
 */
export const optimizeQuery = (query, model, context = 'list') => {
  const modelName = model.toLowerCase();
  
  // Apply field selection
  if (FIELD_SELECTIONS[modelName] && FIELD_SELECTIONS[modelName][context]) {
    query = query.select(FIELD_SELECTIONS[modelName][context]);
  }
  
  // Apply population
  if (POPULATION_CONFIGS[modelName] && POPULATION_CONFIGS[modelName][context]) {
    POPULATION_CONFIGS[modelName][context].forEach(popConfig => {
      query = query.populate(popConfig);
    });
  }
  
  return query;
};

/**
 * Optimize pagination response
 */
export const optimizePaginationResponse = (data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
};

/**
 * Remove sensitive fields from response
 */
export const sanitizeResponse = (data, sensitiveFields = ['Password', '__v']) => {
  if (Array.isArray(data)) {
    return data.map(item => sanitizeObject(item, sensitiveFields));
  }
  return sanitizeObject(data, sensitiveFields);
};

/**
 * Remove sensitive fields from a single object
 */
const sanitizeObject = (obj, sensitiveFields) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = { ...obj };
  
  // Handle Mongoose documents
  if (obj.toObject) {
    const plainObj = obj.toObject();
    sensitiveFields.forEach(field => {
      delete plainObj[field];
    });
    return plainObj;
  }
  
  // Handle plain objects
  sensitiveFields.forEach(field => {
    delete sanitized[field];
  });
  
  return sanitized;
};

/**
 * Compress response data by removing null/undefined values
 */
export const compressResponse = (data) => {
  if (Array.isArray(data)) {
    return data.map(item => compressObject(item));
  }
  return compressObject(data);
};

/**
 * Remove null/undefined values from object
 */
const compressObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const compressed = {};
  
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if (value !== null && value !== undefined) {
      if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        const compressedValue = compressObject(value);
        if (Object.keys(compressedValue).length > 0) {
          compressed[key] = compressedValue;
        }
      } else {
        compressed[key] = value;
      }
    }
  });
  
  return compressed;
};

/**
 * Create optimized response with caching headers
 */
export const createOptimizedResponse = (res, data, options = {}) => {
  const {
    statusCode = 200,
    message = 'Success',
    context = 'list',
    model = null,
    enableCompression = true,
    enableSanitization = true,
    cacheMaxAge = 300 // 5 minutes default
  } = options;
  
  let responseData = data;
  
  // Apply sanitization
  if (enableSanitization) {
    responseData = sanitizeResponse(responseData);
  }
  
  // Apply compression
  if (enableCompression) {
    responseData = compressResponse(responseData);
  }
  
  // Set caching headers for GET requests
  if (res.req.method === 'GET') {
    res.set({
      'Cache-Control': `public, max-age=${cacheMaxAge}`,
      'ETag': generateETag(responseData),
      'Last-Modified': new Date().toUTCString()
    });
  }
  
  // Set compression headers
  res.set({
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff'
  });
  
  return res.status(statusCode).json({
    success: true,
    message,
    data: responseData,
    timestamp: new Date().toISOString()
  });
};

/**
 * Generate simple ETag for response caching
 */

import crypto from 'crypto';
const generateETag = (data) => {
  const hash = crypto
    .createHash('md5')
    .update(JSON.stringify(data))
    .digest('hex');
  return `"${hash}"`;
};

/**
 * Middleware to enable response compression
 */
export const enableResponseCompression = (req, res, next) => {
  // Store original json method
  const originalJson = res.json;
  
  // Override json method to apply optimizations
  res.json = function(data) {
    if (req.query.optimize !== 'false') {
      data = compressResponse(data);
    }
    return originalJson.call(this, data);
  };
  
  next();
};

export default {
  FIELD_SELECTIONS,
  POPULATION_CONFIGS,
  optimizeQuery,
  optimizePaginationResponse,
  sanitizeResponse,
  compressResponse,
  createOptimizedResponse,
  enableResponseCompression
};