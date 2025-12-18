
const currentUser = localStorage.getItem('typeMasterCurrentUser');
if (!currentUser) window.location.href = 'login.html';

const usersDB = JSON.parse(localStorage.getItem('typeMasterUsers')) || {};
const displayUsername = document.getElementById('display-username');
const logoutBtn = document.getElementById('logout-btn');
const themeToggleBtn = document.getElementById('theme-toggle');
const sunIcon = document.getElementById('sun-icon');
const moonIcon = document.getElementById('moon-icon');

if(displayUsername) displayUsername.innerText = currentUser;

if(logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('typeMasterCurrentUser');
        window.location.href = 'login.html';
    });
}

function updateIcons(isDark) {
    if (isDark) { sunIcon.style.display = 'none'; moonIcon.style.display = 'block'; }
    else { sunIcon.style.display = 'block'; moonIcon.style.display = 'none'; }
}

const savedTheme = localStorage.getItem('typeMasterTheme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    updateIcons(true);
}

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('typeMasterTheme', isDark ? 'dark' : 'light');
        updateIcons(isDark);
    });
}


const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type, duration) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type; 
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function playAudio(type) {
    if (type === 'correct') {
        playTone(600, 'sine', 0.05); 
    } else {
        playTone(150, 'sawtooth', 0.2); 
    }
}


const quotesDB = {
    easy: [
        "sky", "run", "jump", "code", "fast", "slow", "blue", "red",
        "cats meow", "dogs bark", "fish swim", "birds fly",
        "hello world", "good morning", "stay happy", "be kind",
        "focus now", "work hard", "dream big", "stay calm",
        "fresh air", "green tree", "hot coffee", "cold ice",
        "write code", "read books", "play games", "have fun",
        "look up", "step down", "move left", "turn right",
        "keep going", "never stop", "you can", "do it",
        "star light", "moon shine", "sun rise", "rain drop",
        "apple pie", "pizza time", "taco day", "burger night"
    ],
    medium: [
        "The quick brown fox jumps over the lazy dog.",
        "Success is not final, failure is not fatal.",
        "Happiness depends upon ourselves.",
        "Turn your wounds into wisdom.",
        "Change the world by being yourself.",
        "Every moment is a fresh beginning.",
        "Simplicity is the ultimate sophistication.",
        "Whatever you do, do it well.",
        "Life is what happens when you are busy making other plans.",
        "Get busy living or get busy dying.",
        "Procrastination is the thief of time.",
        "A journey of a thousand miles begins with a single step.",
        "If you tell the truth, you don't have to remember anything.",
        "Be the change that you wish to see in the world.",
        "It is never too late to be what you might have been.",
        "Pain is temporary. Quitting lasts forever."
    ],
    hard: [
        "function(x, y) { return x * y + Math.sqrt(z); }",
        "The quick brown fox jumps over the lazy dog but the dog was not lazy at all.",
        "Peter Piper picked a peck of pickled peppers. How many pickled peppers did Peter Piper pick?",
        "She sells seashells by the seashore. The shells she sells are surely seashells.",
        "To contain the flow of current, resistors are used in electronic circuits.",
        "Photosynthesis is the process used by plants to convert light energy into chemical energy.",
        "Mitochondria are known as the powerhouses of the cell because they generate most of the cell's supply of adenosine triphosphate.",
        "In computer science, a null pointer dereference occurs when a pointer with a value of NULL is used as though it pointed to a valid memory area.",
        "Cryptocurrency uses blockchain technology to record transactions across many computers so that the record cannot be altered retroactively.",
        "Artificial intelligence is intelligence demonstrated by machines, as opposed to natural intelligence displayed by animals including humans.",
        "SQL injection is a code injection technique, used to attack data-driven applications.",
        "The concept of 'recursion' involves a function calling itself until a base condition is met."
    ]
};


