"use strict";

const CENTRALITY_KEYS = [
  "degree",
  "unnormalized_degree",
  "betweenness",
  "closeness",
  "eigenvector",
  "katz",
];

const CENTRALITY_LABELS = {
  degree: "Degree (Normalized)",
  unnormalized_degree: "Degree (Unnormalized)",
  betweenness: "Betweenness",
  closeness: "Closeness",
  eigenvector: "Eigenvector",
  katz: "Katz",
};

const RANDOM_GRAPH_DISPLAY = {
  erdos_renyi: "Erdos-Renyi",
  barabasi_albert: "Barabasi-Albert",
  watts_strogatz: "Watts-Strogatz",
};

const PANEL_WIDTH_STORAGE_KEY = "gravika.leftPanelWidthPx";
const GEXF_EDGE_WEIGHT_OPTION = "__gexf_edge_weight__";

class SimpleGraph {
  constructor(directed = false) {
    this.directed = !!directed;
    this.nodes = new Map();
    this.edges = [];
    this._edgeKeyToIndex = new Map();
    this._outEdges = new Map();
    this._inEdges = new Map();
  }

  _normNode(id) {
    return String(id);
  }

  _edgeKey(source, target) {
    const s = this._normNode(source);
    const t = this._normNode(target);
    if (this.directed) {
      return `${s}->${t}`;
    }
    return s < t ? `${s}--${t}` : `${t}--${s}`;
  }

  addNode(id, attrs = {}) {
    const key = this._normNode(id);
    if (!this.nodes.has(key)) {
      this.nodes.set(key, { ...attrs });
      this._outEdges.set(key, []);
      this._inEdges.set(key, []);
    } else {
      const curr = this.nodes.get(key);
      this.nodes.set(key, { ...curr, ...attrs });
    }
  }

  addEdge(source, target, attrs = {}) {
    const s = this._normNode(source);
    const t = this._normNode(target);
    this.addNode(s);
    this.addNode(t);

    const rawWeight = attrs.weight !== undefined ? attrs.weight : 1;
    const weight = Number.parseFloat(rawWeight);
    const safeWeight = Number.isFinite(weight) ? weight : 1;

    const key = this._edgeKey(s, t);
    if (this._edgeKeyToIndex.has(key)) {
      const idx = this._edgeKeyToIndex.get(key);
      const edge = this.edges[idx];
      edge.attrs = { ...edge.attrs, ...attrs, weight: safeWeight };
      edge.weight = safeWeight;
      return;
    }

    const edge = {
      source: s,
      target: t,
      attrs: { ...attrs, weight: safeWeight },
      weight: safeWeight,
    };
    const idx = this.edges.length;
    this.edges.push(edge);
    this._edgeKeyToIndex.set(key, idx);

    this._outEdges.get(s).push(idx);
    this._inEdges.get(t).push(idx);

    if (!this.directed) {
      this._outEdges.get(t).push(idx);
      this._inEdges.get(s).push(idx);
    }
  }

  hasNode(id) {
    return this.nodes.has(this._normNode(id));
  }

  nodeIds() {
    return Array.from(this.nodes.keys());
  }

  numberOfNodes() {
    return this.nodes.size;
  }

  numberOfEdges() {
    return this.edges.length;
  }

  degree(node) {
    const n = this._normNode(node);
    const out = this._outEdges.get(n) || [];
    const inp = this._inEdges.get(n) || [];
    if (this.directed) {
      return out.length + inp.length;
    }
    return out.length;
  }

  outNeighbors(node) {
    const n = this._normNode(node);
    const edges = this._outEdges.get(n) || [];
    const out = [];
    for (const idx of edges) {
      const e = this.edges[idx];
      if (this.directed) {
        if (e.source === n) {
          out.push(e.target);
        }
      } else {
        out.push(e.source === n ? e.target : e.source);
      }
    }
    return out;
  }

  inNeighbors(node) {
    const n = this._normNode(node);
    if (!this.directed) {
      return this.outNeighbors(n);
    }
    const edges = this._inEdges.get(n) || [];
    const inp = [];
    for (const idx of edges) {
      const e = this.edges[idx];
      if (e.target === n) {
        inp.push(e.source);
      }
    }
    return inp;
  }

  weightedOutNeighbors(node) {
    const n = this._normNode(node);
    const edges = this._outEdges.get(n) || [];
    const result = [];
    for (const idx of edges) {
      const e = this.edges[idx];
      if (this.directed) {
        if (e.source === n) {
          result.push({ node: e.target, weight: e.weight });
        }
      } else {
        result.push({ node: e.source === n ? e.target : e.source, weight: e.weight });
      }
    }
    return result;
  }

  neighbors(node) {
    return this.outNeighbors(node);
  }

  copy() {
    const g = new SimpleGraph(this.directed);
    for (const [node, attrs] of this.nodes.entries()) {
      g.addNode(node, { ...attrs });
    }
    for (const edge of this.edges) {
      g.addEdge(edge.source, edge.target, { ...edge.attrs, weight: edge.weight });
    }
    return g;
  }
}

const state = {
  refs: {},
  isCollapsed: false,
  loadedFile: null,
  loadedFileType: null,
  loadedFileName: null,
  loadedFileText: null,
  loadedFileArrayBuffer: null,
  cysZip: null,
  cysNetworkEntries: [],
  randomGraph: null,
  lastAnalysisResult: null,
  lastRenderedResult: null,
  currentTableData: null,
  currentAdjacencyData: null,
  nodeSelectorAllNodes: [],
  nodeSortState: { col: null, reverse: false },
  analysisSortState: { col: null, reverse: false },
  layoutCache: new Map(),
  plotMode: "static",
  interactiveSimulation: null,
  colorbarSeq: 0,
  leftPanelWidthPx: null,
  resizeRaf: null,
};

function setStatus(text) {
  state.refs.statusBar.textContent = text;
}

function showElement(el, show) {
  if (!el) return;
  if (show) {
    el.classList.remove("hidden");
  } else {
    el.classList.add("hidden");
  }
}

function titleCaseLikePython(s) {
  return String(s)
    .toLowerCase()
    .replace(/(^|[^a-zA-Z])([a-zA-Z])/g, (m, p1, p2) => `${p1}${p2.toUpperCase()}`);
}

function isRandomGraphMode() {
  return state.refs.graphSource.value === "random";
}

function removeFileModeOptions() {
  showElement(state.refs.networkRow, false);
  showElement(state.refs.tsvOptionsRow, false);
  setEdgeOptionsMode("tsv");
}

function isStackedMainLayout() {
  return window.matchMedia("(max-width: 1200px)").matches;
}

function savePanelWidth(widthPx) {
  try {
    localStorage.setItem(PANEL_WIDTH_STORAGE_KEY, String(widthPx));
  } catch (err) {
    // ignore storage errors
  }
}

function loadSavedPanelWidth() {
  try {
    const raw = localStorage.getItem(PANEL_WIDTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = Number.parseFloat(raw);
    return Number.isFinite(parsed) ? parsed : null;
  } catch (err) {
    return null;
  }
}

function clearMainLayoutCustomColumns() {
  if (!state.refs.mainLayout) return;
  state.refs.mainLayout.style.removeProperty("grid-template-columns");
}

function schedulePlotRerender() {
  if (state.resizeRaf) return;
  state.resizeRaf = requestAnimationFrame(() => {
    state.resizeRaf = null;
    if (state.lastRenderedResult) {
      renderCurrentPlot();
    }
  });
}

function applyPanelSplit(leftWidthPx, options = {}) {
  if (!state.refs.mainLayout) return;
  if (isStackedMainLayout()) {
    clearMainLayoutCustomColumns();
    return;
  }

  const style = window.getComputedStyle(state.refs.mainLayout);
  const padLeft = Number.parseFloat(style.paddingLeft) || 0;
  const padRight = Number.parseFloat(style.paddingRight) || 0;
  const layoutWidth = Math.max(0, state.refs.mainLayout.clientWidth - padLeft - padRight);
  const splitterWidth = 10;
  const minLeft = 280;
  const minRight = 280;

  const maxLeft = Math.max(minLeft, layoutWidth - minRight - splitterWidth);
  const clamped = Math.min(Math.max(leftWidthPx, minLeft), maxLeft);

  state.refs.mainLayout.style.gridTemplateColumns = `${clamped}px ${splitterWidth}px minmax(${minRight}px, 1fr)`;
  state.leftPanelWidthPx = clamped;

  if (!options.skipStore) {
    savePanelWidth(clamped);
  }
}

function getActivePlotSvg() {
  return state.plotMode === "interactive" ? state.refs.graphSvgInteractive : state.refs.graphSvgStatic;
}

function stopInteractiveSimulation() {
  if (state.interactiveSimulation) {
    try {
      state.interactiveSimulation.stop();
    } catch (err) {
      // no-op
    }
    state.interactiveSimulation = null;
  }
}

function hidePlotTooltip() {
  if (!state.refs.plotTooltip) return;
  state.refs.plotTooltip.classList.add("hidden");
  state.refs.plotTooltip.textContent = "";
}

function setPlotTitle(text, rightReserved = 0) {
  if (!state.refs.plotTitle) return;
  state.refs.plotTitle.textContent = text || "";
  const safeRight = Math.max(12, Math.round(rightReserved) + 12);
  state.refs.plotTitle.style.right = `${safeRight}px`;
}

function setPlotMode(mode) {
  state.plotMode = mode === "interactive" ? "interactive" : "static";
  const isInteractive = state.plotMode === "interactive";

  showElement(state.refs.graphSvgStatic, !isInteractive);
  showElement(state.refs.graphSvgInteractive, isInteractive);

  state.refs.plotTabStatic.classList.toggle("active", !isInteractive);
  state.refs.plotTabInteractive.classList.toggle("active", isInteractive);

  hidePlotTooltip();
  if (!isInteractive) {
    stopInteractiveSimulation();
  }

  if (state.lastRenderedResult) {
    renderCurrentPlot();
  }
}

function clearSelectOptions(selectEl) {
  while (selectEl.firstChild) {
    selectEl.removeChild(selectEl.firstChild);
  }
}

function setSelectOptions(selectEl, values, includeBlank = true) {
  clearSelectOptions(selectEl);
  if (includeBlank) {
    const blank = document.createElement("option");
    blank.value = "";
    blank.textContent = "";
    selectEl.appendChild(blank);
  }
  for (const entry of values) {
    const value = (entry && typeof entry === "object") ? entry.value : entry;
    const label = (entry && typeof entry === "object") ? (entry.label ?? entry.value) : entry;
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = label;
    selectEl.appendChild(opt);
  }
}

function updateColumnSuggestions(columns) {
  setSelectOptions(state.refs.edge1Select, columns);
  setSelectOptions(state.refs.edge2Select, columns);
  setSelectOptions(state.refs.weightSelect, columns);
}

function setEdgeOptionsMode(mode) {
  const edge1Group = state.refs.edge1Select?.closest(".fieldGroup");
  const edge2Group = state.refs.edge2Select?.closest(".fieldGroup");
  const weightLabel = state.refs.weightSelect?.previousElementSibling;

  if (mode === "gexf") {
    showElement(edge1Group, false);
    showElement(edge2Group, false);
    if (weightLabel && weightLabel.tagName && weightLabel.tagName.toLowerCase() === "label") {
      weightLabel.textContent = "Weight Attribute";
    }
    return;
  }

  showElement(edge1Group, true);
  showElement(edge2Group, true);
  if (weightLabel && weightLabel.tagName && weightLabel.tagName.toLowerCase() === "label") {
    weightLabel.textContent = "Weight Column";
  }
}

function disableColumnSelection(disabled) {
  state.refs.edge1Select.disabled = disabled;
  state.refs.edge2Select.disabled = disabled;
  state.refs.weightSelect.disabled = disabled;
  state.refs.removeSelfEdges.disabled = disabled;
  state.refs.directedGraph.disabled = disabled;
}

function showNetworkSelector(networks) {
  setSelectOptions(state.refs.networkSelect, networks, false);
  if (networks.length > 0) {
    state.refs.networkSelect.value = networks[0];
  }
  showElement(state.refs.networkRow, networks.length > 0);
}

function showExportCysButton(show) {
  showElement(state.refs.exportCysBtn, show);
}

function getRandomGraphParams() {
  let size = Number.parseInt(state.refs.randomGraphSize.value, 10);
  if (!Number.isFinite(size) || size <= 0) {
    size = 50;
    state.refs.randomGraphSize.value = "50";
  }
  return {
    graph_type: state.refs.randomGraphType.value,
    size,
  };
}

function getSelectedCentralities() {
  const selected = [];
  for (const key of CENTRALITY_KEYS) {
    const checkbox = state.refs.centralityChecks.get(key);
    if (checkbox && checkbox.checked) {
      selected.push(key);
    }
  }
  return selected;
}

function getSelectedNodesFromSelector() {
  const selected = [];
  for (const option of state.refs.nodeList.options) {
    if (option.selected) {
      selected.push(option.value);
    }
  }
  return selected;
}

function clearNodeSelector() {
  state.nodeSelectorAllNodes = [];
  state.refs.nodeSearch.value = "";
  refreshNodeList();
}

function updateNodeList(nodes) {
  state.nodeSelectorAllNodes = [...nodes].map((n) => String(n)).sort();
  refreshNodeList();
}

function refreshNodeList() {
  const previousSelection = new Set(getSelectedNodesFromSelector());
  const term = state.refs.nodeSearch.value.trim().toLowerCase();
  clearSelectOptions(state.refs.nodeList);
  for (const node of state.nodeSelectorAllNodes) {
    if (term && !node.toLowerCase().includes(term)) {
      continue;
    }
    const opt = document.createElement("option");
    opt.value = node;
    opt.textContent = node;
    opt.selected = previousSelection.has(node);
    state.refs.nodeList.appendChild(opt);
  }
}

function selectNodeInRemovalList(nodeId) {
  const target = String(nodeId);

  // Ensure the node is visible in the selector list.
  if (state.refs.nodeSearch.value.trim() !== "") {
    state.refs.nodeSearch.value = "";
    refreshNodeList();
  }

  let found = false;
  for (const option of state.refs.nodeList.options) {
    if (option.value === target) {
      option.selected = true;
      found = true;
      break;
    }
  }

  // Fallback: if the node list is stale for any reason, inject and re-select.
  if (!found) {
    if (!state.nodeSelectorAllNodes.includes(target)) {
      state.nodeSelectorAllNodes.push(target);
      state.nodeSelectorAllNodes.sort();
      refreshNodeList();
    }
    for (const option of state.refs.nodeList.options) {
      if (option.value === target) {
        option.selected = true;
        found = true;
        break;
      }
    }
  }

  if (found) {
    setStatus(`Selected node ${target} for removal`);
  }
}

function collapseConfig() {
  if (state.isCollapsed) {
    return;
  }
  state.isCollapsed = true;
  showElement(state.refs.configPanel, false);
  state.refs.toggleConfigBtn.textContent = "▶ Configuration";
}

function expandConfig() {
  if (!state.isCollapsed) {
    return;
  }
  state.isCollapsed = false;
  showElement(state.refs.configPanel, true);
  state.refs.toggleConfigBtn.textContent = "▼ Configuration";
}

function toggleConfig() {
  if (state.isCollapsed) {
    expandConfig();
  } else {
    collapseConfig();
  }
}

function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i += 1) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return String(hash >>> 0);
}

