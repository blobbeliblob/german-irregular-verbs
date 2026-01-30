// German Irregular Verbs Practice App
// ===================================

// State management
let verbs = [];
let currentSession = {
    mode: null,
    verbs: [],
    currentIndex: 0,
    score: 0,
    mistakes: []
};

// DOM Elements - will be initialized after DOM loads
let elements = {};

// Initialize the app
async function init() {
    await loadVerbs();
    initializeElements();
    setupEventListeners();
}

// Initialize DOM element references
function initializeElements() {
    elements = {
        // Navigation
        homeBtn: document.getElementById('home-btn'),
        
        // Mode buttons
        modeButtons: document.querySelectorAll('.mode-btn'),
        
        // Practice elements
        practiceVerbCountRadios: document.querySelectorAll('input[name="practice-verb-count"]'),
        startPracticeBtn: document.getElementById('start-practice-btn'),
        practiceProgress: document.getElementById('practice-progress'),
        practiceCurrentNum: document.getElementById('practice-current-num'),
        practiceTotalNum: document.getElementById('practice-total-num'),
        practiceInfinitive: document.getElementById('practice-infinitive'),
        practiceTranslation: document.getElementById('practice-translation'),
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
        practiceAgainBtn: document.getElementById('practice-again-btn'),
        practiceMenuBtn: document.getElementById('practice-menu-btn'),
        
        // Memorize elements
        memorizeVerbCountRadios: document.querySelectorAll('input[name="memorize-verb-count"]'),
        startMemorizeBtn: document.getElementById('start-memorize-btn'),
        memorizeProgress: document.getElementById('memorize-progress'),
        memorizeCurrentNum: document.getElementById('memorize-current-num'),
        memorizeTotalNum: document.getElementById('memorize-total-num'),
        memorizeInfinitive: document.getElementById('memorize-infinitive'),
        memorizeTranslation: document.getElementById('memorize-translation'),
        flashcardImperfekt: document.getElementById('flashcard-imperfekt'),
        flashcardPerfekt: document.getElementById('flashcard-perfekt'),
        memorizeImperfekt: document.getElementById('memorize-imperfekt'),
        memorizePerfekt: document.getElementById('memorize-perfekt'),
        memorizeNextBtn: document.getElementById('memorize-next-btn'),
        memorizeAgainBtn: document.getElementById('memorize-again-btn'),
        memorizeMenuBtn: document.getElementById('memorize-menu-btn')
    };
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
        alert('Failed to load verbs. Please refresh the page.');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Mode selection
    elements.modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            if (mode === 'practice') {
                showScreen('practice-setup');
            } else if (mode === 'memorize') {
                showScreen('memorize-setup');
            }
        });
    });
    
    // Home button
    elements.homeBtn.addEventListener('click', () => {
        showScreen('menu');
    });
    
    // Practice mode
    elements.startPracticeBtn.addEventListener('click', startPractice);
    elements.answerForm.addEventListener('submit', checkAnswer);
    elements.nextBtn.addEventListener('click', nextPracticeVerb);
    elements.practiceAgainBtn.addEventListener('click', () => showScreen('practice-setup'));
    elements.practiceMenuBtn.addEventListener('click', () => showScreen('menu'));
    
    // Memorize mode
    elements.startMemorizeBtn.addEventListener('click', startMemorize);
    elements.flashcardImperfekt.addEventListener('click', () => flipCard('flashcard-imperfekt'));
    elements.flashcardPerfekt.addEventListener('click', () => flipCard('flashcard-perfekt'));
    elements.memorizeNextBtn.addEventListener('click', nextMemorizeVerb);
    elements.memorizeAgainBtn.addEventListener('click', () => showScreen('memorize-setup'));
    elements.memorizeMenuBtn.addEventListener('click', () => showScreen('menu'));
}

// Switch between screens
function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById(`${screenName}-screen`).classList.add('active');
    
    // Show/hide home button based on screen
    const showHomeBtn = ['practice', 'memorize', 'practice-setup', 'memorize-setup'].includes(screenName);
    elements.homeBtn.classList.toggle('hidden', !showHomeBtn);
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

// ==================
// PRACTICE MODE
// ==================

