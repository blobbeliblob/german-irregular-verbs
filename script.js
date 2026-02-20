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
        praesens: document.getElementById('praesens'),
        praeteritum: document.getElementById('praeteritum'),
        auxiliarySelector: document.getElementById('auxiliary-selector'),
        auxiliaryRadios: document.querySelectorAll('input[name="auxiliary"]'),
        partizip: document.getElementById('partizip'),
        submitBtn: document.getElementById('submit-btn'),
        feedback: document.getElementById('feedback'),
        correctPraesens: document.getElementById('correct-praesens'),
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
        flashcardPraesens: document.getElementById('flashcard-praesens'),
        flashcardImperfekt: document.getElementById('flashcard-imperfekt'),
        flashcardPerfekt: document.getElementById('flashcard-perfekt'),
        memorizePraesens: document.getElementById('memorize-praesens'),
        memorizeImperfekt: document.getElementById('memorize-imperfekt'),
        memorizePerfekt: document.getElementById('memorize-perfekt'),
        memorizeNextBtn: document.getElementById('memorize-next-btn'),
        memorizeAgainBtn: document.getElementById('memorize-again-btn'),
        memorizeMenuBtn: document.getElementById('memorize-menu-btn'),
        
        // Meanings elements
        startMeaningsBtn: document.getElementById('start-meanings-btn'),
        meaningsProgress: document.getElementById('meanings-progress'),
        meaningsCurrentNum: document.getElementById('meanings-current-num'),
        meaningsTotalNum: document.getElementById('meanings-total-num'),
        meaningsLabel: document.getElementById('meanings-label'),
        meaningsWord: document.getElementById('meanings-word'),
        meaningsChoices: document.getElementById('meanings-choices'),
        meaningChoiceButtons: document.querySelectorAll('.meaning-choice'),
        meaningsNextBtn: document.getElementById('meanings-next-btn'),
        meaningsFinalScore: document.getElementById('meanings-final-score'),
        meaningsFinalTotal: document.getElementById('meanings-final-total'),
        meaningsScorePercentage: document.getElementById('meanings-score-percentage'),
        meaningsMistakesSummary: document.getElementById('meanings-mistakes-summary'),
        meaningsMistakesList: document.getElementById('meanings-mistakes-list'),
        meaningsAgainBtn: document.getElementById('meanings-again-btn'),
        meaningsMenuBtn: document.getElementById('meanings-menu-btn')
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
            } else if (mode === 'meanings') {
                showScreen('meanings-setup');
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
    elements.flashcardPraesens.addEventListener('click', () => flipCard('flashcard-praesens'));
    elements.flashcardImperfekt.addEventListener('click', () => flipCard('flashcard-imperfekt'));
    elements.flashcardPerfekt.addEventListener('click', () => flipCard('flashcard-perfekt'));
    elements.memorizeNextBtn.addEventListener('click', nextMemorizeVerb);
    elements.memorizeAgainBtn.addEventListener('click', () => showScreen('memorize-setup'));
    elements.memorizeMenuBtn.addEventListener('click', () => showScreen('menu'));
    
    // Meanings mode
    elements.startMeaningsBtn.addEventListener('click', startMeanings);
    elements.meaningChoiceButtons.forEach(btn => {
        btn.addEventListener('click', (e) => checkMeaningsAnswer(e.target));
    });
    elements.meaningsNextBtn.addEventListener('click', nextMeaningsVerb);
    elements.meaningsAgainBtn.addEventListener('click', () => showScreen('meanings-setup'));
    elements.meaningsMenuBtn.addEventListener('click', () => showScreen('menu'));
}

