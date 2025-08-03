import NhaXuatBan from '../models/NhaXuatBan.js';
import Sach from '../models/Sach.js';
import { AppError } from '../middlewares/errorHandler.js';

/**
 * NhaXuatBan Controller - Quản lý nhà xuất bản
 */

// Helper function to build search query
function buildSearchQuery(search) {
  if (!search) return {};
  
  const searchRegex = new RegExp(search.trim(), 'i');
  return {
    $or: [
      { MaNhaXuatBan: searchRegex },
      { TenNhaXuatBan: searchRegex },
      { DiaChi: searchRegex }
    ]
  };
}

export default {
  /**
   * GET /api/nhaxuatban - Lấy danh sách nhà xuất bản với pagination và search
   */
  async getAll(req, res) {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'MaNhaXuatBan';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    
    // Build search query
    const searchQuery = buildSearchQuery(search);
    
    // Get total count
    const total = await NhaXuatBan.countDocuments(searchQuery);
    
    // Get data with pagination
    const data = await NhaXuatBan.find(searchQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ [sortBy]: sortOrder })
      .lean();
    
    // Add book count for each publisher
    for (let nxb of data) {
      nxb.SoSach = await Sach.countDocuments({ MaNhaXuatBan: nxb.MaNhaXuatBan });
    }
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    res.json({
      success: true,
      message: 'Lấy danh sách nhà xuất bản thành công',
      data: {
        nhaxuatban: data,
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
   * GET /api/nhaxuatban/:id - Lấy thông tin chi tiết nhà xuất bản
   */
  async getById(req, res) {
    const nhaXuatBan = await NhaXuatBan.findOne({ MaNhaXuatBan: req.params.id });
    
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
   * PUT /api/nhaxuatban/:id - Cập nhật thông tin nhà xuất bản
   */
  async update(req, res) {
    const nhaXuatBan = await NhaXuatBan.findOneAndUpdate(
      { MaNhaXuatBan: req.params.id },
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
   * DELETE /api/nhaxuatban/:id - Xóa nhà xuất bản
   */
  async remove(req, res) {
    // Check if publisher has books
    const bookCount = await Sach.countDocuments({ MaNhaXuatBan: req.params.id });
    if (bookCount > 0) {
      throw new AppError('Không thể xóa nhà xuất bản đang có sách', 400, 'NXB_HAS_BOOKS');
    }
    
    const nhaXuatBan = await NhaXuatBan.findOneAndDelete({ MaNhaXuatBan: req.params.id });
    
    if (!nhaXuatBan) {
      throw new AppError('Không tìm thấy nhà xuất bản', 404, 'NXB_NOT_FOUND');
    }
    
    res.json({
      success: true,
      message: 'Xóa nhà xuất bản thành công',
      data: { deletedId: req.params.id }
    });
  },

  /**
   * GET /api/nhaxuatban/search/:query - Tìm kiếm nhà xuất bản
   */
  async search(req, res) {
    const query = req.params.query;
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 10));
    
    if (!query || query.trim().length === 0) {
      throw new AppError('Từ khóa tìm kiếm không được để trống', 400, 'EMPTY_SEARCH_QUERY');
    }
    
    const nhaXuatBan = await NhaXuatBan.find(buildSearchQuery(query))
      .limit(limit)
      .select('MaNhaXuatBan TenNhaXuatBan DiaChi DienThoai')
      .lean();
    
    res.json({
      success: true,
      message: 'Tìm kiếm nhà xuất bản thành công',
      data: nhaXuatBan
    });
  },

  /**
   * GET /api/nhaxuatban/:id/sach - Lấy danh sách sách của nhà xuất bản
   */
  async getBooks(req, res) {
    const nhaXuatBan = await NhaXuatBan.findOne({ MaNhaXuatBan: req.params.id });
    
    if (!nhaXuatBan) {
      throw new AppError('Không tìm thấy nhà xuất bản', 404, 'NXB_NOT_FOUND');
    }
    
    const sach = await Sach.find({ MaNhaXuatBan: req.params.id })
      .select('MaSach TenSach NguonGoc SoQuyen DonGia NamXuatBan')
      .sort({ TenSach: 1 });
    
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