import Sach from '../models/Sach.js';

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
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
      const search = req.query.search || '';
      const sortBy = req.query.sortBy || 'MaSach';
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      
      // Build search query
      const searchQuery = buildSearchQuery(search);
      
      // Get total count
      let total = await Sach.countDocuments(searchQuery);
      
      // Get data with pagination
      let data = await Sach.find(searchQuery)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ [sortBy]: sortOrder })
        .lean();
      
      // If no data found, return mock data for testing
      if (data.length === 0 && total === 0) {
        data = [
          {
            MaSach: 'S001',
            TenSach: 'Lập trình JavaScript cơ bản',
            DonGia: 150000,
            SoQuyen: 10,
            NamXuatBan: 2023,
            MaNhaXuatBan: 'NXB001',
            NhaXuatBan: 'NXB Giáo dục',
            NguonGoc: 'Nguyễn Văn A'
          },
          {
            MaSach: 'S002',
            TenSach: 'Cơ sở dữ liệu nâng cao',
            DonGia: 200000,
            SoQuyen: 8,
            NamXuatBan: 2023,
            MaNhaXuatBan: 'NXB002',
            NhaXuatBan: 'NXB Khoa học',
            NguonGoc: 'Trần Thị B'
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
      
    } catch (error) {
      console.error('Get all Sach error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi lấy danh sách sách',
        error: 'GET_ALL_ERROR'
      });
    }
  },

  /**
   * GET /api/sach/:id - Lấy thông tin chi tiết sách
   */
  async getById(req, res) {
    try {
      const sach = await Sach.findOne({ MaSach: req.params.id });
      
      if (!sach) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy sách',
          error: 'SACH_NOT_FOUND'
        });
      }
      
      res.json({
        success: true,
        message: 'Lấy thông tin sách thành công',
        data: sach
      });
      
    } catch (error) {
      console.error('Get Sach by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi lấy thông tin sách',
        error: 'GET_BY_ID_ERROR'
      });
    }
  },

  /**
   * POST /api/sach - Tạo sách mới
   */
  async create(req, res) {
    try {
      // Check if MaSach already exists
      if (req.body.MaSach) {
        const existingSach = await Sach.findOne({ MaSach: req.body.MaSach });
        if (existingSach) {
          return res.status(400).json({
            success: false,
            message: 'Mã sách đã tồn tại',
            error: 'DUPLICATE_MA_SACH'
          });
        }
      }
      
      const sach = new Sach(req.body);
      await sach.save();
      
      res.status(201).json({
        success: true,
        message: 'Tạo sách mới thành công',
        data: sach
      });
      
    } catch (error) {
      console.error('Create Sach error:', error);
      
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
          message: 'Mã sách đã tồn tại',
          error: 'DUPLICATE_FIELD'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi tạo sách',
        error: 'CREATE_ERROR'
      });
    }
  },

  /**
   * PUT /api/sach/:id - Cập nhật thông tin sách
   */
  async update(req, res) {
    try {
      const sach = await Sach.findOneAndUpdate(
        { MaSach: req.params.id },
        req.body,
        { new: true, runValidators: true }
      );
      
      if (!sach) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy sách',
          error: 'SACH_NOT_FOUND'
        });
      }
      
      res.json({
        success: true,
        message: 'Cập nhật thông tin sách thành công',
        data: sach
      });
      
    } catch (error) {
      console.error('Update Sach error:', error);
      
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
        message: 'Lỗi hệ thống khi cập nhật sách',
        error: 'UPDATE_ERROR'
      });
    }
  },

  /**
   * DELETE /api/sach/:id - Xóa sách
   */
  async remove(req, res) {
    try {
      // TODO: Check if book is currently borrowed before deleting
      // const borrowCount = await TheoDoiMuonSach.countDocuments({
      //   MaSach: req.params.id,
      //   NgayTra: null
      // });
      
      // if (borrowCount > 0) {
      //   return res.status(400).json({
      //     success: false,
      //     message: 'Không thể xóa sách đang được mượn',
      //     error: 'BOOK_IS_BORROWED'
      //   });
      // }
      
      const sach = await Sach.findOneAndDelete({ MaSach: req.params.id });
      
      if (!sach) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy sách',
          error: 'SACH_NOT_FOUND'
        });
      }
      
      res.json({
        success: true,
        message: 'Xóa sách thành công',
        data: { deletedId: req.params.id }
      });
      
    } catch (error) {
      console.error('Delete Sach error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi xóa sách',
        error: 'DELETE_ERROR'
      });
    }
  },

  /**
   * GET /api/sach/search/:query - Tìm kiếm sách
   */
  async search(req, res) {
    try {
      const query = req.params.query;
      const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 10));
      
      const sach = await Sach.search(query)
        .limit(limit)
        .select('MaSach TenSach NguonGoc NhaXuatBan SoQuyen')
        .lean();
      
      res.json({
        success: true,
        message: 'Tìm kiếm sách thành công',
        data: sach
      });
      
    } catch (error) {
      console.error('Search Sach error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi tìm kiếm sách',
        error: 'SEARCH_ERROR'
      });
    }
  },

  /**
   * GET /api/sach/available - Lấy danh sách sách còn hàng
   */
  async getAvailable(req, res) {
    try {
      const sach = await Sach.find({ SoQuyen: { $gt: 0 } })
        .select('MaSach TenSach NguonGoc SoQuyen')
        .sort({ TenSach: 1 });
      
      res.json({
        success: true,
        message: 'Lấy danh sách sách còn hàng thành công',
        data: sach
      });
      
    } catch (error) {
      console.error('Get available books error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi lấy danh sách sách còn hàng',
        error: 'GET_AVAILABLE_ERROR'
      });
    }
  }
};