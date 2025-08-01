import { NhanVien, TheoDoiMuonSach } from '../models/index.js';

/**
 * NhanVien Controller - Quản lý nhân viên
 */

// Helper function to build search query
function buildSearchQuery(search) {
  if (!search) return {};
  
  const searchRegex = new RegExp(search.trim(), 'i');
  return {
    $or: [
      { MSNV: searchRegex },
      { HoTenNV: searchRegex },
      { ChucVu: searchRegex },
      { DiaChi: searchRegex },
      { SoDienThoai: searchRegex },
      { Email: searchRegex }
    ]
  };
}

// Helper function to build filter query
function buildFilterQuery(filters) {
  const query = {};
  
  if (filters.chucVu) {
    query.ChucVu = filters.chucVu;
  }
  
  if (filters.trangThai) {
    query.TrangThai = filters.trangThai;
  }
  
  return query;
}

export default {
  /**
   * GET /api/nhanvien - Lấy danh sách nhân viên với pagination và search
   */
  async getAll(req, res) {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
      const search = req.query.search || '';
      const sortBy = req.query.sortBy || 'MSNV';
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      
      // Build queries
      const searchQuery = buildSearchQuery(search);
      const filterQuery = buildFilterQuery(req.query);
      const combinedQuery = { ...searchQuery, ...filterQuery };
      
      // Get total count
      const total = await NhanVien.countDocuments(combinedQuery);
      
      // Get data with pagination (exclude password)
      const data = await NhanVien.find(combinedQuery)
        .select('-Password')
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
        message: 'Lấy danh sách nhân viên thành công',
        data: {
          nhanviens: data,
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
      console.error('Get all NhanVien error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi lấy danh sách nhân viên',
        error: 'GET_ALL_ERROR'
      });
    }
  },

  /**
   * GET /api/nhanvien/:id - Lấy thông tin chi tiết nhân viên
   */
  async getById(req, res) {
    try {
      const nhanVien = await NhanVien.findById(req.params.id).select('-Password');
      
      if (!nhanVien) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy nhân viên',
          error: 'NHANVIEN_NOT_FOUND'
        });
      }
      
      // Get work statistics
      const workStats = await TheoDoiMuonSach.aggregate([
        {
          $match: {
            $or: [
              { NhanVienMuon: nhanVien._id },
              { NhanVienTra: nhanVien._id }
            ]
          }
        },
        {
          $group: {
            _id: null,
            totalBorrowsProcessed: {
              $sum: {
                $cond: [{ $eq: ['$NhanVienMuon', nhanVien._id] }, 1, 0]
              }
            },
            totalReturnsProcessed: {
              $sum: {
                $cond: [{ $eq: ['$NhanVienTra', nhanVien._id] }, 1, 0]
              }
            }
          }
        }
      ]);
      
      const stats = workStats[0] || { totalBorrowsProcessed: 0, totalReturnsProcessed: 0 };
      
      res.json({
        success: true,
        message: 'Lấy thông tin nhân viên thành công',
        data: {
          nhanVien,
          statistics: {
            totalBorrowsProcessed: stats.totalBorrowsProcessed,
            totalReturnsProcessed: stats.totalReturnsProcessed,
            totalTransactions: stats.totalBorrowsProcessed + stats.totalReturnsProcessed
          }
        }
      });
      
    } catch (error) {
      console.error('Get NhanVien by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi lấy thông tin nhân viên',
        error: 'GET_BY_ID_ERROR'
      });
    }
  },

  /**
   * POST /api/nhanvien - Tạo nhân viên mới
   */
  async create(req, res) {
    try {
      // Check if MSNV already exists
      if (req.body.MSNV) {
        const existingNV = await NhanVien.findOne({ MSNV: req.body.MSNV });
        if (existingNV) {
          return res.status(400).json({
            success: false,
            message: 'Mã số nhân viên đã tồn tại',
            error: 'DUPLICATE_MSNV'
          });
        }
      }
      
      // Check if Email already exists
      if (req.body.Email) {
        const existingEmail = await NhanVien.findOne({ Email: req.body.Email });
        if (existingEmail) {
          return res.status(400).json({
            success: false,
            message: 'Email đã được sử dụng',
            error: 'DUPLICATE_EMAIL'
          });
        }
      }
      
      const nhanVien = new NhanVien(req.body);
      await nhanVien.save();
      
      // Remove password from response
      const responseData = nhanVien.toObject();
      delete responseData.Password;
      
      res.status(201).json({
        success: true,
        message: 'Tạo nhân viên mới thành công',
        data: responseData
      });
      
    } catch (error) {
      console.error('Create NhanVien error:', error);
      
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
        const field = Object.keys(error.keyPattern)[0];
        return res.status(400).json({
          success: false,
          message: `${field === 'MSNV' ? 'Mã số nhân viên' : 'Email'} đã tồn tại`,
          error: 'DUPLICATE_FIELD'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi tạo nhân viên',
        error: 'CREATE_ERROR'
      });
    }
  },

  /**
   * PUT /api/nhanvien/:id - Cập nhật thông tin nhân viên
   */
  async update(req, res) {
    try {
      // Don't allow password update through this endpoint
      if (req.body.Password) {
        delete req.body.Password;
      }
      
      // Check if trying to update MSNV to existing value
      if (req.body.MSNV) {
        const existingNV = await NhanVien.findOne({ 
          MSNV: req.body.MSNV,
          _id: { $ne: req.params.id }
        });
        
        if (existingNV) {
          return res.status(400).json({
            success: false,
            message: 'Mã số nhân viên đã tồn tại',
            error: 'DUPLICATE_MSNV'
          });
        }
      }
      
      // Check if trying to update Email to existing value
      if (req.body.Email) {
        const existingEmail = await NhanVien.findOne({ 
          Email: req.body.Email,
          _id: { $ne: req.params.id }
        });
        
        if (existingEmail) {
          return res.status(400).json({
            success: false,
            message: 'Email đã được sử dụng',
            error: 'DUPLICATE_EMAIL'
          });
        }
      }
      
      const nhanVien = await NhanVien.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).select('-Password');
      
      if (!nhanVien) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy nhân viên',
          error: 'NHANVIEN_NOT_FOUND'
        });
      }
      
      res.json({
        success: true,
        message: 'Cập nhật thông tin nhân viên thành công',
        data: nhanVien
      });
      
    } catch (error) {
      console.error('Update NhanVien error:', error);
      
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
        message: 'Lỗi hệ thống khi cập nhật nhân viên',
        error: 'UPDATE_ERROR'
      });
    }
  },

  /**
   * DELETE /api/nhanvien/:id - Xóa nhân viên
   */
  async remove(req, res) {
    try {
      // Don't allow deleting current user
      if (req.user && req.user._id.toString() === req.params.id) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa tài khoản của chính mình',
          error: 'CANNOT_DELETE_SELF'
        });
      }
      
      // Check if employee has processed transactions
      const transactionCount = await TheoDoiMuonSach.countDocuments({
        $or: [
          { NhanVienMuon: req.params.id },
          { NhanVienTra: req.params.id }
        ]
      });
      
      if (transactionCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa nhân viên đã xử lý giao dịch',
          error: 'HAS_TRANSACTIONS'
        });
      }
      
      const nhanVien = await NhanVien.findByIdAndDelete(req.params.id);
      
      if (!nhanVien) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy nhân viên',
          error: 'NHANVIEN_NOT_FOUND'
        });
      }
      
      res.json({
        success: true,
        message: 'Xóa nhân viên thành công',
        data: { deletedId: req.params.id }
      });
      
    } catch (error) {
      console.error('Delete NhanVien error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi xóa nhân viên',
        error: 'DELETE_ERROR'
      });
    }
  },

  /**
   * GET /api/nhanvien/active - Lấy danh sách nhân viên đang hoạt động
   */
  async getActive(req, res) {
    try {
      const nhanViens = await NhanVien.find({ TrangThai: 'Đang làm việc' })
        .select('_id MSNV HoTenNV ChucVu')
        .sort({ HoTenNV: 1 });
      
      res.json({
        success: true,
        message: 'Lấy danh sách nhân viên hoạt động thành công',
        data: nhanViens
      });
      
    } catch (error) {
      console.error('Get active employees error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi lấy danh sách nhân viên hoạt động',
        error: 'GET_ACTIVE_ERROR'
      });
    }
  }
};
