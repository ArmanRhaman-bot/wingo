// ===== SITE URLS =====
const SITES = {
    hgnice: "https://hgnice.biz/#/register?invitationCode=255721948910",
    dkwin:  "https://dkwin9.com/#/register?invitationCode=87267393546"
};

// ===== DOM ELEMENTS =====
const siteSelectorScreen   = document.getElementById('siteSelectorScreen');
const mainApp              = document.getElementById('mainApp');
const mainIframe           = document.getElementById('mainIframe');
const hgniceBtn            = document.getElementById('hgniceBtn');
const dkwinBtn             = document.getElementById('dkwinBtn');
const homeIcon             = document.getElementById('homeIcon');

const periodDisplay        = document.getElementById('periodDisplay');
const timerSecondsSpan     = document.getElementById('timerSeconds');
const predictionNumberSpan = document.getElementById('predictionNumber');
const sizeValueSpan        = document.getElementById('sizeValue');
const colorValueSpan       = document.getElementById('colorValue');
const timeModeLabel        = document.getElementById('timeModeLabel');
const statusBarSpan        = document.querySelector('#statusBar span');
const statusBarDiv         = document.getElementById('statusBar');

const modalOverlay         = document.getElementById('modalOverlay');
const settingsIcon         = document.getElementById('settingsIcon');
const closeModalBtn        = document.getElementById('closeModalBtn');
const periodInput          = document.getElementById('periodInput');
const timeOptions          = document.querySelectorAll('.time-option');
const modalStartBtn        = document.getElementById('modalStartBtn');
const modalStopBtn         = document.getElementById('modalStopBtn');

const sizeCard             = document.getElementById('sizeCard');
const colorCard            = document.getElementById('colorCard');
const numberBoxSpan        = document.querySelector('#numberBox span');
const predictionWidget     = document.getElementById('predictionWidget');

// ===== STATE =====
let selectedTimeSec = 30;
let currentPeriod   = 11181;
let timerInterval   = null;
let isActive        = false;
let timeLeft        = 0;

// ===== SITE SELECTOR =====
function launchSite(siteKey) {
    mainIframe.src = SITES[siteKey];
    siteSelectorScreen.style.display = 'none';
    mainApp.style.display = 'block';
    // Reset widget to top-right on each launch
    predictionWidget.style.top    = '10px';
    predictionWidget.style.right  = '10px';
    predictionWidget.style.left   = 'auto';
    predictionWidget.style.bottom = 'auto';
    initialPreview();
}

hgniceBtn.addEventListener('click', () => launchSite('hgnice'));
dkwinBtn.addEventListener('click',  () => launchSite('dkwin'));

homeIcon.addEventListener('click', () => {
    stopAndReset();
    mainApp.style.display = 'none';
    mainIframe.src = '';
    siteSelectorScreen.style.display = 'flex';
    modalOverlay.classList.remove('show');
});

// ===== DRAGGABLE WIDGET =====
(function makeDraggable() {
    let isDragging = false;
    let startX, startY, origLeft, origTop;

    function getWidgetLeft() {
        return predictionWidget.getBoundingClientRect().left;
    }
    function getWidgetTop() {
        return predictionWidget.getBoundingClientRect().top;
    }

    function applyPos(left, top) {
        const w = predictionWidget.offsetWidth;
        const h = predictionWidget.offsetHeight;
        left = Math.max(0, Math.min(window.innerWidth  - w, left));
        top  = Math.max(0, Math.min(window.innerHeight - h, top));
        predictionWidget.style.left   = left + 'px';
        predictionWidget.style.top    = top  + 'px';
        predictionWidget.style.right  = 'auto';
        predictionWidget.style.bottom = 'auto';
    }

    function onDragStart(clientX, clientY) {
        isDragging = true;
        startX   = clientX;
        startY   = clientY;
        origLeft = getWidgetLeft();
        origTop  = getWidgetTop();
        predictionWidget.classList.add('dragging');
    }

    function onDragMove(clientX, clientY) {
        if (!isDragging) return;
        applyPos(
            origLeft + (clientX - startX),
            origTop  + (clientY - startY)
        );
    }

    function onDragEnd() {
        if (!isDragging) return;
        isDragging = false;
        predictionWidget.classList.remove('dragging');
    }

    // Touch
    predictionWidget.addEventListener('touchstart', (e) => {
        if (e.target.closest('button')) return;
        const t = e.touches[0];
        onDragStart(t.clientX, t.clientY);
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const t = e.touches[0];
        onDragMove(t.clientX, t.clientY);
    }, { passive: true });

    document.addEventListener('touchend', onDragEnd);

    // Mouse
    predictionWidget.addEventListener('mousedown', (e) => {
        if (e.target.closest('button')) return;
        onDragStart(e.clientX, e.clientY);
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        onDragMove(e.clientX, e.clientY);
    });

    document.addEventListener('mouseup', onDragEnd);
})();

// ===== SIGNAL GENERATOR =====
function generateRandomSignal() {
    const number = Math.floor(Math.random() * 10);
    let size = "", color = "", colorType = "";

    if (number === 0) {
        size = "SMALL"; color = "VIO/RED";   colorType = "violet";
    } else if (number === 5) {
        size = "BIG";   color = "VIO/GREEN"; colorType = "violet";
    } else if ([1, 3, 7, 9].includes(number)) {
        size = "SMALL"; color = "GREEN";     colorType = "green";
    } else if ([2, 4, 6, 8].includes(number)) {
        size = "BIG";   color = "RED";       colorType = "red";
    }

    return { number, size, color, colorType };
}

