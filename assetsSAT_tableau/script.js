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
const panelResizer = document.getElementById("panelResizer");
const sidePanel = document.getElementById("sidePanel");
const connectors = document.getElementById("connectors");
const statusStrip = document.getElementById("statusStrip");
const themeToggle = document.getElementById("themeToggle");
const languageToggle = document.getElementById("languageToggle");
const referencesButton = document.getElementById("referencesButton");
const referencesModal = document.getElementById("referencesModal");
const referencesClose = document.getElementById("referencesClose");
const referencesModalEyebrow = document.getElementById("referencesModalEyebrow");
const referencesModalTitle = document.getElementById("referencesModalTitle");
const referencesModalSubtitle = document.getElementById("referencesModalSubtitle");
const referencesModalText = document.getElementById("referencesModalText");

const THEME_STORAGE_KEY = "sat-tableau-theme";
const LANGUAGE_STORAGE_KEY = "sat-tableau-language";
const PANEL_WIDTH_STORAGE_KEY = "sat-tableau-panel-width";
const PANEL_MIN_WIDTH = 300;
const PANEL_MAX_WIDTH = 720;
const WORKSPACE_MIN_WIDTH = 420;
const PANEL_RESIZER_WIDTH = 8;

function readStoredTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "clear";
  } catch {
    return "clear";
  }
}

function writeStoredTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Theme persistence is optional when storage is unavailable.
  }
}

function readStoredLanguage() {
  try {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY) === "pt" ? "pt" : "en";
  } catch {
    return "en";
  }
}

function writeStoredLanguage(language) {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Language persistence is optional when storage is unavailable.
  }
}

function readStoredPanelWidth() {
  try {
    const raw = localStorage.getItem(PANEL_WIDTH_STORAGE_KEY);
    if (raw === null) {
      return 420;
    }
    const stored = Number(raw);
    return Number.isFinite(stored) ? stored : 420;
  } catch {
    return 420;
  }
}

function writeStoredPanelWidth(width) {
  try {
    localStorage.setItem(PANEL_WIDTH_STORAGE_KEY, String(Math.round(width)));
  } catch {
    // Panel width persistence is optional when storage is unavailable.
  }
}

