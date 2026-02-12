const QUEUE_SIZE = 6;
const QUEUE_VISIBLE = 4;
const EXIT_ANIMATION_MS = 2300;
const QUEUE_SHIFT_MS = 700;
const FEEDBACK_VISIBLE_MS = 2300;
const STEP_DELAY_MS = 420;
const FAST_VIS_STEP_DELAY_MS = 24;
const AUTO_SUBMIT_DELAY_MS = 220;
const MIN_STEP_DELAY_MS = 70;
const MAX_STEP_DELAY_MS = 1100;
const MIN_FAST_VIS_DELAY_MS = 6;
const MAX_FAST_VIS_DELAY_MS = 170;
const MIN_AUTO_SUBMIT_DELAY_MS = 45;
const MAX_AUTO_SUBMIT_DELAY_MS = 600;
const MIN_ALGORITHM_SPEED_MULTIPLIER = 0.5;
const MAX_ALGORITHM_SPEED_MULTIPLIER = 10.0;
const TARGET_BUBBLE_DELAY_MS = 220;

const CUSTOMER_SHAPES = ['shape-rect', 'shape-circle', 'shape-pentagon'];
const CUSTOMER_COLORS = ['#ff7675', '#74b9ff', '#55efc4', '#9ea7f4', '#fab1a0', '#ffd47c'];
const CUSTOMER_HEADWEAR_CHANCE = 0.22;
const HEADWEAR_COLORS = ['#2f3640', '#6c5ce7', '#7f5539', '#0e7490', '#1f2937'];
const CUSTOMER_NECKWEAR_CHANCE = 0.1;
const NECKWEAR_COLORS = ['#8b1e3f', '#0b3d91', '#14532d', '#4a2c2a', '#1f2937'];
const CUSTOMER_EYEWEAR_CHANCE = 0.15;
const EYEWEAR_COLORS = ['#1f2937', '#2f3640', '#4b5563', '#5d4037'];
const POST_ITEM_TYPES = ['letter', 'postcard', 'box'];
const POST_ITEM_COLORS = ['#fff5d7', '#fcecc3', '#f8e2ba', '#dceffd', '#f9deca', '#d8f2e3'];
const SHOPPING_BAG_TYPES = ['paper', 'plastic', 'gift'];
const SHOPPING_BAG_COLORS = ['#d8b691', '#7cb7e9', '#9ed9c1', '#e9ba8e', '#d5a4dc'];
const CHECKOUT_SLIP_TYPES = ['receipt', 'coupon', 'invoice'];
const CHECKOUT_SLIP_COLORS = ['#fffef2', '#f6f0de', '#e9f6ff', '#eef9ec', '#fff0e4'];
const DEFAULT_DROP_TRAY_CAPACITY = 18;

const SCENE_CLASSES = ['scene-us', 'scene-br', 'scene-stamps'];
const CODE_KEYWORDS = new Set([
    'function', 'const', 'let', 'for', 'while', 'if', 'return', 'new', 'of', 'in',
    'true', 'false', 'null', 'undefined',
    'FUNCTION', 'FOR', 'WHILE', 'IF', 'THEN', 'RETURN', 'DO', 'IN', 'TO', 'EACH',
    'WITH', 'APPEND', 'FIRST'
]);
const CODE_BUILTINS = new Set(['Number', 'Set', 'Array', 'Infinity']);

const state = {
    scene: 'us',
    queue: [],
    currentCustomer: null,
    playerCoins: [],
    servedCount: 0,
    mistakeCount: 0,
    isGameOver: false,
    isAutoRunning: false,
    isTransitioning: false,
    bubbleTimerId: null,
    feedbackTimerId: null,
    queueShiftTimerId: null,
    nextCustomerTimerId: null,
    pendingGameOverTimerId: null,
    algorithmMode: 'idle',
    algorithmStopRequested: false,
    algorithmSession: 0,
    roundId: 0,
    dropTrayResizeTimerId: null,
    modalContext: null,
    modalLockClose: false,
    lastFailure: null,
    dpViz: null,
    algorithmSpeedMultiplier: 1,
    hasStartedGame: false
};

const elements = {
    title: document.querySelector('h1'),
    sceneBtns: document.querySelectorAll('.scene-btn'),
    sceneTitle: document.getElementById('scene-title'),
    sceneSubtitle: document.getElementById('scene-subtitle'),
    servedLabel: document.getElementById('served-label'),
    servedCount: document.getElementById('served-count'),
    mistakeLabel: document.getElementById('mistake-label'),
    mistakeCount: document.getElementById('mistake-count'),
    successLabel: document.getElementById('success-label'),
    successRate: document.getElementById('success-rate'),
    registerLabel: document.getElementById('register-label'),
    dropTrayLabel: document.getElementById('drop-tray-label'),
    dropTrayItems: document.getElementById('drop-tray-items'),
    dropTrayCount: document.getElementById('drop-tray-count'),
    coinsRack: document.getElementById('coins-rack'),
    playerTray: document.getElementById('player-tray'),
    statusMessage: document.getElementById('status-message'),
    customerQueue: document.querySelector('.queue-container'),
    currentCustomerContainer: document.querySelector('.current-customer'),
    customerSprite: document.querySelector('.customer-sprite'),
    targetAmount: document.getElementById('target-amount'),
    currentTotal: document.getElementById('current-total'),
    submitBtn: document.getElementById('submit-btn'),
    clearBtn: document.getElementById('clear-btn'),
    restartBtn: document.getElementById('restart-btn'),
    langToggle: document.getElementById('lang-toggle'),
    showAlgoBtn: document.getElementById('show-algo-btn'),
    infoBtn: document.getElementById('info-btn'),
    startScreen: document.getElementById('start-screen'),
    startTitle: document.getElementById('start-title'),
    startSubtitle: document.getElementById('start-subtitle'),
    startPlayBtn: document.getElementById('start-play-btn'),
    modal: document.getElementById('modal-overlay'),
    modalTitle: document.getElementById('modal-title'),
    modalContent: document.getElementById('modal-content'),
    closeModal: document.getElementById('close-modal'),
    modalSecondary: document.getElementById('modal-secondary'),
    creditsLink: document.getElementById('credits-link'),
    repoLink: document.getElementById('repo-link'),
    licenseLink: document.getElementById('license-link'),
    footerText: document.getElementById('footer-text'),
    algoPanel: document.getElementById('algo-panel'),
    algoSelect: document.getElementById('algo-select'),
    algoSpeedLabel: document.getElementById('algo-speed-label'),
    algoSpeedSelect: document.getElementById('algo-speed-select'),
    runBtn: document.getElementById('run-btn'),
    runAlgoBtn: document.getElementById('run-algo-btn'),
    stepsDisplay: document.getElementById('algo-steps'),
    codeDisplay: document.getElementById('code-display'),
    dpVisualization: document.getElementById('dp-visualization'),
    dpVisContext: document.getElementById('dp-vis-context'),
    dpVisHeadRow: document.getElementById('dp-vis-head-row'),
    dpVisDpRow: document.getElementById('dp-vis-dp-row'),
    dpVisCoinRow: document.getElementById('dp-vis-coin-row'),
    dpCurrentI: document.getElementById('dp-current-i'),
    dpCurrentTest: document.getElementById('dp-current-test')
};

function init() {
    setupEventListeners();
    updateAlgorithmSpeedFromControl();
    updateCodeDisplay();
    updateAlgorithmVisualizationVisibility();
    enforceDropTrayCapacity();
    updateDroppedPostItemCount();
    setSceneClass(state.scene);
    applyLanguage();
    showStartScreen();
}

