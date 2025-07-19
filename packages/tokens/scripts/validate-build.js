// scripts/validate-build.js
import fs from 'fs';
import path from 'path';

function validateBuild() {
  const distPath = path.join(process.cwd(), 'dist');
  const requiredFiles = [
    'tokens.css',
    'tokens.generated.ts',
    'index.js',
    'index.d.ts'
  ];
  
  console.log('🔍 Validating build outputs...\n');
  
  let passed = true;
  
  // Check required files exist
  requiredFiles.forEach(file => {
    const filePath = path.join(distPath, file);
    if (!fs.existsSync(filePath)) {
      console.log(`❌ Missing: ${file}`);
      passed = false;
    } else {
      console.log(`✅ Found: ${file}`);
    }
  });
  
  // Validate CSS contains @theme
  const cssPath = path.join(distPath, 'tokens.css');
  if (fs.existsSync(cssPath)) {
    const css = fs.readFileSync(cssPath, 'utf8');
    if (!css.includes('@theme')) {
      console.log('❌ CSS missing @theme directive');
      passed = false;
    } else {
      console.log('✅ CSS contains @theme directive');
    }
  }
  
  // Validate JS exports exist
  const jsPath = path.join(distPath, 'tokens.generated.ts');
  if (fs.existsSync(jsPath)) {
    const js = fs.readFileSync(jsPath, 'utf8');
    const exportCount = (js.match(/^export const /gm) || []).length;
    console.log(`✅ Found ${exportCount} token exports`);
    
    if (exportCount === 0) {
      console.log('❌ No token exports found');
      passed = false;
    }
  }
  
  console.log(`\n${passed ? '🎉 Build validation passed!' : '💥 Build validation failed!'}`);
  
  if (!passed) {
    process.exit(1);
  }
}

validateBuild();
