// WINGO PREDICTOR - সম্পূর্ণ স্ক্রিপ্ট
// স্কোয়ার উইজেট + ৩০ সেকেন্ড টাইমার + ফুলস্ক্রিন

(function() {
    // ========== গ্লোবাল ভ্যারিয়েবল ==========
    let periodCounter = 11181;
    let timeLeft = 30;
    let currentInterval = null;
    
    // আউটকামের অপশন
    const outcomes = ['লাল', 'সবুজ', 'বেগুনি'];
    const outcomeColors = {
        'লাল': '#ff4d6d',
        'সবুজ': '#2effcf',
        'বেগুনি': '#c084fc'
    };
    
    let historyQueue = [];
    
    // DOM এলিমেন্টস
    const countdownEl = document.getElementById('countdownDisplay');
    const periodSpan = document.getElementById('periodValue');
    const predictionResultSpan = document.getElementById('predictionResult');
    const historyContainer = document.getElementById('historyContainer');
    const predictionSquare = document.getElementById('predictionSquare');
    const fullscreenBtn = document.getElementById('fullscreenToggleBtn');
    const lookJackpotBtn = document.getElementById('lookJackpotBtn');
    
    // ========== ডেটা লোড (স্কোয়ার উইজেট কন্টেন্ট) ==========
    const jackpotData = [
        { prize: '₱২৫.৬৬X', name: 'এভিয়েটর · বুস্টার', bet: 'ন্যূনতম ₱১০০' },
        { prize: '₱২৩.২৩X', name: 'এভিয়েটর · প্রো', bet: 'ম্যাক্স মাল্টি' },
        { prize: '₱১৮.৮৮X', name: 'ড্রাগন ক্র্যাশ', bet: 'হট রিওয়ার্ড' },
        { prize: '₱৯৯.৯৯X', name: 'সুপার জ্যাকপট', bet: '₱৩,০০০ টপ বেট' }
    ];
    
    const slotsData = [
        { icon: '✈️', name: 'এভিয়েটর', price: '₱১০০.০০' },
        { icon: '🃏', name: 'সুপার এইস', price: '₱২০০.০০' },
        { icon: '🔥', name: 'সুপার এইস', price: '₱১০০.০০' },
        { icon: '⚡', name: 'লাইটনিং বক্স', price: '₱১৫০.০০' }
    ];
    
    const liveBetsData = [
        { prize: '₱২৫.৬৬X', name: 'এভিয়েটর', status: 'স্টপড' },
        { prize: '₱২৩.২৩X', name: 'এভিয়েটর', status: 'একটিভ' },
        { prize: '₱৫০X', name: 'টার্বো গেমস', status: 'জেডিবি' },
        { prize: '₱১২.৪০X', name: 'প্রাগম্যাটিক', status: 'ইভোলুশন' }
    ];
    
    // জ্যাকপট গ্রিড রেন্ডার
    function renderJackpotGrid() {
        const container = document.getElementById('jackpotGrid');
        if (!container) return;
        container.innerHTML = jackpotData.map(item => `
            <div class="square-card">
                <div class="prize-mult">${item.prize}</div>
                <div class="game-name">${item.name}</div>
                <div class="bet-amount">${item.bet}</div>
            </div>
        `).join('');
    }
    
    // স্লট গ্রিড রেন্ডার
    function renderSlotsGrid() {
        const container = document.getElementById('slotsGrid');
        if (!container) return;
        container.innerHTML = slotsData.map(item => `
            <div class="slot-card">
                <div class="slot-icon">${item.icon}</div>
                <div class="slot-title">${item.name}</div>
                <div class="slot-price">${item.price}</div>
            </div>
        `).join('');
    }
    
    // লাইভ বেটস গ্রিড রেন্ডার
    function renderLiveBetsGrid() {
        const container = document.getElementById('liveBetsGrid');
        if (!container) return;
        container.innerHTML = liveBetsData.map(item => `
            <div class="square-card">
                <div class="prize-mult">${item.prize}</div>
                <div class="game-name">${item.name}</div>
                <div class="bet-amount">${item.status}</div>
            </div>
        `).join('');
    }
    
    // ========== হিস্ট্রি ফাংশন ==========
    function addHistoryEntry(result) {
        historyQueue.unshift(result);
        if (historyQueue.length > 6) historyQueue.pop();
        renderHistory();
    }
    
    function renderHistory() {
        if (!historyContainer) return;
        if (historyQueue.length === 0) {
            historyContainer.innerHTML = '<div class="history-chip chip-green">রেডি</div>';
            return;
        }
        historyContainer.innerHTML = historyQueue.map(res => {
            let chipClass = '';
            if (res === 'লাল') chipClass = 'chip-red';
            else if (res === 'সবুজ') chipClass = 'chip-green';
            else if (res === 'বেগুনি') chipClass = 'chip-violet';
            return `<div class="history-chip ${chipClass}">🎲 ${res}</div>`;
        }).join('');
    }
    
    // ========== প্রেডিকশন জেনারেট ==========
    function generatePrediction() {
        const randomIndex = Math.floor(Math.random() * outcomes.length);
        const newResult = outcomes[randomIndex];
        
        // UI আপডেট
        predictionResultSpan.innerText = newResult;
        predictionResultSpan.style.background = `linear-gradient(135deg, #fff, ${outcomeColors[newResult]})`;
        predictionResultSpan.style.webkitBackgroundClip = 'text';
        predictionResultSpan.style.backgroundClip = 'text';
        predictionResultSpan.style.color = 'transparent';
        
        // এনিমেশন
        predictionResultSpan.classList.add('win-animation');
        setTimeout(() => predictionResultSpan.classList.remove('win-animation'), 400);
        
        // হিস্ট্রিতে যোগ
        addHistoryEntry(newResult);
        
        // বর্ডার ফ্ল্যাশ
        if (predictionSquare) {
            predictionSquare.style.borderColor = outcomeColors[newResult];
            setTimeout(() => {
                predictionSquare.style.borderColor = 'rgba(46, 255, 207, 0.7)';
            }, 700);
        }
        
        return newResult;
    }
    
    function incrementPeriod() {
        periodCounter++;
        if (periodSpan) periodSpan.innerText = periodCounter;
    }
    
    // ========== টাইমার ফাংশন ==========
    function updateTimerDisplay() {
        if (countdownEl) countdownEl.innerText = timeLeft;
        
        // শেষ ৫ সেকেন্ডে ভিজ্যুয়াল ইফেক্ট
        if (timeLeft <= 5) {
            countdownEl.style.textShadow = '0 0 12px #ffaa33';
        } else {
            countdownEl.style.textShadow = '0 0 8px #00ffc3';
        }
    }
    
    function onTimerComplete() {
        generatePrediction();
        incrementPeriod();
        timeLeft = 30;
        updateTimerDisplay();
        startTimer();
    }
    
    function startTimer() {
        if (currentInterval) clearInterval(currentInterval);
        currentInterval = setInterval(() => {
            if (timeLeft <= 1) {
                clearInterval(currentInterval);
                currentInterval = null;
                onTimerComplete();
            } else {
                timeLeft--;
                updateTimerDisplay();
            }
        }, 1000);
    }
    
    // ========== ফুলস্ক্রিন ফাংশন ==========
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.warn(err);
            });
            if (fullscreenBtn) fullscreenBtn.innerHTML = '✖ এক্সিট ফুল';
        } else {
            document.exitFullscreen();
            if (fullscreenBtn) fullscreenBtn.innerHTML = '⛶ ফুলস্ক্রিন';
        }
    }
    
    // ফুলস্ক্রিন চেঞ্জ ইভেন্ট
    document.addEventListener('fullscreenchange', () => {
        if (fullscreenBtn) {
            if (document.fullscreenElement) {
                fullscreenBtn.innerHTML = '✖ এক্সিট ফুল';
            } else {
                fullscreenBtn.innerHTML = '⛶ ফুলস্ক্রিন';
            }
        }
    });
    
    // ========== জ্যাকপট নোটিফিকেশন ==========
    function showJackpotNotification() {
        const notification = document.createElement('div');
        notification.innerText = '✨ সুপার জ্যাকপট ট্রিগার! ✨ অতিরিক্ত পুরস্কার মাল্টিপ্লাইড! ✨';
        notification.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #ffba2e, #ff8c2e);
            color: #000;
            padding: 14px 32px;
            border-radius: 60px;
            font-weight: bold;
            z-index: 9999;
            box-shadow: 0 0 40px gold;
            backdrop-filter: blur(8px);
            font-size: 0.9rem;
            white-space: nowrap;
            animation: slideUp 0.3s ease;
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2500);
    }
    
    // ========== ক্যাটাগরি ক্লিক ইফেক্ট ==========
    function initCategoryClick() {
        const cats = document.querySelectorAll('.cat-item');
        cats.forEach(cat => {
            cat.addEventListener('click', function() {
                cats.forEach(c => c.classList.remove('active'));
                this.classList.add('active');
                // ক্যাটাগরি অনুযায়ী কিছু করতে চাইলে এখানে লজিক যোগ করুন
            });
        });
    }
    
    // ========== ইনিশিয়াল প্রেডিকশন ==========
    function setInitialPrediction() {
        const initRes = outcomes[Math.floor(Math.random() * outcomes.length)];
        predictionResultSpan.innerText = initRes;
        predictionResultSpan.style.background = `linear-gradient(135deg, #fff, ${outcomeColors[initRes]})`;
        predictionResultSpan.style.webkitBackgroundClip = 'text';
        predictionResultSpan.style.backgroundClip = 'text';
        predictionResultSpan.style.color = 'transparent';
        
        // ইনিশিয়াল হিস্ট্রি
        historyQueue = ['সবুজ', 'বেগুনি', 'লাল'];
        renderHistory();
    }
    
    // ========== অ্যানিমেশন স্টাইল অ্যাড ==========
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideUp {
            from { opacity: 0; transform: translateX(-50%) translateY(20px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
    `;
    document.head.appendChild(style);
    
    // ========== ইভেন্ট লিসেনার ==========
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullscreen);
    }
    
    if (lookJackpotBtn) {
        lookJackpotBtn.addEventListener('click', showJackpotNotification);
    }
    
    // ========== সবকিছু লোড করা ==========
    function init() {
        renderJackpotGrid();
        renderSlotsGrid();
        renderLiveBetsGrid();
        initCategoryClick();
        setInitialPrediction();
        startTimer();
    }
    
    // DOM লোড হলে শুরু করো
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();