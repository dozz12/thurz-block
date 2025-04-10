document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('grid');
  const nextBlocksContainer = document.getElementById('next-blocks');
  const scoreDisplay = document.getElementById('score');
  const gridSize = 10;
  let score = 0;
  let draggedBlock = null;
  let ghostBlock = null;

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

  function createNextBlocks() {
    nextBlocksContainer.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const block = generateBlock();
      const blockElement = document.createElement('div');
      blockElement.classList.add('next-block');
      blockElement.setAttribute('draggable', 'true');
      blockElement.dataset.blockIndex = i;

      blockElement.addEventListener('dragstart', e => {
        draggedBlock = block;
        createGhost(block, e.pageX, e.pageY);
      });

      blockElement.addEventListener('dragend', () => {
        removeGhost();
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
    }
  }

  function createGhost(block, x, y) {
    ghostBlock = document.createElement('div');
    ghostBlock.classList.add('ghost-block');
    ghostBlock.style.left = `${x}px`;
    ghostBlock.style.top = `${y}px`;
    ghostBlock.style.position = 'absolute';

    for (let i = 0; i < 16; i++) {
      const cell = document.createElement('div');
      cell.classList.add('next-cell');
      if (block.shape[Math.floor(i / 4)] && block.shape[Math.floor(i / 4)][i % 4]) {
        cell.style.backgroundColor = block.color;
      }
      ghostBlock.appendChild(cell);
    }
    document.body.appendChild(ghostBlock);
  }

  function moveGhost(e) {
    if (ghostBlock) {
      ghostBlock.style.left = `${e.pageX - 60}px`;
      ghostBlock.style.top = `${e.pageY - 60}px`;
    }
  }

  function removeGhost() {
    if (ghostBlock) {
      ghostBlock.remove();
      ghostBlock = null;
    }
  }

  document.addEventListener('dragover', moveGhost);

  function placeBlock(block, x, y) {
    const shape = block.shape;

    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j]) {
          const cellIndex = (y + i) * gridSize + (x + j);
          const cell = grid.children[cellIndex];
          if (!cell || cell.style.backgroundColor) return false;
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

    checkFullLines();
    score += 10;
    scoreDisplay.textContent = score;
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

  function checkFullLines() {
    // Check rows
    for (let r = 0; r < gridSize; r++) {
      let full = true;
      for (let c = 0; c < gridSize; c++) {
        const cell = grid.children[r * gridSize + c];
        if (!cell.style.backgroundColor) {
          full = false;
          break;
        }
      }
      if (full) {
        for (let c = 0; c < gridSize; c++) {
          const cell = grid.children[r * gridSize + c];
          cell.style.backgroundColor = '';
        }
        score += 50;
      }
    }

    // Check columns
    for (let c = 0; c < gridSize; c++) {
      let full = true;
      for (let r = 0; r < gridSize; r++) {
        const cell = grid.children[r * gridSize + c];
        if (!cell.style.backgroundColor) {
          full = false;
          break;
        }
      }
      if (full) {
        for (let r = 0; r < gridSize; r++) {
          const cell = grid.children[r * gridSize + c];
          cell.style.backgroundColor = '';
        }
        score += 50;
      }
    }

    scoreDisplay.textContent = score;
  }

  createGrid();
  createNextBlocks();
});
