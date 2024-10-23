export function compareStrings(answer: string, submission: string) {
    let result = '';
    const maxLength = Math.max(answer.length, submission.length);

    for (let i = 0; i < maxLength; i++) {
        const answerChar = answer[i] || '';
        const submissionChar = submission[i] || '';

        if (!answerChar && submissionChar) {
            result += `[${submissionChar}(X)]`;
        } else if (answerChar === submissionChar) {
            result += answerChar;
        } else {
            result += `[${submissionChar ? `${submissionChar}(<-${answerChar})` : answerChar}]`;
        }
    }

    return result;
}