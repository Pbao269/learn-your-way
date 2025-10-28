# Chrome Web Store Assets Guide

## Required Images for Chrome Web Store

Based on Google's requirements, here's what you need to submit:

### 1. Store Icon (Required)
- **Size**: 128x128 pixels
- **Format**: PNG
- **Current**: ✅ You have `icons/icon128.png`
- **Action**: May need to enhance for store listing

### 2. Screenshots (Required - At least 1)
- **Size**: 1280x800 (preferred) or 640x400 pixels
- **Format**: PNG or JPEG (24-bit, no alpha)
- **Quantity**: 1-5 screenshots
- **Current**: ❌ Not created yet
- **Action**: Need to create

### 3. Small Promotional Tile (Required)
- **Size**: 440x280 pixels
- **Format**: PNG or JPEG (24-bit, no alpha)
- **Current**: ❌ Not created yet
- **Action**: Need to create

### 4. Marquee Promotional Tile (Optional)
- **Size**: 1400x560 pixels
- **Format**: PNG or JPEG (24-bit, no alpha)
- **Current**: ❌ Not created yet
- **Action**: Optional

## Quick Solutions

### Option 1: Simple Tool-Based Creation

**For Screenshots:**
1. Load your extension locally
2. Take screenshots of the extension in action on different documentation pages
3. Use any image editor to resize to 1280x800

**For Promotional Tiles:**
- Use the existing icon128.png as a base
- Add text: "LearnMyWay - 10-Minute Micro-Lessons"
- Design with a clean, minimal style

### Option 2: Use Existing Icon (Quick Start)

You can submit with just the existing icon128.png and create minimum viable assets:

```bash
# Convert your existing icon to store-compliant format
# The icon128.png should work as store icon
```

### Option 3: Create Professional Assets

Tools you can use:
- **Figma** (Free, web-based)
- **Canva** (Free tier available)
- **GIMP** (Free, open-source)
- **Photoshop** (Professional)

## Minimum Viable Assets for First Submission

To get started immediately:

1. **Store Icon**: ✅ Use existing `icons/icon128.png`
2. **Screenshot**: Take 1 screenshot at 1280x800 of your extension showing:
   - Lesson plan view with chunks
   - Or sprint view with timer and quiz

3. **Small Promo Tile**: Create a simple 440x280 image with:
   - Your logo
   - Text: "Turn docs into micro-lessons"
   - Clean, readable design

## Creating Assets with Command Line Tools

### Convert Icon (if needed)

```bash
# Use ImageMagick if installed
convert icons/icon128.png -resize 128x128 icons/store-icon.png

# Or use sips (built into macOS)
sips -z 128 128 icons/icon128.png --out icons/store-icon.png
```

### Create Simple Screenshots

```bash
# Take screenshot (macOS)
screencapture -T 2 screenshot.png

# Resize to 1280x800
sips -z 800 1280 screenshot.png --out store-screenshot.png
```

## Recommended Approach

### Step 1: Use What You Have
- **Store Icon**: Your existing `icons/icon128.png` ✅
- This alone allows you to create a listing

### Step 2: Take Functional Screenshots
1. Load extension in Chrome
2. Open Chrome DevTools (F12)
3. Navigate to extension
4. Take screenshots of key features:
   - Welcome screen
   - Lesson plan with chunks
   - Sprint view with timer
   - Quiz interface
   - Export functionality

### Step 3: Create Promotional Tile (Quick)

Create a simple promotional image:
- Size: 440x280
- Background: Your brand color
- Logo: Use your icon
- Text: "LearnMyWay - 10-Minute Micro-Lessons"
- Subtext: "Turn docs into bite-sized learning sprints"

### Step 4: Video (Optional)

If you want to add a global promo video:
- Create a 2-3 minute demo video
- Upload to YouTube
- Add the YouTube URL in store listing

## Tools to Create Assets

### Free Online Tools
- **Canva**: https://www.canva.com (templates for promo tiles)
- **Remove.bg**: Remove backgrounds from icons
- **Figma**: Professional design tool (free tier)

### Desktop Tools (macOS)
- **GIMP**: Free, powerful image editor
- **Preview**: Built-in (basic editing)
- **ImageMagick**: Command-line image processing

## Quick Start: Minimum Requirements

To submit **today**, you need:

1. ✅ **Store Icon**: Your existing `icons/icon128.png` - Already available!
2. ❌ **One Screenshot**: 1280x800 or 640x400 - Need to create
3. ❌ **Small Promo Tile**: 440x280 - Need to create

**Can create these in 15 minutes:**
- Take 1 screenshot of your extension
- Use Canva to create a simple 440x280 promo tile
- Submit!

## What to Show in Screenshots

Recommended screenshots to showcase:

1. **Main Feature**: Side panel showing lesson chunks from a documentation page
2. **Sprint Interface**: Timer, reading mode, quiz
3. **Progress Tracking**: Completed chunks with scores
4. **Export**: Showing Markdown export

## Example Screenshot Scenarios

**Scenario 1 - Lesson Plan View:**
- Screenshot the extension side panel
- Show 3-8 chunks with progress badges
- Visible "Start Sprint" buttons

**Scenario 2 - Sprint Interface:**
- Show timer, objectives, quiz
- Display AI-generated content
- Highlight the 10-minute focus session

**Scenario 3 - Results:**
- Show completed sprint with score
- Progress bar showing completion
- Export button visible

## Creating Assets Now

Would you like me to:
1. Generate placeholder screenshots using your existing icon?
2. Create a simple promo tile design?
3. Provide specific instructions for taking screenshots?

**Quick Answer**: You can start with:
- Your existing `icons/icon128.png` as store icon ✅
- Take 1-2 screenshots manually
- Create a simple 440x280 promo tile with your logo + text

This is enough to create your store listing!