const display = document.getElementById('quote-display');
const input = document.getElementById('quote-input');
const timerEl = document.getElementById('timer');
const wpmEl = document.getElementById('wpm');
const mistakesEl = document.getElementById('mistakes');
const accuracyEl = document.getElementById('accuracy');
const highScoreEl = document.getElementById('high-score');
const levelSelect = document.getElementById('level-select');
const restartBtn = document.getElementById('restart-btn');
const feedbackMsg = document.getElementById('feedback-msg');
const suddenDeathCb = document.getElementById('sudden-death-toggle');

let startTime;
let timerInterval;
let currentLevel = 'medium';
let currentHighScore = usersDB[currentUser] ? (usersDB[currentUser].highScore || 0) : 0;
highScoreEl.innerText = currentHighScore;



let lastQuote = ""; 

function getRandomQuote() {
    const list = quotesDB[currentLevel];
   
    let newQuote = list[Math.floor(Math.random() * list.length)];
    
    while (newQuote === lastQuote && list.length > 1) {
        newQuote = list[Math.floor(Math.random() * list.length)];
    }
    lastQuote = newQuote;
    return newQuote;
}

function renderNewQuote() {
    const quote = getRandomQuote();
    display.innerHTML = '';
    
    quote.split('').forEach(char => {
        const span = document.createElement('span');
        span.innerText = char;
        display.appendChild(span);
    });
  
    input.value = null;
    wpmEl.innerText = 0;
    mistakesEl.innerText = 0;
    accuracyEl.innerText = '100%';
    accuracyEl.style.color = 'var(--primary)';
    timerEl.innerText = '0s';
    
    input.classList.remove('shake');
    feedbackMsg.classList.remove('feedback-visible');
    

    document.querySelectorAll('.key').forEach(key => {
        key.classList.remove('active');
        key.classList.remove('error');
    });

    clearInterval(timerInterval);
    startTime = null; 
    input.focus();
}

function startTimer() {
    timerEl.innerText = 0;
    startTime = new Date();
    timerInterval = setInterval(() => {
        const timeInSeconds = Math.floor((new Date() - startTime) / 1000);
        timerEl.innerText = timeInSeconds + "s";
        
        const chars = input.value.length;
        const mins = timeInSeconds / 60;
        if(mins > 0) {
            const wpm = Math.round((chars / 5) / mins);
            wpmEl.innerText = wpm;
        }
    }, 1000);
}

function updateHighScore(wpm) {
    if (wpm > currentHighScore) {
        currentHighScore = wpm;
        highScoreEl.innerText = wpm;
        if(usersDB[currentUser]) {
            usersDB[currentUser].highScore = wpm;
            localStorage.setItem('typeMasterUsers', JSON.stringify(usersDB));
        }
        highScoreEl.style.color = '#22c55e';
        setTimeout(() => highScoreEl.style.color = 'var(--primary)', 2000);
    }
}

function gameOver() {
    playAudio('error'); 
    document.body.style.backgroundColor = 'var(--red)';
    setTimeout(() => {
        alert("💀 GAME OVER! Sudden Death Mode.");
        document.body.style.backgroundColor = 'var(--bg-color)';
        renderNewQuote(); 
    }, 50);
}




document.addEventListener('keydown', (e) => {
    let keyChar = e.key.toUpperCase();
    if (keyChar === ' ') keyChar = ' ';
    const keyEl = document.querySelector(`.key[data-key="${keyChar}"]`);
    if (!keyEl) return;

   
    const currentIndex = input.value.length;
    const quoteSpans = display.querySelectorAll('span');
    const targetSpan = quoteSpans[currentIndex];

    if (e.key.length > 1) { 
        keyEl.classList.add('active');
        return;
    }

    if (targetSpan) {
        if (keyChar === targetSpan.innerText.toUpperCase()) {
            keyEl.classList.add('active'); 
        } else {
            keyEl.classList.add('error'); 
        }
    } else {
        keyEl.classList.add('error');
    }
});

document.addEventListener('keyup', (e) => {
    let keyChar = e.key.toUpperCase();
    if (keyChar === ' ') keyChar = ' ';
    const keyEl = document.querySelector(`.key[data-key="${keyChar}"]`);
    if (keyEl) {
        keyEl.classList.remove('active');
        keyEl.classList.remove('error');
    }
});


