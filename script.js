const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20, 20);

// Lebarin arena jadi 14x24
const arena = createMatrix(14, 24);
const player = {
  pos: { x: 0, y: 0 },
  matrix: null,
  score: 0,
};

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

// Buat animasi flash
let flashRows = [];
let flashTime = 0;

function createMatrix(w, h) {
  const matrix = [];
  while (h--) matrix.push(new Array(w).fill(0));
  return matrix;
}

function createPiece(type) {
  switch (type) {
    case 'T':
      return [[0, 0, 0], [1, 1, 1], [0, 1, 0]];
    case 'O':
      return [[2, 2], [2, 2]];
    case 'L':
      return [[0, 3, 0], [0, 3, 0], [0, 3, 3]];
    case 'J':
      return [[0, 4, 0], [0, 4, 0], [4, 4, 0]];
    case 'I':
      return [[0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0]];
    case 'S':
      return [[0, 6, 6], [6, 6, 0], [0, 0, 0]];
    case 'Z':
      return [[7, 7, 0], [0, 7, 7], [0, 0, 0]];
    case 'U':
      return [[8, 0, 8], [8, 8, 8]];
    case 'P':
      return [[9, 9], [9, 9], [9, 0]];
    case 'X':
      return [[0, 10, 0], [10, 10, 10], [0, 10, 0]];
    case 'B': // Blok 3x3 super
      return [[11, 11, 11], [11, 11, 11], [11, 11, 11]];
    default:
      return [[1]];
  }
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

function getColor(value) {
  return [
    '#000000', // 0 - kosong
    '#FF0D72', // 1 - T
    '#0DC2FF', // 2 - O
    '#0DFF72', // 3 - L
    '#F538FF', // 4 - J
    '#FF8E0D', // 5 - I
    '#FFE138', // 6 - S
    '#3877FF', // 7 - Z
    '#00FFA3', // 8 - U
    '#FF66C4', // 9 - P
    '#AA00FF', // 10 - X
    '#FF3CAC'  // 11 - B (Big block)
  ][value];
}

function draw() {
  context.fillStyle = '#111';
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawMatrix(arena, { x: 0, y: 0 });
  drawMatrix(player.matrix, player.pos);

  // Flash effect
  if (flashTime > 0) {
    flashRows.forEach(y => {
      context.fillStyle = 'rgba(255, 255, 255, 0.5)';
      context.fillRect(0, y, arena[0].length, 1);
    });
    flashTime -= 16;
    if (flashTime <= 0) flashRows = [];
  }
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        const realY = y + player.pos.y;
        const realX = x + player.pos.x;

        if (value === 11) {
          // Super block: hancurkan baris walau gak full
          if (arena[realY]) {
            arena[realY] = new Array(arena[0].length).fill(0);
            flashRows.push(realY);
            flashTime = 200;
          }
        } else {
          arena[realY][realX] = value;
        }
      }
    });
  });
}

function collide(arena, player) {
  const [m, o] = [player.matrix, player.pos];
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] &&
          (arena[y + o.y] &&
           arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
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

function playerReset() {
  const pieces = 'TJLOSZIUPXB'; // Tambah B untuk super block
  player.matrix = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
  player.pos.y = 0;
  player.pos.x = Math.floor(arena[0].length / 2) - Math.floor(player.matrix[0].length / 2);
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    player.score = 0;
    updateScore();
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

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  if (dir > 0) matrix.forEach(row => row.reverse());
  else matrix.reverse();
}

function arenaSweep() {
  let rowCount = 1;
  outer: for (let y = arena.length - 1; y >= 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) continue outer;
    }
    flashRows.push(y);
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++y;
    player.score += rowCount * 10;
    rowCount *= 2;
    flashTime = 200;
  }
}

function updateScore() {
  document.getElementById('score').innerText = player.score;
}

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

function startGame() {
  playerReset();
  updateScore();
  update();
}

document.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') playerMove(-1);
  else if (event.key === 'ArrowRight') playerMove(1);
  else if (event.key === 'ArrowDown') playerDrop();
  else if (event.key === 'q') playerRotate(-1);
  else if (event.key === 'w') playerRotate(1);
});