// Switch between screens
function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById(`${screenName}-screen`).classList.add('active');
    
    // Show/hide home button based on screen
    const showHomeBtn = ['practice', 'memorize', 'meanings', 'practice-setup', 'memorize-setup', 'meanings-setup'].includes(screenName);
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
    const tense = document.querySelector('input[name="practice-tense"]:checked').value;
    const subject = document.querySelector('input[name="practice-subject"]:checked').value;
    const verbType = document.querySelector('input[name="practice-verb-type"]:checked').value;
    
    // Filter verbs by type
    let filteredVerbs = verbs;
    if (verbType === 'irregular') {
        filteredVerbs = verbs.filter(v => v.irregular === true);
    } else if (verbType === 'regular') {
        filteredVerbs = verbs.filter(v => v.irregular === false);
    }
    
    const count = countValue === 'all' ? filteredVerbs.length : parseInt(countValue);
    
    currentSession = {
        mode: 'practice',
        tense: tense,
        subject: subject,
        verbs: shuffleArray(filteredVerbs).slice(0, count),
        currentIndex: 0,
        score: 0,
        mistakes: []
    };
    
    // Update labels with selected subject
    document.getElementById('label-subject-praesens').textContent = subject;
    document.getElementById('label-subject-imperfekt').textContent = subject;
    document.getElementById('label-subject-perfekt').textContent = subject;
    
    // Show/hide input fields based on tense selection
    document.getElementById('input-group-praesens').style.display = (tense === 'praesens' || tense === 'all') ? 'block' : 'none';
    document.getElementById('input-group-imperfekt').style.display = (tense === 'imperfekt' || tense === 'all') ? 'block' : 'none';
    document.getElementById('input-group-perfekt').style.display = (tense === 'perfekt' || tense === 'all') ? 'block' : 'none';
    document.getElementById('feedback-praesens').style.display = (tense === 'praesens' || tense === 'all') ? 'block' : 'none';
    document.getElementById('feedback-imperfekt').style.display = (tense === 'imperfekt' || tense === 'all') ? 'block' : 'none';
    document.getElementById('feedback-perfekt').style.display = (tense === 'perfekt' || tense === 'all') ? 'block' : 'none';
    
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
    elements.praesens.value = '';
    elements.praeteritum.value = '';
    elements.partizip.value = '';
    elements.praesens.classList.remove('correct', 'incorrect');
    elements.praeteritum.classList.remove('correct', 'incorrect');
    elements.partizip.classList.remove('correct', 'incorrect');
    elements.praesens.disabled = false;
    elements.praeteritum.disabled = false;
    elements.partizip.disabled = false;
    elements.submitBtn.classList.remove('hidden');
    
    // Generate auxiliary selector with conjugated forms for current subject
    generateAuxiliarySelector(currentSession.subject);
    
    // Hide answers and next button
    elements.correctPraesens.classList.add('answer-hidden');
    elements.correctPraeteritum.classList.add('answer-hidden');
    elements.correctPartizip.classList.add('answer-hidden');
    elements.correctPraesens.textContent = '—';
    elements.correctPraeteritum.textContent = '—';
    elements.correctPartizip.textContent = '—';
    elements.nextBtn.classList.add('hidden');
    
    // Focus the appropriate input
    if (currentSession.tense === 'praesens') {
        elements.praesens.focus();
    } else if (currentSession.tense === 'imperfekt') {
        elements.praeteritum.focus();
    } else if (currentSession.tense === 'perfekt') {
        elements.partizip.focus();
    } else {
        elements.praesens.focus();
    }
}

function normalizeAnswer(str) {
    // Normalize: lowercase, trim, and convert ß to ss for comparison
    return str.toLowerCase().trim().replace(/ß/g, 'ss');
}

// Generate all valid answer options from a correct answer string
// Handles alternatives like "standst/standest auf" → ["standst auf", "standest auf"]
function generateAnswerOptions(correctAnswer) {
    if (!correctAnswer.includes('/')) {
        return [correctAnswer];
    }
    
    const parts = correctAnswer.split(' ');
    
    // Find which part contains the alternatives (the one with '/')
    const altPartIndex = parts.findIndex(p => p.includes('/'));
    if (altPartIndex === -1) {
        return [correctAnswer];
    }
    
    // Get the alternatives for that part
    const alternatives = parts[altPartIndex].split('/');
    
    // Generate all combinations by replacing the alternatives part
    const options = alternatives.map(alt => {
        const newParts = [...parts];
        newParts[altPartIndex] = alt;
        return newParts.join(' ');
    });
    
    return options;
}

// Conjugation maps for haben and sein
const HABEN_CONJUGATIONS = {
    'ich': 'habe',
    'du': 'hast',
    'er/sie/es': 'hat',
    'wir': 'haben',
    'ihr': 'habt',
    'sie/Sie': 'haben'
};

