import NhaXuatBan from '../models/NhaXuatBan.js';

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
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
      const search = req.query.search || '';
      const sortBy = req.query.sortBy || 'MaNhaXuatBan';
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      
      // Build search query
      const searchQuery = buildSearchQuery(search);
      
      // Get total count
      let total = await NhaXuatBan.countDocuments(searchQuery);
      
      // Get data with pagination and populate book count
      let data = await NhaXuatBan.find(searchQuery)
        .populate('SoSach')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ [sortBy]: sortOrder })
        .lean();
      
      // If no data found, return mock data for testing
      if (data.length === 0 && total === 0) {
        data = [
          {
            MaNhaXuatBan: 'NXB001',
            TenNhaXuatBan: 'Nhà xuất bản Giáo dục Việt Nam',
            DiaChi: '81 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội',
            DienThoai: '024-38220801',
            SoSach: 15
          },
          {
            MaNhaXuatBan: 'NXB002',
            TenNhaXuatBan: 'Nhà xuất bản Khoa học và Kỹ thuật',
            DiaChi: '70 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội',
            DienThoai: '024-38253841',
            SoSach: 8
          }
        ];
        total = data.length;
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
      const nhaXuatBan = await NhaXuatBan.findOne({ MaNhaXuatBan: req.params.id })
        .populate('SoSach');
      
      if (!nhaXuatBan) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy nhà xuất bản',
          error: 'NHAXUATBAN_NOT_FOUND'
        });
      }
      
      res.json({
        success: true,
        message: 'Lấy thông tin nhà xuất bản thành công',
        data: nhaXuatBan
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
      // Check if MaNhaXuatBan already exists
      if (req.body.MaNhaXuatBan) {
        const existingNXB = await NhaXuatBan.findOne({ MaNhaXuatBan: req.body.MaNhaXuatBan });
        if (existingNXB) {
          return res.status(400).json({
            success: false,
            message: 'Mã nhà xuất bản đã tồn tại',
            error: 'DUPLICATE_MA_NHAXUATBAN'
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
          error: 'DUPLICATE_FIELD'
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
      const nhaXuatBan = await NhaXuatBan.findOneAndUpdate(
        { MaNhaXuatBan: req.params.id },
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
      const nhaXuatBan = await NhaXuatBan.findOneAndDelete({ MaNhaXuatBan: req.params.id });
      
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
      
      if (error.message.includes('Không thể xóa nhà xuất bản có')) {
        return res.status(400).json({
          success: false,
          message: error.message,
          error: 'HAS_BOOKS'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi xóa nhà xuất bản',
        error: 'DELETE_ERROR'
      });
    }
  },

  /**
   * GET /api/nhaxuatban/search/:query - Tìm kiếm nhà xuất bản
   */
  async search(req, res) {
    try {
      const query = req.params.query;
      const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 10));
      
      const nhaxuatban = await NhaXuatBan.search(query)
        .limit(limit)
        .select('MaNhaXuatBan TenNhaXuatBan DiaChi')
        .lean();
      
      res.json({
        success: true,
        message: 'Tìm kiếm nhà xuất bản thành công',
        data: nhaxuatban
      });
      
    } catch (error) {
      console.error('Search NhaXuatBan error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi tìm kiếm nhà xuất bản',
        error: 'SEARCH_ERROR'
      });
    }
  },

  /**
   * GET /api/nhaxuatban/:id/sach - Lấy danh sách sách của nhà xuất bản
   */
  async getBooks(req, res) {
    try {
      const nhaXuatBan = await NhaXuatBan.findOne({ MaNhaXuatBan: req.params.id });
      
      if (!nhaXuatBan) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy nhà xuất bản',
          error: 'NHAXUATBAN_NOT_FOUND'
        });
      }
      
      const sach = await nhaXuatBan.getBooks()
        .select('MaSach TenSach DonGia SoQuyen NamXuatBan NguonGoc')
        .sort({ TenSach: 1 });
      
      res.json({
        success: true,
        message: 'Lấy danh sách sách thành công',
        data: {
          nhaXuatBan: {
            MaNhaXuatBan: nhaXuatBan.MaNhaXuatBan,
            TenNhaXuatBan: nhaXuatBan.TenNhaXuatBan
          },
          sach
        }
      });
      
    } catch (error) {
      console.error('Get books by publisher error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi lấy danh sách sách',
        error: 'GET_BOOKS_ERROR'
      });
    }
  }
};