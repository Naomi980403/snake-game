const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");

const scoreEl = document.getElementById("score");
const eatSound = document.getElementById("eatSound");
const crashSound = document.getElementById("crashSound");

const box = 20;
const canvasSize = 400;

let snake = [];
let food = {};
let direction = "RIGHT";
let score = 0;
let gameInterval = null;
let speed = 150;
let paused = false;

function spawnFood() {
  return {
    x: Math.floor(Math.random() * (canvasSize / box)) * box,
    y: Math.floor(Math.random() * (canvasSize / box)) * box,
  };
}

function resetGameState() {
  snake = [{ x: 160, y: 200 }];
  direction = "RIGHT";
  food = spawnFood();
  score = 0;
  speed = 150;
  paused = false;
  scoreEl.textContent = "分數：0";
}

function drawGame() {
  if (paused) return;

  ctx.clearRect(0, 0, canvasSize, canvasSize);

  // 畫蛇
  snake.forEach((s, i) => {
    ctx.fillStyle = i === 0 ? "#0f0" : "#3f3";
    ctx.fillRect(s.x, s.y, box, box);
  });

  // 畫食物
  ctx.fillStyle = "#f00";
  ctx.fillRect(food.x, food.y, box, box);

  // 移動
  let head = { ...snake[0] };
  if (direction === "LEFT") head.x -= box;
  if (direction === "UP") head.y -= box;
  if (direction === "RIGHT") head.x += box;
  if (direction === "DOWN") head.y += box;

  // 撞牆或自己
  if (
    head.x < 0 || head.x >= canvasSize ||
    head.y < 0 || head.y >= canvasSize ||
    snake.some(s => s.x === head.x && s.y === head.y)
  ) {
    crashSound.play();
    clearInterval(gameInterval);
    pauseBtn.style.display = "none";
    restartBtn.style.display = "inline-block";
    return;
  }

  snake.unshift(head);

  // 吃食物
  if (head.x === food.x && head.y === food.y) {
    eatSound.play();
    score++;
    scoreEl.textContent = "分數：" + score;
    food = spawnFood();

    // 增加速度
    if (score % 5 === 0 && speed > 50) {
      speed -= 10;
      clearInterval(gameInterval);
      gameInterval = setInterval(drawGame, speed);
    }
  } else {
    snake.pop();
  }
}

function startGame() {
  resetGameState();
  startBtn.style.display = "none";
  restartBtn.style.display = "none";
  pauseBtn.style.display = "inline-block";
  scoreEl.textContent = "倒數 3 秒開始遊戲...";

  let count = 3;
  const countdown = setInterval(() => {
    if (count === 0) {
      clearInterval(countdown);
      gameInterval = setInterval(drawGame, speed);
      scoreEl.textContent = "分數：0";
    } else {
      scoreEl.textContent = `倒數 ${count--} 秒...`;
    }
  }, 1000);
}

function restartGame() {
  clearInterval(gameInterval);
  startGame();
}

function togglePause() {
  paused = !paused;
  pauseBtn.textContent = paused ? "▶️ 繼續" : "⏸️ 暫停";
}

function changeDirection(e) {
  const key = e.key;
  if (key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  else if (key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  else if (key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
  else if (key === "ArrowDown" && direction !== "UP") direction = "DOWN";
}

// 事件監聽
document.addEventListener("keydown", changeDirection);
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);
pauseBtn.addEventListener("click", togglePause);

// 防止方向鍵捲動頁面
window.addEventListener("keydown", e => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault();
  }
});