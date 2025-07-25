const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src/assets/icons');
const destDir = path.join(__dirname, '../dist/icons');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

['icon16.png', 'icon48.png', 'icon128.png'].forEach(file => {
  const src = path.join(srcDir, file);
  const dest = path.join(destDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${file}`);
  } else {
    console.warn(`Missing: ${file}`);
  }
}); 