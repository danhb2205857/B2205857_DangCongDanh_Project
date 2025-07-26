import { Sach, NhaXuatBan, TheoDoiMuonSach } from '../models/index.js';

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
      { TacGia: searchRegex }
    ]
  };
}

// Helper function to build filter query
function buildFilterQuery(filters) {
  const query = {};
  
  if (filters.nhaXuatBan) {
    query.MaNXB = filters.nhaXuatBan;
  }
  
  if (filters.namXuatBanMin || filters.namXuatBanMax) {
    query.NamXuatBan = {};
    if (filters.namXuatBanMin) {
      query.NamXuatBan.$gte = parseInt(filters.namXuatBanMin);
    }
    if (filters.namXuatBanMax) {
      query.NamXuatBan.$lte = parseInt(filters.namXuatBanMax);
    }
  }
  
  if (filters.donGiaMin || filters.donGiaMax) {
    query.DonGia = {};
    if (filters.donGiaMin) {
      query.DonGia.$gte = parseFloat(filters.donGiaMin);
    }
    if (filters.donGiaMax) {
      query.DonGia.$lte = parseFloat(filters.donGiaMax);
    }
  }
  
  if (filters.trangThai) {
    query.TrangThai = filters.trangThai;
  }
  
  if (filters.coSan === 'true') {
    query.SoQuyen = { $gt: 0 };
    query.TrangThai = 'Có sẵn';
  }
  
  return query;
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
      
      // Build queries
      const searchQuery = buildSearchQuery(search);
      const filterQuery = buildFilterQuery(req.query);
      const combinedQuery = { ...searchQuery, ...filterQuery };
      
      // Get total count
      const total = await Sach.countDocuments(combinedQuery);
      
      // Get data with pagination and populate NhaXuatBan
      const data = await Sach.find(combinedQuery)
        .populate('MaNXB', 'MaNXB TenNXB DiaChi')
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
          sachs: data,
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
      const sach = await Sach.findById(req.params.id)
        .populate('MaNXB', 'MaNXB TenNXB DiaChi DienThoai Email');
      
      if (!sach) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy sách',
          error: 'SACH_NOT_FOUND'
        });
      }
      
      // Get borrowing statistics
      const borrowStats = await TheoDoiMuonSach.aggregate([
        { $match: { MaSach: sach._id } },
        {
          $group: {
            _id: null,
            totalBorrows: { $sum: 1 },
            activeBorrows: {
              $sum: {
                $cond: [{ $in: ['$TrangThai', ['muon', 'qua_han']] }, 1, 0]
              }
            }
          }
        }
      ]);
      
      const stats = borrowStats[0] || { totalBorrows: 0, activeBorrows: 0 };
      
      res.json({
        success: true,
        message: 'Lấy thông tin sách thành công',
        data: {
          sach,
          statistics: {
            totalBorrows: stats.totalBorrows,
            activeBorrows: stats.activeBorrows,
            availableQuantity: sach.SoQuyen - stats.activeBorrows
          }
        }
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
            error: 'DUPLICATE_MASACH'
          });
        }
      }
      
      // Validate NhaXuatBan exists
      if (req.body.MaNXB) {
        const nhaXuatBan = await NhaXuatBan.findById(req.body.MaNXB);
        if (!nhaXuatBan) {
          return res.status(400).json({
            success: false,
            message: 'Nhà xuất bản không tồn tại',
            error: 'NHAXUATBAN_NOT_FOUND'
          });
        }
      }
      
      const sach = new Sach(req.body);
      await sach.save();
      
      // Populate NhaXuatBan info
      await sach.populate('MaNXB', 'MaNXB TenNXB');
      
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
          error: 'DUPLICATE_MASACH'
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
      // Check if trying to update MaSach to existing value
      if (req.body.MaSach) {
        const existingSach = await Sach.findOne({ 
          MaSach: req.body.MaSach,
          _id: { $ne: req.params.id }
        });
        
        if (existingSach) {
          return res.status(400).json({
            success: false,
            message: 'Mã sách đã tồn tại',
            error: 'DUPLICATE_MASACH'
          });
        }
      }
      
      // Validate NhaXuatBan exists if provided
      if (req.body.MaNXB) {
        const nhaXuatBan = await NhaXuatBan.findById(req.body.MaNXB);
        if (!nhaXuatBan) {
          return res.status(400).json({
            success: false,
            message: 'Nhà xuất bản không tồn tại',
            error: 'NHAXUATBAN_NOT_FOUND'
          });
        }
      }
      
      const sach = await Sach.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate('MaNXB', 'MaNXB TenNXB');
      
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
      // Check if book has active borrows
      const activeBorrows = await TheoDoiMuonSach.countDocuments({
        MaSach: req.params.id,
        TrangThai: { $in: ['muon', 'qua_han'] }
      });
      
      if (activeBorrows > 0) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa sách đang được mượn',
          error: 'HAS_ACTIVE_BORROWS'
        });
      }
      
      const sach = await Sach.findByIdAndDelete(req.params.id);
      
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
   * GET /api/sach/available - Lấy danh sách sách có sẵn
   */
  async getAvailable(req, res) {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
      const search = req.query.search || '';
      
      const searchQuery = buildSearchQuery(search);
      const availableQuery = {
        ...searchQuery,
        SoQuyen: { $gt: 0 },
        TrangThai: 'Có sẵn'
      };
      
      const total = await Sach.countDocuments(availableQuery);
      
      const data = await Sach.find(availableQuery)
        .populate('MaNXB', 'MaNXB TenNXB')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ TenSach: 1 })
        .lean();
      
      res.json({
        success: true,
        message: 'Lấy danh sách sách có sẵn thành công',
        data: {
          sachs: data,
          pagination: {
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            limit
          }
        }
      });
      
    } catch (error) {
      console.error('Get available books error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi lấy danh sách sách có sẵn',
        error: 'GET_AVAILABLE_ERROR'
      });
    }
  }
};
