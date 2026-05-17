// DOM এলিমেন্টস
const predictionNumber = document.getElementById('predictionNumber');
const predictionSize = document.getElementById('predictionSize');
const predictionColor = document.getElementById('predictionColor');
const periodDisplay = document.getElementById('periodNumberDisplay');
const countdownTimer = document.getElementById('countdownTimer');
const timeModeText = document.getElementById('timeModeText');
const periodInput = document.getElementById('periodInput');
const timeOptions = document.querySelectorAll('.time-option');
const saveStartBtn = document.getElementById('saveStartBtn');
const stopResetBtn = document.getElementById('stopResetBtn');

// সেটিংস প্যানেল ড্র্যাগ
const settingsPanel = document.getElementById('settingsPanel');
const dragHandle = document.getElementById('dragHandle');
const smallBtn = document.getElementById('makeSmall');
const largeBtn = document.getElementById('makeLarge');

// স্টেট
let selectedTimeSec = 30;
let currentPeriod = 11181;
let timerInterval = null;
let isActive = false;
let timeLeft = 0;

// র্যান্ডম সিগন্যাল জেনারেটর + কালার হাইলাইট
function generateRandomSignal() {
    const number = Math.floor(Math.random() * 10);
    let size = "";
    let color = "";
    let colorClass = "";

    if (number === 0) {
        size = "SMALL";
        color = "VIOLET / RED";
        colorClass = "color-violet";
    } 
    else if (number === 5) {
        size = "BIG";
        color = "VIOLET / GREEN";
        colorClass = "color-violet";
    }
    else if ([1, 3, 7, 9].includes(number)) {
        size = "SMALL";
        color = "GREEN";
        colorClass = "color-green";
    }
    else if ([2, 4, 6, 8].includes(number)) {
        size = "BIG";
        color = "RED";
        colorClass = "color-red";
    }

    return { number, size, color, colorClass };
}

// UI আপডেট (হাইলাইট সহ)
function updatePredictionUI() {
    const { number, size, color, colorClass } = generateRandomSignal();
    
    // এনিমেশন
    predictionNumber.classList.remove('animate-pop');
    predictionSize.classList.remove('animate-pop');
    predictionColor.classList.remove('animate-pop');
    
    void predictionNumber.offsetWidth;
    
    // নাম্বার আপডেট
    predictionNumber.textContent = number;
    predictionSize.textContent = size;
    predictionColor.textContent = color;
    
    // কালার হাইলাইট (যে ক্যাটাগরিতে পড়ে)
    predictionNumber.className = 'prediction-number animate-pop ' + colorClass;
    
    // সাইজ বক্সের ব্যাকগ্রাউন্ড হাইলাইট
    const sizeBox = document.querySelector('.size-box');
    const colorBox = document.querySelector('.color-box');
    
    sizeBox.classList.remove('bg-green', 'bg-red', 'bg-violet');
    colorBox.classList.remove('bg-green', 'bg-red', 'bg-violet');
    
    if (color.includes('GREEN')) {
        sizeBox.classList.add('bg-green');
        colorBox.classList.add('bg-green');
    } else if (color.includes('RED')) {
        sizeBox.classList.add('bg-red');
        colorBox.classList.add('bg-red');
    } else if (color.includes('VIOLET')) {
        sizeBox.classList.add('bg-violet');
        colorBox.classList.add('bg-violet');
    }
    
    predictionSize.classList.add('animate-pop');
    predictionColor.classList.add('animate-pop');
}

// কাউন্টডাউন স্টার্ট
function startCountdown(seconds) {
    if (timerInterval) clearInterval(timerInterval);
    timeLeft = seconds;
    countdownTimer.innerText = timeLeft;
    
    timerInterval = setInterval(() => {
        if (!isActive) return;
        if (timeLeft <= 1) {
            clearInterval(timerInterval);
            countdownTimer.innerText = 0;
            onRoundComplete();
        } else {
            timeLeft--;
            countdownTimer.innerText = timeLeft;
        }
    }, 1000);
}

// রাউন্ড শেষ হলে
function onRoundComplete() {
    if (!isActive) return;
    currentPeriod++;
    periodDisplay.innerText = currentPeriod;
    periodInput.value = currentPeriod;
    updatePredictionUI();
    startCountdown(selectedTimeSec);
}

