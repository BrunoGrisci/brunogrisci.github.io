(function () {
  const { I18N, KaratsubaAlgorithms } = window;

  const state = {
    lang: 'en',
    theme: 'light',
    activeTab: 'classroom',
    prepared: null,
    executions: {
      classroom: null,
      karatsuba: null
    },
    stepIndex: {
      classroom: 0,
      karatsuba: 0
    },
    autoTimer: null,
    paddingMessage: null,
    statusMessage: null,
    controlsCollapsed: false,
    codeCollapsed: false,
    multTableOpen: false,
    helpOpen: false,
    referencesOpen: false,
    comparison: {
      lengths: [1, 2, 4, 8, 16, 32, 64, 128, 256],
      repeats: 5,
      xMaxLength: 256,
      yZoom: 1,
      running: false,
      stopRequested: false,
      progressDone: 0,
      progressTotal: 0,
      activeSeriesKey: null,
      tooltip: null,
      samples: [],
      toggles: {
        classroom: true,
        karatsuba: true,
        total: true,
        mul: true,
        add: true,
        theoryN2: true,
        theoryN158: true
      }
    }
  };

  const resizeState = {
    mode: null,
    pointerId: null,
    splitterEl: null,
    containerRect: null,
    splitterSize: 0,
    min: 0,
    max: 0
  };

  const els = {
    multTableBtn: document.getElementById('multTableBtn'),
    multTableOverlay: document.getElementById('multTableOverlay'),
    multTableCloseBtn: document.getElementById('multTableCloseBtn'),
    multTableGrid: document.getElementById('multTableGrid'),
    helpBtn: document.getElementById('helpBtn'),
    helpOverlay: document.getElementById('helpOverlay'),
    helpCloseBtn: document.getElementById('helpCloseBtn'),
    referencesLink: document.getElementById('referencesLink'),
    referencesOverlay: document.getElementById('referencesOverlay'),
    referencesCloseBtn: document.getElementById('referencesCloseBtn'),
    toggleControlsBtn: document.getElementById('toggleControlsBtn'),
    controlsIcon: document.getElementById('controlsIcon'),
    toggleCodeBtn: document.getElementById('toggleCodeBtn'),
    codeIcon: document.getElementById('codeIcon'),
    langToggle: document.getElementById('langToggle'),
    langFlag: document.getElementById('langFlag'),
    themeToggle: document.getElementById('themeToggle'),
    themeIcon: document.getElementById('themeIcon'),

    inputX: document.getElementById('inputX'),
    inputY: document.getElementById('inputY'),
    randomLength: document.getElementById('randomLength'),
    randomBtn: document.getElementById('randomBtn'),
    prepareBtn: document.getElementById('prepareBtn'),
    runStepBtn: document.getElementById('runStepBtn'),
    autoRunBtn: document.getElementById('autoRunBtn'),
    runFullBtn: document.getElementById('runFullBtn'),
    speedSelect: document.getElementById('speedSelect'),
    resetBtn: document.getElementById('resetBtn'),

    paddingInfo: document.getElementById('paddingInfo'),
    statusBar: document.getElementById('statusBar'),

    totalCount: document.getElementById('totalCount'),
    mulCount: document.getElementById('mulCount'),
    addCount: document.getElementById('addCount'),
    stepCount: document.getElementById('stepCount'),

    tabClassroom: document.getElementById('tabClassroom'),
    tabKaratsuba: document.getElementById('tabKaratsuba'),
    tabComparison: document.getElementById('tabComparison'),
    panelClassroom: document.getElementById('panelClassroom'),
    panelKaratsuba: document.getElementById('panelKaratsuba'),
    panelComparison: document.getElementById('panelComparison'),
    mainLayout: document.querySelector('main'),
    contentGrid: document.querySelector('.content-grid'),
    controlPanel: document.querySelector('.control-panel'),
    codePanel: document.querySelector('.code-panel'),
    mainSplitter: document.getElementById('mainSplitter'),
    contentSplitter: document.getElementById('contentSplitter'),

    classroomDigits: document.getElementById('classroomDigits'),
    classroomPowers: document.getElementById('classroomPowers'),
    classroomDerivation: document.getElementById('classroomDerivation'),

    karatsubaDigits: document.getElementById('karatsubaDigits'),
    karatsubaPowers: document.getElementById('karatsubaPowers'),
    karatsubaIdentity: document.getElementById('karatsubaIdentity'),
    karatsubaTree: document.getElementById('karatsubaTree'),

    comparisonRepeats: document.getElementById('comparisonRepeats'),
    comparisonRunBtn: document.getElementById('comparisonRunBtn'),
    comparisonStopBtn: document.getElementById('comparisonStopBtn'),
    comparisonProgress: document.getElementById('comparisonProgress'),
    comparisonXMax: document.getElementById('comparisonXMax'),
    comparisonYZoom: document.getElementById('comparisonYZoom'),
    comparisonYZoomValue: document.getElementById('comparisonYZoomValue'),
    comparisonShowClassroom: document.getElementById('comparisonShowClassroom'),
    comparisonShowKaratsuba: document.getElementById('comparisonShowKaratsuba'),
    comparisonShowTotal: document.getElementById('comparisonShowTotal'),
    comparisonShowMul: document.getElementById('comparisonShowMul'),
    comparisonShowAdd: document.getElementById('comparisonShowAdd'),
    comparisonShowTheoryN2: document.getElementById('comparisonShowTheoryN2'),
    comparisonShowTheoryN158: document.getElementById('comparisonShowTheoryN158'),
    comparisonChartArea: document.getElementById('comparisonChartArea'),
    comparisonChartSvg: document.getElementById('comparisonChartSvg'),
    comparisonChartTooltip: document.getElementById('comparisonChartTooltip'),
    comparisonTable: document.getElementById('comparisonTable'),

    codeDisplay: document.getElementById('codeDisplay'),
    stepLog: document.getElementById('stepLog')
  };

  let normalizeRaf = null;

  function t(key, params = {}) {
    return I18N.t(state.lang, key, params);
  }

  function localizeStep(step) {
    return t(step.messageKey, step.messageParams || {});
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setStatus(key, params = {}) {
    state.statusMessage = { key, params };
    els.statusBar.textContent = t(key, params);
  }

  function setPaddingMessage(key, params = {}) {
    state.paddingMessage = { key, params };
    els.paddingInfo.textContent = t(key, params);
  }

  function sanitizeInput(el) {
    el.value = String(el.value || '').replace(/\D+/g, '');
  }

  function setLanguage(lang) {
    state.lang = lang;
    document.body.dataset.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach((node) => {
      const key = node.getAttribute('data-i18n');
      node.textContent = t(key);
    });

    if (state.paddingMessage) {
      els.paddingInfo.textContent = t(state.paddingMessage.key, state.paddingMessage.params);
    }

    if (state.statusMessage) {
      els.statusBar.textContent = t(state.statusMessage.key, state.statusMessage.params);
    }

    els.langFlag.textContent = lang === 'en' ? '🇺🇸' : '🇧🇷';
    els.langToggle.title = lang === 'en' ? 'Switch to Portuguese' : 'Mudar para Inglês';
    updateMultTableButton();
    updateHelpButton();
    updatePanelToggleButtons();

    renderAll();
  }

  function setTheme(theme) {
    state.theme = theme;
    document.body.classList.toggle('theme-dark', theme === 'dark');
    document.body.classList.toggle('theme-light', theme !== 'dark');
    els.themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  function updatePanelToggleButtons() {
    const controlsKey = state.controlsCollapsed ? 'toggle_controls_show' : 'toggle_controls_hide';
    const codeKey = state.codeCollapsed ? 'toggle_code_show' : 'toggle_code_hide';
    const controlsText = t(controlsKey);
    const codeText = t(codeKey);

    els.toggleControlsBtn.title = controlsText;
    els.toggleControlsBtn.setAttribute('aria-label', controlsText);
    els.toggleControlsBtn.classList.toggle('panel-collapsed', state.controlsCollapsed);
    els.controlsIcon.textContent = state.controlsCollapsed ? '🧰+' : '🧰-';

    els.toggleCodeBtn.title = codeText;
    els.toggleCodeBtn.setAttribute('aria-label', codeText);
    els.toggleCodeBtn.classList.toggle('panel-collapsed', state.codeCollapsed);
    els.codeIcon.textContent = state.codeCollapsed ? '📜+' : '📜-';
  }

  function updateMultTableButton() {
    const label = t('mult_table_open');
    els.multTableBtn.title = label;
    els.multTableBtn.setAttribute('aria-label', label);
  }

  function updateHelpButton() {
    const label = t('help_open');
    els.helpBtn.title = label;
    els.helpBtn.setAttribute('aria-label', label);
  }

  function updateModalBodyLock() {
    document.body.classList.toggle('modal-open', state.multTableOpen || state.helpOpen || state.referencesOpen);
  }

  function buildMultiplicationTable() {
    const digits = Array.from({ length: 10 }, (_, i) => i);
    const head = digits.map((d) => `<th scope="col">${d}</th>`).join('');
    const rows = digits
      .map((r) => {
        const cells = digits.map((c) => `<td>${r * c}</td>`).join('');
        return `<tr><th scope="row">${r}</th>${cells}</tr>`;
      })
      .join('');

    els.multTableGrid.innerHTML = `
      <table class="mult-table">
        <thead>
          <tr>
            <th class="corner" scope="col">×</th>
            ${head}
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  }

  function openMultTable() {
    if (state.multTableOpen) return;
    if (state.helpOpen) {
      closeHelp();
    }
    if (state.referencesOpen) {
      closeReferences();
    }
    buildMultiplicationTable();
    state.multTableOpen = true;
    els.multTableOverlay.hidden = false;
    updateModalBodyLock();
  }

  function closeMultTable() {
    if (!state.multTableOpen) return;
    state.multTableOpen = false;
    els.multTableOverlay.hidden = true;
    updateModalBodyLock();
  }

  function openHelp() {
    if (state.helpOpen) return;
    if (state.multTableOpen) {
      closeMultTable();
    }
    if (state.referencesOpen) {
      closeReferences();
    }
    state.helpOpen = true;
    els.helpOverlay.hidden = false;
    updateModalBodyLock();
  }

  function closeHelp() {
    if (!state.helpOpen) return;
    state.helpOpen = false;
    els.helpOverlay.hidden = true;
    updateModalBodyLock();
  }

  function openReferences() {
    if (state.referencesOpen) return;
    if (state.multTableOpen) {
      closeMultTable();
    }
    if (state.helpOpen) {
      closeHelp();
    }
    state.referencesOpen = true;
    els.referencesOverlay.hidden = false;
    updateModalBodyLock();
  }

  function closeReferences() {
    if (!state.referencesOpen) return;
    state.referencesOpen = false;
    els.referencesOverlay.hidden = true;
    updateModalBodyLock();
  }

  function handleGlobalKeydown(event) {
    if (event.key !== 'Escape') return;
    if (state.referencesOpen) {
      closeReferences();
      return;
    }
    if (state.helpOpen) {
      closeHelp();
      return;
    }
    if (state.multTableOpen) {
      closeMultTable();
    }
  }

  function applyPanelLayout() {
    document.body.classList.toggle('controls-collapsed', state.controlsCollapsed);
    document.body.classList.toggle('code-collapsed', state.codeCollapsed);
    updatePanelToggleButtons();
    scheduleNormalizePanelWidths();
  }

  function updateExecutionControlsDisabled() {
    const disabled = state.activeTab === 'comparison';
    els.runStepBtn.disabled = disabled;
    els.autoRunBtn.disabled = disabled;
    els.runFullBtn.disabled = disabled;
    els.speedSelect.disabled = disabled;
    els.resetBtn.disabled = disabled;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function parsePx(rawValue, fallback = 0) {
    const parsed = Number.parseFloat(String(rawValue || '').trim());
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function getCssVarPx(name, fallback = 0) {
    return parsePx(getComputedStyle(document.documentElement).getPropertyValue(name), fallback);
  }

  function setCssVarPx(name, value) {
    const rounded = Math.round(Number(value) || 0);
    document.documentElement.style.setProperty(name, `${rounded}px`);
  }

  function getColumnGapPx(element) {
    if (!element) return 0;
    const styles = getComputedStyle(element);
    return parsePx(styles.columnGap || styles.gap, 0);
  }

  function isDesktopLayout() {
    return !window.matchMedia('(max-width: 1200px)').matches;
  }

  function getMainWidthBounds() {
    const container = els.mainLayout;
    if (!container) return null;
    const rect = container.getBoundingClientRect();
    const splitterSize = getCssVarPx('--splitter-size', 10);
    const gap = getColumnGapPx(container);
    const min = getCssVarPx('--controls-panel-min', 290);
    const maxPreferred = getCssVarPx('--controls-panel-max', 540);
    const rightMin = getCssVarPx('--main-panel-min', 560);
    const availableForControls = rect.width - splitterSize - (2 * gap) - rightMin;
    const max = Math.max(min, Math.min(maxPreferred, availableForControls));
    return { rect, splitterSize, min, max };
  }

  function getContentWidthBounds() {
    const container = els.contentGrid;
    if (!container) return null;
    const rect = container.getBoundingClientRect();
    const splitterSize = getCssVarPx('--splitter-size', 10);
    const gap = getColumnGapPx(container);
    const min = getCssVarPx('--code-panel-min', 360);
    const maxPreferred = getCssVarPx('--code-panel-max', 700);
    const leftMin = getCssVarPx('--visual-panel-min', 280);
    const availableForCode = rect.width - splitterSize - (2 * gap) - leftMin;
    const max = Math.max(min, Math.min(maxPreferred, availableForCode));
    return { rect, splitterSize, min, max };
  }

  function normalizePanelWidths() {
    if (!isDesktopLayout()) {
      return;
    }

    if (!state.controlsCollapsed) {
      const bounds = getMainWidthBounds();
      if (bounds) {
        const current = getCssVarPx('--controls-panel-width', 340);
        setCssVarPx('--controls-panel-width', clamp(current, bounds.min, bounds.max));
      }
    }

    if (!state.codeCollapsed) {
      const bounds = getContentWidthBounds();
      if (bounds) {
        const current = getCssVarPx('--code-panel-width', 520);
        setCssVarPx('--code-panel-width', clamp(current, bounds.min, bounds.max));
      }
    }
  }

  function scheduleNormalizePanelWidths() {
    if (normalizeRaf !== null) {
      cancelAnimationFrame(normalizeRaf);
    }
    normalizeRaf = requestAnimationFrame(() => {
      normalizeRaf = null;
      normalizePanelWidths();
    });
  }

  function stopResizeSession() {
    if (!resizeState.mode) return;
    if (resizeState.splitterEl) {
      resizeState.splitterEl.classList.remove('active');
    }
    document.body.classList.remove('resizing');
    resizeState.mode = null;
    resizeState.pointerId = null;
    resizeState.splitterEl = null;
    resizeState.containerRect = null;
    resizeState.splitterSize = 0;
    resizeState.min = 0;
    resizeState.max = 0;
    document.removeEventListener('pointermove', handleResizeMove);
    document.removeEventListener('pointerup', stopResizeSession);
    document.removeEventListener('pointercancel', stopResizeSession);
  }

  function startResizeSession(mode, event) {
    if ((event.button !== undefined && event.button !== 0) || !isDesktopLayout()) {
      return;
    }
    if ((mode === 'main' && state.controlsCollapsed) || (mode === 'content' && state.codeCollapsed)) {
      return;
    }

    const splitterEl = mode === 'main' ? els.mainSplitter : els.contentSplitter;
    const bounds = mode === 'main' ? getMainWidthBounds() : getContentWidthBounds();
    if (!splitterEl || !bounds) return;

    resizeState.mode = mode;
    resizeState.pointerId = event.pointerId;
    resizeState.splitterEl = splitterEl;
    resizeState.containerRect = bounds.rect;
    resizeState.splitterSize = bounds.splitterSize;
    resizeState.min = bounds.min;
    resizeState.max = bounds.max;

    splitterEl.classList.add('active');
    document.body.classList.add('resizing');
    if (event.pointerId !== undefined && splitterEl.setPointerCapture) {
      try {
        splitterEl.setPointerCapture(event.pointerId);
      } catch (error) {
        // Ignore unsupported capture scenarios.
      }
    }
    document.addEventListener('pointermove', handleResizeMove);
    document.addEventListener('pointerup', stopResizeSession);
    document.addEventListener('pointercancel', stopResizeSession);
    event.preventDefault();
  }

  function handleResizeMove(event) {
    if (!resizeState.mode || !resizeState.containerRect) return;
    if (resizeState.pointerId !== null && event.pointerId !== resizeState.pointerId) {
      return;
    }

    const halfSplitter = resizeState.splitterSize / 2;
    if (resizeState.mode === 'main') {
      const raw = event.clientX - resizeState.containerRect.left - halfSplitter;
      setCssVarPx('--controls-panel-width', clamp(raw, resizeState.min, resizeState.max));
      return;
    }

    const raw = resizeState.containerRect.right - event.clientX - halfSplitter;
    setCssVarPx('--code-panel-width', clamp(raw, resizeState.min, resizeState.max));
  }

  function switchTab(tab) {
    stopAutoRun();
    state.activeTab = tab;

    const isClassroom = tab === 'classroom';
    const isKaratsuba = tab === 'karatsuba';
    const isComparison = tab === 'comparison';
    els.tabClassroom.classList.toggle('active', isClassroom);
    els.tabKaratsuba.classList.toggle('active', isKaratsuba);
    els.tabComparison.classList.toggle('active', isComparison);
    els.tabClassroom.setAttribute('aria-selected', String(isClassroom));
    els.tabKaratsuba.setAttribute('aria-selected', String(isKaratsuba));
    els.tabComparison.setAttribute('aria-selected', String(isComparison));
    els.panelClassroom.classList.toggle('active', isClassroom);
    els.panelKaratsuba.classList.toggle('active', isKaratsuba);
    els.panelComparison.classList.toggle('active', isComparison);
    updateExecutionControlsDisabled();

    renderAll();
  }

  function getActiveExecution() {
    return state.executions[state.activeTab];
  }

  function getCurrentStep(execution, tabName) {
    const idx = state.stepIndex[tabName];
    if (!execution || idx <= 0) return null;
    return execution.steps[idx - 1] || null;
  }

  function randomNumberOfLength(length) {
    let s = String(Math.floor(Math.random() * 9) + 1);
    for (let i = 1; i < length; i += 1) {
      s += String(Math.floor(Math.random() * 10));
    }
    return s;
  }

  function sanitizeRandomLength() {
    const parsed = Number.parseInt(String(els.randomLength.value || '').replace(/\D+/g, ''), 10);
    const fallback = 4;
    if (!Number.isFinite(parsed) || parsed < 1) {
      els.randomLength.value = String(fallback);
      return fallback;
    }
    const clamped = Math.min(512, parsed);
    els.randomLength.value = String(clamped);
    return clamped;
  }

  function fillRandomInputs() {
    const len = sanitizeRandomLength();
    els.inputX.value = randomNumberOfLength(len);
    els.inputY.value = randomNumberOfLength(len);
    prepareFromInputs();
  }

  function prepareFromInputs() {
    stopAutoRun();
    sanitizeInput(els.inputX);
    sanitizeInput(els.inputY);

    const prepared = KaratsubaAlgorithms.prepareNumbers(els.inputX.value, els.inputY.value);
    if (!prepared) {
      setStatus('status_invalid');
      return;
    }

    state.prepared = prepared;
    state.executions.classroom = KaratsubaAlgorithms.buildClassroomExecution(prepared);
    state.executions.karatsuba = KaratsubaAlgorithms.buildKaratsubaExecution(prepared);
    state.stepIndex.classroom = 0;
    state.stepIndex.karatsuba = 0;

    if (prepared.changed) {
      setPaddingMessage('padding_changed', {
        n: prepared.n,
        x: prepared.x,
        y: prepared.y
      });
    } else {
      setPaddingMessage('padding_no_change', { n: prepared.n });
    }

    setStatus('status_ready');
    renderAll();
  }

  function resetActiveSteps() {
    stopAutoRun();
    if (!state.executions[state.activeTab]) {
      prepareFromInputs();
      return;
    }
    state.stepIndex[state.activeTab] = 0;
    setStatus('status_reset');
    renderAll();
  }

  function runOneStep() {
    const execution = getActiveExecution();
    if (!execution) {
      prepareFromInputs();
      return false;
    }

    const idx = state.stepIndex[state.activeTab];
    if (idx >= execution.steps.length) {
      setStatus('status_finished');
      return false;
    }

    state.stepIndex[state.activeTab] += 1;
    const step = execution.steps[state.stepIndex[state.activeTab] - 1];
    setStatus(step.messageKey, step.messageParams || {});

    renderAll();

    if (state.stepIndex[state.activeTab] >= execution.steps.length) {
      setStatus('status_finished');
      return false;
    }
    return true;
  }

  function runFullExecution() {
    const execution = getActiveExecution();
    if (!execution) {
      prepareFromInputs();
      return;
    }

    stopAutoRun();
    state.stepIndex[state.activeTab] = execution.steps.length;
    setStatus('status_full');
    renderAll();
  }

  function stopAutoRun(withStatus = false) {
    if (state.autoTimer) {
      clearInterval(state.autoTimer);
      state.autoTimer = null;
      if (withStatus) {
        setStatus('status_paused');
      }
      renderAll();
    }
  }

  function getIntervalMs() {
    const speed = Number(els.speedSelect.value || '1');
    return Math.max(70, Math.floor(850 / speed));
  }

  function toggleAutoRun() {
    const execution = getActiveExecution();
    if (!execution) {
      prepareFromInputs();
      return;
    }

    if (state.autoTimer) {
      stopAutoRun(true);
      return;
    }

    if (state.stepIndex[state.activeTab] >= execution.steps.length) {
      return;
    }

    setStatus('status_running');
    state.autoTimer = setInterval(() => {
      const running = runOneStep();
      if (!running) {
        stopAutoRun(false);
      }
    }, getIntervalMs());
    renderAll();
  }

  function toggleControlsPanel() {
    stopResizeSession();
    state.controlsCollapsed = !state.controlsCollapsed;
    applyPanelLayout();
  }

  function toggleCodePanel() {
    stopResizeSession();
    state.codeCollapsed = !state.codeCollapsed;
    applyPanelLayout();
  }

  function digitKindForPosition(idx, half, upperKinds, forKaratsuba) {
    if (!forKaratsuba) {
      return upperKinds ? 'kind-a' : 'kind-c';
    }
    return upperKinds ? (idx < half ? 'kind-a' : 'kind-b') : (idx < half ? 'kind-c' : 'kind-d');
  }

  function buildDigitRow(label, value, opts = {}) {
    const width = opts.width || value.length;
    const forKaratsuba = Boolean(opts.forKaratsuba);
    const upperKinds = opts.upperKinds !== undefined ? opts.upperKinds : true;
    const half = opts.half !== undefined ? opts.half : Math.floor(width / 2);
    const mini = Boolean(opts.mini);
    const rowClass = opts.rowClass || '';
    const cellClass = opts.cellClass || '';
    const labelText = label || '';
    const suffixHtml = opts.suffixHtml || '';
    const padded = String(value).padStart(width, ' ');

    const cells = padded
      .split('')
      .map((ch, idx) => {
        if (ch === ' ') {
          return `<span class="digit-cell ${mini ? 'mini' : ''} ${cellClass} empty" aria-hidden="true"></span>`;
        }
        const kind = digitKindForPosition(idx, half, upperKinds, forKaratsuba);
        return `<span class="digit-cell ${mini ? 'mini' : ''} ${cellClass} ${kind}">${ch}</span>`;
      })
      .join('');

    return `<div class="digit-row ${rowClass}"><span class="digit-label">${labelText}</span><div class="digit-cells">${cells}</div>${suffixHtml}</div>`;
  }

  function buildMultiplicationGrid(x, y, opts = {}) {
    const valueX = String(x);
    const valueY = String(y);
    const width = opts.width || Math.max(valueX.length, valueY.length);
    const half = opts.half !== undefined ? opts.half : Math.floor(width / 2);
    const wrapClass = opts.wrapClass || '';
    const mini = Boolean(opts.mini);
    const forKaratsuba = Boolean(opts.forKaratsuba);
    const xLabel = opts.xLabel || 'x';
    const yLabel = opts.yLabel || 'y';

    return `
      <div class="digits-wrap ${wrapClass}">
        ${buildDigitRow(xLabel, valueX, { width, forKaratsuba, upperKinds: true, half, mini })}
        ${buildDigitRow(yLabel, valueY, { width, forKaratsuba, upperKinds: false, half, mini })}
      </div>
    `;
  }

  function buildDroppedChip(product) {
    const [dx = '', dy = ''] = String(product).split('×');
    const width = Math.max(dx.length, dy.length, 1);
    const half = Math.floor(width / 2);
    return `
      <span class="drop-chip drop-strike">
        ${buildMultiplicationGrid(dx, dy, {
          width,
          half,
          forKaratsuba: true,
          mini: true,
          xLabel: 'x',
          yLabel: '× y',
          wrapClass: 'drop-grid'
        })}
      </span>
    `;
  }

  function buildResultGrid(value, mini = true) {
    const text = String(value || '');
    const digits = text
      .split('')
      .map((ch) => `<span class="digit-cell ${mini ? 'mini' : ''} result">${ch}</span>`)
      .join('');
    return `<span class="result-grid">${digits}</span>`;
  }

  function buildDepthIndex(current, total) {
    const safeCurrent = Math.max(0, Number(current) || 0);
    const safeTotal = Math.max(safeCurrent, Number(total) || 0);
    return `
      <div class="depth-index">
        <span>${t('derivation_depth_label')}</span>
        <strong>${t('derivation_depth_value', { current: safeCurrent, total: safeTotal })}</strong>
      </div>
    `;
  }

  function isAnswer42(value) {
    return KaratsubaAlgorithms.trimLeadingZeros(value) === '42';
  }

  function buildNodeReturnEquation(node, done) {
    if (!done || !node.result) {
      return `<div class="node-return pending"><span class="eq-line">${t('node_return_pending')}</span></div>`;
    }

    if (node.leaf) {
      return `
        <div class="node-return">
          <span class="eq-line">${t('node_return_base', {
            x: KaratsubaAlgorithms.trimLeadingZeros(node.x),
            y: KaratsubaAlgorithms.trimLeadingZeros(node.y),
            result: node.result
          })}</span>
        </div>
      `;
    }

    const combine = node.combine;
    if (!combine) {
      return `<div class="node-return"><span class="eq-line">result = ${node.result}</span></div>`;
    }

    return `
      <div class="node-return">
        <span class="eq-line">${t('node_middle_line', {
          pq: combine.pq,
          ac: combine.ac,
          bd: combine.bd,
          middle: combine.middle
        })}</span>
        <span class="eq-line">${t('node_return_line', {
          ac: combine.ac,
          pow: 2 * combine.m,
          middle: combine.middle,
          m: combine.m,
          bd: combine.bd,
          result: node.result
        })}</span>
      </div>
    `;
  }

  function renderDigits(target, x, y, forKaratsuba) {
    const width = Math.max(String(x).length, String(y).length);
    const half = Math.floor(width / 2);
    target.innerHTML = buildMultiplicationGrid(x, y, {
      width,
      half,
      forKaratsuba,
      mini: false,
      xLabel: 'x',
      yLabel: 'y'
    });
  }

  function renderPowers(target, execution) {
    target.innerHTML = `
      <div class="formula-lines">
        <span>${t('power_x', { expr: execution.powers.x })}</span>
        <span>${t('power_y', { expr: execution.powers.y })}</span>
        <span>${t('power_product')}</span>
      </div>
    `;
  }

  function renderClassroom() {
    const execution = state.executions.classroom;
    if (!execution) {
      els.classroomDigits.innerHTML = '';
      els.classroomPowers.innerHTML = '';
      els.classroomDerivation.innerHTML = '';
      return;
    }

    renderDigits(els.classroomDigits, execution.x, execution.y, false);
    renderPowers(els.classroomPowers, execution);

    const currentStep = getCurrentStep(execution, 'classroom');
    const rowDisplays = currentStep && Array.isArray(currentStep.rowDisplays) ? currentStep.rowDisplays : [];
    const carryDisplays = currentStep && Array.isArray(currentStep.carryDisplays) ? currentStep.carryDisplays : [];
    const highlightPartial = currentStep ? currentStep.highlightPartial : -1;
    const showTotal = currentStep ? currentStep.showTotal : false;
    const hasDigits = (text) => /[0-9]/.test(String(text || ''));
    const hideShiftPaddingZeros = (display, shift) => {
      const text = String(display || '');
      const amount = Math.max(0, Number(shift) || 0);
      if (!amount || text.length < amount) {
        return text;
      }
      return `${text.slice(0, text.length - amount)}${' '.repeat(amount)}`;
    };
    const computeGridDepth = (rowsNow, carriesNow, withTotal) => {
      let depth = 2;
      for (let i = 0; i < rowsNow.length; i += 1) {
        if (!rowsNow[i] || !hasDigits(rowsNow[i])) {
          continue;
        }
        if (carriesNow[i] && hasDigits(carriesNow[i])) {
          depth += 1;
        }
        depth += 1;
      }
      if (withTotal) {
        depth += 1;
      }
      return depth;
    };

    const currentDepth = computeGridDepth(rowDisplays, carryDisplays, showTotal);
    const finalStep = execution.steps[execution.steps.length - 1] || null;
    const totalDepth = finalStep
      ? computeGridDepth(finalStep.rowDisplays || [], finalStep.carryDisplays || [], Boolean(finalStep.showTotal))
      : currentDepth;

    const values = [execution.x, execution.y];
    for (let i = 0; i < rowDisplays.length; i += 1) {
      if (rowDisplays[i]) {
        values.push(rowDisplays[i]);
      }
      if (carryDisplays[i]) {
        values.push(carryDisplays[i]);
      }
    }
    if (showTotal) {
      values.push(execution.result);
    }
    const width = Math.max(...values.map((v) => String(v).length));

    const rows = [];
    rows.push(
      buildDigitRow(t('class_row_label_x'), execution.x, {
        width,
        forKaratsuba: false,
        upperKinds: true,
        mini: true,
        rowClass: 'derivation-grid-row'
      })
    );
    rows.push(
      buildDigitRow(`× ${t('class_row_label_y')}`, execution.y, {
        width,
        forKaratsuba: false,
        upperKinds: false,
        mini: true,
        rowClass: 'derivation-grid-row'
      })
    );
    rows.push('<div class="derivation-grid-sep"></div>');

    for (let i = 0; i < rowDisplays.length; i += 1) {
      const p = execution.partials[i];
      const display = rowDisplays[i];
      if (!display || !hasDigits(display)) {
        continue;
      }
      const displayForGrid = hideShiftPaddingZeros(display, p.shift);
      const carryDisplay = carryDisplays[i];
      const rowClass = i === highlightPartial ? 'derivation-grid-row active' : 'derivation-grid-row';
      if (carryDisplay && hasDigits(carryDisplay)) {
        const carryRowClass = i === highlightPartial ? 'derivation-grid-row carry active' : 'derivation-grid-row carry';
        rows.push(
          buildDigitRow(t('class_row_carry'), carryDisplay, {
            width,
            forKaratsuba: false,
            upperKinds: true,
            mini: true,
            rowClass: carryRowClass,
            cellClass: 'carry'
          })
        );
      }
      rows.push(
        buildDigitRow(t('class_row_partial', { digit: p.digit }), displayForGrid, {
          width,
          forKaratsuba: false,
          upperKinds: i % 2 === 0,
          mini: true,
          rowClass
        })
      );
    }

    if (showTotal) {
      rows.push('<div class="derivation-grid-sep total"></div>');
      const resultEgg = isAnswer42(execution.result)
        ? `<span class="answer-egg">${t('answer_egg_text')}</span>`
        : '';
      rows.push(
        buildDigitRow(t('class_row_result'), execution.result, {
          width,
          forKaratsuba: false,
          upperKinds: true,
          mini: true,
          rowClass: 'derivation-grid-row total',
          cellClass: 'result',
          suffixHtml: resultEgg
        })
      );
    }

    els.classroomDerivation.innerHTML = `${buildDepthIndex(currentDepth, totalDepth)}<div class="derivation-grid-wrap">${rows.join('')}</div>`;
  }

  function renderKaratsubaIdentity() {
    els.karatsubaIdentity.innerHTML = `
      <div class="formula-lines">
        <span>(a·10^m + b)(c·10^m + d)</span>
        <span>= ac·10^(2m) + ((a+b)(c+d)-ac-bd)·10^m + bd</span>
      </div>
    `;
  }

  function nodeKindOrder(kind) {
    if (kind === 'root') return 0;
    if (kind === 'ac') return 1;
    if (kind === 'bd') return 2;
    if (kind === 'pq') return 3;
    return 9;
  }

  function renderKaratsuba() {
    const execution = state.executions.karatsuba;
    if (!execution) {
      els.karatsubaDigits.innerHTML = '';
      els.karatsubaPowers.innerHTML = '';
      els.karatsubaTree.innerHTML = '';
      els.karatsubaIdentity.innerHTML = '';
      return;
    }

    renderDigits(els.karatsubaDigits, execution.x, execution.y, true);
    renderPowers(els.karatsubaPowers, execution);
    renderKaratsubaIdentity();

    const currentStep = getCurrentStep(execution, 'karatsuba');
    const activeNodeId = currentStep ? currentStep.activeNodeId : null;
    const completed = new Set(currentStep ? currentStep.completedNodeIds : []);
    const totalLevels = execution.nodes.reduce((maxDepth, node) => Math.max(maxDepth, (node.depth || 0) + 1), 0);

    const executedSteps = execution.steps.slice(0, state.stepIndex.karatsuba);
    const nodeById = new Map(execution.nodes.map((node) => [node.id, node]));
    const visibleNodeIds = new Set();
    const droppedNodeIds = new Set();

    for (const step of executedSteps) {
      if (step.activeNodeId !== null && step.activeNodeId !== undefined) {
        visibleNodeIds.add(step.activeNodeId);
      }
      if (
        step.messageKey === 'step_kar_drop' &&
        step.activeNodeId !== null &&
        step.activeNodeId !== undefined
      ) {
        droppedNodeIds.add(step.activeNodeId);
      }
    }

    // Keep parent/child context continuous when a deeper recursive node appears.
    const pendingAncestors = Array.from(visibleNodeIds);
    while (pendingAncestors.length) {
      const currentId = pendingAncestors.pop();
      const node = nodeById.get(currentId);
      if (!node || node.parentId === null || node.parentId === undefined) {
        continue;
      }
      if (!visibleNodeIds.has(node.parentId)) {
        visibleNodeIds.add(node.parentId);
        pendingAncestors.push(node.parentId);
      }
    }

    const visibleNodes = execution.nodes.filter((node) => visibleNodeIds.has(node.id));

    if (!visibleNodes.length) {
      els.karatsubaTree.innerHTML = `
        ${buildDepthIndex(0, totalLevels)}
        <div class="formula-lines"><span>${t('tree_waiting')}</span></div>
      `;
    } else {
      const visibleNodeSet = new Set(visibleNodes.map((node) => node.id));
      const childrenByParent = new Map();
      for (const node of visibleNodes) {
        const pid = node.parentId ?? '__root__';
        if (!childrenByParent.has(pid)) {
          childrenByParent.set(pid, []);
        }
        childrenByParent.get(pid).push(node);
      }
      for (const list of childrenByParent.values()) {
        list.sort((a, b) => nodeKindOrder(a.kind) - nodeKindOrder(b.kind) || a.id - b.id);
      }

      const rootNodes = visibleNodes
        .filter((node) => node.parentId === null || !visibleNodeSet.has(node.parentId))
        .sort((a, b) => nodeKindOrder(a.kind) - nodeKindOrder(b.kind) || a.id - b.id);

      const renderBranch = (node) => {
          const activeClass = node.id === activeNodeId ? 'active' : '';
          const done = completed.has(node.id);
          const resultHtml = done && node.result ? buildResultGrid(node.result, true) : '<span class="result-pending">...</span>';
          const answerEgg = done && node.kind === 'root' && node.result && isAnswer42(node.result)
            ? `<span class="answer-egg">${t('answer_egg_text')}</span>`
            : '';
          const returnEqHtml = buildNodeReturnEquation(node, done);
          const showDrops = node.dropped.length > 0 && droppedNodeIds.has(node.id);
          const drops = showDrops
            ? `
              <div class="node-drop">
                <span class="drop-caption">${t('node_drop_label')}</span>
                <div class="dropped-line">${node.dropped
                  .map((p) => buildDroppedChip(p))
                  .join('')}</div>
              </div>
            `
            : '';

          const nodeGrid = buildMultiplicationGrid(node.x, node.y, {
            width: node.n,
            half: Math.floor(node.n / 2),
            forKaratsuba: true,
            mini: true,
            xLabel: 'x',
            yLabel: '× y',
            wrapClass: 'node-main-grid'
          });

          const children = childrenByParent.get(node.id) || [];
          const childrenHtml = children.length
            ? `<div class="tree-children">${children.map((child) => renderBranch(child)).join('')}</div>`
            : '';

          return `
            <div class="tree-branch branch-kind-${node.kind}">
              <div class="tree-node ${activeClass}">
              <div class="tree-node-header">
                ${nodeGrid}
                <span class="node-meta">
                  <span>${node.kind}:</span>
                  ${resultHtml}
                  ${answerEgg}
                </span>
              </div>
              ${returnEqHtml}
              ${drops}
            </div>
              ${childrenHtml}
            </div>
          `;
      };

      const currentLevels = visibleNodes.reduce((maxDepth, node) => Math.max(maxDepth, (node.depth || 0) + 1), 0);
      const treeHtml = rootNodes.map((node) => renderBranch(node)).join('');
      els.karatsubaTree.innerHTML = `${buildDepthIndex(currentLevels, totalLevels)}<div class="tree-hierarchy">${treeHtml}</div>`;
    }
  }

  function randomNumberOfExactLength(length) {
    const safeLength = Math.max(1, Number(length) || 1);
    let out = String(Math.floor(Math.random() * 9) + 1);
    for (let i = 1; i < safeLength; i += 1) {
      out += String(Math.floor(Math.random() * 10));
    }
    return out;
  }

  function resetComparisonSamples() {
    state.comparison.samples = state.comparison.lengths.map((length) => ({
      length,
      count: 0,
      classroom: {
        mul: 0,
        add: 0,
        total: 0
      },
      karatsuba: {
        mul: 0,
        add: 0,
        total: 0
      }
    }));
  }

  function getComparisonRows() {
    return state.comparison.samples.map((sample) => {
      const count = Math.max(0, sample.count);
      const avg = (value) => (count > 0 ? value / count : null);
      return {
        length: sample.length,
        count,
        classroom: {
          total: avg(sample.classroom.total),
          mul: avg(sample.classroom.mul),
          add: avg(sample.classroom.add)
        },
        karatsuba: {
          total: avg(sample.karatsuba.total),
          mul: avg(sample.karatsuba.mul),
          add: avg(sample.karatsuba.add)
        }
      };
    });
  }

  function formatComparisonValue(value) {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return '–';
    }
    return Number(value).toFixed(2);
  }

  function renderComparisonProgress() {
    if (!els.comparisonProgress) return;
    const { running, progressDone, progressTotal } = state.comparison;
    let key = 'comparison_progress_idle';
    if (running) {
      key = 'comparison_progress_running';
    } else if (progressDone > 0 && progressDone < progressTotal) {
      key = 'comparison_progress_stopped';
    } else if (progressDone > 0) {
      key = 'comparison_progress_done';
    }
    els.comparisonProgress.textContent = t(key, {
      done: progressDone,
      total: progressTotal
    });
  }

  function renderComparisonTable() {
    if (!els.comparisonTable) return;
    const rows = getComparisonRows();
    const bodyRows = rows
      .map((row) => `
        <tr>
          <td>${row.length}</td>
          <td>${formatComparisonValue(row.classroom.total)}</td>
          <td>${formatComparisonValue(row.classroom.mul)}</td>
          <td>${formatComparisonValue(row.classroom.add)}</td>
          <td>${formatComparisonValue(row.karatsuba.total)}</td>
          <td>${formatComparisonValue(row.karatsuba.mul)}</td>
          <td>${formatComparisonValue(row.karatsuba.add)}</td>
        </tr>
      `)
      .join('');

    els.comparisonTable.innerHTML = `
      <thead>
        <tr>
          <th rowspan="2">${t('comparison_table_col_len')}</th>
          <th colspan="3" class="class-head">${t('tab_classroom')}</th>
          <th colspan="3" class="kara-head">${t('tab_karatsuba')}</th>
        </tr>
        <tr>
          <th>${t('comparison_table_col_total')}</th>
          <th>${t('comparison_table_col_mul')}</th>
          <th>${t('comparison_table_col_add')}</th>
          <th>${t('comparison_table_col_total')}</th>
          <th>${t('comparison_table_col_mul')}</th>
          <th>${t('comparison_table_col_add')}</th>
        </tr>
      </thead>
      <tbody>
        ${bodyRows}
      </tbody>
    `;
  }

  function renderComparisonTooltip() {
    if (!els.comparisonChartTooltip) return;
    const tip = state.comparison.tooltip;
    if (!tip) {
      els.comparisonChartTooltip.hidden = true;
      return;
    }

    els.comparisonChartTooltip.hidden = false;
    els.comparisonChartTooltip.innerHTML = `
      <strong>${escapeHtml(tip.seriesLabel)}</strong><br>
      ${escapeHtml(t('comparison_tip_length', { length: tip.length }))}<br>
      ${escapeHtml(t('comparison_tip_value', { value: tip.value }))}
    `;
    els.comparisonChartTooltip.style.left = `${tip.x}px`;
    els.comparisonChartTooltip.style.top = `${tip.y}px`;
  }

  function clearComparisonTooltip() {
    state.comparison.tooltip = null;
    renderComparisonTooltip();
  }

  function setComparisonTooltipFromPoint(target) {
    if (!els.comparisonChartArea || !els.comparisonChartSvg) return;
    const seriesLabel = target.getAttribute('data-series-label') || '';
    const length = target.getAttribute('data-length') || '';
    const value = target.getAttribute('data-value') || '';
    const cx = Number(target.getAttribute('cx') || 0);
    const cy = Number(target.getAttribute('cy') || 0);

    const viewBox = els.comparisonChartSvg.viewBox.baseVal;
    const svgRect = els.comparisonChartSvg.getBoundingClientRect();
    const areaRect = els.comparisonChartArea.getBoundingClientRect();
    const x = (cx / Math.max(1, viewBox.width)) * svgRect.width + (svgRect.left - areaRect.left);
    const y = (cy / Math.max(1, viewBox.height)) * svgRect.height + (svgRect.top - areaRect.top);

    state.comparison.tooltip = {
      seriesLabel,
      length,
      value,
      x: Math.max(28, Math.min(areaRect.width - 28, x)),
      y: Math.max(26, Math.min(areaRect.height - 12, y))
    };
    renderComparisonTooltip();
  }

  function applyComparisonSeriesFocus(activeKey) {
    if (!els.comparisonChartSvg) return;
    const targetKey = activeKey || null;
    if (state.comparison.activeSeriesKey === targetKey) {
      return;
    }
    state.comparison.activeSeriesKey = targetKey;

    const nodes = els.comparisonChartSvg.querySelectorAll('[data-series-key]');
    nodes.forEach((node) => {
      const key = node.getAttribute('data-series-key');
      const baseOpacity = Number(node.getAttribute('data-base-opacity') || '1');
      let opacity = baseOpacity;
      if (targetKey && key !== targetKey) {
        opacity = Math.max(0.13, baseOpacity * 0.22);
      }
      node.style.opacity = String(opacity);
      if (node.classList.contains('chart-series')) {
        const baseWidth = Number(node.getAttribute('data-base-width') || '2');
        node.style.strokeWidth = `${targetKey && key === targetKey ? baseWidth + 0.85 : baseWidth}`;
      }
      if (node.classList.contains('chart-point')) {
        const baseRadius = Number(node.getAttribute('data-base-radius') || '2.2');
        node.setAttribute('r', String(targetKey && key === targetKey ? baseRadius + 1 : baseRadius));
      }
    });
  }

  function sanitizeComparisonXAxis() {
    const available = state.comparison.lengths;
    const raw = Number.parseInt(String(els.comparisonXMax.value || ''), 10);
    if (!Number.isFinite(raw)) {
      state.comparison.xMaxLength = available[available.length - 1];
      els.comparisonXMax.value = String(state.comparison.xMaxLength);
      return;
    }
    const picked = available.includes(raw) ? raw : available[available.length - 1];
    state.comparison.xMaxLength = picked;
    els.comparisonXMax.value = String(picked);
  }

  function sanitizeComparisonYZoom() {
    const raw = Number.parseFloat(String(els.comparisonYZoom.value || '1'));
    const zoom = Number.isFinite(raw) ? Math.min(8, Math.max(1, raw)) : 1;
    state.comparison.yZoom = zoom;
    els.comparisonYZoom.value = String(zoom);
  }

  function renderComparisonChart() {
    if (!els.comparisonChartSvg) return;

    const widths = els.comparisonChartSvg.getBoundingClientRect();
    const svgW = Math.max(780, Math.round(widths.width) || 880);
    const svgH = 330;
    const margin = { top: 68, right: 16, bottom: 46, left: 58 };
    const chartW = Math.max(120, svgW - margin.left - margin.right);
    const chartH = Math.max(80, svgH - margin.top - margin.bottom);

    const allRows = getComparisonRows();
    const allLengths = state.comparison.lengths.slice();
    const visibleIndices = [];
    for (let i = 0; i < allLengths.length; i += 1) {
      if (allLengths[i] <= state.comparison.xMaxLength) {
        visibleIndices.push(i);
      }
    }
    if (!visibleIndices.length) {
      visibleIndices.push(0);
    }

    const rows = visibleIndices.map((idx) => allRows[idx]);
    const lengths = visibleIndices.map((idx) => allLengths[idx]);

    const classroomColor = 'var(--compare-classroom)';
    const karatsubaColor = 'var(--compare-karatsuba)';

    const styleByMetric = {
      total: { dash: '', width: 2.5 },
      mul: { dash: '7 5', width: 2.05 },
      add: { dash: '2 5', width: 1.95 }
    };

    const dataByKey = {
      class_total: rows.map((r) => r.classroom.total),
      class_mul: rows.map((r) => r.classroom.mul),
      class_add: rows.map((r) => r.classroom.add),
      kara_total: rows.map((r) => r.karatsuba.total),
      kara_mul: rows.map((r) => r.karatsuba.mul),
      kara_add: rows.map((r) => r.karatsuba.add),
      theory_n2: lengths.map((n) => n * n),
      theory_n158: lengths.map((n) => Math.pow(n, 1.58))
    };

    const series = [];
    const { toggles } = state.comparison;
    if (toggles.classroom) {
      if (toggles.total) {
        series.push({
          key: 'class_total',
          label: t('comparison_series_class_total'),
          color: classroomColor,
          dash: styleByMetric.total.dash,
          width: styleByMetric.total.width
        });
      }
      if (toggles.mul) {
        series.push({
          key: 'class_mul',
          label: t('comparison_series_class_mul'),
          color: classroomColor,
          dash: styleByMetric.mul.dash,
          width: styleByMetric.mul.width
        });
      }
      if (toggles.add) {
        series.push({
          key: 'class_add',
          label: t('comparison_series_class_add'),
          color: classroomColor,
          dash: styleByMetric.add.dash,
          width: styleByMetric.add.width
        });
      }
    }
    if (toggles.karatsuba) {
      if (toggles.total) {
        series.push({
          key: 'kara_total',
          label: t('comparison_series_kara_total'),
          color: karatsubaColor,
          dash: styleByMetric.total.dash,
          width: styleByMetric.total.width
        });
      }
      if (toggles.mul) {
        series.push({
          key: 'kara_mul',
          label: t('comparison_series_kara_mul'),
          color: karatsubaColor,
          dash: styleByMetric.mul.dash,
          width: styleByMetric.mul.width
        });
      }
      if (toggles.add) {
        series.push({
          key: 'kara_add',
          label: t('comparison_series_kara_add'),
          color: karatsubaColor,
          dash: styleByMetric.add.dash,
          width: styleByMetric.add.width
        });
      }
    }
    if (toggles.theoryN2) {
      series.push({
        key: 'theory_n2',
        label: t('comparison_series_theory_n2'),
        color: classroomColor,
        dash: '8 6',
        width: 1.8,
        opacity: 0.6
      });
    }
    if (toggles.theoryN158) {
      series.push({
        key: 'theory_n158',
        label: t('comparison_series_theory_n158'),
        color: karatsubaColor,
        dash: '8 6',
        width: 1.8,
        opacity: 0.6
      });
    }

    const visibleValues = [];
    for (const s of series) {
      const values = dataByKey[s.key] || [];
      for (const v of values) {
        if (v !== null && v !== undefined && Number.isFinite(v)) {
          visibleValues.push(v);
        }
      }
    }
    const maxVal = visibleValues.length ? Math.max(...visibleValues) : 1;
    const yMaxBase = maxVal <= 0 ? 1 : maxVal;
    const yMax = Math.max(1, yMaxBase / Math.max(1, state.comparison.yZoom));

    const xPos = (idx) => {
      if (lengths.length <= 1) return margin.left;
      return margin.left + (idx / (lengths.length - 1)) * chartW;
    };
    const yPos = (value) => {
      const clamped = Math.min(yMax, Math.max(0, value));
      return margin.top + chartH - ((clamped / yMax) * chartH);
    };

    let grid = '';
    const yTicks = 5;
    for (let i = 0; i <= yTicks; i += 1) {
      const value = (yMax * i) / yTicks;
      const y = yPos(value);
      grid += `<line class="chart-grid" x1="${margin.left}" y1="${y}" x2="${margin.left + chartW}" y2="${y}"></line>`;
      grid += `<text class="chart-label" x="${margin.left - 8}" y="${y + 4}" text-anchor="end">${Math.round(value)}</text>`;
    }

    for (let i = 0; i < lengths.length; i += 1) {
      const x = xPos(i);
      grid += `<line class="chart-grid" x1="${x}" y1="${margin.top}" x2="${x}" y2="${margin.top + chartH}"></line>`;
      grid += `<text class="chart-label" x="${x}" y="${margin.top + chartH + 16}" text-anchor="middle">${lengths[i]}</text>`;
    }

    const axis = `
      <line class="chart-axis" x1="${margin.left}" y1="${margin.top + chartH}" x2="${margin.left + chartW}" y2="${margin.top + chartH}"></line>
      <line class="chart-axis" x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${margin.top + chartH}"></line>
      <text class="chart-title" x="${margin.left + chartW / 2}" y="${svgH - 8}" text-anchor="middle">${t('comparison_chart_x')}</text>
      <text class="chart-title" x="13" y="${margin.top + chartH / 2}" text-anchor="middle" transform="rotate(-90 13 ${margin.top + chartH / 2})">${t('comparison_chart_y')}</text>
    `;

    let curves = '';
    const legendItems = [];

    for (const s of series) {
      const vals = dataByKey[s.key] || [];
      const points = [];
      for (let i = 0; i < vals.length; i += 1) {
        const value = vals[i];
        if (value === null || value === undefined || !Number.isFinite(value)) continue;
        points.push({ x: xPos(i), y: yPos(value), value, length: lengths[i] });
      }
      if (!points.length) continue;

      const d = points
        .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
        .join(' ');
      curves += `
        <path
          class="chart-series"
          data-series-key="${s.key}"
          data-base-opacity="${s.opacity || 1}"
          data-base-width="${s.width}"
          d="${d}"
          style="stroke:${s.color};stroke-dasharray:${s.dash};stroke-width:${s.width};opacity:${s.opacity || 1};"></path>
      `;
      curves += points
        .map((p) => `
          <circle
            class="chart-point"
            data-series-key="${s.key}"
            data-series-label="${escapeHtml(s.label)}"
            data-length="${p.length}"
            data-value="${Number(p.value).toFixed(2)}"
            data-base-opacity="${s.opacity || 1}"
            data-base-radius="2.2"
            cx="${p.x}" cy="${p.y}" r="2.2"
            style="fill:${s.color};opacity:${s.opacity || 1};"></circle>
        `)
        .join('');
      legendItems.push(s);
    }

    const legendCols = 3;
    const legendX = margin.left + 6;
    const legendY = 20;
    const legendGapX = 236;
    const legendGapY = 12;
    const legend = legendItems
      .map((item, idx) => {
        const col = idx % legendCols;
        const row = Math.floor(idx / legendCols);
        const x = legendX + (col * legendGapX);
        const y = legendY + (row * legendGapY);
        return `
          <g class="chart-legend-item" data-series-key="${item.key}" data-base-opacity="${item.opacity || 1}">
            <rect class="chart-legend-hit" data-series-key="${item.key}" data-base-opacity="${item.opacity || 1}" x="${x - 3}" y="${y - 11}" width="212" height="13" fill="transparent"></rect>
            <line data-series-key="${item.key}" data-base-opacity="${item.opacity || 1}" x1="${x}" y1="${y - 4}" x2="${x + 16}" y2="${y - 4}" style="stroke:${item.color};stroke-width:${item.width};stroke-dasharray:${item.dash};opacity:${item.opacity || 1};"></line>
            <text class="chart-legend" data-series-key="${item.key}" data-base-opacity="${item.opacity || 1}" x="${x + 21}" y="${y - 1}">${item.label}</text>
          </g>
        `;
      })
      .join('');

    els.comparisonChartSvg.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);
    els.comparisonChartSvg.innerHTML = `
      ${grid}
      ${axis}
      ${curves}
      ${legend}
    `;
    applyComparisonSeriesFocus(state.comparison.activeSeriesKey);
    renderComparisonTooltip();
  }

  function renderComparison() {
    if (!els.comparisonRepeats) return;
    els.comparisonRepeats.value = String(state.comparison.repeats);
    els.comparisonRunBtn.disabled = state.comparison.running;
    els.comparisonStopBtn.disabled = !state.comparison.running;
    els.comparisonShowClassroom.checked = state.comparison.toggles.classroom;
    els.comparisonShowKaratsuba.checked = state.comparison.toggles.karatsuba;
    els.comparisonShowTotal.checked = state.comparison.toggles.total;
    els.comparisonShowMul.checked = state.comparison.toggles.mul;
    els.comparisonShowAdd.checked = state.comparison.toggles.add;
    els.comparisonShowTheoryN2.checked = state.comparison.toggles.theoryN2;
    els.comparisonShowTheoryN158.checked = state.comparison.toggles.theoryN158;
    els.comparisonXMax.value = String(state.comparison.xMaxLength);
    els.comparisonYZoom.value = String(state.comparison.yZoom);
    els.comparisonYZoomValue.textContent = t('comparison_yzoom_value', {
      value: state.comparison.yZoom.toFixed(1)
    });
    renderComparisonProgress();
    renderComparisonTable();
    renderComparisonChart();
  }

  function sanitizeComparisonRepeats() {
    const parsed = Number.parseInt(String(els.comparisonRepeats.value || '').replace(/\D+/g, ''), 10);
    if (!Number.isFinite(parsed) || parsed < 1) {
      state.comparison.repeats = 5;
    } else {
      state.comparison.repeats = Math.min(200, parsed);
    }
    els.comparisonRepeats.value = String(state.comparison.repeats);
  }

  function stopComparisonRun() {
    if (!state.comparison.running) return;
    state.comparison.stopRequested = true;
  }

  function handleComparisonChartPointer(event) {
    if (!els.comparisonChartSvg) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const node = target.closest('[data-series-key]');
    const key = node ? node.getAttribute('data-series-key') : null;
    applyComparisonSeriesFocus(key);
  }

  function handleComparisonChartClick(event) {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const point = target.closest('.chart-point');
    if (!point) {
      clearComparisonTooltip();
      return;
    }
    setComparisonTooltipFromPoint(point);
  }

  async function runComparisonBenchmark() {
    if (state.comparison.running) return;
    sanitizeComparisonRepeats();
    stopAutoRun();

    const repeats = state.comparison.repeats;
    resetComparisonSamples();
    state.comparison.running = true;
    state.comparison.stopRequested = false;
    state.comparison.progressDone = 0;
    state.comparison.progressTotal = repeats * state.comparison.lengths.length;
    state.comparison.tooltip = null;
    state.comparison.activeSeriesKey = null;
    setStatus('status_compare_running');
    renderComparison();

    const samplesByLength = new Map(state.comparison.samples.map((row) => [row.length, row]));
    try {
      for (let rep = 0; rep < repeats; rep += 1) {
        for (const length of state.comparison.lengths) {
          if (state.comparison.stopRequested) {
            break;
          }

          const x = randomNumberOfExactLength(length);
          const y = randomNumberOfExactLength(length);
          const prepared = KaratsubaAlgorithms.prepareNumbers(x, y);
          const classCounts = KaratsubaAlgorithms.countClassroomOperations(prepared);
          const karaCounts = KaratsubaAlgorithms.countKaratsubaOperations(prepared);

          const slot = samplesByLength.get(length);
          slot.count += 1;
          slot.classroom.mul += classCounts.mul;
          slot.classroom.add += classCounts.add;
          slot.classroom.total += classCounts.total;
          slot.karatsuba.mul += karaCounts.mul;
          slot.karatsuba.add += karaCounts.add;
          slot.karatsuba.total += karaCounts.total;

          state.comparison.progressDone += 1;
          renderComparison();
          await new Promise((resolve) => requestAnimationFrame(resolve));
        }
        if (state.comparison.stopRequested) {
          break;
        }
      }
    } finally {
      const wasStopped = state.comparison.stopRequested;
      state.comparison.running = false;
      state.comparison.stopRequested = false;
      if (wasStopped) {
        setStatus('status_compare_stopped');
      } else {
        setStatus('status_compare_done');
      }
      renderComparison();
    }
  }

  function renderCodeAndLog() {
    if (state.activeTab === 'comparison') {
      const done = state.comparison.progressDone;
      const total = state.comparison.progressTotal;
      const runningLine = state.comparison.running
        ? t('comparison_progress_running', { done, total })
        : (done > 0
          ? t('comparison_progress_done', { done, total })
          : t('comparison_progress_idle', { done, total }));

      const comparePseudo = [
        '1  for each length L in [1,2,4,8,16,32,64,128,256]:',
        '2      repeat n times:',
        '3          generate random x,y with length L',
        '4          run classroom engine and collect counts',
        '5          run karatsuba engine and collect counts',
        '6      average counts for L',
        '7  plot curves and fill table'
      ];
      els.codeDisplay.innerHTML = comparePseudo
        .map((line) => `<div class="code-line">${line}</div>`)
        .join('');
      els.stepLog.innerHTML = `<div class="step-entry current"><strong>•</strong> ${runningLine}</div>`;
      return;
    }

    const execution = getActiveExecution();
    if (!execution) {
      els.codeDisplay.innerHTML = '';
      els.stepLog.innerHTML = '';
      return;
    }

    const code = state.activeTab === 'classroom' ? KaratsubaAlgorithms.CLASSROOM_CODE : KaratsubaAlgorithms.KARATSUBA_CODE;
    const idx = state.stepIndex[state.activeTab];
    const current = idx > 0 ? execution.steps[idx - 1] : null;
    const currentLine = current ? current.line : -1;

    els.codeDisplay.innerHTML = code
      .map((line) => {
        const match = String(line).match(/^(\d+)\s/);
        const lineNo = match ? Number(match[1]) : NaN;
        const isActive = Number.isFinite(lineNo) && lineNo === currentLine;
        return `<div class="code-line ${isActive ? 'active' : ''}">${line}</div>`;
      })
      .join('');

    const logHtml = execution.steps
      .map((step, i) => {
        const currentClass = i === idx - 1 ? 'current' : '';
        const alpha = i < idx ? 1 : 0.42;
        return `<div class="step-entry ${currentClass}" style="opacity:${alpha}"><strong>${i + 1}.</strong> ${localizeStep(step)}</div>`;
      })
      .join('');

    els.stepLog.innerHTML = logHtml;
    if (idx > 0) {
      const currentEl = els.stepLog.querySelector('.step-entry.current');
      if (currentEl) {
        const container = els.stepLog;
        const itemTop = currentEl.offsetTop;
        const itemBottom = itemTop + currentEl.offsetHeight;
        const viewTop = container.scrollTop;
        const viewBottom = viewTop + container.clientHeight;

        if (itemTop < viewTop) {
          container.scrollTop = Math.max(0, itemTop - 8);
        } else if (itemBottom > viewBottom) {
          container.scrollTop = itemBottom - container.clientHeight + 8;
        }
      }
    }
  }

  function renderCounters() {
    const execution = getActiveExecution();
    if (!execution) {
      els.totalCount.textContent = '0';
      els.mulCount.textContent = '0';
      els.addCount.textContent = '0';
      els.stepCount.textContent = '0 / 0';
      return;
    }

    const idx = state.stepIndex[state.activeTab];
    const currentStep = idx > 0 ? execution.steps[idx - 1] : null;
    const mul = currentStep ? currentStep.counts.mul : 0;
    const add = currentStep ? currentStep.counts.add : 0;

    els.totalCount.textContent = String(mul + add);
    els.mulCount.textContent = String(mul);
    els.addCount.textContent = String(add);
    els.stepCount.textContent = `${idx} / ${execution.steps.length}`;
  }

  function renderAutoButtonState() {
    els.autoRunBtn.textContent = state.autoTimer ? (state.lang === 'en' ? 'Pause' : 'Pausar') : t('auto_run_btn');
  }

  function renderAll() {
    renderCounters();
    renderClassroom();
    renderKaratsuba();
    renderComparison();
    renderCodeAndLog();
    renderAutoButtonState();
  }

  function bindEvents() {
    els.multTableBtn.addEventListener('click', openMultTable);
    els.multTableCloseBtn.addEventListener('click', closeMultTable);
    els.multTableOverlay.addEventListener('click', (event) => {
      if (event.target === els.multTableOverlay) {
        closeMultTable();
      }
    });
    els.helpBtn.addEventListener('click', openHelp);
    els.helpCloseBtn.addEventListener('click', closeHelp);
    els.helpOverlay.addEventListener('click', (event) => {
      if (event.target === els.helpOverlay) {
        closeHelp();
      }
    });
    els.referencesLink.addEventListener('click', (event) => {
      event.preventDefault();
      openReferences();
    });
    els.referencesCloseBtn.addEventListener('click', closeReferences);
    els.referencesOverlay.addEventListener('click', (event) => {
      if (event.target === els.referencesOverlay) {
        closeReferences();
      }
    });
    document.addEventListener('keydown', handleGlobalKeydown);

    els.toggleControlsBtn.addEventListener('click', toggleControlsPanel);
    els.toggleCodeBtn.addEventListener('click', toggleCodePanel);

    els.langToggle.addEventListener('click', () => {
      const next = state.lang === 'en' ? 'pt' : 'en';
      setLanguage(next);
    });

    els.themeToggle.addEventListener('click', () => {
      setTheme(state.theme === 'light' ? 'dark' : 'light');
    });

    els.tabClassroom.addEventListener('click', () => switchTab('classroom'));
    els.tabKaratsuba.addEventListener('click', () => switchTab('karatsuba'));
    els.tabComparison.addEventListener('click', () => switchTab('comparison'));

    els.randomBtn.addEventListener('click', fillRandomInputs);
    els.prepareBtn.addEventListener('click', prepareFromInputs);

    els.inputX.addEventListener('input', () => sanitizeInput(els.inputX));
    els.inputY.addEventListener('input', () => sanitizeInput(els.inputY));
    els.randomLength.addEventListener('input', sanitizeRandomLength);

    els.runStepBtn.addEventListener('click', () => {
      stopAutoRun();
      runOneStep();
    });

    els.autoRunBtn.addEventListener('click', toggleAutoRun);
    els.runFullBtn.addEventListener('click', runFullExecution);
    els.resetBtn.addEventListener('click', resetActiveSteps);

    els.speedSelect.addEventListener('change', () => {
      if (state.autoTimer) {
        stopAutoRun();
        toggleAutoRun();
      }
    });

    els.comparisonRepeats.addEventListener('input', sanitizeComparisonRepeats);
    els.comparisonRunBtn.addEventListener('click', runComparisonBenchmark);
    els.comparisonStopBtn.addEventListener('click', stopComparisonRun);
    els.comparisonXMax.addEventListener('change', () => {
      sanitizeComparisonXAxis();
      clearComparisonTooltip();
      renderComparisonChart();
    });
    els.comparisonYZoom.addEventListener('input', () => {
      sanitizeComparisonYZoom();
      clearComparisonTooltip();
      els.comparisonYZoomValue.textContent = t('comparison_yzoom_value', {
        value: state.comparison.yZoom.toFixed(1)
      });
      renderComparisonChart();
    });

    els.comparisonChartSvg.addEventListener('pointermove', handleComparisonChartPointer);
    els.comparisonChartSvg.addEventListener('pointerleave', () => applyComparisonSeriesFocus(null));
    els.comparisonChartSvg.addEventListener('click', handleComparisonChartClick);

    const bindToggle = (el, key) => {
      if (!el) return;
      el.addEventListener('change', () => {
        state.comparison.toggles[key] = Boolean(el.checked);
        clearComparisonTooltip();
        renderComparisonChart();
      });
    };
    bindToggle(els.comparisonShowClassroom, 'classroom');
    bindToggle(els.comparisonShowKaratsuba, 'karatsuba');
    bindToggle(els.comparisonShowTotal, 'total');
    bindToggle(els.comparisonShowMul, 'mul');
    bindToggle(els.comparisonShowAdd, 'add');
    bindToggle(els.comparisonShowTheoryN2, 'theoryN2');
    bindToggle(els.comparisonShowTheoryN158, 'theoryN158');

    if (els.mainSplitter) {
      els.mainSplitter.addEventListener('pointerdown', (event) => startResizeSession('main', event));
    }
    if (els.contentSplitter) {
      els.contentSplitter.addEventListener('pointerdown', (event) => startResizeSession('content', event));
    }
    window.addEventListener('resize', () => {
      scheduleNormalizePanelWidths();
      renderComparisonChart();
    });
  }

  function init() {
    resetComparisonSamples();
    bindEvents();
    sanitizeComparisonRepeats();
    sanitizeComparisonXAxis();
    sanitizeComparisonYZoom();
    setTheme('light');
    setLanguage('en');
    sanitizeRandomLength();
    applyPanelLayout();
    switchTab('classroom');
    prepareFromInputs();
    scheduleNormalizePanelWidths();
  }

  init();
})();
