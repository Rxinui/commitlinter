const core = require('@actions/core');
const github = require('@actions/github');
const commitlint = require("./commitlint");

const GITHUB_EVENT_PULL_REQUEST = "pull_request"
const GITHUB_EVENT_PUSH = "push"

async function main() {
    try {
        const commitTags = core.getInput('commitTags').split(",");
        const commitIssueId = core.getInput('commitIssueId');
        core.info(`info: Checking newest commit of '${github.context.ref}' triggered by '${github.context.eventName}'`)
        let commit;
        if (github.context.eventName === GITHUB_EVENT_PULL_REQUEST){
            commit = `${github.context.payload.pull_request.title}\n\n${github.context.payload.pull_request.body}`
        } else if (github.context.eventName === GITHUB_EVENT_PUSH) {
            commit = github.context.payload.head_commit.message
        } else {
            throw Error(`Commitlinter does not work on event '${github.context.eventName}'`)
        }
        const commitLines = commit.trimEnd().split("\n")
        core.info(`info: commitLines ${commitLines}`)
        const lintResult = commitlint.lint(commitLines, commitTags, commitIssueId);
        const lintResultJson = JSON.stringify(lintResult, null, 4);
        core.setOutput("lint-result", lintResult)
        if (lintResult.state == "failed")
            core.setFailed(lintResultJson)
        core.info(lintResultJson);

        // const urlApiCommit = github.context.payload.repository.commits_url;
        // const urlCommitMessage = urlApiCommit.replace("{/sha}", `/${github.context.payload.after}`);
        // core.info(JSON.stringify(github.context, null, 4))
        // core.info(`info: Checking newest commit of '${github.context.ref}'`)
        // let response = await axios.get(urlCommitMessage);
        // const commitLines = response.data.commit.message.trimEnd().split("\n")
        // const lintResult = commitlint.lint(commitLines, commitTags, commitIssueId);
        // const lintResultJson = JSON.stringify(lintResult, null, 4);
        // core.setOutput("lint-result", lintResult)
        // if (lintResult.state == "failed")
        //     core.setFailed(lintResultJson)
        // core.info(lintResultJson);
    } catch (error) {
        core.setFailed(error);
    }
}

main()
