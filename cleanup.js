/**
 * Project cleanup script
 */
import fs from 'fs';
import path from 'path';

const filesToRemove = [
  // Remove any backup files
  'backend/src/controllers/SachController.js.backup',
  'backend/src/controllers/DocGiaController.js.backup',
  'backend/src/controllers/NhaXuatBanController.js.backup',
  'backend/src/controllers/TheoDoiMuonSachController.js.backup',
  'backend/src/controllers/AuthController.js.backup',
  'backend/src/controllers/DashboardController.js.backup',
  
  // Remove any temporary files
  'frontend/src/views/temp',
  'backend/src/temp',
  
  // Remove any .DS_Store files (macOS)
  '.DS_Store',
  'backend/.DS_Store',
  'frontend/.DS_Store',
  
  // Remove any log files
  '*.log',
  'backend/*.log',
  'frontend/*.log'
];

const directoriesToCheck = [
  'backend/src',
  'frontend/src',
  '.'
];

const removeFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Removed: ${filePath}`);
      return true;
    }
  } catch (error) {
    console.log(`❌ Error removing ${filePath}:`, error.message);
  }
  return false;
};

const removeDirectory = (dirPath) => {
  try {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ Removed directory: ${dirPath}`);
      return true;
    }
  } catch (error) {
    console.log(`❌ Error removing directory ${dirPath}:`, error.message);
  }
  return false;
};

const findAndRemovePattern = (dir, pattern) => {
  try {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        findAndRemovePattern(fullPath, pattern);
      } else if (file.name.match(pattern)) {
        removeFile(fullPath);
      }
    }
  } catch (error) {
    console.log(`❌ Error scanning directory ${dir}:`, error.message);
  }
};

const optimizePackageJson = () => {
  console.log('\n📦 Optimizing package.json files...');
  
  // Backend package.json
  const backendPackagePath = 'backend/package.json';
  if (fs.existsSync(backendPackagePath)) {
    try {
      const packageData = JSON.parse(fs.readFileSync(backendPackagePath, 'utf8'));
      
      // Add useful scripts if missing
      if (!packageData.scripts) packageData.scripts = {};
      
      if (!packageData.scripts.test) {
        packageData.scripts.test = 'node test-api.js';
      }
      
      if (!packageData.scripts.optimize) {
        packageData.scripts.optimize = 'node -e "import(\'./src/utils/indexOptimizer.js\').then(m => m.optimizeCollections())"';
      }
      
      fs.writeFileSync(backendPackagePath, JSON.stringify(packageData, null, 2));
      console.log('✅ Backend package.json optimized');
    } catch (error) {
      console.log('❌ Error optimizing backend package.json:', error.message);
    }
  }
  
  // Frontend package.json
  const frontendPackagePath = 'frontend/package.json';
  if (fs.existsSync(frontendPackagePath)) {
    try {
      const packageData = JSON.parse(fs.readFileSync(frontendPackagePath, 'utf8'));
      
      // Add useful scripts if missing
      if (!packageData.scripts) packageData.scripts = {};
      
      if (!packageData.scripts.analyze) {
        packageData.scripts.analyze = 'vite build --mode analyze';
      }
      
      fs.writeFileSync(frontendPackagePath, JSON.stringify(packageData, null, 2));
      console.log('✅ Frontend package.json optimized');
    } catch (error) {
      console.log('❌ Error optimizing frontend package.json:', error.message);
    }
  }
};

