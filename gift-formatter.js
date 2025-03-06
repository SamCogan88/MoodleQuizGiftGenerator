// gift-formatter.js - Module for converting questions to GIFT format

/**
 * Converts a question object to GIFT format string
 * @param {Object} question - The question object to convert
 * @param {number} index - The question index (for naming)
 * @returns {string} GIFT formatted question
 */
function questionToGift(question, index) {
    let gift = `::Q${index + 1}:: ${escapeGiftText(question.text)}\n`;

    switch(question.type) {
        case 'TF':
            gift += `{${question.answers.find(a => a.correct).text.toUpperCase()}}\n`;
            break;
        case 'MCQ':
        case 'MCQ_MA':
            gift += `{\n`;
            question.answers.forEach(a => {
                gift += `${a.correct ? '=' : '~'}${escapeGiftText(a.text)}${a.feedback ? ` #${escapeGiftText(a.feedback)}` : ''}\n`;
            });
            gift += '}\n';
            break;
        case 'MATCHING':
            gift += `{\n`;
            question.matches.forEach(match => {
                gift += `=${escapeGiftText(match.subquestion)} -> ${escapeGiftText(match.answer)}\n`;
            });
            gift += '}\n';
            break;
        case 'NUMERICAL':
            gift += `{#${question.range.min}..${question.range.max}`;
            if (question.range.errorMargin) {
                gift += `:${question.range.errorMargin}`;
            }
            gift += '}\n';
            break;
        case 'SHORT_ANSWER':
            gift += `{=${question.acceptedAnswers.map(escapeGiftText).join(' OR ')}}\n`;
            break;
    }
    
    return gift;
}

/**
 * Escapes special characters in GIFT format
 * @param {string} text - The text to escape
 * @returns {string} Escaped text
 */
function escapeGiftText(text) {
    if (!text) return '';
    
    // In GIFT format, we need to escape: ~, =, #, {, }, :, and backslash
    return text
        .replace(/\\/g, '\\\\')
        .replace(/~/g, '\\~')
        .replace(/=/g, '\\=')
        .replace(/#/g, '\\#')
        .replace(/{/g, '\\{')
        .replace(/}/g, '\\}')
        .replace(/:/g, '\\:');
}

/**
 * Converts an array of questions to GIFT format
 * @param {Array} questions - Array of question objects
 * @returns {string} Complete GIFT formatted text
 */
function convertToGift(questions) {
    if (questions.length === 0) {
        return '';
    }

    return questions
        .map((question, index) => questionToGift(question, index))
        .join('\n');
}

/**
 * Creates and triggers download of GIFT formatted questions
 * @param {Array} questions - Array of question objects 
 * @param {string} filename - Name for the download file
 */
function exportToGiftFile(questions, filename = 'quiz.txt') {
    if (questions.length === 0) {
        alert('No questions to export');
        return;
    }

    const giftContent = convertToGift(questions);
    const blob = new Blob([giftContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

// Export the module functions
export { questionToGift, convertToGift, exportToGiftFile };