// সেভ ও শুরু
function saveAndStart() {
    if (timerInterval) clearInterval(timerInterval);
    
    let newPeriod = parseInt(periodInput.value);
    if (isNaN(newPeriod) || newPeriod < 1) newPeriod = 1;
    currentPeriod = newPeriod;
    periodDisplay.innerText = currentPeriod;
    
    isActive = true;
    updatePredictionUI();
    startCountdown(selectedTimeSec);
    
    // স্ট্যাটাস আপডেট
    document.querySelector('.status-bar span').innerHTML = '🟢 চলছে...';
    document.querySelector('.status-bar').style.background = '#00aa5533';
}

// স্টপ/রিসেট
function stopAndReset() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    isActive = false;
    countdownTimer.innerText = "0";
    
    currentPeriod = parseInt(periodInput.value);
    periodDisplay.innerText = currentPeriod;
    
    predictionNumber.textContent = "?";
    predictionSize.textContent = "---";
    predictionColor.textContent = "-----";
    predictionNumber.className = 'prediction-number';
    
    document.querySelector('.status-bar span').innerHTML = '⚫ বন্ধ';
    document.querySelector('.status-bar').style.background = '#33333355';
}

// টাইমার অপশন
timeOptions.forEach(btn => {
    btn.addEventListener('click', () => {
        const timeVal = parseInt(btn.getAttribute('data-time'));
        selectedTimeSec = timeVal;
        
        timeOptions.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // হেডারে টেক্সট আপডেট
        if (selectedTimeSec === 30) {
            timeModeText.innerText = '30 SECOND';
        } else {
            timeModeText.innerText = '1 MINUTE';
        }
    });
});

// ডিফল্ট সিলেক্ট
document.querySelector('.time-option[data-time="30"]').classList.add('active');

// ========= ড্র্যাগেবল ফাংশন =========
let isDragging = false;
let offsetX, offsetY;

dragHandle.addEventListener('mousedown', (e) => {
    if (e.target.closest('.resize-controls')) return;
    isDragging = true;
    offsetX = e.clientX - settingsPanel.offsetLeft;
    offsetY = e.clientY - settingsPanel.offsetTop;
    settingsPanel.style.cursor = 'grabbing';
    e.preventDefault();
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    let left = e.clientX - offsetX;
    let top = e.clientY - offsetY;
    left = Math.min(window.innerWidth - settingsPanel.offsetWidth - 10, Math.max(10, left));
    top = Math.min(window.innerHeight - settingsPanel.offsetHeight - 10, Math.max(10, top));
    settingsPanel.style.left = left + 'px';
    settingsPanel.style.top = top + 'px';
    settingsPanel.style.right = 'auto';
    settingsPanel.style.transform = 'none';
});

window.addEventListener('mouseup', () => {
    isDragging = false;
    settingsPanel.style.cursor = 'grab';
});

// টাচ সাপোর্ট
dragHandle.addEventListener('touchstart', (e) => {
    if (e.target.closest('.resize-controls')) return;
    const touch = e.touches[0];
    isDragging = true;
    offsetX = touch.clientX - settingsPanel.offsetLeft;
    offsetY = touch.clientY - settingsPanel.offsetTop;
    e.preventDefault();
});

window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    let left = touch.clientX - offsetX;
    let top = touch.clientY - offsetY;
    left = Math.min(window.innerWidth - settingsPanel.offsetWidth - 10, Math.max(10, left));
    top = Math.min(window.innerHeight - settingsPanel.offsetHeight - 10, Math.max(10, top));
    settingsPanel.style.left = left + 'px';
    settingsPanel.style.top = top + 'px';
    settingsPanel.style.right = 'auto';
    settingsPanel.style.transform = 'none';
});

window.addEventListener('touchend', () => {
    isDragging = false;
});

// রিসাইজ ফাংশন
smallBtn.addEventListener('click', () => {
    settingsPanel.classList.remove('large-mode');
    settingsPanel.classList.add('small-mode');
});

largeBtn.addEventListener('click', () => {
    settingsPanel.classList.remove('small-mode');
    settingsPanel.classList.add('large-mode');
});

// প্রিভিউ লোড
function initialPreview() {
    const { number, size, color, colorClass } = generateRandomSignal();
    predictionNumber.textContent = number;
    predictionSize.textContent = size;
    predictionColor.textContent = color;
    predictionNumber.className = 'prediction-number ' + colorClass;
}
initialPreview();

// বাটন ইভেন্ট
saveStartBtn.addEventListener('click', saveAndStart);
stopResetBtn.addEventListener('click', stopAndReset);