input.addEventListener('input', (e) => {
    if (!startTime) startTimer();

    const quoteSpans = display.querySelectorAll('span');
    const inputChars = input.value.split('');
    const currentInputIndex = inputChars.length - 1;

    if (currentInputIndex < 0) return;

    let correct = true;
    let totalMistakes = 0;

    quoteSpans.forEach((span, index) => {
        const char = inputChars[index];

        if (char == null) {
            span.classList.remove('correct', 'incorrect');
            correct = false;
        } else if (char === span.innerText) {
            span.classList.add('correct');
            span.classList.remove('incorrect');
        } else {
            span.classList.remove('correct');
            span.classList.add('incorrect');
            correct = false;
            totalMistakes++;
        }
    });

   
    const lastTypedChar = inputChars[currentInputIndex];
    const targetSpan = quoteSpans[currentInputIndex];

    if (e.inputType === 'deleteContentBackward') {
        playAudio('correct'); // Backspace sound
    } else if (targetSpan) {
        if (lastTypedChar === targetSpan.innerText) {
            playAudio('correct'); // Correct sound
        } else {
           
            if (suddenDeathCb && suddenDeathCb.checked) {
                gameOver();
                return;
            }
            playAudio('error');
            input.classList.add('shake');
            feedbackMsg.classList.add('feedback-visible');
            setTimeout(() => {
                input.classList.remove('shake');
                feedbackMsg.classList.remove('feedback-visible');
            }, 300);
        }
    }

  
    mistakesEl.innerText = totalMistakes;
    if(inputChars.length > 0) {
        let acc = Math.round(((inputChars.length - totalMistakes) / inputChars.length) * 100);
        if(acc < 0) acc = 0;
        accuracyEl.innerText = acc + "%";
        if(acc < 50) accuracyEl.style.color = 'var(--red)';
        else if(acc < 80) accuracyEl.style.color = '#f59e0b';
        else accuracyEl.style.color = 'var(--green)';
    }

    
    if (correct && inputChars.length === quoteSpans.length) {
        clearInterval(timerInterval);
        const finalWPM = parseInt(wpmEl.innerText);
        updateHighScore(finalWPM);
        if(window.updateChart) window.updateChart(finalWPM); // Update Chart
        renderNewQuote();
    }
});

levelSelect.addEventListener('change', (e) => { currentLevel = e.target.value; renderNewQuote(); });
restartBtn.addEventListener('click', renderNewQuote);

renderNewQuote();



const ctxEl = document.getElementById('progressChart');

if (ctxEl) {
    const ctx = ctxEl.getContext('2d');

   
    let userHistory = [];
    if (usersDB[currentUser] && usersDB[currentUser].history) {
        userHistory = usersDB[currentUser].history;
    }

    const chartLabels = userHistory.length > 0 ? userHistory.map((_, i) => i + 1) : [0];
    const chartData = userHistory.length > 0 ? userHistory : [0];

    const chartConfig = {
        type: 'line',
        data: {
            labels: chartLabels,
            datasets: [{
                label: 'WPM',
                data: chartData,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                borderWidth: 3,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#6366f1',
                pointRadius: 4,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(200, 200, 200, 0.1)' }, // Light grid
                    ticks: { color: '#9ca3af' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#9ca3af' }
                }
            }
        }
    };

    let myChart = new Chart(ctx, chartConfig);

  
    window.updateChart = function(newWPM) {
        userHistory.push(newWPM);
        if (userHistory.length > 10) userHistory.shift();
        
        if (!usersDB[currentUser]) usersDB[currentUser] = {};
        usersDB[currentUser].history = userHistory;
        if (!usersDB[currentUser].highScore) usersDB[currentUser].highScore = currentHighScore;
        
        localStorage.setItem('typeMasterUsers', JSON.stringify(usersDB));

        myChart.data.labels = userHistory.map((_, index) => index + 1);
        myChart.data.datasets[0].data = userHistory;
        myChart.update();
    }

}

