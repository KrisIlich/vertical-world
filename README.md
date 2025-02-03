# Vertical World Platformer Game

## Overview

A **class-based React component** that implements a vertical-scrolling platformer game within an HTML canvas. This game features random platform generation, collectible checkpoints, hazards, and mobile-friendly joystick controls. Perfect for anyone looking to add a simple yet fun mini-game to their React or JavaScript project.

---

## Features

- **Class-Based React Component**  
  - Manages game state, rendering, and input handling in a single file.
  
- **Vertical Scrolling Platformer**  
  - Randomly generated platforms and hazards spanning a tall “world” (up to 24,000px in height).
  - A “floor” at the bottom and optional victory condition at the top.

- **Checkpoint System**  
  - Automatically places multiple checkpoints on platforms.
  - Displays a popup message when a checkpoint is reached.

- **Hazards & Death Count**  
  - Red hazards cause the player to respawn at the bottom.
  - Players lose if they die five times, triggering a “You Lose!” screen.

- **Mobile Controls**  
  - Joystick for left/right movement.
  - Dedicated jump button for touch devices.

---

## Requirements

- **React 16.8+** (though class components typically work with any React version above 16.0)
- **Node.js & npm or Yarn** (for installing dependencies and bundling, if needed)
- A modern browser supporting `<canvas>` and ES6 features.

---

## Installation & Setup

1. **Copy the Files**  
   - Place **`PlatformerGame.js`** and **`PlatformerGame.css`** in your project (e.g., under `src/components/`).

2. **Import the Component**  
   - In the parent React component (e.g., `App.js`), import the game:
     ```jsx
     import React from 'react';
     import PlatformerGame from './components/PlatformerGame'; // Adjust path as needed

     function App() {
       return (
         <div>
           <PlatformerGame />
         </div>
       );
     }

     export default App;
     ```
3. **Include the CSS**  
   - Ensure **`PlatformerGame.css`** is either globally imported or referenced within your code:
     ```jsx
     import './components/PlatformerGame.css';
     ```
     This styling covers the canvas, overlays (start/lose/checkpoint), and mobile controls.

4. **Run Your Project**  
   - If you have a standard React setup:
     ```bash
     npm start
     ```
     or
     ```bash
     yarn start
     ```
   - Open `http://localhost:3000` (or the configured development port) in your browser. You should see the “Vertical World” start screen.

---

## Usage

1. **Start Screen**  
   - Press **“Press Start”** on the overlay to begin the game.

2. **Controls**  
   - **Desktop:**  
     - **Left/Right Arrow Keys** move the player horizontally.  
     - **Up Arrow or Spacebar** jumps (up to 3 jumps in midair).
   - **Mobile:**  
     - A **virtual joystick** appears for left/right movement.  
     - A **“JUMP”** button is provided for vertical movement.

3. **Game Objective**  
   - Land on platforms to climb upward.  
   - Collect **all checkpoints** to display a victory message.  
   - Avoid hazards (in red); hitting them causes a respawn at the bottom.  
   - Dying **five times** triggers a **“You Lose!”** screen.

4. **Restarting**  
   - On the **“You Lose!”** screen, click **“Restart”** to regenerate a new world layout.

---

## Customization

- **Platform & Hazard Generation**  
  - Modify the `generateWorld()` method to change platform spacing, hazard frequency, or checkpoint placement.
- **Difficulty Settings**  
  - Adjust `this.maxJumps` for multi-jump allowance.  
  - Tweak `this.gravity` or horizontal velocities for more/less challenge.
- **Artwork & Theme**  
  - Replace the `bgImage.src` with your own image URL.  
  - Update colors in `PlatformerGame.css` to match your preferred palette.
- **Mobile Controls**  
  - Customize joystick size, positions, or remove them if you only target desktop users.

---

## License

This code is available under the MIT License. If you use or distribute this code, please include the following metadata:

- **Author**: Kristopher Ilich
- **Email**: Kristopherilich@gmail.com

Feel free to modify and adapt this platformer game for your own projects!
