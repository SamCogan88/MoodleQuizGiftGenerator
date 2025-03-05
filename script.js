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

let questions = [];

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
                <button class="btn btn-danger ml-2" onclick="removeAnswer(this)">X</button>
            </div>
            <div class="answer-row d-flex mb-2">
                <input type="${inputType}" name="correct" class="mr-2">
                <input type="text" class="form-control mr-2" placeholder="Answer">
                <input type="text" class="form-control" placeholder="Feedback">
                <button class="btn btn-danger ml-2" onclick="removeAnswer(this)">X</button>
            </div>
            <button type="button" class="btn btn-secondary btn-sm" onclick="addMCQAnswer()">Add Answer</button>
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
                <button class="btn btn-danger ml-2" onclick="removeMatchingPair(this)">X</button>
            </div>
            <div class="matching-row d-flex mb-2">
                <input type="text" class="form-control mr-2" placeholder="Sub-question">
                <input type="text" class="form-control" placeholder="Match">
                <button class="btn btn-danger ml-2" onclick="removeMatchingPair(this)">X</button>
            </div>
            <button type="button" class="btn btn-secondary btn-sm" onclick="addMatchingPair()">Add Pair</button>
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
        <button class="btn btn-danger ml-2" onclick="removeAnswer(this)">X</button>
    `;
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
        <button class="btn btn-danger ml-2" onclick="removeMatchingPair(this)">X</button>
    `;
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
        questions.push(question);
        updateQuestionList();
        
        // Log questions in GIFT format to console
        console.log('Current Questions in GIFT Format:');
        questions.forEach((q, index) => {
            let giftQuestion = `::Q${index + 1}:: ${q.text}\n`;

            switch(q.type) {
                case 'TF':
                    giftQuestion += `{${q.answers.find(a => a.correct).text.toUpperCase()}}\n`;
                    break;
                case 'MCQ':
                case 'MCQ_MA':
                    giftQuestion += `{\n`;
                    q.answers.forEach(a => {
                        giftQuestion += `${a.correct ? '=' : '~'}${a.text}${a.feedback ? ` #${a.feedback}` : ''}\n`;
                    });
                    giftQuestion += '}\n';
                    break;
                case 'MATCHING':
                    giftQuestion += `{\n`;
                    q.matches.forEach(match => {
                        giftQuestion += `=${match.subquestion} -> ${match.answer}\n`;
                    });
                    giftQuestion += '}\n';
                    break;
                case 'NUMERICAL':
                    giftQuestion += `{#${q.range.min}..${q.range.max}`;
                    if (q.range.errorMargin) {
                        giftQuestion += `:${q.range.errorMargin}`;
                    }
                    giftQuestion += '}\n';
                    break;
                case 'SHORT_ANSWER':
                    giftQuestion += `{=${q.acceptedAnswers.join(' OR ')}}\n`;
                    break;
            }
            console.log(giftQuestion);
        });
        
        resetForm();
    }
}