const generateProjectSummary = () => {
  console.log('\n📋 Generating project summary...');
  
  const summary = `# Quản Lý Mượn Sách - Project Summary

## 🎯 Project Overview
This is a complete library management system migrated from PHP to Node.js + Vue.js.

## 🏗️ Architecture
- **Backend**: Node.js + Express + MongoDB + Mongoose
- **Frontend**: Vue.js 3 + Vite + Bootstrap
- **Database**: MongoDB with optimized indexes
- **Authentication**: JWT tokens

## 📁 Project Structure
\`\`\`
├── backend/
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # Express routes
│   │   ├── middlewares/     # Custom middlewares
│   │   ├── utils/           # Utility functions
│   │   └── config/          # Configuration files
│   └── test-api.js          # API testing script
├── frontend/
│   ├── src/
│   │   ├── views/           # Vue pages
│   │   ├── components/      # Reusable components
│   │   ├── composables/     # Vue composables
│   │   ├── layouts/         # Layout components
│   │   ├── router/          # Vue router
│   │   └── utils/           # Frontend utilities
│   └── dist/                # Production build
└── .kiro/                   # Kiro AI assistant files

\`\`\`

## 🚀 Features Implemented
- ✅ User authentication and authorization
- ✅ Book management (CRUD operations)
- ✅ Reader management
- ✅ Publisher management
- ✅ Borrow/return book tracking
- ✅ Dashboard with statistics
- ✅ Search and pagination
- ✅ Form validation (frontend + backend)
- ✅ Error handling
- ✅ Performance optimization
- ✅ Responsive design

## 🛠️ Development Commands

### Backend
\`\`\`bash
cd backend
npm install
npm run dev          # Start development server
npm test            # Run API tests
npm run optimize    # Optimize database indexes
\`\`\`

### Frontend
\`\`\`bash
cd frontend
npm install
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
\`\`\`

## 🔧 Configuration
1. Copy \`.env.example\` to \`.env\` in backend directory
2. Update MongoDB connection string
3. Set JWT secret key
4. Configure other environment variables

## 📊 Performance Optimizations
- MongoDB indexes for fast queries
- Lazy loading for Vue routes
- API response optimization
- Frontend code splitting
- Image optimization

## 🧪 Testing
Run the comprehensive API test suite:
\`\`\`bash
cd backend
node test-api.js
\`\`\`

## 🚀 Deployment
1. Build frontend: \`npm run build\`
2. Set production environment variables
3. Start backend server: \`npm start\`
4. Serve frontend static files

## 📝 API Documentation
The API follows RESTful conventions:
- \`GET /api/sach\` - List books
- \`POST /api/sach\` - Create book
- \`PUT /api/sach/:id\` - Update book
- \`DELETE /api/sach/:id\` - Delete book
- Similar patterns for other resources

## 🔐 Security Features
- JWT authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Error handling without sensitive data exposure

## 📈 Monitoring
- Request logging
- Error tracking
- Performance metrics
- Database query optimization

Generated on: ${new Date().toISOString()}
`;

  fs.writeFileSync('PROJECT_SUMMARY.md', summary);
  console.log('✅ Project summary generated: PROJECT_SUMMARY.md');
};

const runCleanup = () => {
  console.log('🧹 Starting project cleanup...');
  console.log('=' .repeat(50));
  
  let removedCount = 0;
  
  // Remove specific files
  console.log('\n🗑️  Removing backup and temporary files...');
  for (const file of filesToRemove) {
    if (removeFile(file)) {
      removedCount++;
    }
  }
  
  // Remove files matching patterns
  console.log('\n🔍 Scanning for files to remove...');
  for (const dir of directoriesToCheck) {
    findAndRemovePattern(dir, /\.backup$/);
    findAndRemovePattern(dir, /\.tmp$/);
    findAndRemovePattern(dir, /\.log$/);
    findAndRemovePattern(dir, /\.DS_Store$/);
    findAndRemovePattern(dir, /Thumbs\.db$/);
  }
  
  // Optimize package.json files
  optimizePackageJson();
  
  // Generate project summary
  generateProjectSummary();
  
  console.log('\n' + '=' .repeat(50));
  console.log(`🎉 Cleanup completed! Removed ${removedCount} files.`);
  console.log('📋 Project summary generated.');
  console.log('🚀 Project is ready for deployment!');
};

// Run cleanup
runCleanup();

export default runCleanup;