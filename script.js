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
  timer: null,
  isReadingEnabled: false,
  isMouseOverCard: false, // Controla se o mouse está sobre a carta
  lastSpokenCard: null, // Controla a última carta falada para evitar repetição
};

const emojis = ["🍎", "🍌", "🍇", "🍉", "🍒", "🍍", "🥝", "🥥", "🍑", "🍓", "🍋", "🍊"];

// Fala inicial para orientar
document.addEventListener("DOMContentLoaded", () => {
  speak("Bem-vindo ao jogo da memória. Pressione Alt mais L para ativar o modo leitura falada.");
  
  // Mensagem de instrução sobre o comando Alt+L
  setInterval(() => {
    if (gameState.isReadingEnabled) {
      speak("Lembre-se, você pode pressionar Alt e L para ativar ou desativar a leitura falada.");
    }
  }, 120000); // Repeats every 2 minutes
});

// Atalho para ativar/desativar modo leitura
document.addEventListener("keydown", (e) => {
  if (e.altKey && e.key.toLowerCase() === "l") {
    gameState.isReadingEnabled = !gameState.isReadingEnabled;
    speak(`Modo leitura ${gameState.isReadingEnabled ? "ativado" : "desativado"}`);
  }
});

// Alto contraste
contrastToggle.addEventListener("click", () => {
  document.body.classList.toggle("high-contrast");
});

// Adicionando eventos para leitura de configuração
difficultySelect.addEventListener("mouseenter", () => {
  if (gameState.isReadingEnabled) {
    speak("Selecione a dificuldade");
  }
});

difficultySelect.addEventListener("change", () => {
  if (gameState.isReadingEnabled) {
    const difficulty = difficultySelect.options[difficultySelect.selectedIndex].text;
    speak(`Dificuldade selecionada: ${difficulty}`);
  }
});

modeSelect.addEventListener("mouseenter", () => {
  if (gameState.isReadingEnabled) {
    speak("Selecione o modo de jogo");
  }
});

modeSelect.addEventListener("change", () => {
  if (gameState.isReadingEnabled) {
    const mode = modeSelect.options[modeSelect.selectedIndex].text;
    speak(`Modo selecionado: ${mode}`);
  }
});

contrastToggle.addEventListener("mouseenter", () => {
  if (gameState.isReadingEnabled) {
    speak("Ativar ou desativar alto contraste");
  }
});

startBtn.addEventListener("mouseenter", () => {
  if (gameState.isReadingEnabled) {
    speak("Iniciar o jogo");
  }
});

// Iniciar jogo
startBtn.addEventListener("click", startGame);

function startGame() {
  const pairs = parseInt(difficultySelect.value);
  gameState.isMultiplayer = (modeSelect.value === "multi");
  resetGame();
  generateBoard(pairs);
  startTimer();
  updateTurnDisplay();
}

function resetGame() {
  clearInterval(gameState.timer);
  gameState.cards = [];
  gameState.firstCard = null;
  gameState.secondCard = null;
  gameState.lockBoard = false;
  gameState.moves = 0;
  gameState.score = 0;
  gameState.seconds = 0;
  gameState.players = [0, 0];
  gameState.currentPlayer = 1;
  gameState.isReadingEnabled = gameState.isReadingEnabled; // mantém o estado atual
  gameState.lastSpokenCard = null; // Resetando o último número falado
  board.innerHTML = "";
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
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `Carta número ${index + 1}, ${emoji}`);
    card.dataset.emoji = emoji;

    const inner = document.createElement("div");
    inner.classList.add("card-inner");

    const front = document.createElement("div");
    front.classList.add("card-front");
    front.textContent = "❓";

    const back = document.createElement("div");
    back.classList.add("card-back");
    back.textContent = emoji;

    inner.append(front, back);
    card.appendChild(inner);
    board.appendChild(card);

    gameState.cards.push(card);

    // Eventos para interações
    card.addEventListener("click", () => flipCard(card, index));
    card.addEventListener("focus", () => {
      if (gameState.isReadingEnabled && !gameState.isMouseOverCard) {
        const num = index + 1;
        speakIfNeeded(`Carta ${num}`);
      }
    });

    // Adicionar evento de mouse para passar o foco sobre a carta
    card.addEventListener("mouseenter", () => {
      if (gameState.isReadingEnabled && !gameState.isMouseOverCard) {
        gameState.isMouseOverCard = true; // Marca que o mouse está sobre a carta
        const num = index + 1;
        speakIfNeeded(`Carta ${num}`);
      }
    });

    card.addEventListener("mouseleave", () => {
      gameState.isMouseOverCard = false; // Desmarca quando o mouse sai
    });

    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        flipCard(card, index);
      }
    });
  });
}

