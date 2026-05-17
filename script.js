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

// রিসাইজ বাটন
const smallBtn = document.getElementById('makeSmall');
const largeBtn = document.getElementById('makeLarge');

// ---------------------- স্টেট ভ্যারিয়েবল -------------------------
let selectedTimeSec = 30;   // ডিফল্ট 30 সেকেন্ড
let currentPeriod = 1;
let timerInterval = null;
let isActive = false;
let timeLeft = 0;
let roundActive = false;     // টাইমার চললে সিগন্যাল জেনারেট হবে প্রতি রাউন্ড শেষে

// ----------------------- র্যান্ডম সিগন্যাল জেনারেশন -------------------------
function generateRandomSignal() {
    // 0-9 র‍্যান্ডম নাম্বার
    const number = Math.floor(Math.random() * 10);
    let size = "";
    let color = "";

    // কনডিশন অনুযায়ী সাইজ ও কালার নির্ধারণ
    if (number === 0) {
        size = "SMALL";
        color = "VIOLET / RED";   // 2টা একসাথে দেখানো
    } 
    else if (number === 5) {
        size = "BIG";
        color = "VIOLET / GREEN";
    }
    else if ([1, 3, 7, 9].includes(number)) {
        size = "SMALL";
        color = "GREEN";
    }
    else if ([2, 4, 6, 8].includes(number)) {
        size = "BIG";
        color = "RED";
    }
    else {
        // fallback (কখনো আসবে না)
        size = "SMALL";
        color = "WHITE";
    }

    return { number, size, color };
}

// UI আপডেট + এনিমেশন
function updateSignalUI() {
    const { number, size, color } = generateRandomSignal();
    
    // এনিমেশন রিমুভ & রি-অ্যাড
    signalNumberDiv.classList.remove('animate-pop');
    signalSizeDiv.classList.remove('animate-pop');
    signalColorDiv.classList.remove('animate-pop');
    
    void signalNumberDiv.offsetWidth; // রি-ফ্লো ট্রিগার
    signalNumberDiv.textContent = number;
    signalSizeDiv.textContent = size;
    signalColorDiv.textContent = color;
    
    signalNumberDiv.classList.add('animate-pop');
    signalSizeDiv.classList.add('animate-pop');
    signalColorDiv.classList.add('animate-pop');
    
    // 0 ও ৫ এর ক্ষেত্রে এক্সট্রা ভিজুয়াল ইফেক্ট (টেক্সট হাইলাইট)
    if(number === 0) {
        signalColorDiv.style.textShadow = "0 0 5px magenta";
        signalSizeDiv.style.textShadow = "0 0 3px cyan";
    } else if(number === 5) {
        signalColorDiv.style.textShadow = "0 0 6px #aaffaa";
    } else {
        signalColorDiv.style.textShadow = "none";
        signalSizeDiv.style.textShadow = "none";
    }
}

// টাইমার শেষ হলে নতুন পিরিয়ড এবং সিগন্যাল আপডেট
function onRoundComplete() {
    if (!isActive) return;
    // পিরিয়ড নাম্বার +1 করে UI ও লোকাল আপডেট
    currentPeriod++;
    currentPeriodSpan.innerText = currentPeriod;
    periodNumberInput.value = currentPeriod;   // ইউজার দেখতে পারে
    
    // নতুন সিগন্যাল জেনারেট ও শো
    updateSignalUI();
    
    // আবার টাইমার চালু (রিসেট সময় নিয়ে)
    startCountdown(selectedTimeSec);
}

// কাউন্টডাউন স্টার্ট ফাংশন
function startCountdown(seconds) {
    if (timerInterval) clearInterval(timerInterval);
    timeLeft = seconds;
    timerDisplaySpan.innerText = timeLeft;
    
    timerInterval = setInterval(() => {
        if (!isActive) return;
        if (timeLeft <= 1) {
            // টাইমার শেষ
            clearInterval(timerInterval);
            timerDisplaySpan.innerText = 0;
            // রাউন্ড সম্পন্ন -> নতুন পিরিয়ড ও সিগন্যাল
            onRoundComplete();
        } else {
            timeLeft--;
            timerDisplaySpan.innerText = timeLeft;
        }
    }, 1000);
}

