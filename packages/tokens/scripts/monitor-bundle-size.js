// scripts/monitor-bundle-size.js
import fs from 'fs';
import path from 'path';

const SIZE_LIMITS = {
  'tokens.generated.ts': 100 * 1024, // 100KB (doubled for dark mode)
  'tokens.css': 60 * 1024,           // 60KB (doubled for dark mode)
  'index.js': 50 * 1024              // 50KB (doubled for dark mode)
};

function checkBundleSize() {
  const distPath = path.join(process.cwd(), 'dist');
  let passed = true;
  
  console.log('📊 Bundle Size Report\n');
  
  Object.entries(SIZE_LIMITS).forEach(([filename, limit]) => {
    const filePath = path.join(distPath, filename);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  ${filename}: File not found`);
      return;
    }
    
    const stats = fs.statSync(filePath);
    const size = stats.size;
    const percentage = ((size / limit) * 100).toFixed(1);
    
    if (size > limit) {
      console.log(`❌ ${filename}: ${size} bytes (${percentage}% of limit) - EXCEEDS LIMIT`);
      passed = false;
    } else {
      console.log(`✅ ${filename}: ${size} bytes (${percentage}% of limit)`);
    }
  });
  
  console.log(`\n${passed ? '🎉 All bundles within size limits!' : '💥 Some bundles exceed size limits!'}`);
  
  if (!passed) {
    process.exit(1);
  }
}

checkBundleSize();
