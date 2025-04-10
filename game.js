document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('grid');
  const scoreDisplay = document.getElementById('score');
  const gridSize = 10;
  let score = 0;
  let currentBlock = null;
  let currentPosition = { x: 4, y: 0 };
  let interval;

  const shapes = [
    [[1, 1, 1], [0, 1, 0]],
    [[1, 1], [1, 1]],
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1, 1], [1, 1, 0]],
    [[1, 0], [1, 0], [1, 1]],
    [[0, 1], [0, 1], [1, 1]],
    [[1, 1, 1, 1]],
    [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
    [[1, 0, 1], [0, 1, 0], [1, 0, 1]],
    [[0, 1, 0], [1, 1, 1], [0, 1, 0]],
    [[1, 1, 0], [1, 0, 0], [1, 0, 0]],
    [[0, 0, 1], [0, 0, 1], [0, 1, 1]]
  ];

  const colors = ['#f44336', '#4caf50', '#2196f3', '#ffeb3b', '#ff9800', '#00bcd4', '#9c27b0', '#ffffff', '#ffcdd2', '#cddc39', '#3f51b5', '#ff5722'];

  function createGrid() {
    for (let i = 0; i < gridSize * gridSize; i++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      grid.appendChild(cell);
    }
  }

  function drawBlock() {
    const shape = currentBlock.shape;
    shape.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val) {
          const index = (currentPosition.y + y) * gridSize + (currentPosition.x + x);
          const cell = grid.children[index];
          if (cell) {
            cell.classList.add('temp');
            cell.style.backgroundColor = currentBlock.color;
          }
        }
      });
    });
  }

  function undrawBlock() {
    Array.from(grid.children).forEach(cell => {
      if (cell.classList.contains('temp')) {
        cell.classList.remove('temp');
        cell.style.backgroundColor = '';
      }
    });
  }

  function freezeBlock() {
    const shape = currentBlock.shape;
    shape.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val) {
          const index = (currentPosition.y + y) * gridSize + (currentPosition.x + x);
          const cell = grid.children[index];
          if (cell) {
            cell.classList.add('placed');
            cell.style.backgroundColor = currentBlock.color;
          }
        }
      });
    });
    score += 10;
    scoreDisplay.textContent = score;
    checkFullLines();
    spawnNewBlock();
  }

  function checkCollision(dx, dy) {
    const shape = currentBlock.shape;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const newX = currentPosition.x + x + dx;
          const newY = currentPosition.y + y + dy;
          if (newX < 0 || newX >= gridSize || newY >= gridSize) return true;
          const index = newY * gridSize + newX;
          const cell = grid.children[index];
          if (cell && cell.classList.contains('placed')) return true;
        }
      }
    }
    return false;
  }

  function move(dx, dy) {
    if (!checkCollision(dx, dy)) {
      undrawBlock();
      currentPosition.x += dx;
      currentPosition.y += dy;
      drawBlock();
      return true;
    } else if (dy === 1) {
      freezeBlock();
      return false;
    }
    return true;
  }

  function checkFullLines() {
    for (let r = 0; r < gridSize; r++) {
      let full = true;
      for (let c = 0; c < gridSize; c++) {
        const cell = grid.children[r * gridSize + c];
        if (!cell.classList.contains('placed')) {
          full = false;
          break;
        }
      }
      if (full) {
        for (let c = 0; c < gridSize; c++) {
          const cell = grid.children[r * gridSize + c];
          cell.classList.remove('placed');
          cell.style.backgroundColor = '';
        }
        const newCells = Array.from(grid.children);
        const removed = newCells.splice(r * gridSize, gridSize);
        removed.forEach(cell => grid.removeChild(cell));
        removed.forEach(cell => {
          cell.classList.remove('placed');
          cell.style.backgroundColor = '';
          grid.insertBefore(cell, grid.firstChild);
        });
        score += 50;
        scoreDisplay.textContent = score;
      }
    }
  }

  function spawnNewBlock() {
    currentBlock = {
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    currentPosition = { x: 3, y: 0 };
    drawBlock();
  }

  function gameLoop() {
    move(0, 1);
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') move(-1, 0);
    else if (e.key === 'ArrowRight') move(1, 0);
    else if (e.key === 'ArrowDown') move(0, 1);
    else if (e.key === 'ArrowUp') {
      // Optional: Rotasi
    }
  });

  createGrid();
  spawnNewBlock();
  interval = setInterval(gameLoop, 800); // Slow tempo
});