// সেভ এবং স্টার্ট ফাংশন
function saveAndStart() {
    // আগের টাইমার বন্ধ
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // পিরিয়ড নাম্বার নেওয়া (ইউজার সেট)
    let newPeriod = parseInt(periodNumberInput.value);
    if (isNaN(newPeriod) || newPeriod < 1) newPeriod = 1;
    currentPeriod = newPeriod;
    currentPeriodSpan.innerText = currentPeriod;
    
    // টাইমার অপশন selectedTimeSec ইতিমধ্যেই active বাটন দিয়ে সেট করা
    
    isActive = true;
    roundActive = true;
    
    // প্রথমবার সিগন্যাল জেনারেট করবে
    updateSignalUI();
    
    // কাউন্টডাউন শুরু হবে
    startCountdown(selectedTimeSec);
}

// স্টপ / রিসেট ফাংশন
function stopAndReset() {
    // সব টাইমার বন্ধ
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    isActive = false;
    roundActive = false;
    timerDisplaySpan.innerText = "0";
    
    // পিরিয়ড নাম্বার ১ সেট করে দাও (ইউজার চাইলে আবার বদলাতে পারে)
    currentPeriod = 1;
    currentPeriodSpan.innerText = "1";
    periodNumberInput.value = 1;
    
    // ডিফল্ট সিগন্যাল (placeholder) কিন্তু সক্রিয় না থাকলে র‍্যান্ডম দেখাতে পারে আবার
    signalNumberDiv.textContent = "--";
    signalSizeDiv.textContent = "---";
    signalColorDiv.textContent = "-----";
    // একটি নিষ্ক্রিয় স্টেট
}

// টাইমার অপশন সিলেক্ট (30s / 1m)
timerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const timeVal = parseInt(btn.getAttribute('data-time'));
        if (timeVal === 30) selectedTimeSec = 30;
        else if (timeVal === 60) selectedTimeSec = 60;
        
        // ভিজুয়াল অ্যাক্টিভ ক্লাস
        timerBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// ডিফল্ট ৩০ সেকেন্ড সিলেক্টেড দেখানো
document.querySelector('.timer-btn[data-time="30"]').classList.add('active');

// ---------------------- ড্র্যাগেবল ফাংশন (মাউস ইভেন্ট) -------------------------
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
    // সীমা উইন্ডোর মধ্যে রাখা
    left = Math.min(window.innerWidth - widget.offsetWidth - 10, Math.max(10, left));
    top = Math.min(window.innerHeight - widget.offsetHeight - 20, Math.max(10, top));
    widget.style.left = left + 'px';
    widget.style.top = top + 'px';
    widget.style.right = 'auto';  // ফিক্সড পজিশনে left优先
});

window.addEventListener('mouseup', () => {
    isDragging = false;
    widget.style.cursor = 'grab';
});

// টাচ স্ক্রিনের জন্য
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
    left = Math.min(window.innerWidth - widget.offsetWidth - 10, Math.max(10, left));
    top = Math.min(window.innerHeight - widget.offsetHeight - 20, Math.max(10, top));
    widget.style.left = left + 'px';
    widget.style.top = top + 'px';
    widget.style.right = 'auto';
});
window.addEventListener('touchend', () => {
    isDragging = false;
});

// ---------------------- রিসাইজ ফাংশন (ছোট/বড়) -------------------------
smallBtn.addEventListener('click', () => {
    widget.classList.remove('large-mode');
    widget.classList.add('small-mode');
});
largeBtn.addEventListener('click', () => {
    widget.classList.remove('small-mode');
    widget.classList.add('large-mode');
});
// প্রাথমিক অবস্থায় ডিফল্ট নরমাল সাইজ

// স্টার্ট ও স্টপ বাটন ইভেন্ট
saveStartBtn.addEventListener('click', saveAndStart);
stopResetBtn.addEventListener('click', stopAndReset);

// iframe লোডের কোন সমস্যা নেই, ডিফল্ট সিগন্যাল প্রি-ভিউ
// শুরুতে র‍্যান্ডম সিগন্যাল শো করতে পারি (প্রিভিউ মোড)
function initialPreview() {
    const { number, size, color } = generateRandomSignal();
    signalNumberDiv.textContent = number;
    signalSizeDiv.textContent = size;
    signalColorDiv.textContent = color;
}
initialPreview();

// ইউজার ম্যানুয়ালি যদি পিরিয়ড চেইঞ্জ করে, স্টপ অবস্থায় ডিসপ্লে ইউপডেটের প্রয়োজনীয়তা নেই
// যখন স্টপ করা থাকে এবং সেভ প্রেস করবে তখন আপডেট হবে।
