/**
 * Database index optimization utilities
 */
import mongoose from 'mongoose';

/**
 * Create optimized indexes for all models
 */
export const createOptimizedIndexes = async () => {
  try {
    console.log('🔍 Creating optimized database indexes...');
    
    // Get all models
    const Sach = mongoose.model('Sach');
    const DocGia = mongoose.model('DocGia');
    const NhaXuatBan = mongoose.model('NhaXuatBan');
    const NhanVien = mongoose.model('NhanVien');
    const TheoDoiMuonSach = mongoose.model('TheoDoiMuonSach');
    
    // Sach indexes
    await Sach.collection.createIndex({ MaSach: 1 }, { unique: true });
    await Sach.collection.createIndex({ TenSach: 1 });
    await Sach.collection.createIndex({ NguonGoc: 1 });
    await Sach.collection.createIndex({ MaNhaXuatBan: 1 });
    await Sach.collection.createIndex({ NamXuatBan: 1 });
    await Sach.collection.createIndex({ SoQuyen: 1 });
    await Sach.collection.createIndex({ DonGia: 1 });
    // Compound index for common queries
    await Sach.collection.createIndex({ MaNhaXuatBan: 1, NamXuatBan: -1 });
    await Sach.collection.createIndex({ SoQuyen: 1, TenSach: 1 });
    // Text index for full-text search
    await Sach.collection.createIndex(
      { TenSach: 'text', NguonGoc: 'text', NhaXuatBan: 'text' },
      { 
        weights: { TenSach: 10, NguonGoc: 5, NhaXuatBan: 1 },
        name: 'sach_text_search'
      }
    );
    
    // DocGia indexes
    await DocGia.collection.createIndex({ MaDocGia: 1 }, { unique: true });
    await DocGia.collection.createIndex({ DienThoai: 1 }, { unique: true });
    await DocGia.collection.createIndex({ HoLot: 1 });
    await DocGia.collection.createIndex({ Ten: 1 });
    await DocGia.collection.createIndex({ NgaySinh: 1 });
    await DocGia.collection.createIndex({ Phai: 1 });
    // Compound index for name search
    await DocGia.collection.createIndex({ HoLot: 1, Ten: 1 });
    // Text index for full-text search
    await DocGia.collection.createIndex(
      { HoLot: 'text', Ten: 'text', DiaChi: 'text' },
      { 
        weights: { HoLot: 5, Ten: 10, DiaChi: 1 },
        name: 'docgia_text_search'
      }
    );
    
    // NhaXuatBan indexes
    await NhaXuatBan.collection.createIndex({ MaNhaXuatBan: 1 }, { unique: true });
    await NhaXuatBan.collection.createIndex({ TenNhaXuatBan: 1 });
    // Text index for search
    await NhaXuatBan.collection.createIndex(
      { TenNhaXuatBan: 'text', DiaChi: 'text' },
      { 
        weights: { TenNhaXuatBan: 10, DiaChi: 1 },
        name: 'nhaxuatban_text_search'
      }
    );
    
    // NhanVien indexes
    await NhanVien.collection.createIndex({ MSNV: 1 }, { unique: true });
    await NhanVien.collection.createIndex({ Email: 1 }, { sparse: true });
    await NhanVien.collection.createIndex({ TrangThai: 1 });
    await NhanVien.collection.createIndex({ ChucVu: 1 });
    await NhanVien.collection.createIndex({ NgayVaoLam: -1 });
    await NhanVien.collection.createIndex({ LanDangNhapCuoi: -1 });
    // Compound index for active employees
    await NhanVien.collection.createIndex({ TrangThai: 1, ChucVu: 1 });
    
    // TheoDoiMuonSach indexes
    await TheoDoiMuonSach.collection.createIndex({ MaTheoDoiMuonSach: 1 }, { unique: true });
    await TheoDoiMuonSach.collection.createIndex({ MaDocGia: 1 });
    await TheoDoiMuonSach.collection.createIndex({ MaSach: 1 });
    await TheoDoiMuonSach.collection.createIndex({ NgayMuon: -1 });
    await TheoDoiMuonSach.collection.createIndex({ NgayHenTra: 1 });
    await TheoDoiMuonSach.collection.createIndex({ NgayTra: -1 });
    await TheoDoiMuonSach.collection.createIndex({ TrangThai: 1 });
    await TheoDoiMuonSach.collection.createIndex({ NhanVienMuon: 1 });
    await TheoDoiMuonSach.collection.createIndex({ NhanVienTra: 1 });
    
    // Compound indexes for common queries
    await TheoDoiMuonSach.collection.createIndex({ MaDocGia: 1, TrangThai: 1 });
    await TheoDoiMuonSach.collection.createIndex({ MaSach: 1, TrangThai: 1 });
    await TheoDoiMuonSach.collection.createIndex({ TrangThai: 1, NgayHenTra: 1 });
    await TheoDoiMuonSach.collection.createIndex({ NgayMuon: -1, TrangThai: 1 });
    
    // Indexes for overdue books
    await TheoDoiMuonSach.collection.createIndex(
      { TrangThai: 1, NgayHenTra: 1 },
      { 
        partialFilterExpression: { TrangThai: { $ne: 'Đã trả' } },
        name: 'overdue_books_index'
      }
    );
    
    // Indexes for statistics queries
    await TheoDoiMuonSach.collection.createIndex({ createdAt: -1 });
    await TheoDoiMuonSach.collection.createIndex({ updatedAt: -1 });
    
    console.log('✅ Database indexes created successfully');
    
    // Display index information
    await displayIndexInfo();
    
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    throw error;
  }
};

