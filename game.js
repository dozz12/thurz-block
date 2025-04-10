const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const ROW = 20, COL = 10, SQ = 30;
const vacant = "#111";
let score = 0;

function drawSquare(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * SQ, y * SQ, SQ, SQ);
  ctx.strokeStyle = "#333";
  ctx.strokeRect(x * SQ, y * SQ, SQ, SQ);
}

let board = Array.from({ length: ROW }, () => Array(COL).fill(vacant));

function drawBoard() {
  for (let r = 0; r < ROW; r++) {
    for (let c = 0; c < COL; c++) {
      drawSquare(c, r, board[r][c]);
    }
  }
}

const PIECES = [
  [Z, "#f00"],
  [S, "#0f0"],
  [T, "#a0f"],
  [O, "#ff0"],
  [L, "#f80"],
  [I, "#0ff"],
  [J, "#00f"]
];

function Z() { return [[1,1,0],[0,1,1]]; }
function S() { return [[0,1,1],[1,1,0]]; }
function T() { return [[1,1,1],[0,1,0]]; }
function O() { return [[1,1],[1,1]]; }
function L() { return [[1,0],[1,0],[1,1]]; }
function I() { return [[1],[1],[1],[1]]; }
function J() { return [[0,1],[0,1],[1,1]]; }

class Piece {
  constructor(tetromino, color) {
    this.tetromino = tetromino();
    this.color = color;
    this.x = 3;
    this.y = -2;
  }

  draw() {
    this.tetromino.forEach((row, r) => {
      row.forEach((val, c) => {
        if (val) drawSquare(this.x + c, this.y + r, this.color);
      });
    });
  }

  undraw() {
    this.tetromino.forEach((row, r) => {
      row.forEach((val, c) => {
        if (val) drawSquare(this.x + c, this.y + r, vacant);
      });
    });
  }

  moveDown() {
    if (!this.collision(0, 1, this.tetromino)) {
      this.undraw();
      this.y++;
      this.draw();
    } else {
      this.lock();
      currentPiece = randomPiece();
    }
  }

  moveLeft() {
    if (!this.collision(-1, 0, this.tetromino)) {
      this.undraw();
      this.x--;
      this.draw();
    }
  }

  moveRight() {
    if (!this.collision(1, 0, this.tetromino)) {
      this.undraw();
      this.x++;
      this.draw();
    }
  }

  rotate() {
    const rotated = this.tetromino[0].map((_, i) => this.tetromino.map(r => r[i])).reverse();
    if (!this.collision(0, 0, rotated)) {
      this.undraw();
      this.tetromino = rotated;
      this.draw();
    }
  }

  collision(xOffset, yOffset, piece) {
    for (let r = 0; r < piece.length; r++) {
      for (let c = 0; c < piece[r].length; c++) {
        if (!piece[r][c]) continue;
        let newX = this.x + c + xOffset;
        let newY = this.y + r + yOffset;
        if (newX < 0 || newX >= COL || newY >= ROW) return true;
        if (newY >= 0 && board[newY][newX] != vacant) return true;
      }
    }
    return false;
  }

  lock() {
    this.tetromino.forEach((row, r) => {
      row.forEach((val, c) => {
        if (val) {
          if (this.y + r < 0) return alert("Game Over!");
          board[this.y + r][this.x + c] = this.color;
        }
      });
    });

    score += 10;
    document.getElementById("score").textContent = score;

    for (let r = 0; r < ROW; r++) {
      if (board[r].every(cell => cell != vacant)) {
        for (let c = 0; c < COL; c++) {
          drawSquare(c, r, "#fff");
        }
        canvas.classList.add("flash");
        setTimeout(() => {
          canvas.classList.remove("flash");
          board.splice(r, 1);
          board.unshift(Array(COL).fill(vacant));
          drawBoard();
        }, 100);
        score += 100;
      }
    }
  }
}

function randomPiece() {
  const r = Math.floor(Math.random() * PIECES.length);
  return new Piece(...PIECES[r]);
}

let currentPiece = randomPiece();
drawBoard();

document.addEventListener("keydown", e => {
  switch (e.key) {
    case "ArrowDown": currentPiece.moveDown(); break;
    case "ArrowLeft": currentPiece.moveLeft(); break;
    case "ArrowRight": currentPiece.moveRight(); break;
    case "ArrowUp": currentPiece.rotate(); break;
  }
});

setInterval(() => {
  currentPiece.moveDown();
}, 500);

// SWIPE CONTROL
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

canvas.addEventListener("touchstart", e => {
  const touch = e.changedTouches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}, false);

canvas.addEventListener("touchend", e => {
  const touch = e.changedTouches[0];
  touchEndX = touch.clientX;
  touchEndY = touch.clientY;
  handleSwipe();
}, false);

function handleSwipe() {
  const dx = touchEndX - touchStartX;
  const dy = touchEndY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 30) currentPiece.moveRight();
    else if (dx < -30) currentPiece.moveLeft();
  } else {
    if (dy > 30) currentPiece.moveDown();
    else if (dy < -30) currentPiece.rotate();
  }
}
