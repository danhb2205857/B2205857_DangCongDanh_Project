import { DocGia, Sach, NhaXuatBan, TheoDoiMuonSach, NhanVien } from '../models/index.js';
import { AppError } from '../middlewares/errorHandler.js';



export default {
  
  async getStats(req, res) {

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
        TheoDoiMuonSach.countDocuments({ TrangThai: { $in: ['muon', 'qua_han', 'Đang mượn', 'Quá hạn'] } }),
        TheoDoiMuonSach.countDocuments({
          TrangThai: { $in: ['muon', 'qua_han', 'Đang mượn', 'Quá hạn'] },
          NgayHenTra: { $lt: new Date() }
        })
      ]);

      
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

  },

  
  async getRecentActivities(req, res) {
      const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 10));

      
      let recentTransactions = await TheoDoiMuonSach.find()
        .sort({ updatedAt: -1 })
        .limit(limit)
        .lean();
      
      const recentReaders = await DocGia.find({})
        .select('MaDocGia HoLot Ten createdAt')
        .sort({ createdAt: -1 })
        .limit(5);

      
      const recentBooks = await Sach.find()
        .select('MaSach TenSach NguonGoc NamXuatBan createdAt')
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

  },

  
  async getChartData(req, res) {
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

  }
};