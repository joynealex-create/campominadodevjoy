/* =========================================================
   Campo Minado — Lógica principal
   - Gera tabuleiro (rows x cols)
   - Minas são colocadas APÓS o primeiro clique (segurança)
   - Clique esquerdo revela
   - Clique direito alterna bandeira
   - Flood fill abre áreas vazias
   - Detecta vitória/derrota
   ========================================================= */

const elBoard = document.querySelector("#board");
const elRows = document.querySelector("#rows");
const elCols = document.querySelector("#cols");
const elMines = document.querySelector("#mines");
const elNew = document.querySelector("#btnNew");
const elMinesLeft = document.querySelector("#minesLeft");
const elTime = document.querySelector("#time");
const elMessage = document.querySelector("#message");

let state = null; // estado do jogo atual (objeto)

elNew.addEventListener("click", newGame);

// Bloqueia o menu de contexto do clique direito no tabuleiro (para usar bandeira)
elBoard.addEventListener("contextmenu", (e) => e.preventDefault());

// Inicia um jogo padrão ao abrir
newGame();

function newGame() {
  const rows = clampInt(+elRows.value, 5, 30);
  const cols = clampInt(+elCols.value, 5, 40);

  // Ajuste: minas não podem ser >= total de células (deixa pelo menos 1 livre)
  const maxMines = Math.max(1, rows * cols - 1);
  const mines = clampInt(+elMines.value, 1, maxMines);
  elMines.value = mines; // normaliza no input

  state = createState(rows, cols, mines);
  renderBoard();
  updateHUD();
  setMessage("Boa sorte!", "");
}

function createState(rows, cols, mines) {
  return {
    rows,
    cols,
    minesTotal: mines,
    firstClickDone: false,
    gameOver: false,
    win: false,
    flags: 0,
    openedCount: 0,
    timer: {
      id: null,
      startAt: null,
      seconds: 0,
    },
    // grid de células (matriz)
    grid: Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => ({
        r, c,
        mine: false,
        open: false,
        flag: false,
        adj: 0, // minas adjacentes
      }))
    ),
  };
}

function renderBoard() {
  // Define colunas no CSS Grid dinamicamente
  elBoard.style.gridTemplateColumns = `repeat(${state.cols}, 34px)`;

  // Limpa e recria o tabuleiro
  elBoard.innerHTML = "";

  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      const cell = state.grid[r][c];

      const btn = document.createElement("button");
      btn.className = "cell";
      btn.type = "button";
      btn.setAttribute("role", "gridcell");
      btn.setAttribute("aria-label", `Célula ${r + 1}, ${c + 1}`);
      btn.dataset.r = r;
      btn.dataset.c = c;

      // Clique esquerdo: revelar
      btn.addEventListener("click", onLeftClick);

      // Clique direito: alternar bandeira
      btn.addEventListener("contextmenu", onRightClick);

      elBoard.appendChild(btn);
    }
  }

  // Após criar os botões, faz um "sync" inicial de UI
  syncAllCellsUI();
}

function onLeftClick(e) {
  if (!state || state.gameOver) return;

  const r = +e.currentTarget.dataset.r;
  const c = +e.currentTarget.dataset.c;

  const cell = state.grid[r][c];
  if (cell.flag || cell.open) return;

  // No primeiro clique, colocamos minas garantindo que:
  // - a célula clicada não é mina
  // - (opcional) podemos proteger vizinhos também (aqui vamos proteger só a clicada)
  if (!state.firstClickDone) {
    placeMinesAvoiding(r, c);
    computeAdjacencies();
    state.firstClickDone = true;
    startTimer();
  }

  reveal(r, c);

  // Verifica derrota
  if (cell.mine) {
    endGame(false);
    return;
  }

  // Verifica vitória após cada ação relevante
  checkWin();
  updateHUD();
  syncAllCellsUI();
}

function onRightClick(e) {
  if (!state || state.gameOver) return;

  const r = +e.currentTarget.dataset.r;
  const c = +e.currentTarget.dataset.c;

  const cell = state.grid[r][c];
  if (cell.open) return;

  // Alterna bandeira
  cell.flag = !cell.flag;
  state.flags += cell.flag ? 1 : -1;

  updateHUD();
  syncCellUI(r, c);
  checkWin();
}

function placeMinesAvoiding(avoidR, avoidC) {
  const candidates = [];

  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      if (r === avoidR && c === avoidC) continue; // evita o primeiro clique
      candidates.push({ r, c });
    }
  }

  shuffle(candidates);

  for (let i = 0; i < state.minesTotal; i++) {
    const { r, c } = candidates[i];
    state.grid[r][c].mine = true;
  }
}

function computeAdjacencies() {
  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      const cell = state.grid[r][c];
      cell.adj = countAdjacentMines(r, c);
    }
  }
}