function graphStructureHash(graph) {
  const sortedEdges = graph.edges
    .map((e) => `${e.source}|${e.target}`)
    .sort()
    .join(";");
  return hashString(sortedEdges);
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return function rand() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function makeGraph(graphType, size, seed = 42) {
  if (size <= 0) {
    throw new Error("Size must be positive");
  }

  if (graphType === "erdos_renyi") {
    const c = 5;
    const p = c / Math.max(size, 1);
    return generateErdosRenyi(size, p, seed);
  }
  if (graphType === "barabasi_albert") {
    const m = Math.max(2, Math.floor(size / 50));
    return generateBarabasiAlbert(size, m, seed);
  }
  if (graphType === "watts_strogatz") {
    const kBase = Math.max(2, Math.floor(size / 50));
    const k = kBase % 2 === 0 ? kBase : kBase + 1;
    return generateWattsStrogatz(size, k, 0.3, seed);
  }
  throw new Error(`Unsupported graph_type: ${graphType}`);
}

function generateErdosRenyi(size, p, seed) {
  const rand = mulberry32(seed);
  const g = new SimpleGraph(false);
  for (let i = 0; i < size; i += 1) {
    g.addNode(i);
  }
  for (let i = 0; i < size; i += 1) {
    for (let j = i + 1; j < size; j += 1) {
      if (rand() < p) {
        g.addEdge(i, j, { weight: 1 });
      }
    }
  }
  return g;
}

function generateBarabasiAlbert(size, m, seed) {
  const rand = mulberry32(seed);
  const g = new SimpleGraph(false);
  if (size === 1) {
    g.addNode(0);
    return g;
  }

  const mInit = Math.min(Math.max(m, 2), Math.max(size - 1, 1));
  for (let i = 0; i < mInit; i += 1) {
    g.addNode(i);
  }
  for (let i = 0; i < mInit; i += 1) {
    for (let j = i + 1; j < mInit; j += 1) {
      g.addEdge(i, j, { weight: 1 });
    }
  }

  for (let newNode = mInit; newNode < size; newNode += 1) {
    g.addNode(newNode);

    const targets = new Set();
    while (targets.size < Math.min(mInit, newNode)) {
      const existingNodes = g.nodeIds();
      let degreeSum = 0;
      for (const n of existingNodes) {
        if (String(n) === String(newNode)) continue;
        degreeSum += Math.max(1, g.degree(n));
      }
      if (degreeSum <= 0) {
        targets.add(String(existingNodes[Math.floor(rand() * existingNodes.length)]));
        continue;
      }

      let r = rand() * degreeSum;
      let selected = null;
      for (const n of existingNodes) {
        if (String(n) === String(newNode)) continue;
        r -= Math.max(1, g.degree(n));
        if (r <= 0) {
          selected = String(n);
          break;
        }
      }
      if (selected !== null) {
        targets.add(selected);
      }
      if (targets.size >= newNode) {
        break;
      }
    }

    for (const t of targets) {
      if (String(t) !== String(newNode)) {
        g.addEdge(newNode, t, { weight: 1 });
      }
    }
  }
  return g;
}

function generateWattsStrogatz(size, k, p, seed) {
  const rand = mulberry32(seed);
  const g = new SimpleGraph(false);
  if (size <= 0) {
    return g;
  }
  if (size === 1) {
    g.addNode(0);
    return g;
  }

  const kSafe = Math.max(2, Math.min(k, size - 1));
  const kEven = kSafe % 2 === 0 ? kSafe : kSafe - 1;
  const half = Math.max(1, Math.floor(kEven / 2));

  for (let i = 0; i < size; i += 1) {
    g.addNode(i);
  }

  const edgePairs = [];
  for (let i = 0; i < size; i += 1) {
    for (let d = 1; d <= half; d += 1) {
      const j = (i + d) % size;
      if (i < j) {
        edgePairs.push([i, j]);
      }
    }
  }

  for (const [u, v] of edgePairs) {
    if (rand() < p) {
      let newV = null;
      const forbidden = new Set([String(u)]);
      for (const n of g.neighbors(u)) {
        forbidden.add(String(n));
      }
      const candidates = [];
      for (let w = 0; w < size; w += 1) {
        if (!forbidden.has(String(w))) {
          candidates.push(w);
        }
      }
      if (candidates.length > 0) {
        newV = candidates[Math.floor(rand() * candidates.length)];
      }
      if (newV === null) {
        g.addEdge(u, v, { weight: 1 });
      } else {
        g.addEdge(u, newV, { weight: 1 });
      }
    } else {
      g.addEdge(u, v, { weight: 1 });
    }
  }

  return g;
}

function parseDelimited(text, separator = "\t") {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    throw new Error("File is empty.");
  }

  const header = lines[0].split(separator).map((s) => s.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i += 1) {
    const parts = lines[i].split(separator).map((s) => s.trim());
    const row = {};
    for (let c = 0; c < header.length; c += 1) {
      row[header[c]] = parts[c] !== undefined ? parts[c] : "";
    }
    rows.push(row);
  }
  return { header, rows };
}

function detectSeparatorFromHeader(headerLine) {
  if (headerLine.includes("\t")) {
    return "\t";
  }
  if (headerLine.includes(",")) {
    return ",";
  }
  return "\t";
}

function loadTsvGraphFromText(text, edge1, edge2, weight, removeSelfEdges = true, directed = false) {
  const firstLine = text.split(/\r?\n/)[0] || "";
  const sep = detectSeparatorFromHeader(firstLine);
  const { header, rows } = parseDelimited(text, sep);

  if (!header.includes(edge1) || !header.includes(edge2) || !header.includes(weight)) {
    throw new Error("Selected columns were not found in the file.");
  }

  const g = new SimpleGraph(directed);
  for (const row of rows) {
    const source = row[edge1];
    const target = row[edge2];
    const w = Number.parseFloat(row[weight]);
    const safeW = Number.isFinite(w) ? w : 1;
    if (source === "" || target === "") {
      continue;
    }
    if (removeSelfEdges && String(source) === String(target)) {
      continue;
    }
    g.addEdge(source, target, { weight: safeW });
  }
  return g;
}

function parseAttElements(element) {
  const attrs = {};
  const attEls = element.getElementsByTagName("att");
  for (const att of attEls) {
    const name = att.getAttribute("name") || att.getAttribute("label");
    if (!name) continue;
    let value = att.getAttribute("value");
    if (value === null || value === undefined) {
      value = att.textContent || "";
    }
    attrs[name] = value;
  }
  return attrs;
}

function parseXgmmlGraph(xmlText, removeSelfEdges = true) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, "application/xml");
  if (xml.querySelector("parsererror")) {
    throw new Error("Failed to parse XGMML content from CYS file.");
  }

  const g = new SimpleGraph(false);
  const idToLabel = new Map();

  const nodeEls = Array.from(xml.getElementsByTagName("node"));
  for (const nodeEl of nodeEls) {
    const nodeId = nodeEl.getAttribute("id") || "";
    const label = nodeEl.getAttribute("label") || nodeId;
    const attrs = parseAttElements(nodeEl);
    idToLabel.set(String(nodeId), String(label));
    g.addNode(label, attrs);
  }

  const edgeEls = Array.from(xml.getElementsByTagName("edge"));
  for (const edgeEl of edgeEls) {
    const sourceId = edgeEl.getAttribute("source") || "";
    const targetId = edgeEl.getAttribute("target") || "";
    const source = idToLabel.get(String(sourceId)) || String(sourceId);
    const target = idToLabel.get(String(targetId)) || String(targetId);
    if (removeSelfEdges && source === target) {
      continue;
    }

    const attrs = parseAttElements(edgeEl);
    let weight = Number.parseFloat(attrs.interaction);
    if (!Number.isFinite(weight)) {
      const alternatives = ["weight", "score", "value"];
      weight = Number.NaN;
      for (const key of alternatives) {
        const candidate = Number.parseFloat(attrs[key]);
        if (Number.isFinite(candidate)) {
          weight = candidate;
          break;
        }
      }
    }
    if (!Number.isFinite(weight)) {
      weight = 1;
    }

    g.addEdge(source, target, { ...attrs, weight });
  }

  return g;
}

function parseGexfGraph(
  xmlText,
  removeSelfEdges = true,
  directedRequested = false,
  weightField = GEXF_EDGE_WEIGHT_OPTION,
) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, "application/xml");
  if (xml.querySelector("parsererror")) {
    throw new Error("Failed to parse GEXF file.");
  }

  const graphEl = xml.getElementsByTagName("graph")[0];
  if (!graphEl) {
    throw new Error("Invalid GEXF: missing <graph> element.");
  }

  const originalDirected = (graphEl.getAttribute("defaultedgetype") || "undirected").toLowerCase() === "directed";
  const finalDirected = directedRequested;
  const g = new SimpleGraph(finalDirected);

  const nodeAttrTitleById = {};
  const edgeAttrTitleById = {};
  const attrEls = Array.from(xml.getElementsByTagName("attributes"));
  for (const attrGroup of attrEls) {
    const cls = (attrGroup.getAttribute("class") || "").toLowerCase();
    if (cls !== "node" && cls !== "edge") continue;
    const attrs = Array.from(attrGroup.getElementsByTagName("attribute"));
    for (const attr of attrs) {
      const id = attr.getAttribute("id");
      const title = attr.getAttribute("title") || id;
      if (id) {
        if (cls === "node") {
          nodeAttrTitleById[id] = title;
        } else {
          edgeAttrTitleById[id] = title;
        }
      }
    }
  }

  const idToLabel = new Map();
  const nodeEls = Array.from(xml.getElementsByTagName("node"));
  for (const nodeEl of nodeEls) {
    const id = nodeEl.getAttribute("id") || "";
    const label = nodeEl.getAttribute("label") || id;
    const attrs = {};

    const attValues = Array.from(nodeEl.getElementsByTagName("attvalue"));
    for (const av of attValues) {
      const key = av.getAttribute("for") || av.getAttribute("id");
      if (!key) continue;
      const title = nodeAttrTitleById[key] || key;
      attrs[title] = av.getAttribute("value") || "";
    }

    idToLabel.set(String(id), String(label));
    g.addNode(label, attrs);
  }

  const gexfWeightField = weightField ? String(weightField) : GEXF_EDGE_WEIGHT_OPTION;

  const rawEdges = [];
  const edgeEls = Array.from(xml.getElementsByTagName("edge"));
  for (const edgeEl of edgeEls) {
    const srcId = edgeEl.getAttribute("source") || "";
    const tgtId = edgeEl.getAttribute("target") || "";
    const src = idToLabel.get(String(srcId)) || String(srcId);
    const tgt = idToLabel.get(String(tgtId)) || String(tgtId);

    if (removeSelfEdges && src === tgt) {
      continue;
    }

    const edgeAttrs = {};
    const edgeAttValues = Array.from(edgeEl.getElementsByTagName("attvalue"));
    for (const av of edgeAttValues) {
      const key = av.getAttribute("for") || av.getAttribute("id");
      if (!key) continue;
      const title = edgeAttrTitleById[key] || key;
      edgeAttrs[title] = av.getAttribute("value") || "";
    }

    let weight = Number.NaN;
    if (gexfWeightField === GEXF_EDGE_WEIGHT_OPTION) {
      weight = Number.parseFloat(edgeEl.getAttribute("weight"));
    } else if (edgeAttrs[gexfWeightField] !== undefined) {
      weight = Number.parseFloat(edgeAttrs[gexfWeightField]);
    }

    if (!Number.isFinite(weight)) {
      const fallbackFields = ["weight", "score", "value", "interaction"];
      if (gexfWeightField !== GEXF_EDGE_WEIGHT_OPTION) {
        fallbackFields.unshift(gexfWeightField);
      }
      for (const field of fallbackFields) {
        const candidate = Number.parseFloat(edgeAttrs[field]);
        if (Number.isFinite(candidate)) {
          weight = candidate;
          break;
        }
      }
    }

    if (!Number.isFinite(weight)) {
      const attrWeight = Number.parseFloat(edgeEl.getAttribute("weight"));
      weight = Number.isFinite(attrWeight) ? attrWeight : 1;
    }

    rawEdges.push({ source: src, target: tgt, weight, attrs: edgeAttrs });
  }

  if (finalDirected) {
    if (originalDirected) {
      for (const e of rawEdges) {
        g.addEdge(e.source, e.target, { ...e.attrs, weight: e.weight });
      }
    } else {
      for (const e of rawEdges) {
        g.addEdge(e.source, e.target, { ...e.attrs, weight: e.weight });
        g.addEdge(e.target, e.source, { ...e.attrs, weight: e.weight });
      }
    }
  } else if (originalDirected) {
    for (const e of rawEdges) {
      g.addEdge(e.source, e.target, { ...e.attrs, weight: e.weight });
    }
  } else {
    for (const e of rawEdges) {
      g.addEdge(e.source, e.target, { ...e.attrs, weight: e.weight });
    }
  }

  return g;
}

