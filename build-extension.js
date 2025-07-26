const fs = require('fs');
const path = require('path');

console.log('🔨 Building ModMed EMR Extension...');

// Create distribution directory
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

// Copy necessary files
const filesToCopy = [
    'manifest.json',
    'src/background/background.ts',
    'src/content/content.ts',
    'src/popup/popup.html',
    'src/popup/popup.css',
    'src/popup/popup.ts',
    'src/lib/emr/emr-strategy-manager.ts',
    'src/lib/emr/emr-strategy.ts',
    'src/lib/emr/strategies/modmed-strategy.ts',
    'src/lib/emr/strategies/athenahealth-strategy.ts',
    'src/lib/emr/strategies/ecw-strategy.ts',
    'src/lib/emr/strategies/onco-strategy.ts',
    'src/lib/simple-universal-parser.ts',
    'src/lib/storage.ts',
    'src/types/index.ts',
    'src/assets/icons/icon16.png',
    'src/assets/icons/icon48.png',
    'src/assets/icons/icon128.png'
];

// Create directories
const dirsToCreate = [
    'src/background',
    'src/content',
    'src/popup',
    'src/lib/emr/strategies',
    'src/lib',
    'src/types',
    'src/assets/icons'
];

dirsToCreate.forEach(dir => {
    const fullPath = path.join(distDir, dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
});

// Copy files
filesToCopy.forEach(file => {
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
    path.join(distDir, 'test-modmed-simple.html')
);
console.log('✅ Copied: test-modmed-simple.html');

// Copy installation guide
fs.copyFileSync(
    path.join(__dirname, 'MODMED-INSTALL-GUIDE.md'),
    path.join(distDir, 'INSTALLATION-GUIDE.md')
);
console.log('✅ Copied: INSTALLATION-GUIDE.md');

// Create a simple README for the distribution
const readmeContent = `# ModMed EMR Extension

This Chrome extension automatically captures patient and insurance information from ModMed EMR systems and fills it into RadOrderPad forms.

## 📦 What's Included
- Chrome extension files
- Test page for verification
- Installation guide for basic users

## 🚀 Quick Start
1. Open the INSTALLATION-GUIDE.md file
2. Follow the step-by-step instructions
3. Test with the test-modmed-simple.html file

## 📋 Features
- Extracts patient demographics
- Captures insurance information (primary & secondary)
- Automatically fills forms
- Works with ModMed EMR systems

## 🧪 Testing
Open test-modmed-simple.html in Chrome to test the extension functionality.

## 📞 Support
If you need help, refer to the INSTALLATION-GUIDE.md file or contact your IT department.

---
Built on: ${new Date().toISOString()}
Version: 1.0.0
`;

fs.writeFileSync(path.join(distDir, 'README.md'), readmeContent);
console.log('✅ Created: README.md');

console.log('\n🎉 Extension built successfully!');
console.log(`📁 Distribution folder: ${distDir}`);
console.log('\n📋 Next Steps:');
console.log('1. Zip the "dist" folder');
console.log('2. Send the zip file to users');
console.log('3. Users can follow the INSTALLATION-GUIDE.md instructions');
console.log('\n📄 Files included:');
console.log('- Chrome extension files');
console.log('- test-modmed-simple.html (test page)');
console.log('- INSTALLATION-GUIDE.md (user guide)');
console.log('- README.md (overview)'); 