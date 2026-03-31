const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      walkDir(dirPath, callback);
    } else {
      callback(path.join(dirPath));
    }
  });
}

function getRelativePath(filePath) {
  // Get the directory depth relative to src
  const parts = filePath.split(path.sep);
  const srcIndex = parts.indexOf('src');
  const depth = parts.length - srcIndex - 2; // -2: srcIndex itself + filename
  
  if (depth <= 0) return './';
  return '../'.repeat(depth);
}

walkDir('./src', (file) => {
  if (!file.endsWith('.ts')) return;
  
  let content = fs.readFileSync(file, 'utf8');
  const originalContent = content;
  
  const relativePrefix = getRelativePath(file);
  
  // Replace all @/ imports
  content = content.replace(/from ['"]@\//g, `from '${relativePrefix}`);
  content = content.replace(/from ["']@\//g, `from "${relativePrefix}`);
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log(`Fixed: ${file}`);
  }
});

console.log('Done!');
