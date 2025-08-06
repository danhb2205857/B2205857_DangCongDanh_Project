import NhaXuatBan from '../models/NhaXuatBan.js';
import Sach from '../models/Sach.js';
import { AppError } from '../middlewares/errorHandler.js';

/**
 * NhaXuatBan Controller - Quản lý nhà xuất bản
 */

// Helper function to build search query with improved error handling
function buildSearchQuery(search) {
  console.log('Building NXB search query for:', search);
  
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
      { MaNhaXuatBan: searchRegex },
      { TenNhaXuatBan: searchRegex },
      { DiaChi: searchRegex }
    ]
  };
  
  console.log('NXB search query created successfully');
  return query;
}

export default {
  /**
   * GET /api/nhaxuatban - Lấy danh sách nhà xuất bản với pagination và search
   */
  async getAll(req, res) {
    console.log('=== Starting NhaXuatBan getAll function ===');
    
    // Parse and validate query parameters
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'MaNhaXuatBan';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    
    console.log('Query params:', { page, limit, search, sortBy, sortOrder });
    
    // Build search query
    const searchQuery = buildSearchQuery(search);
    console.log('Search query built:', JSON.stringify(searchQuery));
    
    // Get total count for pagination
    console.log('Getting total count...');
    const total = await NhaXuatBan.countDocuments(searchQuery);
    console.log('Total NXB documents found:', total);
    
    // Build the main query step by step
    console.log('Building main query...');
    const skip = (page - 1) * limit;
    
    // Create query without chaining to avoid issues
    let query = NhaXuatBan.find(searchQuery);
    
    // Apply pagination
    query = query.skip(skip);
    query = query.limit(limit);
    
    // Apply sorting - validate sortBy field first
    const validSortFields = ['MaNhaXuatBan', 'TenNhaXuatBan', 'DiaChi', 'DienThoai'];
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'MaNhaXuatBan';
    query = query.sort({ [finalSortBy]: sortOrder });
    
    console.log('Query configured with:', {
      skip,
      limit,
      sort: { [finalSortBy]: sortOrder }
    });
    
    // Execute query
    console.log('Executing NXB query...');
    const data = await query.lean();
    console.log('Query executed successfully, got', data.length, 'NXB items');
    
    // Add book count for each publisher
    console.log('Adding book counts...');
    for (let nxb of data) {
      nxb.SoSach = await Sach.countDocuments({ MaNhaXuatBan: nxb.MaNhaXuatBan });
    }
    console.log('Book counts added successfully');
    
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
      message: 'Lấy danh sách nhà xuất bản thành công',
      data: {
        nhaxuatban: data,
        pagination: paginationInfo
      }
    });
    
    console.log('=== NhaXuatBan getAll function completed successfully ===');
  },

  /**
   * GET /api/nhaxuatban/:maNXB - Lấy thông tin chi tiết nhà xuất bản
   */
  async getById(req, res) {
    console.log('Getting NXB by MaNXB:', req.params.maNXB);
    
    const nhaXuatBan = await NhaXuatBan.findOne({ MaNhaXuatBan: req.params.maNXB }).lean();
    
    if (!nhaXuatBan) {
      throw new AppError('Không tìm thấy nhà xuất bản', 404, 'NXB_NOT_FOUND');
    }
    
    // Add book count
    nhaXuatBan.SoSach = await Sach.countDocuments({ MaNhaXuatBan: nhaXuatBan.MaNhaXuatBan });
    
    res.json({
      success: true,
      message: 'Lấy thông tin nhà xuất bản thành công',
      data: nhaXuatBan
    });
  },

  /**
   * POST /api/nhaxuatban - Tạo nhà xuất bản mới
   */
  async create(req, res) {
    console.log('Creating new NXB:', req.body);
    
    // Check if MaNhaXuatBan already exists
    if (req.body.MaNhaXuatBan) {
      const existingNXB = await NhaXuatBan.findOne({ MaNhaXuatBan: req.body.MaNhaXuatBan });
      if (existingNXB) {
        throw new AppError('Mã nhà xuất bản đã tồn tại', 400, 'DUPLICATE_MA_NXB');
      }
    }
    
    const nhaXuatBan = new NhaXuatBan(req.body);
    await nhaXuatBan.save();
    
    res.status(201).json({
      success: true,
      message: 'Tạo nhà xuất bản mới thành công',
      data: nhaXuatBan
    });
  },

  /**
   * PUT /api/nhaxuatban/:maNXB - Cập nhật thông tin nhà xuất bản
   */
  async update(req, res) {
    console.log('Updating NXB:', req.params.maNXB, req.body);
    
    const nhaXuatBan = await NhaXuatBan.findOneAndUpdate(
      { MaNhaXuatBan: req.params.maNXB },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!nhaXuatBan) {
      throw new AppError('Không tìm thấy nhà xuất bản', 404, 'NXB_NOT_FOUND');
    }
    
    res.json({
      success: true,
      message: 'Cập nhật thông tin nhà xuất bản thành công',
      data: nhaXuatBan
    });
  },

  /**
   * DELETE /api/nhaxuatban/:maNXB - Xóa nhà xuất bản
   */
  async remove(req, res) {
    console.log('Deleting NXB:', req.params.maNXB);
    
    // Check if publisher has books
    const bookCount = await Sach.countDocuments({ MaNhaXuatBan: req.params.maNXB });
    if (bookCount > 0) {
      throw new AppError('Không thể xóa nhà xuất bản đang có sách', 400, 'NXB_HAS_BOOKS');
    }
    
    const nhaXuatBan = await NhaXuatBan.findOneAndDelete({ MaNhaXuatBan: req.params.maNXB });
    
    if (!nhaXuatBan) {
      throw new AppError('Không tìm thấy nhà xuất bản', 404, 'NXB_NOT_FOUND');
    }
    
    res.json({
      success: true,
      message: 'Xóa nhà xuất bản thành công',
      data: { deletedId: req.params.maNXB }
    });
  },

  /**
   * GET /api/nhaxuatban/search/:query - Tìm kiếm nhà xuất bản
   */
  async search(req, res) {
    const query = req.params.query;
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 10));
    
    console.log('Searching NXB with query:', query, 'limit:', limit);
    
    if (!query || query.trim().length === 0) {
      throw new AppError('Từ khóa tìm kiếm không được để trống', 400, 'EMPTY_SEARCH_QUERY');
    }
    
    const searchQuery = buildSearchQuery(query);
    const nhaXuatBan = await NhaXuatBan.find(searchQuery)
      .limit(limit)
      .select('MaNhaXuatBan TenNhaXuatBan DiaChi DienThoai')
      .lean();
    
    console.log('Search completed, found', nhaXuatBan.length, 'results');
    
    res.json({
      success: true,
      message: 'Tìm kiếm nhà xuất bản thành công',
      data: nhaXuatBan
    });
  },

  /**
   * GET /api/nhaxuatban/:maNXB/sach - Lấy danh sách sách của nhà xuất bản
   */
  async getBooks(req, res) {
    console.log('Getting books for NXB:', req.params.maNXB);
    
    const nhaXuatBan = await NhaXuatBan.findOne({ MaNhaXuatBan: req.params.maNXB }).lean();
    
    if (!nhaXuatBan) {
      throw new AppError('Không tìm thấy nhà xuất bản', 404, 'NXB_NOT_FOUND');
    }
    
    const sach = await Sach.find({ MaNhaXuatBan: req.params.maNXB })
      .select('MaSach TenSach NguonGoc SoQuyen DonGia NamXuatBan')
      .sort({ TenSach: 1 })
      .lean();
    
    console.log('Found', sach.length, 'books for NXB');
    
    res.json({
      success: true,
      message: 'Lấy danh sách sách của nhà xuất bản thành công',
      data: {
        nhaXuatBan,
        sach
      }
    });
  }
};