const UI_TEXT = {
  en: {
    htmlLang: "en",
    pageTitle: "Cook-Levin Tableau",
    metaDescription: "Interactive visualization of the Cook-Levin tableau construction for reducing nondeterministic Turing-machine computation to SAT.",
    eyebrow: "NP-Completeness",
    heading: "Cook-Levin Tableau Visualizer",
    subtitle: "A minimal tableau view of how nondeterministic Turing-machine computations become SAT formulas.",
    workspaceAria: "Cook-Levin tableau visualization",
    viewsAria: "Views",
    branchAria: "Accepting branch",
    tableauAria: "3D tableau variables",
    panelLabels: { machine: "Machine", formula: "Formula" },
    focusLabels: {
      assignment: "True variables",
      cell: "φcell",
      start: "φstart",
      accept: "φaccept",
      move: "φmove"
    },
    branchLabels: { even: "branch ×2", three: "branch ×3" },
    branchTitles: {
      accepts: "This branch accepts the current input",
      rejects: "This branch rejects the current input"
    },
    symbolAxisTitle: "View down the symbol axis",
    resetTitle: "Reset view",
    panelResizeTitle: "Resize side panel",
    themeTitles: { toDark: "Switch to dark mode", toClear: "Switch to clear mode" },
    language: { button: "PT", title: "Switch to Brazilian Portuguese" },
    footerRepository: "Project repository:",
    footerLicense: "MIT License",
    footerCredit: "Developed with assistance from Codex GPT-5.5.",
    references: {
      button: "References",
      title: "Show references",
      close: "Close references",
      eyebrow: "References",
      heading: "Proof Sources",
      subtitle: "Where the tableau construction used by this tool comes from.",
      paragraphs: [
        "The Cook-Levin theorem is due to Stephen Cook and Leonid Levin. It is the result that Boolean satisfiability is NP-complete: every nondeterministic polynomial-time computation can be encoded as a SAT instance.",
        "The proof style visualized here is the tableau or computation-history construction. It follows the standard classroom presentation in which the accepting run of a nondeterministic Turing machine is represented by a grid of configurations, and the SAT formula checks cells, the start configuration, acceptance, and legal local moves.",
        "The main theoretical source for this tool is Michael Sipser, Introduction to the Theory of Computation, especially the Cook-Levin proof and the use of local tableau windows.",
        "Historically, Richard Karp's 1972 paper on reducibility and his list of 21 NP-complete problems made this reduction-centered view of NP-completeness central. This visualization follows that Karp/Sipser-style way of teaching the theorem rather than an optimized encoding.",
        "A straightforward version of this tableau proof has an encoding size on the order of O(log(n^k)n^{3k}) for a polynomial-time computation bounded by n^k. Later refinements, appearing about seven years after the early NP-completeness papers, obtain O(n^k log(n^k)), which is quasilinear in the time bound. This tool intentionally does not develop that more technical proof."
      ]
    },
    booleanTrue: "true",
    booleanFalse: "false",
    machineTitle: "NDTM for unary multiples of 2 or 3",
    inputTitle: "Number of 1s in the unary input",
    inputLabel: "1s",
    machineIntro: (word) => `Input in this tableau: <strong>w = ${word}</strong>. The nondeterministic split is the transition stated in the reference: Π(q0, ©) has one branch for multiples of 2 and one branch for multiples of 3.`,
    machineGraphAria: "Nondeterministic Turing machine graph",
    transitionTitles: {
      "q0-even": "nondeterministic branch",
      "q0-three": "nondeterministic branch",
      "even-step": "multiple of 2 scan",
      "even-accept": "multiple of 2 accept",
      "even-reject": "multiple of 2 reject",
      "three-step": "multiple of 3 scan",
      "three-accept": "multiple of 3 accept",
      "three-reject": "multiple of 3 reject"
    },
    formulaTitle: "Formula extracted from the tableau",
    formulaIntro: (set, word, rows, cols) => `C = ${set}. For w = ${word}, the tableau has m = ${rows} rows and ${cols} columns, with one Boolean variable x<sub>i,j,s</sub> for every row, column, and possible symbol.`,
    cnfClauses: "CNF clauses",
    unitClauses: "unit clauses",
    disjunctionLiterals: "literals in one disjunction",
    legalWindowChecks: "legal-window checks",
    selectedAcceptingLiteral: (literal) => `Selected accepting literal: ${literal}.`,
    branchFailsAccept: (branches) => `No qA appears in this displayed branch, so this branch fails φaccept. The full formula is satisfiable via branch ${branches.join(" or ")}.`,
    noAcceptingBranch: "No qA appears in either branch, so φaccept cannot be satisfied for this input.",
    selectedCoordinate: (coord, variable, count) => `Selected coordinate ${coord} has ${variable} true and the other ${count} symbol layers false.`,
    selectedUnit: (variable, word) => `Selected unit: ${variable}. The first row is the initial configuration # q0 © ${word === "ε" ? "" : word} β #.`,
    selectedWindow: (coord, formula) => `Selected window center ${coord}. Highlighted disjunct: ${formula}`,
    statusFormula: {
      satisfied: "selected branch satisfies φ",
      otherBranch: "selected branch fails φaccept; formula satisfiable via other branch",
      unsat: "φaccept false; formula unsatisfiable",
      failed: "model check failed"
    },
    statusFocus: {
      assignment: "all true variables",
      acceptNone: "φaccept no qA"
    },
    status: {
      tableau: "tableau",
      symbolLayers: "symbol layers",
      trueVariables: "true variables",
      accepts: "accepts",
      rejects: "rejects"
    }
  },
  pt: {
    htmlLang: "pt-BR",
    pageTitle: "Tableau de Cook-Levin",
    metaDescription: "Visualização interativa da construção do tableau de Cook-Levin para reduzir computações de máquinas de Turing não determinísticas a SAT.",
    eyebrow: "NP-Completude",
    heading: "Visualizador do Tableau de Cook-Levin",
    subtitle: "Uma visão minimalista do tableau mostrando como computações de máquinas de Turing não determinísticas se tornam fórmulas SAT.",
    workspaceAria: "Visualização do tableau de Cook-Levin",
    viewsAria: "Visualizações",
    branchAria: "Ramo de aceitação",
    tableauAria: "Variáveis do tableau 3D",
    panelLabels: { machine: "Máquina", formula: "Fórmula" },
    focusLabels: {
      assignment: "Variáveis verdadeiras",
      cell: "φcell",
      start: "φstart",
      accept: "φaccept",
      move: "φmove"
    },
    branchLabels: { even: "ramo ×2", three: "ramo ×3" },
    branchTitles: {
      accepts: "Este ramo aceita a entrada atual",
      rejects: "Este ramo rejeita a entrada atual"
    },
    symbolAxisTitle: "Ver pelo eixo dos símbolos",
    resetTitle: "Restaurar visão",
    panelResizeTitle: "Redimensionar painel lateral",
    themeTitles: { toDark: "Mudar para modo escuro", toClear: "Mudar para modo claro" },
    language: { button: "EN", title: "Mudar para inglês" },
    footerRepository: "Repositório do projeto:",
    footerLicense: "Licença MIT",
    footerCredit: "Desenvolvido com assistência do Codex GPT-5.5.",
    references: {
      button: "Referências",
      title: "Mostrar referências",
      close: "Fechar referências",
      eyebrow: "Referências",
      heading: "Fontes da Prova",
      subtitle: "De onde vem a construção por tableau usada nesta ferramenta.",
      paragraphs: [
        "O teorema de Cook-Levin é devido a Stephen Cook e Leonid Levin. Ele estabelece que a satisfatibilidade booleana é NP-completa: toda computação não determinística em tempo polinomial pode ser codificada como uma instância de SAT.",
        "O estilo de prova visualizado aqui é a construção por tableau, ou histórico de computação. Nele, a execução aceitante de uma máquina de Turing não determinística é representada por uma grade de configurações, e a fórmula SAT verifica células, configuração inicial, aceitação e movimentos locais legais.",
        "A principal fonte teórica desta ferramenta é o livro Introduction to the Theory of Computation, de Michael Sipser, especialmente a prova de Cook-Levin e o uso de janelas locais do tableau.",
        "Historicamente, o artigo de Richard Karp de 1972 sobre redutibilidade e sua lista dos 21 problemas NP-completos tornaram central essa visão da NP-completude baseada em reduções. Esta visualização segue essa forma Karp/Sipser de ensinar o teorema, não uma codificação otimizada.",
        "Uma versão direta dessa prova por tableau tem codificação da ordem de O(log(n^k)n^{3k}) para uma computação em tempo polinomial limitada por n^k. Refinamentos posteriores, surgidos cerca de sete anos depois dos primeiros artigos sobre NP-completude, obtêm O(n^k log(n^k)), isto é, tempo quasilinear no limite de tempo. Esta ferramenta intencionalmente não desenvolve essa prova mais técnica."
      ]
    },
    booleanTrue: "verdadeiro",
    booleanFalse: "falso",
    machineTitle: "MTND para múltiplos unários de 2 ou 3",
    inputTitle: "Quantidade de 1s na entrada unária",
    inputLabel: "1s",
    machineIntro: (word) => `Entrada neste tableau: <strong>w = ${word}</strong>. A ramificação não determinística é a transição indicada na referência: Π(q0, ©) tem um ramo para múltiplos de 2 e um ramo para múltiplos de 3.`,
    machineGraphAria: "Grafo da máquina de Turing não determinística",
    transitionTitles: {
      "q0-even": "ramo não determinístico",
      "q0-three": "ramo não determinístico",
      "even-step": "varredura de múltiplo de 2",
      "even-accept": "aceitação por múltiplo de 2",
      "even-reject": "rejeição por múltiplo de 2",
      "three-step": "varredura de múltiplo de 3",
      "three-accept": "aceitação por múltiplo de 3",
      "three-reject": "rejeição por múltiplo de 3"
    },
    formulaTitle: "Fórmula extraída do tableau",
    formulaIntro: (set, word, rows, cols) => `C = ${set}. Para w = ${word}, o tableau tem m = ${rows} linhas e ${cols} colunas, com uma variável booleana x<sub>i,j,s</sub> para cada linha, coluna e símbolo possível.`,
    cnfClauses: "cláusulas CNF",
    unitClauses: "cláusulas unitárias",
    disjunctionLiterals: "literais em uma disjunção",
    legalWindowChecks: "verificações de janelas legais",
    selectedAcceptingLiteral: (literal) => `Literal de aceitação selecionado: ${literal}.`,
    branchFailsAccept: (branches) => `Nenhum qA aparece neste ramo exibido, então este ramo falha em φaccept. A fórmula completa é satisfatível pelo ramo ${branches.join(" ou ")}.`,
    noAcceptingBranch: "Nenhum qA aparece em qualquer ramo, então φaccept não pode ser satisfeita para esta entrada.",
    selectedCoordinate: (coord, variable, count) => `A coordenada selecionada ${coord} tem ${variable} verdadeiro e as outras ${count} camadas de símbolos falsas.`,
    selectedUnit: (variable, word) => `Unidade selecionada: ${variable}. A primeira linha é a configuração inicial # q0 © ${word === "ε" ? "" : word} β #.`,
    selectedWindow: (coord, formula) => `Centro da janela selecionada ${coord}. Disjunto destacado: ${formula}`,
    statusFormula: {
      satisfied: "o ramo selecionado satisfaz φ",
      otherBranch: "o ramo selecionado falha em φaccept; fórmula satisfatível por outro ramo",
      unsat: "φaccept falsa; fórmula insatisfatível",
      failed: "verificação do modelo falhou"
    },
    statusFocus: {
      assignment: "todas as variáveis verdadeiras",
      acceptNone: "φaccept sem qA"
    },
    status: {
      tableau: "tableau",
      symbolLayers: "camadas de símbolos",
      trueVariables: "variáveis verdadeiras",
      accepts: "aceita",
      rejects: "rejeita"
    }
  }
};

