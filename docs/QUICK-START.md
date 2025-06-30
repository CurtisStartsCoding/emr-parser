# Quick Start Guide

Get the RadOrderPad EMR Extension up and running in 15 minutes!

## Prerequisites

- Node.js 18+ installed
- Chrome browser
- Git
- Basic TypeScript knowledge

## 5-Minute Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/radorderpad/emr-extension.git
cd radorderpad-emr-extension

# Install dependencies
npm install
```

### 2. Build Extension

```bash
# Run development build
npm run dev

# This watches for changes and rebuilds automatically
```

### 3. Load in Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `build` folder from the project
5. Pin the extension to your toolbar

## Test the Extension

### 1. Test Data Capture

Navigate to any webpage and add this test HTML to the console:

```javascript
document.body.innerHTML = `
  <div>
    <div>Patient Name: John Smith</div>
    <div>DOB: 01/15/1980</div>
    <div>Phone: (555) 123-4567</div>
    <div>Address: 123 Main St</div>
    <div>City: Boston</div>
    <div>State: MA</div>
    <div>ZIP: 02101</div>
  </div>
`;
```

Now click the extension icon and click "Capture Patient Data".

### 2. Test Form Filling

1. Navigate to `https://radorderpad.com` (or your local instance)
2. Go to a patient form page
3. Click the extension icon
4. Click "Fill RadOrderPad"

## Project Structure

```
radorderpad-extension/
├── src/
│   ├── lib/          # Core modules (parser, storage, filler)
│   ├── popup/        # Extension popup UI
│   ├── content/      # Content script (runs on pages)
│   ├── background/   # Service worker
│   └── security/     # Security modules
├── test/             # All tests
├── build/            # Built extension (git ignored)
└── docs/             # Documentation
```

## Key Files to Know

1. **`src/lib/parser.ts`** - Extracts data from EMRs
2. **`src/lib/filler.ts`** - Fills RadOrderPad forms
3. **`src/popup/popup.ts`** - Extension UI logic
4. **`src/content/content.ts`** - Runs on web pages

## Common Development Tasks

### Add Support for a New EMR

1. Edit `src/lib/parser.ts`
2. Add EMR detection logic:

```typescript
'NewEMR': [
  () => document.querySelector('.newemr-logo'),
  () => window.location.hostname.includes('newemr')
]
```

3. Test detection and parsing
4. Add tests in `test/unit/parser.test.ts`

### Modify Form Filling

1. Edit `src/lib/filler.ts`
2. Update field selectors:

```typescript
await this.fillField('[name="patientName"]', data.firstName);
```

### Update Security Settings

1. Session timeout: `src/security/access.ts`
2. Encryption: `src/security/encryption.ts`
3. Data retention: `src/lib/storage.ts` (5-minute timeout)

## Quick Commands

```bash
# Development
npm run dev          # Start development build
npm test            # Run all tests
npm run lint        # Check code style

# Production
npm run build       # Create production build
npm run package     # Create .zip for Chrome Store

# Testing
npm test -- --watch # Run tests in watch mode
npm run test:security # Run security tests only
```

## Debugging Tips

### 1. Check Console Logs

1. Right-click extension icon → "Inspect popup"
2. Check for errors in console

### 2. Debug Content Script

1. Open DevTools on the webpage
2. Look for `content.js` in Sources
3. Set breakpoints

### 3. View Storage

```javascript
// In extension console
chrome.storage.local.get(null, (data) => console.log(data));
```

## Security Reminders

⚠️ **NEVER**:
- Log patient data to console
- Store unencrypted PHI
- Remove the 5-minute auto-delete
- Disable session timeouts

✅ **ALWAYS**:
- Test with fake patient data
- Run security tests before commits
- Keep dependencies updated
- Follow HIPAA guidelines

## Common Issues

### Extension Not Loading
- Check for errors in `chrome://extensions`
- Verify `build` folder exists
- Try rebuilding: `npm run build`

### Parser Not Finding Data
- Check EMR detection is working
- Verify HTML structure matches
- Add new parsing strategy if needed

### Form Not Filling
- Verify you're on RadOrderPad
- Check field selectors match
- Look for console errors

## Next Steps

1. **Full Setup**: See [SETUP-GUIDE.md](./SETUP-GUIDE.md)
2. **Development**: See [DEVELOPMENT-GUIDE.md](./DEVELOPMENT-GUIDE.md)
3. **Testing**: See [TESTING-GUIDE.md](./TESTING-GUIDE.md)
4. **Deployment**: See [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)

## Get Help

- **Slack**: #radorderpad-dev
- **Email**: dev-support@radorderpad.com
- **Docs**: [Full Documentation](./README.md)

---

**Remember**: This extension handles Protected Health Information (PHI). Always follow security best practices and HIPAA guidelines!