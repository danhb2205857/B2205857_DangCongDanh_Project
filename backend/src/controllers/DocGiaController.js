import DocGia from "../models/DocGia.js";
import { AppError } from '../middlewares/errorHandler.js';
import TheoDoiMuonSach from '../models/TheoDoiMuonSach.js';

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
      { DienThoai: searchRegex }
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
  }
};