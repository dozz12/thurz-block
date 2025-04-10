const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const gridSize = 10;
const tileSize = 32;
let grid = [];
let score = 0;

function initGrid() {
  grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
  score = 0;
  updateScore();
  drawGrid();
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (grid[y][x]) {
        ctx.fillStyle = "#00ffcc";
        ctx.fillRect(x * tileSize, y * tileSize, tileSize - 2, tileSize - 2);
      } else {
        ctx.strokeStyle = "#333";
        ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }
  }
}

canvas.addEventListener("click", (e) => {
  const x = Math.floor(e.offsetX / tileSize);
  const y = Math.floor(e.offsetY / tileSize);
  if (!grid[y][x]) {
    grid[y][x] = 1;
    checkLines();
    drawGrid();
  }
});

function checkLines() {
  for (let y = 0; y < gridSize; y++) {
    if (grid[y].every(cell => cell === 1)) {
      grid[y] = Array(gridSize).fill(0);
      score += 10;
      updateScore();
    }
  }
}

function updateScore() {
  document.getElementById("score").textContent = score;
}

function resetGame() {
  initGrid();
}

initGrid();
