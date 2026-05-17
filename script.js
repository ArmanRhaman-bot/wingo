// DOM এলিমেন্টস
const periodDisplay = document.getElementById('periodDisplay');
const timerSecondsSpan = document.getElementById('timerSeconds');
const predictionNumberSpan = document.getElementById('predictionNumber');
const sizeValueSpan = document.getElementById('sizeValue');
const colorValueSpan = document.getElementById('colorValue');
const timeModeLabel = document.getElementById('timeModeLabel');
const statusBarSpan = document.querySelector('#statusBar span');
const statusBarDiv = document.getElementById('statusBar');

// মোডাল এলিমেন্টস
const modalOverlay = document.getElementById('modalOverlay');
const settingsIcon = document.getElementById('settingsIcon');
const closeModalBtn = document.getElementById('closeModalBtn');
const periodInput = document.getElementById('periodInput');
const timeOptions = document.querySelectorAll('.time-option');
const modalStartBtn = document.getElementById('modalStartBtn');
const modalStopBtn = document.getElementById('modalStopBtn');

// কার্ড এলিমেন্টস (হাইলাইটের জন্য)
const sizeCard = document.getElementById('sizeCard');
const colorCard = document.getElementById('colorCard');
const numberBoxSpan = document.querySelector('#numberBox span');

// স্টেট ভ্যারিয়েবল
let selectedTimeSec = 30;    // 30 বা 60
let currentPeriod = 11181;
let timerInterval = null;
let isActive = false;
let timeLeft = 0;

// ========= র‍্যান্ডম সিগন্যাল জেনারেটর =========
function generateRandomSignal() {
    const number = Math.floor(Math.random() * 10);
    let size = "";
    let color = "";
    let colorType = ""; // green, red, violet

    if (number === 0) {
        size = "SMALL";
        color = "VIOLET / RED";
        colorType = "violet";
    } 
    else if (number === 5) {
        size = "BIG";
        color = "VIOLET / GREEN";
        colorType = "violet";
    }
    else if ([1, 3, 7, 9].includes(number)) {
        size = "SMALL";
        color = "GREEN";
        colorType = "green";
    }
    else if ([2, 4, 6, 8].includes(number)) {
        size = "BIG";
        color = "RED";
        colorType = "red";
    }

    return { number, size, color, colorType };
}

// ========= UI আপডেট + কালার হাইলাইট =========
function updatePredictionUI() {
    const { number, size, color, colorType } = generateRandomSignal();
    
    // এনিমেশন রি-ট্রিগার
    predictionNumberSpan.classList.remove('animate-pop');
    sizeValueSpan.classList.remove('animate-pop');
    colorValueSpan.classList.remove('animate-pop');
    
    void predictionNumberSpan.offsetWidth;
    
    // টেক্সট আপডেট
    predictionNumberSpan.textContent = number;
    sizeValueSpan.textContent = size;
    colorValueSpan.textContent = color;
    
    // আগের হাইলাইট ক্লাস রিমুভ
    numberBoxSpan.classList.remove('color-green-text', 'color-red-text', 'color-violet-text');
    sizeCard.classList.remove('bg-green-light', 'bg-red-light', 'bg-violet-light');
    colorCard.classList.remove('bg-green-light', 'bg-red-light', 'bg-violet-light');
    
    // নতুন হাইলাইট অ্যাড
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
    
    // এনিমেশন অ্যাড
    predictionNumberSpan.classList.add('animate-pop');
    sizeValueSpan.classList.add('animate-pop');
    colorValueSpan.classList.add('animate-pop');
}

// ========= কাউন্টডাউন স্টার্ট =========
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

// রাউন্ড শেষ: পিরিয়ড বাড়াও, নতুন সিগন্যাল দাও
function onRoundComplete() {
    if (!isActive) return;
    currentPeriod++;
    periodDisplay.innerText = currentPeriod;
    periodInput.value = currentPeriod;
    updatePredictionUI();
    startCountdown(selectedTimeSec);
}

// ========= সেভ & স্টার্ট (মোডাল থেকে কল হবে) =========
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
    statusBarSpan.innerHTML = '🟢 চলছে';
    statusBarDiv.style.background = '#00aa5533';
    statusBarSpan.style.color = '#aaffaa';
    
    // মোডাল বন্ধ করো
    modalOverlay.classList.remove('show');
}

// স্টপ/রিসেট
function stopAndReset() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    isActive = false;
    timerSecondsSpan.innerText = "0";
    
    // পিরিয়ড ইনপুট থেকে রিসেট না করে শুধু থামানো
    periodDisplay.innerText = currentPeriod;
    
    // ডিফল্ট প্লেসহোল্ডার দেখাও
    predictionNumberSpan.textContent = "?";
    sizeValueSpan.textContent = "---";
    colorValueSpan.textContent = "-----";
    numberBoxSpan.classList.remove('color-green-text', 'color-red-text', 'color-violet-text');
    sizeCard.classList.remove('bg-green-light', 'bg-red-light', 'bg-violet-light');
    colorCard.classList.remove('bg-green-light', 'bg-red-light', 'bg-violet-light');
    
    statusBarSpan.innerHTML = '⚫ বন্ধ';
    statusBarDiv.style.background = '#33333355';
    statusBarSpan.style.color = '#ccc';
}

// ========= টাইমার অপশন সিলেক্ট (মোডালের ভিতর) =========
timeOptions.forEach(btn => {
    btn.addEventListener('click', () => {
        const timeVal = parseInt(btn.getAttribute('data-time'));
        selectedTimeSec = timeVal;
        timeOptions.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // হেডারের টেক্সট পরিবর্তন
        if (selectedTimeSec === 30) {
            timeModeLabel.innerText = "30 SECOND";
        } else {
            timeModeLabel.innerText = "1 MINUTE";
        }
    });
});

// ডিফল্ট 30 সেকেন্ড সিলেক্টেড
document.querySelector('.time-option[data-time="30"]').classList.add('active');

// ========= মোডাল কন্ট্রোল =========
settingsIcon.addEventListener('click', () => {
    // মোডালে বর্তমান মান সেট করো
    periodInput.value = currentPeriod;
    // টাইম অপশন অনুযায়ী active সেট (UI তে আগে থেকেই আছে)
    modalOverlay.classList.add('show');
});

closeModalBtn.addEventListener('click', () => {
    modalOverlay.classList.remove('show');
});

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        modalOverlay.classList.remove('show');
    }
});

modalStartBtn.addEventListener('click', saveAndStart);
modalStopBtn.addEventListener('click', () => {
    stopAndReset();
    modalOverlay.classList.remove('show');
});

// ========= প্রিভিউ লোড (পেজ ওপেনে এলোমেলো সিগন্যাল) =========
function initialPreview() {
    const { number, size, color, colorType } = generateRandomSignal();
    predictionNumberSpan.textContent = number;
    sizeValueSpan.textContent = size;
    colorValueSpan.textContent = color;
    // হালকা হাইলাইট ছাড়া প্রিভিউ
}
initialPreview();

// এক্সট্রা: iframe এর কোনো সমস্যা এড়াতে পিরিয়ড ফোকাস হলে স্ক্রল না
periodInput.addEventListener('focus', (e) => e.stopPropagation());