function setupEventListeners() {
    elements.sceneBtns.forEach((btn) => {
        btn.addEventListener('click', () => loadScene(btn.dataset.scene));
    });

    elements.clearBtn.addEventListener('click', () => clearTray());
    elements.submitBtn.addEventListener('click', () => checkAnswer());
    elements.restartBtn.addEventListener('click', restartGame);
    elements.langToggle.addEventListener('click', toggleLanguage);

    elements.showAlgoBtn.addEventListener('click', () => {
        elements.algoPanel.classList.toggle('hidden');
    });

    elements.infoBtn.addEventListener('click', openInstructionsModal);
    elements.startPlayBtn.addEventListener('click', startGameFromStartScreen);
    elements.creditsLink.addEventListener('click', (event) => {
        event.preventDefault();
        openCreditsModal();
    });

    elements.closeModal.addEventListener('click', () => closeModal());
    elements.modalSecondary.addEventListener('click', restartGame);

    elements.runBtn.addEventListener('click', handleRunButtonClick);
    elements.runAlgoBtn.addEventListener('click', handleAutoRunButtonClick);
    elements.algoSpeedSelect.addEventListener('change', updateAlgorithmSpeedFromControl);
    elements.algoSelect.addEventListener('change', () => {
        updateCodeDisplay();
        updateAlgorithmVisualizationVisibility();
    });
    window.addEventListener('resize', handleDropTrayViewportChange);
}

function loadScene(sceneKey) {
    if (!state.hasStartedGame) {
        return;
    }

    if (sceneKey === 'br') {
        sceneKey = 'us';
    }

    if (!SCENES[sceneKey]) {
        return;
    }

    state.scene = sceneKey;
    resetRoundState();
    state.servedCount = 0;
    state.mistakeCount = 0;

    setSceneClass(sceneKey);
    updateSceneButtons();
    renderCoinsRack(SCENES[sceneKey]);

    if (sceneKey === 'stamps') {
        state.queue.push(createCustomer(140));
    }

    topUpQueue();
    nextCustomer();

    clearAlgorithmPanel();
    applyLanguage();
    closeModal(true);
}

function resetRoundState() {
    clearTimeout(state.bubbleTimerId);
    clearTimeout(state.feedbackTimerId);
    clearTimeout(state.queueShiftTimerId);
    clearTimeout(state.nextCustomerTimerId);
    clearTimeout(state.pendingGameOverTimerId);
    clearTimeout(state.dropTrayResizeTimerId);
    state.queue = [];
    state.currentCustomer = null;
    state.playerCoins = [];
    state.isGameOver = false;
    state.isAutoRunning = false;
    state.isTransitioning = false;
    state.algorithmMode = 'idle';
    state.algorithmStopRequested = false;
    state.algorithmSession += 1;
    state.roundId += 1;
    state.pendingGameOverTimerId = null;
    state.modalContext = null;
    state.modalLockClose = false;
    state.lastFailure = null;
    state.dpViz = null;
    resetQueueShiftVisual(true);
    clearDroppedPostItems();
}

function setSceneClass(sceneKey) {
    SCENE_CLASSES.forEach((className) => document.body.classList.remove(className));
    document.body.classList.add(`scene-${sceneKey}`);
}

function updateSceneButtons() {
    elements.sceneBtns.forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.scene === state.scene);
    });
}

function createCustomer(forcedAmount) {
    return {
        amount: typeof forcedAmount === 'number' ? forcedAmount : getAmountForScene(state.scene),
        color: CUSTOMER_COLORS[Math.floor(Math.random() * CUSTOMER_COLORS.length)],
        shape: CUSTOMER_SHAPES[Math.floor(Math.random() * CUSTOMER_SHAPES.length)],
        headwear: getRandomHeadwear(),
        eyewear: getRandomEyewear(),
        neckwear: getRandomNeckwear(),
        carriedPostItem: state.scene === 'stamps' ? getRandomPostItem() : null,
        shoppingBag: state.scene === 'us' ? getRandomShoppingBag() : null
    };
}

function getRandomHeadwear() {
    if (Math.random() > CUSTOMER_HEADWEAR_CHANCE) {
        return null;
    }

    return {
        type: Math.random() < 0.65 ? 'cap' : 'hat',
        color: HEADWEAR_COLORS[Math.floor(Math.random() * HEADWEAR_COLORS.length)]
    };
}

function getRandomNeckwear() {
    if (Math.random() > CUSTOMER_NECKWEAR_CHANCE) {
        return null;
    }

    return {
        type: Math.random() < 0.5 ? 'bowtie' : 'tie',
        color: NECKWEAR_COLORS[Math.floor(Math.random() * NECKWEAR_COLORS.length)]
    };
}

function getRandomEyewear() {
    if (Math.random() > CUSTOMER_EYEWEAR_CHANCE) {
        return null;
    }

    return {
        type: Math.random() < 0.65 ? 'glasses' : 'sunglasses',
        color: EYEWEAR_COLORS[Math.floor(Math.random() * EYEWEAR_COLORS.length)]
    };
}

function getRandomPostItem() {
    return {
        type: POST_ITEM_TYPES[Math.floor(Math.random() * POST_ITEM_TYPES.length)],
        color: POST_ITEM_COLORS[Math.floor(Math.random() * POST_ITEM_COLORS.length)],
        rotation: `${Math.round(Math.random() * 14 - 7)}deg`
    };
}

function getRandomShoppingBag() {
    return {
        type: SHOPPING_BAG_TYPES[Math.floor(Math.random() * SHOPPING_BAG_TYPES.length)],
        color: SHOPPING_BAG_COLORS[Math.floor(Math.random() * SHOPPING_BAG_COLORS.length)],
        rotation: `${Math.round(Math.random() * 12 - 6)}deg`
    };
}

function getRandomCheckoutSlip() {
    return {
        type: CHECKOUT_SLIP_TYPES[Math.floor(Math.random() * CHECKOUT_SLIP_TYPES.length)],
        color: CHECKOUT_SLIP_COLORS[Math.floor(Math.random() * CHECKOUT_SLIP_COLORS.length)],
        rotation: `${Math.round(Math.random() * 12 - 6)}deg`
    };
}

function getAmountForScene(sceneKey) {
    if (sceneKey === 'stamps') {
        if (Math.random() < 0.35) {
            return 140;
        }

        return Math.floor(Math.random() * 420) + 1;
    }

    if (sceneKey === 'br') {
        return (Math.floor(Math.random() * 40) + 1) * 5;
    }

    return Math.floor(Math.random() * 199) + 1;
}

function attachHeadwear(characterElement, headwear) {
    if (!characterElement || !headwear) {
        return;
    }

    const headwearEl = document.createElement('span');
    headwearEl.className = `headwear headwear-${headwear.type}`;
    headwearEl.style.setProperty('--hat-color', headwear.color);
    characterElement.appendChild(headwearEl);
}

function attachNeckwear(characterElement, neckwear) {
    if (!characterElement || !neckwear) {
        return;
    }

    const neckwearEl = document.createElement('span');
    neckwearEl.className = `neckwear neckwear-${neckwear.type}`;
    neckwearEl.style.setProperty('--tie-color', neckwear.color);
    characterElement.appendChild(neckwearEl);
}

function attachEyewear(characterElement, eyewear) {
    if (!characterElement || !eyewear) {
        return;
    }

    const eyewearEl = document.createElement('span');
    eyewearEl.className = `eyewear eyewear-${eyewear.type}`;
    eyewearEl.style.setProperty('--eyewear-color', eyewear.color);
    characterElement.appendChild(eyewearEl);
}

function attachPostItem(characterElement, postItem) {
    if (!characterElement || !postItem) {
        return;
    }

    const itemEl = document.createElement('span');
    itemEl.className = `mail-item mail-${postItem.type}`;
    itemEl.style.setProperty('--mail-item-color', postItem.color);
    itemEl.style.setProperty('--mail-rotation', postItem.rotation);
    characterElement.appendChild(itemEl);
}

function attachShoppingBag(characterElement, shoppingBag) {
    if (!characterElement || !shoppingBag) {
        return;
    }

    const bagEl = document.createElement('span');
    bagEl.className = `shopping-bag shopping-bag-${shoppingBag.type}`;
    bagEl.style.setProperty('--bag-color', shoppingBag.color);
    bagEl.style.setProperty('--bag-rotation', shoppingBag.rotation);
    characterElement.appendChild(bagEl);
}

