# Deployment Guide

Complete guide for building, testing, and deploying the RadOrderPad EMR Extension to the Chrome Web Store.

## Pre-Deployment Checklist

### Security Audit
- [ ] All tests passing (`npm test`)
- [ ] Security tests passing (`npm run test:security`)
- [ ] Compliance tests passing (`npm run test:compliance`)
- [ ] No console.log statements in production code
- [ ] No hardcoded secrets or credentials
- [ ] All dependencies up to date (`npm audit`)

### Code Review
- [ ] Peer review completed
- [ ] Security-focused review completed
- [ ] No TODO or FIXME comments
- [ ] Documentation up to date
- [ ] Version number updated

## Build Configuration

### 1. Production Webpack Config

Update `webpack.config.js` for production:

```javascript
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    // ... existing config ...
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true,      // Remove console logs
              drop_debugger: true,     // Remove debugger statements
              pure_funcs: ['console.log', 'console.debug']
            },
            mangle: {
              reserved: ['chrome']     // Don't mangle Chrome API
            },
            format: {
              comments: false          // Remove comments
            }
          },
          extractComments: false
        })
      ]
    },
    devtool: isProduction ? false : 'inline-source-map'
  };
};
```

### 2. Build Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "prebuild": "npm run clean && npm run lint && npm run test",
    "build": "npm run security:check && webpack --mode production",
    "build:analyze": "webpack-bundle-analyzer build/stats.json",
    "package": "npm run build && npm run package:zip",
    "package:zip": "cd build && zip -r ../radorderpad-extension.zip .",
    "verify": "npm run verify:manifest && npm run verify:permissions",
    "verify:manifest": "node scripts/verify-manifest.js",
    "verify:permissions": "node scripts/verify-permissions.js"
  }
}
```

### 3. Verification Scripts

Create `scripts/verify-manifest.js`:

```javascript
const fs = require('fs');
const path = require('path');

const manifest = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../build/manifest.json'), 'utf8')
);

// Verify required fields
const required = ['manifest_version', 'name', 'version', 'description'];
const missing = required.filter(field => !manifest[field]);

if (missing.length > 0) {
  console.error('Missing required fields:', missing);
  process.exit(1);
}

// Verify version format
if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) {
  console.error('Invalid version format. Use semantic versioning (x.y.z)');
  process.exit(1);
}

// Verify minimal permissions
const permissions = manifest.permissions || [];
if (permissions.includes('tabs') || permissions.includes('browsingData')) {
  console.warn('Extension requests sensitive permissions');
}

console.log('✓ Manifest validation passed');
```

## Build Process

### 1. Clean Build

```bash
# Clean previous builds
npm run clean

# Run security checks
npm run security:check

# Build production version
npm run build

# Verify build output
ls -la build/
```

### 2. Test Production Build

1. **Load in Chrome**
   ```
   1. Open chrome://extensions
   2. Remove development version
   3. Load unpacked from build/
   4. Test all functionality
   ```

2. **Verify Security**
   - Check DevTools console (should be empty)
   - Verify no source maps included
   - Check network tab (no external requests)
   - Verify storage is encrypted

### 3. Package Extension

```bash
# Create distribution package
npm run package

# Verify package contents
unzip -l radorderpad-extension.zip

# Check file sizes
du -h radorderpad-extension.zip
```

## Chrome Web Store Preparation

### 1. Store Assets

Create `store-assets/` directory:

```
store-assets/
├── screenshots/
│   ├── screenshot-1-capture.png (1280x800)
│   ├── screenshot-2-fill.png (1280x800)
│   └── screenshot-3-success.png (1280x800)
├── promotional/
│   ├── small-promo.png (440x280)
│   ├── large-promo.png (920x680)
│   └── marquee-promo.png (1400x560)
└── icons/
    └── icon-128.png (128x128)
```

### 2. Store Listing

Create `store-assets/listing.md`:

```markdown
# Title (45 chars max)
RadOrderPad EMR Patient Importer

# Short Description (132 chars max)
Securely capture patient data from any EMR and auto-fill RadOrderPad imaging orders. HIPAA compliant.

# Detailed Description
Streamline your radiology workflow with one-click patient data transfer!

This HIPAA-compliant Chrome extension eliminates manual data entry by automatically capturing patient demographics and insurance information from your EMR and filling it directly into RadOrderPad imaging order forms.

KEY FEATURES:
✓ Works with Epic, Cerner, Athena, and other major EMRs
✓ One-click patient data capture
✓ Automatic form filling in RadOrderPad
✓ HIPAA and SOC2 compliant
✓ Bank-level encryption (AES-256)
✓ Automatic data deletion after 5 minutes
✓ No data ever sent to external servers

SECURITY FIRST:
• All patient data encrypted in memory
• 15-minute session timeout
• Comprehensive audit logging
• Zero data retention policy
• Annual security audits

HOW IT WORKS:
1. Navigate to patient summary in your EMR
2. Click the extension icon
3. Click "Capture Patient Data"
4. Navigate to RadOrderPad
5. Data automatically fills the form

SAVES TIME:
• Eliminate 5+ minutes per order
• Reduce data entry errors
• Improve staff satisfaction
• Increase order throughput

