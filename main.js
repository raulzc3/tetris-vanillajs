import { BOARD_WIDTH, BOARD_HEIGHT, COLORS, PIECES } from "./constants";

const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");
const $current_score = document.querySelector("#current_score");
const $top_score = document.querySelector("#top_score");
const $level = document.querySelector("#level");
const $lines_cleared = document.querySelector("#lines_cleared ");
const $modal = document.querySelector("#modal");
let repeatInterval;
const $cross_l = document.querySelector("#cross_l");
$cross_l.addEventListener("touchstart", () => {
  moveLeft();
  repeatInterval = setInterval(moveLeft, 80);
});
$cross_l.addEventListener("touchend", () => {
  clearInterval(repeatInterval);
});
const $cross_d = document.querySelector("#cross_d");
$cross_d.addEventListener("touchstart", () => {
  moveDown(true);
  repeatInterval = setInterval(moveDown, 80);
});
$cross_d.addEventListener("touchend", () => {
  clearInterval(repeatInterval);
});
const $cross_r = document.querySelector("#cross_r");
$cross_r.addEventListener("touchstart", () => {
  moveRight();
  repeatInterval = setInterval(moveRight, 80);
});
$cross_r.addEventListener("touchend", () => {
  clearInterval(repeatInterval);
});
const $button_a = document.querySelector("#button_a");
$button_a.addEventListener("touchstart", () => {
  rotate();
});
const $button_b = document.querySelector("#button_b");
$button_b.addEventListener("touchstart", () => {
  instantDrop();
});
const $modal__title = document.querySelector("#modal__title");
const $modal_button = document.querySelector("#modal__button");
$modal_button.addEventListener("click", handleModalButtonClick);

//iOS display fix
document.addEventListener("gesturestart", function (e) {
  e.preventDefault();
});
// Manage canvas size
window.addEventListener("resize", setCanvasSize, true);
$top_score.innerText = getTopScore();

const board = Array(BOARD_HEIGHT)
  .fill()
  .map(() => Array(BOARD_WIDTH).fill(0));

const piece = { position: {} };
let score = 0;
let totalLinesCleared = 0;
let level = 1;
let gameRunning = false;
let BLOCK_SIZE = window.screen.height / 35;

//Set canvas size based on screen height
function setCanvasSize() {
  BLOCK_SIZE = window.screen.height / 35;
  canvas.width = BLOCK_SIZE * BOARD_WIDTH;
  canvas.height = BLOCK_SIZE * BOARD_HEIGHT;
  context.scale(BLOCK_SIZE, BLOCK_SIZE);
}

setCanvasSize();

function manageModal({ title = "Welcome!", visible = true }) {
  $modal__title.innerHTML = title;
  if (visible === true) {
    $modal.style.display = "flex";
  } else {
    $modal.style.display = "none";
  }
}

function handleModalButtonClick() {
  manageModal({ visible: false });
  newGame(true);
}

function getTopScore() {
  return localStorage.getItem("top_score") || 0;
}

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

function moveDown(scoreMultiplier = 0) {
  const newY = piece.position.y + 1;

  if (!detectCollision({ newY: newY })) {
    piece.position.y = newY;

    score = score + 1 * scoreMultiplier * level;
  } else {
    solidifyPiece();
    removeRows();
    return true;
  }
}

function instantDrop() {
  let collision = false;
  while (!collision) {
    collision = moveDown(2);
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
      score += 40 * level;
      break;
    case 2:
      score += 100 * level;
      break;
    case 3:
      score += 300 * level;
      break;
    case 4:
      score += 1200 * level;
      break;
    default:
      break;
  }
  totalLinesCleared += deletedRows;
  level = Math.floor(totalLinesCleared / 10) + 1;
  $level.innerHTML = level;
  $lines_cleared.innerHTML = totalLinesCleared;
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

  newPiece();
}

function newPiece() {
  //TODO: next piece section
  const newShape = PIECES[Math.floor(Math.random() * 7)];
  const newX = Math.ceil(BOARD_WIDTH / 2 - newShape[0].length / 2);
  const newY = 0;
  if (detectCollision({ newShape, newX, newY })) {
    gameRunning = false;
    manageModal({ visible: true, title: "Game over" });
  } else {
    piece.position.x = newX;
    piece.position.y = newY;
    piece.shape = newShape;
  }
}

function newGame(isFirstGame) {
  const topScore = Number(getTopScore());
  if (score > topScore) {
    localStorage.setItem("top_score", score);
    $top_score.innerText = score;
  }
  counter = 0;
  score = 0;
  totalLinesCleared = 0;
  level = 1;
  if (repeatInterval) clearInterval(repeatInterval);
  board.forEach((row) => row.fill(0));
  newPiece();
  gameRunning = true;
  if (isFirstGame) {
    update();
  }
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
      //Prevent accidental consecutive piece drops
      if (e.repeat) {
        return;
      }
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
  $current_score.innerText = score;

  const updatePoint =
    level < 15
      ? 100 - (level - 1) * 7
      : level < 20
      ? 8
      : level < 25
      ? 7
      : level < 30
      ? 6
      : 5;
  if (counter === updatePoint) {
    moveDown();
    counter = 0;
  }
  if (gameRunning) {
    window.requestAnimationFrame(update);
  }
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