function handleCurrentCustomerExitItems() {
    if (state.scene === 'stamps' && state.currentCustomer?.carriedPostItem) {
        const droppedPostItem = createPostTrayItem(state.currentCustomer.carriedPostItem);
        state.currentCustomer.carriedPostItem = null;
        elements.customerSprite.querySelector('.mail-item')?.remove();
        appendDroppedPostItem(droppedPostItem);
        return;
    }

    if (state.scene === 'us') {
        appendDroppedPostItem(createCheckoutSlipTrayItem(getRandomCheckoutSlip()));
    }
}

function createPostTrayItem(postItem) {
    if (!elements.dropTrayItems) {
        return null;
    }

    const dropped = document.createElement('span');
    dropped.className = `mail-item mail-${postItem.type}`;
    dropped.style.setProperty('--mail-item-color', postItem.color);
    dropped.style.setProperty('--mail-rotation', postItem.rotation);
    return dropped;
}

function createCheckoutSlipTrayItem(checkoutSlip) {
    if (!elements.dropTrayItems) {
        return null;
    }

    const slip = document.createElement('span');
    slip.className = `slip-item slip-${checkoutSlip.type}`;
    slip.style.setProperty('--slip-color', checkoutSlip.color);
    slip.style.setProperty('--slip-rotation', checkoutSlip.rotation);
    return slip;
}

function appendDroppedPostItem(postItemElement) {
    if (!elements.dropTrayItems || !postItemElement) {
        return;
    }

    const slotElement = document.createElement('span');
    slotElement.className = 'drop-tray-slot';
    slotElement.appendChild(postItemElement);
    elements.dropTrayItems.appendChild(slotElement);

    enforceDropTrayCapacity();
    updateDroppedPostItemCount();
}

function clearDroppedPostItems() {
    if (!elements.dropTrayItems) {
        return;
    }

    elements.dropTrayItems.innerHTML = '';
    updateDroppedPostItemCount();
}

function updateDroppedPostItemCount() {
    if (!elements.dropTrayCount || !elements.dropTrayItems) {
        return;
    }

    elements.dropTrayCount.textContent = `${elements.dropTrayItems.children.length}/${getDropTrayCapacity()}`;
}

function getDropTrayCapacity() {
    if (!elements.dropTrayItems || typeof window === 'undefined') {
        return DEFAULT_DROP_TRAY_CAPACITY;
    }

    const styles = window.getComputedStyle(elements.dropTrayItems);
    const columns = Number.parseInt(styles.getPropertyValue('--drop-tray-cols').trim(), 10);
    const rows = Number.parseInt(styles.getPropertyValue('--drop-tray-rows').trim(), 10);

    if (!Number.isFinite(columns) || columns <= 0 || !Number.isFinite(rows) || rows <= 0) {
        return DEFAULT_DROP_TRAY_CAPACITY;
    }

    return columns * rows;
}

function enforceDropTrayCapacity() {
    if (!elements.dropTrayItems) {
        return;
    }

    const trayCapacity = getDropTrayCapacity();

    while (elements.dropTrayItems.children.length > trayCapacity) {
        elements.dropTrayItems.firstElementChild?.remove();
    }
}

function handleDropTrayViewportChange() {
    clearTimeout(state.dropTrayResizeTimerId);

    state.dropTrayResizeTimerId = setTimeout(() => {
        enforceDropTrayCapacity();
        updateDroppedPostItemCount();
    }, 60);
}

function topUpQueue() {
    while (state.queue.length < QUEUE_SIZE) {
        state.queue.push(createCustomer());
    }

    renderQueue();
}

function renderQueue() {
    elements.customerQueue.innerHTML = '';

    state.queue.slice(0, QUEUE_VISIBLE).forEach((customer) => {
        const customerDiv = document.createElement('div');
        customerDiv.className = `character ${customer.shape}`;
        customerDiv.style.setProperty('--char-color', customer.color);
        attachHeadwear(customerDiv, customer.headwear);
        attachEyewear(customerDiv, customer.eyewear);
        attachNeckwear(customerDiv, customer.neckwear);
        attachShoppingBag(customerDiv, customer.shoppingBag);
        attachPostItem(customerDiv, customer.carriedPostItem);
        elements.customerQueue.appendChild(customerDiv);
    });
}

function nextCustomer() {
    if (state.isGameOver) {
        return;
    }

    resetQueueShiftVisual(true);

    if (state.queue.length === 0) {
        topUpQueue();
    }

    state.currentCustomer = state.queue.shift();
    topUpQueue();

    const sprite = elements.customerSprite;
    sprite.className = `customer-sprite character ${state.currentCustomer.shape}`;
    sprite.style.setProperty('--char-color', state.currentCustomer.color);
    sprite.textContent = state.currentCustomer.shape === 'shape-triangle' ? '' : getString('customer');
    attachHeadwear(sprite, state.currentCustomer.headwear);
    attachEyewear(sprite, state.currentCustomer.eyewear);
    attachNeckwear(sprite, state.currentCustomer.neckwear);
    attachShoppingBag(sprite, state.currentCustomer.shoppingBag);
    attachPostItem(sprite, state.currentCustomer.carriedPostItem);

    elements.currentCustomerContainer.classList.remove('container-exit-happy', 'container-exit-angry');
    sprite.classList.remove('anim-shake');

    renderTargetBubble(true);
    clearTray(true);
    clearFeedback();

    state.isTransitioning = false;
    syncControls();
    maybeStartAutoRunCycle();
}

function renderTargetBubble(animated) {
    if (!state.currentCustomer) {
        return;
    }

    clearTimeout(state.bubbleTimerId);
    const bubbleHtml = `${getString('amount')}: <span id="amount-value">${formatCurrency(state.currentCustomer.amount, state.scene)}</span>`;

    if (!animated) {
        elements.targetAmount.innerHTML = bubbleHtml;
        elements.targetAmount.style.opacity = '1';
        return;
    }

    elements.targetAmount.style.opacity = '0';

    state.bubbleTimerId = setTimeout(() => {
        if (!state.currentCustomer) {
            return;
        }

        elements.targetAmount.innerHTML = bubbleHtml;
        elements.targetAmount.style.opacity = '1';
    }, TARGET_BUBBLE_DELAY_MS);
}

function renderCoinsRack(config) {
    elements.coinsRack.innerHTML = '';
    const minValue = Math.min(...config.denominations);
    const maxValue = Math.max(...config.denominations);

    config.denominations.forEach((value, index) => {
        const slot = document.createElement('div');
        slot.className = 'coin-slot';

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'coin-btn';
        const label = config.denominationLabels[index];
        const color = config.colors[index];
        btn.textContent = label;
        btn.style.backgroundColor = color;

        const size = getPieceSize(value, minValue, maxValue, config.type);

        if (config.type === 'stamp') {
            btn.style.width = `${Math.round(size * 0.84)}px`;
            btn.style.height = `${size}px`;
        } else {
            btn.style.width = `${size}px`;
            btn.style.height = `${size}px`;
        }
        applyPieceTextStyle(btn, color, label, { type: config.type, context: 'rack' });

        btn.addEventListener('click', () => addCoin(value));
        slot.appendChild(btn);
        elements.coinsRack.appendChild(slot);
    });

    syncControls();
}

function getPieceSize(value, minValue, maxValue, type) {
    if (minValue === maxValue) {
        return type === 'stamp' ? 56 : 48;
    }

    const normalized = (Math.log(value) - Math.log(minValue)) / (Math.log(maxValue) - Math.log(minValue));
    const base = type === 'stamp' ? 52 : 40;
    const range = type === 'stamp' ? 22 : 22;
    return Math.round(base + normalized * range);
}

