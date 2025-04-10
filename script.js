const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20, 20);

// Arena 14x24
const arena = createMatrix(14, 24);
const player = {
  pos: { x: 0, y: 0 },
  matrix: null,
  score: 0,
};

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

let flashRows = [];
let flashTime = 0;

// ==== CREATE ====

function createMatrix(w, h) {
  const matrix = [];
  while (h--) matrix.push(new Array(w).fill(0));
  return matrix;
}

function createPiece(type) {
  switch (type) {
    case 'T': return [[0, 0, 0], [1, 1, 1], [0, 1, 0]];
    case 'O': return [[2, 2], [2, 2]];
    case 'L': return [[0, 3, 0], [0, 3, 0], [0, 3, 3]];
    case 'J': return [[0, 4, 0], [0, 4, 0], [4, 4, 0]];
    case 'I': return [[0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0]];
    case 'S': return [[0, 6, 6], [6, 6, 0], [0, 0, 0]];
    case 'Z': return [[7, 7, 0], [0, 7, 7], [0, 0, 0]];
    case 'U': return [[8, 0, 8], [8, 8, 8]];
    case 'P': return [[9, 9], [9, 9], [9, 0]];
    case 'X': return [[0, 10, 0], [10, 10, 10], [0, 10, 0]];
    case 'B': return [[11, 11, 11], [11, 11, 11], [11, 11, 11]];
  }
}

// ==== DRAW ====

function getColor(value) {
  return [
    '#000000', '#FF0D72', '#0DC2FF', '#0DFF72', '#F538FF',
    '#FF8E0D', '#FFE138', '#3877FF', '#00FFA3', '#FF66C4',
    '#AA00FF', '#FF3CAC'
  ][value];
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        context.fillStyle = getColor(value);
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function draw() {
  context.fillStyle = '#111';
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawMatrix(arena, { x: 0, y: 0 });
  drawMatrix(player.matrix, player.pos);

  // Flash animation
  if (flashTime > 0) {
    flashRows.forEach(y => {
      context.fillStyle = 'rgba(255,255,255,0.5)';
      context.fillRect(0, y, arena[0].length, 1);
    });
    flashTime -= 16;
    if (flashTime <= 0) flashRows = [];
  }
}

// ==== LOGIC ====

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        const ay = y + player.pos.y;
        const ax = x + player.pos.x;
        if (arena[ay] && arena[ay][ax] !== undefined) {
          arena[ay][ax] = value;
        }
      }
    });
  });
}

function collide(arena, player) {
  const m = player.matrix;
  const o = player.pos;
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 &&
          (arena[y + o.y] &&
           arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  if (dir > 0) matrix.forEach(row => row.reverse());
  else matrix.reverse();
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    arenaSweep();
    playerReset();
    updateScore();
  }
  dropCounter = 0;
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

function playerRotate(dir) {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

function playerReset() {
  const pieces = 'TJLOSZIUPXB';
  player.matrix = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
  player.pos.y = 0;
  player.pos.x = Math.floor(arena[0].length / 2) - Math.floor(player.matrix[0].length / 2);

  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    player.score = 0;
    updateScore();
  }
}

function arenaSweep() {
  let rowCount = 1;
  outer: for (let y = arena.length - 1; y >= 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) continue outer;
    }

    const hasSuperBlock = arena[y].includes(11);
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    flashRows.push(y);
    flashTime = 200;

    // Bonus skor kalau ada B
    player.score += rowCount * (hasSuperBlock ? 50 : 10);
    rowCount *= 2;
    ++y;
  }
}

// ==== LOOP ====

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;

  if (dropCounter > dropInterval) {
    playerDrop();
  }

  draw();
  requestAnimationFrame(update);
}

function updateScore() {
  document.getElementById('score').innerText = player.score;
}

document.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') playerMove(-1);
  else if (event.key === 'ArrowRight') playerMove(1);
  else if (event.key === 'ArrowDown') playerDrop();
  else if (event.key === 'q') playerRotate(-1);
  else if (event.key === 'w') playerRotate(1);
});

// ==== START ====

playerReset();
updateScore();
update();