function updateQuestionList() {
    questionList.innerHTML = '';
    questions.forEach((q, index) => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `
            ${index + 1}. ${q.text} (${QUESTION_TYPES[q.type].name})
            <span>
                <button class="btn btn-warning btn-sm" onclick="editQuestion(${index})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="removeQuestion(${index})">Remove</button>
            </span>`;
        questionList.appendChild(li);
    });
}
function removeQuestion(index) {
    questions.splice(index, 1);
    updateQuestionList();
    
    // Log updated questions in GIFT format
    console.log('Current Questions in GIFT Format:');
    questions.forEach((q, index) => {
        let giftQuestion = `::Q${index + 1}:: ${q.text}\n`;

        switch(q.type) {
            case 'TF':
                giftQuestion += `{${q.answers.find(a => a.correct).text.toUpperCase()}}\n`;
                break;
            case 'MCQ':
            case 'MCQ_MA':
                giftQuestion += `{\n`;
                q.answers.forEach(a => {
                    giftQuestion += `${a.correct ? '=' : '~'}${a.text}${a.feedback ? ` #${a.feedback}` : ''}\n`;
                });
                giftQuestion += '}\n';
                break;
            case 'MATCHING':
                giftQuestion += `{\n`;
                q.matches.forEach(match => {
                    giftQuestion += `=${match.subquestion} -> ${match.answer}\n`;
                });
                giftQuestion += '}\n';
                break;
            case 'NUMERICAL':
                giftQuestion += `{#${q.range.min}..${q.range.max}`;
                if (q.range.errorMargin) {
                    giftQuestion += `:${q.range.errorMargin}`;
                }
                giftQuestion += '}\n';
                break;
            case 'SHORT_ANSWER':
                giftQuestion += `{=${q.acceptedAnswers.join(' OR ')}}\n`;
                break;
        }
        console.log(giftQuestion);
    });
}
function editQuestion(index) {
    const q = questions[index];
    questionTypeDropdown.value = q.type;
    questionTypeDropdown.dispatchEvent(new Event('change'));
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
            <input type="text" class="form-control mr-2" value="${answer.text}">
            <input type="text" class="form-control" value="${answer.feedback}">
            <button class="btn btn-danger ml-2" onclick="removeAnswer(this)">X</button>
        `;
        container.appendChild(row);
    });
    container.innerHTML += `
        <button type="button" class="btn btn-secondary btn-sm" onclick="addMCQAnswer()">Add Answer</button>
    `;
}

function restoreTrueFalseAnswer(answers) {
    const trueOption = document.getElementById('trueOption');
    const falseOption = document.getElementById('falseOption');
    trueOption.checked = answers.find(a => a.text === 'True').correct;
    falseOption.checked = answers.find(a => a.text === 'False').correct;
}

function restoreMatchingPairs(matches) {
    const container = document.getElementById('matchingAnswers');
    container.innerHTML = '';
    matches.forEach(match => {
        const row = document.createElement('div');
        row.className = 'matching-row d-flex mb-2';
        row.innerHTML = `
            <input type="text" class="form-control mr-2" value="${match.subquestion}">
            <input type="text" class="form-control" value="${match.answer}">
            <button class="btn btn-danger ml-2" onclick="removeMatchingPair(this)">X</button>
        `;
        container.appendChild(row);
    });
    container.innerHTML += `
        <button type="button" class="btn btn-secondary btn-sm" onclick="addMatchingPair()">Add Pair</button>
    `;
}

function restoreNumericalRange(range) {
    const inputs = document.querySelectorAll('.numerical-range input');
    inputs[0].value = range.min;
    inputs[1].value = range.max;
    inputs[2].value = range.errorMargin || '';
}

function restoreShortAnswers(answers) {
    document.querySelector('.short-answer input').value = answers.join(' || ');
}

function resetForm() {
    questionTypeDropdown.value = '';
    form.innerHTML = '';
}

function exportToGift() {
    if (questions.length === 0) {
        alert('No questions to export');
        return;
    }

    let gift = '';
    questions.forEach((q, index) => {
        gift += `::Q${index + 1}:: ${q.text}\n`;

        switch(q.type) {
            case 'TF':
                gift += `{${q.answers.find(a => a.correct).text.toUpperCase()}}\n\n`;
                break;
            case 'MCQ':
                gift += `{\n`;
                q.answers.forEach(a => {
                    gift += `${a.correct ? '=' : '~'}${a.text}${a.feedback ? ` #${a.feedback}` : ''}\n`;
                });
                gift += '}\n\n';
                break;
            case 'MCQ_MA':
                gift += `{\n`;
                q.answers.forEach(a => {
                    gift += `${a.correct ? '=' : '~'}${a.text}${a.feedback ? ` #${a.feedback}` : ''}\n`;
                });
                gift += '}\n\n';
                break;
            case 'MATCHING':
                gift += `{\n`;
                q.matches.forEach(match => {
                    gift += `=${match.subquestion} -> ${match.answer}\n`;
                });
                gift += '}\n\n';
                break;
            case 'NUMERICAL':
                gift += `{#${q.range.min}..${q.range.max}`;
                if (q.range.errorMargin) {
                    gift += `:${q.range.errorMargin}`;
                }
                gift += '}\n\n';
                break;
            case 'SHORT_ANSWER':
                gift += `{=${q.acceptedAnswers.join(' OR ')}}\n\n`;
                break;
        }
    });

    downloadTextFile('quiz.txt', gift);
}

function downloadTextFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

// Initialize dropdown on page load
document.addEventListener('DOMContentLoaded', initQuestionTypeDropdown);