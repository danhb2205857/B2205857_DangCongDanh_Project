import DocGia from "../models/DocGia.js";
import { AppError } from '../middlewares/errorHandler.js';
import TheoDoiMuonSach from '../models/TheoDoiMuonSach.js';
import jwt from 'jsonwebtoken';



function buildSearchQuery(search) {
  console.log('Building DocGia search query for:', search);
  

  if (!search || typeof search !== 'string' || search.trim().length === 0) {
    console.log('No valid search term, returning empty query');
    return {};
  }
  

  const searchTerm = search.trim();
  

  const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  

  const searchRegex = new RegExp(escapedSearchTerm, 'i');
  
  const query = {
    $or: [
      { MaDocGia: searchRegex },
      { HoLot: searchRegex },
      { Ten: searchRegex },
      { DiaChi: searchRegex },
      { DienThoai: searchRegex },
      { email: searchRegex }
    ]
  };
  
  console.log('DocGia search query created successfully');
  return query;
}

export default {
  
  async getAll(req, res) {
    console.log('=== Starting DocGia getAll function ===');
    

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'MaDocGia';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    
    console.log('Query params:', { page, limit, search, sortBy, sortOrder });
    

    const searchQuery = buildSearchQuery(search);
    console.log('Search query built:', JSON.stringify(searchQuery));
    

    console.log('Getting total count...');
    const total = await DocGia.countDocuments(searchQuery);
    console.log('Total DocGia documents found:', total);
    

    console.log('Building main query...');
    const skip = (page - 1) * limit;
    

    let query = DocGia.find(searchQuery);
    

    query = query.skip(skip);
    query = query.limit(limit);
    

    const validSortFields = ['MaDocGia', 'HoLot', 'Ten', 'DiaChi', 'DienThoai'];
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'MaDocGia';
    query = query.sort({ [finalSortBy]: sortOrder });
    
    console.log('Query configured with:', {
      skip,
      limit,
      sort: { [finalSortBy]: sortOrder }
    });
    

    console.log('Executing DocGia query...');
    const data = await query.lean();
    console.log('Query executed successfully, got', data.length, 'DocGia items');
    

    const totalPages = Math.ceil(total / limit);
    const paginationInfo = {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };
    
    console.log('Pagination info:', paginationInfo);
    

    res.json({
      success: true,
      message: 'Lấy danh sách độc giả thành công',
      data: {
        docgia: data,
        pagination: paginationInfo
      }
    });
    
    console.log('=== DocGia getAll function completed successfully ===');
  },


  async getById(req, res) {
    console.log('Getting DocGia by MaDocGia:', req.params.maDocGia);
    
    const docGia = await DocGia.findOne({ MaDocGia: req.params.maDocGia }).lean();
    
    if (!docGia) {
      throw new AppError('Không tìm thấy độc giả', 404, 'DOCGIA_NOT_FOUND');
    }
    
    res.json({
      success: true,
      message: 'Lấy thông tin độc giả thành công',
      data: docGia
    });
  },


  async create(req, res) {
    console.log('Creating new DocGia:', req.body);
    

    if (req.body.MaDocGia) {
      const existingDocGia = await DocGia.findOne({ MaDocGia: req.body.MaDocGia });
      if (existingDocGia) {
        throw new AppError('Mã độc giả đã tồn tại', 400, 'DUPLICATE_MA_DOCGIA');
      }
    }
    

    if (req.body.DienThoai) {
      const existingPhone = await DocGia.findOne({ DienThoai: req.body.DienThoai });
      if (existingPhone) {
        throw new AppError('Số điện thoại đã được sử dụng', 400, 'DUPLICATE_PHONE');
      }
    }
    

    if (req.body.email) {
      const existingEmail = await DocGia.findOne({ email: req.body.email.toLowerCase() });
      if (existingEmail) {
        throw new AppError('Email đã được sử dụng', 400, 'DUPLICATE_EMAIL');
      }
    }
    
    const docGia = new DocGia(req.body);
    await docGia.save();
    
    res.status(201).json({
      success: true,
      message: 'Tạo độc giả mới thành công',
      data: docGia
    });
  },


  async update(req, res) {
    console.log('Updating DocGia:', req.params.id, req.body);
    

    if (req.body.DienThoai) {
      const existingPhone = await DocGia.findOne({
        DienThoai: req.body.DienThoai,
        MaDocGia: { $ne: req.params.id }
      });
      
      if (existingPhone) {
        throw new AppError('Số điện thoại đã được sử dụng', 400, 'DUPLICATE_PHONE');
      }
    }
    
    const docGia = await DocGia.findOneAndUpdate(
      { MaDocGia: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!docGia) {
      throw new AppError('Không tìm thấy độc giả', 404, 'DOCGIA_NOT_FOUND');
    }
    
    res.json({
      success: true,
      message: 'Cập nhật thông tin độc giả thành công',
      data: docGia
    });
  },


  async remove(req, res) {
    console.log('Deleting DocGia:', req.params.id);
    

    const borrowCount = await TheoDoiMuonSach.countDocuments({
      MaDocGia: req.params.id,
      NgayTra: null
    });
    
    if (borrowCount > 0) {
      throw new AppError('Không thể xóa độc giả đang mượn sách', 400, 'HAS_BORROWED_BOOKS');
    }
    
    const docGia = await DocGia.findOneAndDelete({ MaDocGia: req.params.id });
    
    if (!docGia) {
      throw new AppError('Không tìm thấy độc giả', 404, 'DOCGIA_NOT_FOUND');
    }
    
    res.json({
      success: true,
      message: 'Xóa độc giả thành công',
      data: { deletedId: req.params.id }
    });
  },


  async search(req, res) {
    console.log('Searching DocGia with query:', req.params.query);
    
    const query = req.params.query;
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 10));
    
    if (!query || query.trim().length === 0) {
      throw new AppError('Từ khóa tìm kiếm không được để trống', 400, 'EMPTY_SEARCH_QUERY');
    }
    
    const searchQuery = buildSearchQuery(query);
    const docgia = await DocGia.find(searchQuery)
      .limit(limit)
      .select('MaDocGia HoLot Ten DiaChi DienThoai')
      .lean();
    
    console.log('Search completed, found', docgia.length, 'results');
    
    res.json({
      success: true,
      message: 'Tìm kiếm độc giả thành công',
      data: docgia
    });
  },

  
  async register(req, res) {
    console.log('Registering new DocGia account:', req.body.email);
    
    const { email, password, HoLot, Ten, NgaySinh, Phai, DiaChi, DienThoai, avatar } = req.body;
    
    
    const existingEmail = await DocGia.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      throw new AppError('Email đã được sử dụng', 400, 'DUPLICATE_EMAIL');
    }
    
    
    if (DienThoai) {
      const existingPhone = await DocGia.findOne({ DienThoai });
      if (existingPhone) {
        throw new AppError('Số điện thoại đã được sử dụng', 400, 'DUPLICATE_PHONE');
      }
    }
    
    
    const lastDocGia = await DocGia.findOne({}, {}, { sort: { 'MaDocGia': -1 } });
    let nextNumber = 1;
    if (lastDocGia && lastDocGia.MaDocGia && lastDocGia.MaDocGia.match(/^DG(\d+)$/)) {
      nextNumber = parseInt(lastDocGia.MaDocGia.substring(2)) + 1;
    }
    const MaDocGia = `DG${nextNumber.toString().padStart(3, '0')}`;
    
    console.log('Generated MaDocGia:', MaDocGia);
    
    
    const docGia = new DocGia({
      email,
      password,
      MaDocGia,
      HoLot,
      Ten,
      NgaySinh,
      Phai,
      DiaChi,
      DienThoai,
      avatar
    });
    
    await docGia.save();
    
    
    const token = jwt.sign(
      { 
        id: docGia._id, 
        MaDocGia: docGia.MaDocGia,
        email: docGia.email,
        role: 'reader'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    
    const docGiaResponse = docGia.toObject();
    delete docGiaResponse.password;
    
    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công',
      data: {
        docGia: docGiaResponse,
        token
      }
    });
  },

  
  async login(req, res) {
    console.log('DocGia login attempt:', req.body.email);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      throw new AppError('Email và mật khẩu là bắt buộc', 400, 'MISSING_CREDENTIALS');
    }
    
    
    const docGia = await DocGia.findByEmail(email);
    
    if (!docGia) {
      throw new AppError('Email hoặc mật khẩu không đúng', 401, 'INVALID_CREDENTIALS');
    }
    
    
    if (!docGia.isActive) {
      throw new AppError('Tài khoản đã bị vô hiệu hóa', 401, 'ACCOUNT_DISABLED');
    }
    
    
    const isPasswordValid = await docGia.comparePassword(password);
    
    if (!isPasswordValid) {
      throw new AppError('Email hoặc mật khẩu không đúng', 401, 'INVALID_CREDENTIALS');
    }
    

    await docGia.updateLastLogin();
    
    
    const token = jwt.sign(
      { 
        id: docGia._id, 
        MaDocGia: docGia.MaDocGia,
        email: docGia.email,
        role: 'reader'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    
    const docGiaResponse = docGia.toObject();
    delete docGiaResponse.password;
    
    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        docGia: docGiaResponse,
        token
      }
    });
  },

  
  async getProfile(req, res) {
    console.log('Getting DocGia profile:', req.user.id);
    const docGia = await DocGia.findById(req.user.id).select('-password');
    console.log('docGia:', docGia);
    
    if (!docGia) {
      throw new AppError('Không tìm thấy thông tin độc giả', 404, 'DOCGIA_NOT_FOUND');
    }
    
    res.json({
      success: true,
      message: 'Lấy thông tin profile thành công',
      data: docGia
    });
  },

  
  async updateProfile(req, res) {
    console.log('Updating DocGia profile:', req.user.id);
    
    const allowedUpdates = ['HoLot', 'Ten', 'NgaySinh', 'Phai', 'DiaChi', 'DienThoai', 'avatar'];
    const updates = {};
    
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });
    
    
    if (updates.DienThoai) {
      const existingPhone = await DocGia.findOne({
        DienThoai: updates.DienThoai,
        _id: { $ne: req.user.id }
      });
      
      if (existingPhone) {
        throw new AppError('Số điện thoại đã được sử dụng', 400, 'DUPLICATE_PHONE');
      }
    }
    
    const docGia = await DocGia.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!docGia) {
      throw new AppError('Không tìm thấy thông tin độc giả', 404, 'DOCGIA_NOT_FOUND');
    }
    
    res.json({
      success: true,
      message: 'Cập nhật profile thành công',
      data: docGia
    });
  },

  
  async changePassword(req, res) {
    console.log('Changing password for DocGia:', req.user.id);
    
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      throw new AppError('Mật khẩu hiện tại và mật khẩu mới là bắt buộc', 400, 'MISSING_PASSWORDS');
    }
    
    if (newPassword.length < 6) {
      throw new AppError('Mật khẩu mới phải có ít nhất 6 ký tự', 400, 'PASSWORD_TOO_SHORT');
    }
    
    
    const docGia = await DocGia.findById(req.user.id).select('+password');
    
    if (!docGia) {
      throw new AppError('Không tìm thấy thông tin độc giả', 404, 'DOCGIA_NOT_FOUND');
    }
    
    
    const isCurrentPasswordValid = await docGia.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      throw new AppError('Mật khẩu hiện tại không đúng', 401, 'INVALID_CURRENT_PASSWORD');
    }
    
    
    docGia.password = newPassword;
    await docGia.save();
    
    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });
  },

  
  async getMyBorrows(req, res) {
    console.log('Getting borrowed books for DocGia:', req.user.MaDocGia);
    
    try {
      
      const borrowRecords = await TheoDoiMuonSach.find({
        MaDocGia: req.user.MaDocGia,
        NgayTra: null 
      }).populate('MaSach', 'TenSach TacGia AnhBia MaNhaXuatBan')
        .populate('MaNhaXuatBan', 'TenNhaXuatBan')
        .sort({ NgayMuon: -1 });


      const borrowedBooks = borrowRecords.map(record => ({
        _id: record._id,
        TenSach: record.MaSach?.TenSach || 'N/A',
        TacGia: record.MaSach?.TacGia || 'N/A',
        AnhBia: record.MaSach?.AnhBia || null,
        TenNhaXuatBan: record.MaNhaXuatBan?.TenNhaXuatBan || 'N/A',
        NgayMuon: record.NgayMuon,
        NgayHenTra: record.NgayHenTra,
        MaSach: record.MaSach?._id,
        MaDocGia: record.MaDocGia
      }));

      res.json({
        success: true,
        message: 'Lấy danh sách sách đang mượn thành công',
        data: borrowedBooks
      });
    } catch (error) {
      console.error('Error getting borrowed books:', error);
      throw new AppError('Không thể lấy danh sách sách đang mượn', 500, 'GET_BORROWS_ERROR');
    }
  },

  
  async getBorrowHistory(req, res) {
    console.log('Getting borrow history for DocGia:', req.user.MaDocGia);
    
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
      const status = req.query.status; 

      
      let query = { MaDocGia: req.user.MaDocGia };
      
      if (status === 'returned') {
        query.NgayTra = { $ne: null };
      } else if (status === 'borrowing') {
        query.NgayTra = null;
      }

      
      const total = await TheoDoiMuonSach.countDocuments(query);

      
      const skip = (page - 1) * limit;
      const borrowRecords = await TheoDoiMuonSach.find(query)
        .populate('MaSach', 'TenSach TacGia AnhBia MaNhaXuatBan')
        .populate('MaNhaXuatBan', 'TenNhaXuatBan')
        .sort({ NgayMuon: -1 })
        .skip(skip)
        .limit(limit);

      
      const history = borrowRecords.map(record => ({
        _id: record._id,
        TenSach: record.MaSach?.TenSach || 'N/A',
        TacGia: record.MaSach?.TacGia || 'N/A',
        AnhBia: record.MaSach?.AnhBia || null,
        TenNhaXuatBan: record.MaNhaXuatBan?.TenNhaXuatBan || 'N/A',
        NgayMuon: record.NgayMuon,
        NgayHenTra: record.NgayHenTra,
        NgayTra: record.NgayTra,
        MaSach: record.MaSach?._id,
        MaDocGia: record.MaDocGia
      }));

      
      const totalPages = Math.ceil(total / limit);
      const pagination = {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      };

      res.json({
        success: true,
        message: 'Lấy lịch sử mượn sách thành công',
        data: {
          history,
          pagination
        }
      });
    } catch (error) {
      console.error('Error getting borrow history:', error);
      throw new AppError('Không thể lấy lịch sử mượn sách', 500, 'GET_HISTORY_ERROR');
    }
  }
};