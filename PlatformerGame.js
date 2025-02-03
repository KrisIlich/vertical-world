import React from "react";
import "./PlatformerGame.css";

export default class PlatformerGame extends React.Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();

    // React state
    this.state = {
      isMobile: false,
      showStartScreen: true, // Splash/Start screen
      showCheckpointMessage: false, // For checkpoint popups
      showLoseScreen: false, // Lose screen after 5 deaths
      checkpointText: "",
      currentScore: 0,
      deathCount: 0, // Track how many times we collide with hazards
    };

    // Game flags & data
    this.isGameRunning = false;
    this.isCheckpointCollisionActive = true;
    this.animationId = null;

    // Key states
    this.keys = {
      left: false,
      right: false,
    };

    // Joystick
    this.joystickCenter = { x: 0, y: 0 };
    this.joystickRadius = 50;

    // Jumping
    this.jumpCount = 0;
    this.maxJumps = 3; // Only 2 midair jumps for difficulty

    // Canvas & World Dimensions
    this.canvasWidth = 700;
    this.canvasHeight = 700;
    this.worldHeight = 24000;
    this.floorHeight = 50;
    this.gravity = 0.6;

    // Player setup
    this.player = {
      x: this.canvasWidth / 2 - 20, // center horizontally
      y: this.worldHeight - this.floorHeight - 100, // near bottom
      width: 40,
      height: 40,
      vx: 0,
      vy: 0,
      color: "#99c9ff",
      lastStableY: 0,
    };

    // We'll store the numeric score in a class property (mirror in state)
    this.score = 0;

    // Prepare placeholders for dynamic arrays
    this.platforms = [];
    this.checkpoints = [];
    this.hazards = [];
    this.totalCheckpoints = 10;
    this.claimedCheckpointCount = 0;

    // Immediately generate the initial random layout
    this.generateWorld();

    // Bind event handlers
    this.startGame = this.startGame.bind(this);
    this.animate = this.animate.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.handleRestart = this.handleRestart.bind(this);
    this.handleJoystickMove = this.handleJoystickMove.bind(this);
    this.handleJoystickEnd = this.handleJoystickEnd.bind(this);
    this.handleTouchJump = this.handleTouchJump.bind(this);
  }

  //----------------------------------------
  // World Generation
  //----------------------------------------
  generateWorld() {
    // Reset arrays
    this.platforms = [];
    this.checkpoints = [];
    this.hazards = [];
    this.claimedCheckpointCount = 0;

    // Create the floor platform
    this.platforms.push({
      x: 0,
      y: this.worldHeight - this.floorHeight,
      width: this.canvasWidth,
      height: this.floorHeight,
      color: "#d157a0",
      scored: false,
    });

    // Generate random platforms
    const tierCount = 100;
    let lastPlatformY = this.worldHeight - this.floorHeight - 130;
    for (let i = 0; i < tierCount; i++) {
      let gap;
            if (i === 0) {
              // Force the first platform to be closer to the floor: ~100–150 px
              gap = 100 + Math.random() * 50;
            } else {
              // Subsequent tiers are the usual ~200–300 px
              gap = 200 + Math.random() * 100;
            }  // random ~200-300 px
      const y = lastPlatformY - gap;
      const platformWidth = 80 + Math.random() * 150; // 100–250
      const x = Math.random() * (this.canvasWidth - platformWidth);

      this.platforms.push({
        x,
        y,
        width: platformWidth,
        height: 20,
        color: "#acd157",
        scored: false,
      });

      lastPlatformY = y;
    }

    // Randomly choose 10 platforms to place checkpoints
    const availableIndexes = Array.from(
      { length: this.platforms.length - 1 },
      (_, i) => i + 1 // skip the floor at index 0
    );
    const chosenIndexes = [];
    while (chosenIndexes.length < this.totalCheckpoints) {
      const randIndex = Math.floor(Math.random() * availableIndexes.length);
      const pfIndex = availableIndexes[randIndex];
      if (!chosenIndexes.includes(pfIndex)) {
        chosenIndexes.push(pfIndex);
      }
    }

    chosenIndexes.forEach((idx) => {
      const pf = this.platforms[idx];
      const cpWidth = 40;
      const cpHeight = 60;
      // ±100 px from the platform
      const offsetY = (Math.random() - 0.5) * 200;
      const cpX = pf.x + (pf.width - cpWidth) / 2;
      const cpY = pf.y + offsetY - cpHeight / 2;

      this.checkpoints.push({
        x: cpX,
        y: cpY,
        width: cpWidth,
        height: cpHeight,
        claimed: false,
      });
    });

    // Generate hazards
    for (let i = 0; i < 10; i++) {
      const hazardY =
        this.worldHeight -
        200 -
        Math.random() * (this.worldHeight - 400);
      const hazardW = 40 + Math.random() * 60;
      const hazardH = 20 + Math.random() * 40;
      const hazardX = Math.random() * (this.canvasWidth - hazardW);

      this.hazards.push({
        x: hazardX,
        y: hazardY,
        width: hazardW,
        height: hazardH,
        color: "#ff4646",
      });
    }
  }

  //----------------------------------------
  // React Lifecycle
  //----------------------------------------
    componentDidMount() {
      this.canvas = this.canvasRef.current;
      this.ctx = this.canvas.getContext("2d");
      this.canvas.width = this.canvasWidth;
      this.canvas.height = this.canvasHeight;

      if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
        this.setState({ isMobile: true });
      }

      // Preload background image
      this.bgImage = new Image();
      this.bgImage.src = "https://i.imgur.com/MFEI7Wi.jpeg";

      // Listen for keyboard
      window.addEventListener("keydown", this.onKeyDown);
      window.addEventListener("keyup", this.onKeyUp);

      // Store initial lastStableY
      this.player.lastStableY = this.player.y;
    }

    componentWillUnmount() {
      window.removeEventListener("keydown", this.onKeyDown);
      window.removeEventListener("keyup", this.onKeyUp);
      cancelAnimationFrame(this.animationId);
    }

  //----------------------------------------
  // Input Handlers
  //----------------------------------------
  onKeyDown(e) {
    if (
      this.isGameRunning &&
      ["ArrowLeft", "ArrowRight", "ArrowUp", " "].includes(e.key)
    ) {
      e.preventDefault();
    }

    if (!this.isGameRunning) return;

    switch (e.key) {
      case "ArrowLeft":
        this.keys.left = true;
        break;
      case "ArrowRight":
        this.keys.right = true;
        break;
      case "ArrowUp":
      case " ":
        // Jump
        if (this.jumpCount < this.maxJumps) {
          this.player.vy = -12;
          this.jumpCount++;
        }
        break;
      default:
        break;
    }
  }

  onKeyUp(e) {
    if (!this.isGameRunning) return;

    switch (e.key) {
      case "ArrowLeft":
        this.keys.left = false;
        break;
      case "ArrowRight":
        this.keys.right = false;
        break;
      default:
        break;
    }
  }

  //----------------------------------------
    // Joystick Handlers
    //----------------------------------------
    handleJoystickMove(e) {
      if (!this.isGameRunning) return;

      const touch = e.touches[0];
      let dx = touch.clientX - this.joystickCenter.x;
      const dy = touch.clientY - this.joystickCenter.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > this.joystickRadius) {
        const angle = Math.atan2(dy, dx);
        dx = Math.cos(angle) * this.joystickRadius;
      }

      // Set movement based on horizontal direction
      if (dx < -this.joystickRadius * 0.3) {
        this.keys.left = true;
        this.keys.right = false;
      } else if (dx > this.joystickRadius * 0.3) {
        this.keys.left = false;
        this.keys.right = true;
      } else {
        this.keys.left = false;
        this.keys.right = false;
      }
    }

    handleJoystickEnd() {
      this.keys.left = false;
      this.keys.right = false;

      // Reset joystick thumb position
      const joystickThumb = document.querySelector(".joystick-thumb");
      if (joystickThumb) {
        joystickThumb.style.transform = "translate(0, 0)";
      }
    }

    //----------------------------------------
    // Touch Handlers for Jump
    //----------------------------------------
    handleTouchJump(e) {
      e.preventDefault();
      if (!this.isGameRunning) return;

      // Jump logic
      if (this.jumpCount < this.maxJumps) {
        this.player.vy = -12;
        this.jumpCount++;
      }
    }

  //----------------------------------------
  // Start / Restart
  //----------------------------------------
  startGame() {
    this.setState({ showStartScreen: false }, () => {
      this.isGameRunning = true;
      this.animate();
    });
  }

  handleRestart() {
    // Called when we lose or choose to restart.
    // 1) Stop the current animation
    cancelAnimationFrame(this.animationId);
    this.animationId = null;
    this.isGameRunning = false;

    // 2) Reset main data & states
    this.score = 0;
    this.setState({
      currentScore: 0,
      deathCount: 0,
      showLoseScreen: false,
      showStartScreen: true,
      showCheckpointMessage: false,
      checkpointText: "",
    });

    // 3) Regenerate a brand-new random world
    this.generateWorld();

    // 4) Reset the player's position
    this.player.x = this.canvasWidth / 2 - 20;
    this.player.y = this.worldHeight - this.floorHeight - 100;
    this.player.vx = 0;
    this.player.vy = 0;
    this.jumpCount = 0;
    this.player.lastStableY = this.player.y;
  }


  ////////////////////////////////////////////////////////////
  // Touch handlers
  ////////////////////////////////////////////////////////////
  handleTouchStartLeft = (e) => {
    e.preventDefault();
    if (!this.isGameRunning) return;
    this.keys.left = true;
  };

  handleTouchEndLeft = (e) => {
    e.preventDefault();
    this.keys.left = false;
  };

  handleTouchStartRight = (e) => {
    e.preventDefault();
    if (!this.isGameRunning) return;
    this.keys.right = true;
  };

  handleTouchEndRight = (e) => {
    e.preventDefault();
    this.keys.right = false;
  };

  handleTouchJump = (e) => {
    e.preventDefault();
    if (!this.isGameRunning) return;

    // Jump logic: same as onKeyDown('ArrowUp') or ' '.
    if (this.jumpCount < this.maxJumps) {
      this.player.vy = -12;
      this.jumpCount++;
    }
  };


  //----------------------------------------
  // Main Loop
  //----------------------------------------
  animate() {
    this.animationId = requestAnimationFrame(this.animate);

    if (this.state.isMobile) {
      // Update joystick thumb position based on left/right movement
      const joystickThumb = document.querySelector(".joystick-thumb");
      if (joystickThumb) {
        const dx = this.keys.left ? -30 : this.keys.right ? 30 : 0;
        joystickThumb.style.transform = `translate(${dx}px, 0)`;
      }
    }

    // If we show the lose screen, do nothing
    if (this.state.showLoseScreen) return;

    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Camera offset logic
    let cameraOffsetY = this.player.y - this.canvasHeight / 2;
    if (cameraOffsetY < 0) cameraOffsetY = 0;
    if (cameraOffsetY > this.worldHeight - this.canvasHeight) {
      cameraOffsetY = this.worldHeight - this.canvasHeight;
    }

    // Draw background (tiled)
    const tileW = this.bgImage.width || 640;
    const tileH = this.bgImage.height || 1200;
    for (
      let tileY = cameraOffsetY - tileH;
      tileY < cameraOffsetY + this.canvasHeight;
      tileY += tileH
    ) {
      for (let tileX = 0; tileX < this.canvasWidth; tileX += tileW) {
        this.ctx.drawImage(this.bgImage, tileX, tileY - cameraOffsetY);
      }
    }

    // Horizontal movement
    if (this.keys.left) {
      this.player.vx = -5;
    } else if (this.keys.right) {
      this.player.vx = 5;
    } else {
      this.player.vx = 0;
    }

    // Apply velocities
    this.player.x += this.player.vx;
    this.player.y += this.player.vy;
    this.player.vy += this.gravity;

    // Keep within horizontal bounds
    if (this.player.x < 0) {
      this.player.x = 0;
    }
    if (this.player.x + this.player.width > this.canvasWidth) {
      this.player.x = this.canvasWidth - this.player.width;
    }

    // Platform collisions
    let onPlatform = false;
    this.platforms.forEach((pf) => {
      if (
        this.player.y + this.player.height <= pf.y &&
        this.player.y + this.player.height + this.player.vy >= pf.y &&
        this.player.x + this.player.width > pf.x &&
        this.player.x < pf.x + pf.width
      ) {
        // Land on platform
        this.player.vy = 0;
        this.player.y = pf.y - this.player.height;
        onPlatform = true;
        this.jumpCount = 0;
        this.player.lastStableY = this.player.y;

        // Score increment if first time landing here
        if (!pf.scored) {
          pf.scored = true;
          this.score++;
          this.setState({ currentScore: this.score });
        }
      }
    });

    // Floor collision
    if (this.player.y + this.player.height > this.worldHeight) {
      this.player.y = this.worldHeight - this.player.height;
      this.player.vy = 0;
      onPlatform = true;
      this.jumpCount = 0;
      this.player.lastStableY = this.player.y;
    }

    // Hazard collisions => reset to bottom + increment deathCount
    this.hazards.forEach((hz) => {
      if (
        this.player.x < hz.x + hz.width &&
        this.player.x + this.player.width > hz.x &&
        this.player.y < hz.y + hz.height &&
        this.player.y + this.player.height > hz.y
      ) {
        // Collide => reset
        this.player.x = this.canvasWidth / 2 - 20;
        this.player.y = this.worldHeight - this.floorHeight - 100;
        this.player.vy = 0;
        this.jumpCount = 0;
        this.player.lastStableY = this.player.y;

        const newDeathCount = this.state.deathCount + 1;
        this.setState({ deathCount: newDeathCount }, () => {
          // If we have reached 5 deaths => show lose screen
          if (this.state.deathCount >= 5) {
            this.isGameRunning = false;
            this.setState({ showLoseScreen: true });
          }
        });
      }
    });

    // Checkpoint collisions
    if (this.isCheckpointCollisionActive) {
      for (let cp of this.checkpoints) {
        if (!cp.claimed) {
          if (
            this.player.x < cp.x + cp.width &&
            this.player.x + this.player.width > cp.x &&
            this.player.y < cp.y + cp.height &&
            this.player.y + this.player.height > cp.y
          ) {
            cp.claimed = true;
            this.claimedCheckpointCount++;
            const checkpointMsg = `Checkpoint ${this.claimedCheckpointCount} of ${this.totalCheckpoints} reached!`;

            this.setState({
              showCheckpointMessage: true,
              checkpointText: checkpointMsg,
            });

            setTimeout(() => {
              this.setState({ showCheckpointMessage: false });
            }, 1500);
          }
        }
      }

      // Win condition
      if (
        this.checkpoints.length > 0 &&
        this.checkpoints.every((cp) => cp.claimed)
      ) {
        this.isCheckpointCollisionActive = false;
        this.setState({
          showCheckpointMessage: true,
          checkpointText: "Congratulations! All checkpoints reached!",
        });
      }
    }

    // ---- DRAWING ----
    // Draw platforms
    this.platforms.forEach((pf) => {
      this.drawRect(
        pf.x,
        pf.y - cameraOffsetY,
        pf.width,
        pf.height,
        pf.color
      );
    });

    // Draw hazards
    this.hazards.forEach((hz) => {
      this.drawRect(
        hz.x,
        hz.y - cameraOffsetY,
        hz.width,
        hz.height,
        hz.color
      );
    });

    // Draw checkpoints
    this.checkpoints.forEach((cp) => {
      if (!cp.claimed) {
        this.drawRect(
          cp.x,
          cp.y - cameraOffsetY,
          cp.width,
          cp.height,
          "#f1be32"
        );
      }
    });

    // Draw player
    this.drawRect(
      this.player.x,
      this.player.y - cameraOffsetY,
      this.player.width,
      this.player.height,
      this.player.color
    );
  }

  //----------------------------------------
  // Helper: Draw a rect
  //----------------------------------------
  drawRect(x, y, w, h, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);
  }

 //----------------------------------------
   // Render
   //----------------------------------------
   render() {
     const {
       showStartScreen,
       showLoseScreen,
       showCheckpointMessage,
       checkpointText,
       currentScore,
       deathCount,
       isMobile,
     } = this.state;

     return (
       <div className="platform-game-container">
         {/* Score & Death Count (top-left corner) */}
         <div className="platform-score">
           Score: {currentScore}
           <br />
           Deaths: {deathCount}
         </div>

         {/* START SCREEN */}
         {showStartScreen && (
           <div className="platform-start-screen">
             <h1 className="platform-title">Vertical World</h1>
             <p className="platform-instructions">
               1. Move Left or Right.
             </p>
             <p className="platform-instructions">
               2. Jump on platforms.
             </p>
             <p className="platform-instructions">
               3. Get to the top to win! Avoid hazards. 5 deaths => game over!
             </p>
             <button className="platform-start-btn" onClick={this.startGame}>
               Press Start
             </button>
           </div>
         )}

         {/* LOSE SCREEN */}
         {showLoseScreen && (
           <div className="platform-lose-screen">
             <h1>You Lose!</h1>
             <p>You died 5 times.</p>
             <button onClick={this.handleRestart}>Restart</button>
           </div>
         )}

         {/* CHECKPOINT MESSAGE POPUP */}
         {showCheckpointMessage && (
           <div className="platform-checkpoint-popup">
             <h2>{checkpointText}</h2>
           </div>
         )}

         <canvas ref={this.canvasRef} className="platform-game-canvas" />

         {isMobile && !showStartScreen && !showLoseScreen && (
           <div className="mobile-touch-controls">
             {/* Joystick Base */}
             <div
               className="joystick-base"
               onTouchStart={(e) => {
                 e.stopPropagation();
                 const touch = e.touches[0];
                 this.joystickCenter = {
                   x: touch.clientX,
                   y: touch.clientY,
                 };
               }}
               onTouchMove={this.handleJoystickMove}
               onTouchEnd={this.handleJoystickEnd}
             >
               {/* Joystick Thumb */}
               <div
                 className="joystick-thumb"
                 style={{
                   transform: `translate(${this.keys.left ? -30 : this.keys.right ? 30 : 0}px, 0)`,
                 }}
               ></div>
             </div>
             {/* Jump Button */}
             <div
               className="mobile-control-btn jump-btn"
               onTouchStart={this.handleTouchJump}
             >
               JUMP
             </div>
           </div>
         )}
       </div>
     );
   }
 }