function getGexfWeightOptions(xmlText) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, "application/xml");
  if (xml.querySelector("parsererror")) {
    return [{ value: GEXF_EDGE_WEIGHT_OPTION, label: "Edge @weight" }];
  }

  const edgeAttrTitleById = {};
  const attrEls = Array.from(xml.getElementsByTagName("attributes"));
  for (const attrGroup of attrEls) {
    const cls = (attrGroup.getAttribute("class") || "").toLowerCase();
    if (cls !== "edge") continue;
    const attrs = Array.from(attrGroup.getElementsByTagName("attribute"));
    for (const attr of attrs) {
      const id = attr.getAttribute("id");
      const title = attr.getAttribute("title") || id;
      if (id) {
        edgeAttrTitleById[id] = title;
      }
    }
  }

  let hasEdgeWeightAttribute = false;
  const numericTitles = new Set();
  const edgeEls = Array.from(xml.getElementsByTagName("edge"));
  for (const edgeEl of edgeEls) {
    const attrWeight = Number.parseFloat(edgeEl.getAttribute("weight"));
    if (Number.isFinite(attrWeight)) {
      hasEdgeWeightAttribute = true;
    }

    const edgeAttValues = Array.from(edgeEl.getElementsByTagName("attvalue"));
    for (const av of edgeAttValues) {
      const key = av.getAttribute("for") || av.getAttribute("id");
      if (!key) continue;
      const value = Number.parseFloat(av.getAttribute("value"));
      if (!Number.isFinite(value)) continue;
      const title = edgeAttrTitleById[key] || key;
      numericTitles.add(String(title));
    }
  }

  const options = [
    {
      value: GEXF_EDGE_WEIGHT_OPTION,
      label: hasEdgeWeightAttribute ? "Edge @weight" : "Edge @weight (no numeric values)",
    },
  ];

  const sortedTitles = Array.from(numericTitles).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  for (const title of sortedTitles) {
    options.push({ value: title, label: title });
  }

  return options;
}

function getWeakNeighbors(graph, node) {
  if (!graph.directed) {
    return graph.neighbors(node);
  }
  const set = new Set([...graph.outNeighbors(node), ...graph.inNeighbors(node)]);
  return Array.from(set);
}

function getConnectedComponents(graph) {
  const nodes = graph.nodeIds();
  const visited = new Set();
  const components = [];

  for (const start of nodes) {
    if (visited.has(start)) continue;
    const comp = new Set();
    const queue = [start];
    visited.add(start);

    while (queue.length > 0) {
      const v = queue.shift();
      comp.add(v);
      const neighbors = getWeakNeighbors(graph, v);
      for (const n of neighbors) {
        if (!visited.has(n)) {
          visited.add(n);
          queue.push(n);
        }
      }
    }
    components.push(comp);
  }

  return components;
}

function inducedSubgraph(graph, nodesToKeep) {
  const keep = new Set(Array.from(nodesToKeep, (n) => String(n)));
  const out = new SimpleGraph(graph.directed);
  for (const [node, attrs] of graph.nodes.entries()) {
    if (keep.has(node)) {
      out.addNode(node, { ...attrs });
    }
  }
  for (const edge of graph.edges) {
    if (keep.has(edge.source) && keep.has(edge.target)) {
      out.addEdge(edge.source, edge.target, { ...edge.attrs, weight: edge.weight });
    }
  }
  return out;
}

function removeNodesFromGraph(graph, nodesToRemove) {
  const remove = new Set(Array.from(nodesToRemove, (n) => String(n)));
  const out = new SimpleGraph(graph.directed);

  for (const [node, attrs] of graph.nodes.entries()) {
    if (!remove.has(node)) {
      out.addNode(node, { ...attrs });
    }
  }
  for (const edge of graph.edges) {
    if (remove.has(edge.source) || remove.has(edge.target)) {
      continue;
    }
    out.addEdge(edge.source, edge.target, { ...edge.attrs, weight: edge.weight });
  }

  return out;
}

function processGraph(graph, removeZeroDegree = false, useLargestComponent = false) {
  let processed = graph.copy();

  if (removeZeroDegree) {
    const keep = new Set();
    for (const node of processed.nodeIds()) {
      if (processed.degree(node) !== 0) {
        keep.add(node);
      }
    }
    processed = inducedSubgraph(processed, keep);
  }

  if (useLargestComponent) {
    const components = getConnectedComponents(processed);
    if (components.length > 0) {
      let largest = components[0];
      for (const c of components) {
        if (c.size > largest.size) {
          largest = c;
        }
      }
      processed = inducedSubgraph(processed, largest);
    }
  }

  return processed;
}

function bfsDistances(graph, source, useIncoming = false) {
  const src = String(source);
  const dist = {};
  dist[src] = 0;
  const queue = [src];

  while (queue.length > 0) {
    const v = queue.shift();
    const neighbors = useIncoming ? graph.inNeighbors(v) : graph.outNeighbors(v);
    for (const w of neighbors) {
      if (dist[w] === undefined) {
        dist[w] = dist[v] + 1;
        queue.push(w);
      }
    }
  }
  return dist;
}

function degreeCentrality(graph) {
  const out = {};
  const n = graph.numberOfNodes();
  const scale = n <= 1 ? 0 : 1 / (n - 1);
  for (const node of graph.nodeIds()) {
    out[node] = graph.degree(node) * scale;
  }
  return out;
}

function unnormalizedDegreeCentrality(graph) {
  const out = {};
  for (const node of graph.nodeIds()) {
    out[node] = graph.degree(node);
  }
  return out;
}

function betweennessCentrality(graph) {
  const nodes = graph.nodeIds();
  const C = {};
  for (const n of nodes) C[n] = 0;

  for (const s of nodes) {
    const S = [];
    const P = {};
    const sigma = {};
    const dist = {};

    for (const v of nodes) {
      P[v] = [];
      sigma[v] = 0;
      dist[v] = -1;
    }
    sigma[s] = 1;
    dist[s] = 0;

    const Q = [s];
    while (Q.length > 0) {
      const v = Q.shift();
      S.push(v);
      const neighbors = graph.outNeighbors(v);
      for (const w of neighbors) {
        if (dist[w] < 0) {
          dist[w] = dist[v] + 1;
          Q.push(w);
        }
        if (dist[w] === dist[v] + 1) {
          sigma[w] += sigma[v];
          P[w].push(v);
        }
      }
    }

    const delta = {};
    for (const v of nodes) delta[v] = 0;

    while (S.length > 0) {
      const w = S.pop();
      for (const v of P[w]) {
        if (sigma[w] !== 0) {
          delta[v] += (sigma[v] / sigma[w]) * (1 + delta[w]);
        }
      }
      if (w !== s) {
        C[w] += delta[w];
      }
    }
  }

  if (!graph.directed) {
    for (const n of nodes) {
      C[n] /= 2;
    }
  }

  const n = nodes.length;
  if (n > 2) {
    const scale = graph.directed ? (1 / ((n - 1) * (n - 2))) : (2 / ((n - 1) * (n - 2)));
    for (const node of nodes) {
      C[node] *= scale;
    }
  }

  return C;
}

function closenessCentrality(graph) {
  const out = {};
  const n = graph.numberOfNodes();
  if (n <= 1) {
    for (const node of graph.nodeIds()) {
      out[node] = 0;
    }
    return out;
  }

  const useIncoming = graph.directed;
  for (const node of graph.nodeIds()) {
    const dist = bfsDistances(graph, node, useIncoming);
    const reachable = Object.keys(dist).length;
    let totalDist = 0;
    for (const d of Object.values(dist)) {
      totalDist += d;
    }

    let cc = 0;
    if (totalDist > 0 && n > 1) {
      cc = (reachable - 1) / totalDist;
      cc *= (reachable - 1) / (n - 1);
    }
    out[node] = cc;
  }

  return out;
}

function estimateSpectralRadius(graph, weighted = true) {
  const nodes = graph.nodeIds();
  const n = nodes.length;
  if (n === 0) {
    return 0;
  }

  const idxByNode = {};
  nodes.forEach((node, idx) => {
    idxByNode[node] = idx;
  });

  let x = new Array(n).fill(1 / Math.sqrt(n));
  let lastLambda = 0;

  for (let iter = 0; iter < 250; iter += 1) {
    const y = new Array(n).fill(0);

    for (const u of nodes) {
      const i = idxByNode[u];
      const neighbors = graph.weightedOutNeighbors(u);
      for (const neighbor of neighbors) {
        const j = idxByNode[neighbor.node];
        const w = weighted ? neighbor.weight : 1;
        y[i] += w * x[j];
      }
    }

    const norm = Math.sqrt(y.reduce((acc, v) => acc + (v * v), 0));
    if (norm === 0) {
      return 0;
    }

    const xNext = y.map((v) => v / norm);

    let lambdaNumerator = 0;
    for (let i = 0; i < n; i += 1) {
      lambdaNumerator += xNext[i] * y[i];
    }
    const lambda = Math.abs(lambdaNumerator);
    if (Math.abs(lambda - lastLambda) < 1e-9) {
      return lambda;
    }

    x = xNext;
    lastLambda = lambda;
  }

  return Math.abs(lastLambda);
}

function eigenvectorCentrality(graph, maxIter = 5000, tol = 1e-6) {
  const nodes = graph.nodeIds();
  const n = nodes.length;
  const out = {};
  if (n === 0) {
    return out;
  }

  let x = {};
  for (const node of nodes) {
    x[node] = 1 / n;
  }

  for (let iter = 0; iter < maxIter; iter += 1) {
    const xNew = {};
    for (const node of nodes) {
      xNew[node] = 0;
    }

    for (const edge of graph.edges) {
      if (graph.directed) {
        xNew[edge.target] += x[edge.source];
      } else {
        xNew[edge.target] += x[edge.source];
        xNew[edge.source] += x[edge.target];
      }
    }

    const norm = Math.sqrt(Object.values(xNew).reduce((acc, v) => acc + (v * v), 0));
    if (norm === 0) {
      for (const node of nodes) {
        out[node] = 0;
      }
      return out;
    }

    for (const node of nodes) {
      xNew[node] /= norm;
    }

    let err = 0;
    for (const node of nodes) {
      err += Math.abs(xNew[node] - x[node]);
    }

    x = xNew;
    if (err < n * tol) {
      break;
    }
  }

  return x;
}

function katzCentrality(graph, maxIter = 1000, tol = 1e-6) {
  const nodes = graph.nodeIds();
  const n = nodes.length;
  const out = {};
  if (n === 0) {
    return out;
  }

  const rho = estimateSpectralRadius(graph, true);
  let alpha = 0.1;
  if (rho > 0) {
    alpha = 0.8 / rho;
  }
  const beta = 1;

  let x = {};
  for (const node of nodes) {
    x[node] = 1;
  }

  for (let iter = 0; iter < maxIter; iter += 1) {
    const xNew = {};
    for (const node of nodes) {
      let total = 0;
      for (const neighbor of graph.weightedOutNeighbors(node)) {
        total += neighbor.weight * x[neighbor.node];
      }
      xNew[node] = alpha * total + beta;
    }

    const norm = Math.sqrt(Object.values(xNew).reduce((acc, v) => acc + (v * v), 0));
    if (norm !== 0) {
      for (const node of nodes) {
        xNew[node] /= norm;
      }
    }

    let err = 0;
    for (const node of nodes) {
      err += Math.abs(xNew[node] - x[node]);
    }

    x = xNew;
    if (err < n * tol) {
      break;
    }
  }

  return x;
}

const centralityFunctions = {
  degree: degreeCentrality,
  unnormalized_degree: unnormalizedDegreeCentrality,
  betweenness: betweennessCentrality,
  closeness: closenessCentrality,
  eigenvector: (g) => eigenvectorCentrality(g, 5000, 1e-6),
  katz: (g) => katzCentrality(g, 1000, 1e-6),
};

function getNodeRemovalImpact(graph, nodesToRemove, centralityMetricFunction) {
  const originalCentrality = centralityMetricFunction(graph);

  if (!nodesToRemove || nodesToRemove.length === 0) {
    const impact = {};
    for (const node of Object.keys(originalCentrality)) {
      impact[node] = 0;
    }
    return {
      impactSorted: impact,
      newCentrality: originalCentrality,
    };
  }

  const tempGraph = removeNodesFromGraph(graph, nodesToRemove);
  const newCentrality = centralityMetricFunction(tempGraph);

  const removedSet = new Set(nodesToRemove.map((n) => String(n)));
  const impact = {};
  for (const node of Object.keys(originalCentrality)) {
    if (removedSet.has(String(node))) {
      continue;
    }
    const oldValue = originalCentrality[node];
    const newValue = newCentrality[node] !== undefined ? newCentrality[node] : 0;
    impact[node] = newValue - oldValue;
  }

  const impactSortedEntries = Object.entries(impact).sort((a, b) => b[1] - a[1]);
  const impactSorted = Object.fromEntries(impactSortedEntries);

  return { impactSorted, newCentrality };
}

function isConnectedUndirected(graph) {
  const nodes = graph.nodeIds();
  if (nodes.length <= 1) {
    return true;
  }
  const visited = new Set();
  const queue = [nodes[0]];
  visited.add(nodes[0]);
  while (queue.length > 0) {
    const v = queue.shift();
    for (const nb of graph.neighbors(v)) {
      if (!visited.has(nb)) {
        visited.add(nb);
        queue.push(nb);
      }
    }
  }
  return visited.size === nodes.length;
}

function isStronglyConnected(graph) {
  const nodes = graph.nodeIds();
  if (nodes.length <= 1) {
    return true;
  }

  const start = nodes[0];
  const forward = bfsDistances(graph, start, false);
  if (Object.keys(forward).length !== nodes.length) {
    return false;
  }
  const backward = bfsDistances(graph, start, true);
  return Object.keys(backward).length === nodes.length;
}

function calculateDiameter(graph) {
  const n = graph.numberOfNodes();
  if (n <= 1) {
    return 0;
  }

  if (graph.directed) {
    if (!isStronglyConnected(graph)) {
      return Number.POSITIVE_INFINITY;
    }
  } else if (!isConnectedUndirected(graph)) {
    return Number.POSITIVE_INFINITY;
  }

  let maxDist = 0;
  for (const node of graph.nodeIds()) {
    const dist = bfsDistances(graph, node, false);
    for (const d of Object.values(dist)) {
      if (d > maxDist) {
        maxDist = d;
      }
    }
  }
  return maxDist;
}