function addCoin(value, options = {}) {
    if (!options.bypassLock && !canPlayerAct()) {
        return;
    }

    const scene = SCENES[state.scene];
    const coinIndex = scene.denominations.indexOf(value);

    if (coinIndex === -1) {
        return;
    }

    state.playerCoins.push(value);

    const trayCoin = document.createElement('div');
    trayCoin.className = 'tray-coin';
    const label = scene.denominationLabels[coinIndex];
    const color = scene.colors[coinIndex];
    trayCoin.textContent = label;
    trayCoin.style.backgroundColor = color;

    if (scene.type === 'stamp') {
        trayCoin.style.width = '44px';
        trayCoin.style.height = '54px';
    }
    applyPieceTextStyle(trayCoin, color, label, { type: scene.type, context: 'tray' });

    elements.playerTray.appendChild(trayCoin);
    updateTotal();
}

function applyPieceTextStyle(element, backgroundColor, label, options) {
    const textColor = getReadableTextColor(backgroundColor);
    const fontSizePx = getPieceFontSize(label, options);

    element.style.color = textColor;
    element.style.fontSize = `${fontSizePx}px`;
    element.style.letterSpacing = label.length >= 5 ? '-0.2px' : '0';

    if (textColor === '#ffffff') {
        element.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.7)';
    } else {
        element.style.textShadow = '0 1px 0 rgba(255, 255, 255, 0.55), 0 0 1px rgba(0, 0, 0, 0.28)';
    }
}

function getPieceFontSize(label, options) {
    const length = label.length;
    const isStamp = options.type === 'stamp';
    const isTray = options.context === 'tray';

    if (isStamp && isTray) {
        if (length >= 5) return 10;
        if (length === 4) return 11;
        return 12;
    }

    if (isStamp) {
        if (length >= 5) return 11;
        if (length === 4) return 12;
        return 13;
    }

    if (isTray) {
        if (length >= 4) return 10;
        return 11;
    }

    if (length >= 4) return 12;
    return 13;
}

function getReadableTextColor(backgroundColor) {
    const rgb = parseHexColor(backgroundColor);

    if (!rgb) {
        return '#1f2b2c';
    }

    const bgLum = getRelativeLuminance(rgb.r, rgb.g, rgb.b);
    const darkLum = getRelativeLuminance(31, 43, 44);
    const whiteLum = 1;

    const contrastWithDark = getContrastRatio(bgLum, darkLum);
    const contrastWithWhite = getContrastRatio(bgLum, whiteLum);

    return contrastWithWhite >= contrastWithDark ? '#ffffff' : '#1f2b2c';
}

function parseHexColor(color) {
    if (typeof color !== 'string' || !color.startsWith('#')) {
        return null;
    }

    const raw = color.slice(1);

    if (raw.length === 3) {
        const r = parseInt(raw[0] + raw[0], 16);
        const g = parseInt(raw[1] + raw[1], 16);
        const b = parseInt(raw[2] + raw[2], 16);

        if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
            return null;
        }

        return {
            r,
            g,
            b
        };
    }

    if (raw.length !== 6) {
        return null;
    }

    const r = parseInt(raw.slice(0, 2), 16);
    const g = parseInt(raw.slice(2, 4), 16);
    const b = parseInt(raw.slice(4, 6), 16);

    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
        return null;
    }

    return { r, g, b };
}

function getRelativeLuminance(r, g, b) {
    const values = [r, g, b].map((channel) => {
        const normalized = channel / 255;
        if (normalized <= 0.03928) {
            return normalized / 12.92;
        }
        return Math.pow((normalized + 0.055) / 1.055, 2.4);
    });

    return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
}

function getContrastRatio(l1, l2) {
    const brightest = Math.max(l1, l2);
    const darkest = Math.min(l1, l2);
    return (brightest + 0.05) / (darkest + 0.05);
}

function clearTray(force = false) {
    if (!force && !canPlayerAct()) {
        return;
    }

    state.playerCoins = [];
    elements.playerTray.innerHTML = '';
    updateTotal();
}

function updateTotal() {
    const total = state.playerCoins.reduce((sum, value) => sum + value, 0);
    elements.currentTotal.textContent = formatCurrency(total, state.scene);
}

function checkAnswer(options = {}) {
    const bypassLock = options.bypassLock === true;

    if (!state.currentCustomer) {
        return;
    }

    if (!bypassLock && !canPlayerAct()) {
        return;
    }

    const total = state.playerCoins.reduce((sum, value) => sum + value, 0);
    const target = state.currentCustomer.amount;
    const currentRoundId = state.roundId;

    if (total !== target) {
        showFeedback(getString('feedbackWrongAmount'), false);
        animateWrongAnswer();
        state.isTransitioning = true;
        syncControls();
        clearTimeout(state.pendingGameOverTimerId);
        state.pendingGameOverTimerId = setTimeout(() => {
            state.pendingGameOverTimerId = null;

            if (state.roundId !== currentRoundId) {
                return;
            }

            triggerGameOver(total, target);
        }, 520);
        return;
    }

    clearTimeout(state.pendingGameOverTimerId);
    state.pendingGameOverTimerId = null;

    const optimalCoinCount = minCoinCountDP(target, SCENES[state.scene].denominations);
    const isOptimal = Number.isFinite(optimalCoinCount) && state.playerCoins.length <= optimalCoinCount;

    state.servedCount += 1;

    clearFeedback();
    elements.currentCustomerContainer.classList.remove('container-exit-happy', 'container-exit-angry');
    handleCurrentCustomerExitItems();

    if (isOptimal) {
        showFeedback(getString('feedbackGood'), true);
        elements.currentCustomerContainer.classList.add('container-exit-happy');
        elements.targetAmount.innerHTML = '<span style="font-size: 2rem;">🎶</span>';
    } else {
        state.mistakeCount += 1;
        showFeedback(getString('feedbackBadCount'), false);
        elements.currentCustomerContainer.classList.add('container-exit-angry');
        elements.targetAmount.innerHTML = '<span style="font-size: 1.2rem; letter-spacing: -1px;">#$@&%*!</span>';
    }
    updateServedCount();

    state.isTransitioning = true;
    syncControls();

    scheduleNextCustomerTransition();
}

function scheduleNextCustomerTransition() {
    clearTimeout(state.queueShiftTimerId);
    clearTimeout(state.nextCustomerTimerId);

    const shiftDelay = Math.max(0, EXIT_ANIMATION_MS - QUEUE_SHIFT_MS);

    state.queueShiftTimerId = setTimeout(() => {
        if (state.isGameOver) {
            return;
        }

        animateQueueShift();
    }, shiftDelay);

    state.nextCustomerTimerId = setTimeout(() => {
        if (state.isGameOver) {
            return;
        }

        nextCustomer();
    }, EXIT_ANIMATION_MS);
}

function animateQueueShift() {
    const queueElement = elements.customerQueue;

    if (!queueElement || queueElement.children.length === 0) {
        return;
    }

    const shiftDistance = getQueueShiftDistance();
    queueElement.classList.remove('queue-resetting');
    queueElement.classList.add('is-shifting');
    queueElement.style.setProperty('--queue-shift-duration', `${QUEUE_SHIFT_MS}ms`);
    queueElement.style.setProperty('--queue-shift-offset', `-${shiftDistance}px`);
}

function getQueueShiftDistance() {
    const queueItems = elements.customerQueue.children;

    if (queueItems.length >= 2) {
        const firstRect = queueItems[0].getBoundingClientRect();
        const secondRect = queueItems[1].getBoundingClientRect();
        const distance = secondRect.left - firstRect.left;

        if (distance > 0) {
            return distance;
        }
    }

    return 66;
}

function resetQueueShiftVisual(immediate) {
    const queueElement = elements.customerQueue;

    if (!queueElement) {
        return;
    }

    queueElement.classList.remove('is-shifting');

    if (immediate) {
        queueElement.classList.add('queue-resetting');
    }

    queueElement.style.setProperty('--queue-shift-offset', '0px');

    if (immediate && typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(() => {
            queueElement.classList.remove('queue-resetting');
        });
    }
}

