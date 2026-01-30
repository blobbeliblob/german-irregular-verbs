// German Irregular Verbs Practice App
// ===================================

// State management
let verbs = [];
let currentSession = {
    verbs: [],
    currentIndex: 0,
    score: 0,
    mistakes: []
};

// DOM Elements
const screens = {
    start: document.getElementById('start-screen'),
    practice: document.getElementById('practice-screen'),
    results: document.getElementById('results-screen')
};

const elements = {
    verbCount: document.getElementById('verb-count'),
    startBtn: document.getElementById('start-btn'),
    progress: document.getElementById('progress'),
    currentNum: document.getElementById('current-num'),
    totalNum: document.getElementById('total-num'),
    infinitive: document.getElementById('infinitive'),
    translation: document.getElementById('translation'),
    answerForm: document.getElementById('answer-form'),
    praeteritum: document.getElementById('praeteritum'),
    partizip: document.getElementById('partizip'),
    submitBtn: document.getElementById('submit-btn'),
    feedback: document.getElementById('feedback'),
    correctPraeteritum: document.getElementById('correct-praeteritum'),
    correctPartizip: document.getElementById('correct-partizip'),
    nextBtn: document.getElementById('next-btn'),
    finalScore: document.getElementById('final-score'),
    finalTotal: document.getElementById('final-total'),
    scorePercentage: document.getElementById('score-percentage'),
    mistakesSummary: document.getElementById('mistakes-summary'),
    mistakesList: document.getElementById('mistakes-list'),
    restartBtn: document.getElementById('restart-btn')
};

// Initialize the app
async function init() {
    await loadVerbs();
    setupEventListeners();
}

// Load verbs from JSON file
async function loadVerbs() {
    try {
        const response = await fetch('verbs.json');
        if (!response.ok) {
            throw new Error('Failed to load verbs');
        }
        verbs = await response.json();
        console.log(`Loaded ${verbs.length} verbs`);
    } catch (error) {
        console.error('Error loading verbs:', error);
        // Show error to user
        alert('Failed to load verbs. Please refresh the page.');
    }
}

// Setup event listeners
function setupEventListeners() {
    elements.startBtn.addEventListener('click', startPractice);
    elements.answerForm.addEventListener('submit', checkAnswer);
    elements.nextBtn.addEventListener('click', nextVerb);
    elements.restartBtn.addEventListener('click', restartPractice);
}

// Switch between screens
function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    screens[screenName].classList.add('active');
}

// Shuffle array (Fisher-Yates algorithm)
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Start practice session
function startPractice() {
    const countValue = elements.verbCount.value;
    const count = countValue === 'all' ? verbs.length : parseInt(countValue);
    
    // Reset session
    currentSession = {
        verbs: shuffleArray(verbs).slice(0, count),
        currentIndex: 0,
        score: 0,
        mistakes: []
    };
    
    // Update UI
    elements.totalNum.textContent = currentSession.verbs.length;
    
    showScreen('practice');
    displayCurrentVerb();
}

// Display the current verb
function displayCurrentVerb() {
    const verb = currentSession.verbs[currentSession.currentIndex];
    
    // Update progress
    elements.currentNum.textContent = currentSession.currentIndex + 1;
    const progressPercent = (currentSession.currentIndex / currentSession.verbs.length) * 100;
    elements.progress.style.width = `${progressPercent}%`;
    
    // Display verb
    elements.infinitive.textContent = verb.infinitive;
    elements.translation.textContent = verb.translation;
    
    // Reset form
    elements.praeteritum.value = '';
    elements.partizip.value = '';
    elements.praeteritum.classList.remove('correct', 'incorrect');
    elements.partizip.classList.remove('correct', 'incorrect');
    elements.praeteritum.disabled = false;
    elements.partizip.disabled = false;
    elements.submitBtn.style.display = 'block';
    elements.feedback.classList.add('hidden');
    
    // Focus first input
    elements.praeteritum.focus();
}