function computeAnalysis(graph, removedNodes, selectedCentralities) {
  const diameterBefore = calculateDiameter(graph);
  const tempGraph = removeNodesFromGraph(graph, removedNodes);
  const diameterAfter = calculateDiameter(tempGraph);

  const diameterInfo = { before: diameterBefore, after: diameterAfter };

  const overallDelta = {};
  const centralityResults = {};

  for (const centrality of selectedCentralities) {
    const fn = centralityFunctions[centrality];
    if (!fn) {
      continue;
    }
    const { impactSorted, newCentrality } = getNodeRemovalImpact(graph, removedNodes, fn);
    centralityResults[centrality] = {
      new: newCentrality,
      diff: impactSorted,
    };

    for (const [node, value] of Object.entries(impactSorted)) {
      overallDelta[node] = (overallDelta[node] || 0) + value;
    }
  }

  const allNodes = new Set();
  for (const centralityData of Object.values(centralityResults)) {
    for (const node of Object.keys(centralityData.new)) {
      allNodes.add(node);
    }
  }

  const columns = [];
  for (const centrality of selectedCentralities) {
    const title = titleCaseLikePython(centrality);
    columns.push(title);
    columns.push(`Δ ${title}`);
  }
  columns.push("Combined");
  columns.push("Δ Combined");

  const rows = [];
  for (const node of allNodes) {
    const row = { node };

    for (const centrality of selectedCentralities) {
      const title = titleCaseLikePython(centrality);
      const newVal = centralityResults[centrality]?.new?.[node];
      const diffVal = centralityResults[centrality]?.diff?.[node];
      row[title] = newVal !== undefined ? newVal : Number.NaN;
      row[`Δ ${title}`] = diffVal !== undefined ? diffVal : Number.NaN;
    }

    let combinedNew = 0;
    let combinedDiff = 0;
    for (const centrality of selectedCentralities) {
      combinedNew += centralityResults[centrality]?.new?.[node] || 0;
      combinedDiff += centralityResults[centrality]?.diff?.[node] || 0;
    }
    row.Combined = combinedNew;
    row["Δ Combined"] = combinedDiff;

    rows.push(row);
  }

  return {
    tableData: {
      columns,
      rows,
    },
    impact: overallDelta,
    diameterInfo,
    graphInfo: {
      before: computeGraphInfo(graph, diameterBefore),
      after: computeGraphInfo(tempGraph, diameterAfter),
    },
  };
}

function showAdjacencyView() {
  showElement(state.refs.analysisView, false);
  showElement(state.refs.adjacencyView, true);
}

function showAnalysisView() {
  showElement(state.refs.adjacencyView, false);
  showElement(state.refs.analysisView, true);
}

function clearAdjacencyTable() {
  state.currentAdjacencyData = null;
  state.refs.adjacencyTableBody.innerHTML = "";
  if (state.refs.adjacencyCounts) {
    state.refs.adjacencyCounts.textContent = "Nodes: 0, Edges: 0";
  }
  resetAdjacencyHeaderArrows();
}

function resetAdjacencyHeaderArrows() {
  const headers = state.refs.adjacencyTableHead.querySelectorAll("th");
  for (const th of headers) {
    th.textContent = th.getAttribute("data-col") === "adjacent_nodes" ? "Adjacent Nodes" : "Node";
  }
}

function populateAdjacency(graph) {
  clearAdjacencyTable();

  if (!graph || graph.numberOfNodes() === 0) {
    return;
  }

  const rows = [];
  const nodes = graph.nodeIds().sort();
  for (const node of nodes) {
    const neighbors = graph.neighbors(node).slice().sort();
    const adjacent = neighbors.length > 0 ? neighbors.join(", ") : "(no adjacent nodes)";
    rows.push({ node, adjacent_nodes: adjacent });
  }

  state.currentAdjacencyData = rows;
  if (state.refs.adjacencyCounts) {
    state.refs.adjacencyCounts.textContent = `Nodes: ${graph.numberOfNodes()}, Edges: ${graph.numberOfEdges()}`;
  }
  const graphInfo = computeGraphInfo(graph);
  updateGraphInfoDisplay(graphInfo, graphInfo);
  renderAdjacencyRows(rows);
}

function renderAdjacencyRows(rows) {
  const tbody = state.refs.adjacencyTableBody;
  tbody.innerHTML = "";
  rows.forEach((row) => {
    const tr = document.createElement("tr");

    const tdNode = document.createElement("td");
    tdNode.textContent = row.node;
    tr.appendChild(tdNode);

    const tdAdj = document.createElement("td");
    tdAdj.textContent = row.adjacent_nodes;
    tr.appendChild(tdAdj);

    tbody.appendChild(tr);
  });
}

function sortAdjacencyBy(col) {
  if (!state.currentAdjacencyData) {
    return;
  }

  const reverse = state.nodeSortState.col === col ? !state.nodeSortState.reverse : false;
  state.nodeSortState = { col, reverse };

  const sorted = [...state.currentAdjacencyData].sort((a, b) => {
    const va = String(a[col]).toLowerCase();
    const vb = String(b[col]).toLowerCase();
    if (va < vb) return reverse ? 1 : -1;
    if (va > vb) return reverse ? -1 : 1;
    return 0;
  });

  state.currentAdjacencyData = sorted;
  renderAdjacencyRows(sorted);
  updateAdjacencyHeaderArrows(col, reverse);
}

function updateAdjacencyHeaderArrows(col, reverse) {
  const headers = state.refs.adjacencyTableHead.querySelectorAll("th");
  for (const th of headers) {
    const key = th.getAttribute("data-col");
    const base = key === "adjacent_nodes" ? "Adjacent Nodes" : "Node";
    if (key === col) {
      th.textContent = `${base}${reverse ? " ↓" : " ↑"}`;
    } else {
      th.textContent = base;
    }
  }
}

function clearAnalysisTable() {
  state.currentTableData = null;
  state.refs.analysisTableHead.innerHTML = "";
  state.refs.analysisTableBody.innerHTML = "";
  clearDiameterDisplay();
  state.analysisSortState = { col: null, reverse: false };
}

function formatCellValue(value) {
  if (Number.isNaN(value)) {
    return "N/A";
  }
  if (typeof value === "number") {
    return value.toFixed(6);
  }
  return String(value);
}

function populateAnalysisTable(tableData) {
  clearAnalysisTable();
  state.currentTableData = {
    columns: [...tableData.columns],
    rows: [...tableData.rows],
  };

  const theadRow = document.createElement("tr");
  const nodeTh = document.createElement("th");
  nodeTh.textContent = "Node";
  nodeTh.setAttribute("data-col", "node");
  nodeTh.addEventListener("click", () => sortAnalysisBy("node"));
  theadRow.appendChild(nodeTh);

  for (const col of tableData.columns) {
    const th = document.createElement("th");
    th.textContent = col;
    th.setAttribute("data-col", col);
    th.addEventListener("click", () => sortAnalysisBy(col));
    theadRow.appendChild(th);
  }

  state.refs.analysisTableHead.appendChild(theadRow);
  renderAnalysisRows(tableData.rows, tableData.columns);
}

function renderAnalysisRows(rows, columns) {
  const tbody = state.refs.analysisTableBody;
  tbody.innerHTML = "";

  rows.forEach((row) => {
    const tr = document.createElement("tr");

    const nodeTd = document.createElement("td");
    nodeTd.textContent = String(row.node);
    tr.appendChild(nodeTd);

    for (const col of columns) {
      const td = document.createElement("td");
      td.textContent = formatCellValue(row[col]);
      tr.appendChild(td);
    }

    tbody.appendChild(tr);
  });
}

function parseSortableValue(v) {
  if (typeof v === "number") {
    return { type: "number", value: v };
  }
  const asNum = Number.parseFloat(v);
  if (Number.isFinite(asNum)) {
    return { type: "number", value: asNum };
  }
  return { type: "string", value: String(v).toLowerCase() };
}

function sortAnalysisBy(col) {
  if (!state.currentTableData) {
    return;
  }

  const reverse = state.analysisSortState.col === col ? !state.analysisSortState.reverse : false;
  state.analysisSortState = { col, reverse };

  const rows = [...state.currentTableData.rows];
  rows.sort((a, b) => {
    const va = parseSortableValue(a[col]);
    const vb = parseSortableValue(b[col]);

    if (va.type === "number" && vb.type === "number") {
      if (va.value < vb.value) return reverse ? 1 : -1;
      if (va.value > vb.value) return reverse ? -1 : 1;
      return 0;
    }

    const sa = String(a[col]).toLowerCase();
    const sb = String(b[col]).toLowerCase();
    if (sa < sb) return reverse ? 1 : -1;
    if (sa > sb) return reverse ? -1 : 1;
    return 0;
  });

  state.currentTableData.rows = rows;
  renderAnalysisRows(rows, state.currentTableData.columns);
  updateAnalysisHeaderArrows(col, reverse);
}

function updateAnalysisHeaderArrows(col, reverse) {
  const ths = state.refs.analysisTableHead.querySelectorAll("th");
  for (const th of ths) {
    const key = th.getAttribute("data-col");
    const base = key === "node" ? "Node" : key;
    if (key === col) {
      th.textContent = `${base}${reverse ? " ↓" : " ↑"}`;
    } else {
      th.textContent = base;
    }
  }
}

function updateDiameterDisplay(before, after) {
  const beforeText = before === Number.POSITIVE_INFINITY ? "∞" : `${before.toFixed(0)}`;
  const afterText = after === Number.POSITIVE_INFINITY ? "∞" : `${after.toFixed(0)}`;
  state.refs.diameterInfo.textContent = `Diameter Before: ${beforeText}; Diameter After: ${afterText}`;
}

function clearDiameterDisplay() {
  state.refs.diameterInfo.textContent = "";
}

function countSelfLoops(graph) {
  let loops = 0;
  for (const edge of graph.edges) {
    if (edge.source === edge.target) {
      loops += 1;
    }
  }
  return loops;
}

function computeGraphInfo(graph, precomputedDiameter = null) {
  if (!graph) {
    return null;
  }

  const diameter = Number.isFinite(precomputedDiameter) || precomputedDiameter === Number.POSITIVE_INFINITY
    ? precomputedDiameter
    : calculateDiameter(graph);

  return {
    nodes: graph.numberOfNodes(),
    edges: graph.numberOfEdges(),
    selfLoops: countSelfLoops(graph),
    components: getConnectedComponents(graph).length,
    diameter,
  };
}

function formatGraphInfoValue(value) {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "-";
  }
  if (value === Number.POSITIVE_INFINITY) {
    return "∞";
  }
  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : value.toFixed(6);
  }
  return String(value);
}

function updateGraphInfoDisplay(beforeInfo, afterInfo) {
  const before = beforeInfo || {};
  const after = afterInfo || {};

  state.refs.graphInfoNodesBefore.textContent = formatGraphInfoValue(before.nodes);
  state.refs.graphInfoNodesAfter.textContent = formatGraphInfoValue(after.nodes);
  state.refs.graphInfoEdgesBefore.textContent = formatGraphInfoValue(before.edges);
  state.refs.graphInfoEdgesAfter.textContent = formatGraphInfoValue(after.edges);
  state.refs.graphInfoSelfLoopsBefore.textContent = formatGraphInfoValue(before.selfLoops);
  state.refs.graphInfoSelfLoopsAfter.textContent = formatGraphInfoValue(after.selfLoops);
  state.refs.graphInfoComponentsBefore.textContent = formatGraphInfoValue(before.components);
  state.refs.graphInfoComponentsAfter.textContent = formatGraphInfoValue(after.components);
  state.refs.graphInfoDiameterBefore.textContent = formatGraphInfoValue(before.diameter);
  state.refs.graphInfoDiameterAfter.textContent = formatGraphInfoValue(after.diameter);
}

function clearGraphInfoDisplay() {
  updateGraphInfoDisplay(null, null);
}

function graphToScreenPositions(rawPos, width, height, options = {}) {
  const reservedRight = Number.isFinite(options.reservedRight) ? Math.max(0, options.reservedRight) : 0;
  const extraTop = Number.isFinite(options.extraTop) ? Math.max(0, options.extraTop) : 0;
  const nodes = Object.keys(rawPos);
  const marginTop = Math.max(30, Math.round(height * 0.06)) + extraTop;
  const marginBottom = Math.max(16, Math.round(height * 0.03));
  const marginLeft = Math.max(16, Math.round(width * 0.02));
  const marginRight = Math.max(16, Math.round(width * 0.02)) + reservedRight;

  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const node of nodes) {
    const p = rawPos[node];
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }

  if (!Number.isFinite(minX) || !Number.isFinite(maxX) || minX === maxX) {
    minX = -1;
    maxX = 1;
  }
  if (!Number.isFinite(minY) || !Number.isFinite(maxY) || minY === maxY) {
    minY = -1;
    maxY = 1;
  }

  const plotW = Math.max(1, width - marginLeft - marginRight);
  const plotH = Math.max(1, height - marginTop - marginBottom);

  const pos = {};
  for (const node of nodes) {
    const p = rawPos[node];
    const x = marginLeft + ((p.x - minX) / (maxX - minX)) * plotW;
    const y = marginTop + ((p.y - minY) / (maxY - minY)) * plotH;
    pos[node] = { x, y };
  }
  return pos;
}

function getColorbarLayout(width, height) {
  const panelWidth = Math.max(96, Math.min(220, Math.round(width * 0.17)));
  const outerPad = Math.max(8, Math.min(20, Math.round(width * 0.01)));
  const barWidth = Math.max(12, Math.min(24, Math.round(width * 0.014)));

  const minTop = Math.max(34, Math.min(60, Math.round(height * 0.09)));
  const availableHeight = Math.max(100, height - minTop - 16);
  const barHeight = Math.max(110, Math.min(availableHeight, Math.round(height * 0.5)));
  const maxY = Math.max(minTop, height - barHeight - 16);
  const centeredY = Math.round((height - barHeight) / 2);
  const y = Math.min(Math.max(centeredY, minTop), maxY);

  const panelLeft = Math.max(0, width - outerPad - panelWidth);
  const x = panelLeft + Math.max(8, Math.round(panelWidth * 0.1));
  const labelX = x + barWidth + Math.max(6, Math.round(panelWidth * 0.08));
  const labelFontSize = Math.max(10, Math.min(13, Math.round(height * 0.018)));
  const tickFontSize = Math.max(9, Math.min(12, Math.round(height * 0.016)));
  const reservedRight = Math.max(90, panelWidth + outerPad + 8);

  return {
    x,
    y,
    barWidth,
    barHeight,
    labelX,
    labelFontSize,
    tickFontSize,
    reservedRight,
  };
}

function getPlotTitleReservedHeight(height) {
  const fontSize = Math.max(12, Math.min(16, Math.round(height * 0.02)));
  return Math.max(40, fontSize + 24);
}

