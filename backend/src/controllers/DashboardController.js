import { DocGia, Sach, NhaXuatBan, TheoDoiMuonSach, NhanVien } from '../models/index.js';

/**
 * Dashboard Controller - Thống kê tổng quan
 */

export default {
  /**
   * GET /api/dashboard/stats - Lấy thống kê tổng quan
   */
  async getStats(req, res) {
    try {
      // Get basic counts
      const [
        totalReaders,
        totalBooks,
        totalPublishers,
        totalEmployees,
        activeBorrows,
        overdueBorrows
      ] = await Promise.all([
        DocGia.countDocuments(),
        Sach.countDocuments(),
        NhaXuatBan.countDocuments(),
        NhanVien.countDocuments({ TrangThai: 'Đang làm việc' }),
        TheoDoiMuonSach.countDocuments({ TrangThai: { $in: ['muon', 'qua_han'] } }),
        TheoDoiMuonSach.countDocuments({
          TrangThai: { $in: ['muon', 'qua_han'] },
          NgayHenTra: { $lt: new Date() }
        })
      ]);

      // Get today's statistics
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

      const [
        todayBorrows,
        todayReturns,
        todayNewReaders
      ] = await Promise.all([
        TheoDoiMuonSach.countDocuments({
          NgayMuon: { $gte: startOfDay, $lt: endOfDay }
        }),
        TheoDoiMuonSach.countDocuments({
          NgayTra: { $gte: startOfDay, $lt: endOfDay }
        }),
        DocGia.countDocuments({
          createdAt: { $gte: startOfDay, $lt: endOfDay }
        })
      ]);

      // Get book availability stats
      const bookStats = await Sach.aggregate([
        {
          $group: {
            _id: null,
            totalQuantity: { $sum: '$SoQuyen' },
            availableBooks: {
              $sum: {
                $cond: [
                  { $and: [{ $gt: ['$SoQuyen', 0] }, { $eq: ['$TrangThai', 'Có sẵn'] }] },
                  1,
                  0
                ]
              }
            },
            totalValue: { $sum: { $multiply: ['$SoQuyen', '$DonGia'] } }
          }
        }
      ]);

      const bookStatsData = bookStats[0] || {
        totalQuantity: 0,
        availableBooks: 0,
        totalValue: 0
      };

      res.json({
        success: true,
        message: 'Lấy thống kê tổng quan thành công',
        data: {
          overview: {
            totalReaders,
            totalBooks,
            totalPublishers,
            totalEmployees,
            activeBorrows,
            overdueBorrows,
            totalQuantity: bookStatsData.totalQuantity,
            availableBooks: bookStatsData.availableBooks,
            totalValue: Math.round(bookStatsData.totalValue)
          },
          today: {
            borrows: todayBorrows,
            returns: todayReturns,
            newReaders: todayNewReaders
          }
        }
      });

    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi lấy thống kê',
        error: 'GET_STATS_ERROR'
      });
    }
  },

  /**
   * GET /api/dashboard/recent-activities - Lấy hoạt động gần đây
   */
  async getRecentActivities(req, res) {
    try {
      const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 10));

      // Get recent borrows and returns
      const recentTransactions = await TheoDoiMuonSach.find()
        .populate('MaDocGia', 'MaDocGia HoLot Ten')
        .populate('MaSach', 'MaSach TenSach')
        .populate('NhanVienMuon', 'MSNV HoTenNV')
        .populate('NhanVienTra', 'MSNV HoTenNV')
        .sort({ updatedAt: -1 })
        .limit(limit);

      // Get recent new readers
      const recentReaders = await DocGia.find()
        .select('MaDocGia HoLot Ten createdAt')
        .sort({ createdAt: -1 })
        .limit(5);

      // Get recent new books
      const recentBooks = await Sach.find()
        .populate('MaNXB', 'TenNXB')
        .select('MaSach TenSach TacGia NamXuatBan createdAt')
        .sort({ createdAt: -1 })
        .limit(5);

      res.json({
        success: true,
        message: 'Lấy hoạt động gần đây thành công',
        data: {
          recentTransactions,
          recentReaders,
          recentBooks
        }
      });

    } catch (error) {
      console.error('Get recent activities error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi lấy hoạt động gần đây',
        error: 'GET_RECENT_ACTIVITIES_ERROR'
      });
    }
  },

  /**
   * GET /api/dashboard/charts - Lấy dữ liệu cho biểu đồ
   */
  async getChartData(req, res) {
    try {
      const { period = '7days' } = req.query;
      
      let startDate;
      let groupFormat;
      
      switch (period) {
        case '30days':
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$NgayMuon' } };
          break;
        case '12months':
          startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
          groupFormat = { $dateToString: { format: '%Y-%m', date: '$NgayMuon' } };
          break;
        default: // 7days
          startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$NgayMuon' } };
      }

      // Borrow/Return trends
      const borrowTrends = await TheoDoiMuonSach.aggregate([
        { $match: { NgayMuon: { $gte: startDate } } },
        {
          $group: {
            _id: groupFormat,
            borrows: { $sum: 1 },
            returns: {
              $sum: {
                $cond: [{ $ne: ['$NgayTra', null] }, 1, 0]
              }
            }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Popular books
      const popularBooks = await TheoDoiMuonSach.aggregate([
        { $match: { NgayMuon: { $gte: startDate } } },
        {
          $group: {
            _id: '$MaSach',
            borrowCount: { $sum: 1 }
          }
        },
        { $sort: { borrowCount: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'sachs',
            localField: '_id',
            foreignField: '_id',
            as: 'book'
          }
        },
        { $unwind: '$book' },
        {
          $project: {
            bookTitle: '$book.TenSach',
            borrowCount: 1
          }
        }
      ]);

      // Reader activity
      const readerActivity = await TheoDoiMuonSach.aggregate([
        { $match: { NgayMuon: { $gte: startDate } } },
        {
          $group: {
            _id: '$MaDocGia',
            borrowCount: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: null,
            activeReaders: { $sum: 1 },
            totalBorrows: { $sum: '$borrowCount' },
            avgBorrowsPerReader: { $avg: '$borrowCount' }
          }
        }
      ]);

      const readerStats = readerActivity[0] || {
        activeReaders: 0,
        totalBorrows: 0,
        avgBorrowsPerReader: 0
      };

      res.json({
        success: true,
        message: 'Lấy dữ liệu biểu đồ thành công',
        data: {
          borrowTrends,
          popularBooks,
          readerActivity: {
            activeReaders: readerStats.activeReaders,
            totalBorrows: readerStats.totalBorrows,
            avgBorrowsPerReader: Math.round(readerStats.avgBorrowsPerReader * 100) / 100
          },
          period
        }
      });

    } catch (error) {
      console.error('Get chart data error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi lấy dữ liệu biểu đồ',
        error: 'GET_CHART_DATA_ERROR'
      });
    }
  }
};