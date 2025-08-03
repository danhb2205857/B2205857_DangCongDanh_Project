/**
 * Comprehensive API testing script
 */
import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';

// Test data
const testData = {
  nhanvien: {
    MSNV: 'NV999',
    HoTenNV: 'Test Admin',
    Password: 'test123',
    ChucVu: 'Quản lý',
    DiaChi: 'Test Address',
    SoDienThoai: '0123456789',
    Email: 'test@example.com',
    NgayVaoLam: '2024-01-01',
    TrangThai: 'Hoạt động'
  },
  nhaxuatban: {
    MaNhaXuatBan: 'NXB999',
    TenNhaXuatBan: 'Test Publisher',
    DiaChi: 'Test Publisher Address',
    DienThoai: '0987654321'
  },
  sach: {
    MaSach: 'S999',
    TenSach: 'Test Book',
    DonGia: 50000,
    SoQuyen: 10,
    NamXuatBan: 2024,
    MaNhaXuatBan: 'NXB999',
    NhaXuatBan: 'Test Publisher',
    NguonGoc: 'Test Author'
  },
  docgia: {
    MaDocGia: 'DG999',
    HoLot: 'Nguyen Van',
    Ten: 'Test',
    NgaySinh: '2000-01-01',
    Phai: 'Nam',
    DiaChi: 'Test Reader Address',
    DienThoai: '0111222333'
  }
};

// Helper function to make API requests
const apiRequest = async (method, endpoint, data = null, useAuth = true) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {}
    };
    
    if (useAuth && authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
};

// Test functions
const testAuthentication = async () => {
  console.log('\n🔐 Testing Authentication...');
  
  // Test login with invalid credentials
  const invalidLogin = await apiRequest('POST', '/auth/login', {
    msnv: 'INVALID',
    password: 'invalid'
  }, false);
  
  if (invalidLogin.success) {
    console.log('❌ Invalid login should fail');
    return false;
  } else {
    console.log('✅ Invalid login correctly rejected');
  }
  
  // Test login with valid credentials (assuming admin exists)
  const validLogin = await apiRequest('POST', '/auth/login', {
    msnv: 'NV001',
    password: 'admin123'
  }, false);
  
  if (validLogin.success) {
    authToken = validLogin.data.data.token;
    console.log('✅ Valid login successful');
    return true;
  } else {
    console.log('❌ Valid login failed:', validLogin.error);
    return false;
  }
};

const testNhaXuatBan = async () => {
  console.log('\n📚 Testing NhaXuatBan CRUD...');
  
  // Create
  const create = await apiRequest('POST', '/nhaxuatban', testData.nhaxuatban);
  if (!create.success) {
    console.log('❌ Create NhaXuatBan failed:', create.error);
    return false;
  }
  console.log('✅ Create NhaXuatBan successful');
  
  // Read all
  const readAll = await apiRequest('GET', '/nhaxuatban');
  if (!readAll.success) {
    console.log('❌ Read all NhaXuatBan failed:', readAll.error);
    return false;
  }
  console.log('✅ Read all NhaXuatBan successful');
  
  // Read by ID
  const readById = await apiRequest('GET', `/nhaxuatban/${testData.nhaxuatban.MaNhaXuatBan}`);
  if (!readById.success) {
    console.log('❌ Read NhaXuatBan by ID failed:', readById.error);
    return false;
  }
  console.log('✅ Read NhaXuatBan by ID successful');
  
  // Update
  const update = await apiRequest('PUT', `/nhaxuatban/${testData.nhaxuatban.MaNhaXuatBan}`, {
    TenNhaXuatBan: 'Updated Test Publisher'
  });
  if (!update.success) {
    console.log('❌ Update NhaXuatBan failed:', update.error);
    return false;
  }
  console.log('✅ Update NhaXuatBan successful');
  
  return true;
};

const testSach = async () => {
  console.log('\n📖 Testing Sach CRUD...');
  
  // Create
  const create = await apiRequest('POST', '/sach', testData.sach);
  if (!create.success) {
    console.log('❌ Create Sach failed:', create.error);
    return false;
  }
  console.log('✅ Create Sach successful');
  
  // Read all with pagination
  const readAll = await apiRequest('GET', '/sach?page=1&limit=10');
  if (!readAll.success) {
    console.log('❌ Read all Sach failed:', readAll.error);
    return false;
  }
  console.log('✅ Read all Sach with pagination successful');
  
  // Search
  const search = await apiRequest('GET', '/sach?search=Test');
  if (!search.success) {
    console.log('❌ Search Sach failed:', search.error);
    return false;
  }
  console.log('✅ Search Sach successful');
  
  // Read by ID
  const readById = await apiRequest('GET', `/sach/${testData.sach.MaSach}`);
  if (!readById.success) {
    console.log('❌ Read Sach by ID failed:', readById.error);
    return false;
  }
  console.log('✅ Read Sach by ID successful');
  
  return true;
};

