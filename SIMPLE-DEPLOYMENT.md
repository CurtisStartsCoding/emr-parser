# Simple EMR Parser Deployment

## Easiest Way to Deploy

### What You Need:
1. Your CDS app (where you want patient data)
2. This browser extension (extracts data from EMR)
3. One download link on your platform

### How It Works:
1. Doctor opens patient in EMR (Epic, Athenahealth, etc.)
2. Clicks extension icon in browser
3. Extension grabs patient data (name, age, meds, etc.)
4. Sends it to your CDS app
5. Your CDS app gets the data and fills patient fields

### Deployment Steps:

#### Step 1: Prepare Extension (5 minutes)
1. Right-click your extension folder
2. Select "Send to" → "Compressed (zipped) folder"
3. Upload the ZIP file to your platform
4. Create a download link

#### Step 2: Add to Your Platform
1. Add a button that says "Download EMR Parser"
2. Link it to your ZIP file
3. Add simple instructions

#### Step 3: User Installation (2 minutes per user)
1. User clicks "Download EMR Parser" on your platform
2. ZIP downloads to their computer
3. User right-clicks ZIP → "Extract all"
4. User goes to Chrome extensions (chrome://extensions/)
5. User enables "Developer Mode" (top right)
6. User clicks "Load unpacked"
7. User selects the extracted folder
8. Extension works immediately

### What You Don't Need:
- Chrome Web Store approval
- Weeks of waiting
- Complex setup
- Web servers
- Databases
- Cloud deployment

### Limitations:
- Users must install manually (Chrome security requirement)
- No silent installation possible
- Each user does 2-minute setup once

### For Companies:
- IT can push extension to all computers automatically
- Enterprise deployment available
- Group Policy can handle installation

### Data Flow:
EMR → Extension → Your CDS App → Patient fields filled

That's it. Simple, fast, works immediately. 