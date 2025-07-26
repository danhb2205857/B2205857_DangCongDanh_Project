import { DocGia, TheoDoiMuonSach } from '../models/index.js';

/**
 * DocGia Controller - Quản lý độc giả
 */

// Helper function to build search query
function buildSearchQuery(search) {
  if (!search) return {};
  
  const searchRegex = new RegExp(search.trim(), 'i');
  return {
    $or: [
      { MaDocGia: searchRegex },
      { HoLot: searchRegex },
      { Ten: searchRegex },
      { DiaChi: searchRegex },
      { DienThoai: searchRegex }
    ]
  };
}

// Helper function to build filter query
function buildFilterQuery(filters) {
  const query = {};
  
  if (filters.phai) {
    query.Phai = filters.phai;
  }
  
  if (filters.tuoiMin || filters.tuoiMax) {
    const today = new Date();
    
    if (filters.tuoiMax) {
      const minBirthDate = new Date(today.getFullYear() - filters.tuoiMax - 1, today.getMonth(), today.getDate());
      query.NgaySinh = { $gte: minBirthDate };
    }
    
    if (filters.tuoiMin) {
      const maxBirthDate = new Date(today.getFullYear() - filters.tuoiMin, today.getMonth(), today.getDate());
      query.NgaySinh = { ...query.NgaySinh, $lte: maxBirthDate };
    }
  }
  
  return query;
}

export default {
  /**
   * GET /api/docgia - Lấy danh sách độc giả với pagination và search
   */
  async getAll(req, res) {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
      const search = req.query.search || '';
      const sortBy = req.query.sortBy || 'MaDocGia';
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      
      // Build queries
      const searchQuery = buildSearchQuery(search);
      const filterQuery = buildFilterQuery(req.query);
      const combinedQuery = { ...searchQuery, ...filterQuery };
      
      // Get total count
      const total = await DocGia.countDocuments(combinedQuery);
      
      // Get data with pagination
      const data = await DocGia.find(combinedQuery)
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
        message: 'Lấy danh sách độc giả thành công',
        data: {
          docgias: data,
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
      console.error('Get all DocGia error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi lấy danh sách độc giả',
        error: 'GET_ALL_ERROR'
      });
    }
  },

  /**
   * GET /api/docgia/:id - Lấy thông tin chi tiết độc giả
   */
  async getById(req, res) {
    try {
      const docgia = await DocGia.findById(req.params.id);
      
      if (!docgia) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy độc giả',
          error: 'DOCGIA_NOT_FOUND'
        });
      }
      
      // Get borrowing history
      const borrowHistory = await TheoDoiMuonSach.find({ MaDocGia: docgia._id })
        .populate('MaSach', 'MaSach TenSach')
        .populate('NhanVienMuon', 'MSNV HoTenNV')
        .populate('NhanVienTra', 'MSNV HoTenNV')
        .sort({ NgayMuon: -1 })
        .limit(10);
      
      res.json({
        success: true,
        message: 'Lấy thông tin độc giả thành công',
        data: {
          docgia,
          borrowHistory
        }
      });
      
    } catch (error) {
      console.error('Get DocGia by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi lấy thông tin độc giả',
        error: 'GET_BY_ID_ERROR'
      });
    }
  },

  /**
   * POST /api/docgia - Tạo độc giả mới
   */
  async create(req, res) {
    try {
      // Check if MaDocGia already exists
      if (req.body.MaDocGia) {
        const existingDocGia = await DocGia.findOne({ MaDocGia: req.body.MaDocGia });
        if (existingDocGia) {
          return res.status(400).json({
            success: false,
            message: 'Mã độc giả đã tồn tại',
            error: 'DUPLICATE_MADOCGIA'
          });
        }
      }
      
      const docgia = new DocGia(req.body);
      await docgia.save();
      
      res.status(201).json({
        success: true,
        message: 'Tạo độc giả mới thành công',
        data: docgia
      });
      
    } catch (error) {
      console.error('Create DocGia error:', error);
      
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
          message: 'Mã độc giả đã tồn tại',
          error: 'DUPLICATE_MADOCGIA'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi tạo độc giả',
        error: 'CREATE_ERROR'
      });
    }
  },

  /**
   * PUT /api/docgia/:id - Cập nhật thông tin độc giả
   */
  async update(req, res) {
    try {
      // Check if trying to update MaDocGia to existing value
      if (req.body.MaDocGia) {
        const existingDocGia = await DocGia.findOne({ 
          MaDocGia: req.body.MaDocGia,
          _id: { $ne: req.params.id }
        });
        
        if (existingDocGia) {
          return res.status(400).json({
            success: false,
            message: 'Mã độc giả đã tồn tại',
            error: 'DUPLICATE_MADOCGIA'
          });
        }
      }
      
      const docgia = await DocGia.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      
      if (!docgia) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy độc giả',
          error: 'DOCGIA_NOT_FOUND'
        });
      }
      
      res.json({
        success: true,
        message: 'Cập nhật thông tin độc giả thành công',
        data: docgia
      });
      
    } catch (error) {
      console.error('Update DocGia error:', error);
      
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
        message: 'Lỗi hệ thống khi cập nhật độc giả',
        error: 'UPDATE_ERROR'
      });
    }
  },

  /**
   * DELETE /api/docgia/:id - Xóa độc giả
   */
  async remove(req, res) {
    try {
      // Check if reader has active borrows
      const activeBorrows = await TheoDoiMuonSach.countDocuments({
        MaDocGia: req.params.id,
        TrangThai: { $in: ['muon', 'qua_han'] }
      });
      
      if (activeBorrows > 0) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa độc giả đang có sách mượn',
          error: 'HAS_ACTIVE_BORROWS'
        });
      }
      
      const docgia = await DocGia.findByIdAndDelete(req.params.id);
      
      if (!docgia) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy độc giả',
          error: 'DOCGIA_NOT_FOUND'
        });
      }
      
      res.json({
        success: true,
        message: 'Xóa độc giả thành công',
        data: { deletedId: req.params.id }
      });
      
    } catch (error) {
      console.error('Delete DocGia error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi xóa độc giả',
        error: 'DELETE_ERROR'
      });
    }
  },

  /**
   * GET /api/docgia/:id/borrow-history - Lấy lịch sử mượn sách của độc giả
   */
  async getBorrowHistory(req, res) {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
      
      const docgia = await DocGia.findById(req.params.id);
      if (!docgia) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy độc giả',
          error: 'DOCGIA_NOT_FOUND'
        });
      }
      
      const total = await TheoDoiMuonSach.countDocuments({ MaDocGia: req.params.id });
      
      const borrowHistory = await TheoDoiMuonSach.find({ MaDocGia: req.params.id })
        .populate('MaSach', 'MaSach TenSach TacGia')
        .populate('NhanVienMuon', 'MSNV HoTenNV')
        .populate('NhanVienTra', 'MSNV HoTenNV')
        .sort({ NgayMuon: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      
      res.json({
        success: true,
        message: 'Lấy lịch sử mượn sách thành công',
        data: {
          docgia: {
            id: docgia._id,
            MaDocGia: docgia.MaDocGia,
            HoTen: docgia.HoTen
          },
          borrowHistory,
          pagination: {
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            limit
          }
        }
      });
      
    } catch (error) {
      console.error('Get borrow history error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi lấy lịch sử mượn sách',
        error: 'GET_BORROW_HISTORY_ERROR'
      });
    }
  }
};
