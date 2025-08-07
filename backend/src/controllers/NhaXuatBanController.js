import NhaXuatBan from '../models/NhaXuatBan.js';
import Sach from '../models/Sach.js';
import { AppError } from '../middlewares/errorHandler.js';


function buildSearchQuery(search) {
  console.log('Building NXB search query for:', search);
  

  if (!search || typeof search !== 'string' || search.trim().length === 0) {
    console.log('No valid search term, returning empty query');
    return {};
  }
  
  
  const searchTerm = search.trim();
  
  
  const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  
  const searchRegex = new RegExp(escapedSearchTerm, 'i');
  
  const query = {
    $or: [
      { MaNhaXuatBan: searchRegex },
      { TenNhaXuatBan: searchRegex },
      { DiaChi: searchRegex }
    ]
  };
  
  console.log('NXB search query created successfully');
  return query;
}

export default {
  
  async getAll(req, res) {
    console.log('=== Starting NhaXuatBan getAll function ===');
    
    
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'MaNhaXuatBan';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    
    console.log('Query params:', { page, limit, search, sortBy, sortOrder });
    
    
    const searchQuery = buildSearchQuery(search);
    console.log('Search query built:', JSON.stringify(searchQuery));
    
    
    console.log('Getting total count...');
    const total = await NhaXuatBan.countDocuments(searchQuery);
    console.log('Total NXB documents found:', total);
    
    
    console.log('Building main query...');
    const skip = (page - 1) * limit;
    
    
    let query = NhaXuatBan.find(searchQuery);
    
    
    query = query.skip(skip);
    query = query.limit(limit);
    
    
    const validSortFields = ['MaNhaXuatBan', 'TenNhaXuatBan', 'DiaChi', 'DienThoai'];
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'MaNhaXuatBan';
    query = query.sort({ [finalSortBy]: sortOrder });
    
    console.log('Query configured with:', {
      skip,
      limit,
      sort: { [finalSortBy]: sortOrder }
    });
    
    
    console.log('Executing NXB query...');
    const data = await query.lean();
    console.log('Query executed successfully, got', data.length, 'NXB items');
    
    
    console.log('Adding book counts...');
    for (let nxb of data) {
      nxb.SoSach = await Sach.countDocuments({ MaNhaXuatBan: nxb.MaNhaXuatBan });
    }
    console.log('Book counts added successfully');
    

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
      message: 'Lấy danh sách nhà xuất bản thành công',
      data: {
        nhaxuatban: data,
        pagination: paginationInfo
      }
    });
    
    console.log('=== NhaXuatBan getAll function completed successfully ===');
  },

  
  async getById(req, res) {
    console.log('Getting NXB by MaNXB:', req.params.maNXB);
    
    const nhaXuatBan = await NhaXuatBan.findOne({ MaNhaXuatBan: req.params.maNXB }).lean();
    
    if (!nhaXuatBan) {
      throw new AppError('Không tìm thấy nhà xuất bản', 404, 'NXB_NOT_FOUND');
    }
    
    
    nhaXuatBan.SoSach = await Sach.countDocuments({ MaNhaXuatBan: nhaXuatBan.MaNhaXuatBan });
    
    res.json({
      success: true,
      message: 'Lấy thông tin nhà xuất bản thành công',
      data: nhaXuatBan
    });
  },

  
  async create(req, res) {
    console.log('Creating new NXB:', req.body);
    
    
    if (req.body.MaNhaXuatBan) {
      const existingNXB = await NhaXuatBan.findOne({ MaNhaXuatBan: req.body.MaNhaXuatBan });
      if (existingNXB) {
        throw new AppError('Mã nhà xuất bản đã tồn tại', 400, 'DUPLICATE_MA_NXB');
      }
    }
    
    const nhaXuatBan = new NhaXuatBan(req.body);
    await nhaXuatBan.save();
    
    res.status(201).json({
      success: true,
      message: 'Tạo nhà xuất bản mới thành công',
      data: nhaXuatBan
    });
  },

  
  async update(req, res) {
    console.log('Updating NXB:', req.params.maNXB, req.body);
    
    const nhaXuatBan = await NhaXuatBan.findOneAndUpdate(
      { MaNhaXuatBan: req.params.maNXB },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!nhaXuatBan) {
      throw new AppError('Không tìm thấy nhà xuất bản', 404, 'NXB_NOT_FOUND');
    }
    
    res.json({
      success: true,
      message: 'Cập nhật thông tin nhà xuất bản thành công',
      data: nhaXuatBan
    });
  },

  
  async remove(req, res) {
    console.log('Deleting NXB:', req.params.maNXB);
    
    
    const bookCount = await Sach.countDocuments({ MaNhaXuatBan: req.params.maNXB });
    if (bookCount > 0) {
      throw new AppError('Không thể xóa nhà xuất bản đang có sách', 400, 'NXB_HAS_BOOKS');
    }
    
    const nhaXuatBan = await NhaXuatBan.findOneAndDelete({ MaNhaXuatBan: req.params.maNXB });
    
    if (!nhaXuatBan) {
      throw new AppError('Không tìm thấy nhà xuất bản', 404, 'NXB_NOT_FOUND');
    }
    
    res.json({
      success: true,
      message: 'Xóa nhà xuất bản thành công',
      data: { deletedId: req.params.maNXB }
    });
  },

  
  async search(req, res) {
    const query = req.params.query;
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 10));
    
    console.log('Searching NXB with query:', query, 'limit:', limit);
    
    if (!query || query.trim().length === 0) {
      throw new AppError('Từ khóa tìm kiếm không được để trống', 400, 'EMPTY_SEARCH_QUERY');
    }
    
    const searchQuery = buildSearchQuery(query);
    const nhaXuatBan = await NhaXuatBan.find(searchQuery)
      .limit(limit)
      .select('MaNhaXuatBan TenNhaXuatBan DiaChi DienThoai')
      .lean();
    
    console.log('Search completed, found', nhaXuatBan.length, 'results');
    
    res.json({
      success: true,
      message: 'Tìm kiếm nhà xuất bản thành công',
      data: nhaXuatBan
    });
  },

      
  async getBooks(req, res) {
    console.log('Getting books for NXB:', req.params.maNXB);
    
    const nhaXuatBan = await NhaXuatBan.findOne({ MaNhaXuatBan: req.params.maNXB }).lean();
    
    if (!nhaXuatBan) {
      throw new AppError('Không tìm thấy nhà xuất bản', 404, 'NXB_NOT_FOUND');
    }
    
    const sach = await Sach.find({ MaNhaXuatBan: req.params.maNXB })
      .select('MaSach TenSach NguonGoc SoQuyen DonGia NamXuatBan')
      .sort({ TenSach: 1 })
      .lean();
    
    console.log('Found', sach.length, 'books for NXB');
    
    res.json({
      success: true,
      message: 'Lấy danh sách sách của nhà xuất bản thành công',
      data: {
        nhaXuatBan,
        sach
      }
    });
  }
};