document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('grid');
  const nextBlocksContainer = document.getElementById('next-blocks');
  const scoreDisplay = document.getElementById('score');
  const gridSize = 10;
  let score = 0;
  let nextBlocks = [];
  let draggedBlock = null;

  function createGrid() {
    for (let i = 0; i < gridSize * gridSize; i++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.index = i;
      cell.addEventListener('dragover', e => e.preventDefault());
      cell.addEventListener('drop', handleDrop);
      grid.appendChild(cell);
    }
  }

  function createNextBlocks() {
    nextBlocksContainer.innerHTML = '';
    nextBlocks = [generateBlock(), generateBlock(), generateBlock()];
    nextBlocks.forEach((block, index) => {
      const blockElement = document.createElement('div');
      blockElement.classList.add('next-block');
      blockElement.setAttribute('draggable', 'true');
      blockElement.dataset.blockIndex = index;
      blockElement.addEventListener('dragstart', () => {
        draggedBlock = block;
      });

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
          cell.classList.add('placed');
        }
      }
    }
    checkAndClearLines();
    setTimeout(checkGameOver, 100);
    return true;
  }

  function checkAndClearLines() {
    let fullRows = [];
    let fullCols = [];

    for (let i = 0; i < gridSize; i++) {
      let rowFull = true;
      let colFull = true;
      for (let j = 0; j < gridSize; j++) {
        if (!grid.children[i * gridSize + j].style.backgroundColor) rowFull = false;
        if (!grid.children[j * gridSize + i].style.backgroundColor) colFull = false;
      }
      if (rowFull) fullRows.push(i);
      if (colFull) fullCols.push(i);
    }

    fullRows.forEach(row => {
      for (let i = 0; i < gridSize; i++) {
        const cell = grid.children[row * gridSize + i];
        cell.classList.add('clearing');
      }
    });
    fullCols.forEach(col => {
      for (let i = 0; i < gridSize; i++) {
        const cell = grid.children[i * gridSize + col];
        cell.classList.add('clearing');
      }
    });

    setTimeout(() => {
      fullRows.forEach(row => {
        for (let i = 0; i < gridSize; i++) {
          const cell = grid.children[row * gridSize + i];
          cell.style.backgroundColor = '';
          cell.classList.remove('placed', 'clearing');
        }
      });
a
      fullCols.forEach(col => {
        for (let i = 0; i < gridSize; i++) {
          const cell = grid.children[i * gridSize + col];
          cell.style.backgroundColor = '';
          cell.classList.remove('placed', 'clearing');
        }
      });

      const linesCleared = fullRows.length + fullCols.length;
      if (linesCleared > 0) {
        score += linesCleared * 10;
        scoreDisplay.textContent = score;
      }
    }, 200);
  }

  function checkGameOver() {
    let possible = false;
    for (const block of nextBlocks) {
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          if (canPlaceBlock(block, x, y)) {
            possible = true;
            break;
          }
        }
        if (possible) break;
      }
      if (possible) break;
    }
    if (!possible) {
      alert(`Game Over! Skormu: ${score}`);
      location.reload();
    }
  }

  function canPlaceBlock(block, x, y) {
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
    return true;
  }

  function handleDrop(e) {
    const targetIndex = parseInt(e.target.dataset.index);
    const x = targetIndex % gridSize;
    const y = Math.floor(targetIndex / gridSize);

    if (draggedBlock) {
      const placed = placeBlock(draggedBlock, x, y);
      if (placed) {
        createNextBlocks();
      }
    }
  }

  createGrid();
  createNextBlocks();
});
