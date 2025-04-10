document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('grid');
  const scoreDisplay = document.getElementById('score');
  const gridSize = 10;
  let score = 0;
  let currentBlock = null;
  let currentX = 0;
  let currentY = 0;

  function createGrid() {
    for (let i = 0; i < gridSize * gridSize; i++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.index = i;
      grid.appendChild(cell);
    }
  }

  function generateBlock() {
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
    const index = Math.floor(Math.random() * shapes.length);
    return { shape: shapes[index], color: colors[index] };
  }

  function drawBlock() {
    removeBlock();
    const shape = currentBlock.shape;
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j]) {
          const x = currentX + j;
          const y = currentY + i;
          const index = y * gridSize + x;
          if (index >= 0 && index < gridSize * gridSize) {
            const cell = grid.children[index];
            cell.style.backgroundColor = currentBlock.color;
            cell.classList.add('temp');
          }
        }
      }
    }
  }

  function removeBlock() {
    document.querySelectorAll('.temp').forEach(cell => {
      cell.style.backgroundColor = '';
      cell.classList.remove('temp');
    });
  }

  function placeBlock() {
    const shape = currentBlock.shape;
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j]) {
          const x = currentX + j;
          const y = currentY + i;
          const index = y * gridSize + x;
          if (index >= 0 && index < gridSize * gridSize) {
            const cell = grid.children[index];
            cell.style.backgroundColor = currentBlock.color;
            cell.classList.add('placed');
          }
        }
      }
    }
    score += 10;
    scoreDisplay.textContent = score;
    checkFullLines();
    spawnNewBlock();
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
        score += 50;
      }
    }
    scoreDisplay.textContent = score;
  }

  function canMove(dx) {
    const shape = currentBlock.shape;
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j]) {
          const x = currentX + dx + j;
          const y = currentY + i;
          if (x < 0 || x >= gridSize || y >= gridSize) return false;
          const index = y * gridSize + x;
          if (grid.children[index].classList.contains('placed')) return false;
        }
      }
    }
    return true;
  }

  function spawnNewBlock() {
    currentBlock = generateBlock();
    currentX = 3;
    currentY = 0;
    drawBlock();
  }

  function dropBlock() {
    while (canMoveDown()) {
      currentY++;
    }
    drawBlock();
    placeBlock();
  }

  function canMoveDown() {
    const shape = currentBlock.shape;
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j]) {
          const x = currentX + j;
          const y = currentY + i + 1;
          if (y >= gridSize) return false;
          const index = y * gridSize + x;
          if (grid.children[index].classList.contains('placed')) return false;
        }
      }
    }
    return true;
  }

  document.addEventListener('keydown', e => {
    if (!currentBlock) return;
    if (e.key === 'ArrowLeft' && canMove(-1)) {
      currentX--;
      drawBlock();
    } else if (e.key === 'ArrowRight' && canMove(1)) {
      currentX++;
      drawBlock();
    } else if (e.key === 'ArrowDown') {
      dropBlock();
    }
  });

  createGrid();
  spawnNewBlock();
});
