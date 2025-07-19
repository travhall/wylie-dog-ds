// scripts/monitor-bundle-size.js
import fs from 'fs';
import path from 'path';

const SIZE_LIMITS = {
  'tokens.generated.ts': 50 * 1024, // 50KB
  'tokens.css': 30 * 1024,          // 30KB
  'index.js': 20 * 1024             // 20KB
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
