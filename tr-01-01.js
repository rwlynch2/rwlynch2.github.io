/*jshint esversion: 6 */
// @ts-check

// Canvas and context initialization
const canvas = document.getElementById('canvas1');
const context = canvas.getContext('2d');

// Constants for Tetris grid
const BLOCK_SIZE = 30; // Size of each block in pixels (to fit the grid size)
const COLS = Math.floor(canvas.width/(2* BLOCK_SIZE)); // Calculate the number of columns
const ROWS = Math.floor(canvas.height / BLOCK_SIZE);
const fixedBlocks = Array.from({ length: ROWS }, () => Array(COLS).fill(0))
let score = 0; // Initialize the score variable
let gameRunning = false; // Indicates if the game is currently running
let gamePaused = true; // Initially paused

function drawGrid() {
  context.strokeStyle = 'black'; // Color of the outline
  context.lineWidth = 2; // Thickness of the outline

  // Draw vertical lines
  for (let i = 0; i <= COLS; i++) {
      context.beginPath();
      context.moveTo(i * BLOCK_SIZE, 0);
      context.lineTo(i * BLOCK_SIZE, ROWS * BLOCK_SIZE);
      context.stroke();
  }

  // Draw horizontal lines (including bottom border)
  for (let i = 0; i <= ROWS; i++) {
      context.beginPath();
      context.moveTo(0, i * BLOCK_SIZE);
      context.lineTo(COLS * BLOCK_SIZE, i * BLOCK_SIZE);
      context.stroke();
  }

  // Bottom border (extra line to mark the floor)
  context.beginPath();
  context.moveTo(0, ROWS * BLOCK_SIZE);
  context.lineTo(COLS * BLOCK_SIZE, ROWS * BLOCK_SIZE);
  context.stroke();
}

// Tetromino shapes and colors
const shapes = {
    I: [[1], [1], [1], [1]], // Line
    O: [[1, 1], [1, 1]], // Square
    T: [[0, 1, 0], [1, 1, 1]], // T-shape
    L: [[1, 0], [1, 0], [1, 1]], // L-shape
    J: [[0, 1], [0, 1], [1, 1]], // J-shape
    S: [[0, 1, 1], [1, 1, 0]], // S-shape
    Z: [[1, 1, 0], [0, 1, 1]], // Z-shape
};
const tetrominoColors = {
  I: "cyan", // Cyan for the Line shape
  O: "yellow", // Yellow for the Square
  T: "purple", // Purple for the T-shape
  L: "orange", // Orange for the L-shape
  J: "blue", // Blue for the J-shape
  S: "green", // Green for the S-shape
  Z: "red", // Red for the Z-shape
};
// Tetromino class to manage shapes and rendering
function getTetrominoColor(shape) {
  const shapeKey = Object.keys(shapes).find(
      (key) => JSON.stringify(shapes[key]) === JSON.stringify(shape)
  );
  return tetrominoColors[shapeKey]; // Retrieve the corresponding color
}

class Tetromino {
  constructor(shape) {
    this.shape = shape;
    this.color = getTetrominoColor(shape); // Get the corresponding color for this Tetromino
    this.x = 3; // Start position x
    this.y = 0; // Start position y
}

// Render the Tetromino with the correct color
render() {
  //console.log(this.color)
  context.fillStyle = this.color; // Set color for active Tetromino

  this.shape.forEach((row, rowIndex) => {
      row.forEach((block, colIndex) => {
          if (block === 1) {
              const x = (this.x + colIndex) * BLOCK_SIZE;
              const y = (this.y + rowIndex) * BLOCK_SIZE;
              context.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE); // Render the active block
          }
      });
  });
}

