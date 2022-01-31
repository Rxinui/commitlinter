const core = require('@actions/core');
const github = require('@actions/github');
const commitlint = require("./commitlint");

function main() {
    try {
        core.info("DEBUG: point 1");
        const commitTags = core.getInput('commitTags').split(",");
        core.info("DEBUG: point 1.1");
        const commitIssueId = core.getInput('commitIssueId');
        core.info("DEBUG: point 1.2");
        core.info(JSON.stringify(github.context.payload));
        const cmdGetGitCommit = github.context.payload.head_commit.message;
        core.info("DEBUG: point 1.3");
        core.info("DEBUG: point 2");
        core.info(`info: Checking HEAD commit of '${github.context.ref}'`)
        const commitLines = cmdGetGitCommit.trimEnd().split("\n");
        const lintResult = commitlint.lint(commitLines, commitTags, commitIssueId);
        const lintResultJson = JSON.stringify(lintResult, null, 4);
        core.setOutput("lint-result", lintResult)
        if (lintResult.state == "failed")
            core.setFailed(lintResultJson)
        core.info(lintResultJson);
    } catch (error) {
        core.info("DEBUG: here");
        core.setFailed(error);
    }
}

main()
