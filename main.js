import {
  BLOCK_SIZE,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  COLORS,
  PIECES,
} from "./constants";

const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");

const board = Array(BOARD_HEIGHT)
  .fill()
  .map(() => Array(BOARD_WIDTH).fill(0));

const piece = { position: {} };
let score = 0;
let linesCleared = 0;
let level = 0;

//Define canvas size
canvas.width = BLOCK_SIZE * BOARD_WIDTH;
canvas.height = BLOCK_SIZE * BOARD_HEIGHT;
context.scale(BLOCK_SIZE, BLOCK_SIZE);

function moveLeft() {
  const newX = piece.position.x - 1;

  if (!detectCollision({ newX: newX })) {
    piece.position.x = newX;
  }
}
function moveRight() {
  const newX = piece.position.x + 1;

  if (!detectCollision({ newX: newX })) {
    piece.position.x = newX;
  }
}

function moveDown(increaseScore) {
  const newY = piece.position.y + 1;

  if (!detectCollision({ newY: newY })) {
    piece.position.y = newY;
    if (increaseScore) score++;
  } else {
    solidifyPiece();
    removeRows();
    return true;
  }
}

function instantDrop() {
  let collision = false;
  while (!collision) {
    collision = moveDown();
  }
}

function removeRows() {
  let deletedRows = 0;

  board.forEach((row, y) => {
    if (row.every((value) => value > 0)) {
      deletedRows++;

      board.splice(y, 1);
      board.unshift(Array(BOARD_WIDTH).fill(0));
    }
  });

  switch (deletedRows) {
    case 1:
      score += 40 * level + 1;
      break;
    case 2:
      score += 100 * level + 1;
      break;
    case 3:
      score += 300 * level + 1;
      break;
    case 4:
      score += 1200 * level + 1;
      break;
    default:
      break;
  }
  // TODO: scoreboard
  console.log(score);
}

function detectCollision({ newY = false, newX = false, newShape = false }) {
  let collision = false;
  newY = newY !== false ? newY : piece.position.y;
  newX = newX !== false ? newX : piece.position.x;
  newShape = newShape !== false ? newShape : piece.shape;

  newShape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value && board[newY + y]?.[newX + x] !== 0) collision = true;
    });
  });
  return collision;
}

function solidifyPiece() {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        board[y + piece.position.y][x + piece.position.x] = value;
      }
    });
  });

  resetPiece();
}

function resetPiece() {
  const newShape = PIECES[Math.floor(Math.random() * 7)];
  const newX = Math.ceil(BOARD_WIDTH / 2 - newShape[0].length / 2);
  const newY = 0;
  if (detectCollision({ newShape, newX, newY })) {
    alert("gameOver");
    resetGame();
  } else {
    piece.position.x = newX;
    piece.position.y = newY;
    piece.shape = newShape;
  }
}

function resetGame() {
  score = 0;
  linesCleared = 0;
  level = 0;
  board.forEach((row) => row.fill(0));
}

function rotate() {
  const result = [];
  for (let i = piece.shape.length - 1; i >= 0; i--) {
    const row = piece.shape[i];

    for (let j = 0; j < row.length; j++) {
      result[j] ? result[j].push(row[j]) : (result[j] = [row[j]]);
    }
  }
  //TODO: desplazar pieza hasta que encaje en vez de evitar el giro

  if (!detectCollision({ newShape: result })) {
    piece.shape = result;
  }
}

document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowLeft":
      moveLeft();
      break;
    case "ArrowRight":
      moveRight();
      break;
    case "ArrowDown":
      moveDown(true);
      break;
    case "ArrowUp":
      rotate();
      break;
    case " ":
      instantDrop();
      break;

    default:
      // console.log(e.key);
      break;
  }
});

//game loop
let counter = 0;
function update() {
  draw();
  counter++;

  if (counter === 100) {
    moveDown();

    counter = 0;
  }
  window.requestAnimationFrame(update);
}

function draw() {
  context.fillStyle = "black";
  context.fillRect(0, 0, canvas.width, canvas.height);

  board.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        context.fillStyle = COLORS[value - 1];
        context.fillRect(x, y, 1, 1);
      }
    });
  });

  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        context.fillStyle = COLORS[value - 1];
        context.fillRect(x + piece.position.x, y + piece.position.y, 1, 1);
      }
    });
  });
}

resetPiece();
update();