function createClipPath(svg, clipId, x, y, width, height) {
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const clipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
  clipPath.setAttribute("id", clipId);
  clipPath.setAttribute("clipPathUnits", "userSpaceOnUse");
  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("x", `${x}`);
  rect.setAttribute("y", `${y}`);
  rect.setAttribute("width", `${Math.max(1, width)}`);
  rect.setAttribute("height", `${Math.max(1, height)}`);
  clipPath.appendChild(rect);
  defs.appendChild(clipPath);
  svg.appendChild(defs);
}

function computeCircularLayout(graph) {
  const nodes = graph.nodeIds().slice().sort();
  const n = nodes.length;
  const radius = 1.2;
  const pos = {};

  if (n === 0) {
    return pos;
  }

  for (let i = 0; i < n; i += 1) {
    const angle = (2 * Math.PI * i) / n;
    pos[nodes[i]] = {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
    };
  }
  return pos;
}

function computeRandomLayout(graph) {
  const nodes = graph.nodeIds().slice().sort();
  const pos = {};
  nodes.forEach((node, idx) => {
    pos[node] = seededPositionFromId(node, idx);
  });
  return pos;
}

function computeGridLayout(graph) {
  const nodes = graph.nodeIds().slice().sort();
  const n = nodes.length;
  const pos = {};
  if (n === 0) return pos;

  const cols = Math.ceil(Math.sqrt(n));
  const rows = Math.ceil(n / cols);
  const spacingX = cols > 1 ? 2.4 / (cols - 1) : 0;
  const spacingY = rows > 1 ? 2.4 / (rows - 1) : 0;

  for (let i = 0; i < n; i += 1) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const x = cols === 1 ? 0 : -1.2 + c * spacingX;
    const y = rows === 1 ? 0 : -1.2 + r * spacingY;
    pos[nodes[i]] = { x, y };
  }
  return pos;
}

function computeRadialLayout(graph) {
  const nodes = graph.nodeIds().slice().sort();
  const pos = {};
  if (nodes.length === 0) return pos;

  let center = nodes[0];
  let maxDegree = -1;
  for (const node of nodes) {
    const d = graph.degree(node);
    if (d > maxDegree) {
      maxDegree = d;
      center = node;
    }
  }

  const levels = new Map();
  const queue = [center];
  levels.set(center, 0);

  while (queue.length > 0) {
    const current = queue.shift();
    const lvl = levels.get(current);
    for (const nb of getWeakNeighbors(graph, current)) {
      if (!levels.has(nb)) {
        levels.set(nb, lvl + 1);
        queue.push(nb);
      }
    }
  }

  let farthest = 0;
  for (const level of levels.values()) {
    if (level > farthest) farthest = level;
  }

  for (const node of nodes) {
    if (!levels.has(node)) {
      levels.set(node, farthest + 1);
    }
  }

  const byLevel = new Map();
  for (const node of nodes) {
    const lvl = levels.get(node) || 0;
    if (!byLevel.has(lvl)) byLevel.set(lvl, []);
    byLevel.get(lvl).push(node);
  }

  const maxLevel = Math.max(...Array.from(byLevel.keys()));
  for (const [level, levelNodes] of byLevel.entries()) {
    const count = levelNodes.length;
    const radius = maxLevel === 0 ? 0 : (level / maxLevel) * 1.2;
    for (let i = 0; i < count; i += 1) {
      const angle = (2 * Math.PI * i) / Math.max(count, 1);
      pos[levelNodes[i]] = {
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle),
      };
    }
  }

  return pos;
}

function computeShellLayout(graph) {
  const nodes = graph.nodeIds().slice().sort((a, b) => graph.degree(b) - graph.degree(a));
  const n = nodes.length;
  const pos = {};
  if (n === 0) return pos;

  const s1 = Math.max(1, Math.floor(n * 0.2));
  const s2 = Math.max(1, Math.floor(n * 0.35));
  const shell1 = nodes.slice(0, s1);
  const shell2 = nodes.slice(s1, s1 + s2);
  const shell3 = nodes.slice(s1 + s2);

  const placeShell = (shellNodes, radius) => {
    if (shellNodes.length === 0) return;
    for (let i = 0; i < shellNodes.length; i += 1) {
      const angle = (2 * Math.PI * i) / shellNodes.length;
      pos[shellNodes[i]] = {
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle),
      };
    }
  };

  placeShell(shell1, 0.35);
  placeShell(shell2, 0.8);
  placeShell(shell3, 1.2);
  return pos;
}

function seededPositionFromId(id, index) {
  const seed = Number.parseInt(hashString(`${id}|${index}`), 10) || 1;
  const rand = mulberry32(seed);
  return {
    x: (rand() * 2) - 1,
    y: (rand() * 2) - 1,
  };
}

function computeSpringLayout(graph, size) {
  const nodes = graph.nodeIds().map((id, idx) => ({
    id,
    ...seededPositionFromId(id, idx),
  }));
  const links = graph.edges.map((e) => ({ source: e.source, target: e.target }));

  const linkDistance = size >= 500 ? 15 : (size >= 100 ? 30 : 60);
  const chargeStrength = size >= 500 ? -10 : (size >= 100 ? -30 : -120);
  const collideRadius = size >= 500 ? 1 : (size >= 100 ? 2 : 6);

  const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id((d) => d.id).distance(linkDistance).strength(0.7))
    .force("charge", d3.forceManyBody().strength(chargeStrength))
    .force("center", d3.forceCenter(0, 0))
    .force("collide", d3.forceCollide().radius(collideRadius))
    .stop();

  const iterations = size >= 500 ? 120 : 220;
  for (let i = 0; i < iterations; i += 1) {
    simulation.tick();
  }

  const pos = {};
  for (const node of nodes) {
    pos[node.id] = { x: node.x, y: node.y };
  }
  return pos;
}

function calculateLayout(graph, layoutType, size) {
  switch (layoutType) {
    case "Circular":
      return computeCircularLayout(graph);
    case "Random":
      return computeRandomLayout(graph);
    case "Radial":
      return computeRadialLayout(graph);
    case "Shell":
      return computeShellLayout(graph);
    case "Grid":
      return computeGridLayout(graph);
    default:
      return computeSpringLayout(graph, size);
  }
}

function getBwrColor(delta, maxAbs) {
  const effectiveMax = maxAbs === 0 ? 1 : maxAbs;
  const t = Math.max(0, Math.min(1, (delta + effectiveMax) / (2 * effectiveMax)));

  if (t <= 0.5) {
    const k = t / 0.5;
    const r = Math.round(255 * k);
    const g = Math.round(255 * k);
    const b = 255;
    return `rgb(${r},${g},${b})`;
  }
  const k = (t - 0.5) / 0.5;
  const r = 255;
  const g = Math.round(255 * (1 - k));
  const b = Math.round(255 * (1 - k));
  return `rgb(${r},${g},${b})`;
}

function clearPlot() {
  stopInteractiveSimulation();
  clearSvg(state.refs.graphSvgStatic);
  clearSvg(state.refs.graphSvgInteractive);
  hidePlotTooltip();
  setPlotTitle("");
}

function clearSvg(svg) {
  if (!svg) return;
  while (svg.firstChild) {
    svg.removeChild(svg.firstChild);
  }
}

function getNodeStyleByGraphSize(size) {
  if (size >= 500) {
    return { nodeRadius: 2.3, minThick: 0.1, maxThick: 0.8 };
  }
  if (size >= 100) {
    return { nodeRadius: 3.5, minThick: 0.2, maxThick: 1.2 };
  }
  return { nodeRadius: 8, minThick: 0.4, maxThick: 3.0 };
}

function computeEdgeWidths(graph, minThick, maxThick, edgeThicknessByWeight) {
  const weights = graph.edges.map((e) => (Number.isFinite(e.weight) ? e.weight : 1));
  if (!edgeThicknessByWeight) {
    return graph.edges.map(() => 0.5 * (minThick + maxThick));
  }

  if (weights.length === 0) {
    return [];
  }

  const wMin = Math.min(...weights);
  const wMax = Math.max(...weights);
  if (wMax === wMin) {
    return weights.map(() => 0.5 * (minThick + maxThick));
  }
  return weights.map((w) => minThick + ((w - wMin) / (wMax - wMin)) * (maxThick - minThick));
}

function positionTooltipFromMouse(event, tooltipEl) {
  const containerRect = state.refs.plotContainer.getBoundingClientRect();
  const margin = 8;
  const rawX = event.clientX - containerRect.left + 12;
  const rawY = event.clientY - containerRect.top + 12;
  const tipWidth = tooltipEl.offsetWidth || 280;
  const tipHeight = tooltipEl.offsetHeight || 140;
  const maxX = Math.max(margin, containerRect.width - tipWidth - margin);
  const maxY = Math.max(margin, containerRect.height - tipHeight - margin);
  const x = Math.min(Math.max(rawX, margin), maxX);
  const y = Math.min(Math.max(rawY, margin), maxY);
  tooltipEl.style.left = `${x}px`;
  tooltipEl.style.top = `${y}px`;
}

function getTableRowForNode(nodeId) {
  if (!state.currentTableData || !Array.isArray(state.currentTableData.rows)) {
    return null;
  }
  const key = String(nodeId);
  return state.currentTableData.rows.find((row) => String(row.node) === key) || null;
}

function truncateList(items, maxItems = 20) {
  if (items.length <= maxItems) {
    return items;
  }
  return [...items.slice(0, maxItems), `... (+${items.length - maxItems} more)`];
}

function buildNodeTooltipText(nodeId, graph, impact, removedSet) {
  const id = String(nodeId);
  const attrs = graph.nodes.get(id) || {};
  const neighbors = graph.neighbors(id).map((n) => String(n)).sort();
  const degree = graph.degree(id);
  const delta = impact[id] || 0;
  const removed = removedSet.has(id);
  const tableRow = getTableRowForNode(id);

  const lines = [];
  lines.push(`Node: ${id}`);
  lines.push(`Removed: ${removed ? "yes" : "no"}`);
  lines.push(`Degree: ${degree}`);
  lines.push(`Δ centrality: ${Number(delta).toFixed(6)}`);

  if (graph.directed) {
    lines.push(`In-degree: ${graph.inNeighbors(id).length}`);
    lines.push(`Out-degree: ${graph.outNeighbors(id).length}`);
  }

  lines.push(`Neighbors (${neighbors.length}): ${truncateList(neighbors).join(", ") || "(none)"}`);

  const attrKeys = Object.keys(attrs).sort();
  if (attrKeys.length > 0) {
    lines.push("Attributes:");
    for (const key of attrKeys) {
      lines.push(`  ${key}: ${attrs[key]}`);
    }
  }

  if (tableRow) {
    lines.push("Analysis:");
    const orderedKeys = Array.isArray(state.currentTableData.columns)
      ? [...state.currentTableData.columns]
      : Object.keys(tableRow);

    const seen = new Set(["node"]);
    for (const key of orderedKeys) {
      if (tableRow[key] === undefined || seen.has(key)) continue;
      seen.add(key);
      lines.push(`  ${key}: ${formatCellValue(tableRow[key])}`);
    }

    for (const key of Object.keys(tableRow)) {
      if (seen.has(key)) continue;
      seen.add(key);
      lines.push(`  ${key}: ${formatCellValue(tableRow[key])}`);
    }
  }

  return lines.join("\n");
}

function drawColorbar(svg, width, height, maxAbs, layout = null) {
  const colorbarLayout = layout || getColorbarLayout(width, height);
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const grad = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
  const svgId = (svg && svg.id) ? svg.id : "plot";
  state.colorbarSeq += 1;
  const gradId = `impactColorbarGradient-${svgId}-${state.colorbarSeq}`;
  grad.setAttribute("id", gradId);
  grad.setAttribute("x1", "0%");
  grad.setAttribute("y1", "100%");
  grad.setAttribute("x2", "0%");
  grad.setAttribute("y2", "0%");

  const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  stop1.setAttribute("offset", "0%");
  stop1.setAttribute("stop-color", "rgb(0,0,255)");
  const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  stop2.setAttribute("offset", "50%");
  stop2.setAttribute("stop-color", "rgb(255,255,255)");
  const stop3 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  stop3.setAttribute("offset", "100%");
  stop3.setAttribute("stop-color", "rgb(255,0,0)");

  grad.appendChild(stop1);
  grad.appendChild(stop2);
  grad.appendChild(stop3);
  defs.appendChild(grad);
  svg.appendChild(defs);

  const { x, y, barWidth, barHeight, labelX, labelFontSize, tickFontSize } = colorbarLayout;

  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("x", `${x}`);
  rect.setAttribute("y", `${y}`);
  rect.setAttribute("width", `${barWidth}`);
  rect.setAttribute("height", `${barHeight}`);
  rect.setAttribute("fill", `url(#${gradId})`);
  rect.setAttribute("stroke", "#444");
  rect.setAttribute("stroke-width", "0.7");
  svg.appendChild(rect);

  const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
  label.setAttribute("x", `${labelX}`);
  label.setAttribute("y", `${y - 8}`);
  label.setAttribute("font-size", `${labelFontSize}`);
  label.setAttribute("fill", "#111");
  label.textContent = "Δ centrality";
  svg.appendChild(label);

  const maxText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  maxText.setAttribute("x", `${labelX}`);
  maxText.setAttribute("y", `${y + 10}`);
  maxText.setAttribute("font-size", `${tickFontSize}`);
  maxText.setAttribute("fill", "#111");
  maxText.textContent = `+${maxAbs.toFixed(4)}`;
  svg.appendChild(maxText);

  const minText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  minText.setAttribute("x", `${labelX}`);
  minText.setAttribute("y", `${y + barHeight - 2}`);
  minText.setAttribute("font-size", `${tickFontSize}`);
  minText.setAttribute("fill", "#111");
  minText.textContent = `-${maxAbs.toFixed(4)}`;
  svg.appendChild(minText);
}