function copy() {
  return UI_TEXT[state?.language] ?? UI_TEXT.en;
}

const state = {
  inputLength: 6,
  branch: "even",
  focus: "assignment",
  panel: "machine",
  theme: readStoredTheme(),
  language: readStoredLanguage(),
  panelWidth: readStoredPanelWidth(),
  referencesOpen: false,
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
  const text = copy();
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
        variable.title = `${variableName(row, col, symbol.id)} = ${isTrue ? text.booleanTrue : text.booleanFalse}`;
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
  const text = copy();
  sidePanel.innerHTML = `
    <h1>${text.machineTitle}</h1>
    <div class="machine-controls">
      <label class="input-control" title="${text.inputTitle}">
        <span>${text.inputLabel}</span>
        <input id="inputLength" type="number" min="${MIN_INPUT_LENGTH}" max="${MAX_INPUT_LENGTH}" value="${state.inputLength}" inputmode="numeric">
      </label>
    </div>
    <p>${text.machineIntro(inputWord())}</p>

    <svg class="machine-graph" viewBox="0 0 380 260" role="img" aria-label="${text.machineGraphAria}">
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
      ${transitionCard("q0-even", text.transitionTitles["q0-even"], TRANSITION_TEXT["q0-even"])}
      ${transitionCard("q0-three", text.transitionTitles["q0-three"], TRANSITION_TEXT["q0-three"])}
      ${transitionCard("even-step", text.transitionTitles["even-step"], TRANSITION_TEXT["even-step"])}
      ${transitionCard("even-accept", text.transitionTitles["even-accept"], TRANSITION_TEXT["even-accept"])}
      ${transitionCard("even-reject", text.transitionTitles["even-reject"], TRANSITION_TEXT["even-reject"])}
      ${transitionCard("three-step", text.transitionTitles["three-step"], TRANSITION_TEXT["three-step"])}
      ${transitionCard("three-accept", text.transitionTitles["three-accept"], TRANSITION_TEXT["three-accept"])}
      ${transitionCard("three-reject", text.transitionTitles["three-reject"], TRANSITION_TEXT["three-reject"])}
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
  const text = copy();
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
    ? text.selectedAcceptingLiteral(variableName(state.selectedAccept.row, state.selectedAccept.col, "qA"))
    : acceptedBy.length > 0
      ? text.branchFailsAccept(acceptedBy.map((branch) => branch === "even" ? "×2" : "×3"))
      : text.noAcceptingBranch;

  sidePanel.innerHTML = `
    <h1>${text.formulaTitle}</h1>
    <p>${text.formulaIntro(cSet, inputWord(), ROWS, COLS)}</p>

    ${formulaBlock(
      "cell",
      "φcell",
      `${cellClauses} ${text.cnfClauses}`,
      `φcell = ∧_{1≤i,j≤${ROWS}} [ (∨_{s∈C} x_{i,j,s}) ∧ ∧_{s<t∈C}(¬x_{i,j,s} ∨ ¬x_{i,j,t}) ]`,
      text.selectedCoordinate(coordText(state.selectedCell.row, state.selectedCell.col), variableName(state.selectedCell.row, state.selectedCell.col, selectedSymbol), SYMBOLS.length - 1)
    )}

    ${formulaBlock(
      "start",
      "φstart",
      `${COLS} ${text.unitClauses}`,
      `φstart = ${startFormula()}`,
      text.selectedUnit(variableName(0, state.selectedStartCol, startSymbol), inputWord())
    )}

    ${formulaBlock(
      "accept",
      "φaccept",
      `${ROWS * COLS} ${text.disjunctionLiterals}`,
      `φaccept = ∨_{1≤i,j≤${ROWS}} x_{i,j,qA}`,
      acceptNote
    )}

    ${formulaBlock(
      "move",
      "φmove",
      `${moveWindows} ${text.legalWindowChecks}`,
      `φmove = ∧_{2≤i≤${ROWS}, 2≤j≤${COLS - 1}} ∨_{(a1,...,a6)∈Legal(N)} (x_{i-1,j-1,a1} ∧ x_{i-1,j,a2} ∧ x_{i-1,j+1,a3} ∧ x_{i,j-1,a4} ∧ x_{i,j,a5} ∧ x_{i,j+1,a6})`,
      text.selectedWindow(coordText(selectedMove.bottomRow, selectedMove.centerCol), selectedWindowFormula())
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
  const text = copy();
  const proof = verifyTrace(state.trace, state.branch);
  const branchText = text.branchLabels[state.branch];
  const selectedBranchAccepts = traceAccepts(state.trace);
  const acceptedBy = acceptingBranches();
  const formulaText = selectedBranchAccepts
    ? text.statusFormula.satisfied
    : acceptedBy.length > 0
      ? text.statusFormula.otherBranch
      : text.statusFormula.unsat;
  const selectedMove = selectedMoveWindow();
  const focusText = {
    assignment: text.statusFocus.assignment,
    cell: `φcell ${coordText(state.selectedCell.row, state.selectedCell.col)}`,
    start: `φstart j=${state.selectedStartCol + 1}`,
    accept: state.selectedAccept ? `φaccept ${coordText(state.selectedAccept.row, state.selectedAccept.col)}` : text.statusFocus.acceptNone,
    move: `φmove ${coordText(selectedMove.bottomRow, selectedMove.centerCol)}`
  }[state.focus];

  statusStrip.textContent = [
    `w = ${inputWord()}`,
    `${ROWS}×${COLS} ${text.status.tableau}`,
    `${SYMBOLS.length} ${text.status.symbolLayers}`,
    `${proof.trueCount} ${text.status.trueVariables}`,
    `${branchText} ${selectedBranchAccepts ? text.status.accepts : text.status.rejects}`,
    focusText,
    proof.cellOk && proof.startOk && proof.moveOk && proof.shapeOk ? formulaText : text.statusFormula.failed
  ].join(" · ");
}

function applyTheme() {
  const text = copy();
  const isDark = state.theme === "dark";
  document.documentElement.dataset.theme = state.theme;

  if (!themeToggle) {
    return;
  }

  themeToggle.textContent = isDark ? "☀" : "☾";
  themeToggle.title = isDark ? text.themeTitles.toClear : text.themeTitles.toDark;
  themeToggle.setAttribute("aria-label", themeToggle.title);
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.classList.toggle("is-active", isDark);
}

function renderReferencesModal() {
  const text = copy();

  if (!referencesModal) {
    return;
  }

  referencesModal.classList.toggle("is-hidden", !state.referencesOpen);
  referencesModal.setAttribute("aria-hidden", String(!state.referencesOpen));
  referencesModalEyebrow.textContent = text.references.eyebrow;
  referencesModalTitle.textContent = text.references.heading;
  referencesModalSubtitle.textContent = text.references.subtitle;
  referencesModalText.innerHTML = text.references.paragraphs
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");
  referencesClose.setAttribute("aria-label", text.references.close);
}

function openReferences() {
  state.referencesOpen = true;
  renderReferencesModal();
  referencesClose?.focus();
}

function closeReferences() {
  state.referencesOpen = false;
  renderReferencesModal();
  referencesButton?.focus();
}

function applyLanguage() {
  const text = copy();
  document.documentElement.lang = text.htmlLang;
  document.title = text.pageTitle;
  document.querySelector('meta[name="description"]')?.setAttribute("content", text.metaDescription);
  document.querySelector(".eyebrow").textContent = text.eyebrow;
  document.querySelector(".site-title h1").textContent = text.heading;
  document.querySelector(".subtitle").textContent = text.subtitle;
  document.querySelector(".workspace")?.setAttribute("aria-label", text.workspaceAria);
  document.querySelectorAll(".bar .button-row")[0]?.setAttribute("aria-label", text.viewsAria);
  document.querySelectorAll(".bar .button-row")[1]?.setAttribute("aria-label", text.branchAria);
  tableauSpace?.setAttribute("aria-label", text.tableauAria);

  document.querySelector('[data-panel="machine"]').textContent = text.panelLabels.machine;
  document.querySelector('[data-panel="formula"]').textContent = text.panelLabels.formula;
  Object.entries(text.focusLabels).forEach(([focus, label]) => {
    document.querySelector(`[data-focus="${focus}"]`).textContent = label;
  });

  const symbolAxisButton = document.getElementById("symbolAxisView");
  symbolAxisButton.title = text.symbolAxisTitle;
  symbolAxisButton.setAttribute("aria-label", text.symbolAxisTitle);
  const resetButton = document.getElementById("resetView");
  resetButton.title = text.resetTitle;
  resetButton.setAttribute("aria-label", text.resetTitle);
  if (panelResizer) {
    panelResizer.setAttribute("aria-label", text.panelResizeTitle);
    panelResizer.title = text.panelResizeTitle;
  }

  if (languageToggle) {
    languageToggle.textContent = text.language.button;
    languageToggle.title = text.language.title;
    languageToggle.setAttribute("aria-label", text.language.title);
    languageToggle.setAttribute("aria-pressed", String(state.language === "pt"));
  }
  if (referencesButton) {
    referencesButton.textContent = text.references.button;
    referencesButton.title = text.references.title;
    referencesButton.setAttribute("aria-label", text.references.title);
  }
  renderReferencesModal();

  document.querySelector(".site-footer p:nth-child(2)").innerHTML = `
        ${text.footerRepository}
        <a href="https://github.com/BrunoGrisci/SAT-tableau" target="_blank" rel="noopener noreferrer">SAT-tableau</a>
        ·
        <a href="https://github.com/BrunoGrisci/SAT-tableau/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">${text.footerLicense}</a>
      `;
  document.querySelector(".site-footer p:nth-child(3)").textContent = text.footerCredit;
  applyTheme();
}

function updateControls() {
  const inputLengthControl = document.getElementById("inputLength");
  if (inputLengthControl) {
    inputLengthControl.value = String(state.inputLength);
  }
  applyLanguage();
  document.querySelectorAll("[data-focus]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.focus === state.focus);
  });
  document.querySelectorAll("[data-branch]").forEach((button) => {
    const accepts = branchAccepts(button.dataset.branch);
    button.textContent = `${copy().branchLabels[button.dataset.branch]} ${accepts ? "✓" : "×"}`;
    button.title = accepts ? copy().branchTitles.accepts : copy().branchTitles.rejects;
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
  app.classList.toggle("is-branch-rejecting", !traceAccepts(state.trace));
  app.classList.toggle("is-flat-view", state.view.flattenDepth);
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

function panelWidthBounds() {
  const appWidth = app.getBoundingClientRect().width || window.innerWidth;
  const viewportMax = Math.max(PANEL_MIN_WIDTH, appWidth - WORKSPACE_MIN_WIDTH - PANEL_RESIZER_WIDTH);
  return {
    min: PANEL_MIN_WIDTH,
    max: Math.min(PANEL_MAX_WIDTH, viewportMax)
  };
}

function applyPanelWidth(width = state.panelWidth) {
  const bounds = panelWidthBounds();
  const next = clamp(width, bounds.min, bounds.max);
  state.panelWidth = next;
  document.documentElement.style.setProperty("--panel-width", `${Math.round(next)}px`);

  if (panelResizer) {
    panelResizer.setAttribute("aria-valuemin", String(Math.round(bounds.min)));
    panelResizer.setAttribute("aria-valuemax", String(Math.round(bounds.max)));
    panelResizer.setAttribute("aria-valuenow", String(Math.round(next)));
  }

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

let panelResizeState = null;

function finishPanelResize() {
  if (!panelResizeState) {
    return;
  }

  panelResizeState = null;
  panelResizer?.classList.remove("is-dragging");
  document.body.classList.remove("is-resizing-panel");
  writeStoredPanelWidth(state.panelWidth);
}

panelResizer?.addEventListener("pointerdown", (event) => {
  if (window.innerWidth <= 980) {
    return;
  }

  panelResizeState = {
    startX: event.clientX,
    startWidth: state.panelWidth
  };
  panelResizer.classList.add("is-dragging");
  document.body.classList.add("is-resizing-panel");
  event.preventDefault();

  try {
    panelResizer.setPointerCapture(event.pointerId);
  } catch {
    // Synthetic pointer events used in automated checks do not own capture.
  }
});

panelResizer?.addEventListener("pointermove", (event) => {
  if (!panelResizeState) {
    return;
  }

  const dx = event.clientX - panelResizeState.startX;
  applyPanelWidth(panelResizeState.startWidth - dx);
});

panelResizer?.addEventListener("pointerup", (event) => {
  try {
    panelResizer.releasePointerCapture(event.pointerId);
  } catch {
    // Ignore missing capture for synthetic events.
  }
  finishPanelResize();
});

panelResizer?.addEventListener("pointercancel", finishPanelResize);

panelResizer?.addEventListener("keydown", (event) => {
  const step = event.shiftKey ? 60 : 24;
  let next = null;

  if (event.key === "ArrowLeft") {
    next = state.panelWidth + step;
  } else if (event.key === "ArrowRight") {
    next = state.panelWidth - step;
  } else if (event.key === "Home") {
    next = panelWidthBounds().min;
  } else if (event.key === "End") {
    next = panelWidthBounds().max;
  }

  if (next === null) {
    return;
  }

  event.preventDefault();
  applyPanelWidth(next);
  writeStoredPanelWidth(state.panelWidth);
});

document.getElementById("symbolAxisView").addEventListener("click", alignSymbolAxisView);
document.getElementById("resetView").addEventListener("click", resetView);
themeToggle?.addEventListener("click", () => {
  state.theme = state.theme === "dark" ? "clear" : "dark";
  writeStoredTheme(state.theme);
  applyTheme();
  window.requestAnimationFrame(drawConnectors);
});
languageToggle?.addEventListener("click", () => {
  state.language = state.language === "pt" ? "en" : "pt";
  writeStoredLanguage(state.language);
  render();
});
referencesButton?.addEventListener("click", openReferences);
referencesClose?.addEventListener("click", closeReferences);
referencesModal?.addEventListener("click", (event) => {
  if (event.target === referencesModal) {
    closeReferences();
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && state.referencesOpen) {
    closeReferences();
  }
});
window.addEventListener("resize", () => {
  applyPanelWidth(state.panelWidth);
  drawConnectors();
});
sidePanel.addEventListener("scroll", drawConnectors);

state.trace = buildTrace(state.branch);
state.view = defaultView();
applyPanelWidth(state.panelWidth);
applyLanguage();
applyView();
render();
