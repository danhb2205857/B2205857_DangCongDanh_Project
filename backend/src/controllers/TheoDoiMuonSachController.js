import TheoDoiMuonSach from '../models/TheoDoiMuonSach.js';
import DocGia from '../models/DocGia.js';
import Sach from '../models/Sach.js';

/**
 * TheoDoiMuonSach Controller - Quản lý mượn trả sách
 */

// Helper function to build search query
function buildSearchQuery(search) {
  if (!search) return {};
  
  const searchRegex = new RegExp(search.trim(), 'i');
  return {
    $or: [
      { MaTheoDoiMuonSach: searchRegex },
      { MaDocGia: searchRegex },
      { MaSach: searchRegex }
    ]
  };
}

// Helper function to generate next MaTheoDoiMuonSach
async function generateNextId() {
  const lastRecord = await TheoDoiMuonSach.findOne()
    .sort({ MaTheoDoiMuonSach: -1 })
    .select('MaTheoDoiMuonSach');
  
  if (!lastRecord) {
    return 'TD001';
  }
  
  const lastNumber = parseInt(lastRecord.MaTheoDoiMuonSach.substring(2));
  const nextNumber = lastNumber + 1;
  return `TD${nextNumber.toString().padStart(3, '0')}`;
}

export default {
  /**
   * GET /api/theodoimuonsach - Lấy danh sách theo dõi mượn sách
   */
  async getAll(req, res) {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
      const search = req.query.search || '';
      const status = req.query.status || '';
      const sortBy = req.query.sortBy || 'NgayMuon';
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      
      // Build search query
      let searchQuery = buildSearchQuery(search);
      
      // Add status filter
      if (status) {
        searchQuery.TrangThai = status;
      }
      
      // Get total count
      let total = await TheoDoiMuonSach.countDocuments(searchQuery);
      
      // Get data with pagination and populate references
      let data = await TheoDoiMuonSach.find(searchQuery)
        .populate('MaDocGia', 'HoLot Ten DienThoai')
        .populate('MaSach', 'TenSach NguonGoc SoQuyen')
        .populate('NhanVienMuon', 'HoTenNV')
        .populate('NhanVienTra', 'HoTenNV')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ [sortBy]: sortOrder })
        .lean();
      
      // If no data found, return mock data for testing
      if (data.length === 0 && total === 0) {
        data = [
          {
            MaTheoDoiMuonSach: 'TD001',
            MaDocGia: 'DG001',
            MaSach: 'S001',
            NgayMuon: new Date('2024-01-15'),
            NgayHenTra: new Date('2024-01-29'),
            NgayTra: new Date('2024-01-28'),
            TrangThai: 'Đã trả',
            GhiChu: '',
            NhanVienMuon: 'NV001',
            NhanVienTra: 'NV001',
            DocGia: { HoLot: 'Nguyễn Văn', Ten: 'An', DienThoai: '0901234567' },
            Sach: { TenSach: 'Lập trình JavaScript', NguonGoc: 'Nguyễn Văn A', SoQuyen: 10 }
          },
          {
            MaTheoDoiMuonSach: 'TD002',
            MaDocGia: 'DG002',
            MaSach: 'S002',
            NgayMuon: new Date('2024-01-20'),
            NgayHenTra: new Date('2024-02-03'),
            NgayTra: null,
            TrangThai: 'Đang mượn',
            GhiChu: '',
            NhanVienMuon: 'NV001',
            NhanVienTra: null,
            DocGia: { HoLot: 'Trần Thị', Ten: 'Bình', DienThoai: '0987654321' },
            Sach: { TenSach: 'Cơ sở dữ liệu', NguonGoc: 'Trần Thị B', SoQuyen: 8 }
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
        message: 'Lấy danh sách theo dõi mượn sách thành công',
        data: {
          theodoimuonsach: data,
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
      console.error('Get all TheoDoiMuonSach error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi lấy danh sách theo dõi mượn sách',
        error: 'GET_ALL_ERROR'
      });
    }
  },

  /**
   * GET /api/theodoimuonsach/:id - Lấy thông tin chi tiết
   */
  async getById(req, res) {
    try {
      const theoDoiMuonSach = await TheoDoiMuonSach.findOne({ MaTheoDoiMuonSach: req.params.id })
        .populate('MaDocGia')
        .populate('MaSach')
        .populate('NhanVienMuon', 'HoTenNV')
        .populate('NhanVienTra', 'HoTenNV');
      
      if (!theoDoiMuonSach) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bản ghi theo dõi mượn sách',
          error: 'THEODOIMUONSACH_NOT_FOUND'
        });
      }
      
      res.json({
        success: true,
        message: 'Lấy thông tin theo dõi mượn sách thành công',
        data: theoDoiMuonSach
      });
      
    } catch (error) {
      console.error('Get TheoDoiMuonSach by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi lấy thông tin theo dõi mượn sách',
        error: 'GET_BY_ID_ERROR'
      });
    }
  },

  /**
   * POST /api/theodoimuonsach/muon - Mượn sách
   */
  async borrowBook(req, res) {
    try {
      const { MaDocGia, MaSach, NgayHenTra, GhiChu, NhanVienMuon } = req.body;

      // Validate required fields
      if (!MaDocGia || !MaSach || !NgayHenTra || !NhanVienMuon) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin bắt buộc',
          error: 'MISSING_REQUIRED_FIELDS'
        });
      }

      // Check if reader exists
      const docGia = await DocGia.findOne({ MaDocGia });
      if (!docGia) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy độc giả',
          error: 'DOCGIA_NOT_FOUND'
        });
      }

      // Check if book exists and available
      const sach = await Sach.findOne({ MaSach });
      if (!sach) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy sách',
          error: 'SACH_NOT_FOUND'
        });
      }

      if (sach.SoQuyen <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Sách đã hết',
          error: 'BOOK_OUT_OF_STOCK'
        });
      }

      // Check if reader already borrowed this book and not returned
      const existingBorrow = await TheoDoiMuonSach.findOne({
        MaDocGia,
        MaSach,
        TrangThai: { $ne: 'Đã trả' }
      });

      if (existingBorrow) {
        return res.status(400).json({
          success: false,
          message: 'Độc giả đã mượn sách này và chưa trả',
          error: 'ALREADY_BORROWED'
        });
      }

      // Generate next ID
      const MaTheoDoiMuonSach = await generateNextId();

      // Create borrow record
      const theoDoiMuonSach = new TheoDoiMuonSach({
        MaTheoDoiMuonSach,
        MaDocGia,
        MaSach,
        NgayMuon: new Date(),
        NgayHenTra: new Date(NgayHenTra),
        GhiChu: GhiChu || '',
        NhanVienMuon
      });

      await theoDoiMuonSach.save();

      // Decrease book quantity
      await sach.borrow();

      // Populate and return
      const populatedRecord = await TheoDoiMuonSach.findById(theoDoiMuonSach._id)
        .populate('MaDocGia', 'HoLot Ten')
        .populate('MaSach', 'TenSach NguonGoc')
        .populate('NhanVienMuon', 'HoTenNV');

      res.status(201).json({
        success: true,
        message: 'Mượn sách thành công',
        data: populatedRecord
      });
      
    } catch (error) {
      console.error('Borrow book error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi mượn sách',
        error: 'BORROW_ERROR'
      });
    }
  },

  /**
   * PUT /api/theodoimuonsach/:id/tra - Trả sách
   */
  async returnBook(req, res) {
    try {
      const { GhiChu, NhanVienTra } = req.body;

      if (!NhanVienTra) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin nhân viên xử lý trả sách',
          error: 'MISSING_NHANVIEN_TRA'
        });
      }

      const theoDoiMuonSach = await TheoDoiMuonSach.findOne({ 
        MaTheoDoiMuonSach: req.params.id 
      });

      if (!theoDoiMuonSach) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bản ghi mượn sách',
          error: 'THEODOIMUONSACH_NOT_FOUND'
        });
      }

      if (theoDoiMuonSach.TrangThai === 'Đã trả') {
        return res.status(400).json({
          success: false,
          message: 'Sách đã được trả',
          error: 'ALREADY_RETURNED'
        });
      }

      // Return book
      await theoDoiMuonSach.returnBook(NhanVienTra, GhiChu);

      // Increase book quantity
      const sach = await Sach.findOne({ MaSach: theoDoiMuonSach.MaSach });
      if (sach) {
        await sach.returnBook();
      }

      // Populate and return
      const populatedRecord = await TheoDoiMuonSach.findById(theoDoiMuonSach._id)
        .populate('MaDocGia', 'HoLot Ten')
        .populate('MaSach', 'TenSach NguonGoc')
        .populate('NhanVienMuon', 'HoTenNV')
        .populate('NhanVienTra', 'HoTenNV');

      res.json({
        success: true,
        message: 'Trả sách thành công',
        data: populatedRecord
      });
      
    } catch (error) {
      console.error('Return book error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi trả sách',
        error: 'RETURN_ERROR'
      });
    }
  },

  /**
   * PUT /api/theodoimuonsach/:id/giahan - Gia hạn sách
   */
  async extendDueDate(req, res) {
    try {
      const { NgayHenTra, GhiChu } = req.body;

      if (!NgayHenTra) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu ngày hẹn trả mới',
          error: 'MISSING_NGAY_HEN_TRA'
        });
      }

      const theoDoiMuonSach = await TheoDoiMuonSach.findOne({ 
        MaTheoDoiMuonSach: req.params.id 
      });

      if (!theoDoiMuonSach) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bản ghi mượn sách',
          error: 'THEODOIMUONSACH_NOT_FOUND'
        });
      }

      // Extend due date
      await theoDoiMuonSach.extendDueDate(new Date(NgayHenTra), GhiChu);

      // Populate and return
      const populatedRecord = await TheoDoiMuonSach.findById(theoDoiMuonSach._id)
        .populate('MaDocGia', 'HoLot Ten')
        .populate('MaSach', 'TenSach NguonGoc')
        .populate('NhanVienMuon', 'HoTenNV');

      res.json({
        success: true,
        message: 'Gia hạn sách thành công',
        data: populatedRecord
      });
      
    } catch (error) {
      console.error('Extend due date error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi hệ thống khi gia hạn sách',
        error: 'EXTEND_ERROR'
      });
    }
  },

  /**
   * GET /api/theodoimuonsach/overdue - Lấy danh sách sách quá hạn
   */
  async getOverdue(req, res) {
    try {
      const overdueBooks = await TheoDoiMuonSach.findOverdue()
        .populate('MaDocGia', 'HoLot Ten DienThoai')
        .populate('MaSach', 'TenSach NguonGoc')
        .populate('NhanVienMuon', 'HoTenNV')
        .sort({ NgayHenTra: 1 });

      res.json({
        success: true,
        message: 'Lấy danh sách sách quá hạn thành công',
        data: overdueBooks
      });
      
    } catch (error) {
      console.error('Get overdue books error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi lấy danh sách sách quá hạn',
        error: 'GET_OVERDUE_ERROR'
      });
    }
  },

  /**
   * GET /api/theodoimuonsach/docgia/:maDocGia - Lấy lịch sử mượn của độc giả
   */
  async getByReader(req, res) {
    try {
      const history = await TheoDoiMuonSach.findByReader(req.params.maDocGia);

      res.json({
        success: true,
        message: 'Lấy lịch sử mượn sách thành công',
        data: history
      });
      
    } catch (error) {
      console.error('Get reader history error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi lấy lịch sử mượn sách',
        error: 'GET_READER_HISTORY_ERROR'
      });
    }
  },

  /**
   * GET /api/theodoimuonsach/sach/:maSach - Lấy lịch sử mượn của sách
   */
  async getByBook(req, res) {
    try {
      const history = await TheoDoiMuonSach.findByBook(req.params.maSach);

      res.json({
        success: true,
        message: 'Lấy lịch sử mượn sách thành công',
        data: history
      });
      
    } catch (error) {
      console.error('Get book history error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi lấy lịch sử mượn sách',
        error: 'GET_BOOK_HISTORY_ERROR'
      });
    }
  }
};