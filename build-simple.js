const fs = require('fs');
const path = require('path');

console.log('🔨 Building Simple ModMed EMR Extension Package...');

// Create distribution directory
const distDir = path.join(__dirname, 'modmed-extension');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

// Essential extension files to copy
const extensionFiles = [
    'manifest.json',
    'src/assets/icons/icon16.png',
    'src/assets/icons/icon48.png',
    'src/assets/icons/icon128.png'
];

// Create directories
const dirsToCreate = [
    'src/assets/icons'
];

dirsToCreate.forEach(dir => {
    const fullPath = path.join(distDir, dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
});

// Copy extension files
extensionFiles.forEach(file => {
    const sourcePath = path.join(__dirname, file);
    const destPath = path.join(distDir, file);
    
    if (fs.existsSync(sourcePath)) {
        // Create directory if it doesn't exist
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }
        
        fs.copyFileSync(sourcePath, destPath);
        console.log(`✅ Copied: ${file}`);
    } else {
        console.log(`⚠️  Warning: ${file} not found`);
    }
});

// Copy test page
fs.copyFileSync(
    path.join(__dirname, 'test-modmed-simple.html'),
    path.join(distDir, 'test-page.html')
);
console.log('✅ Copied: test-page.html');

// Copy installation guide
fs.copyFileSync(
    path.join(__dirname, 'MODMED-INSTALL-GUIDE.md'),
    path.join(distDir, 'INSTALLATION-GUIDE.md')
);
console.log('✅ Copied: INSTALLATION-GUIDE.md');

// Create a simple README
const readmeContent = `# ModMed EMR Extension

This Chrome extension automatically captures patient and insurance information from ModMed EMR systems.

## 📦 What's Included
- Chrome extension files
- Test page (test-page.html)
- Installation guide (INSTALLATION-GUIDE.md)

## 🚀 Quick Start
1. Read the INSTALLATION-GUIDE.md file
2. Follow the step-by-step instructions
3. Test with test-page.html

## 📋 Features
- Extracts patient demographics
- Captures insurance information (primary & secondary)
- Automatically fills forms
- Works with ModMed EMR systems

## 🧪 Testing
Open test-page.html in Chrome to test the extension.

## 📞 Support
Refer to INSTALLATION-GUIDE.md for help.

---
Built: ${new Date().toLocaleDateString()}
Version: 1.0.0
`;

fs.writeFileSync(path.join(distDir, 'README.md'), readmeContent);
console.log('✅ Created: README.md');

// Create a simple installation note
const installNote = `📋 INSTALLATION NOTE

This extension requires the source code to be compiled before use.
For a ready-to-use version, please contact your IT department.

The files in this folder are for development/testing purposes.
`;

fs.writeFileSync(path.join(distDir, 'INSTALLATION-NOTE.txt'), installNote);
console.log('✅ Created: INSTALLATION-NOTE.txt');

console.log('\n🎉 Extension package created successfully!');
console.log(`📁 Package folder: ${distDir}`);
console.log('\n📋 For Users:');
console.log('1. Send the "modmed-extension" folder to users');
console.log('2. Users should read INSTALLATION-GUIDE.md');
console.log('3. Users can test with test-page.html');
console.log('\n📄 Package includes:');
console.log('- Extension files (need compilation)');
console.log('- test-page.html (test page)');
console.log('- INSTALLATION-GUIDE.md (user guide)');
console.log('- README.md (overview)');
console.log('- INSTALLATION-NOTE.txt (important note)'); 