function animateWrongAnswer() {
    elements.customerSprite.classList.remove('anim-shake');
    void elements.customerSprite.offsetWidth;
    elements.customerSprite.classList.add('anim-shake');
}

function triggerGameOver(total, target) {
    if (state.isGameOver) {
        return;
    }

    clearTimeout(state.pendingGameOverTimerId);
    state.pendingGameOverTimerId = null;
    clearTimeout(state.queueShiftTimerId);
    clearTimeout(state.nextCustomerTimerId);

    state.isGameOver = true;
    state.isTransitioning = false;
    state.isAutoRunning = false;
    state.lastFailure = { total, target };
    resetQueueShiftVisual(true);
    state.algorithmMode = 'idle';
    state.algorithmStopRequested = false;

    updateAlgorithmButtonLabels();
    syncControls();
    openGameOverModal();
}

function openGameOverModal() {
    if (!state.lastFailure) {
        return;
    }

    const details = [
        getString('gameOverMessage'),
        `${getString('youGave')}: ${formatCurrency(state.lastFailure.total, state.scene)}`,
        `${getString('expected')}: ${formatCurrency(state.lastFailure.target, state.scene)}`,
        `${getString('servedLabel')}: ${state.servedCount}`
    ].join('\n');

    state.modalContext = 'gameover';
    openModal(getString('gameOverTitle'), details, { showRestart: true, lockClose: true });
}

function showFeedback(message, isGood) {
    clearFeedback();
    elements.statusMessage.textContent = message;
    elements.statusMessage.classList.add('visible', isGood ? 'good' : 'bad');

    state.feedbackTimerId = setTimeout(() => {
        clearFeedback();
    }, FEEDBACK_VISIBLE_MS);
}

function clearFeedback() {
    clearTimeout(state.feedbackTimerId);
    state.feedbackTimerId = null;
    elements.statusMessage.textContent = '';
    elements.statusMessage.classList.remove('visible', 'good', 'bad');
}

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'pt' : 'en';
    elements.langToggle.textContent = currentLang === 'en' ? '🇺🇸' : '🇧🇷';
    applyLanguage();
}

function applyLanguage() {
    document.documentElement.lang = currentLang;
    document.title = getString('gameName');

    elements.title.textContent = getString('gameName');
    elements.startTitle.textContent = getString('gameName');
    elements.startSubtitle.textContent = getString('startSubtitle');
    elements.startPlayBtn.textContent = getString('playButton');
    elements.submitBtn.textContent = state.scene === 'stamps' ? getString('giveStamps') : getString('giveChange');
    elements.clearBtn.textContent = getString('clearTray');
    elements.restartBtn.textContent = getString('restartGame');
    elements.servedLabel.textContent = getString('servedLabel');
    elements.mistakeLabel.textContent = getString('mistakeLabel');
    elements.successLabel.textContent = getString('successLabel');

    elements.closeModal.textContent = getString('close');
    elements.modalSecondary.textContent = getString('restartGame');

    document.querySelector('.algo-header h2').textContent = getString('algorithm');
    elements.algoSelect.options[0].textContent = getString('greedy');
    elements.algoSelect.options[1].textContent = getString('dp');
    elements.algoSpeedLabel.textContent = getString('speedLabel');
    updateAlgorithmButtonLabels();

    const sceneLabels = {
        us: getString('sceneUs'),
        br: getString('sceneBr'),
        stamps: getString('sceneStamps')
    };

    elements.sceneBtns.forEach((btn) => {
        btn.textContent = sceneLabels[btn.dataset.scene];
    });

    elements.sceneTitle.textContent = sceneLabels[state.scene];
    elements.sceneSubtitle.textContent = state.scene === 'stamps' ? getString('sceneSubtitleStamps') : getString('sceneSubtitleCash');
    elements.registerLabel.textContent = state.scene === 'stamps' ? getString('registerPost') : getString('registerCash');
    elements.dropTrayLabel.textContent = state.scene === 'stamps' ? getString('dropTrayLabel') : getString('checkoutTrayLabel');

    elements.creditsLink.textContent = getString('creditsLink');

    if (state.currentCustomer) {
        renderTargetBubble(false);
    }

    if (!elements.modal.classList.contains('hidden')) {
        if (state.modalContext === 'instructions') {
            openInstructionsModal();
        } else if (state.modalContext === 'credits') {
            openCreditsModal();
        } else if (state.modalContext === 'gameover') {
            openGameOverModal();
        }
    }

    updateServedCount();
}

function openInstructionsModal() {
    state.modalContext = 'instructions';
    openModal(getString('instructionsTitle'), getString('instructions'), { showRestart: false, lockClose: false });
}

function showStartScreen() {
    state.hasStartedGame = false;
    elements.startScreen.classList.remove('hidden');
}

function startGameFromStartScreen() {
    if (state.hasStartedGame) {
        return;
    }

    state.hasStartedGame = true;
    elements.startScreen.classList.add('hidden');
    loadScene(state.scene);
}

function openCreditsModal() {
    state.modalContext = 'credits';
    openModal(getString('creditsTitle'), getString('credits'), { showRestart: false, lockClose: false, allowHtml: true });
}

function openPlaceholderLinkModal(label) {
    state.modalContext = null;
    const message = `${label}: ${getString('placeholderLinkMsg')}`;
    openModal(label, message, { showRestart: false, lockClose: false });
}

function openModal(title, content, options) {
    const settings = {
        showRestart: false,
        lockClose: false,
        allowHtml: false,
        ...options
    };

    state.modalLockClose = settings.lockClose;
    elements.modalTitle.textContent = title;

    if (settings.allowHtml) {
        elements.modalContent.innerHTML = content;
        elements.modalContent.classList.add('is-html');
    } else {
        elements.modalContent.textContent = content;
        elements.modalContent.classList.remove('is-html');
    }

    elements.modalSecondary.classList.toggle('hidden', !settings.showRestart);
    elements.closeModal.classList.toggle('hidden', settings.lockClose);

    elements.modal.classList.remove('hidden');
}

function closeModal(force) {
    if (!force && state.modalLockClose) {
        return;
    }

    state.modalLockClose = false;
    elements.modal.classList.add('hidden');
    elements.closeModal.classList.remove('hidden');
    elements.modalSecondary.classList.add('hidden');

    if (force || state.modalContext !== 'gameover') {
        state.modalContext = null;
    }
}

function restartGame() {
    resetRoundState();
    state.servedCount = 0;
    state.mistakeCount = 0;

    if (state.scene === 'stamps') {
        state.queue.push(createCustomer(140));
    }

    topUpQueue();
    nextCustomer();
    clearAlgorithmPanel();
    applyLanguage();
    closeModal(true);
}

function updateServedCount() {
    elements.servedCount.textContent = String(state.servedCount);
    elements.mistakeCount.textContent = String(state.mistakeCount);
    const optimallyServed = Math.max(0, state.servedCount - state.mistakeCount);
    const successRate = state.servedCount > 0 ? (optimallyServed / state.servedCount) * 100 : 0;
    elements.successRate.textContent = `${Math.round(successRate)}%`;
}

function clearAlgorithmPanel() {
    elements.stepsDisplay.innerHTML = '';
    highlightLine(null);
    resetDPVisualization();
    updateAlgorithmVisualizationVisibility();
}

function updateAlgorithmButtonLabels() {
    elements.runBtn.textContent = state.algorithmMode === 'run' ? getString('stop') : getString('run');
    elements.runAlgoBtn.textContent = state.algorithmMode === 'auto' ? getString('stop') : getString('autoRun');
}

function handleRunButtonClick() {
    if (state.algorithmMode === 'run') {
        requestAlgorithmStop();
        return;
    }

    if (state.algorithmMode !== 'idle') {
        return;
    }

    startAlgorithmMode('run');
}

function handleAutoRunButtonClick() {
    if (state.algorithmMode === 'auto') {
        requestAlgorithmStop();
        return;
    }

    if (state.algorithmMode !== 'idle') {
        return;
    }

    startAlgorithmMode('auto');
}

