// ── State ─────────────────────────────────────────────────────────────────────
const state = {
  board: Array(9).fill(null),
  currentPlayer: 'X',   // X = human, O = CPU
  gameOver: false,
  scores: { X: 0, O: 0, Draw: 0 }
};

const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8],   // rows
  [0,3,6],[1,4,7],[2,5,8],   // cols
  [0,4,8],[2,4,6]            // diags
];

// ── DOM ───────────────────────────────────────────────────────────────────────
const cells     = document.querySelectorAll('.cell');
const statusEl  = document.getElementById('status');
const restartEl = document.getElementById('restart');
const scoreX    = document.getElementById('score-x');
const scoreO    = document.getElementById('score-o');
const scoreDraw = document.getElementById('score-draw');

// ── Init ──────────────────────────────────────────────────────────────────────
cells.forEach(cell => cell.addEventListener('click', onCellClick));
restartEl.addEventListener('click', resetGame);
updateStatus("Your turn!");

// ── Player move ───────────────────────────────────────────────────────────────
function onCellClick(e) {
  const idx = +e.currentTarget.dataset.index;
  if (state.gameOver || state.board[idx] || state.currentPlayer !== 'X') return;

  makeMove(idx, 'X');
  if (state.gameOver) return;

  // CPU thinks after a short delay (feels more natural)
  statusEl.textContent = "CPU is thinking…";
  setTimeout(cpuMove, 400);
}

function makeMove(idx, player) {
  state.board[idx] = player;
  const cell = cells[idx];
  cell.textContent = player;
  cell.classList.add(player.toLowerCase(), 'taken');

  const result = checkResult();
  if (result) {
    endGame(result);
  } else {
    state.currentPlayer = player === 'X' ? 'O' : 'X';
  }
}

// ── CPU (minimax) ─────────────────────────────────────────────────────────────
function cpuMove() {
  if (state.gameOver) return;
  const best = getBestMove(state.board);
  makeMove(best, 'O');
  if (!state.gameOver) updateStatus("Your turn!");
}

function getBestMove(board) {
  let bestScore = -Infinity;
  let bestIdx   = -1;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = 'O';
      const score = minimax(board, 0, false, -Infinity, Infinity);
      board[i] = null;
      if (score > bestScore) { bestScore = score; bestIdx = i; }
    }
  }
  return bestIdx;
}

function minimax(board, depth, isMax, alpha, beta) {
  const result = checkResultStatic(board);
  if (result === 'O')    return 10 - depth;
  if (result === 'X')    return depth - 10;
  if (result === 'Draw') return 0;

  if (isMax) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'O';
        best = Math.max(best, minimax(board, depth+1, false, alpha, beta));
        board[i] = null;
        alpha = Math.max(alpha, best);
        if (beta <= alpha) break;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'X';
        best = Math.min(best, minimax(board, depth+1, true, alpha, beta));
        board[i] = null;
        beta = Math.min(beta, best);
        if (beta <= alpha) break;
      }
    }
    return best;
  }
}

// ── Win detection ─────────────────────────────────────────────────────────────
function checkResult() {
  return checkResultStatic(state.board);
}

function checkResultStatic(board) {
  for (const [a,b,c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  if (board.every(Boolean)) return 'Draw';
  return null;
}

function getWinLine(board) {
  for (const line of WIN_LINES) {
    const [a,b,c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return line;
  }
  return null;
}

// ── End game ──────────────────────────────────────────────────────────────────
function endGame(result) {
  state.gameOver = true;
  if (result === 'Draw') {
    statusEl.textContent = "It's a draw! 🤝";
    statusEl.className = 'status draw';
    state.scores.Draw++;
    scoreDraw.textContent = state.scores.Draw;
  } else if (result === 'X') {
    statusEl.textContent = "You win! 🎉";
    statusEl.className = 'status win';
    state.scores.X++;
    scoreX.textContent = state.scores.X;
    highlightWin(result);
  } else {
    statusEl.textContent = "CPU wins! 🤖";
    statusEl.className = 'status lose';
    state.scores.O++;
    scoreO.textContent = state.scores.O;
    highlightWin(result);
  }
}

function highlightWin(winner) {
  const line = getWinLine(state.board);
  if (line) line.forEach(i => cells[i].classList.add('winner'));
}

// ── Reset ─────────────────────────────────────────────────────────────────────
function resetGame() {
  state.board = Array(9).fill(null);
  state.currentPlayer = 'X';
  state.gameOver = false;

  cells.forEach(cell => {
    cell.textContent = '';
    cell.className = 'cell';
  });
  updateStatus("Your turn!");
}

function updateStatus(msg) {
  statusEl.textContent = msg;
  statusEl.className = 'status';
}