// Normalize string for comparison (handle umlauts, spaces, etc.)
function normalizeAnswer(str) {
    return str.toLowerCase().trim();
}

// Check if answer is correct (handles multiple acceptable answers)
function isCorrect(userAnswer, correctAnswers) {
    const normalized = normalizeAnswer(userAnswer);
    
    // correctAnswers can be a string or array
    if (Array.isArray(correctAnswers)) {
        return correctAnswers.some(answer => normalizeAnswer(answer) === normalized);
    }
    return normalizeAnswer(correctAnswers) === normalized;
}

// Format correct answers for display
function formatCorrectAnswers(answers) {
    if (Array.isArray(answers)) {
        return answers.join(' / ');
    }
    return answers;
}

// Check the user's answer
function checkAnswer(e) {
    e.preventDefault();
    
    const verb = currentSession.verbs[currentSession.currentIndex];
    const praeteritumAnswer = elements.praeteritum.value;
    const partizipAnswer = elements.partizip.value;
    
    const praeteritumCorrect = isCorrect(praeteritumAnswer, verb.praeteritum);
    const partizipCorrect = isCorrect(partizipAnswer, verb.partizip);
    
    // Update input styles
    elements.praeteritum.classList.add(praeteritumCorrect ? 'correct' : 'incorrect');
    elements.partizip.classList.add(partizipCorrect ? 'correct' : 'incorrect');
    
    // Disable inputs
    elements.praeteritum.disabled = true;
    elements.partizip.disabled = true;
    
    // Show feedback
    elements.correctPraeteritum.textContent = formatCorrectAnswers(verb.praeteritum);
    elements.correctPartizip.textContent = formatCorrectAnswers(verb.partizip);
    elements.submitBtn.style.display = 'none';
    elements.feedback.classList.remove('hidden');
    
    // Update score
    if (praeteritumCorrect && partizipCorrect) {
        currentSession.score++;
    } else {
        currentSession.mistakes.push({
            verb: verb.infinitive,
            translation: verb.translation,
            praeteritum: formatCorrectAnswers(verb.praeteritum),
            partizip: formatCorrectAnswers(verb.partizip),
            userPraeteritum: praeteritumAnswer || '(empty)',
            userPartizip: partizipAnswer || '(empty)'
        });
    }
}

// Move to next verb
function nextVerb() {
    currentSession.currentIndex++;
    
    if (currentSession.currentIndex >= currentSession.verbs.length) {
        showResults();
    } else {
        displayCurrentVerb();
    }
}

// Show results screen
function showResults() {
    const total = currentSession.verbs.length;
    const score = currentSession.score;
    const percentage = Math.round((score / total) * 100);
    
    elements.finalScore.textContent = score;
    elements.finalTotal.textContent = total;
    elements.scorePercentage.textContent = `${percentage}%`;
    
    // Set color based on score
    if (percentage >= 80) {
        elements.scorePercentage.style.color = 'var(--success)';
    } else if (percentage >= 50) {
        elements.scorePercentage.style.color = 'var(--secondary-color)';
    } else {
        elements.scorePercentage.style.color = 'var(--error)';
    }
    
    // Show mistakes if any
    if (currentSession.mistakes.length > 0) {
        elements.mistakesSummary.classList.remove('hidden');
        elements.mistakesList.innerHTML = currentSession.mistakes.map(m => `
            <li>
                <strong>${m.verb}</strong> (${m.translation})<br>
                Präteritum: ${m.praeteritum} (you wrote: ${m.userPraeteritum})<br>
                Partizip II: ${m.partizip} (you wrote: ${m.userPartizip})
            </li>
        `).join('');
    } else {
        elements.mistakesSummary.classList.add('hidden');
    }
    
    // Update progress bar to 100%
    elements.progress.style.width = '100%';
    
    showScreen('results');
}

// Restart practice
function restartPractice() {
    showScreen('start');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
