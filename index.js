const { exec } = require("child_process");
const { exit } = require("process");
const core = require('@actions/core');
const github = require('@actions/github');
const commitlint = require("./commitlint");

// use as a script
// const commitSha = process.argv[2];

const cmdGetGitCommit = (sha) => `git show ${sha} --pretty=format:%B --quiet`;

function main() {
    if (process.argv.length < 3) {
        console.error("error: Expected a commit hash as first argument.")
        exit(1)
    }
    try {
        // use as GitHub action
        const commitSha = github.context.sha;
        exec(cmdGetGitCommit(commitSha), (error, stdout, stderr) => {
            if (error) {
                console.error(`error: ${error.message}`);
                return exit(1);
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                return exit(1);
            }
            const commitLines = stdout.trimEnd().split("\n");
            const lintResult = commitlint.lint(commitLines);
            console.log(lintResult);
            core.setOutput("lint-result", lintResult)
            return exit(0);
        });
    } catch (error) {
        core.setFailed(error.message);
    }
}

main()