function countAdjacentMines(r, c) {
  let count = 0;
  for (const n of neighbors(r, c)) {
    if (state.grid[n.r][n.c].mine) count++;
  }
  return count;
}

function neighbors(r, c) {
  const out = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const rr = r + dr;
      const cc = c + dc;
      if (rr < 0 || cc < 0 || rr >= state.rows || cc >= state.cols) continue;
      out.push({ r: rr, c: cc });
    }
  }
  return out;
}

function reveal(r, c) {
  const cell = state.grid[r][c];
  if (cell.open || cell.flag) return;

  cell.open = true;
  state.openedCount++;

  // Se clicou em mina, não faz flood fill
  if (cell.mine) return;

  // Se não há minas adjacentes, abre em “cascata” (flood fill)
  if (cell.adj === 0) {
    for (const n of neighbors(r, c)) {
      const nCell = state.grid[n.r][n.c];
      if (!nCell.open && !nCell.mine && !nCell.flag) {
        reveal(n.r, n.c);
      }
    }
  }
}

function checkWin() {
  if (!state || state.gameOver) return;

  // Condição de vitória: todas as células NÃO-mina foram abertas
  const totalCells = state.rows * state.cols;
  const safeCells = totalCells - state.minesTotal;

  if (state.openedCount === safeCells) {
    endGame(true);
  }
}

function endGame(won) {
  state.gameOver = true;
  state.win = !!won;
  stopTimer();

  // Revela todas as minas no fim do jogo (visual)
  if (!won) {
    for (let r = 0; r < state.rows; r++) {
      for (let c = 0; c < state.cols; c++) {
        const cell = state.grid[r][c];
        if (cell.mine) cell.open = true;
      }
    }
    setMessage("Você perdeu! Clique em “Novo Jogo” para tentar novamente.", "lose");
  } else {
    setMessage("Você venceu! Parabéns!", "win");
  }

  updateHUD();
  syncAllCellsUI();
}

function updateHUD() {
  // Minas restantes (estimativa: minas - bandeiras)
  const left = state.minesTotal - state.flags;
  elMinesLeft.textContent = String(left);

  elTime.textContent = String(state.timer.seconds);
}

function setMessage(text, typeClass) {
  elMessage.textContent = text;
  elMessage.className = "message";
  if (typeClass) elMessage.classList.add(typeClass);
}

/* =========================================================
   TIMER
   ========================================================= */
function startTimer() {
  stopTimer();
  state.timer.startAt = Date.now();
  state.timer.seconds = 0;
  elTime.textContent = "0";

  state.timer.id = setInterval(() => {
    state.timer.seconds = Math.floor((Date.now() - state.timer.startAt) / 1000);
    elTime.textContent = String(state.timer.seconds);
  }, 250);
}

function stopTimer() {
  if (state?.timer?.id) clearInterval(state.timer.id);
  if (state?.timer) state.timer.id = null;
}

/* =========================================================
   UI SYNC — atualiza a aparência das células
   ========================================================= */
function syncAllCellsUI() {
  // Percorre os botões na ordem em que foram criados
  const buttons = elBoard.querySelectorAll(".cell");
  let i = 0;

  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      const btn = buttons[i++];
      paintButton(btn, state.grid[r][c]);
    }
  }
}

function syncCellUI(r, c) {
  // Localiza o botão pela posição no grid linear
  const idx = r * state.cols + c;
  const btn = elBoard.querySelectorAll(".cell")[idx];
  paintButton(btn, state.grid[r][c]);
}

function paintButton(btn, cell) {
  btn.className = "cell"; // reseta classes
  btn.textContent = "";   // reseta texto

  // Estado visual: aberto/fechado
  if (cell.open) btn.classList.add("open");

  // Bandeira (só aparece se não estiver aberto)
  if (!cell.open && cell.flag) {
    btn.classList.add("flag");
    btn.textContent = "🚩";
  }

  // Mina revelada
  if (cell.open && cell.mine) {
    btn.classList.add("mine");
    btn.textContent = "💣";
  }

  // Número (se aberto, não mina, e adj > 0)
  if (cell.open && !cell.mine && cell.adj > 0) {
    btn.textContent = String(cell.adj);
    btn.classList.add(`n${cell.adj}`); // aplica cor por classe n1..n8
  }

  // Acessibilidade (aria)
  if (cell.open) {
    btn.setAttribute("aria-disabled", "true");
  } else {
    btn.removeAttribute("aria-disabled");
  }

  // Se acabou o jogo, desabilita interações
  btn.disabled = !!state.gameOver;
}

/* =========================================================
   UTILITÁRIOS
   ========================================================= */
function shuffle(arr) {
  // Fisher–Yates shuffle
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function clampInt(n, min, max) {
  n = Number.isFinite(n) ? Math.floor(n) : min;
  return Math.max(min, Math.min(max, n));
}