function startAlgorithmMode(mode) {
    if (!state.currentCustomer || state.isGameOver || state.isTransitioning || state.isAutoRunning) {
        return;
    }

    state.algorithmMode = mode;
    state.algorithmStopRequested = false;
    updateAlgorithmButtonLabels();
    syncControls();

    void executeAlgorithmForCurrentCustomer();
}

function requestAlgorithmStop() {
    state.algorithmStopRequested = true;

    if (!state.isAutoRunning) {
        stopAlgorithmMode();
        return;
    }

    syncControls();
}

function stopAlgorithmMode() {
    state.algorithmMode = 'idle';
    state.algorithmStopRequested = false;
    updateAlgorithmButtonLabels();
    syncControls();
}

function maybeStartAutoRunCycle() {
    if (state.algorithmMode !== 'auto') {
        return;
    }

    if (state.algorithmStopRequested || state.isGameOver) {
        stopAlgorithmMode();
        return;
    }

    if (state.isAutoRunning || state.isTransitioning || !state.currentCustomer) {
        return;
    }

    setTimeout(() => {
        if (state.algorithmMode !== 'auto' || state.algorithmStopRequested || state.isGameOver || state.isTransitioning || state.isAutoRunning || !state.currentCustomer) {
            return;
        }

        void executeAlgorithmForCurrentCustomer();
    }, 200);
}

function canPlayerAct() {
    return !state.isGameOver && !state.isAutoRunning && !state.isTransitioning;
}

function syncControls() {
    const locked = state.isGameOver || state.isAutoRunning || state.isTransitioning;
    const sceneLocked = state.isAutoRunning || state.isTransitioning;
    const baseAlgoDisabled = state.isGameOver || !state.currentCustomer;
    const idleTransitionLock = state.algorithmMode === 'idle' && state.isTransitioning;

    elements.submitBtn.disabled = locked;
    elements.clearBtn.disabled = locked;
    elements.restartBtn.disabled = state.isAutoRunning;
    elements.runBtn.disabled = baseAlgoDisabled || state.algorithmMode === 'auto' || idleTransitionLock;
    elements.runAlgoBtn.disabled = baseAlgoDisabled || state.algorithmMode === 'run' || idleTransitionLock;
    elements.sceneBtns.forEach((button) => {
        button.disabled = sceneLocked;
    });

    elements.coinsRack.querySelectorAll('.coin-btn').forEach((button) => {
        button.disabled = locked;
    });

    elements.coinsRack.classList.toggle('is-disabled', locked);
}

function updateCodeDisplay() {
    const lines = ALGO_CODES[elements.algoSelect.value];
    elements.codeDisplay.innerHTML = '';

    lines.forEach((line, index) => {
        const lineElement = document.createElement('div');
        lineElement.className = 'code-line';
        lineElement.dataset.line = String(index);
        lineElement.innerHTML = renderHighlightedCodeLine(line);
        elements.codeDisplay.appendChild(lineElement);
    });

    updateAlgorithmVisualizationVisibility();
}

function updateAlgorithmVisualizationVisibility() {
    if (!elements.dpVisualization) {
        return;
    }

    const showDpVisualization = elements.algoSelect.value === 'dp';
    elements.dpVisualization.classList.toggle('hidden', !showDpVisualization);

    if (!showDpVisualization || state.dpViz) {
        return;
    }

    elements.dpVisContext.textContent = 'Run DP to watch min_piece_count_for_amount and first_coin_for_amount fill in real time.';
    elements.dpCurrentI.textContent = 'amount_index: -';
    elements.dpCurrentTest.textContent = 'candidate_check: -';
    elements.dpVisHeadRow.innerHTML = '';
    elements.dpVisDpRow.innerHTML = '';
    elements.dpVisCoinRow.innerHTML = '';
}

function resetDPVisualization() {
    state.dpViz = null;

    if (!elements.dpVisHeadRow) {
        return;
    }

    elements.dpVisContext.textContent = '';
    elements.dpCurrentI.textContent = 'amount_index: -';
    elements.dpCurrentTest.textContent = 'candidate_check: -';
    elements.dpVisHeadRow.innerHTML = '';
    elements.dpVisDpRow.innerHTML = '';
    elements.dpVisCoinRow.innerHTML = '';
}

function prepareAlgorithmVisualization(algorithmType, amount, denominations) {
    if (algorithmType !== 'dp') {
        resetDPVisualization();
        updateAlgorithmVisualizationVisibility();
        return;
    }

    initDPVisualization(amount, denominations);
    updateAlgorithmVisualizationVisibility();
}

function initDPVisualization(amount, denominations) {
    const filteredDenominations = [...new Set(
        denominations.filter((coin) => Number.isFinite(coin) && coin > 0)
    )].sort((a, b) => a - b);

    state.dpViz = {
        amount,
        denominations: filteredDenominations,
        dp: new Array(amount + 1).fill(undefined),
        firstCoin: new Array(amount + 1).fill(undefined),
        indexCells: [],
        dpCells: [],
        coinCells: [],
        currentIndex: null,
        lastUpdatedIndex: null
    };

    elements.dpVisContext.textContent = `amount = ${amount} | coin_values = [${filteredDenominations.join(', ')}]`;
    elements.dpCurrentI.textContent = 'amount_index: -';
    elements.dpCurrentTest.textContent = 'candidate_check: waiting for first transition';

    elements.dpVisHeadRow.innerHTML = '';
    elements.dpVisDpRow.innerHTML = '';
    elements.dpVisCoinRow.innerHTML = '';

    elements.dpVisHeadRow.appendChild(createDPRowLabelCell('amount_index'));
    elements.dpVisDpRow.appendChild(createDPRowLabelCell('min_piece_count_for_amount'));
    elements.dpVisCoinRow.appendChild(createDPRowLabelCell('first_coin_for_amount'));

    for (let i = 0; i <= amount; i += 1) {
        const indexCell = document.createElement('td');
        indexCell.textContent = String(i);
        indexCell.className = 'dp-cell-index';
        elements.dpVisHeadRow.appendChild(indexCell);

        const dpCell = document.createElement('td');
        dpCell.textContent = '·';
        dpCell.className = 'dp-cell-unset';
        elements.dpVisDpRow.appendChild(dpCell);

        const coinCell = document.createElement('td');
        coinCell.textContent = '·';
        coinCell.className = 'dp-cell-unset';
        elements.dpVisCoinRow.appendChild(coinCell);

        state.dpViz.indexCells.push(indexCell);
        state.dpViz.dpCells.push(dpCell);
        state.dpViz.coinCells.push(coinCell);
    }
}

function createDPRowLabelCell(text) {
    const labelCell = document.createElement('th');
    labelCell.textContent = text;
    labelCell.className = 'dp-row-label';
    return labelCell;
}

function applyAlgorithmStepVisualization(step, algorithmType) {
    if (algorithmType !== 'dp' || !step || !step.viz) {
        return;
    }

    applyDPVisualizationStep(step.viz);
}