// Clear the Tetromino from the canvas
clear() {
    this.shape.forEach((row, rowIndex) => {
        row.forEach((block, colIndex) => {
            if (block === 1) {
                const x = (this.x + colIndex) * BLOCK_SIZE;
                const y = (this.y + rowIndex) * BLOCK_SIZE;
                context.clearRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
            }
        });
    });
}

  // Move Tetromino down
  moveDown() {
      this.y += 1;
  }

  // Move left, right, or rotate Tetromino
  moveLeft() {
      this.x -= 1;
  }

  moveRight() {
      this.x += 1;
  }

  rotate() {
      this.shape = this.shape[0].map((val, index) =>
          this.shape.map((row) => row[index]).reverse()
      );
  }
}

// Random bag setup
let tetrominoBag = []; // Initialize an empty bag

// Function to refill the bag with two of each Tetromino
function refillBag() {
  const allShapes = Object.values(shapes); // Get all Tetromino shapes
  tetrominoBag = [...allShapes, ...allShapes]; // Two of each shape in the bag
}

// Function to get a random Tetromino from the bag
function getRandomTetromino() {
  if (tetrominoBag.length === 0) {
      refillBag(); // Refill the bag when empty
  }

  // Get a random index from the bag
  const randomIndex = Math.floor(Math.random() * tetrominoBag.length);
  const shape = tetrominoBag.splice(randomIndex, 1)[0]; // Remove from the bag

  return new Tetromino(shape); // Return a new Tetromino with the selected shape
}

let initialInterval = 1000; // Start with a 1-second interval
let currentInterval = initialInterval; // Dynamic interval for the game loop
let elapsedTime = 0; // Track the elapsed time in seconds
let intervalDecrementRate = 10; // Decrease interval by 10 ms each time
let minimumInterval = 200; // Minimum interval (speed limit)
let timeForNextIntervalUpdate = 30; // Time to wait before updating interval (increase to slow down speed increase)

// Function to update the interval based on elapsed time
function updateInterval() {
    if (elapsedTime % timeForNextIntervalUpdate === 0) {
        currentInterval = Math.max(
            minimumInterval,
            currentInterval - intervalDecrementRate
        );
    }
}
function checkEndGame() {
  // Check if any blocks in the top row are fixed
  return fixedBlocks[0].some(block => block.fixed === 1);
}
function gameLoop() {
  if (checkEndGame()) {
    // If the game should end, notify the player
    alert("Game Over! The blocks have reached the top.");
    return; // Exit the game loop to stop the game
  }
  if (!gamePaused) {
    setTimeout(() => {
        currentTetromino.clear(); // Clear the current Tetromino
        currentTetromino.moveDown(); // Move the Tetromino down

        if (checkCollision(currentTetromino)) {
            currentTetromino.y -= 1; // Undo if there's a collision
            fixTetromino(currentTetromino); // Fix the Tetromino to the grid
            clearLines(); // Clear completed lines
            currentTetromino = getRandomTetromino(); // Get a new Tetromino
        }

        drawGrid(); // Draw the grid
        currentTetromino.render(); // Render the current Tetromino
        renderFixedBlocks(); // Render fixed blocks
        drawGrid(); // Draw the grid
        renderScore(); // Render the score on the canvas

        // Increment elapsed time and update interval if needed
        elapsedTime += currentInterval / 1000; // Convert interval to seconds

        updateInterval(); // Adjust the interval based on time passed

        gameLoop(); // Continue the game loop with the new interval
    }, currentInterval); // Use the updated interval
  }
}

gameLoop(); // Start the game loop

// Rendering fixed blocks on the grid
function renderFixedBlocks() {
   // Color for fixed blocks

  fixedBlocks.forEach((row, rowIndex) => {
      row.forEach((block, colIndex) => {
        context.fillStyle = block.color;
          if (block.fixed === 1) {
              const x = colIndex * BLOCK_SIZE;
              const y = rowIndex * BLOCK_SIZE;
              context.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE); // Draw fixed blocks in gray
          }
      });
  });
}

// Initialization and start
let currentTetromino = getRandomTetromino(); // Get the first Tetromino from the bag
currentTetromino.render(); // Render the initial Tetromino
drawGrid(); // Draw the grid
gameLoop(); // Start the game loop

