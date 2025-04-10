document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('grid');
  const nextBlocksContainer = document.getElementById('next-blocks');
  const scoreDisplay = document.getElementById('score');
  const rotateBtn = document.getElementById('rotate-btn');
  const gridSize = 10;
  let score = 0;
  let currentBlocks = [];
  let nextBlocks = [];

  function createGrid() {
    for (let i = 0; i < gridSize * gridSize; i++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      grid.appendChild(cell);
    }
  }

  function createNextBlocks() {
    nextBlocksContainer.innerHTML = '';
    nextBlocks = [generateBlock(), generateBlock(), generateBlock()];
    nextBlocks.forEach(block => {
      const blockElement = document.createElement('div');
      blockElement.classList.add('next-block');
      for (let i = 0; i < 16; i++) {
        const cell = document.createElement('div');
        cell.classList.add('next-cell');
        if (block.shape[Math.floor(i / 4)] && block.shape[Math.floor(i / 4)][i % 4]) {
          cell.style.backgroundColor = block.color;
        }
        blockElement.appendChild(cell);
      }
      nextBlocksContainer.appendChild(blockElement);
    });
  }

  function generateBlock() {
    const shapes = [
      [[1, 1, 1], [0, 1, 0]], // T
      [[1, 1], [1, 1]],       // O
      [[1, 1, 0], [0, 1, 1]], // Z
      [[0, 1, 1], [1, 1, 0]], // S
      [[1, 0], [1, 0], [1, 1]], // L
      [[0, 1], [0, 1], [1, 1]], // J
      [[1, 1, 1, 1]],          // I
      [[1, 1, 1], [1, 1, 1], [1, 1, 1]], // Full 3x3
      [[1, 0, 1], [0, 1, 0], [1, 0, 1]], // Diagonal pattern
      [[0, 1, 0], [1, 1, 1], [0, 1, 0]], // Cross shape
      [[1, 1, 0], [1, 0, 0], [1, 0, 0]], // Hook left
      [[0, 0, 1], [0, 0, 1], [0, 1, 1]]  // Hook right
    ];
    const colors = ['#f00', '#0f0', '#00f', '#ff0', '#f80', '#0ff', '#a0f', '#fff', '#faa', '#af5', '#55f', '#fa0'];
    const index = Math.floor(Math.random() * shapes.length);
    return { shape: shapes[index], color: colors[index] };
  }

  function placeBlock(block, x, y) {
    const shape = block.shape;
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j]) {
          const cellIndex = (y + i) * gridSize + (x + j);
          const cell = grid.children[cellIndex];
          if (!cell || cell.style.backgroundColor) {
            return false;
          }
        }
      }
    }
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j]) {
          const cellIndex = (y + i) * gridSize + (x + j);
          const cell = grid.children[cellIndex];
          cell.style.backgroundColor = block.color;
        }
      }
    }
    return true;
  }

  createGrid();
  createNextBlocks();
});
