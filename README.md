# Vertical World Platformer Game

## Overview

Vertical World is a robust, class-based React platformer game that challenges players to scale a dynamically generated, vertically scrolling world. Built entirely with JavaScript and the HTML5 `<canvas>`, this game leverages a highly robust algorithm for world generation—ensuring that every playthrough is completely unique.

The world generation system employs randomized values for platform positioning, widths, gaps, checkpoints, and hazards. By generating new arrays for each game session and strategically placing platforms (including a solid floor, random tiers, and checkpoints) along with hazards, the algorithm maintains a balanced yet unpredictable difficulty curve. This design guarantees that no two playthroughs are identical, keeping the experience fresh and challenging for players.

## Features

- **Robust World Generation**  
  - **Procedural Generation:** Each playthrough produces a new world layout with randomized platform positions, checkpoint placements, and hazard locations.
  - **Balanced Difficulty:** The algorithm adjusts gaps and platform sizes to ensure a fair challenge regardless of the randomness.
  - **Dynamic Checkpoints:** Randomly chosen platforms host checkpoints that provide progressive rewards and feedback.

- **Vertical Scrolling Gameplay**  
  - Navigate an expansive world up to 24,000px tall.
  - Experience smooth vertical scrolling with dynamic camera offset.

- **Responsive Controls**  
  - **Desktop Controls:** Keyboard support for left/right movement and jumping.
  - **Mobile Controls:** On-screen virtual joystick and jump button for touch devices.

- **Rich Visual Feedback**  
  - Score and death count displays.
  - Customizable start, checkpoint, and lose screens with themed styling.
  - Dynamic background rendering with a tiled image for immersive visuals.

## Requirements

- **React 16.8+** (or any modern version that supports class components)
- **Node.js & npm or Yarn**
- A modern web browser that supports HTML5 `<canvas>` and ES6 features

## Installation & Setup

1. **Copy the Files**  
   - Place `PlatformerGame.js` and `PlatformerGame.css` into your project (for example, under `src/components/`).

2. **Import the Component**  
   - In your main application file (e.g., `App.js`), import and render the game component:
     ```jsx
     import React from 'react';
     import PlatformerGame from './components/PlatformerGame'; // Adjust the path as necessary
     import './components/PlatformerGame.css';

     function App() {
       return (
         <div>
           <PlatformerGame />
         </div>
       );
     }

     export default App;
     ```

3. **Install Dependencies**  
   - Ensure you have the necessary packages installed:
     ```bash
     npm install
     ```
     or
     ```bash
     yarn install
     ```

4. **Run Your Project**  
   - Start your development server:
     ```bash
     npm start
     ```
     or
     ```bash
     yarn start
     ```
   - Open your browser to `http://localhost:3000` (or your configured port) to see the game in action.

## Usage

1. **Start Screen**  
   - On launch, a start screen displays instructions and a "Press Start" button.
   - Click the button to begin the game and trigger the robust world generation algorithm.

2. **Gameplay Controls**  
   - **Desktop:** Use the **Left/Right Arrow Keys** to move and **Up Arrow or Spacebar** to jump (up to three consecutive jumps are allowed).
   - **Mobile:** Use the on-screen **virtual joystick** to control movement and tap the **"JUMP"** button to initiate jumps.

3. **Game Mechanics**  
   - Navigate through platforms, avoid hazards, and collect checkpoints.
   - The game tracks your score and death count, showing a "You Lose!" screen after five deaths.
   - Each playthrough features a new world layout, keeping the gameplay experience fresh and engaging.

## Customization

- **World Generation Parameters:**  
  Modify the `generateWorld()` method in `PlatformerGame.js` to adjust:
  - The spacing between platforms.
  - Platform width, gap intervals, and randomness.
  - The number and placement of checkpoints and hazards.

- **Difficulty Settings:**  
  Tweak variables like `this.gravity`, `this.maxJumps`, or horizontal movement speeds to create a more challenging or relaxed experience.

- **Styling & Themes:**  
  Update `PlatformerGame.css` to change the visual appearance of the canvas, UI overlays, and mobile controls to match your project’s theme.

- **Background Customization:**  
  Replace the background image URL (`this.bgImage.src`) in the component to personalize the visual atmosphere of the game.

## License

This project is licensed under the MIT License. If you use or distribute this code, please include the following metadata:

- **Author**: Kristopher Ilich
- **Email**: Kristopherilich@gmail.com

---

Enjoy integrating the Vertical World Platformer Game into your React or JavaScript project and experience the thrill of a new, uniquely generated world every time you play!