function startPractice() {
    const countValue = document.querySelector('input[name="practice-verb-count"]:checked').value;
    const count = countValue === 'all' ? verbs.length : parseInt(countValue);
    const tense = document.querySelector('input[name="practice-tense"]:checked').value;
    const subject = document.querySelector('input[name="practice-subject"]:checked').value;
    
    currentSession = {
        mode: 'practice',
        tense: tense,
        subject: subject,
        verbs: shuffleArray(verbs).slice(0, count),
        currentIndex: 0,
        score: 0,
        mistakes: []
    };
    
    // Update labels with selected subject
    document.getElementById('label-subject-imperfekt').textContent = subject;
    document.getElementById('label-subject-perfekt').textContent = subject;
    
    // Show/hide input fields based on tense selection
    document.getElementById('input-group-imperfekt').style.display = (tense === 'imperfekt' || tense === 'both') ? 'block' : 'none';
    document.getElementById('input-group-perfekt').style.display = (tense === 'perfekt' || tense === 'both') ? 'block' : 'none';
    document.getElementById('feedback-imperfekt').style.display = (tense === 'imperfekt' || tense === 'both') ? 'block' : 'none';
    document.getElementById('feedback-perfekt').style.display = (tense === 'perfekt' || tense === 'both') ? 'block' : 'none';
    
    elements.practiceTotalNum.textContent = currentSession.verbs.length;
    showScreen('practice');
    displayPracticeVerb();
}

function displayPracticeVerb() {
    const verb = currentSession.verbs[currentSession.currentIndex];
    
    // Update progress
    elements.practiceCurrentNum.textContent = currentSession.currentIndex + 1;
    const progressPercent = (currentSession.currentIndex / currentSession.verbs.length) * 100;
    elements.practiceProgress.style.width = `${progressPercent}%`;
    
    // Display verb
    elements.practiceInfinitive.textContent = verb.infinitive;
    elements.practiceTranslation.textContent = verb.translation;
    
    // Reset form
    elements.praeteritum.value = '';
    elements.partizip.value = '';
    elements.praeteritum.classList.remove('correct', 'incorrect');
    elements.partizip.classList.remove('correct', 'incorrect');
    elements.praeteritum.disabled = false;
    elements.partizip.disabled = false;
    elements.submitBtn.style.display = 'block';
    elements.feedback.classList.add('hidden');
    
    // Focus the appropriate input
    if (currentSession.tense === 'perfekt') {
        elements.partizip.focus();
    } else {
        elements.praeteritum.focus();
    }
}

function normalizeAnswer(str) {
    // Normalize: lowercase, trim, and convert ß to ss for comparison
    return str.toLowerCase().trim().replace(/ß/g, 'ss');
}

function isCorrect(userAnswer, correctAnswer) {
    return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);
}

function checkAnswer(e) {
    e.preventDefault();
    
    const verb = currentSession.verbs[currentSession.currentIndex];
    const tense = currentSession.tense;
    const subject = currentSession.subject;
    const praeteritumAnswer = elements.praeteritum.value;
    const partizipAnswer = elements.partizip.value;
    
    // Get correct answers from the verb data using selected subject
    const correctPraeteritum = verb.imperfekt[subject].german;
    const correctPartizip = verb.perfekt[subject].german;
    
    // Check based on selected tense
    const praeteritumCorrect = (tense === 'perfekt') ? true : isCorrect(praeteritumAnswer, correctPraeteritum);
    const partizipCorrect = (tense === 'imperfekt') ? true : isCorrect(partizipAnswer, correctPartizip);
    
    // Update input styles based on tense
    if (tense === 'imperfekt' || tense === 'both') {
        elements.praeteritum.classList.add(praeteritumCorrect ? 'correct' : 'incorrect');
        elements.praeteritum.disabled = true;
    }
    if (tense === 'perfekt' || tense === 'both') {
        elements.partizip.classList.add(partizipCorrect ? 'correct' : 'incorrect');
        elements.partizip.disabled = true;
    }
    
    // Show feedback
    elements.correctPraeteritum.textContent = correctPraeteritum;
    elements.correctPartizip.textContent = correctPartizip;
    elements.submitBtn.style.display = 'none';
    elements.feedback.classList.remove('hidden');
    
    // Update score
    if (praeteritumCorrect && partizipCorrect) {
        currentSession.score++;
    } else {
        currentSession.mistakes.push({
            verb: verb.infinitive,
            translation: verb.translation,
            praeteritum: correctPraeteritum,
            partizip: correctPartizip,
            userPraeteritum: praeteritumAnswer || '(empty)',
            userPartizip: partizipAnswer || '(empty)'
        });
    }
}

