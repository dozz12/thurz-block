document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('grid');
  const nextBlocksContainer = document.getElementById('next-blocks');
  const scoreDisplay = document.getElementById('score');
  const gridSize = 10;
  let score = 0;
  let draggedBlock = null;
  let ghostBlock = null;
  let shakeTimeout = null;

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
    const colors = ['#f44336', '#4caf50', '#2196f3', '#ffeb3b', '#ff9800', '#00bcd4', '#9c27b0', '#ffffff', '#ffcdd2', '#cddc39', '#3f51b5', '#ff5722'];
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
        e.dataTransfer.setDragImage(new Image(), 0, 0);
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
    ghostBlock.style.pointerEvents = 'none';
    ghostBlock.style.opacity = 0.8;
    ghostBlock.style.transform = 'scale(1.05)';

    for (let i = 0; i < 16; i++) {
      const cell = document.createElement('div');
      cell.classList.add('next-cell');
      if (block.shape[Math.floor(i / 4)] && block.shape[Math.floor(i / 4)][i % 4]) {
        cell.style.backgroundColor = block.color;
        cell.style.boxShadow = '0 0 5px rgba(0,0,0,0.5)';
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
    const toFill = [];

    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j]) {
          const cellX = x + j;
          const cellY = y + i;
          if (cellX >= gridSize || cellY >= gridSize) return false;
          const cellIndex = cellY * gridSize + cellX;
          const cell = grid.children[cellIndex];
          if (!cell || cell.style.backgroundColor) return false;
          toFill.push(cell);
        }
      }
    }

    toFill.forEach(cell => {
      cell.style.backgroundColor = block.color;
      cell.classList.add('placed');
      cell.style.transition = 'transform 0.2s';
      cell.style.transform = 'scale(1.2)';
      setTimeout(() => {
        cell.style.transform = 'scale(1)';
      }, 200);
    });

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
      } else {
        triggerShake();
      }
    }
  }

  function triggerShake() {
    if (shakeTimeout) return;
    grid.classList.add('shake');
    shakeTimeout = setTimeout(() => {
      grid.classList.remove('shake');
      shakeTimeout = null;
    }, 400);
  }

  function checkFullLines() {
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
