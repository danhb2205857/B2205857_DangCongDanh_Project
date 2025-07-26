// MongoDB initialization script for QuanLyMuonSach database
print('Starting database initialization...');

// Switch to the quanlymuonsach database
db = db.getSiblingDB('quanlymuonsach');

// Create collections with validation
print('Creating collections...');

// DocGia collection
db.createCollection('docgias', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['MaDocGia', 'HoLot', 'Ten', 'NgaySinh', 'Phai', 'DiaChi', 'DienThoai'],
      properties: {
        MaDocGia: {
          bsonType: 'string',
          description: 'Mã độc giả - required'
        },
        HoLot: {
          bsonType: 'string',
          description: 'Họ lót - required'
        },
        Ten: {
          bsonType: 'string',
          description: 'Tên - required'
        },
        NgaySinh: {
          bsonType: 'date',
          description: 'Ngày sinh - required'
        },
        Phai: {
          bsonType: 'string',
          enum: ['Nam', 'Nữ'],
          description: 'Phái - required'
        },
        DiaChi: {
          bsonType: 'string',
          description: 'Địa chỉ - required'
        },
        DienThoai: {
          bsonType: 'string',
          description: 'Điện thoại - required'
        }
      }
    }
  }
});

// Sach collection
db.createCollection('sachs', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['MaSach', 'TenSach', 'DonGia', 'SoQuyen', 'NamXuatBan'],
      properties: {
        MaSach: {
          bsonType: 'string',
          description: 'Mã sách - required'
        },
        TenSach: {
          bsonType: 'string',
          description: 'Tên sách - required'
        },
        DonGia: {
          bsonType: 'number',
          minimum: 0,
          description: 'Đơn giá - required'
        },
        SoQuyen: {
          bsonType: 'int',
          minimum: 0,
          description: 'Số quyển - required'
        },
        NamXuatBan: {
          bsonType: 'int',
          minimum: 1900,
          maximum: 2100,
          description: 'Năm xuất bản - required'
        },
        NguonGoc: {
          bsonType: 'string',
          description: 'Nguồn gốc/Tác giả'
        }
      }
    }
  }
});

// NhaXuatBan collection
db.createCollection('nhaxuatbans', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['MaNXB', 'TenNXB', 'DiaChi'],
      properties: {
        MaNXB: {
          bsonType: 'string',
          description: 'Mã nhà xuất bản - required'
        },
        TenNXB: {
          bsonType: 'string',
          description: 'Tên nhà xuất bản - required'
        },
        DiaChi: {
          bsonType: 'string',
          description: 'Địa chỉ - required'
        }
      }
    }
  }
});

// TheoDoiMuonSach collection
db.createCollection('theodoimuonsachs', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['MaDocGia', 'MaSach', 'NgayMuon'],
      properties: {
        NgayMuon: {
          bsonType: 'date',
          description: 'Ngày mượn - required'
        },
        NgayTra: {
          bsonType: ['date', 'null'],
          description: 'Ngày trả'
        },
        TrangThai: {
          bsonType: 'string',
          enum: ['muon', 'tra'],
          description: 'Trạng thái mượn/trả'
        }
      }
    }
  }
});

// NhanVien collection
db.createCollection('nhanviens', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['MSNV', 'HoTenNV', 'Password', 'ChucVu', 'DiaChi', 'SoDienThoai'],
      properties: {
        MSNV: {
          bsonType: 'string',
          description: 'Mã số nhân viên - required'
        },
        HoTenNV: {
          bsonType: 'string',
          description: 'Họ tên nhân viên - required'
        },
        Password: {
          bsonType: 'string',
          description: 'Mật khẩu đã hash - required'
        },
        ChucVu: {
          bsonType: 'string',
          description: 'Chức vụ - required'
        },
        DiaChi: {
          bsonType: 'string',
          description: 'Địa chỉ - required'
        },
        SoDienThoai: {
          bsonType: 'string',
          description: 'Số điện thoại - required'
        }
      }
    }
  }
});

// Create indexes for better performance
print('Creating indexes...');

// DocGia indexes
db.docgias.createIndex({ 'MaDocGia': 1 }, { unique: true });
db.docgias.createIndex({ 'HoLot': 'text', 'Ten': 'text', 'DiaChi': 'text' });

// Sach indexes
db.sachs.createIndex({ 'MaSach': 1 }, { unique: true });
db.sachs.createIndex({ 'TenSach': 'text', 'NguonGoc': 'text' });
db.sachs.createIndex({ 'MaNXB': 1 });

// NhaXuatBan indexes
db.nhaxuatbans.createIndex({ 'MaNXB': 1 }, { unique: true });
db.nhaxuatbans.createIndex({ 'TenNXB': 'text' });

// TheoDoiMuonSach indexes
db.theodoimuonsachs.createIndex({ 'MaDocGia': 1, 'MaSach': 1 });
db.theodoimuonsachs.createIndex({ 'NgayMuon': 1 });
db.theodoimuonsachs.createIndex({ 'TrangThai': 1 });

// NhanVien indexes
db.nhanviens.createIndex({ 'MSNV': 1 }, { unique: true });

// Insert sample data
print('Inserting sample data...');

// Sample NhaXuatBan
db.nhaxuatbans.insertMany([
  {
    MaNXB: 'NXB001',
    TenNXB: 'Nhà xuất bản Trẻ',
    DiaChi: '161B Lý Chính Thắng, Quận 3, TP.HCM',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    MaNXB: 'NXB002', 
    TenNXB: 'Nhà xuất bản Kim Đồng',
    DiaChi: '55 Quang Trung, Hai Bà Trưng, Hà Nội',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Sample DocGia
db.docgias.insertMany([
  {
    MaDocGia: 'DG001',
    HoLot: 'Nguyễn Văn',
    Ten: 'An',
    NgaySinh: new Date('1990-01-15'),
    Phai: 'Nam',
    DiaChi: '123 Đường ABC, TP.HCM',
    DienThoai: '0901234567',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    MaDocGia: 'DG002',
    HoLot: 'Trần Thị',
    Ten: 'Bình',
    NgaySinh: new Date('1995-05-20'),
    Phai: 'Nữ',
    DiaChi: '456 Đường XYZ, TP.HCM',
    DienThoai: '0907654321',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Sample NhanVien (password: admin123)
db.nhanviens.insertOne({
  MSNV: 'NV001',
  HoTenNV: 'Quản trị viên',
  Password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
  ChucVu: 'Quản lý thư viện',
  DiaChi: '789 Đường DEF, TP.HCM',
  SoDienThoai: '0909876543',
  createdAt: new Date(),
  updatedAt: new Date()
});

print('Database initialization completed successfully!');
print('Collections created: docgias, sachs, nhaxuatbans, theodoimuonsachs, nhanviens');
print('Sample data inserted for testing');
print('Default admin account: MSNV=NV001, Password=admin123');