function applyDPVisualizationStep(viz) {
    if (!state.dpViz || !viz) {
        return;
    }

    switch (viz.type) {
        case 'setup':
            elements.dpVisContext.textContent = `amount = ${viz.amount} | coin_values = [${viz.denominations.join(', ')}]`;
            break;
        case 'initBase':
            setDPValueCell(0, 0);
            setFirstCoinCell(0, 0);
            setDPCurrentColumn(0);
            elements.dpCurrentI.textContent = 'amount_index: 0';
            elements.dpCurrentTest.textContent = 'candidate_check: base case initialized';
            break;
        case 'initArrays':
            for (let i = 1; i <= viz.amount; i += 1) {
                setDPValueCell(i, Infinity);
                setFirstCoinCell(i, null);
            }
            setDPCurrentColumn(null);
            elements.dpCurrentI.textContent = 'amount_index: -';
            elements.dpCurrentTest.textContent = 'candidate_check: table initialized';
            break;
        case 'setCurrentI':
            setDPCurrentColumn(viz.i);
            elements.dpCurrentI.textContent = `amount_index: ${viz.i}`;
            break;
        case 'testCandidate': {
            setDPCurrentColumn(viz.i);
            elements.dpCurrentI.textContent = `amount_index: ${viz.i}`;
            const currentValue = viz.current === null ? 'INF' : String(viz.current);
            elements.dpCurrentTest.textContent = `candidate_coin=${viz.coin}: candidate_piece_count=${viz.candidate} < current_best=${currentValue} ?`;
            break;
        }
        case 'updateCell':
            setDPValueCell(viz.i, viz.value);
            setFirstCoinCell(viz.i, viz.coin);
            markDPColumnUpdated(viz.i);
            elements.dpCurrentI.textContent = `amount_index: ${viz.i}`;
            elements.dpCurrentTest.textContent = `updated min_piece_count_for_amount[${viz.i}] = ${viz.value}`;
            break;
        case 'summaryCell':
            setDPCurrentColumn(viz.i);
            setDPValueCell(viz.i, viz.value === null ? Infinity : viz.value);
            setFirstCoinCell(viz.i, viz.coin);
            if (viz.coin !== null) {
                markDPColumnUpdated(viz.i);
            }
            elements.dpCurrentI.textContent = `amount_index: ${viz.i}`;
            elements.dpCurrentTest.textContent = viz.coin === null
                ? `amount_index=${viz.i} unreachable`
                : `amount_index=${viz.i}, best candidate_coin=${viz.coin}`;
            break;
        case 'reconstructStart':
            setDPCurrentColumn(viz.cursor);
            elements.dpCurrentI.textContent = `reconstruction_remaining_amount: ${viz.cursor}`;
            elements.dpCurrentTest.textContent = 'candidate_check: reconstructing selected_coins';
            break;
        case 'reconstructPick':
            setDPCurrentColumn(viz.i);
            markDPColumnPath(viz.i);
            elements.dpCurrentI.textContent = `reconstruction_remaining_amount: ${viz.i}`;
            elements.dpCurrentTest.textContent = `picked first_coin_for_amount[${viz.i}] = ${viz.coin}, next remaining_amount=${viz.next}`;
            break;
        case 'noSolution':
            elements.dpCurrentTest.textContent = 'candidate_check: no solution';
            break;
        case 'done':
            setDPCurrentColumn(null);
            elements.dpCurrentI.textContent = 'amount_index: done';
            elements.dpCurrentTest.textContent = `candidate_check: selected_coins_count = ${viz.count}`;
            break;
        default:
            break;
    }
}

function setDPCurrentColumn(index) {
    if (!state.dpViz) {
        return;
    }

    const previousIndex = state.dpViz.currentIndex;

    if (previousIndex !== null && previousIndex >= 0 && previousIndex < state.dpViz.indexCells.length) {
        state.dpViz.indexCells[previousIndex].classList.remove('dp-cell-current');
        state.dpViz.dpCells[previousIndex].classList.remove('dp-cell-current');
        state.dpViz.coinCells[previousIndex].classList.remove('dp-cell-current');
    }

    if (index === null || index === undefined || index < 0 || index >= state.dpViz.indexCells.length) {
        state.dpViz.currentIndex = null;
        return;
    }

    state.dpViz.currentIndex = index;
    state.dpViz.indexCells[index].classList.add('dp-cell-current');
    state.dpViz.dpCells[index].classList.add('dp-cell-current');
    state.dpViz.coinCells[index].classList.add('dp-cell-current');
    state.dpViz.indexCells[index].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
    });
}

function setDPValueCell(index, value) {
    if (!state.dpViz || index < 0 || index >= state.dpViz.dpCells.length) {
        return;
    }

    const cell = state.dpViz.dpCells[index];
    state.dpViz.dp[index] = value;
    cell.classList.remove('dp-cell-unset', 'dp-cell-inf', 'dp-cell-value');

    if (value === undefined) {
        cell.textContent = '·';
        cell.classList.add('dp-cell-unset');
        return;
    }

    if (value === null || value === Infinity) {
        cell.textContent = 'INF';
        cell.classList.add('dp-cell-inf');
        return;
    }

    cell.textContent = String(value);
    cell.classList.add('dp-cell-value');
}

function setFirstCoinCell(index, coin) {
    if (!state.dpViz || index < 0 || index >= state.dpViz.coinCells.length) {
        return;
    }

    const cell = state.dpViz.coinCells[index];
    state.dpViz.firstCoin[index] = coin;
    cell.classList.remove('dp-cell-unset', 'dp-cell-value');

    if (coin === undefined) {
        cell.textContent = '·';
        cell.classList.add('dp-cell-unset');
        return;
    }

    if (coin === null || coin === -1) {
        cell.textContent = '—';
        cell.classList.add('dp-cell-unset');
        return;
    }

    cell.textContent = String(coin);
    cell.classList.add('dp-cell-value');
}

function markDPColumnUpdated(index) {
    if (!state.dpViz || index < 0 || index >= state.dpViz.dpCells.length) {
        return;
    }

    const previousIndex = state.dpViz.lastUpdatedIndex;
    if (previousIndex !== null && previousIndex >= 0 && previousIndex < state.dpViz.dpCells.length) {
        state.dpViz.dpCells[previousIndex].classList.remove('dp-cell-updated');
        state.dpViz.coinCells[previousIndex].classList.remove('dp-cell-updated');
    }

    state.dpViz.lastUpdatedIndex = index;
    state.dpViz.dpCells[index].classList.add('dp-cell-updated');
    state.dpViz.coinCells[index].classList.add('dp-cell-updated');
}

function markDPColumnPath(index) {
    if (!state.dpViz || index < 0 || index >= state.dpViz.dpCells.length) {
        return;
    }

    state.dpViz.dpCells[index].classList.add('dp-cell-path');
    state.dpViz.coinCells[index].classList.add('dp-cell-path');
    state.dpViz.indexCells[index].classList.add('dp-cell-path');
}

function renderHighlightedCodeLine(line) {
    const tokens = tokenizeCodeLine(line);
    return tokens.map((token) => renderCodeToken(token)).join('');
}

function tokenizeCodeLine(line) {
    const tokens = [];
    let index = 0;

    while (index < line.length) {
        const char = line[index];

        if (char === '/' && line[index + 1] === '/') {
            tokens.push({ type: 'comment', value: line.slice(index) });
            break;
        }

        if (char === '"' || char === "'") {
            let cursor = index + 1;

            while (cursor < line.length) {
                if (line[cursor] === '\\') {
                    cursor += 2;
                    continue;
                }

                if (line[cursor] === char) {
                    cursor += 1;
                    break;
                }

                cursor += 1;
            }

            tokens.push({ type: 'string', value: line.slice(index, cursor) });
            index = cursor;
            continue;
        }

        if (isDigit(char)) {
            let cursor = index + 1;

            while (cursor < line.length && /[0-9.]/.test(line[cursor])) {
                cursor += 1;
            }

            tokens.push({ type: 'number', value: line.slice(index, cursor) });
            index = cursor;
            continue;
        }

        if (isIdentifierStart(char)) {
            let cursor = index + 1;

            while (cursor < line.length && isIdentifierChar(line[cursor])) {
                cursor += 1;
            }

            const word = line.slice(index, cursor);
            const nextSignificantChar = getNextSignificantChar(line, cursor);
            let type = 'plain';

            if (CODE_KEYWORDS.has(word)) {
                type = 'keyword';
            } else if (CODE_BUILTINS.has(word)) {
                type = 'builtin';
            } else if (nextSignificantChar === '(') {
                type = 'function';
            }

            tokens.push({ type, value: word });
            index = cursor;
            continue;
        }

        if (isPunctuation(char)) {
            tokens.push({ type: 'punctuation', value: char });
            index += 1;
            continue;
        }

        if (isOperatorChar(char)) {
            let cursor = index + 1;

            while (cursor < line.length && isOperatorChar(line[cursor])) {
                cursor += 1;
            }

            tokens.push({ type: 'operator', value: line.slice(index, cursor) });
            index = cursor;
            continue;
        }

        tokens.push({ type: 'plain', value: char });
        index += 1;
    }

    return tokens;
}

