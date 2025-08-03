import Sach from '../models/Sach.js';
import { AppError } from '../middlewares/errorHandler.js';

/**
 * Sach Controller - Quản lý sách
 */

// Helper function to build search query
function buildSearchQuery(search) {
  if (!search) return {};
  
  const searchRegex = new RegExp(search.trim(), 'i');
  return {
    $or: [
      { MaSach: searchRegex },
      { TenSach: searchRegex },
      { NguonGoc: searchRegex },
      { NhaXuatBan: searchRegex }
    ]
  };
}

export default {
  /**
   * GET /api/sach - Lấy danh sách sách với pagination và search
   */
  async getAll(req, res) {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'MaSach';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    
    // Build search query
    const searchQuery = buildSearchQuery(search);
    
    // Get total count
    const total = await Sach.countDocuments(searchQuery);
    
    // Get data with pagination
    const data = await Sach.find(searchQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ [sortBy]: sortOrder })
      .lean();
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    res.json({
      success: true,
      message: 'Lấy danh sách sách thành công',
      data: {
        sach: data,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage,
          hasPrevPage
        }
      }
    });
  },

  /**
   * GET /api/sach/:id - Lấy thông tin chi tiết sách
   */
  async getById(req, res) {
    const sach = await Sach.findOne({ MaSach: req.params.id });
    
    if (!sach) {
      throw new AppError('Không tìm thấy sách', 404, 'SACH_NOT_FOUND');
    }
    
    res.json({
      success: true,
      message: 'Lấy thông tin sách thành công',
      data: sach
    });
  },

  /**
   * POST /api/sach - Tạo sách mới
   */
  async create(req, res) {
    // Check if MaSach already exists
    if (req.body.MaSach) {
      const existingSach = await Sach.findOne({ MaSach: req.body.MaSach });
      if (existingSach) {
        throw new AppError('Mã sách đã tồn tại', 400, 'DUPLICATE_MA_SACH');
      }
    }
    
    const sach = new Sach(req.body);
    await sach.save();
    
    res.status(201).json({
      success: true,
      message: 'Tạo sách mới thành công',
      data: sach
    });
  },

  /**
   * PUT /api/sach/:id - Cập nhật thông tin sách
   */
  async update(req, res) {
    const sach = await Sach.findOneAndUpdate(
      { MaSach: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!sach) {
      throw new AppError('Không tìm thấy sách', 404, 'SACH_NOT_FOUND');
    }
    
    res.json({
      success: true,
      message: 'Cập nhật thông tin sách thành công',
      data: sach
    });
  },

  /**
   * DELETE /api/sach/:id - Xóa sách
   */
  async remove(req, res) {
    // TODO: Check if book is currently borrowed before deleting
    // const borrowCount = await TheoDoiMuonSach.countDocuments({
    //   MaSach: req.params.id,
    //   NgayTra: null
    // });
    
    // if (borrowCount > 0) {
    //   throw new AppError('Không thể xóa sách đang được mượn', 400, 'BOOK_IS_BORROWED');
    // }
    
    const sach = await Sach.findOneAndDelete({ MaSach: req.params.id });
    
    if (!sach) {
      throw new AppError('Không tìm thấy sách', 404, 'SACH_NOT_FOUND');
    }
    
    res.json({
      success: true,
      message: 'Xóa sách thành công',
      data: { deletedId: req.params.id }
    });
  },

  /**
   * GET /api/sach/search/:query - Tìm kiếm sách
   */
  async search(req, res) {
    const query = req.params.query;
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 10));
    
    if (!query || query.trim().length === 0) {
      throw new AppError('Từ khóa tìm kiếm không được để trống', 400, 'EMPTY_SEARCH_QUERY');
    }
    
    const sach = await Sach.find(buildSearchQuery(query))
      .limit(limit)
      .select('MaSach TenSach NguonGoc NhaXuatBan SoQuyen')
      .lean();
    
    res.json({
      success: true,
      message: 'Tìm kiếm sách thành công',
      data: sach
    });
  },

  /**
   * GET /api/sach/available - Lấy danh sách sách còn hàng
   */
  async getAvailable(req, res) {
    const sach = await Sach.find({ SoQuyen: { $gt: 0 } })
      .select('MaSach TenSach NguonGoc SoQuyen')
      .sort({ TenSach: 1 });
    
    res.json({
      success: true,
      message: 'Lấy danh sách sách còn hàng thành công',
      data: sach
    });
  }
};