// Key event listener for moving the Tetromino
window.addEventListener("keydown", (e) => {
  e.preventDefault();  
  currentTetromino.clear();
  
  if (e.key === "ArrowLeft") {
      currentTetromino.moveLeft();
      if (checkCollision(currentTetromino)) {
          currentTetromino.moveRight(); // Undo if collision
      
      }
  } else if (e.key === "ArrowRight") {
      currentTetromino.moveRight();
      if (checkCollision(currentTetromino)) {
          currentTetromino.moveLeft(); // Undo if collision
   
      }
  } else if (e.key === "ArrowDown") {
      currentTetromino.moveDown();
      if (checkCollision(currentTetromino)) {
          currentTetromino.y -= 1; // Undo if collision
          
      }
  } else if (e.key === "ArrowUp") {
      currentTetromino.rotate();
      if (checkCollision(currentTetromino)) {
        currentTetromino.rotate();
        currentTetromino.rotate();
        currentTetromino.rotate();
      }
  }
  currentTetromino.render(); // Re-render after keypress
  drawGrid();
});

// Helper functions to fix Tetrominoes and clear lines
function checkCollision(tetromino) {
  return tetromino.shape.some((row, rowIndex) => {
      return row.some((block, colIndex) => {
          if (block === 1) {
              const x = tetromino.x + colIndex;
              const y = tetromino.y + rowIndex;

              // Check boundaries and fixed blocks
              return (
                  x < 0 || // Left boundary check
                  x >= COLS || // Right boundary check
                  y >= ROWS || // Bottom boundary check
                  (y < ROWS && fixedBlocks[y][x].fixed === 1) // Fixed block collision
              );
          }
      });
  });
}

function fixTetromino(tetromino) {
  tetromino.shape.forEach((row, rowIndex) => {
      row.forEach((block, colIndex) => {
          if (block === 1) {
              const x = tetromino.x + colIndex;
              const y = tetromino.y + rowIndex;
              if (x >= 0 && x < COLS && y < ROWS) {
                  fixedBlocks[y][x] = {fixed: 1,
                     color: tetromino.color};
              }
          }
      });
  });
}

function clearLines() {
  for (let y = 0; y < ROWS; y++) {
      if (fixedBlocks[y].every(block => block.fixed === 1)) {
          // Remove the completed line and shift everything down
          fixedBlocks.splice(y, 1); // Remove the filled row
          fixedBlocks.unshift(Array(COLS).fill(0)); // Add an empty row at the top
          
          score += 100; // Increase the score by 100 for each row cleared

          // Clear and re-render the grid to update the colors
          context.clearRect(0, 0, COLS * BLOCK_SIZE, ROWS * BLOCK_SIZE); // Clear the entire canvas
          drawGrid(); // Redraw the grid lines
          renderFixedBlocks(); // Redraw the fixed blocks after the shift
          renderScore(); // Render the updated score
      }
  }
}

function renderScore() {
  // Set the font and color for the score display
  context.font = "20px Arial";
  context.fillStyle = "black"; // Set the color for the score text

  // Clear the area where the score will be displayed
  context.clearRect(canvas.width / 2, 0, canvas.width / 2, canvas.height);

  // Draw the score in the right half of the canvas
  context.fillText("Score: " + score, canvas.width / 2 + 10, 30); // Display score at the top-right
}

document.getElementById('startButton').addEventListener('click', () => {
    if (!gameRunning) {
        gameRunning = true; // Set the game running flag
        gamePaused = false; // Unpause the game
        gameLoop(); // Start the game loop
    }
});

document.getElementById('pauseButton').addEventListener('click', () => {
    gamePaused = !gamePaused; // Toggle the paused state
});

document.getElementById('resetButton').addEventListener('click', () => {
    // Reset game state
    fixedBlocks.forEach(row => row.fill(0)); // Clear the fixed blocks
    score = 0; // Reset the score
    currentTetromino = getRandomTetromino(); // Get a new Tetromino
    gameRunning = false; // Reset the game running flag
    gamePaused = true; // Pause the game
    context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    drawGrid(); // Redraw the grid
    renderScore(); // Render the reset score
});