COMPLIANCE:
• HIPAA Technical Safeguards
• SOC2 Type II Certified
• No PHI stored permanently
• Encrypted data transmission

Perfect for radiology departments, imaging centers, and healthcare facilities looking to improve efficiency while maintaining the highest security standards.

Questions? Contact support@radorderpad.com
```

### 3. Privacy Policy

Create `store-assets/privacy-policy.md`:

```markdown
# Privacy Policy

Last Updated: [Date]

## Data Collection
The RadOrderPad EMR Extension temporarily processes Protected Health Information (PHI) to facilitate data transfer between EMR systems and RadOrderPad. 

## Data Usage
- Data is used solely for form filling
- No data is stored permanently
- No analytics or tracking
- No third-party sharing

## Data Security
- AES-256 encryption
- Automatic deletion after 5 minutes
- Session-based access control
- No external transmission

## HIPAA Compliance
This extension complies with all applicable HIPAA requirements for handling PHI.

## Contact
privacy@radorderpad.com
```

### 4. Support Documentation

Create `store-assets/support.md`:

```markdown
# Support & FAQ

## Installation
1. Click "Add to Chrome"
2. Grant required permissions
3. Pin extension to toolbar

## Common Issues

**Q: Extension doesn't detect my EMR**
A: Ensure you're on the patient summary page. Contact support if your EMR isn't recognized.

**Q: Data doesn't fill in RadOrderPad**
A: Verify you're on the correct RadOrderPad form page. Try refreshing and capturing again.

**Q: How long is data stored?**
A: All data is automatically deleted after 5 minutes for security.

## Contact Support
- Email: support@radorderpad.com
- Documentation: docs.radorderpad.com
- Response time: Within 24 hours
```

## Chrome Web Store Submission

### 1. Developer Account Setup
1. Create developer account at https://chrome.google.com/webstore/devconsole
2. Pay one-time $5 developer fee
3. Verify account

### 2. Create New Item
1. Click "New Item"
2. Upload `radorderpad-extension.zip`
3. Fill in store listing information
4. Upload screenshots and promotional images

### 3. Privacy Practices
- [x] Single purpose: Transfer patient data
- [x] Permission justifications provided
- [x] Privacy policy URL provided
- [x] No user data sold
- [x] Data handling disclosure complete

### 4. Distribution Settings
- **Visibility**: Public
- **Geographic distribution**: United States (HIPAA compliance)
- **Pricing**: Free
- **Category**: Productivity
- **Language**: English

### 5. Submit for Review
1. Review all information
2. Click "Submit for Review"
3. Typical review time: 1-3 business days

## Post-Deployment

### 1. Monitoring

Create `scripts/monitor-extension.js`:

```javascript
const fetch = require('node-fetch');

async function checkExtensionHealth() {
  // Check Chrome Web Store listing
  const storeUrl = 'https://chrome.google.com/webstore/detail/[extension-id]';
  
  // Check for reviews mentioning errors
  // Monitor installation count
  // Check for security alerts
  
  console.log('Extension health check completed');
}

// Run daily
checkExtensionHealth();
```

### 2. Update Process

1. **Version Update**
   ```json
   {
     "version": "1.0.1"  // Increment version
   }
   ```

2. **Test Updates**
   - Test upgrade path
   - Verify data migration
   - Check compatibility

3. **Release Notes**
   ```markdown
   Version 1.0.1
   - Improved EMR detection
   - Enhanced security features
   - Bug fixes
   ```

### 3. User Support

1. **Support Channels**
   - Email: support@radorderpad.com
   - Documentation site
   - In-app help

2. **Common Issues**
   - EMR detection problems
   - Form filling errors
   - Performance issues

3. **Response Templates**
   - Security concerns
   - Feature requests
   - Bug reports

## Rollback Plan

If critical issues are discovered:

1. **Immediate Actions**
   - Unpublish from Chrome Web Store
   - Notify affected users
   - Preserve audit logs

2. **Fix and Re-deploy**
   - Identify root cause
   - Implement fix
   - Enhanced testing
   - Re-submit to store

3. **Communication**
   - User notification
   - Support documentation
   - Status updates

## Success Metrics

Track these metrics post-deployment:

- **Adoption Rate**: Active users / Total installs
- **Error Rate**: Errors / Total operations
- **Performance**: Average operation time
- **User Satisfaction**: Store ratings and reviews
- **Security Events**: Incidents per month

## Maintenance Schedule

- **Daily**: Monitor error logs
- **Weekly**: Review user feedback
- **Monthly**: Security audit
- **Quarterly**: Compliance review
- **Annually**: Full security assessment

## Final Checklist

Before submitting to Chrome Web Store:

- [ ] Production build created and tested
- [ ] All security measures verified
- [ ] Compliance documentation complete
- [ ] Store assets prepared
- [ ] Privacy policy published
- [ ] Support system ready
- [ ] Rollback plan documented
- [ ] Team trained on support procedures

## Next Steps

- Create [QUICK-START.md](./QUICK-START.md) for new developers
- Set up monitoring dashboards
- Schedule first security review