const SEIN_CONJUGATIONS = {
    'ich': 'bin',
    'du': 'bist',
    'er/sie/es': 'ist',
    'wir': 'sind',
    'ihr': 'seid',
    'sie/Sie': 'sind'
};

// Helper function to parse Perfekt answer into auxiliary and participle options
function parsePerfektAnswer(perfektString) {
    const parts = perfektString.split(' ');
    const auxPart = parts[0]; // e.g., "bin" or "bin/habe"
    const participlePart = parts.slice(1).join(' '); // e.g., "gegangen" or "gelaufen/geloffen"
    
    // Parse auxiliary forms (keeping them as-is, not mapping to infinitive)
    const auxForms = auxPart.split('/');
    const auxiliaries = auxForms.map(a => a.toLowerCase());
    
    // Parse participle options
    const participles = participlePart.split('/').map(p => p.trim());
    
    return {
        auxiliaries: auxiliaries,
        participles: participles,
        fullAnswer: perfektString
    };
}

// Generate auxiliary radio buttons for current subject
function generateAuxiliarySelector(subject) {
    const container = elements.auxiliarySelector;
    const habenForm = HABEN_CONJUGATIONS[subject];
    const seinForm = SEIN_CONJUGATIONS[subject];
    
    container.innerHTML = `
        <label class="radio-option auxiliary-option">
            <input type="radio" name="auxiliary" value="${habenForm}">
            <span class="radio-btn">${habenForm}</span>
        </label>
        <label class="radio-option auxiliary-option">
            <input type="radio" name="auxiliary" value="${seinForm}">
            <span class="radio-btn">${seinForm}</span>
        </label>
    `;
    
    // Update the auxiliaryRadios reference
    elements.auxiliaryRadios = document.querySelectorAll('input[name="auxiliary"]');
}

function isCorrect(userAnswer, correctAnswer) {
    // Generate all valid options from the correct answer (handles alternatives like "standst/standest auf")
    const validOptions = generateAnswerOptions(correctAnswer);
    const normalizedUserAnswer = normalizeAnswer(userAnswer);
    
    // Check if user answer matches any valid option
    return validOptions.some(option => normalizeAnswer(option) === normalizedUserAnswer);
}

