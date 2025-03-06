// Import the GIFT formatter module
import { exportToGiftFile } from './gift-formatter.js';

const QUESTION_TYPES = {
    MCQ: {
        name: 'Multiple Choice (Single Answer)',
        templateGenerator: generateMultipleChoiceTemplate,
        validator: validateMultipleChoice
    },
    MCQ_MA: {
        name: 'Multiple Choice (Multiple Answers)',
        templateGenerator: generateMultipleChoiceTemplate,
        validator: validateMultipleChoice
    },
    TF: {
        name: 'True/False',
        templateGenerator: generateTrueFalseTemplate,
        validator: validateTrueFalse
    },
    MATCHING: {
        name: 'Matching',
        templateGenerator: generateMatchingTemplate,
        validator: validateMatching
    },
    NUMERICAL: {
        name: 'Numerical Range',
        templateGenerator: generateNumericalTemplate,
        validator: validateNumerical
    },
    SHORT_ANSWER: {
        name: 'Short Answer',
        templateGenerator: generateShortAnswerTemplate,
        validator: validateShortAnswer
    }
};

const form = document.getElementById('questionForm');
const questionTypeDropdown = document.getElementById('questionType');
const questionList = document.getElementById('questionList');
let addQuestionBtn;
let exportBtn;

let questions = [];
let isEditing = false;
let currentEditIndex = -1;

// Initialize the application
function init() {
    initQuestionTypeDropdown();
    
    // Set up event listeners
    addQuestionBtn = document.getElementById('addQuestionBtn');
    exportBtn = document.getElementById('exportBtn');
    
    addQuestionBtn.addEventListener('click', addQuestionToQuiz);
    exportBtn.addEventListener('click', exportToGift);
    
    questionTypeDropdown.addEventListener('change', () => {
        const type = questionTypeDropdown.value;
        form.innerHTML = '';

        if (!type) return;

        const templateGenerator = QUESTION_TYPES[type].templateGenerator;
        form.innerHTML = `
            <label>Question Text:</label>
            <input type="text" class="form-control mb-2" id="questionText" maxlength="200" required>
            <div id="answersSection">
                ${templateGenerator()}
            </div>
        `;
    });
}

// Populate dropdown dynamically
function initQuestionTypeDropdown() {
    questionTypeDropdown.innerHTML = '<option value="">Select...</option>';
    Object.entries(QUESTION_TYPES).forEach(([key, config]) => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = config.name;
        questionTypeDropdown.appendChild(option);
    });
}

// Template Generators
function generateMultipleChoiceTemplate() {
    const type = questionTypeDropdown.value;
    const inputType = type === 'MCQ_MA' ? 'checkbox' : 'radio';
    
    return `
        <div id="mcqAnswers">
            <div class="answer-row d-flex mb-2">
                <input type="${inputType}" name="correct" class="mr-2">
                <input type="text" class="form-control mr-2" placeholder="Answer">
                <input type="text" class="form-control" placeholder="Feedback">
                <button type="button" class="btn btn-danger ml-2 remove-answer">X</button>
            </div>
            <div class="answer-row d-flex mb-2">
                <input type="${inputType}" name="correct" class="mr-2">
                <input type="text" class="form-control mr-2" placeholder="Answer">
                <input type="text" class="form-control" placeholder="Feedback">
                <button type="button" class="btn btn-danger ml-2 remove-answer">X</button>
            </div>
            <button type="button" class="btn btn-secondary btn-sm" id="addMCQAnswerBtn">Add Answer</button>
        </div>
    `;
}

function generateTrueFalseTemplate() {
    return `
        <div class="d-flex">
            <div class="mr-3">
                <input type="radio" name="correct" id="trueOption" checked>
                <label for="trueOption">True</label>
            </div>
            <div>
                <input type="radio" name="correct" id="falseOption">
                <label for="falseOption">False</label>
            </div>
        </div>
    `;
}

function generateMatchingTemplate() {
    return `
        <div id="matchingAnswers">
            <div class="matching-row d-flex mb-2">
                <input type="text" class="form-control mr-2" placeholder="Sub-question">
                <input type="text" class="form-control" placeholder="Match">
                <button type="button" class="btn btn-danger ml-2 remove-matching">X</button>
            </div>
            <div class="matching-row d-flex mb-2">
                <input type="text" class="form-control mr-2" placeholder="Sub-question">
                <input type="text" class="form-control" placeholder="Match">
                <button type="button" class="btn btn-danger ml-2 remove-matching">X</button>
            </div>
            <button type="button" class="btn btn-secondary btn-sm" id="addMatchingPairBtn">Add Pair</button>
        </div>
    `;
}