function flipCard(card, index) {
  if (gameState.lockBoard) return;
  if (card === gameState.firstCard) return;
  if (card.classList.contains("matched")) return;

  card.classList.add("flipped");

  if (!gameState.firstCard) {
    gameState.firstCard = card;
    if (gameState.isReadingEnabled) {
      speakIfNeeded(`Carta ${index + 1}, ${card.dataset.emoji}`);
    }
    return;
  }

  gameState.secondCard = card;
  checkForMatch(index);
}

function checkForMatch(index) {
  const isMatch = gameState.firstCard.dataset.emoji === gameState.secondCard.dataset.emoji;

  if (isMatch) {
    disableCards();
    updateScore();
    if (gameState.isReadingEnabled) speakIfNeeded(`Par encontrado! Você clicou nas cartas ${gameState.firstCard.dataset.emoji} e ${gameState.secondCard.dataset.emoji}`);
  } else {
    unflipCards();
    switchTurn();
    if (gameState.isReadingEnabled) speakIfNeeded("Cartas diferentes, vez do outro jogador.");
  }
  gameState.moves++;
  updateUI();
}

function disableCards() {
  gameState.firstCard.classList.add("matched");
  gameState.secondCard.classList.add("matched");
  resetBoardTurn();

  if (gameState.cards.every(c => c.classList.contains("matched"))) {
    clearInterval(gameState.timer);
    speakIfNeeded("Parabéns! Você completou o jogo.");
    setTimeout(() => alert("🎉 Jogo concluído!"), 500);
  }
}

function unflipCards() {
  gameState.lockBoard = true;
  setTimeout(() => {
    gameState.firstCard.classList.remove("flipped");
    gameState.secondCard.classList.remove("flipped");
    resetBoardTurn();
  }, 1000);
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
  if (gameState.isReadingEnabled) {
    if (gameState.isMultiplayer) {
      speakIfNeeded(`Pontuação: jogador 1 ${gameState.players[0]}, jogador 2 ${gameState.players[1]}`);
    } else {
      speakIfNeeded(`Pontuação: ${gameState.score}`);
    }
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
    timerDisplay.textContent = `⏱️ ${mm}:${ss}`;
  }, 1000);
}

function switchTurn() {
  if (!gameState.isMultiplayer) return;
  gameState.currentPlayer = (gameState.currentPlayer === 1 ? 2 : 1);
  updateTurnDisplay();
  if (gameState.isReadingEnabled) {
    speakIfNeeded(`Vez do jogador ${gameState.currentPlayer}`);
  }
}

function updateTurnDisplay() {
  if (gameState.isMultiplayer) {
    turnDisplay.textContent = `👉 Vez do Jogador ${gameState.currentPlayer}`;
  } else {
    turnDisplay.textContent = "";
  }
}

function speakIfNeeded(text) {
  if (gameState.lastSpokenCard === text) return; // Não fala a mesma carta repetidamente
  gameState.lastSpokenCard = text; // Marca a carta que foi falada
  speak(text);
}

function speak(text) {
  if (!gameState.isReadingEnabled) return;
  if (!window.speechSynthesis) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "pt-BR";
  window.speechSynthesis.speak(utter);
}
