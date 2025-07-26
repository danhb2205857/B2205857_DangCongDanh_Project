import { NhaXuatBan, Sach } from '../models/index.js';

/**
 * NhaXuatBan Controller - Quản lý nhà xuất bản
 */

// Helper function to build search query
function buildSearchQuery(search) {
  if (!search) return {};
  
  const searchRegex = new RegExp(search.trim(), 'i');
  return {
    $or: [
      { MaNXB: searchRegex },
      { TenNXB: searchRegex },
      { DiaChi: searchRegex },
      { DienThoai: searchRegex },
      { Email: searchRegex }
    ]
  };
}

// Helper function to build filter query
function buildFilterQuery(filters) {
  const query = {};
  
  if (filters.trangThai) {
    query.TrangThai = filters.trangThai;
  }
  
  return query;
}

export default {
  /**
   * GET /api/nhaxuatban - Lấy danh sách nhà xuất bản với pagination và search
   */
  async getAll(req, res) {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
      const search = req.query.search || '';
      const sortBy = req.query.sortBy || 'MaNXB';
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      
      // Build queries
      const searchQuery = buildSearchQuery(search);
      const filterQuery = buildFilterQuery(req.query);
      const combinedQuery = { ...searchQuery, ...filterQuery };
      
      // Get total count
      const total = await NhaXuatBan.countDocuments(combinedQuery);
      
      // Get data with pagination
      const data = await NhaXuatBan.find(combinedQuery)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ [sortBy]: sortOrder })
        .lean();
      
      // Get book count for each publisher
      const dataWithBookCount = await Promise.all(
        data.map(async (nxb) => {
          const bookCount = await Sach.countDocuments({ MaNXB: nxb._id });
          return { ...nxb, bookCount };
        })
      );
      
      // Calculate pagination info
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;
      
      res.json({
        success: true,
        message: 'Lấy danh sách nhà xuất bản thành công',
        data: {
          nhaxuatbans: dataWithBookCount,
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
      
    } catch (error) {
      console.error('Get all NhaXuatBan error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi lấy danh sách nhà xuất bản',
        error: 'GET_ALL_ERROR'
      });
    }
  },

  /**
   * GET /api/nhaxuatban/:id - Lấy thông tin chi tiết nhà xuất bản
   */
  async getById(req, res) {
    try {
      const nhaXuatBan = await NhaXuatBan.findById(req.params.id);
      
      if (!nhaXuatBan) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy nhà xuất bản',
          error: 'NHAXUATBAN_NOT_FOUND'
        });
      }
      
      // Get books published by this publisher
      const books = await Sach.find({ MaNXB: nhaXuatBan._id })
        .select('MaSach TenSach NamXuatBan SoQuyen TrangThai')
        .sort({ NamXuatBan: -1 })
        .limit(10);
      
      // Get statistics
      const bookStats = await Sach.aggregate([
        { $match: { MaNXB: nhaXuatBan._id } },
        {
          $group: {
            _id: null,
            totalBooks: { $sum: 1 },
            totalQuantity: { $sum: '$SoQuyen' },
            avgPrice: { $avg: '$DonGia' }
          }
        }
      ]);
      
      const stats = bookStats[0] || { totalBooks: 0, totalQuantity: 0, avgPrice: 0 };
      
      res.json({
        success: true,
        message: 'Lấy thông tin nhà xuất bản thành công',
        data: {
          nhaXuatBan,
          books,
          statistics: {
            totalBooks: stats.totalBooks,
            totalQuantity: stats.totalQuantity,
            avgPrice: Math.round(stats.avgPrice || 0)
          }
        }
      });
      
    } catch (error) {
      console.error('Get NhaXuatBan by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi lấy thông tin nhà xuất bản',
        error: 'GET_BY_ID_ERROR'
      });
    }
  },

  /**
   * POST /api/nhaxuatban - Tạo nhà xuất bản mới
   */
  async create(req, res) {
    try {
      // Check if MaNXB already exists
      if (req.body.MaNXB) {
        const existingNXB = await NhaXuatBan.findOne({ MaNXB: req.body.MaNXB });
        if (existingNXB) {
          return res.status(400).json({
            success: false,
            message: 'Mã nhà xuất bản đã tồn tại',
            error: 'DUPLICATE_MANXB'
          });
        }
      }
      
      const nhaXuatBan = new NhaXuatBan(req.body);
      await nhaXuatBan.save();
      
      res.status(201).json({
        success: true,
        message: 'Tạo nhà xuất bản mới thành công',
        data: nhaXuatBan
      });
      
    } catch (error) {
      console.error('Create NhaXuatBan error:', error);
      
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: 'Dữ liệu đầu vào không hợp lệ',
          errors,
          error: 'VALIDATION_ERROR'
        });
      }
      
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Mã nhà xuất bản đã tồn tại',
          error: 'DUPLICATE_MANXB'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi tạo nhà xuất bản',
        error: 'CREATE_ERROR'
      });
    }
  },

  /**
   * PUT /api/nhaxuatban/:id - Cập nhật thông tin nhà xuất bản
   */
  async update(req, res) {
    try {
      // Check if trying to update MaNXB to existing value
      if (req.body.MaNXB) {
        const existingNXB = await NhaXuatBan.findOne({ 
          MaNXB: req.body.MaNXB,
          _id: { $ne: req.params.id }
        });
        
        if (existingNXB) {
          return res.status(400).json({
            success: false,
            message: 'Mã nhà xuất bản đã tồn tại',
            error: 'DUPLICATE_MANXB'
          });
        }
      }
      
      const nhaXuatBan = await NhaXuatBan.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      
      if (!nhaXuatBan) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy nhà xuất bản',
          error: 'NHAXUATBAN_NOT_FOUND'
        });
      }
      
      res.json({
        success: true,
        message: 'Cập nhật thông tin nhà xuất bản thành công',
        data: nhaXuatBan
      });
      
    } catch (error) {
      console.error('Update NhaXuatBan error:', error);
      
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: 'Dữ liệu đầu vào không hợp lệ',
          errors,
          error: 'VALIDATION_ERROR'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi cập nhật nhà xuất bản',
        error: 'UPDATE_ERROR'
      });
    }
  },

  /**
   * DELETE /api/nhaxuatban/:id - Xóa nhà xuất bản
   */
  async remove(req, res) {
    try {
      // Check if publisher has books
      const bookCount = await Sach.countDocuments({ MaNXB: req.params.id });
      
      if (bookCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa nhà xuất bản đang có sách',
          error: 'HAS_BOOKS'
        });
      }
      
      const nhaXuatBan = await NhaXuatBan.findByIdAndDelete(req.params.id);
      
      if (!nhaXuatBan) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy nhà xuất bản',
          error: 'NHAXUATBAN_NOT_FOUND'
        });
      }
      
      res.json({
        success: true,
        message: 'Xóa nhà xuất bản thành công',
        data: { deletedId: req.params.id }
      });
      
    } catch (error) {
      console.error('Delete NhaXuatBan error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi xóa nhà xuất bản',
        error: 'DELETE_ERROR'
      });
    }
  },

  /**
   * GET /api/nhaxuatban/active - Lấy danh sách nhà xuất bản đang hoạt động
   */
  async getActive(req, res) {
    try {
      const nhaXuatBans = await NhaXuatBan.find({ TrangThai: 'Hoạt động' })
        .select('_id MaNXB TenNXB DiaChi')
        .sort({ TenNXB: 1 });
      
      res.json({
        success: true,
        message: 'Lấy danh sách nhà xuất bản hoạt động thành công',
        data: nhaXuatBans
      });
      
    } catch (error) {
      console.error('Get active publishers error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi lấy danh sách nhà xuất bản hoạt động',
        error: 'GET_ACTIVE_ERROR'
      });
    }
  }
};