function checkAnswer(e) {
    e.preventDefault();
    
    const verb = currentSession.verbs[currentSession.currentIndex];
    const tense = currentSession.tense;
    const subject = currentSession.subject;
    const praesensAnswer = elements.praesens.value;
    const praeteritumAnswer = elements.praeteritum.value;
    const partizipAnswer = elements.partizip.value;
    const selectedAuxiliary = document.querySelector('input[name="auxiliary"]:checked');
    const auxiliaryAnswer = selectedAuxiliary ? selectedAuxiliary.value : '';
    
    // Get correct answers from the verb data using selected subject
    const correctPraesens = verb.present[subject].german;
    const correctPraeteritum = verb.imperfekt[subject].german;
    const correctPartizip = verb.perfekt[subject].german;
    
    // Parse the Perfekt answer for auxiliary and participle options
    const perfektParsed = parsePerfektAnswer(correctPartizip);
    
    // Check Perfekt: both auxiliary and participle must be correct
    let partizipCorrect = true;
    let auxiliaryCorrect = true;
    let participleCorrect = true;
    
    if (tense === 'perfekt' || tense === 'all') {
        // Check if selected auxiliary is one of the valid options
        auxiliaryCorrect = perfektParsed.auxiliaries.includes(auxiliaryAnswer);
        
        // Check if participle matches any of the valid options
        participleCorrect = perfektParsed.participles.some(p => 
            normalizeAnswer(partizipAnswer) === normalizeAnswer(p)
        );
        
        partizipCorrect = auxiliaryCorrect && participleCorrect;
    }
    
    // Check based on selected tense
    const praesensCorrect = (tense === 'imperfekt' || tense === 'perfekt') ? true : isCorrect(praesensAnswer, correctPraesens);
    const praeteritumCorrect = (tense === 'praesens' || tense === 'perfekt') ? true : isCorrect(praeteritumAnswer, correctPraeteritum);
    
    // Update input styles based on tense
    if (tense === 'praesens' || tense === 'all') {
        elements.praesens.classList.add(praesensCorrect ? 'correct' : 'incorrect');
        elements.praesens.disabled = true;
    }
    if (tense === 'imperfekt' || tense === 'all') {
        elements.praeteritum.classList.add(praeteritumCorrect ? 'correct' : 'incorrect');
        elements.praeteritum.disabled = true;
    }
    if (tense === 'perfekt' || tense === 'all') {
        // Style the auxiliary selector
        elements.auxiliaryRadios.forEach(radio => {
            radio.disabled = true;
            if (radio.checked) {
                radio.parentElement.classList.add(auxiliaryCorrect ? 'correct' : 'incorrect');
            }
        });
        
        // Style the participle input
        elements.partizip.classList.add(participleCorrect ? 'correct' : 'incorrect');
        elements.partizip.disabled = true;
    }
    
    // Show feedback
    elements.correctPraesens.textContent = correctPraesens;
    elements.correctPraeteritum.textContent = correctPraeteritum;
    elements.correctPartizip.textContent = correctPartizip;
    elements.correctPraesens.classList.remove('answer-hidden');
    elements.correctPraeteritum.classList.remove('answer-hidden');
    elements.correctPartizip.classList.remove('answer-hidden');
    elements.submitBtn.classList.add('hidden');
    
    // Update next button text based on position
    const isLastVerb = currentSession.currentIndex >= currentSession.verbs.length - 1;
    elements.nextBtn.textContent = isLastVerb ? 'Finish Practice' : 'Next Verb';
    elements.nextBtn.classList.remove('hidden');
    
    // Update score - count each tense separately
    let hasMistake = false;
    
    if (tense === 'praesens' || tense === 'all') {
        if (praesensCorrect) {
            currentSession.score++;
        } else {
            hasMistake = true;
        }
    }
    
    if (tense === 'imperfekt' || tense === 'all') {
        if (praeteritumCorrect) {
            currentSession.score++;
        } else {
            hasMistake = true;
        }
    }
    
    if (tense === 'perfekt' || tense === 'all') {
        if (partizipCorrect) {
            currentSession.score++;
        } else {
            hasMistake = true;
        }
    }
    
    // Track mistakes for review
    if (hasMistake) {
        currentSession.mistakes.push({
            verb: verb.infinitive,
            translation: verb.translation,
            praesens: correctPraesens,
            praeteritum: correctPraeteritum,
            partizip: correctPartizip,
            userPraesens: praesensAnswer || '(empty)',
            userPraeteritum: praeteritumAnswer || '(empty)',
            userPartizip: auxiliaryAnswer ? `${auxiliaryAnswer} ${partizipAnswer}` : partizipAnswer || '(empty)',
            praesensCorrect: praesensCorrect,
            praeteritumCorrect: praeteritumCorrect,
            partizipCorrect: partizipCorrect
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
    // Calculate total based on tenses being practiced
    const tense = currentSession.tense;
    let tensesCount = 1;
    if (tense === 'all') {
        tensesCount = 3; // praesens, praeteritum, partizip
    }
    const total = currentSession.verbs.length * tensesCount;
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
        const tense = currentSession.tense;
        elements.mistakesList.innerHTML = currentSession.mistakes.map(m => {
            let lines = [`<strong>${m.verb}</strong> (${m.translation})`];
            
            // Only show tenses that were practiced and incorrect
            if ((tense === 'praesens' || tense === 'all') && !m.praesensCorrect) {
                lines.push(`Präsens: ${m.praesens} (you wrote: ${m.userPraesens})`);
            }
            if ((tense === 'imperfekt' || tense === 'all') && !m.praeteritumCorrect) {
                lines.push(`Präteritum: ${m.praeteritum} (you wrote: ${m.userPraeteritum})`);
            }
            if ((tense === 'perfekt' || tense === 'all') && !m.partizipCorrect) {
                lines.push(`Partizip Perfekt: ${m.partizip} (you wrote: ${m.userPartizip})`);
            }
            
            return `<li>${lines.join('<br>')}</li>`;
        }).join('');
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
    const tense = document.querySelector('input[name="memorize-tense"]:checked').value;
    const subject = document.querySelector('input[name="memorize-subject"]:checked').value;
    const verbType = document.querySelector('input[name="memorize-verb-type"]:checked').value;
    
    // Filter verbs by type
    let filteredVerbs = verbs;
    if (verbType === 'irregular') {
        filteredVerbs = verbs.filter(v => v.irregular === true);
    } else if (verbType === 'regular') {
        filteredVerbs = verbs.filter(v => v.irregular === false);
    }
    
    const count = countValue === 'all' ? filteredVerbs.length : parseInt(countValue);
    
    currentSession = {
        mode: 'memorize',
        tense: tense,
        subject: subject,
        verbs: shuffleArray(filteredVerbs).slice(0, count),
        currentIndex: 0
    };
    
    // Update flashcard labels with selected subject
    document.querySelectorAll('#flashcard-praesens .flashcard-subject').forEach(el => el.textContent = subject);
    document.querySelectorAll('#flashcard-imperfekt .flashcard-subject').forEach(el => el.textContent = subject);
    document.querySelectorAll('#flashcard-perfekt .flashcard-subject').forEach(el => el.textContent = subject);
    
    // Show/hide flashcards based on tense selection
    elements.flashcardPraesens.style.display = (tense === 'praesens' || tense === 'all') ? 'block' : 'none';
    elements.flashcardImperfekt.style.display = (tense === 'imperfekt' || tense === 'all') ? 'block' : 'none';
    elements.flashcardPerfekt.style.display = (tense === 'perfekt' || tense === 'all') ? 'block' : 'none';
    
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
    elements.memorizePraesens.textContent = verb.present[subject].german;
    elements.memorizeImperfekt.textContent = verb.imperfekt[subject].german;
    elements.memorizePerfekt.textContent = verb.perfekt[subject].german;
    
    // Reset flashcards (unflip them)
    elements.flashcardPraesens.classList.remove('flipped');
    elements.flashcardImperfekt.classList.remove('flipped');
    elements.flashcardPerfekt.classList.remove('flipped');
    
    // Update next button text based on position
    const isLastVerb = currentSession.currentIndex >= currentSession.verbs.length - 1;
    elements.memorizeNextBtn.textContent = isLastVerb ? 'Finish Review' : 'Next Verb';
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

// ==================
// MEANINGS MODE
// ==================

function startMeanings() {
    const countValue = document.querySelector('input[name="meanings-verb-count"]:checked').value;
    const direction = document.querySelector('input[name="meanings-direction"]:checked').value;
    
    const count = countValue === 'all' ? verbs.length : parseInt(countValue);
    
    currentSession = {
        mode: 'meanings',
        direction: direction,
        verbs: shuffleArray(verbs).slice(0, count),
        currentIndex: 0,
        score: 0,
        mistakes: []
    };
    
    elements.meaningsTotalNum.textContent = currentSession.verbs.length;
    showScreen('meanings');
    displayMeaningsVerb();
}

function displayMeaningsVerb() {
    const verb = currentSession.verbs[currentSession.currentIndex];
    
    // Update progress
    elements.meaningsCurrentNum.textContent = currentSession.currentIndex + 1;
    const progressPercent = (currentSession.currentIndex / currentSession.verbs.length) * 100;
    elements.meaningsProgress.style.width = `${progressPercent}%`;
    
    // Determine direction for this round
    let showGerman;
    if (currentSession.direction === 'de-en') {
        showGerman = true;
    } else if (currentSession.direction === 'en-de') {
        showGerman = false;
    } else {
        // Mix: randomly choose direction
        showGerman = Math.random() < 0.5;
    }
    
    // Store current direction for answer checking
    currentSession.currentShowGerman = showGerman;
    
    // Display the word
    elements.meaningsLabel.textContent = showGerman ? 'German' : 'English';
    elements.meaningsWord.textContent = showGerman ? verb.infinitive : verb.translation;
    
    // Generate 4 choices (1 correct + 3 wrong)
    const correctAnswer = showGerman ? verb.translation : verb.infinitive;
    const wrongAnswers = getWrongAnswers(verb, showGerman, 3);
    const choices = shuffleArray([correctAnswer, ...wrongAnswers]);
    
    // Store correct answer index
    currentSession.correctAnswerIndex = choices.indexOf(correctAnswer);
    currentSession.correctAnswer = correctAnswer;
    
    // Update choice buttons
    elements.meaningChoiceButtons.forEach((btn, index) => {
        btn.textContent = choices[index];
        btn.disabled = false;
        btn.classList.remove('correct', 'incorrect', 'correct-answer');
    });
    
    // Hide next button
    elements.meaningsNextBtn.classList.add('hidden');
}

function getWrongAnswers(currentVerb, showGerman, count) {
    // Get translations/infinitives from other verbs
    const otherVerbs = verbs.filter(v => v.infinitive !== currentVerb.infinitive);
    const shuffled = shuffleArray(otherVerbs);
    
    const wrongAnswers = [];
    for (let i = 0; i < shuffled.length && wrongAnswers.length < count; i++) {
        const answer = showGerman ? shuffled[i].translation : shuffled[i].infinitive;
        // Avoid duplicates
        if (!wrongAnswers.includes(answer)) {
            wrongAnswers.push(answer);
        }
    }
    
    return wrongAnswers;
}

function checkMeaningsAnswer(selectedButton) {
    const selectedIndex = parseInt(selectedButton.dataset.index);
    const isCorrect = selectedIndex === currentSession.correctAnswerIndex;
    
    // Disable all buttons
    elements.meaningChoiceButtons.forEach(btn => {
        btn.disabled = true;
    });
    
    // Mark selected button
    selectedButton.classList.add(isCorrect ? 'correct' : 'incorrect');
    
    // Always show the correct answer
    if (!isCorrect) {
        elements.meaningChoiceButtons[currentSession.correctAnswerIndex].classList.add('correct-answer');
    }
    
    // Update score
    if (isCorrect) {
        currentSession.score++;
    } else {
        // Track mistake
        const verb = currentSession.verbs[currentSession.currentIndex];
        currentSession.mistakes.push({
            word: currentSession.currentShowGerman ? verb.infinitive : verb.translation,
            correctAnswer: currentSession.correctAnswer,
            userAnswer: selectedButton.textContent,
            direction: currentSession.currentShowGerman ? 'DE → EN' : 'EN → DE'
        });
    }
    
    // Show next button
    const isLastVerb = currentSession.currentIndex >= currentSession.verbs.length - 1;
    elements.meaningsNextBtn.textContent = isLastVerb ? 'Finish' : 'Next Verb';
    elements.meaningsNextBtn.classList.remove('hidden');
}

function nextMeaningsVerb() {
    currentSession.currentIndex++;
    
    if (currentSession.currentIndex >= currentSession.verbs.length) {
        showMeaningsResults();
    } else {
        displayMeaningsVerb();
    }
}

function showMeaningsResults() {
    const total = currentSession.verbs.length;
    const score = currentSession.score;
    const percentage = Math.round((score / total) * 100);
    
    elements.meaningsFinalScore.textContent = score;
    elements.meaningsFinalTotal.textContent = total;
    elements.meaningsScorePercentage.textContent = `${percentage}%`;
    
    if (percentage >= 80) {
        elements.meaningsScorePercentage.style.color = 'var(--success)';
    } else if (percentage >= 50) {
        elements.meaningsScorePercentage.style.color = 'var(--secondary-color)';
    } else {
        elements.meaningsScorePercentage.style.color = 'var(--error)';
    }
    
    if (currentSession.mistakes.length > 0) {
        elements.meaningsMistakesSummary.classList.remove('hidden');
        elements.meaningsMistakesList.innerHTML = currentSession.mistakes.map(m => 
            `<li><strong>${m.word}</strong> (${m.direction})<br>Correct: ${m.correctAnswer}<br>You chose: ${m.userAnswer}</li>`
        ).join('');
    } else {
        elements.meaningsMistakesSummary.classList.add('hidden');
    }
    
    elements.meaningsProgress.style.width = '100%';
    showScreen('meanings-results');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    init();
    // Footer year update
    document.getElementById('current-year').textContent = new Date().getFullYear();
});