function renderPlotStatic(result, options) {
  const svg = state.refs.graphSvgStatic;
  clearSvg(svg);

  const rect = state.refs.plotContainer.getBoundingClientRect();
  const width = Math.max(320, Math.floor(rect.width || 800));
  const height = Math.max(260, Math.floor(rect.height || 600));
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

  const graph = result.graph;
  const impact = result.impact || {};
  const removedNodes = (result.removed_nodes || []).map((n) => String(n));
  const removedSet = new Set(removedNodes);

  const size = graph.numberOfNodes();
  const layoutType = options.layout_type || "Spring";
  const key = `static::${result.gtype}::${size}::${layoutType}::${graphStructureHash(graph)}`;

  let rawPos = state.layoutCache.get(key);
  if (!rawPos) {
    rawPos = calculateLayout(graph, layoutType, size);
    state.layoutCache.set(key, rawPos);
  }

  let maxAbs = 0;
  for (const value of Object.values(impact)) {
    const abs = Math.abs(value);
    if (abs > maxAbs) maxAbs = abs;
  }

  const hasImpactData = Object.keys(impact).length > 0 && maxAbs > 0;
  const colorbarLayout = hasImpactData ? getColorbarLayout(width, height) : null;
  const titleReserved = getPlotTitleReservedHeight(height);
  const maxLabelChars = options.show_node_names
    ? graph.nodeIds().reduce((acc, id) => Math.max(acc, String(id).length), 0)
    : 0;
  const labelSafetyPad = (hasImpactData && options.show_node_names)
    ? Math.max(
      Math.round(width * 0.05),
      Math.min(260, Math.round(maxLabelChars * 5.2 + 16)),
    )
    : 0;
  const rightReserved = (colorbarLayout ? colorbarLayout.reservedRight : 0) + labelSafetyPad;
  setPlotTitle(result.label || "Graph", colorbarLayout ? colorbarLayout.reservedRight : 0);
  const pos = graphToScreenPositions(rawPos, width, height, {
    reservedRight: rightReserved,
    extraTop: titleReserved,
  });
  const { nodeRadius, minThick, maxThick } = getNodeStyleByGraphSize(size);
  const widths = computeEdgeWidths(graph, minThick, maxThick, options.edge_thickness_by_weight);

  const clipId = `plotClip-static-${state.colorbarSeq + 1}`;
  createClipPath(
    svg,
    clipId,
    0,
    titleReserved,
    Math.max(1, width - rightReserved),
    Math.max(1, height - titleReserved),
  );
  const plotLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
  plotLayer.setAttribute("clip-path", `url(#${clipId})`);
  svg.appendChild(plotLayer);

  const baseEdges = [];
  const baseWidths = [];
  const highlightEdges = [];
  const highlightWidths = [];

  for (let i = 0; i < graph.edges.length; i += 1) {
    const edge = graph.edges[i];
    const widthEdge = widths[i] !== undefined ? widths[i] : 1;
    const isRemovedEdge = removedSet.has(edge.source) || removedSet.has(edge.target);
    if (options.mark_removed_edges && isRemovedEdge) {
      highlightEdges.push(edge);
      highlightWidths.push(widthEdge);
    } else {
      baseEdges.push(edge);
      baseWidths.push(widthEdge);
    }
  }

  for (let i = 0; i < baseEdges.length; i += 1) {
    const edge = baseEdges[i];
    const p1 = pos[edge.source];
    const p2 = pos[edge.target];
    if (!p1 || !p2) continue;

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", `${p1.x}`);
    line.setAttribute("y1", `${p1.y}`);
    line.setAttribute("x2", `${p2.x}`);
    line.setAttribute("y2", `${p2.y}`);
    line.setAttribute("stroke", "lightgrey");
    line.setAttribute("stroke-width", `${baseWidths[i]}`);
    line.setAttribute("stroke-linecap", "round");
    plotLayer.appendChild(line);
  }

  for (let i = 0; i < highlightEdges.length; i += 1) {
    const edge = highlightEdges[i];
    const p1 = pos[edge.source];
    const p2 = pos[edge.target];
    if (!p1 || !p2) continue;

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", `${p1.x}`);
    line.setAttribute("y1", `${p1.y}`);
    line.setAttribute("x2", `${p2.x}`);
    line.setAttribute("y2", `${p2.y}`);
    line.setAttribute("stroke", "orange");
    line.setAttribute("stroke-width", `${highlightWidths[i]}`);
    line.setAttribute("stroke-linecap", "round");
    line.setAttribute("stroke-dasharray", "5,4");
    plotLayer.appendChild(line);
  }

  for (const node of graph.nodeIds()) {
    const p = pos[node];
    if (!p) continue;

    let color = "lightblue";
    if (removedSet.has(node)) {
      color = "yellow";
    } else if (hasImpactData) {
      color = getBwrColor(impact[node] || 0, maxAbs);
    }

    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", `${p.x}`);
    circle.setAttribute("cy", `${p.y}`);
    circle.setAttribute("r", `${nodeRadius}`);
    circle.setAttribute("fill", color);
    circle.setAttribute("stroke", "black");
    circle.setAttribute("stroke-width", "0.8");
    circle.style.cursor = "pointer";
    circle.addEventListener("dblclick", (event) => {
      event.preventDefault();
      event.stopPropagation();
      selectNodeInRemovalList(node);
    });
    plotLayer.appendChild(circle);

    if (options.show_node_names) {
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", `${p.x + nodeRadius + 1.5}`);
      label.setAttribute("y", `${p.y + 2}`);
      label.setAttribute("font-size", "8");
      label.setAttribute("fill", "#111");
      label.textContent = node;
      plotLayer.appendChild(label);
    }
  }

  if (hasImpactData) {
    drawColorbar(svg, width, height, maxAbs, colorbarLayout);
  }
}

function renderPlotInteractive(result, options) {
  const svgEl = state.refs.graphSvgInteractive;
  stopInteractiveSimulation();
  hidePlotTooltip();
  clearSvg(svgEl);

  const rect = state.refs.plotContainer.getBoundingClientRect();
  const width = Math.max(320, Math.floor(rect.width || 800));
  const height = Math.max(260, Math.floor(rect.height || 600));
  svgEl.setAttribute("viewBox", `0 0 ${width} ${height}`);

  const graph = result.graph;
  const impact = result.impact || {};
  const removedNodes = (result.removed_nodes || []).map((n) => String(n));
  const removedSet = new Set(removedNodes);
  const size = graph.numberOfNodes();
  const layoutType = options.layout_type || "Spring";

  const key = `interactive::${result.gtype}::${size}::${layoutType}::${graphStructureHash(graph)}`;
  let rawPos = state.layoutCache.get(key);
  if (!rawPos) {
    rawPos = calculateLayout(graph, layoutType, size);
    state.layoutCache.set(key, rawPos);
  }

  let maxAbs = 0;
  for (const value of Object.values(impact)) {
    const abs = Math.abs(value);
    if (abs > maxAbs) maxAbs = abs;
  }
  const hasImpactData = Object.keys(impact).length > 0 && maxAbs > 0;

  const colorbarLayout = hasImpactData ? getColorbarLayout(width, height) : null;
  const titleReserved = getPlotTitleReservedHeight(height);
  setPlotTitle(result.label || "Graph", colorbarLayout ? colorbarLayout.reservedRight : 0);
  const maxLabelChars = options.show_node_names
    ? graph.nodeIds().reduce((acc, id) => Math.max(acc, String(id).length), 0)
    : 0;
  const labelSafetyPad = (hasImpactData && options.show_node_names)
    ? Math.max(
      Math.round(width * 0.05),
      Math.min(260, Math.round(maxLabelChars * 5.2 + 16)),
    )
    : 0;
  const pos = graphToScreenPositions(rawPos, width, height, {
    reservedRight: (colorbarLayout ? colorbarLayout.reservedRight : 0) + labelSafetyPad,
    extraTop: titleReserved,
  });
  const { nodeRadius, minThick, maxThick } = getNodeStyleByGraphSize(size);
  const widths = computeEdgeWidths(graph, minThick, maxThick, options.edge_thickness_by_weight);

  const bounds = {
    left: Math.max(nodeRadius + 2, 8),
    top: Math.max(nodeRadius + 2, titleReserved),
    right: Math.max(
      nodeRadius + 30,
      width - (colorbarLayout ? colorbarLayout.reservedRight : 0) - nodeRadius - 8 - labelSafetyPad,
    ),
    bottom: Math.max(nodeRadius + 30, height - nodeRadius - 8),
  };

  const boundsCenterX = (bounds.left + bounds.right) / 2;
  const boundsCenterY = (bounds.top + bounds.bottom) / 2;
  const clampToBounds = (x, y) => {
    const safeX = Number.isFinite(x) ? x : boundsCenterX;
    const safeY = Number.isFinite(y) ? y : boundsCenterY;
    return {
      x: Math.min(Math.max(safeX, bounds.left), bounds.right),
      y: Math.min(Math.max(safeY, bounds.top), bounds.bottom),
    };
  };

  const nodeData = graph.nodeIds().map((id) => {
    const initial = clampToBounds(pos[id]?.x ?? (width / 2), pos[id]?.y ?? (height / 2));
    return {
      id,
      x: initial.x,
      y: initial.y,
      x0: initial.x,
      y0: initial.y,
      degree: graph.degree(id),
      delta: impact[id] || 0,
      removed: removedSet.has(id),
      color: removedSet.has(id)
        ? "yellow"
        : (hasImpactData ? getBwrColor(impact[id] || 0, maxAbs) : "lightblue"),
    };
  });

  const edgeData = graph.edges.map((edge, i) => ({
    source: edge.source,
    target: edge.target,
    width: widths[i] !== undefined ? widths[i] : 1,
    highlight: options.mark_removed_edges && (removedSet.has(edge.source) || removedSet.has(edge.target)),
  }));

  const svg = d3.select(svgEl);
  const clipId = `plotClip-interactive-${state.colorbarSeq + 1}`;
  createClipPath(
    svgEl,
    clipId,
    0,
    titleReserved,
    Math.max(1, width - (colorbarLayout ? colorbarLayout.reservedRight : 0) - labelSafetyPad),
    Math.max(1, height - titleReserved),
  );
  const viewportLayer = svg.append("g")
    .attr("class", "plotViewport")
    .attr("clip-path", `url(#${clipId})`);
  const zoomLayer = viewportLayer.append("g")
    .attr("class", "zoomLayer");

  const linkSel = zoomLayer.append("g")
    .attr("class", "edges")
    .selectAll("line")
    .data(edgeData)
    .enter()
    .append("line")
    .attr("stroke", (d) => (d.highlight ? "orange" : "lightgrey"))
    .attr("stroke-width", (d) => d.width)
    .attr("stroke-dasharray", (d) => (d.highlight ? "5,4" : null))
    .attr("stroke-linecap", "round");

  const nodeSel = zoomLayer.append("g")
    .attr("class", "nodes")
    .selectAll("g.node")
    .data(nodeData)
    .enter()
    .append("g")
    .attr("class", "node");

  nodeSel.append("circle")
    .attr("r", nodeRadius)
    .attr("fill", (d) => d.color)
    .attr("stroke", "black")
    .attr("stroke-width", 0.8);

  if (options.show_node_names) {
    nodeSel.append("text")
      .attr("x", nodeRadius + 2)
      .attr("y", 2)
      .attr("font-size", 8)
      .attr("fill", "#111")
      .text((d) => d.id);
  }

  const tooltipEl = state.refs.plotTooltip;
  nodeSel
    .on("mouseenter.tooltip", (event, d) => {
      tooltipEl.textContent = buildNodeTooltipText(d.id, graph, impact, removedSet);
      tooltipEl.classList.remove("hidden");
      positionTooltipFromMouse(event, tooltipEl);
    })
    .on("mousemove.tooltip", (event) => {
      positionTooltipFromMouse(event, tooltipEl);
    })
    .on("mouseleave.tooltip", () => {
      hidePlotTooltip();
    });

  const zoomExtent = [
    [bounds.left, bounds.top],
    [bounds.right, bounds.bottom],
  ];
  const zoomBehavior = d3.zoom()
    .scaleExtent([0.2, 8])
    .extent(zoomExtent)
    .translateExtent(zoomExtent)
    .on("zoom", (event) => {
      zoomLayer.attr("transform", event.transform);
    });
  svg.call(zoomBehavior).on("dblclick.zoom", null);

  const linkDistance = size >= 500 ? 15 : (size >= 100 ? 30 : 60);
  const chargeStrength = size >= 500 ? -10 : (size >= 100 ? -30 : -120);
  let simulation = d3.forceSimulation(nodeData)
    .force("collide", d3.forceCollide().radius(nodeRadius + 1));

  if (layoutType === "Spring") {
    simulation = simulation
      .force("link", d3.forceLink(edgeData).id((d) => d.id).distance(linkDistance).strength(0.7))
      .force("charge", d3.forceManyBody().strength(chargeStrength))
      .force("center", d3.forceCenter(boundsCenterX, boundsCenterY));
  } else {
    simulation = simulation
      .force("link", d3.forceLink(edgeData).id((d) => d.id).distance(linkDistance).strength(0.08))
      .force("charge", d3.forceManyBody().strength(chargeStrength * 0.25))
      .force("x", d3.forceX((d) => d.x0).strength(0.22))
      .force("y", d3.forceY((d) => d.y0).strength(0.22));
  }

  const dragBehavior = d3.drag()
    .on("start", (event, d) => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    })
    .on("drag", (event, d) => {
      const clamped = clampToBounds(event.x, event.y);
      d.fx = clamped.x;
      d.fy = clamped.y;
    })
    .on("end", (event) => {
      if (!event.active) simulation.alphaTarget(0);
    });

  nodeSel.call(dragBehavior);
  nodeSel.on("dblclick.select", (event, d) => {
    event.preventDefault();
    event.stopPropagation();
    selectNodeInRemovalList(d.id);
  });

  simulation.on("tick", () => {
    for (const d of nodeData) {
      const clamped = clampToBounds(d.x, d.y);
      d.x = clamped.x;
      d.y = clamped.y;
      if (Number.isFinite(d.fx) && Number.isFinite(d.fy)) {
        const fixedClamped = clampToBounds(d.fx, d.fy);
        d.fx = fixedClamped.x;
        d.fy = fixedClamped.y;
      }
    }

    linkSel
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    nodeSel.attr("transform", (d) => `translate(${d.x},${d.y})`);
  });

  state.interactiveSimulation = simulation;

  if (hasImpactData) {
    drawColorbar(svgEl, width, height, maxAbs, colorbarLayout);
  }
}

function renderPlot(result, plotOptions = null) {
  if (!result || !result.graph) {
    clearPlot();
    return;
  }

  const options = plotOptions || {
    show_node_names: true,
    edge_thickness_by_weight: true,
    mark_removed_edges: true,
    layout_type: "Spring",
  };

  state.lastRenderedResult = result;
  setPlotTitle(result.label || "Graph");
  if (state.plotMode === "interactive") {
    renderPlotInteractive(result, options);
  } else {
    stopInteractiveSimulation();
    hidePlotTooltip();
    renderPlotStatic(result, options);
  }
}