/**
 * Display index information for all collections
 */
export const displayIndexInfo = async () => {
  try {
    console.log('\n📊 Database Index Information:');
    
    const collections = ['sach', 'docgia', 'nhaxuatban', 'nhanviens', 'theodoimuonsach'];
    
    for (const collectionName of collections) {
      const collection = mongoose.connection.db.collection(collectionName);
      const indexes = await collection.indexes();
      
      console.log(`\n${collectionName.toUpperCase()}:`);
      indexes.forEach(index => {
        const keys = Object.keys(index.key).map(key => {
          const direction = index.key[key] === 1 ? 'ASC' : 
                           index.key[key] === -1 ? 'DESC' : 
                           index.key[key] === 'text' ? 'TEXT' : index.key[key];
          return `${key}(${direction})`;
        }).join(', ');
        
        const unique = index.unique ? ' [UNIQUE]' : '';
        const sparse = index.sparse ? ' [SPARSE]' : '';
        const partial = index.partialFilterExpression ? ' [PARTIAL]' : '';
        
        console.log(`  - ${index.name}: ${keys}${unique}${sparse}${partial}`);
      });
    }
    
  } catch (error) {
    console.error('Error displaying index info:', error);
  }
};

/**
 * Analyze query performance
 */
export const analyzeQueryPerformance = async (model, query, options = {}) => {
  try {
    const startTime = Date.now();
    
    // Execute query with explain
    const explainResult = await model.find(query).explain('executionStats');
    
    const endTime = Date.now();
    const executionTime = endTime - startTime;
    
    const stats = explainResult.executionStats;
    
    console.log('\n🔍 Query Performance Analysis:');
    console.log(`Query: ${JSON.stringify(query)}`);
    console.log(`Execution Time: ${executionTime}ms`);
    console.log(`Documents Examined: ${stats.totalDocsExamined}`);
    console.log(`Documents Returned: ${stats.totalDocsReturned}`);
    console.log(`Index Used: ${stats.executionStages?.indexName || 'COLLSCAN'}`);
    console.log(`Efficiency: ${((stats.totalDocsReturned / stats.totalDocsExamined) * 100).toFixed(2)}%`);
    
    // Recommendations
    if (stats.totalDocsExamined > stats.totalDocsReturned * 10) {
      console.log('⚠️  Consider adding an index for this query');
    }
    
    if (stats.executionStages?.stage === 'COLLSCAN') {
      console.log('⚠️  Query is using collection scan - consider adding an index');
    }
    
    return {
      executionTime,
      docsExamined: stats.totalDocsExamined,
      docsReturned: stats.totalDocsReturned,
      indexUsed: stats.executionStages?.indexName || null,
      efficiency: (stats.totalDocsReturned / stats.totalDocsExamined) * 100
    };
    
  } catch (error) {
    console.error('Error analyzing query performance:', error);
    throw error;
  }
};

/**
 * Drop unused indexes
 */
export const dropUnusedIndexes = async () => {
  try {
    console.log('🗑️  Checking for unused indexes...');
    
    // This would require MongoDB 4.4+ with $indexStats aggregation
    // For now, we'll just log the current indexes
    await displayIndexInfo();
    
    console.log('ℹ️  Manual review recommended for unused indexes');
    
  } catch (error) {
    console.error('Error checking unused indexes:', error);
  }
};

/**
 * Optimize collection performance
 */
export const optimizeCollections = async () => {
  try {
    console.log('⚡ Optimizing collection performance...');
    
    // Create indexes
    await createOptimizedIndexes();
    
    // Analyze common queries
    const Sach = mongoose.model('Sach');
    const DocGia = mongoose.model('DocGia');
    const TheoDoiMuonSach = mongoose.model('TheoDoiMuonSach');
    
    // Test common query patterns
    console.log('\n📈 Testing common query patterns:');
    
    // Search queries
    await analyzeQueryPerformance(Sach, { TenSach: /test/i });
    await analyzeQueryPerformance(DocGia, { HoLot: /nguyen/i });
    await analyzeQueryPerformance(TheoDoiMuonSach, { TrangThai: 'Đang mượn' });
    
    console.log('✅ Collection optimization completed');
    
  } catch (error) {
    console.error('❌ Error optimizing collections:', error);
    throw error;
  }
};

export default {
  createOptimizedIndexes,
  displayIndexInfo,
  analyzeQueryPerformance,
  dropUnusedIndexes,
  optimizeCollections
};