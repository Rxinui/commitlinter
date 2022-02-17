const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');
const commitlint = require("./commitlint");

async function main() {
    try {
        const commitTags = core.getInput('commitTags').split(",");
        const commitIssueId = core.getInput('commitIssueId');
        const urlApiCommit = github.context.payload.repository.commits_url;
        const urlCommitMessage = urlApiCommit.replace("{/sha}", `/${github.context.payload.after}`);
        core.info(JSON.stringify(github.context, null, 4))
        core.info(`info: Checking newest commit of '${github.context.ref}'`)
        let response = await axios.get(urlCommitMessage);
        const commitLines = response.data.commit.message.trimEnd().split("\n")
        const lintResult = commitlint.lint(commitLines, commitTags, commitIssueId);
        const lintResultJson = JSON.stringify(lintResult, null, 4);
        core.setOutput("lint-result", lintResult)
        if (lintResult.state == "failed")
            core.setFailed(lintResultJson)
        core.info(lintResultJson);
    } catch (error) {
        core.setFailed(error);
    }
}

main()
