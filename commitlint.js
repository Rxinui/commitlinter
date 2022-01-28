module.exports.PASSED = 0;

module.exports.ERROR_MISSING_HEADLINE = 2000;
module.exports.ERROR_MISSING_TAG = 2001;
module.exports.ERROR_INCORRECT_TAG = 2002;
module.exports.ERROR_MISSING_TAG_WHITESPACE = 2003;
module.exports.ERROR_MISSING_HEADLINE_SUMMARY = 2004;
module.exports.ERROR_MISSING_HEADLINE_NEWLINE = 2005;

module.exports.ERROR_MISSING_ISSUE = 2100;
module.exports.ERROR_MISSING_ISSUE_OPEN_BRACKET = 2101;
module.exports.ERROR_INCORRECT_ISSUE_ID = 2102;
module.exports.ERROR_MISSING_ISSUE_NUMBER = 2103;
module.exports.ERROR_MISSING_ISSUE_CLOSE_BRACKET = 2104;

module.exports.ERROR_MISSING_DESCRIPTION = 2200;

module.exports.LintMessage = function (code, msg) {
    /**
     * Returns an object that describe a lint error
     * 
     * @param {int} code exit code
     * @param {string} msg mesage
     * @returns {object} lint message object
     */
    return { code: code, msg: msg }
};

module.exports.LintResult = function (...args) {
    /**
     * Returns an object that describe a lint error
     * 
     * @param {LintResult} args list of LintMessage
     * @returns {object} lint result object
     */
    result = { state: null, codes: [], messages: [] }
    if (args.length == 1) {
        result.state = args[0].code == this.PASSED ? "passed" : "failed"
        result.codes = [args[0].code]
        result.messages = [args[0].msg]
    } else if (args.length > 1) {
        result.state = "failed"
        result.codes = [];
        result.messages = [];
        for (let arg of args) {
            result.codes.push(arg.code);
            result.messages.push(arg.msg);
        }
    }
    return result;
};

module.exports.lintHeadline = function (commitLines, commitTags, commitIssueId) {
    /**
     * Analyse commit headline on line#0
     * 
     * @param {Array.<string>} commitLines commit content
     * @returns {LintResult} lint message code and description
    */
    const lintMessages = []
    if (commitLines.length < 1)
        lintMessages.push(this.LintMessage(this.ERROR_MISSING_HEADLINE, `error: missing a commit headline.`))
    else {
        const headline = commitLines[0];
        const regexTag = /^\w+\:/;
        const regexTagValid = new RegExp(`^(${commitTags.join("|")}):`);
        const regexTagValidWhitespace = /^\w+:\s/;
        const regexHeadlineSummary = /^\w{3,}\:\s?$/;
        if (!regexTag.test(headline))
            lintMessages.push(this.LintMessage(this.ERROR_MISSING_TAG, `error: missing tag at the beginning of the headline.`));
        if (!regexTagValid.test(headline))
            lintMessages.push(this.LintMessage(this.ERROR_INCORRECT_TAG, `error: incorrect tag, must be one of these {${commitTags}}.`));
        if (!regexTagValidWhitespace.test(headline))
            lintMessages.push(this.LintMessage(this.ERROR_MISSING_TAG_WHITESPACE, `error: missing whitespace after the tag within the headline.`));
        if (regexHeadlineSummary.test(headline))
            lintMessages.push(this.LintMessage(this.ERROR_MISSING_HEADLINE_SUMMARY, `error: headline's tag must be follow by a short summary.`));
        if (lintMessages.length === 0)
            lintMessages.push(this.LintMessage(this.PASSED, `passed: commit headline is OK.`));
    }
    return this.LintResult(...lintMessages);
}

module.exports.lintHeadlineNewline = function (commitLines, commitTags, commitIssueId) {
    /**
     * Analyse commit headline newline on line#1
     * 
     * @param {Array[string]} commitLines commit content
     * @returns {LintResult} lint message code and description
    */
    const lintMessages = []
    if (commitLines.length < 2)
        lintMessages.push(this.LintMessage(this.ERROR_MISSING_HEADLINE_NEWLINE, `error: a newline must be inserted right after the headline.`))
    else {
        const headlineNewline = commitLines[1].trim();
        if (headlineNewline !== '')
            lintMessages.push(this.LintMessage(this.ERROR_MISSING_HEADLINE_NEWLINE, `error: a newline must be inserted between headline and issue number.`));
        else
            lintMessages.push(this.LintMessage(this.PASSED, `passed: commit headline newline is OK.`));
    }
    return this.LintResult(...lintMessages);
}