const testDocGia = async () => {
  console.log('\n👤 Testing DocGia CRUD...');
  
  // Create
  const create = await apiRequest('POST', '/docgia', testData.docgia);
  if (!create.success) {
    console.log('❌ Create DocGia failed:', create.error);
    return false;
  }
  console.log('✅ Create DocGia successful');
  
  // Read all
  const readAll = await apiRequest('GET', '/docgia');
  if (!readAll.success) {
    console.log('❌ Read all DocGia failed:', readAll.error);
    return false;
  }
  console.log('✅ Read all DocGia successful');
  
  return true;
};

const testTheoDoiMuonSach = async () => {
  console.log('\n📋 Testing TheoDoiMuonSach...');
  
  // Create borrow record
  const borrowData = {
    MaDocGia: testData.docgia.MaDocGia,
    MaSach: testData.sach.MaSach,
    NgayMuon: new Date().toISOString().split('T')[0],
    NgayHenTra: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    NhanVienMuon: 'NV001'
  };
  
  const borrow = await apiRequest('POST', '/theodoimuonsach', borrowData);
  if (!borrow.success) {
    console.log('❌ Create borrow record failed:', borrow.error);
    return false;
  }
  console.log('✅ Create borrow record successful');
  
  // Read all borrow records
  const readAll = await apiRequest('GET', '/theodoimuonsach');
  if (!readAll.success) {
    console.log('❌ Read all borrow records failed:', readAll.error);
    return false;
  }
  console.log('✅ Read all borrow records successful');
  
  return true;
};

const testDashboard = async () => {
  console.log('\n📊 Testing Dashboard...');
  
  const stats = await apiRequest('GET', '/dashboard/stats');
  if (!stats.success) {
    console.log('❌ Get dashboard stats failed:', stats.error);
    return false;
  }
  console.log('✅ Get dashboard stats successful');
  
  return true;
};

const testValidation = async () => {
  console.log('\n✅ Testing Validation...');
  
  // Test invalid data
  const invalidSach = await apiRequest('POST', '/sach', {
    MaSach: 'INVALID', // Wrong format
    TenSach: '', // Empty required field
    DonGia: -100, // Negative price
    SoQuyen: 'not_a_number' // Invalid type
  });
  
  if (invalidSach.success) {
    console.log('❌ Invalid data should be rejected');
    return false;
  } else {
    console.log('✅ Invalid data correctly rejected');
  }
  
  return true;
};

const cleanup = async () => {
  console.log('\n🧹 Cleaning up test data...');
  
  // Delete test records
  await apiRequest('DELETE', `/sach/${testData.sach.MaSach}`);
  await apiRequest('DELETE', `/docgia/${testData.docgia.MaDocGia}`);
  await apiRequest('DELETE', `/nhaxuatban/${testData.nhaxuatban.MaNhaXuatBan}`);
  
  console.log('✅ Cleanup completed');
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting comprehensive API tests...');
  console.log('=' .repeat(50));
  
  let allTestsPassed = true;
  
  try {
    // Authentication test
    const authResult = await testAuthentication();
    if (!authResult) {
      console.log('❌ Authentication tests failed - stopping');
      return;
    }
    
    // CRUD tests
    const nhaXuatBanResult = await testNhaXuatBan();
    const sachResult = await testSach();
    const docGiaResult = await testDocGia();
    const theoDoiResult = await testTheoDoiMuonSach();
    const dashboardResult = await testDashboard();
    const validationResult = await testValidation();
    
    allTestsPassed = authResult && nhaXuatBanResult && sachResult && 
                    docGiaResult && theoDoiResult && dashboardResult && validationResult;
    
    // Cleanup
    await cleanup();
    
    console.log('\n' + '=' .repeat(50));
    if (allTestsPassed) {
      console.log('🎉 All tests passed successfully!');
    } else {
      console.log('❌ Some tests failed');
    }
    
  } catch (error) {
    console.error('💥 Test runner error:', error);
  }
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export default runTests;