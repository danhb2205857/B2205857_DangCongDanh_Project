import DocGia from "../models/DocGia.js";
import { AppError } from '../middlewares/errorHandler.js';
import TheoDoiMuonSach from '../models/TheoDoiMuonSach.js';
import jwt from 'jsonwebtoken';

/**
 * DocGia Controller - Quản lý độc giả
 */

// Helper function to build search query with improved error handling
function buildSearchQuery(search) {
  console.log('Building DocGia search query for:', search);
  
  // Return empty query if no search term
  if (!search || typeof search !== 'string' || search.trim().length === 0) {
    console.log('No valid search term, returning empty query');
    return {};
  }
  
  // Clean and validate search term
  const searchTerm = search.trim();
  
  // Escape special regex characters to prevent regex injection
  const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Create case-insensitive regex
  const searchRegex = new RegExp(escapedSearchTerm, 'i');
  
  const query = {
    $or: [
      { MaDocGia: searchRegex },
      { HoLot: searchRegex },
      { Ten: searchRegex },
      { DiaChi: searchRegex },
      { DienThoai: searchRegex },
      { email: searchRegex }
    ]
  };
  
  console.log('DocGia search query created successfully');
  return query;
}

export default {
  /**
   * GET /api/docgia - Lấy danh sách độc giả với pagination và search
   */
  async getAll(req, res) {
    console.log('=== Starting DocGia getAll function ===');
    
    // Parse and validate query parameters
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'MaDocGia';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    
    console.log('Query params:', { page, limit, search, sortBy, sortOrder });
    
    // Build search query
    const searchQuery = buildSearchQuery(search);
    console.log('Search query built:', JSON.stringify(searchQuery));
    
    // Get total count for pagination
    console.log('Getting total count...');
    const total = await DocGia.countDocuments(searchQuery);
    console.log('Total DocGia documents found:', total);
    
    // Build the main query step by step
    console.log('Building main query...');
    const skip = (page - 1) * limit;
    
    // Create query without chaining to avoid issues
    let query = DocGia.find(searchQuery);
    
    // Apply pagination
    query = query.skip(skip);
    query = query.limit(limit);
    
    // Apply sorting - validate sortBy field first
    const validSortFields = ['MaDocGia', 'HoLot', 'Ten', 'DiaChi', 'DienThoai'];
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'MaDocGia';
    query = query.sort({ [finalSortBy]: sortOrder });
    
    console.log('Query configured with:', {
      skip,
      limit,
      sort: { [finalSortBy]: sortOrder }
    });
    
    // Execute query
    console.log('Executing DocGia query...');
    const data = await query.lean();
    console.log('Query executed successfully, got', data.length, 'DocGia items');
    
    // Build pagination response
    const totalPages = Math.ceil(total / limit);
    const paginationInfo = {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };
    
    console.log('Pagination info:', paginationInfo);
    
    // Send response
    res.json({
      success: true,
      message: 'Lấy danh sách độc giả thành công',
      data: {
        docgia: data,
        pagination: paginationInfo
      }
    });
    
    console.log('=== DocGia getAll function completed successfully ===');
  },

  /**
   * GET /api/docgia/:id - Lấy thông tin chi tiết độc giả
   */
  async getById(req, res) {
    console.log('Getting DocGia by MaDocGia:', req.params.maDocGia);
    
    const docGia = await DocGia.findOne({ MaDocGia: req.params.maDocGia }).lean();
    
    if (!docGia) {
      throw new AppError('Không tìm thấy độc giả', 404, 'DOCGIA_NOT_FOUND');
    }
    
    res.json({
      success: true,
      message: 'Lấy thông tin độc giả thành công',
      data: docGia
    });
  },

  /**
   * POST /api/docgia - Tạo độc giả mới
   */
  async create(req, res) {
    console.log('Creating new DocGia:', req.body);
    
    // Check if MaDocGia already exists
    if (req.body.MaDocGia) {
      const existingDocGia = await DocGia.findOne({ MaDocGia: req.body.MaDocGia });
      if (existingDocGia) {
        throw new AppError('Mã độc giả đã tồn tại', 400, 'DUPLICATE_MA_DOCGIA');
      }
    }
    
    // Check if DienThoai already exists
    if (req.body.DienThoai) {
      const existingPhone = await DocGia.findOne({ DienThoai: req.body.DienThoai });
      if (existingPhone) {
        throw new AppError('Số điện thoại đã được sử dụng', 400, 'DUPLICATE_PHONE');
      }
    }
    
    // Check if email already exists
    if (req.body.email) {
      const existingEmail = await DocGia.findOne({ email: req.body.email.toLowerCase() });
      if (existingEmail) {
        throw new AppError('Email đã được sử dụng', 400, 'DUPLICATE_EMAIL');
      }
    }
    
    const docGia = new DocGia(req.body);
    await docGia.save();
    
    res.status(201).json({
      success: true,
      message: 'Tạo độc giả mới thành công',
      data: docGia
    });
  },

  /**
   * PUT /api/docgia/:id - Cập nhật thông tin độc giả
   */
  async update(req, res) {
    console.log('Updating DocGia:', req.params.id, req.body);
    
    // Check if trying to update DienThoai to existing value
    if (req.body.DienThoai) {
      const existingPhone = await DocGia.findOne({
        DienThoai: req.body.DienThoai,
        MaDocGia: { $ne: req.params.id }
      });
      
      if (existingPhone) {
        throw new AppError('Số điện thoại đã được sử dụng', 400, 'DUPLICATE_PHONE');
      }
    }
    
    const docGia = await DocGia.findOneAndUpdate(
      { MaDocGia: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!docGia) {
      throw new AppError('Không tìm thấy độc giả', 404, 'DOCGIA_NOT_FOUND');
    }
    
    res.json({
      success: true,
      message: 'Cập nhật thông tin độc giả thành công',
      data: docGia
    });
  },

  /**
   * DELETE /api/docgia/:id - Xóa độc giả
   */
  async remove(req, res) {
    console.log('Deleting DocGia:', req.params.id);
    
    // Check if reader has borrowed books
    const borrowCount = await TheoDoiMuonSach.countDocuments({
      MaDocGia: req.params.id,
      NgayTra: null
    });
    
    if (borrowCount > 0) {
      throw new AppError('Không thể xóa độc giả đang mượn sách', 400, 'HAS_BORROWED_BOOKS');
    }
    
    const docGia = await DocGia.findOneAndDelete({ MaDocGia: req.params.id });
    
    if (!docGia) {
      throw new AppError('Không tìm thấy độc giả', 404, 'DOCGIA_NOT_FOUND');
    }
    
    res.json({
      success: true,
      message: 'Xóa độc giả thành công',
      data: { deletedId: req.params.id }
    });
  },

  /**
   * GET /api/docgia/search/:query - Tìm kiếm độc giả
   */
  async search(req, res) {
    console.log('Searching DocGia with query:', req.params.query);
    
    const query = req.params.query;
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 10));
    
    if (!query || query.trim().length === 0) {
      throw new AppError('Từ khóa tìm kiếm không được để trống', 400, 'EMPTY_SEARCH_QUERY');
    }
    
    const searchQuery = buildSearchQuery(query);
    const docgia = await DocGia.find(searchQuery)
      .limit(limit)
      .select('MaDocGia HoLot Ten DiaChi DienThoai')
      .lean();
    
    console.log('Search completed, found', docgia.length, 'results');
    
    res.json({
      success: true,
      message: 'Tìm kiếm độc giả thành công',
      data: docgia
    });
  },

  /**
   * POST /api/docgia/register - Đăng ký tài khoản độc giả
   */
  async register(req, res) {
    console.log('Registering new DocGia account:', req.body.email);
    
    const { email, password, MaDocGia, HoLot, Ten, NgaySinh, Phai, DiaChi, DienThoai, avatar } = req.body;
    
    // Check if email already exists
    const existingEmail = await DocGia.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      throw new AppError('Email đã được sử dụng', 400, 'DUPLICATE_EMAIL');
    }
    
    // Check if MaDocGia already exists
    if (MaDocGia) {
      const existingDocGia = await DocGia.findOne({ MaDocGia });
      if (existingDocGia) {
        throw new AppError('Mã độc giả đã tồn tại', 400, 'DUPLICATE_MA_DOCGIA');
      }
    }
    
    // Check if DienThoai already exists
    if (DienThoai) {
      const existingPhone = await DocGia.findOne({ DienThoai });
      if (existingPhone) {
        throw new AppError('Số điện thoại đã được sử dụng', 400, 'DUPLICATE_PHONE');
      }
    }
    
    // Create new reader account
    const docGia = new DocGia({
      email,
      password,
      MaDocGia,
      HoLot,
      Ten,
      NgaySinh,
      Phai,
      DiaChi,
      DienThoai,
      avatar
    });
    
    await docGia.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: docGia._id, 
        MaDocGia: docGia.MaDocGia,
        email: docGia.email,
        role: 'reader'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    // Remove password from response
    const docGiaResponse = docGia.toObject();
    delete docGiaResponse.password;
    
    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công',
      data: {
        docGia: docGiaResponse,
        token
      }
    });
  },

  /**
   * POST /api/docgia/login - Đăng nhập tài khoản độc giả
   */
  async login(req, res) {
    console.log('DocGia login attempt:', req.body.email);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      throw new AppError('Email và mật khẩu là bắt buộc', 400, 'MISSING_CREDENTIALS');
    }
    
    // Find user by email and include password
    const docGia = await DocGia.findByEmail(email);
    
    if (!docGia) {
      throw new AppError('Email hoặc mật khẩu không đúng', 401, 'INVALID_CREDENTIALS');
    }
    
    // Check if account is active
    if (!docGia.isActive) {
      throw new AppError('Tài khoản đã bị vô hiệu hóa', 401, 'ACCOUNT_DISABLED');
    }
    
    // Check password
    const isPasswordValid = await docGia.comparePassword(password);
    
    if (!isPasswordValid) {
      throw new AppError('Email hoặc mật khẩu không đúng', 401, 'INVALID_CREDENTIALS');
    }
    
    // Update last login
    await docGia.updateLastLogin();
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: docGia._id, 
        MaDocGia: docGia.MaDocGia,
        email: docGia.email,
        role: 'reader'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    // Remove password from response
    const docGiaResponse = docGia.toObject();
    delete docGiaResponse.password;
    
    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        docGia: docGiaResponse,
        token
      }
    });
  },

  /**
   * GET /api/docgia/profile - Lấy thông tin profile độc giả
   */
  async getProfile(req, res) {
    console.log('Getting DocGia profile:', req.user.id);
    
    const docGia = await DocGia.findById(req.user.id).select('-password');
    
    if (!docGia) {
      throw new AppError('Không tìm thấy thông tin độc giả', 404, 'DOCGIA_NOT_FOUND');
    }
    
    res.json({
      success: true,
      message: 'Lấy thông tin profile thành công',
      data: docGia
    });
  },

  /**
   * PUT /api/docgia/profile - Cập nhật profile độc giả
   */
  async updateProfile(req, res) {
    console.log('Updating DocGia profile:', req.user.id);
    
    const allowedUpdates = ['HoLot', 'Ten', 'NgaySinh', 'Phai', 'DiaChi', 'DienThoai', 'avatar'];
    const updates = {};
    
    // Only allow specific fields to be updated
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });
    
    // Check if trying to update DienThoai to existing value
    if (updates.DienThoai) {
      const existingPhone = await DocGia.findOne({
        DienThoai: updates.DienThoai,
        _id: { $ne: req.user.id }
      });
      
      if (existingPhone) {
        throw new AppError('Số điện thoại đã được sử dụng', 400, 'DUPLICATE_PHONE');
      }
    }
    
    const docGia = await DocGia.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!docGia) {
      throw new AppError('Không tìm thấy thông tin độc giả', 404, 'DOCGIA_NOT_FOUND');
    }
    
    res.json({
      success: true,
      message: 'Cập nhật profile thành công',
      data: docGia
    });
  },

  /**
   * PUT /api/docgia/change-password - Đổi mật khẩu
   */
  async changePassword(req, res) {
    console.log('Changing password for DocGia:', req.user.id);
    
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      throw new AppError('Mật khẩu hiện tại và mật khẩu mới là bắt buộc', 400, 'MISSING_PASSWORDS');
    }
    
    if (newPassword.length < 6) {
      throw new AppError('Mật khẩu mới phải có ít nhất 6 ký tự', 400, 'PASSWORD_TOO_SHORT');
    }
    
    // Find user with password
    const docGia = await DocGia.findById(req.user.id).select('+password');
    
    if (!docGia) {
      throw new AppError('Không tìm thấy thông tin độc giả', 404, 'DOCGIA_NOT_FOUND');
    }
    
    // Check current password
    const isCurrentPasswordValid = await docGia.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      throw new AppError('Mật khẩu hiện tại không đúng', 401, 'INVALID_CURRENT_PASSWORD');
    }
    
    // Update password
    docGia.password = newPassword;
    await docGia.save();
    
    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });
  }
};