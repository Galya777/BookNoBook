# Case Opening Game

## Overview
This is a Case Opening Game built with HTML, CSS, and JavaScript.
The game features draggable cases containing random images and prices.
Players can drag a case to a special slot to keep it.

## Features
- Drag & Drop interface for opening cases.
- Randomized images and prices inside cases.
- Visual representation for closed and opened cases.
- White sidebar displaying prices.
- Background image for game atmosphere.
- White drop zone with clear instructions.

## File Structure
/game
│
├── index.html         ← Main HTML file
├── style.css          ← CSS styling
├── script.js          ← Game logic
├── background.jpg     ← Game background image
├── book.png           ← Closed case image
├── opened.jpg         ← Opened case image
├── /case_images       ← Folder containing case images (1.png, 2.png, etc.)
└── README.md          ← Project description

## How to Play
1. Open `index.html` in your browser.
2. Drag a closed case to the white drop zone labeled "Drag your case here to keep it!".
3. The case will open, showing its hidden image and price.
4. The price will appear in the price sidebar.

## Customization
- Background Image: Replace `background.jpg` with your own image.
- Case Images: Place images inside `/case_images` and name them `1.png`, `2.png`, etc.
- Prices: Modify them in `script.js` inside the `prices` array.

## Requirements
- Modern web browser with JavaScript enabled.

## Credits
Created as a drag-and-drop case opening game project.
