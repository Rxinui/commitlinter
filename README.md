# Rxinui/commitlinter

Personal git commit linter for GitHub action following [Rxinui commit format](https://kidr.atlassian.net/wiki/spaces/PFEDOJOPLA/pages/229378/How-to+write+a+valid+commit)

## Usage on GitHub Action

```yaml
on: [push]
jobs:
  commit_linter_job:
    runs-on: ubuntu-latest
    name: A job to lint the current commit of the branch
    steps:
      - name: Commit Linter Action
        id: lintResult
        uses: Rxinui/commitlinter@v1.0
        with:
          commitTags: "new,fix,doc,ref,wip" # required - specify valid tags, separed by commas
          commitIssueId: "LINT" # required - specify the issue ID (eg. Jira issue id tracker)
```