function renderCodeToken(token) {
    const safeValue = escapeHtml(token.value);

    if (token.type === 'plain') {
        return safeValue;
    }

    return `<span class="code-token ${token.type}">${safeValue}</span>`;
}

function getNextSignificantChar(line, index) {
    let cursor = index;

    while (cursor < line.length) {
        const char = line[cursor];

        if (char !== ' ' && char !== '\t') {
            return char;
        }

        cursor += 1;
    }

    return '';
}

function isDigit(char) {
    return char >= '0' && char <= '9';
}

function isIdentifierStart(char) {
    return (char >= 'a' && char <= 'z') ||
        (char >= 'A' && char <= 'Z') ||
        char === '_' ||
        char === '$';
}

function isIdentifierChar(char) {
    return isIdentifierStart(char) || isDigit(char);
}

function isPunctuation(char) {
    return '{}[]();,.'.includes(char);
}

function isOperatorChar(char) {
    return '+-*/%=<>!&|?:'.includes(char);
}

function clampNumber(value, minValue, maxValue) {
    return Math.min(maxValue, Math.max(minValue, value));
}

function updateAlgorithmSpeedFromControl() {
    const parsed = Number(elements.algoSpeedSelect.value);
    const normalized = Number.isFinite(parsed)
        ? clampNumber(parsed, MIN_ALGORITHM_SPEED_MULTIPLIER, MAX_ALGORITHM_SPEED_MULTIPLIER)
        : 1;

    state.algorithmSpeedMultiplier = normalized;
    syncAlgorithmSpeedSelect(normalized);
}

function syncAlgorithmSpeedSelect(speedMultiplier) {
    const options = [...elements.algoSpeedSelect.options];

    if (options.length === 0) {
        return;
    }

    let nearestOption = options[0];
    let nearestDistance = Math.abs(speedMultiplier - Number(nearestOption.value));

    for (let index = 1; index < options.length; index += 1) {
        const option = options[index];
        const optionValue = Number(option.value);
        if (!Number.isFinite(optionValue)) {
            continue;
        }

        const distance = Math.abs(speedMultiplier - optionValue);
        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestOption = option;
        }
    }

    elements.algoSpeedSelect.value = nearestOption.value;
}

function getScaledAlgorithmDelay(baseDelayMs, minDelayMs, maxDelayMs) {
    const safeMultiplier = clampNumber(
        state.algorithmSpeedMultiplier,
        MIN_ALGORITHM_SPEED_MULTIPLIER,
        MAX_ALGORITHM_SPEED_MULTIPLIER
    );
    const scaledDelay = Math.round(baseDelayMs / safeMultiplier);
    return clampNumber(scaledDelay, minDelayMs, maxDelayMs);
}

function escapeHtml(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function highlightLine(lineIndex) {
    elements.codeDisplay.querySelectorAll('.code-line').forEach((lineElement) => {
        lineElement.classList.remove('highlight');
    });

    if (lineIndex === null || lineIndex === undefined) {
        return;
    }

    const targetLine = elements.codeDisplay.querySelector(`.code-line[data-line="${lineIndex}"]`);

    if (!targetLine) {
        return;
    }

    targetLine.classList.add('highlight');
    targetLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function executeAlgorithmForCurrentCustomer() {
    if (!state.currentCustomer || state.isGameOver || state.isTransitioning || state.isAutoRunning || state.algorithmMode === 'idle') {
        return;
    }

    const modeAtStart = state.algorithmMode;
    const session = ++state.algorithmSession;

    state.isAutoRunning = true;
    syncControls();

    clearTray(true);
    clearAlgorithmPanel();
    elements.algoPanel.classList.remove('hidden');

    const scene = SCENES[state.scene];
    const targetAmount = state.currentCustomer.amount;
    const algorithmType = elements.algoSelect.value;
    prepareAlgorithmVisualization(algorithmType, targetAmount, scene.denominations);
    const result = algorithmType === 'greedy'
        ? cashiersGreedy(targetAmount, scene.denominations)
        : minCoinsDP(targetAmount, scene.denominations);

    let runOutcome = 'completed';

    try {
        for (const step of result.steps) {
            if (shouldAbortAlgorithmRun(session)) {
                runOutcome = 'stopped';
                break;
            }

            const isQuickVisualizationStep = step.quick === true;
            const hasStepText = typeof step.text === 'string' && step.text.trim().length > 0;

            if (!isQuickVisualizationStep) {
                highlightLine(step.line);
            }

            if (hasStepText) {
                const stepParagraph = document.createElement('p');
                stepParagraph.textContent = step.text;
                elements.stepsDisplay.appendChild(stepParagraph);
                elements.stepsDisplay.scrollTop = elements.stepsDisplay.scrollHeight;
            }

            applyAlgorithmStepAction(step.action);
            applyAlgorithmStepVisualization(step, algorithmType);
            const stepDelay = isQuickVisualizationStep
                ? getScaledAlgorithmDelay(FAST_VIS_STEP_DELAY_MS, MIN_FAST_VIS_DELAY_MS, MAX_FAST_VIS_DELAY_MS)
                : getScaledAlgorithmDelay(STEP_DELAY_MS, MIN_STEP_DELAY_MS, MAX_STEP_DELAY_MS);
            await sleep(stepDelay);
        }

        highlightLine(null);

        if (runOutcome === 'stopped') {
            return;
        }

        if (!result.success) {
            showFeedback(getString('feedbackNoSolution'), false);
            runOutcome = 'failed';
            return;
        }

        if (modeAtStart === 'auto') {
            if (shouldAbortAlgorithmRun(session)) {
                runOutcome = 'stopped';
                return;
            }

            await sleep(getScaledAlgorithmDelay(AUTO_SUBMIT_DELAY_MS, MIN_AUTO_SUBMIT_DELAY_MS, MAX_AUTO_SUBMIT_DELAY_MS));

            if (shouldAbortAlgorithmRun(session)) {
                runOutcome = 'stopped';
                return;
            }

            checkAnswer({ bypassLock: true });
        }
    } finally {
        highlightLine(null);

        if (session === state.algorithmSession) {
            state.isAutoRunning = false;
        }

        finalizeAlgorithmRun(modeAtStart, runOutcome, session);
    }
}

function shouldAbortAlgorithmRun(session) {
    return session !== state.algorithmSession ||
        state.algorithmStopRequested ||
        state.algorithmMode === 'idle' ||
        state.isGameOver;
}

function finalizeAlgorithmRun(modeAtStart, runOutcome, session) {
    if (session !== state.algorithmSession) {
        return;
    }

    if (runOutcome === 'stopped' || state.algorithmStopRequested) {
        stopAlgorithmMode();
        return;
    }

    if (runOutcome === 'failed') {
        stopAlgorithmMode();
        return;
    }

    if (modeAtStart === 'run') {
        stopAlgorithmMode();
        return;
    }

    updateAlgorithmButtonLabels();
    syncControls();
}

function applyAlgorithmStepAction(action) {
    if (!action) {
        return;
    }

    if (action.type === 'clear') {
        clearTray(true);
        return;
    }

    if (action.type === 'add' && typeof action.coin === 'number') {
        addCoin(action.coin, { bypassLock: true });
        return;
    }

    if (action.type === 'removeLast' && state.playerCoins.length > 0) {
        state.playerCoins.pop();

        const lastCoin = elements.playerTray.lastElementChild;
        if (lastCoin) {
            lastCoin.remove();
        }

        updateTotal();
    }
}

function sleep(durationMs) {
    return new Promise((resolve) => {
        setTimeout(resolve, durationMs);
    });
}

init();