function generateNumericalTemplate() {
    return `
        <div class="numerical-range d-flex">
            <input type="number" class="form-control mr-2" placeholder="Min Value">
            <input type="number" class="form-control" placeholder="Max Value">
            <input type="text" class="form-control ml-2" placeholder="Error Margin (optional)">
        </div>
    `;
}

function generateShortAnswerTemplate() {
    return `
        <div class="short-answer">
            <input type="text" class="form-control" placeholder="Accepted Answer">
            <small class="form-text text-muted">Separate multiple acceptable answers with ||</small>
        </div>
    `;
}

// Set up dynamic event handlers after template is added to DOM
function setupDynamicEventListeners() {
    // Add MCQ answer button
    const addMCQBtn = document.getElementById('addMCQAnswerBtn');
    if (addMCQBtn) {
        addMCQBtn.addEventListener('click', addMCQAnswer);
    }
    
    // Add matching pair button
    const addMatchingBtn = document.getElementById('addMatchingPairBtn');
    if (addMatchingBtn) {
        addMatchingBtn.addEventListener('click', addMatchingPair);
    }
    
    // Remove answer buttons
    document.querySelectorAll('.remove-answer').forEach(btn => {
        btn.addEventListener('click', function() {
            removeAnswer(this);
        });
    });
    
    // Remove matching pair buttons
    document.querySelectorAll('.remove-matching').forEach(btn => {
        btn.addEventListener('click', function() {
            removeMatchingPair(this);
        });
    });
}

// Validation Functions
function validateMultipleChoice() {
    const type = questionTypeDropdown.value;
    const answers = document.querySelectorAll('#mcqAnswers .answer-row');
    
    const hasCorrect = Array.from(answers).some(row => row.querySelector(`input[type="${type === 'MCQ_MA' ? 'checkbox' : 'radio'}"]`).checked);
    return answers.length >= 2 && hasCorrect;
}

function validateTrueFalse() {
    return true; // Always valid as it has predefined options
}

function validateMatching() {
    const pairs = document.querySelectorAll('#matchingAnswers .matching-row');
    return pairs.length >= 2 && 
           Array.from(pairs).every(pair => 
               pair.querySelectorAll('input')[0].value.trim() && 
               pair.querySelectorAll('input')[1].value.trim()
           );
}

function validateNumerical() {
    const inputs = document.querySelectorAll('.numerical-range input');
    return inputs[0].value && inputs[1].value && parseFloat(inputs[0].value) < parseFloat(inputs[1].value);
}

function validateShortAnswer() {
    return document.querySelector('.short-answer input').value.trim() !== '';
}

// Answer Management
function addMCQAnswer() {
    const type = questionTypeDropdown.value;
    const inputType = type === 'MCQ_MA' ? 'checkbox' : 'radio';
    
    const container = document.getElementById('mcqAnswers');
    const newRow = document.createElement('div');
    newRow.className = 'answer-row d-flex mb-2';
    newRow.innerHTML = `
        <input type="${inputType}" name="correct" class="mr-2">
        <input type="text" class="form-control mr-2" placeholder="Answer">
        <input type="text" class="form-control" placeholder="Feedback">
        <button type="button" class="btn btn-danger ml-2 remove-answer">X</button>
    `;
    
    // Add event listener to the remove button
    const removeBtn = newRow.querySelector('.remove-answer');
    removeBtn.addEventListener('click', function() {
        removeAnswer(this);
    });
    
    container.insertBefore(newRow, container.lastElementChild);
}

function removeAnswer(button) {
    button.closest('.answer-row').remove();
}

function addMatchingPair() {
    const container = document.getElementById('matchingAnswers');
    const newRow = document.createElement('div');
    newRow.className = 'matching-row d-flex mb-2';
    newRow.innerHTML = `
        <input type="text" class="form-control mr-2" placeholder="Sub-question">
        <input type="text" class="form-control" placeholder="Match">
        <button type="button" class="btn btn-danger ml-2 remove-matching">X</button>
    `;
    
    // Add event listener to the remove button
    const removeBtn = newRow.querySelector('.remove-matching');
    removeBtn.addEventListener('click', function() {
        removeMatchingPair(this);
    });
    
    container.insertBefore(newRow, container.lastElementChild);
}

