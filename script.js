/*
  script.js
  --------------------------
  Este arquivo contém toda a lógica do Jogo da Memória.
  Ele gerencia a criação do tabuleiro, o comportamento das cartas,
  a contagem de movimentos, pontuação, timer e alternância de turnos
  no modo multijogador.
*/

/* Seleção de elementos HTML importantes */
const board = document.getElementById("game-board");
const startBtn = document.getElementById("startBtn");
const movesDisplay = document.getElementById("moves");
const timerDisplay = document.getElementById("timer");
const scoreDisplay = document.getElementById("score");
const turnDisplay = document.getElementById("turn");
const difficultySelect = document.getElementById("difficulty");
const modeSelect = document.getElementById("mode");
const contrastToggle = document.getElementById("contrastToggle");

/* Objeto que mantém o estado do jogo */
let gameState = {
  cards: [],          // Lista de cartas do jogo
  firstCard: null,    // Primeira carta selecionada no turno
  secondCard: null,   // Segunda carta selecionada no turno
  lockBoard: false,   // Bloqueia o tabuleiro durante animações
  moves: 0,           // Contagem de movimentos realizados
  score: 0,           // Pontuação no modo solo
  seconds: 0,         // Tempo decorrido
  currentPlayer: 1,   // Jogador atual (modo multijogador)
  players: [0, 0],    // Pontuação de cada jogador (modo multijogador)
  isMultiplayer: false, // Indica se é modo multijogador
  timer: null         // Referência do setInterval do timer
};

/* Emojis utilizados como cartas */
const emojis = ["🍎", "🍌", "🍇", "🍉", "🍒", "🍍", "🥝", "🥥", "🍑", "🍓", "🍋", "🍊"];

/* Alterna o modo de contraste alto */
contrastToggle.addEventListener("click", () => {
  document.body.classList.toggle("high-contrast");
});

/* Inicia o jogo quando o botão é clicado */
startBtn.addEventListener("click", startGame);

/* Função principal que inicia o jogo */
function startGame() {
  const pairs = parseInt(difficultySelect.value); // Número de pares de cartas
  gameState.isMultiplayer = modeSelect.value === "multi"; // Define se é multijogador
  resetGame();           // Reseta o estado do jogo
  generateBoard(pairs);  // Gera as cartas no tabuleiro
  startTimer();          // Inicia o cronômetro
  updateTurnDisplay();   // Atualiza indicação de turno
}

/* Reseta todas as variáveis e elementos para o início de um novo jogo */
function resetGame() {
  clearInterval(gameState.timer); // Para o cronômetro
  board.innerHTML = "";           // Limpa o tabuleiro
  gameState.cards = [];
  gameState.firstCard = null;
  gameState.secondCard = null;
  gameState.lockBoard = false;
  gameState.moves = 0;
  gameState.score = 0;
  gameState.seconds = 0;
  gameState.players = [0, 0];
  gameState.currentPlayer = 1;
  updateUI();                     // Atualiza contadores na tela
}

/* Cria as cartas no tabuleiro com base na dificuldade */
function generateBoard(pairs) {
  const selected = emojis.slice(0, pairs);            // Seleciona emojis para os pares
  const cardSet = [...selected, ...selected].sort(() => 0.5 - Math.random()); // Duplica e embaralha
  const cols = Math.ceil(Math.sqrt(pairs * 2));      // Define colunas do grid
  board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

  // Cria elementos de cartas e adiciona ao tabuleiro
  cardSet.forEach((emoji, index) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.emoji = emoji;  // Armazena o emoji na carta
    card.textContent = "?";       // Carta fechada
    board.appendChild(card);
    gameState.cards.push(card);

    // Adiciona evento de clique para virar carta
    card.addEventListener("click", () => flipCard(card));
  });
}

/* Função que "vira" uma carta */
function flipCard(card) {
  // Evita virar cartas já viradas ou bloqueadas
  if (gameState.lockBoard || card === gameState.firstCard || card.classList.contains("matched")) return;

  card.textContent = card.dataset.emoji;
  card.classList.add("flipped");

  if (!gameState.firstCard) {
    gameState.firstCard = card; // Primeira carta do turno
    return;
  }

  gameState.secondCard = card; // Segunda carta do turno
  checkForMatch();             // Verifica se há correspondência
}

/* Verifica se as duas cartas viradas são iguais */
function checkForMatch() {
  const isMatch = gameState.firstCard.dataset.emoji === gameState.secondCard.dataset.emoji;

  if (isMatch) {
    // Cartas combinam
    gameState.firstCard.classList.add("matched");
    gameState.secondCard.classList.add("matched");
    updateScore();           // Atualiza pontuação
    resetBoardTurn();        // Reseta variáveis do turno
    // Verifica se todas as cartas foram combinadas
    if (gameState.cards.every(c => c.classList.contains("matched"))) {
      clearInterval(gameState.timer);
      alert("Jogo concluído!");
    }
  } else {
    // Cartas não combinam
    gameState.lockBoard = true;
    setTimeout(() => {
      gameState.firstCard.textContent = "?";
      gameState.secondCard.textContent = "?";
      gameState.firstCard.classList.remove("flipped");
      gameState.secondCard.classList.remove("flipped");
      resetBoardTurn();
      switchTurn();          // Alterna jogador (modo multijogador)
    }, 1000);
  }
  gameState.moves++;
  updateUI();                 // Atualiza movimentos e pontuação na tela
}

/* Reseta variáveis do turno para permitir próximo clique */
function resetBoardTurn() {
  gameState.firstCard = null;
  gameState.secondCard = null;
  gameState.lockBoard = false;
}

/* Atualiza a pontuação dependendo do modo de jogo */
function updateScore() {
  if (gameState.isMultiplayer) {
    gameState.players[gameState.currentPlayer - 1]++;
  } else {
    gameState.score += 10;
  }
}

/* Atualiza contadores e pontuação no HTML */
function updateUI() {
  movesDisplay.textContent = `Movimentos: ${gameState.moves}`;
  scoreDisplay.textContent = gameState.isMultiplayer
    ? `P1: ${gameState.players[0]} | P2: ${gameState.players[1]}`
    : `Pontuação: ${gameState.score}`;
}

/* Inicia ou reinicia o cronômetro do jogo */
function startTimer() {
  if (gameState.timer) clearInterval(gameState.timer);
  gameState.timer = setInterval(() => {
    gameState.seconds++;
    const mm = String(Math.floor(gameState.seconds / 60)).padStart(2, "0");
    const ss = String(gameState.seconds % 60).padStart(2, "0");
    timerDisplay.textContent = `${mm}:${ss}`;
  }, 1000);
}

/* Alterna o turno entre jogadores no modo multijogador */
function switchTurn() {
  if (!gameState.isMultiplayer) return;
  gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
  updateTurnDisplay();
}

/* Atualiza a indicação de vez do jogador */
function updateTurnDisplay() {
  turnDisplay.textContent = gameState.isMultiplayer ? `Vez do Jogador ${gameState.currentPlayer}` : "";
}
