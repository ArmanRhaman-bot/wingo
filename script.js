// DOM এলিমেন্টস
const widget = document.getElementById('signalWidget');
const dragHandle = document.getElementById('dragHandle');
const signalNumberDiv = document.getElementById('signalNumber');
const signalSizeDiv = document.getElementById('signalSize');
const signalColorDiv = document.getElementById('signalColor');

const periodNumberInput = document.getElementById('periodNumber');
const timerBtns = document.querySelectorAll('.timer-btn');
const saveStartBtn = document.getElementById('saveStartBtn');
const stopResetBtn = document.getElementById('stopResetBtn');
const timerDisplaySpan = document.getElementById('timerDisplay');
const currentPeriodSpan = document.getElementById('currentPeriodLabel');

const smallBtn = document.getElementById('makeSmall');
const largeBtn = document.getElementById('makeLarge');

// স্টেট
let selectedTimeSec = 30;
let currentPeriod = 1;
let timerInterval = null;
let isActive = false;
let timeLeft = 0;

// র্যান্ডম সিগন্যাল জেনারেটর
function generateRandomSignal() {
    const number = Math.floor(Math.random() * 10);
    let size = "";
    let color = "";

    if (number === 0) {
        size = "SMALL";
        color = "VIOLET/RED";
    } 
    else if (number === 5) {
        size = "BIG";
        color = "VIOLET/GREEN";
    }
    else if ([1, 3, 7, 9].includes(number)) {
        size = "SMALL";
        color = "GREEN";
    }
    else if ([2, 4, 6, 8].includes(number)) {
        size = "BIG";
        color = "RED";
    }

    return { number, size, color };
}

// UI আপডেট
function updateSignalUI() {
    const { number, size, color } = generateRandomSignal();
    
    signalNumberDiv.classList.remove('animate-pop');
    signalSizeDiv.classList.remove('animate-pop');
    signalColorDiv.classList.remove('animate-pop');
    
    void signalNumberDiv.offsetWidth;
    signalNumberDiv.textContent = number;
    signalSizeDiv.textContent = size;
    signalColorDiv.textContent = color;
    
    signalNumberDiv.classList.add('animate-pop');
    signalSizeDiv.classList.add('animate-pop');
    signalColorDiv.classList.add('animate-pop');
}

// কাউন্টডাউন
function startCountdown(seconds) {
    if (timerInterval) clearInterval(timerInterval);
    timeLeft = seconds;
    timerDisplaySpan.innerText = timeLeft;
    
    timerInterval = setInterval(() => {
        if (!isActive) return;
        if (timeLeft <= 1) {
            clearInterval(timerInterval);
            timerDisplaySpan.innerText = 0;
            onRoundComplete();
        } else {
            timeLeft--;
            timerDisplaySpan.innerText = timeLeft;
        }
    }, 1000);
}

// রাউন্ড শেষ হলে
function onRoundComplete() {
    if (!isActive) return;
    currentPeriod++;
    currentPeriodSpan.innerText = currentPeriod;
    periodNumberInput.value = currentPeriod;
    updateSignalUI();
    startCountdown(selectedTimeSec);
}

// সেভ ও শুরু
function saveAndStart() {
    if (timerInterval) clearInterval(timerInterval);
    
    let newPeriod = parseInt(periodNumberInput.value);
    if (isNaN(newPeriod) || newPeriod < 1) newPeriod = 1;
    currentPeriod = newPeriod;
    currentPeriodSpan.innerText = currentPeriod;
    
    isActive = true;
    updateSignalUI();
    startCountdown(selectedTimeSec);
}

// স্টপ/রিসেট
function stopAndReset() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    isActive = false;
    timerDisplaySpan.innerText = "0";
    
    currentPeriod = 1;
    currentPeriodSpan.innerText = "1";
    periodNumberInput.value = 1;
    
    signalNumberDiv.textContent = "--";
    signalSizeDiv.textContent = "---";
    signalColorDiv.textContent = "-----";
}

// টাইমার বাটন
timerBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const timeVal = parseInt(btn.getAttribute('data-time'));
        selectedTimeSec = (timeVal === 60) ? 60 : 30;
        timerBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

document.querySelector('.timer-btn[data-time="30"]').classList.add('active');

// ড্র্যাগেবল
let isDragging = false;
let offsetX, offsetY;

dragHandle.addEventListener('mousedown', (e) => {
    if (e.target.closest('.resize-controls')) return;
    isDragging = true;
    offsetX = e.clientX - widget.offsetLeft;
    offsetY = e.clientY - widget.offsetTop;
    widget.style.cursor = 'grabbing';
    e.preventDefault();
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    let left = e.clientX - offsetX;
    let top = e.clientY - offsetY;
    left = Math.min(window.innerWidth - widget.offsetWidth - 5, Math.max(5, left));
    top = Math.min(window.innerHeight - widget.offsetHeight - 10, Math.max(5, top));
    widget.style.left = left + 'px';
    widget.style.top = top + 'px';
    widget.style.right = 'auto';
});

window.addEventListener('mouseup', () => {
    isDragging = false;
    widget.style.cursor = 'grab';
});

// টাচ সাপোর্ট
dragHandle.addEventListener('touchstart', (e) => {
    if (e.target.closest('.resize-controls')) return;
    const touch = e.touches[0];
    isDragging = true;
    offsetX = touch.clientX - widget.offsetLeft;
    offsetY = touch.clientY - widget.offsetTop;
    e.preventDefault();
});

window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    let left = touch.clientX - offsetX;
    let top = touch.clientY - offsetY;
    left = Math.min(window.innerWidth - widget.offsetWidth - 5, Math.max(5, left));
    top = Math.min(window.innerHeight - widget.offsetHeight - 10, Math.max(5, top));
    widget.style.left = left + 'px';
    widget.style.top = top + 'px';
    widget.style.right = 'auto';
});

window.addEventListener('touchend', () => {
    isDragging = false;
});

// রিসাইজ
smallBtn.addEventListener('click', () => {
    widget.classList.remove('large-mode');
    widget.classList.add('small-mode');
});

largeBtn.addEventListener('click', () => {
    widget.classList.remove('small-mode');
    widget.classList.add('large-mode');
});

// প্রিভিউ লোড
function initialPreview() {
    const { number, size, color } = generateRandomSignal();
    signalNumberDiv.textContent = number;
    signalSizeDiv.textContent = size;
    signalColorDiv.textContent = color;
}
initialPreview();

saveStartBtn.addEventListener('click', saveAndStart);
stopResetBtn.addEventListener('click', stopAndReset);