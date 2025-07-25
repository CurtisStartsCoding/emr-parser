# EMR Testing Guide - Super Simple!

## How to Install the Extension (Like Installing a Game)

### Step 1: Open Chrome Settings
1. Open Google Chrome on your computer
2. Type this in the address bar: `chrome://extensions/`
3. Press Enter

### Step 2: Turn on Developer Mode
1. Look for a switch in the top-right corner that says "Developer mode"
2. Click it to turn it ON (it should turn blue)

### Step 3: Load the Extension
1. Click the button that says "Load unpacked"
2. A file picker window will open
3. Navigate to your project folder
4. Find the folder called "dist" 
5. Click on the "dist" folder to select it
6. Click "Select Folder"

### Step 4: Check if it Worked
1. You should see a new extension appear in the list
2. Look for an icon in your Chrome toolbar (top-right of browser)
3. If you see the icon, it worked!

## How to Test on Real EMR

### Step 1: Go to Your EMR
1. Open your EMR system (like ECW, Athenahealth, Epic, or Onco)
2. Log in with your username and password
3. Go to a patient's page (where you see patient information)

### Step 2: Test the Extension
1. Click the extension icon in your Chrome toolbar
2. A popup window should open
3. Look for patient information like:
   - Name
   - Date of birth
   - Address
   - Phone number
   - Email

### Step 3: What You Should See
- **✅ Good**: Patient information appears in the popup
- **❌ Bad**: Empty fields or "No data found" message

## If Something Goes Wrong

### Extension Won't Load?
- Make sure you clicked on the "dist" folder (not the main project folder)
- Make sure "Developer mode" is turned ON (blue switch)

### No Data Shows Up?
- Make sure you're on a page with patient information
- Try refreshing the EMR page
- Try a different patient

### Extension Crashes?
- Go back to `chrome://extensions/`
- Find your extension and click "Reload"
- Try again

## What to Tell Me

When you test it, tell me:
1. Which EMR system you used
2. What patient information showed up (or didn't show up)
3. Any error messages you saw
4. Take a screenshot if you can

That's it! Simple as that! 🎉 