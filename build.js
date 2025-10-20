const fs = require('fs');
const path = require('path');

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Simple file copy and basic transformation
function copyAndTransform(srcDir, destDir) {
  const items = fs.readdirSync(srcDir);
  
  for (const item of items) {
    const srcPath = path.join(srcDir, item);
    const destPath = path.join(destDir, item);
    
    if (fs.statSync(srcPath).isDirectory()) {
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      copyAndTransform(srcPath, destPath);
    } else if (item.endsWith('.ts') && !item.endsWith('.d.ts')) {
      // Simple TypeScript to JavaScript transformation
      let content = fs.readFileSync(srcPath, 'utf8');
      
      // Remove TypeScript-specific syntax (basic)
      content = content
        .replace(/import\s+type\s+[^;]+;/g, '') // Remove type imports
        .replace(/:\s*[A-Za-z<>[\]|&\s]+(?=\s*[=,\)\{;])/g, '') // Remove type annotations
        .replace(/as\s+[A-Za-z<>[\]|&\s]+/g, '') // Remove type assertions
        .replace(/\?\s*:/g, ':') // Remove optional property markers
        .replace(/interface\s+[^{]+\{[^}]*\}/g, '') // Remove interfaces
        .replace(/type\s+[^=]+=\s*[^;]+;/g, ''); // Remove type aliases
      
      const jsPath = destPath.replace('.ts', '.js');
      fs.writeFileSync(jsPath, content);
      console.log(`Transformed: ${srcPath} -> ${jsPath}`);
    } else {
      // Copy non-TypeScript files as-is
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('Starting custom build process...');
copyAndTransform(path.join(__dirname, 'src'), distDir);
console.log('Build completed successfully!');