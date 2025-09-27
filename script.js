const board = document.getElementById("game-board");
const startBtn = document.getElementById("startBtn");
const movesDisplay = document.getElementById("moves");
const timerDisplay = document.getElementById("timer");
const scoreDisplay = document.getElementById("score");
const turnDisplay = document.getElementById("turn");
const difficultySelect = document.getElementById("difficulty");
const modeSelect = document.getElementById("mode");
const contrastToggle = document.getElementById("contrastToggle");

let gameState = {
  cards: [],
  firstCard: null,
  secondCard: null,
  lockBoard: false,
  moves: 0,
  score: 0,
  seconds: 0,
  currentPlayer: 1,
  players: [0, 0],
  isMultiplayer: false,
  timer: null
};

const emojis = ["🍎", "🍌", "🍇", "🍉", "🍒", "🍍", "🥝", "🥥", "🍑", "🍓", "🍋", "🍊"];

contrastToggle.addEventListener("click", () => {
  document.body.classList.toggle("high-contrast");
});

startBtn.addEventListener("click", startGame);

function startGame() {
  const pairs = parseInt(difficultySelect.value);
  gameState.isMultiplayer = modeSelect.value === "multi";
  resetGame();
  generateBoard(pairs);
  startTimer();
  updateTurnDisplay();
}

function resetGame() {
  clearInterval(gameState.timer);
  board.innerHTML = "";
  gameState.cards = [];
  gameState.firstCard = null;
  gameState.secondCard = null;
  gameState.lockBoard = false;
  gameState.moves = 0;
  gameState.score = 0;
  gameState.seconds = 0;
  gameState.players = [0, 0];
  gameState.currentPlayer = 1;
  updateUI();
}

function generateBoard(pairs) {
  const selected = emojis.slice(0, pairs);
  const cardSet = [...selected, ...selected].sort(() => 0.5 - Math.random());
  const cols = Math.ceil(Math.sqrt(pairs * 2));
  board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

  cardSet.forEach((emoji, index) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.emoji = emoji;
    card.textContent = "?";
    board.appendChild(card);
    gameState.cards.push(card);

    card.addEventListener("click", () => flipCard(card));
  });
}

function flipCard(card) {
  if (gameState.lockBoard || card === gameState.firstCard || card.classList.contains("matched")) return;

  card.textContent = card.dataset.emoji;
  card.classList.add("flipped");

  if (!gameState.firstCard) {
    gameState.firstCard = card;
    return;
  }

  gameState.secondCard = card;
  checkForMatch();
}

function checkForMatch() {
  const isMatch = gameState.firstCard.dataset.emoji === gameState.secondCard.dataset.emoji;

  if (isMatch) {
    gameState.firstCard.classList.add("matched");
    gameState.secondCard.classList.add("matched");
    updateScore();
    resetBoardTurn();
    if (gameState.cards.every(c => c.classList.contains("matched"))) {
      clearInterval(gameState.timer);
      alert("Jogo concluído!");
    }
  } else {
    gameState.lockBoard = true;
    setTimeout(() => {
      gameState.firstCard.textContent = "?";
      gameState.secondCard.textContent = "?";
      gameState.firstCard.classList.remove("flipped");
      gameState.secondCard.classList.remove("flipped");
      resetBoardTurn();
      switchTurn();
    }, 1000);
  }
  gameState.moves++;
  updateUI();
}

function resetBoardTurn() {
  gameState.firstCard = null;
  gameState.secondCard = null;
  gameState.lockBoard = false;
}

function updateScore() {
  if (gameState.isMultiplayer) {
    gameState.players[gameState.currentPlayer - 1]++;
  } else {
    gameState.score += 10;
  }
}

function updateUI() {
  movesDisplay.textContent = `Movimentos: ${gameState.moves}`;
  scoreDisplay.textContent = gameState.isMultiplayer
    ? `P1: ${gameState.players[0]} | P2: ${gameState.players[1]}`
    : `Pontuação: ${gameState.score}`;
}

function startTimer() {
  if (gameState.timer) clearInterval(gameState.timer);
  gameState.timer = setInterval(() => {
    gameState.seconds++;
    const mm = String(Math.floor(gameState.seconds / 60)).padStart(2, "0");
    const ss = String(gameState.seconds % 60).padStart(2, "0");
    timerDisplay.textContent = `${mm}:${ss}`;
  }, 1000);
}

function switchTurn() {
  if (!gameState.isMultiplayer) return;
  gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
  updateTurnDisplay();
}

function updateTurnDisplay() {
  turnDisplay.textContent = gameState.isMultiplayer ? `Vez do Jogador ${gameState.currentPlayer}` : "";
}