function getPlotOptions() {
  return {
    show_node_names: state.refs.showNodeNames.checked,
    edge_thickness_by_weight: state.refs.edgeThicknessByWeight.checked,
    mark_removed_edges: state.refs.markRemovedEdges.checked,
    layout_type: state.refs.layoutType.value,
  };
}

async function getFileText(file) {
  if (state.loadedFile === file && typeof state.loadedFileText === "string") {
    return state.loadedFileText;
  }
  const text = await file.text();
  state.loadedFileText = text;
  return text;
}

async function getFileArrayBuffer(file) {
  if (state.loadedFile === file && state.loadedFileArrayBuffer instanceof ArrayBuffer) {
    return state.loadedFileArrayBuffer;
  }
  const buffer = await file.arrayBuffer();
  state.loadedFileArrayBuffer = buffer;
  return buffer;
}

async function loadGraphFromCurrentFile({ edge1, edge2, weight, removeSelfEdges, networkName, directed }) {
  if (!state.loadedFile || !state.loadedFileType) {
    throw new Error("No file selected.");
  }

  const ext = state.loadedFileType;
  if (ext === ".cys") {
    if (!state.cysZip) {
      const buffer = await getFileArrayBuffer(state.loadedFile);
      state.cysZip = await JSZip.loadAsync(buffer);
    }

    let selectedEntry = null;
    if (networkName) {
      selectedEntry = state.cysNetworkEntries.find((entry) => entry.baseName === networkName) || null;
    }
    if (!selectedEntry) {
      selectedEntry = state.cysNetworkEntries[0] || null;
    }
    if (!selectedEntry) {
      throw new Error("No XGMML networks found in .cys file.");
    }

    const xmlText = await state.cysZip.file(selectedEntry.fullPath).async("text");
    return parseXgmmlGraph(xmlText, removeSelfEdges);
  }

  if (ext === ".gexf") {
    const text = await getFileText(state.loadedFile);
    const gexfWeightField = (weight && weight.trim()) ? weight.trim() : GEXF_EDGE_WEIGHT_OPTION;
    return parseGexfGraph(text, removeSelfEdges, directed, gexfWeightField);
  }

  const text = await getFileText(state.loadedFile);
  return loadTsvGraphFromText(text, edge1, edge2, weight, removeSelfEdges, directed);
}

async function generatePreview() {
  if (isRandomGraphMode()) {
    if (!state.randomGraph) {
      return;
    }
    try {
      setStatus("Loading preview...");
      let graph = state.randomGraph.copy();

      graph = processGraph(
        graph,
        state.refs.removeZeroDegree.checked,
        state.refs.useLargestComponent.checked,
      );

      const previewResult = {
        label: "Graph Preview",
        gtype: "Preview",
        impact: {},
        graph,
        removed_nodes: [],
      };

      renderPlot(previewResult, {
        show_node_names: true,
        edge_thickness_by_weight: true,
        mark_removed_edges: false,
        layout_type: state.refs.layoutType.value || "Spring",
      });

      setStatus(`Preview loaded: ${graph.numberOfNodes()} nodes, ${graph.numberOfEdges()} edges`);
      updateNodeList(graph.nodeIds().sort());
      populateAdjacency(graph);
      showAdjacencyView();
    } catch (err) {
      setStatus(`Preview failed: ${err.message}`);
    }
    return;
  }

  if (!state.loadedFile) {
    return;
  }

  const edge1 = state.refs.edge1Select.value.trim();
  const edge2 = state.refs.edge2Select.value.trim();
  const weight = state.refs.weightSelect.value.trim();
  const removeSelfEdges = state.refs.removeSelfEdges.checked;
  const directed = state.refs.directedGraph.checked;
  const networkName = state.refs.networkSelect.value;

  if (state.loadedFileType === ".tsv") {
    if (!edge1 || !edge2 || !weight) {
      return;
    }
  }

  try {
    setStatus("Loading preview...");
    let graph = await loadGraphFromCurrentFile({
      edge1,
      edge2,
      weight,
      removeSelfEdges,
      networkName,
      directed,
    });

    graph = processGraph(
      graph,
      state.refs.removeZeroDegree.checked,
      state.refs.useLargestComponent.checked,
    );

    const previewResult = {
      label: "Graph Preview",
      gtype: "Preview",
      impact: {},
      graph,
      removed_nodes: [],
    };

    renderPlot(previewResult, {
      show_node_names: true,
      edge_thickness_by_weight: true,
      mark_removed_edges: false,
      layout_type: state.refs.layoutType.value || "Spring",
    });

    setStatus(`Preview loaded: ${graph.numberOfNodes()} nodes, ${graph.numberOfEdges()} edges`);
    updateNodeList(graph.nodeIds().sort());
    populateAdjacency(graph);
    showAdjacencyView();
  } catch (err) {
    setStatus(`Preview failed: ${err.message}`);
  }
}

async function handleFileUpload(file, fileExt) {
  try {
    if (fileExt === ".cys") {
      state.loadedFileText = null;
      state.loadedFileArrayBuffer = null;
      const buffer = await getFileArrayBuffer(file);
      state.cysZip = await JSZip.loadAsync(buffer);

      state.cysNetworkEntries = [];
      state.cysZip.forEach((relativePath, zipEntry) => {
        if (!zipEntry.dir && relativePath.toLowerCase().endsWith(".xgmml")) {
          const parts = relativePath.split("/");
          state.cysNetworkEntries.push({
            fullPath: relativePath,
            baseName: parts[parts.length - 1],
          });
        }
      });

      disableColumnSelection(true);
      showElement(state.refs.tsvOptionsRow, false);
      showNetworkSelector(state.cysNetworkEntries.map((entry) => entry.baseName));

      if (state.cysNetworkEntries.length > 0) {
        setStatus(`Loaded .cys file with ${state.cysNetworkEntries.length} network(s)`);
      } else {
        showElement(state.refs.networkRow, false);
        setStatus("Loaded .cys file");
      }

      showExportCysButton(true);
      setTimeout(() => {
        generatePreview();
      }, 100);
      return;
    }

    if (fileExt === ".gexf") {
      state.loadedFileText = await getFileText(file);
      state.cysZip = null;
      state.cysNetworkEntries = [];
      setEdgeOptionsMode("gexf");
      const weightOptions = getGexfWeightOptions(state.loadedFileText);
      setSelectOptions(state.refs.weightSelect, weightOptions, false);
      state.refs.weightSelect.value = GEXF_EDGE_WEIGHT_OPTION;
      state.refs.edge1Select.disabled = true;
      state.refs.edge2Select.disabled = true;
      state.refs.weightSelect.disabled = false;
      state.refs.removeSelfEdges.disabled = false;
      state.refs.directedGraph.disabled = false;
      showElement(state.refs.tsvOptionsRow, true);
      showElement(state.refs.networkRow, false);
      showExportCysButton(false);
      setStatus(`Loaded GEXF file (${weightOptions.length} weight option(s))`);
      setTimeout(() => {
        generatePreview();
      }, 100);
      return;
    }

    // Default: TSV mode
    const text = await getFileText(file);
    state.cysZip = null;
    state.cysNetworkEntries = [];

    const firstLine = text.split(/\r?\n/)[0] || "";
    const sep = detectSeparatorFromHeader(firstLine);
    const parsed = parseDelimited(text, sep);
    const columns = parsed.header;

    updateColumnSuggestions(columns);
    setEdgeOptionsMode("tsv");
    disableColumnSelection(false);
    showElement(state.refs.tsvOptionsRow, true);
    showElement(state.refs.networkRow, false);
    showExportCysButton(false);
    setStatus(`Loaded ${columns.length} columns from file`);
  } catch (err) {
    alert(`Failed to read file:\n${err.message}`);
  }
}

async function onFileSelect() {
  const file = state.refs.fileInput.files[0];
  if (!file) {
    return;
  }

  const extMatch = file.name.toLowerCase().match(/\.[^.]+$/);
  const fileExt = extMatch ? extMatch[0] : "";
  state.loadedFile = file;
  state.loadedFileType = fileExt;
  state.loadedFileName = file.name;
  state.loadedFileText = null;
  state.loadedFileArrayBuffer = null;
  state.cysZip = null;
  state.cysNetworkEntries = [];

  state.refs.filePath.value = file.name;

  if (fileExt === ".tsv" || fileExt === ".cys" || fileExt === ".gexf") {
    await handleFileUpload(file, fileExt);
  } else {
    setStatus("Selected file type not recognized for column extraction");
  }
}

function onGraphSourceChanged() {
  const source = state.refs.graphSource.value;
  if (source === "file") {
    showElement(state.refs.fileSelectionRow, true);
    showElement(state.refs.randomGraphRow, false);
  } else {
    showElement(state.refs.fileSelectionRow, false);
    showElement(state.refs.randomGraphRow, true);
    removeFileModeOptions();
  }
  generatePreview();
}

function onRandomGraphChanged() {
  state.layoutCache.clear();
  generatePreview();
}

async function generateRandomGraph() {
  try {
    const params = getRandomGraphParams();
    setStatus(`Generating ${params.graph_type} graph with ${params.size} nodes...`);

    const seed = Date.now() % 10000;
    const graph = makeGraph(params.graph_type, params.size, seed);

    state.layoutCache.clear();
    state.randomGraph = graph;

    clearPlot();
    await generatePreview();

    const display = RANDOM_GRAPH_DISPLAY[params.graph_type] || params.graph_type;
    setStatus(`Generated ${display} graph with ${params.size} nodes`);
  } catch (err) {
    alert(`Failed to generate random graph:\n${err.message}`);
    setStatus("Error generating graph");
  }
}

function renderCurrentPlot() {
  if (!state.lastRenderedResult) {
    return;
  }
  renderPlot(state.lastRenderedResult, getPlotOptions());
}

async function runAnalysis() {
  const removedNodesStr = getSelectedNodesFromSelector();
  const selectedCentralities = getSelectedCentralities();

  if (selectedCentralities.length === 0) {
    throw new Error("Please select at least one centrality measure");
  }

  let graph = null;
  let removedNodes = [];
  let fileType = "";

  if (isRandomGraphMode()) {
    if (!state.randomGraph) {
      throw new Error("Please generate a random graph first");
    }
    graph = state.randomGraph.copy();
    removedNodes = removedNodesStr.map((node) => {
      const asInt = Number.parseInt(node, 10);
      return Number.isFinite(asInt) ? asInt : node;
    });

    const params = getRandomGraphParams();
    const graphTypeDisplay = RANDOM_GRAPH_DISPLAY[params.graph_type] || params.graph_type;
    fileType = `Random ${graphTypeDisplay}`;
  } else {
    if (!state.loadedFile) {
      throw new Error("Please select a graph file");
    }

    const edge1 = state.refs.edge1Select.value.trim() || "edge1";
    const edge2 = state.refs.edge2Select.value.trim() || "edge2";
    const weight = state.refs.weightSelect.value.trim() || "weight";
    const removeSelfEdges = state.refs.removeSelfEdges.checked;
    const directed = state.refs.directedGraph.checked;
    const networkName = state.refs.networkSelect.value;

    graph = await loadGraphFromCurrentFile({
      edge1,
      edge2,
      weight,
      removeSelfEdges,
      networkName,
      directed,
    });

    removedNodes = removedNodesStr;

    const ext = state.loadedFileType;
    if (ext === ".cys") {
      fileType = networkName ? `CYS file (network: ${networkName})` : "CYS file";
    } else if (ext === ".gexf") {
      fileType = "GEXF file";
    } else {
      fileType = `${ext.toUpperCase()} file`;
    }
  }

  graph = processGraph(
    graph,
    state.refs.removeZeroDegree.checked,
    state.refs.useLargestComponent.checked,
  );

  fileType = `Read from ${fileType}`;
  const { tableData, impact, diameterInfo, graphInfo } = computeAnalysis(graph, removedNodes, selectedCentralities);

  showAnalysisView();
  populateAnalysisTable(tableData);
  if (diameterInfo && diameterInfo.before !== undefined && diameterInfo.after !== undefined) {
    updateDiameterDisplay(diameterInfo.before, diameterInfo.after);
  }
  if (graphInfo) {
    updateGraphInfoDisplay(graphInfo.before, graphInfo.after);
  }

  const label = removedNodes.length > 0
    ? `Removed Nodes: ${removedNodes.map((n) => String(n)).join(", ")}`
    : "All Nodes (No Removal)";

  const result = {
    label,
    gtype: fileType,
    impact,
    graph,
    removed_nodes: removedNodes,
  };

  state.lastAnalysisResult = result;
  renderPlot(result, getPlotOptions());
}

async function runAnalysisSafe() {
  try {
    setStatus("Running analysis...");
    await new Promise((resolve) => setTimeout(resolve, 0));
    await runAnalysis();
    setStatus("Done");
    renderCurrentPlot();
    collapseConfig();
  } catch (err) {
    setStatus("Error");
    alert(err.message || String(err));
  }
}