// ===== UPDATE UI =====
function updatePredictionUI() {
    const { number, size, color, colorType } = generateRandomSignal();

    // Remove old animations
    predictionNumberSpan.classList.remove('animate-pop');
    sizeValueSpan.classList.remove('animate-pop');
    colorValueSpan.classList.remove('animate-pop');
    void predictionNumberSpan.offsetWidth; // reflow

    predictionNumberSpan.textContent = number;
    sizeValueSpan.textContent        = size;
    colorValueSpan.textContent       = color;

    // Clear old highlight
    numberBoxSpan.classList.remove(
        'color-green-text', 'color-red-text', 'color-violet-text'
    );
    sizeCard.classList.remove(
        'bg-green-light', 'bg-red-light', 'bg-violet-light'
    );
    colorCard.classList.remove(
        'bg-green-light', 'bg-red-light', 'bg-violet-light'
    );

    // Apply new highlight
    if (colorType === 'green') {
        numberBoxSpan.classList.add('color-green-text');
        sizeCard.classList.add('bg-green-light');
        colorCard.classList.add('bg-green-light');
    } else if (colorType === 'red') {
        numberBoxSpan.classList.add('color-red-text');
        sizeCard.classList.add('bg-red-light');
        colorCard.classList.add('bg-red-light');
    } else if (colorType === 'violet') {
        numberBoxSpan.classList.add('color-violet-text');
        sizeCard.classList.add('bg-violet-light');
        colorCard.classList.add('bg-violet-light');
    }

    predictionNumberSpan.classList.add('animate-pop');
    sizeValueSpan.classList.add('animate-pop');
    colorValueSpan.classList.add('animate-pop');
}

// ===== COUNTDOWN =====
function startCountdown(seconds) {
    if (timerInterval) clearInterval(timerInterval);
    timeLeft = seconds;
    timerSecondsSpan.innerText = timeLeft;

    timerInterval = setInterval(() => {
        if (!isActive) return;
        if (timeLeft <= 1) {
            clearInterval(timerInterval);
            timerSecondsSpan.innerText = 0;
            onRoundComplete();
        } else {
            timeLeft--;
            timerSecondsSpan.innerText = timeLeft;
        }
    }, 1000);
}

function onRoundComplete() {
    if (!isActive) return;
    currentPeriod++;
    periodDisplay.innerText = currentPeriod;
    periodInput.value        = currentPeriod;
    updatePredictionUI();
    startCountdown(selectedTimeSec);
}

// ===== START =====
function saveAndStart() {
    if (timerInterval) clearInterval(timerInterval);

    let newPeriod = parseInt(periodInput.value);
    if (isNaN(newPeriod) || newPeriod < 1) newPeriod = 1;
    currentPeriod = newPeriod;
    periodDisplay.innerText = currentPeriod;

    isActive = true;
    updatePredictionUI();
    startCountdown(selectedTimeSec);

    statusBarSpan.textContent      = '🟢 RUNNING';
    statusBarDiv.style.background  = 'rgba(0,170,85,0.2)';
    statusBarSpan.style.color      = '#88ffcc';

    modalOverlay.classList.remove('show');
}

// ===== STOP =====
function stopAndReset() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    isActive = false;
    timerSecondsSpan.innerText   = "0";
    periodDisplay.innerText      = currentPeriod;

    predictionNumberSpan.textContent = "?";
    sizeValueSpan.textContent        = "---";
    colorValueSpan.textContent       = "---";

    numberBoxSpan.classList.remove(
        'color-green-text', 'color-red-text', 'color-violet-text'
    );
    sizeCard.classList.remove(
        'bg-green-light', 'bg-red-light', 'bg-violet-light'
    );
    colorCard.classList.remove(
        'bg-green-light', 'bg-red-light', 'bg-violet-light'
    );

    statusBarSpan.textContent     = '⚫ STOPPED';
    statusBarDiv.style.background = 'rgba(50,50,50,0.35)';
    statusBarSpan.style.color     = '#888';
}

// ===== TIME OPTIONS =====
timeOptions.forEach(btn => {
    btn.addEventListener('click', () => {
        selectedTimeSec = parseInt(btn.getAttribute('data-time'));
        timeOptions.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        timeModeLabel.innerText = selectedTimeSec === 30 ? "30 SEC" : "1 MIN";
    });
});

// Default: 30 sec active
document.querySelector('.time-option[data-time="30"]').classList.add('active');

// ===== MODAL =====
settingsIcon.addEventListener('click', () => {
    periodInput.value = currentPeriod;
    modalOverlay.classList.add('show');
});

closeModalBtn.addEventListener('click', () => {
    modalOverlay.classList.remove('show');
});

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) modalOverlay.classList.remove('show');
});

modalStartBtn.addEventListener('click', saveAndStart);

modalStopBtn.addEventListener('click', () => {
    stopAndReset();
    modalOverlay.classList.remove('show');
});

// ===== INITIAL PREVIEW =====
function initialPreview() {
    const { number, size, color } = generateRandomSignal();
    predictionNumberSpan.textContent = number;
    sizeValueSpan.textContent        = size;
    colorValueSpan.textContent       = color;
}

periodInput.addEventListener('focus', (e) => e.stopPropagation());