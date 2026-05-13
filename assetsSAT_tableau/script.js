const SYMBOLS = [
  { id: "hash", label: "#", kind: "boundary" },
  { id: "left", label: "©", kind: "marker" },
  { id: "one", label: "1", kind: "tape" },
  { id: "blank", label: "β", kind: "tape" },
  { id: "q0", label: "q0", kind: "state" },
  { id: "q1", label: "q1", kind: "state" },
  { id: "q2", label: "q2", kind: "state" },
  { id: "q4", label: "q4", kind: "state" },
  { id: "q5", label: "q5", kind: "state" },
  { id: "q6", label: "q6", kind: "state" },
  { id: "qA", label: "qA", kind: "state" },
  { id: "qR", label: "qR", kind: "state" }
];

const SYMBOL_BY_ID = Object.fromEntries(SYMBOLS.map((symbol) => [symbol.id, symbol]));
const STATE_IDS = new Set(SYMBOLS.filter((symbol) => symbol.kind === "state").map((symbol) => symbol.id));

const MIN_INPUT_LENGTH = 0;
const MAX_INPUT_LENGTH = 12;
let COLS = 11;
let ROWS = 11;
const CELL = 42;
const DEPTH = 42;

const TRANSITIONS = {
  "q0:left": [
    { id: "q0-even", from: "q0", read: "left", to: "q1", write: "left", dir: "R", branch: "even" },
    { id: "q0-three", from: "q0", read: "left", to: "q4", write: "left", dir: "R", branch: "three" }
  ],
  "q1:one": [
    { id: "even-step", from: "q1", read: "one", to: "q2", write: "one", dir: "R", branch: "even" }
  ],
  "q2:one": [
    { id: "even-step", from: "q2", read: "one", to: "q1", write: "one", dir: "R", branch: "even" }
  ],
  "q1:blank": [
    { id: "even-accept", from: "q1", read: "blank", to: "qA", write: "blank", dir: "L", branch: "even" }
  ],
  "q2:blank": [
    { id: "even-reject", from: "q2", read: "blank", to: "qR", write: "blank", dir: "L", branch: "even" }
  ],
  "q4:one": [
    { id: "three-step", from: "q4", read: "one", to: "q5", write: "one", dir: "R", branch: "three" }
  ],
  "q5:one": [
    { id: "three-step", from: "q5", read: "one", to: "q6", write: "one", dir: "R", branch: "three" }
  ],
  "q6:one": [
    { id: "three-step", from: "q6", read: "one", to: "q4", write: "one", dir: "R", branch: "three" }
  ],
  "q4:blank": [
    { id: "three-accept", from: "q4", read: "blank", to: "qA", write: "blank", dir: "L", branch: "three" }
  ],
  "q5:blank": [
    { id: "three-reject", from: "q5", read: "blank", to: "qR", write: "blank", dir: "L", branch: "three" }
  ],
  "q6:blank": [
    { id: "three-reject", from: "q6", read: "blank", to: "qR", write: "blank", dir: "L", branch: "three" }
  ]
};

const TRANSITION_TEXT = {
  "q0-even": "Π(q0, ©) ∋ (q1, ©, D)",
  "q0-three": "Π(q0, ©) ∋ (q4, ©, D)",
  "even-step": "Π(q1, 1) = (q2, 1, D),  Π(q2, 1) = (q1, 1, D)",
  "even-accept": "Π(q1, β) = (qA, β, E)",
  "even-reject": "Π(q2, β) = (qR, β, E)",
  "three-step": "Π(q4, 1) = (q5, 1, D),  Π(q5, 1) = (q6, 1, D),  Π(q6, 1) = (q4, 1, D)",
  "three-accept": "Π(q4, β) = (qA, β, E)",
  "three-reject": "Π(q5, β) = (qR, β, E),  Π(q6, β) = (qR, β, E)"
};

const app = document.getElementById("app");
const viewport = document.getElementById("viewport");
const tableauSpace = document.getElementById("tableauSpace");
const sidePanel = document.getElementById("sidePanel");
const connectors = document.getElementById("connectors");
const statusStrip = document.getElementById("statusStrip");

const state = {
  inputLength: 6,
  branch: "even",
  focus: "assignment",
  panel: "machine",
  trace: null,
  selectedCell: { row: 3, col: 4 },
  selectedStartCol: 1,
  selectedAccept: null,
  selectedMove: null,
  view: {
    rx: 58,
    ry: 0,
    rz: -36,
    zoom: 1,
    panX: 0,
    panY: 0,
    perspective: "1400px",
    flattenDepth: false
  }
};

function labelOf(symbolId) {
  return SYMBOL_BY_ID[symbolId]?.label ?? symbolId;
}

function variableName(row, col, symbolId) {
  return `x_{${row + 1},${col + 1},${labelOf(symbolId)}}`;
}

function coordText(row, col) {
  return `(i=${row + 1}, j=${col + 1})`;
}

function inputWord() {
  return state.inputLength === 0 ? "ε" : "1".repeat(state.inputLength);
}

function inputSymbols() {
  return Array(state.inputLength).fill("one");
}

