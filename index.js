const core = require('@actions/core');
const github = require('@actions/github');
const commitlint = require("./commitlint");

function main() {
    try {
        const commitTags = core.getInput('commitTags').split(",");
        const commitIssueId = core.getInput('commitIssueId');
        const cmdGetGitCommit = github.context.payload.head_commit.message;
        core.info(`info: Checking HEAD commit of '${github.context.ref}'`)
        const commitLines = cmdGetGitCommit.trimEnd().split("\n");
        const lintResult = commitlint.lint(commitLines, commitTags, commitIssueId);
        const lintResultJson = JSON.stringify(lintResult, null, 4);
        core.setOutput("lint-result", lintResult)
        if (lintResult.state == "failed")
            core.setFailed(lintResultJson)
        core.info(lintResultJson);
    } catch (error) {
        core.setFailed(error.message);
    }
}

main()