module.exports.lintIssueNumber = function (commitLines, commitTags, commitIssueId) {
    /**
     * Analyse commit issue number on line#2
     * 
     * @param {Array[string]} commitLines commit content
     * @returns {LintResult} lint message code and description
    */
    const lintMessages = []
    if (commitLines.length < 3)
        lintMessages.push(this.LintMessage(this.ERROR_MISSING_ISSUE, `error: missing issue id after headline summary.`))
    else {
        const issueId = commitLines[2].trimEnd();
        const regexEmpty = /^\s*$/;
        const regexNoOpenBracket = /^\[/;
        const regexNoCloseBracket = /\]$/;
        const regexIssueNumber = /\w+\-\d+/
        if (regexEmpty.test(issueId))
            lintMessages.push(this.LintMessage(this.ERROR_MISSING_ISSUE, `error: missing issue id after headline summary.`));
        if (!regexNoOpenBracket.test(issueId))
            lintMessages.push(this.LintMessage(this.ERROR_MISSING_ISSUE_OPEN_BRACKET, `error: missing '[' at the beginning of the issue number.`));
        if (!issueId.includes(commitIssueId))
            lintMessages.push(this.LintMessage(this.ERROR_INCORRECT_ISSUE_ID, `error: issue id must be "${commitIssueId}".`));
        if (!regexIssueNumber.test(issueId))
            lintMessages.push(this.LintMessage(this.ERROR_MISSING_ISSUE_NUMBER, `error: issue id '${commitIssueId}' must be followed by a number before closing the bracket.`));
        if (!regexNoCloseBracket.test(issueId))
            lintMessages.push(this.LintMessage(this.ERROR_MISSING_ISSUE_CLOSE_BRACKET, `error: missing ']' at the beginning of the issue number.`));
        if (lintMessages.length === 0)
            lintMessages.push(this.LintMessage(this.PASSED, `passed: commit issue number is OK.`));
    }
    return this.LintResult(...lintMessages)
}

module.exports.lintDescriptionBody = function (commitLines, commitTags, commitIssueId) {
    /**
     * Analyse commit descriptions starting from line#3 to line#end
     * 
     * @param {Array[string]} commitLines commit content
     * @returns {LintResult} lint message code and description
    */
    const lintMessages = [];
    if (commitLines.length < 4)
        lintMessages.push(this.LintMessage(this.ERROR_MISSING_DESCRIPTION, `error: missing description of essential changes below issue number.`))
    else {
        const regexEmpty = /^(\s|\n)*$/;
        const commitDescription = commitLines.slice(3,).join("\n");
        if (regexEmpty.test(commitDescription))
            lintMessages.push(this.LintMessage(this.ERROR_MISSING_DESCRIPTION, `error: missing description of essential changes below issue number.`));
        if (lintMessages.length === 0)
            lintMessages.push(this.LintMessage(this.PASSED, `passed: commit description is OK.`));
    }
    return this.LintResult(...lintMessages);
}

module.exports.lint = function (commitLines, commitTags = [], commitIssueId = "") {
    /**
     * Apply all lint analysis on commit
     * 
     * @param {Array[string]} commitLines commit content
     * @returns {LintResult} lint message code and description
    */
    const updateResult = (res, obj) => {
        res.codes = res.codes.concat(obj.codes);
        res.messages = res.messages.concat(obj.messages);
        if (obj.state === "failed")
            res.state = "failed";
    };

    let commitResult = this.LintResult();
    commitResult.commit = commitLines.join("\n");
    let tmp = {};
    tmp = this.lintHeadline(commitLines, commitTags, commitIssueId);
    updateResult(commitResult, tmp);
    tmp = this.lintHeadlineNewline(commitLines, commitTags, commitIssueId);
    updateResult(commitResult, tmp);
    tmp = this.lintIssueNumber(commitLines, commitTags, commitIssueId);
    updateResult(commitResult, tmp);
    tmp = this.lintDescriptionBody(commitLines, commitTags, commitIssueId);
    updateResult(commitResult, tmp);
    if (commitResult.codes.reduce((acc, code) => acc + code, 0) === 0)
        commitResult.state = "passed";

    return commitResult;
}