function updateTableauBounds() {
  const size = state.inputLength + 5;
  ROWS = size;
  COLS = size;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function initialConfig() {
  return ["hash", "q0", "left", ...inputSymbols(), "blank", "hash"];
}

function transitionChoices(config) {
  const stateIndex = config.findIndex((symbolId) => STATE_IDS.has(symbolId));
  if (stateIndex < 0) {
    throw new Error("Configuration has no state symbol.");
  }

  const currentState = config[stateIndex];
  const readIndex = stateIndex + 1;
  const readSymbol = config[readIndex];
  return {
    stateIndex,
    currentState,
    readIndex,
    readSymbol,
    choices: TRANSITIONS[`${currentState}:${readSymbol}`] ?? []
  };
}

function chooseTransition(choices, branch) {
  if (choices.length <= 1) {
    return choices[0] ?? null;
  }
  return choices.find((choice) => choice.branch === branch) ?? choices[0];
}

function applyTransition(config, branch) {
  const { stateIndex, currentState, readIndex, choices } = transitionChoices(config);
  const next = [...config];

  if (currentState === "qA" || currentState === "qR") {
    return { config: next, transition: { id: `pad-${currentState}`, from: currentState, to: currentState } };
  }

  const transition = chooseTransition(choices, branch);
  if (!transition) {
    throw new Error(`No transition for ${currentState} reading ${config[readIndex]}.`);
  }

  if (transition.dir === "R") {
    next[stateIndex] = transition.write;
    next[readIndex] = transition.to;
  } else {
    const leftIndex = stateIndex - 1;
    const carriedSymbol = config[leftIndex];
    next[leftIndex] = transition.to;
    next[stateIndex] = carriedSymbol;
    next[readIndex] = transition.write;
  }

  return { config: next, transition };
}

function buildTrace(branch) {
  const rows = [initialConfig()];
  const moves = [];

  for (let row = 1; row < ROWS; row += 1) {
    const result = applyTransition(rows[row - 1], branch);
    rows.push(result.config);
    moves.push(result.transition);
  }

  return { rows, moves };
}

function traceAccepts(trace) {
  return trace.rows.some((row) => row.includes("qA"));
}

function branchAccepts(branch) {
  return traceAccepts(buildTrace(branch));
}

function acceptingBranches() {
  return ["even", "three"].filter(branchAccepts);
}

function expectedTraceRows(branch) {
  return buildTrace(branch).rows.map((row) => row.join("|")).join("\n");
}

function verifyTrace(trace, branch) {
  const expected = expectedTraceRows(branch);
  const actual = trace.rows.map((row) => row.join("|")).join("\n");
  const startOk = trace.rows[0].join("|") === initialConfig().join("|");
  const acceptOk = trace.rows.some((row) => row.includes("qA"));
  const shapeOk = trace.rows.length === ROWS && trace.rows.every((row) => row.length === COLS);
  const moveOk = expected === actual;
  const trueCount = trace.rows.reduce((total, row) => total + row.length, 0);

  return {
    startOk,
    acceptOk,
    shapeOk,
    moveOk,
    cellOk: trueCount === ROWS * COLS,
    trueCount
  };
}

function coordinate(row, col, symbolIndex) {
  const centerCol = (COLS - 1) / 2;
  const centerRow = (ROWS - 1) / 2;
  const centerSymbol = (SYMBOLS.length - 1) / 2;
  const depth = state.view.flattenDepth ? 0 : (symbolIndex - centerSymbol) * DEPTH;
  return {
    x: (col - centerCol) * CELL,
    y: (row - centerRow) * CELL,
    z: depth
  };
}

function varId(row, col, symbolId) {
  return `var-r${row}-c${col}-s${symbolId}`;
}

function clampInt(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function findFirstAccept() {
  for (let row = 0; row < state.trace.rows.length; row += 1) {
    const col = state.trace.rows[row].indexOf("qA");
    if (col >= 0) {
      return { row, col };
    }
  }
  return null;
}

function defaultMoveSelection() {
  const preferred = state.trace.moves.findIndex((move) => move.id?.endsWith("accept"));
  let lastReal = -1;
  state.trace.moves.forEach((move, index) => {
    if (!move.id?.startsWith("pad-")) {
      lastReal = index;
    }
  });
  const topRow = Math.max(0, preferred >= 0 ? preferred : lastReal);
  const transition = state.trace.moves[topRow];
  const stateCol = state.trace.rows[topRow].findIndex((symbolId) => symbolId === transition?.from);

  return {
    bottomRow: clampInt(topRow + 1, 1, ROWS - 1),
    centerCol: clampInt(stateCol >= 0 ? stateCol : 1, 1, COLS - 2)
  };
}

function ensureSelections() {
  state.selectedCell = {
    row: clampInt(state.selectedCell?.row ?? 3, 0, ROWS - 1),
    col: clampInt(state.selectedCell?.col ?? 4, 0, COLS - 1)
  };
  state.selectedStartCol = clampInt(state.selectedStartCol ?? 1, 0, COLS - 1);

  if (!state.selectedAccept || state.trace.rows[state.selectedAccept.row]?.[state.selectedAccept.col] !== "qA") {
    state.selectedAccept = findFirstAccept();
  }

  const move = state.selectedMove ?? defaultMoveSelection();
  state.selectedMove = {
    bottomRow: clampInt(move.bottomRow, 1, ROWS - 1),
    centerCol: clampInt(move.centerCol, 1, COLS - 2)
  };
}

function selectedMoveWindow() {
  const selected = state.selectedMove ?? defaultMoveSelection();
  const bottomRow = clampInt(selected.bottomRow, 1, ROWS - 1);
  const centerCol = clampInt(selected.centerCol, 1, COLS - 2);
  const topRow = bottomRow - 1;
  const cols = [centerCol - 1, centerCol, centerCol + 1];
  const transition = state.trace.moves[topRow] ?? { id: "unknown" };
  const stateCol = state.trace.rows[topRow].findIndex((symbolId) => STATE_IDS.has(symbolId));
  const anchorCol = cols.includes(stateCol) ? stateCol : centerCol;
  const anchorRow = cols.includes(stateCol) ? topRow : bottomRow;

  return {
    transitionId: transition.id,
    topRow,
    bottomRow,
    centerCol,
    cols,
    anchor: { row: anchorRow, col: anchorCol, symbol: state.trace.rows[anchorRow][anchorCol] }
  };
}

function isInMoveWindow(row, col) {
  const win = selectedMoveWindow();
  return (row === win.topRow || row === win.bottomRow) && win.cols.includes(col);
}

function trueAnchor(row, col) {
  const symbolId = state.trace.rows[row][col];
  return document.getElementById(varId(row, col, symbolId));
}

function acceptAnchor() {
  if (!state.selectedAccept) {
    return null;
  }
  return trueAnchor(state.selectedAccept.row, state.selectedAccept.col);
}

function moveAnchor() {
  const win = selectedMoveWindow();
  return document.getElementById(varId(win.anchor.row, win.anchor.col, win.anchor.symbol));
}

function create3dLabel(text, row, col, symbolIndex, extraClass = "") {
  const point = coordinate(row, col, symbolIndex);
  const label = document.createElement("div");
  label.className = `label3d ${extraClass}`;
  label.textContent = text;
  label.style.setProperty("--x", `${point.x}px`);
  label.style.setProperty("--y", `${point.y}px`);
  label.style.setProperty("--z", `${point.z}px`);
  return label;
}

function createAxisLine(row, col, symbolIndex, length, className, rotation = "0deg", ry = "0deg") {
  const point = coordinate(row, col, symbolIndex);
  const line = document.createElement("div");
  line.className = `axis-line ${className}`;
  line.style.setProperty("--x", `${point.x}px`);
  line.style.setProperty("--y", `${point.y}px`);
  line.style.setProperty("--z", `${point.z}px`);
  line.style.setProperty("--len", `${length}px`);
  line.style.setProperty("--rot", rotation);
  line.style.setProperty("--ry-line", ry);
  return line;
}

function focusInfo(row, col, symbolId, isTrue) {
  const cell = state.selectedCell;
  const inCell = row === cell.row && col === cell.col;
  const inStart = row === 0;
  const inSelectedStart = inStart && col === state.selectedStartCol;
  const inAccept = isTrue && symbolId === "qA";
  const inSelectedAccept = inAccept && state.selectedAccept && row === state.selectedAccept.row && col === state.selectedAccept.col;
  const inMove = isTrue && isInMoveWindow(row, col);

  if (state.focus === "assignment") {
    return { focus: isTrue, stack: false, relevant: isTrue, window: false };
  }

  if (state.focus === "cell") {
    return { focus: isTrue && inCell, stack: inCell, relevant: inCell, window: false };
  }

  if (state.focus === "start") {
    return { focus: isTrue && inSelectedStart, stack: false, relevant: isTrue && inStart, window: false };
  }

  if (state.focus === "accept") {
    return { focus: inSelectedAccept, stack: false, relevant: inAccept, window: false };
  }

  if (state.focus === "move") {
    return { focus: inMove, stack: false, relevant: inMove, window: inMove };
  }

  return { focus: false, stack: false, relevant: isTrue, window: false };
}

function renderTableau() {
  tableauSpace.innerHTML = "";

  tableauSpace.appendChild(createAxisLine(-0.8, -0.5, -0.7, (COLS - 1) * CELL + 60, "cols"));
  tableauSpace.appendChild(createAxisLine(-0.5, -0.8, -0.7, (ROWS - 1) * CELL + 60, "rows", "90deg"));
  tableauSpace.appendChild(createAxisLine(-0.5, COLS - 0.15, -0.5, (SYMBOLS.length - 1) * DEPTH + 60, "depth", "0deg", "90deg"));

  for (let col = 0; col < COLS; col += 1) {
    tableauSpace.appendChild(create3dLabel(`j${col + 1}`, -1.15, col, -0.8));
  }

  for (let row = 0; row < ROWS; row += 1) {
    tableauSpace.appendChild(create3dLabel(`t${row + 1}`, row, -1.2, -0.8));
  }

  SYMBOLS.forEach((symbol, index) => {
    tableauSpace.appendChild(create3dLabel(symbol.label, -1.15, COLS + 0.25, index, "symbol-layer"));
  });

  state.trace.rows.forEach((rowSymbols, row) => {
    rowSymbols.forEach((trueSymbol, col) => {
      SYMBOLS.forEach((symbol, symbolIndex) => {
        const isTrue = symbol.id === trueSymbol;
        const focus = focusInfo(row, col, symbol.id, isTrue);
        const point = coordinate(row, col, symbolIndex);
        const variable = document.createElement("div");

        variable.id = varId(row, col, symbol.id);
        variable.className = [
          "var",
          `kind-${symbol.kind}`,
          `symbol-${symbol.id}`,
          isTrue ? "is-true" : "",
          isTrue ? "is-selectable" : "",
          focus.focus ? "is-focus" : "",
          focus.stack ? "is-stack" : "",
          focus.window ? "is-window" : "",
          isTrue && state.focus !== "assignment" && !focus.relevant ? "is-muted-true" : ""
        ].filter(Boolean).join(" ");
        variable.style.setProperty("--x", `${point.x}px`);
        variable.style.setProperty("--y", `${point.y}px`);
        variable.style.setProperty("--z", `${point.z}px`);
        variable.title = `${variableName(row, col, symbol.id)} = ${isTrue ? "true" : "false"}`;
        variable.dataset.row = String(row);
        variable.dataset.col = String(col);
        variable.dataset.symbol = symbol.id;
        variable.dataset.true = String(isTrue);

        const label = document.createElement("span");
        label.className = "var-label";
        label.textContent = symbol.label;
        variable.appendChild(label);
        tableauSpace.appendChild(variable);
      });
    });
  });
}

function activeTransitionId() {
  if (state.focus === "move") {
    return selectedMoveWindow().transitionId;
  }
  return state.branch === "even" ? "q0-even" : "q0-three";
}

function edgeClass(id) {
  const active = activeTransitionId();
  return `edge ${id === active ? "is-active" : ""}`;
}

function nodeClass(id, extra = "") {
  const active = activeTransitionId();
  const transition = Object.values(TRANSITIONS).flat().find((item) => item.id === active);
  const isActive = transition && (transition.from === id || transition.to === id);
  return `node ${extra} ${isActive ? "is-active" : ""}`;
}

function renderMachinePanel() {
  sidePanel.innerHTML = `
    <h1>MTND for unary multiples of 2 or 3</h1>
    <div class="machine-controls">
      <label class="input-control" title="Number of 1s in the unary input">
        <span>1s</span>
        <input id="inputLength" type="number" min="${MIN_INPUT_LENGTH}" max="${MAX_INPUT_LENGTH}" value="${state.inputLength}" inputmode="numeric">
      </label>
    </div>
    <p>Input in this tableau: <strong>w = ${inputWord()}</strong>. The nondeterministic split is the transition stated in the reference: Π(q0, ©) has one branch for multiples of 2 and one branch for multiples of 3.</p>

    <svg class="machine-graph" viewBox="0 0 380 260" role="img" aria-label="Nondeterministic Turing machine graph">
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="#7e8ca2"></path>
        </marker>
      </defs>
      <path class="${edgeClass("q0-even")}" d="M62 118 C92 80 103 68 124 62"></path>
      <path class="${edgeClass("q0-three")}" d="M62 134 C92 171 104 182 124 188"></path>
      <path class="${edgeClass("even-step")}" d="M160 60 C184 42 216 42 240 60"></path>
      <path class="${edgeClass("even-step")}" d="M240 80 C216 98 184 98 160 80"></path>
      <path class="${edgeClass("even-accept")}" d="M156 88 C200 122 252 126 304 124"></path>
      <path class="${edgeClass("even-reject")}" d="M268 88 C305 120 326 154 326 194"></path>
      <path class="${edgeClass("three-step")}" d="M160 188 C178 160 197 152 220 152"></path>
      <path class="${edgeClass("three-step")}" d="M244 166 C262 184 262 204 244 222"></path>
      <path class="${edgeClass("three-step")}" d="M220 224 C184 228 164 216 156 202"></path>
      <path class="${edgeClass("three-accept")}" d="M160 184 C205 142 252 126 304 124"></path>
      <path class="${edgeClass("three-reject")}" d="M248 210 C282 214 304 210 326 204"></path>

      <circle class="${nodeClass("q0")}" cx="42" cy="126" r="20"></circle>
      <circle class="${nodeClass("q1")}" cx="142" cy="70" r="20"></circle>
      <circle class="${nodeClass("q2")}" cx="260" cy="70" r="20"></circle>
      <circle class="${nodeClass("q4")}" cx="142" cy="192" r="20"></circle>
      <circle class="${nodeClass("q5")}" cx="232" cy="152" r="20"></circle>
      <circle class="${nodeClass("q6")}" cx="232" cy="224" r="20"></circle>
      <circle class="${nodeClass("qA", "accept")}" cx="326" cy="124" r="20"></circle>
      <circle class="${nodeClass("qR", "reject")}" cx="326" cy="204" r="20"></circle>

      <text class="svg-label" x="32" y="131">q0</text>
      <text class="svg-label" x="132" y="75">q1</text>
      <text class="svg-label" x="250" y="75">q2</text>
      <text class="svg-label" x="132" y="197">q4</text>
      <text class="svg-label" x="222" y="157">q5</text>
      <text class="svg-label" x="222" y="229">q6</text>
      <text class="svg-label" x="314" y="129">qA</text>
      <text class="svg-label" x="314" y="209">qR</text>

      <text class="svg-small" x="74" y="72">©/©,D</text>
      <text class="svg-small" x="74" y="184">©/©,D</text>
      <text class="svg-small" x="190" y="36">1/1,D</text>
      <text class="svg-small" x="190" y="112">1/1,D</text>
      <text class="svg-small" x="212" y="126">β/β,E</text>
      <text class="svg-small" x="286" y="162">β/β,E</text>
      <text class="svg-small" x="174" y="146">1/1,D</text>
      <text class="svg-small" x="262" y="188">1/1,D</text>
      <text class="svg-small" x="166" y="244">1/1,D</text>
    </svg>

    <section class="panel-section">
      ${transitionCard("q0-even", "nondeterministic branch", TRANSITION_TEXT["q0-even"])}
      ${transitionCard("q0-three", "nondeterministic branch", TRANSITION_TEXT["q0-three"])}
      ${transitionCard("even-step", "multiple of 2 scan", TRANSITION_TEXT["even-step"])}
      ${transitionCard("even-accept", "multiple of 2 accept", TRANSITION_TEXT["even-accept"])}
      ${transitionCard("even-reject", "multiple of 2 reject", TRANSITION_TEXT["even-reject"])}
      ${transitionCard("three-step", "multiple of 3 scan", TRANSITION_TEXT["three-step"])}
      ${transitionCard("three-accept", "multiple of 3 accept", TRANSITION_TEXT["three-accept"])}
      ${transitionCard("three-reject", "multiple of 3 reject", TRANSITION_TEXT["three-reject"])}
    </section>
  `;
}

function transitionCard(id, title, text) {
  const active = activeTransitionId() === id ? "is-active" : "";
  return `
    <article class="transition-card ${active}" id="transition-${id}">
      <div class="transition-title">
        <span>${title}</span>
        <span class="pill">${id}</span>
      </div>
      <code>${text}</code>
    </article>
  `;
}

function selectedWindowFormula() {
  const win = selectedMoveWindow();
  const literals = [];

  win.cols.forEach((col) => {
    literals.push(variableName(win.topRow, col, state.trace.rows[win.topRow][col]));
  });
  win.cols.forEach((col) => {
    literals.push(variableName(win.bottomRow, col, state.trace.rows[win.bottomRow][col]));
  });

  return `(${literals.join(" ∧ ")})`;
}

function startFormula() {
  return state.trace.rows[0].map((symbolId, col) => variableName(0, col, symbolId)).join(" ∧ ");
}

function renderFormulaPanel() {
  const cSet = `{ ${SYMBOLS.map((symbol) => symbol.label).join(", ")} }`;
  const pairCount = (SYMBOLS.length * (SYMBOLS.length - 1)) / 2;
  const cellClauses = ROWS * COLS * (1 + pairCount);
  const moveWindows = (ROWS - 1) * (COLS - 2);
  const selectedSymbol = state.trace.rows[state.selectedCell.row][state.selectedCell.col];
  const startSymbol = state.trace.rows[0][state.selectedStartCol];
  const selectedMove = selectedMoveWindow();
  const selectedBranchAccepts = traceAccepts(state.trace);
  const acceptedBy = acceptingBranches();
  const acceptNote = selectedBranchAccepts
    ? `Selected accepting literal: ${variableName(state.selectedAccept.row, state.selectedAccept.col, "qA")}.`
    : acceptedBy.length > 0
      ? `No qA appears in this displayed branch, so this branch fails φaccept. The full formula is satisfiable via branch ${acceptedBy.map((branch) => branch === "even" ? "×2" : "×3").join(" or ")}.`
      : "No qA appears in either branch, so φaccept cannot be satisfied for this input.";

  sidePanel.innerHTML = `
    <h1>Formula extracted from the tableau</h1>
    <p>C = ${cSet}. For w = ${inputWord()}, the tableau has m = ${ROWS} rows and ${COLS} columns, with one Boolean variable x<sub>i,j,s</sub> for every row, column, and possible symbol.</p>

    ${formulaBlock(
      "cell",
      "φcell",
      `${cellClauses} CNF clauses`,
      `φcell = ∧_{1≤i,j≤${ROWS}} [ (∨_{s∈C} x_{i,j,s}) ∧ ∧_{s<t∈C}(¬x_{i,j,s} ∨ ¬x_{i,j,t}) ]`,
      `Selected coordinate ${coordText(state.selectedCell.row, state.selectedCell.col)} has ${variableName(state.selectedCell.row, state.selectedCell.col, selectedSymbol)} true and the other ${SYMBOLS.length - 1} symbol layers false.`
    )}

    ${formulaBlock(
      "start",
      "φstart",
      `${COLS} unit clauses`,
      `φstart = ${startFormula()}`,
      `Selected unit: ${variableName(0, state.selectedStartCol, startSymbol)}. The first row is the initial configuration # q0 © ${inputWord() === "ε" ? "" : inputWord()} β #.`
    )}

    ${formulaBlock(
      "accept",
      "φaccept",
      `${ROWS * COLS} literals in one disjunction`,
      `φaccept = ∨_{1≤i,j≤${ROWS}} x_{i,j,qA}`,
      acceptNote
    )}

    ${formulaBlock(
      "move",
      "φmove",
      `${moveWindows} legal-window checks`,
      `φmove = ∧_{2≤i≤${ROWS}, 2≤j≤${COLS - 1}} ∨_{(a1,...,a6)∈Legal(N)} (x_{i-1,j-1,a1} ∧ x_{i-1,j,a2} ∧ x_{i-1,j+1,a3} ∧ x_{i,j-1,a4} ∧ x_{i,j,a5} ∧ x_{i,j+1,a6})`,
      `Selected window center ${coordText(selectedMove.bottomRow, selectedMove.centerCol)}. Highlighted disjunct: ${selectedWindowFormula()}`
    )}
  `;
}

function formulaBlock(id, title, pill, formula, note) {
  const active = state.focus === id ? "is-active" : "";
  return `
    <article class="formula-block ${active}" id="formula-${id}">
      <div class="formula-title">
        <span>${title}</span>
        <span class="pill">${pill}</span>
      </div>
      <code class="formula-line">${escapeHtml(formula)}</code>
      <p>${escapeHtml(note)}</p>
    </article>
  `;
}

function renderPanel() {
  if (state.panel === "machine") {
    renderMachinePanel();
  } else {
    renderFormulaPanel();
  }
}

function renderStatus() {
  const proof = verifyTrace(state.trace, state.branch);
  const branchText = state.branch === "even" ? "×2 branch" : "×3 branch";
  const selectedBranchAccepts = traceAccepts(state.trace);
  const acceptedBy = acceptingBranches();
  const formulaText = selectedBranchAccepts
    ? "selected branch satisfies φ"
    : acceptedBy.length > 0
      ? "selected branch fails φaccept; formula satisfiable via other branch"
      : "φaccept false; formula unsatisfiable";
  const selectedMove = selectedMoveWindow();
  const focusText = {
    assignment: "all true variables",
    cell: `φcell ${coordText(state.selectedCell.row, state.selectedCell.col)}`,
    start: `φstart j=${state.selectedStartCol + 1}`,
    accept: state.selectedAccept ? `φaccept ${coordText(state.selectedAccept.row, state.selectedAccept.col)}` : "φaccept no qA",
    move: `φmove ${coordText(selectedMove.bottomRow, selectedMove.centerCol)}`
  }[state.focus];

  statusStrip.textContent = [
    `w = ${inputWord()}`,
    `${ROWS}×${COLS} tableau`,
    `${SYMBOLS.length} symbol layers`,
    `${proof.trueCount} true variables`,
    `${branchText} ${selectedBranchAccepts ? "accepts" : "rejects"}`,
    focusText,
    proof.cellOk && proof.startOk && proof.moveOk && proof.shapeOk ? formulaText : "model check failed"
  ].join(" · ");
}

function updateControls() {
  const inputLengthControl = document.getElementById("inputLength");
  if (inputLengthControl) {
    inputLengthControl.value = String(state.inputLength);
  }
  document.querySelectorAll("[data-focus]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.focus === state.focus);
  });
  document.querySelectorAll("[data-branch]").forEach((button) => {
    const accepts = branchAccepts(button.dataset.branch);
    button.textContent = `${button.dataset.branch === "even" ? "branch ×2" : "branch ×3"} ${accepts ? "✓" : "×"}`;
    button.title = accepts ? "This branch accepts the current input" : "This branch rejects the current input";
    button.classList.toggle("is-active", button.dataset.branch === state.branch);
    button.classList.toggle("is-accepting", accepts);
    button.classList.toggle("is-rejecting", !accepts);
  });
  document.querySelectorAll("[data-panel]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.panel === state.panel);
  });
}

function render() {
  updateTableauBounds();
  state.trace = buildTrace(state.branch);
  ensureSelections();
  renderTableau();
  renderPanel();
  renderStatus();
  updateControls();
  window.requestAnimationFrame(drawConnectors);
}

function centerOf(element) {
  if (!element) {
    return null;
  }
  const appRect = app.getBoundingClientRect();
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2 - appRect.left,
    y: rect.top + rect.height / 2 - appRect.top
  };
}

function addConnector(from, to, secondary = false) {
  const start = centerOf(from);
  const end = centerOf(to);
  if (!start || !end) {
    return;
  }

  const dx = Math.max(80, Math.abs(end.x - start.x) * 0.34);
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute(
    "d",
    `M ${start.x} ${start.y} C ${start.x + dx} ${start.y}, ${end.x - dx} ${end.y}, ${end.x} ${end.y}`
  );
  path.setAttribute("class", `connector-line ${secondary ? "secondary" : ""}`);
  connectors.appendChild(path);

  [start, end].forEach((point) => {
    const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot.setAttribute("cx", point.x);
    dot.setAttribute("cy", point.y);
    dot.setAttribute("r", secondary ? "3" : "4");
    dot.setAttribute("class", "connector-dot");
    connectors.appendChild(dot);
  });
}

function drawConnectors() {
  connectors.innerHTML = "";

  if (!state.trace) {
    return;
  }

  if (state.panel === "formula") {
    if (state.focus === "cell") {
      const cell = state.selectedCell;
      addConnector(document.getElementById("formula-cell"), trueAnchor(cell.row, cell.col));
    }
    if (state.focus === "start") {
      addConnector(document.getElementById("formula-start"), trueAnchor(0, state.selectedStartCol));
    }
    if (state.focus === "accept") {
      addConnector(document.getElementById("formula-accept"), acceptAnchor());
    }
    if (state.focus === "move") {
      addConnector(document.getElementById("formula-move"), moveAnchor());
    }
  }

  if (state.panel === "machine") {
    const active = activeTransitionId();
    const transitionElement = document.getElementById(`transition-${active}`);
    if (state.focus === "move") {
      addConnector(transitionElement, moveAnchor());
    } else {
      const targetCol = state.branch === "even" ? 2 : 2;
      addConnector(transitionElement, trueAnchor(1, targetCol), true);
    }
  }
}

function applyView() {
  document.documentElement.style.setProperty("--rx", `${state.view.rx}deg`);
  document.documentElement.style.setProperty("--ry", `${state.view.ry}deg`);
  document.documentElement.style.setProperty("--rz", `${state.view.rz}deg`);
  document.documentElement.style.setProperty("--zoom", state.view.zoom.toFixed(3));
  document.documentElement.style.setProperty("--pan-x", `${state.view.panX}px`);
  document.documentElement.style.setProperty("--pan-y", `${state.view.panY}px`);
  document.documentElement.style.setProperty("--perspective", state.view.perspective ?? "1400px");
  window.requestAnimationFrame(drawConnectors);
}

function defaultView() {
  if (window.innerWidth <= 980) {
    return { rx: 58, ry: 0, rz: -36, zoom: Math.min(0.5, 5.5 / COLS), panX: 0, panY: -12, perspective: "1400px", flattenDepth: false };
  }
  return { rx: 58, ry: 0, rz: -36, zoom: Math.min(0.88, 9.7 / COLS), panX: -18, panY: -8, perspective: "1400px", flattenDepth: false };
}

function resetView() {
  state.view = defaultView();
  render();
  applyView();
}

function alignSymbolAxisView() {
  state.view = {
    rx: 0,
    ry: 0,
    rz: 0,
    zoom: window.innerWidth <= 980 ? Math.min(0.74, 8 / COLS) : Math.min(1.12, 12.3 / COLS),
    panX: 0,
    panY: 0,
    perspective: "none",
    flattenDepth: true
  };
  render();
  applyView();
}

function restoreDepthForRotation() {
  if (!state.view.flattenDepth) {
    return;
  }
  state.view.flattenDepth = false;
  state.view.perspective = "1400px";
  render();
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function wrapDegrees(value) {
  return ((((value + 180) % 360) + 360) % 360) - 180;
}

function moveSelectionFromClick(row, col, symbolId) {
  const candidates = [];
  const possibleBottomRows = [row, row + 1].filter((bottomRow) => bottomRow >= 1 && bottomRow < ROWS);
  const possibleCenterCols = [col - 1, col, col + 1].filter((centerCol) => centerCol >= 1 && centerCol < COLS - 1);

  possibleBottomRows.forEach((bottomRow) => {
    const topRow = bottomRow - 1;
    const stateCol = state.trace.rows[topRow].findIndex((candidate) => STATE_IDS.has(candidate));

    possibleCenterCols.forEach((centerCol) => {
      const cols = [centerCol - 1, centerCol, centerCol + 1];
      let score = 0;

      if (cols.includes(stateCol)) {
        score += 8;
      }
      if (centerCol === col) {
        score += 3;
      }
      if (STATE_IDS.has(symbolId) && symbolId !== "qA" && symbolId !== "qR" && bottomRow === row + 1) {
        score += 5;
      }
      if (bottomRow === row) {
        score += 1;
      }

      candidates.push({ bottomRow, centerCol, score });
    });
  });

  candidates.sort((a, b) => b.score - a.score);
  return candidates[0] ?? {
    bottomRow: clampInt(row, 1, ROWS - 1),
    centerCol: clampInt(col, 1, COLS - 2)
  };
}

function isSelectableForCurrentFocus(variable) {
  if (!variable || variable.dataset.true !== "true") {
    return false;
  }

  const row = Number(variable.dataset.row);
  const symbolId = variable.dataset.symbol;

  if (state.focus === "cell") {
    return true;
  }
  if (state.focus === "start") {
    return row === 0;
  }
  if (state.focus === "accept") {
    return symbolId === "qA";
  }
  if (state.focus === "move") {
    return true;
  }
  return false;
}

function selectableVariables() {
  return Array.from(document.querySelectorAll(".var.is-true")).filter(isSelectableForCurrentFocus);
}

function nearestSelectableVariable(clientX, clientY) {
  let nearest = null;
  let nearestDistance = Infinity;
  const radius = state.focus === "move" ? 72 : 58;

  selectableVariables().forEach((variable) => {
    const rect = variable.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const distance = Math.hypot(clientX - x, clientY - y);

    if (distance < nearestDistance) {
      nearest = variable;
      nearestDistance = distance;
    }
  });

  return nearestDistance <= radius ? nearest : null;
}

function handleVariableSelection(variable) {
  if (!isSelectableForCurrentFocus(variable)) {
    return;
  }

  const row = Number(variable.dataset.row);
  const col = Number(variable.dataset.col);
  const symbolId = variable.dataset.symbol;
  let changed = false;

  if (state.focus === "cell") {
    state.selectedCell = { row, col };
    changed = true;
  } else if (state.focus === "start" && row === 0) {
    state.selectedStartCol = col;
    changed = true;
  } else if (state.focus === "accept" && symbolId === "qA") {
    state.selectedAccept = { row, col };
    changed = true;
  } else if (state.focus === "move") {
    state.selectedMove = moveSelectionFromClick(row, col, symbolId);
    changed = true;
  }

  if (changed) {
    render();
  }
}

let dragState = null;

viewport.addEventListener("pointerdown", (event) => {
  const directVariable = event.target.closest?.(".var.is-true") ?? null;
  dragState = {
    x: event.clientX,
    y: event.clientY,
    totalX: 0,
    totalY: 0,
    didDrag: false,
    pan: event.shiftKey || event.button === 1,
    targetVar: isSelectableForCurrentFocus(directVariable)
      ? directVariable
      : nearestSelectableVariable(event.clientX, event.clientY)
  };
  viewport.classList.add("is-dragging");
  try {
    viewport.setPointerCapture(event.pointerId);
  } catch {
    // Synthetic pointer events used in automated checks do not own capture.
  }
});

viewport.addEventListener("pointermove", (event) => {
  if (!dragState) {
    return;
  }

  const dx = event.clientX - dragState.x;
  const dy = event.clientY - dragState.y;
  dragState.x = event.clientX;
  dragState.y = event.clientY;
  dragState.totalX += dx;
  dragState.totalY += dy;

  if (!dragState.didDrag && Math.hypot(dragState.totalX, dragState.totalY) < 4) {
    return;
  }

  dragState.didDrag = true;

  if (dragState.pan || event.shiftKey) {
    state.view.panX += dx;
    state.view.panY += dy;
  } else if (event.altKey || event.ctrlKey || event.metaKey) {
    restoreDepthForRotation();
    state.view.perspective = "1400px";
    state.view.ry = wrapDegrees(state.view.ry + dx * 0.28);
    state.view.rx = wrapDegrees(state.view.rx - dy * 0.22);
  } else {
    restoreDepthForRotation();
    state.view.perspective = "1400px";
    state.view.rz = wrapDegrees(state.view.rz + dx * 0.28);
    state.view.rx = wrapDegrees(state.view.rx - dy * 0.22);
  }

  applyView();
});

viewport.addEventListener("pointerup", (event) => {
  const selectionTarget = !dragState?.didDrag
    ? nearestSelectableVariable(event.clientX, event.clientY) ?? dragState?.targetVar
    : null;
  dragState = null;
  viewport.classList.remove("is-dragging");
  try {
    viewport.releasePointerCapture(event.pointerId);
  } catch {
    // Ignore missing capture for synthetic events.
  }
  handleVariableSelection(selectionTarget);
});

viewport.addEventListener("pointercancel", () => {
  dragState = null;
  viewport.classList.remove("is-dragging");
});

viewport.addEventListener("wheel", (event) => {
  event.preventDefault();
  const factor = event.deltaY < 0 ? 1.08 : 0.92;
  state.view.zoom = clamp(state.view.zoom * factor, 0.45, 2.2);
  applyView();
}, { passive: false });

document.querySelectorAll("[data-panel]").forEach((button) => {
  button.addEventListener("click", () => {
    state.panel = button.dataset.panel;
    render();
  });
});

function setInputLength(value) {
  const next = clampInt(Number.isFinite(value) ? value : state.inputLength, MIN_INPUT_LENGTH, MAX_INPUT_LENGTH);
  if (next === state.inputLength) {
    const inputLengthControl = document.getElementById("inputLength");
    if (inputLengthControl) {
      inputLengthControl.value = String(state.inputLength);
    }
    return;
  }

  state.inputLength = next;
  state.selectedAccept = null;
  state.selectedMove = null;
  updateTableauBounds();
  state.view = defaultView();
  render();
  applyView();
}

sidePanel.addEventListener("input", (event) => {
  if (event.target.id !== "inputLength" || event.target.value === "") {
    return;
  }
  setInputLength(Number(event.target.value));
});

sidePanel.addEventListener("change", (event) => {
  if (event.target.id !== "inputLength") {
    return;
  }
  if (event.target.value !== "") {
    setInputLength(Number(event.target.value));
  }
  event.target.value = String(state.inputLength);
});

document.querySelectorAll("[data-focus]").forEach((button) => {
  button.addEventListener("click", () => {
    state.focus = button.dataset.focus;
    if (["cell", "start", "accept", "move"].includes(state.focus)) {
      state.panel = "formula";
    }
    render();
  });
});

document.querySelectorAll("[data-branch]").forEach((button) => {
  button.addEventListener("click", () => {
    state.branch = button.dataset.branch;
    state.selectedAccept = null;
    state.selectedMove = null;
    render();
  });
});

document.getElementById("symbolAxisView").addEventListener("click", alignSymbolAxisView);
document.getElementById("resetView").addEventListener("click", resetView);
window.addEventListener("resize", drawConnectors);
sidePanel.addEventListener("scroll", drawConnectors);

state.trace = buildTrace(state.branch);
state.view = defaultView();
applyView();
render();