async function refreshPlot() {
  try {
    setStatus("Refreshing plot...");
    if (state.lastRenderedResult) {
      renderCurrentPlot();
      setStatus("Plot refreshed");
      return;
    }

    await generatePreview();

    if (state.lastRenderedResult) {
      setStatus("Plot refreshed");
    } else {
      alert("No graph to refresh. Load a file or generate a random graph first.");
      setStatus("No graph to refresh");
    }
  } catch (err) {
    alert(`Refresh Plot Error\n${err.message}`);
    setStatus("Error refreshing plot");
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function saveSvg() {
  try {
    const svg = getActivePlotSvg();
    if (!svg || svg.childNodes.length === 0) {
      throw new Error("No graph visualization available.");
    }

    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svg);
    if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    const blob = new Blob([`<?xml version="1.0" standalone="no"?>\n${source}`], { type: "image/svg+xml;charset=utf-8" });
    const suffix = state.plotMode === "interactive" ? "-interactive" : "-static";
    downloadBlob(blob, `graph-plot${suffix}.svg`);
    setStatus("Saved SVG");
  } catch (err) {
    alert(err.message || String(err));
  }
}

function csvEscape(value) {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function exportCsv() {
  if (!state.currentTableData || state.currentTableData.rows.length === 0) {
    alert("No data to export");
    return;
  }

  const cols = ["Node", ...state.currentTableData.columns];
  const lines = [cols.map(csvEscape).join(",")];

  for (const row of state.currentTableData.rows) {
    const values = [row.node, ...state.currentTableData.columns.map((c) => formatCellValue(row[c]))];
    lines.push(values.map(csvEscape).join(","));
  }

  const blob = new Blob([`${lines.join("\n")}\n`], { type: "text/csv;charset=utf-8" });
  downloadBlob(blob, "analysis_results.csv");
}

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function graphToXgmml(graph, networkName, combinedCentrality = null, combinedDelta = null) {
  const nodes = graph.nodeIds();
  const nodeToId = new Map();
  nodes.forEach((node, idx) => {
    nodeToId.set(node, String(idx + 1));
  });

  const lines = [];
  lines.push("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
  lines.push(
    `<graph label=\"${xmlEscape(networkName)}\" xmlns=\"http://www.cs.rpi.edu/XGMML\" directed=\"${graph.directed ? 1 : 0}\">`,
  );

  for (const node of nodes) {
    const attrs = graph.nodes.get(node) || {};
    lines.push(`  <node id=\"${xmlEscape(nodeToId.get(node))}\" label=\"${xmlEscape(node)}\">`);
    for (const [key, value] of Object.entries(attrs)) {
      lines.push(`    <att name=\"${xmlEscape(key)}\" value=\"${xmlEscape(value)}\"/>`);
    }
    if (combinedCentrality && combinedCentrality[node] !== undefined) {
      lines.push(`    <att name=\"Combined Centrality\" value=\"${xmlEscape(combinedCentrality[node])}\"/>`);
    }
    if (combinedDelta && combinedDelta[node] !== undefined) {
      lines.push(`    <att name=\"Combined Delta\" value=\"${xmlEscape(combinedDelta[node])}\"/>`);
    }
    lines.push("  </node>");
  }

  for (const edge of graph.edges) {
    const sourceId = nodeToId.get(edge.source);
    const targetId = nodeToId.get(edge.target);
    lines.push(`  <edge source=\"${xmlEscape(sourceId)}\" target=\"${xmlEscape(targetId)}\">`);
    for (const [key, value] of Object.entries(edge.attrs || {})) {
      lines.push(`    <att name=\"${xmlEscape(key)}\" value=\"${xmlEscape(value)}\"/>`);
    }
    lines.push("  </edge>");
  }

  lines.push("</graph>");
  return lines.join("\n");
}

async function exportCys() {
  try {
    if (state.loadedFileType !== ".cys") {
      alert("No CYS file is currently loaded.");
      return;
    }

    if (!state.currentTableData || state.currentTableData.rows.length === 0) {
      alert("Run an analysis first to include centrality data.");
      return;
    }

    const networkName = state.refs.networkSelect.value || "network";

    const combinedCentrality = {};
    const combinedDelta = {};
    for (const row of state.currentTableData.rows) {
      if (row.Combined !== undefined && !Number.isNaN(row.Combined)) {
        combinedCentrality[String(row.node)] = row.Combined;
      }
      if (row["Δ Combined"] !== undefined && !Number.isNaN(row["Δ Combined"])) {
        combinedDelta[String(row.node)] = row["Δ Combined"];
      }
    }

    const originalGraph = await loadGraphFromCurrentFile({
      edge1: "",
      edge2: "",
      weight: "",
      removeSelfEdges: false,
      networkName,
      directed: false,
    });

    const xgmmlContent = graphToXgmml(originalGraph, networkName, combinedCentrality, combinedDelta);
    const zip = new JSZip();
    const filename = networkName.toLowerCase().endsWith(".xgmml") ? networkName : `${networkName}.xgmml`;
    zip.file(filename, xgmmlContent);

    const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
    downloadBlob(blob, "analysis_results.cys");

    setStatus("Exported CYS with analysis results");
    alert("Successfully exported CYS file with Combined Centrality and Combined Delta attributes.");
  } catch (err) {
    alert(`Export CYS Error\n${err.message}`);
    setStatus("Error exporting CYS file");
  }
}

function clearAll() {
  clearAnalysisTable();
  clearAdjacencyTable();
  clearGraphInfoDisplay();
  clearPlot();
  clearNodeSelector();

  removeFileModeOptions();
  showExportCysButton(false);

  state.loadedFile = null;
  state.loadedFileType = null;
  state.loadedFileName = null;
  state.loadedFileText = null;
  state.loadedFileArrayBuffer = null;
  state.cysZip = null;
  state.cysNetworkEntries = [];
  state.randomGraph = null;
  state.lastAnalysisResult = null;
  state.lastRenderedResult = null;
  state.layoutCache.clear();

  state.refs.fileInput.value = "";
  state.refs.filePath.value = "";

  showElement(state.refs.analysisView, false);
  showElement(state.refs.adjacencyView, false);

  expandConfig();
  setStatus("Cleared");
}

function centralityCheckbox(key, checked) {
  const wrapper = document.createElement("label");
  wrapper.className = "checkboxLabel";

  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = checked;
  input.dataset.centralityKey = key;

  wrapper.appendChild(input);
  wrapper.appendChild(document.createTextNode(` ${CENTRALITY_LABELS[key] || key}`));
  return { wrapper, input };
}

function initCentralityOptions() {
  state.refs.centralityChecks = new Map();
  const container = state.refs.centralityOptions;
  container.innerHTML = "";

  for (const key of CENTRALITY_KEYS) {
    const checked = key === "degree" || key === "betweenness" || key === "closeness";
    const { wrapper, input } = centralityCheckbox(key, checked);
    container.appendChild(wrapper);
    state.refs.centralityChecks.set(key, input);
  }
}

function initMainSplitter() {
  const splitter = state.refs.mainSplitter;
  const layout = state.refs.mainLayout;
  if (!splitter || !layout) return;

  const saved = loadSavedPanelWidth();
  if (saved && !isStackedMainLayout()) {
    applyPanelSplit(saved, { skipStore: true });
  }

  let pointerId = null;

  const onPointerMove = (event) => {
    if (pointerId === null || event.pointerId !== pointerId) return;
    const rect = layout.getBoundingClientRect();
    const style = window.getComputedStyle(layout);
    const padLeft = Number.parseFloat(style.paddingLeft) || 0;
    const proposedLeft = event.clientX - rect.left - padLeft;
    applyPanelSplit(proposedLeft);
    schedulePlotRerender();
  };

  const onPointerUp = (event) => {
    if (pointerId === null || event.pointerId !== pointerId) return;
    try {
      splitter.releasePointerCapture(pointerId);
    } catch (err) {
      // no-op
    }
    pointerId = null;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    schedulePlotRerender();
  };

  splitter.addEventListener("pointerdown", (event) => {
    if (isStackedMainLayout()) return;
    pointerId = event.pointerId;
    splitter.setPointerCapture(pointerId);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    event.preventDefault();
  });

  splitter.addEventListener("pointermove", onPointerMove);
  splitter.addEventListener("pointerup", onPointerUp);
  splitter.addEventListener("pointercancel", onPointerUp);
}

function wireEvents() {
  state.refs.toggleConfigBtn.addEventListener("click", toggleConfig);
  state.refs.browseBtn.addEventListener("click", () => state.refs.fileInput.click());
  state.refs.fileInput.addEventListener("change", onFileSelect);

  state.refs.graphSource.addEventListener("change", onGraphSourceChanged);

  state.refs.randomGraphType.addEventListener("change", onRandomGraphChanged);
  state.refs.randomGraphSize.addEventListener("input", onRandomGraphChanged);
  state.refs.generateRandomBtn.addEventListener("click", generateRandomGraph);

  state.refs.networkSelect.addEventListener("change", generatePreview);
  state.refs.edge1Select.addEventListener("change", generatePreview);
  state.refs.edge2Select.addEventListener("change", generatePreview);
  state.refs.weightSelect.addEventListener("change", generatePreview);

  state.refs.removeSelfEdges.addEventListener("change", generatePreview);
  state.refs.directedGraph.addEventListener("change", generatePreview);
  state.refs.removeZeroDegree.addEventListener("change", generatePreview);
  state.refs.useLargestComponent.addEventListener("change", generatePreview);

  state.refs.nodeSearch.addEventListener("input", refreshNodeList);

  state.refs.runBtn.addEventListener("click", runAnalysisSafe);
  state.refs.refreshPlotBtn.addEventListener("click", refreshPlot);
  state.refs.saveSvgBtn.addEventListener("click", saveSvg);
  state.refs.exportCysBtn.addEventListener("click", exportCys);
  state.refs.clearBtn.addEventListener("click", clearAll);

  state.refs.exportCsvBtn.addEventListener("click", exportCsv);

  state.refs.plotTabStatic.addEventListener("click", () => setPlotMode("static"));
  state.refs.plotTabInteractive.addEventListener("click", () => setPlotMode("interactive"));

  state.refs.adjacencyTableHead.querySelectorAll("th").forEach((th) => {
    th.addEventListener("click", () => {
      const col = th.getAttribute("data-col");
      sortAdjacencyBy(col);
    });
  });

  window.addEventListener("resize", () => {
    if (isStackedMainLayout()) {
      clearMainLayoutCustomColumns();
    } else if (state.leftPanelWidthPx) {
      applyPanelSplit(state.leftPanelWidthPx, { skipStore: true });
    }

    if (state.lastRenderedResult) {
      renderCurrentPlot();
    }
  });
}

function collectRefs() {
  state.refs = {
    toggleConfigBtn: document.getElementById("toggleConfigBtn"),
    statusBar: document.getElementById("statusBar"),
    configPanel: document.getElementById("configPanel"),

    graphSource: document.getElementById("graphSource"),
    fileSelectionRow: document.getElementById("fileSelectionRow"),
    randomGraphRow: document.getElementById("randomGraphRow"),
    networkRow: document.getElementById("networkRow"),
    tsvOptionsRow: document.getElementById("tsvOptionsRow"),

    filePath: document.getElementById("filePath"),
    browseBtn: document.getElementById("browseBtn"),
    fileInput: document.getElementById("fileInput"),

    randomGraphType: document.getElementById("randomGraphType"),
    randomGraphSize: document.getElementById("randomGraphSize"),
    generateRandomBtn: document.getElementById("generateRandomBtn"),

    networkSelect: document.getElementById("networkSelect"),

    edge1Select: document.getElementById("edge1Select"),
    edge2Select: document.getElementById("edge2Select"),
    weightSelect: document.getElementById("weightSelect"),
    removeSelfEdges: document.getElementById("removeSelfEdges"),
    directedGraph: document.getElementById("directedGraph"),

    removeZeroDegree: document.getElementById("removeZeroDegree"),
    useLargestComponent: document.getElementById("useLargestComponent"),

    nodeSearch: document.getElementById("nodeSearch"),
    nodeList: document.getElementById("nodeList"),

    centralityOptions: document.getElementById("centralityOptions"),

    layoutType: document.getElementById("layoutType"),
    showNodeNames: document.getElementById("showNodeNames"),
    edgeThicknessByWeight: document.getElementById("edgeThicknessByWeight"),
    markRemovedEdges: document.getElementById("markRemovedEdges"),

    runBtn: document.getElementById("runBtn"),
    refreshPlotBtn: document.getElementById("refreshPlotBtn"),
    saveSvgBtn: document.getElementById("saveSvgBtn"),
    exportCysBtn: document.getElementById("exportCysBtn"),
    clearBtn: document.getElementById("clearBtn"),
    plotTabStatic: document.getElementById("plotTabStatic"),
    plotTabInteractive: document.getElementById("plotTabInteractive"),
    mainLayout: document.querySelector(".mainLayout"),
    mainSplitter: document.getElementById("mainSplitter"),

    leftPanel: document.getElementById("leftPanel"),
    adjacencyView: document.getElementById("adjacencyView"),
    analysisView: document.getElementById("analysisView"),
    graphInfoNodesBefore: document.getElementById("graphInfoNodesBefore"),
    graphInfoNodesAfter: document.getElementById("graphInfoNodesAfter"),
    graphInfoEdgesBefore: document.getElementById("graphInfoEdgesBefore"),
    graphInfoEdgesAfter: document.getElementById("graphInfoEdgesAfter"),
    graphInfoSelfLoopsBefore: document.getElementById("graphInfoSelfLoopsBefore"),
    graphInfoSelfLoopsAfter: document.getElementById("graphInfoSelfLoopsAfter"),
    graphInfoComponentsBefore: document.getElementById("graphInfoComponentsBefore"),
    graphInfoComponentsAfter: document.getElementById("graphInfoComponentsAfter"),
    graphInfoDiameterBefore: document.getElementById("graphInfoDiameterBefore"),
    graphInfoDiameterAfter: document.getElementById("graphInfoDiameterAfter"),

    adjacencyTable: document.getElementById("adjacencyTable"),
    adjacencyTableHead: document.querySelector("#adjacencyTable thead"),
    adjacencyTableBody: document.querySelector("#adjacencyTable tbody"),
    adjacencyCounts: document.getElementById("adjacencyCounts"),

    exportCsvBtn: document.getElementById("exportCsvBtn"),
    analysisTable: document.getElementById("analysisTable"),
    analysisTableHead: document.querySelector("#analysisTable thead"),
    analysisTableBody: document.querySelector("#analysisTable tbody"),
    diameterInfo: document.getElementById("diameterInfo"),

    plotContainer: document.getElementById("plotContainer"),
    plotTitle: document.getElementById("plotTitle"),
    graphSvgStatic: document.getElementById("graphSvgStatic"),
    graphSvgInteractive: document.getElementById("graphSvgInteractive"),
    plotTooltip: document.getElementById("plotTooltip"),

    centralityChecks: new Map(),
  };
}

async function initializeWithRandomGraph() {
  try {
    state.refs.graphSource.value = "random";
    state.refs.randomGraphType.value = "watts_strogatz";
    state.refs.randomGraphSize.value = "60";

    onGraphSourceChanged();
    await generateRandomGraph();
  } catch (err) {
    // keep running even if startup graph fails
    // eslint-disable-next-line no-console
    console.error(`Failed to initialize with random graph: ${err.message}`);
  }
}

async function init() {
  collectRefs();
  clearGraphInfoDisplay();
  initCentralityOptions();
  initMainSplitter();
  wireEvents();

  disableColumnSelection(false);
  removeFileModeOptions();
  showExportCysButton(false);
  showElement(state.refs.analysisView, false);
  showElement(state.refs.adjacencyView, false);
  setPlotMode("static");

  setStatus("Idle");
  await initializeWithRandomGraph();
}

document.addEventListener("DOMContentLoaded", init);
