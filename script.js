// ===== DOM ELEMENTS =====
const siteSelectorScreen   = document.getElementById('siteSelectorScreen');
const mainApp              = document.getElementById('mainApp');
const hgniceBtn            = document.getElementById('hgniceBtn');
const dkwinBtn             = document.getElementById('dkwinBtn');
const homeIcon             = document.getElementById('homeIcon');
const platformTag          = document.getElementById('platformTag');

const periodDisplay        = document.getElementById('periodDisplay');
const timerSecondsSpan     = document.getElementById('timerSeconds');
const predictionNumber     = document.getElementById('predictionNumber');
const sizeValue            = document.getElementById('sizeValue');
const colorValue           = document.getElementById('colorValue');
const timeModeLabel        = document.getElementById('timeModeLabel');
const statusText           = document.getElementById('statusText');
const statusBar            = document.getElementById('statusBar');

const modalOverlay         = document.getElementById('modalOverlay');
const settingsIcon         = document.getElementById('settingsIcon');
const closeModalBtn        = document.getElementById('closeModalBtn');
const periodInput          = document.getElementById('periodInput');
const timeOptions          = document.querySelectorAll('.time-option');
const modalStartBtn        = document.getElementById('modalStartBtn');
const modalStopBtn         = document.getElementById('modalStopBtn');

const sizeCard             = document.getElementById('sizeCard');
const colorCard            = document.getElementById('colorCard');
const numberBox            = document.querySelector('#numberBox span');

// ===== STATE =====
let selectedTimeSec = 30;
let currentPeriod   = 11181;
let timerInterval   = null;
let isActive        = false;
let timeLeft        = 0;

// ===== SITE SELECTOR =====
function launchSite(siteKey) {
    platformTag.textContent = siteKey === 'hgnice' ? 'HGNICE' : 'DKWIN';
    siteSelectorScreen.style.display = 'none';
    mainApp.style.display = 'flex';
    initialPreview();
}

hgniceBtn.addEventListener('click', () => launchSite('hgnice'));
dkwinBtn.addEventListener('click',  () => launchSite('dkwin'));

homeIcon.addEventListener('click', () => {
    stopAndReset();
    mainApp.style.display = 'none';
    siteSelectorScreen.style.display = 'flex';
    modalOverlay.classList.remove('show');
});

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
    } else {
        size = "BIG";   color = "RED";       colorType = "red";
    }

    return { number, size, color, colorType };
}

// ===== UPDATE UI =====
function updatePredictionUI() {
    const { number, size, color, colorType } = generateRandomSignal();

    predictionNumber.classList.remove('animate-pop');
    sizeValue.classList.remove('animate-pop');
    colorValue.classList.remove('animate-pop');
    void predictionNumber.offsetWidth;

    predictionNumber.textContent = number;
    sizeValue.textContent        = size;
    colorValue.textContent       = color;

    numberBox.classList.remove('color-green-text', 'color-red-text', 'color-violet-text');
    sizeCard.classList.remove('bg-green-light', 'bg-red-light', 'bg-violet-light');
    colorCard.classList.remove('bg-green-light', 'bg-red-light', 'bg-violet-light');

    if (colorType === 'green') {
        numberBox.classList.add('color-green-text');
        sizeCard.classList.add('bg-green-light');
        colorCard.classList.add('bg-green-light');
    } else if (colorType === 'red') {
        numberBox.classList.add('color-red-text');
        sizeCard.classList.add('bg-red-light');
        colorCard.classList.add('bg-red-light');
    } else if (colorType === 'violet') {
        numberBox.classList.add('color-violet-text');
        sizeCard.classList.add('bg-violet-light');
        colorCard.classList.add('bg-violet-light');
    }

    predictionNumber.classList.add('animate-pop');
    sizeValue.classList.add('animate-pop');
    colorValue.classList.add('animate-pop');
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

    statusText.textContent      = '🟢 RUNNING';
    statusBar.style.background  = 'rgba(0,170,85,0.2)';
    statusText.style.color      = '#88ffcc';

    modalOverlay.classList.remove('show');
}

// ===== STOP =====
function stopAndReset() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    isActive = false;
    timerSecondsSpan.innerText   = "0";
    periodDisplay.innerText      = currentPeriod;

    predictionNumber.textContent = "?";
    sizeValue.textContent        = "---";
    colorValue.textContent       = "---";

    numberBox.classList.remove('color-green-text', 'color-red-text', 'color-violet-text');
    sizeCard.classList.remove('bg-green-light', 'bg-red-light', 'bg-violet-light');
    colorCard.classList.remove('bg-green-light', 'bg-red-light', 'bg-violet-light');

    statusText.textContent     = '⚫ STOPPED';
    statusBar.style.background = 'rgba(50,50,50,0.35)';
    statusText.style.color     = '#888';
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
    predictionNumber.textContent = number;
    sizeValue.textContent        = size;
    colorValue.textContent       = color;
}

periodInput.addEventListener('focus', (e) => e.stopPropagation());