function removeMatchingPair(button) {
    button.closest('.matching-row').remove();
}

// Question Processing
function processQuestion() {
    const type = questionTypeDropdown.value;
    const text = document.getElementById('questionText').value.trim();
    const validator = QUESTION_TYPES[type].validator;

    if (!text) {
        alert('Please enter a question');
        return null;
    }

    if (!validator()) {
        alert('Invalid question configuration');
        return null;
    }

    let questionData = { type, text };

    switch(type) {
        case 'MCQ':
        case 'MCQ_MA':
            questionData.answers = processMultipleChoiceAnswers();
            break;
        case 'TF':
            questionData.answers = processTrueFalseAnswer();
            break;
        case 'MATCHING':
            questionData.matches = processMatchingPairs();
            break;
        case 'NUMERICAL':
            questionData.range = processNumericalRange();
            break;
        case 'SHORT_ANSWER':
            questionData.acceptedAnswers = processShortAnswers();
            break;
    }

    return questionData;
}

// Answer Processing Functions
function processMultipleChoiceAnswers() {
    const type = questionTypeDropdown.value;
    const inputType = type === 'MCQ_MA' ? 'checkbox' : 'radio';
    
    return Array.from(document.querySelectorAll('#mcqAnswers .answer-row')).map(row => ({
        text: row.querySelectorAll('input')[1].value,
        correct: row.querySelector(`input[type="${inputType}"]`).checked,
        feedback: row.querySelectorAll('input')[2].value
    }));
}

function processTrueFalseAnswer() {
    const trueOption = document.getElementById('trueOption');
    return [
        { text: 'True', correct: trueOption.checked },
        { text: 'False', correct: !trueOption.checked }
    ];
}

function processMatchingPairs() {
    return Array.from(document.querySelectorAll('#matchingAnswers .matching-row')).map(row => ({
        subquestion: row.querySelectorAll('input')[0].value,
        answer: row.querySelectorAll('input')[1].value
    }));
}

function processNumericalRange() {
    const inputs = document.querySelectorAll('.numerical-range input');
    return {
        min: parseFloat(inputs[0].value),
        max: parseFloat(inputs[1].value),
        errorMargin: inputs[2].value
    };
}

function processShortAnswers() {
    return document.querySelector('.short-answer input').value.split('||').map(a => a.trim());
}

// Main Functions
function addQuestionToQuiz() {
    const question = processQuestion();
    if (question) {
        if (isEditing) {
            // Insert at previous position instead of push
            questions.splice(currentEditIndex, 0, question);
            
            // Reset editing state
            isEditing = false;
            addQuestionBtn.textContent = 'Add to Quiz';
        } else {
            questions.push(question);
        }
        
        updateQuestionList();
        resetForm();
    }
}

function updateQuestionList() {
    questionList.innerHTML = '';
    questions.forEach((q, index) => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        
        // Create text content
        const textSpan = document.createElement('span');
        textSpan.textContent = `${index + 1}. ${q.text} (${QUESTION_TYPES[q.type].name})`;
        
        // Create button container
        const buttonsSpan = document.createElement('span');
        
        // Create edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-warning btn-sm mr-2';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => editQuestion(index));
        
        // Create remove button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn btn-danger btn-sm';
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', () => removeQuestion(index));
        
        // Add buttons to container
        buttonsSpan.appendChild(editBtn);
        buttonsSpan.appendChild(removeBtn);
        
        // Add text and buttons to list item
        li.appendChild(textSpan);
        li.appendChild(buttonsSpan);
        
        // Add list item to list
        questionList.appendChild(li);
    });
}

function removeQuestion(index) {
    questions.splice(index, 1);
    updateQuestionList();
}

function editQuestion(index) {
    isEditing = true;
    currentEditIndex = index;
    
    // Update button text
    addQuestionBtn.textContent = 'Save Question';
    
    const q = questions[index];
    questionTypeDropdown.value = q.type;
    
    // Trigger the change event to update the form
    questionTypeDropdown.dispatchEvent(new Event('change'));
    
    // After form is updated, we need to set up the dynamic event listeners
    setTimeout(() => {
        setupDynamicEventListeners();
        
        // Now fill in the question data
        document.getElementById('questionText').value = q.text;

        // Restore question-specific details
        switch(q.type) {
            case 'MCQ':
            case 'MCQ_MA':
                restoreMultipleChoiceAnswers(q.answers);
                break;
            case 'TF':
                restoreTrueFalseAnswer(q.answers);
                break;
            case 'MATCHING':
                restoreMatchingPairs(q.matches);
                break;
            case 'NUMERICAL':
                restoreNumericalRange(q.range);
                break;
            case 'SHORT_ANSWER':
                restoreShortAnswers(q.acceptedAnswers);
                break;
        }
    }, 0);

    questions.splice(index, 1);
    updateQuestionList();
}