function nextPracticeVerb() {
    currentSession.currentIndex++;
    
    if (currentSession.currentIndex >= currentSession.verbs.length) {
        showPracticeResults();
    } else {
        displayPracticeVerb();
    }
}

function showPracticeResults() {
    const total = currentSession.verbs.length;
    const score = currentSession.score;
    const percentage = Math.round((score / total) * 100);
    
    elements.finalScore.textContent = score;
    elements.finalTotal.textContent = total;
    elements.scorePercentage.textContent = `${percentage}%`;
    
    if (percentage >= 80) {
        elements.scorePercentage.style.color = 'var(--success)';
    } else if (percentage >= 50) {
        elements.scorePercentage.style.color = 'var(--secondary-color)';
    } else {
        elements.scorePercentage.style.color = 'var(--error)';
    }
    
    if (currentSession.mistakes.length > 0) {
        elements.mistakesSummary.classList.remove('hidden');
        elements.mistakesList.innerHTML = currentSession.mistakes.map(m => `
            <li>
                <strong>${m.verb}</strong> (${m.translation})<br>
                Präteritum: ${m.praeteritum} (you wrote: ${m.userPraeteritum})<br>
                Partizip Perfekt: ${m.partizip} (you wrote: ${m.userPartizip})
            </li>
        `).join('');
    } else {
        elements.mistakesSummary.classList.add('hidden');
    }
    
    elements.practiceProgress.style.width = '100%';
    showScreen('practice-results');
}

// ==================
// MEMORIZE MODE
// ==================

function startMemorize() {
    const countValue = document.querySelector('input[name="memorize-verb-count"]:checked').value;
    const count = countValue === 'all' ? verbs.length : parseInt(countValue);
    const tense = document.querySelector('input[name="memorize-tense"]:checked').value;
    const subject = document.querySelector('input[name="memorize-subject"]:checked').value;
    
    currentSession = {
        mode: 'memorize',
        tense: tense,
        subject: subject,
        verbs: shuffleArray(verbs).slice(0, count),
        currentIndex: 0
    };
    
    // Update flashcard labels with selected subject
    document.querySelector('#flashcard-imperfekt .flashcard-label').textContent = `Präteritum (${subject})`;
    document.querySelector('#flashcard-imperfekt .flashcard-back .flashcard-label').textContent = `Präteritum (${subject})`;
    document.querySelector('#flashcard-perfekt .flashcard-label').textContent = `Partizip Perfekt (${subject})`;
    document.querySelector('#flashcard-perfekt .flashcard-back .flashcard-label').textContent = `Partizip Perfekt (${subject})`;
    
    // Show/hide flashcards based on tense selection
    elements.flashcardImperfekt.style.display = (tense === 'imperfekt' || tense === 'both') ? 'block' : 'none';
    elements.flashcardPerfekt.style.display = (tense === 'perfekt' || tense === 'both') ? 'block' : 'none';
    
    elements.memorizeTotalNum.textContent = currentSession.verbs.length;
    showScreen('memorize');
    displayMemorizeVerb();
}

function displayMemorizeVerb() {
    const verb = currentSession.verbs[currentSession.currentIndex];
    
    // Update progress
    elements.memorizeCurrentNum.textContent = currentSession.currentIndex + 1;
    const progressPercent = (currentSession.currentIndex / currentSession.verbs.length) * 100;
    elements.memorizeProgress.style.width = `${progressPercent}%`;
    
    // Display verb
    elements.memorizeInfinitive.textContent = verb.infinitive;
    elements.memorizeTranslation.textContent = verb.translation;
    
    // Set flashcard answers using selected subject
    const subject = currentSession.subject;
    elements.memorizeImperfekt.textContent = verb.imperfekt[subject].german;
    elements.memorizePerfekt.textContent = verb.perfekt[subject].german;
    
    // Reset flashcards (unflip them)
    elements.flashcardImperfekt.classList.remove('flipped');
    elements.flashcardPerfekt.classList.remove('flipped');
}

function flipCard(cardId) {
    document.getElementById(cardId).classList.toggle('flipped');
}

function nextMemorizeVerb() {
    currentSession.currentIndex++;
    
    if (currentSession.currentIndex >= currentSession.verbs.length) {
        elements.memorizeProgress.style.width = '100%';
        showScreen('memorize-complete');
    } else {
        displayMemorizeVerb();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
