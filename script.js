const board = document.getElementById("game-board");
const startBtn = document.getElementById("startBtn");
const movesDisplay = document.getElementById("moves");
const timerDisplay = document.getElementById("timer");
const scoreDisplay = document.getElementById("score");
const turnDisplay = document.getElementById("turn");
const difficultySelect = document.getElementById("difficulty");
const modeSelect = document.getElementById("mode");

let cards = [];
let firstCard, secondCard;
let lockBoard = false;
let moves = 0;
let score = 0;
let timer;
let seconds = 0;
let currentPlayer = 1;
let players = [0, 0]; // pontuação de cada jogador
let isMultiplayer = false;

const emojis = ["🍎","🍌","🍇","🍉","🍒","🍍","🥝","🥥","🍑","🍓","🍋","🍊"];

startBtn.addEventListener("click", startGame);

function startGame() {
  const pairs = parseInt(difficultySelect.value);
  isMultiplayer = modeSelect.value === "multi";
  resetGame();
  generateBoard(pairs);
  startTimer();
  updateTurnDisplay();
}

function resetGame() {
  board.innerHTML = "";
  cards = [];
  firstCard = secondCard = null;
  lockBoard = false;
  moves = 0;
  score = 0;
  seconds = 0;
  players = [0, 0];
  currentPlayer = 1;
  updateUI();
  clearInterval(timer);
}

function generateBoard(pairs) {
  let chosen = emojis.slice(0, pairs);
  let gameEmojis = [...chosen, ...chosen];
  gameEmojis.sort(() => 0.5 - Math.random());

  let cols = Math.ceil(Math.sqrt(pairs * 2));
  board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

  gameEmojis.forEach(emoji => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.emoji = emoji;
    card.textContent = "❓";
    card.addEventListener("click", flipCard);
    board.appendChild(card);
    cards.push(card);
  });
}

function flipCard() {
  if (lockBoard || this === firstCard || this.classList.contains("matched")) return;

  this.textContent = this.dataset.emoji;
  this.classList.add("flipped");

  if (!firstCard) {
    firstCard = this;
    return;
  }

  secondCard = this;
  checkForMatch();
}

function checkForMatch() {
  let isMatch = firstCard.dataset.emoji === secondCard.dataset.emoji;

  if (isMatch) {
    disableCards();
    updateScore();
  } else {
    unflipCards();
    switchTurn();
  }
  moves++;
  updateUI();
}

function disableCards() {
  firstCard.classList.add("matched");
  secondCard.classList.add("matched");
  resetBoard();
  if (cards.every(c => c.classList.contains("matched"))) {
    clearInterval(timer);
    setTimeout(() => alert("🎉 Jogo concluído!"), 500);
  }
}

function unflipCards() {
  lockBoard = true;
  setTimeout(() => {
    firstCard.textContent = "❓";
    secondCard.textContent = "❓";
    firstCard.classList.remove("flipped");
    secondCard.classList.remove("flipped");
    resetBoard();
  }, 1000);
}

function resetBoard() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

function updateScore() {
  if (isMultiplayer) {
    players[currentPlayer - 1]++;
  } else {
    score += 10;
  }
}

function updateUI() {
  movesDisplay.textContent = `Movimentos: ${moves}`;
  scoreDisplay.textContent = isMultiplayer
    ? `P1: ${players[0]} | P2: ${players[1]}`
    : `Pontuação: ${score}`;
}

function startTimer() {
  timer = setInterval(() => {
    seconds++;
    let min = String(Math.floor(seconds / 60)).padStart(2, "0");
    let sec = String(seconds % 60).padStart(2, "0");
    timerDisplay.textContent = `⏱️ ${min}:${sec}`;
  }, 1000);
}

function switchTurn() {
  if (isMultiplayer) {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    updateTurnDisplay();
  }
}

function updateTurnDisplay() {
  if (isMultiplayer) {
    turnDisplay.textContent = `👉 Vez do Jogador ${currentPlayer}`;
  } else {
    turnDisplay.textContent = "";
  }
}