// Restoration Functions
function restoreMultipleChoiceAnswers(answers) {
    const type = questionTypeDropdown.value;
    const inputType = type === 'MCQ_MA' ? 'checkbox' : 'radio';
    
    const container = document.getElementById('mcqAnswers');
    container.innerHTML = '';
    
    answers.forEach(answer => {
        const row = document.createElement('div');
        row.className = 'answer-row d-flex mb-2';
        row.innerHTML = `
            <input type="${inputType}" name="correct" class="mr-2" ${answer.correct ? 'checked' : ''}>
            <input type="text" class="form-control mr-2" value="${answer.text || ''}">
            <input type="text" class="form-control" value="${answer.feedback || ''}">
            <button type="button" class="btn btn-danger ml-2 remove-answer">X</button>
        `;
        
        // Add event listener to the remove button
        const removeBtn = row.querySelector('.remove-answer');
        removeBtn.addEventListener('click', function() {
            removeAnswer(this);
        });
        
        container.appendChild(row);
    });
    
    // Add the "Add Answer" button
    const addButton = document.createElement('button');
    addButton.type = 'button';
    addButton.className = 'btn btn-secondary btn-sm';
    addButton.textContent = 'Add Answer';
    addButton.id = 'addMCQAnswerBtn';
    addButton.addEventListener('click', addMCQAnswer);
    
    container.appendChild(addButton);
}

function restoreTrueFalseAnswer(answers) {
    const trueOption = document.getElementById('trueOption');
    const falseOption = document.getElementById('falseOption');
    const trueAnswer = answers.find(a => a.text === 'True');
    if (trueAnswer) {
        trueOption.checked = trueAnswer.correct;
        falseOption.checked = !trueAnswer.correct;
    }
}

function restoreMatchingPairs(matches) {
    const container = document.getElementById('matchingAnswers');
    container.innerHTML = '';
    
    matches.forEach(match => {
        const row = document.createElement('div');
        row.className = 'matching-row d-flex mb-2';
        row.innerHTML = `
            <input type="text" class="form-control mr-2" value="${match.subquestion || ''}">
            <input type="text" class="form-control" value="${match.answer || ''}">
            <button type="button" class="btn btn-danger ml-2 remove-matching">X</button>
        `;
        
        // Add event listener to the remove button
        const removeBtn = row.querySelector('.remove-matching');
        removeBtn.addEventListener('click', function() {
            removeMatchingPair(this);
        });
        
        container.appendChild(row);
    });
    
    // Add the "Add Pair" button
    const addButton = document.createElement('button');
    addButton.type = 'button';
    addButton.className = 'btn btn-secondary btn-sm';
    addButton.textContent = 'Add Pair';
    addButton.id = 'addMatchingPairBtn';
    addButton.addEventListener('click', addMatchingPair);
    
    container.appendChild(addButton);
}

function restoreNumericalRange(range) {
    const inputs = document.querySelectorAll('.numerical-range input');
    inputs[0].value = range.min;
    inputs[1].value = range.max;
    if (range.errorMargin) {
        inputs[2].value = range.errorMargin;
    }
}

function restoreShortAnswers(answers) {
    document.querySelector('.short-answer input').value = answers.join(' || ');
}

function resetForm() {
    questionTypeDropdown.value = '';
    form.innerHTML = '';
    
    if (isEditing) {
        isEditing = false;
        addQuestionBtn.textContent = 'Add to Quiz';
    }
}

function exportToGift() {
    exportToGiftFile(questions);
}

// Initialize the app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    init();
    
    // Set up MutationObserver to detect when form changes
    const observer = new MutationObserver(() => {
        setupDynamicEventListeners();
    });
    
    // Start observing the form for changes
    observer.observe(form, { childList: true, subtree: true });
});

// Make necessary functions available to HTML
window.addMCQAnswer = addMCQAnswer;
window.removeAnswer = removeAnswer;
window.addMatchingPair = addMatchingPair;
window.removeMatchingPair = removeMatchingPair;