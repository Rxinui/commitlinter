const commitlint = require('../commitlint');

const commitTags = [
    "new",
    "fix",
    "doc",
    "ref",
    "wip"
];
const commitIssueId = "PFE";
const testcase =
    `new: VBoxManageList commands work with API

[PFE-4]
- VBoxManage list command is run with subprocess
- parse and display list vms OK
- parse and display list runningvms OK
- parse and display list hostinfo OK
- FastAPI used and return HTTPException when bad directive
- pytest written and OK
- create basic logger system with logging module
- use of pylint as default linter with .pylintrc`.split("\n");

describe("Test lint headline:", function () {
    it("Headline starts with a valid tag", function () {
        expect(commitlint.lintHeadline(testcase, commitTags, commitIssueId).codes).toContain(commitlint.PASSED);
    });

    it("Bad: Headline does not start with a tag", () => {
        const badTestCase = `VBoxManageList commands work with API`.split("\n");
        expect(commitlint.lintHeadline(badTestCase, commitTags, commitIssueId).codes).toContain(commitlint.ERROR_MISSING_TAG);
        expect(commitlint.lintHeadline(badTestCase, commitTags, commitIssueId).codes).toContain(commitlint.ERROR_INCORRECT_TAG);
        expect(commitlint.lintHeadline(badTestCase, commitTags, commitIssueId).codes).toContain(commitlint.ERROR_MISSING_TAG_WHITESPACE);
    })

    it("Bad: Headline tag is not followed by a whitespace", () => {
        const badTestCase = `new:VBoxManageList commands work with API`.split("\n");
        expect(commitlint.lintHeadline(badTestCase, commitTags, commitIssueId).codes).toContain(commitlint.ERROR_MISSING_TAG_WHITESPACE);
    })

    it("Bad: Headline tag length is less than 3 characters", () => {
        const badTestCase = `wp: VBoxManageList commands work with API`.split("\n");
        expect(commitlint.lintHeadline(badTestCase, commitTags, commitIssueId).codes).toContain(commitlint.ERROR_INCORRECT_TAG);
    })

    it("Bad: Headline tag length is less than 3 characters", () => {
        const badTestCase = `ref: `.split("\n");
        expect(commitlint.lintHeadline(badTestCase, commitTags, commitIssueId).codes).toContain(commitlint.ERROR_MISSING_HEADLINE_SUMMARY);
    })

});


describe("Test lint headline newline:", function () {
    it("Valid headline newline", function () {
        expect(commitlint.lintHeadlineNewline(testcase, commitTags, commitIssueId).codes).toContain(commitlint.PASSED);
    });

    it("Bad: No newline between headline and issue number", () => {
        const badTestCase = `new: VBoxManageList commands work with API
[PFE-4]
- VBoxManage list command is run with subprocess
- parse and display list vms OK
`.split("\n");
        expect(commitlint.lintHeadlineNewline(badTestCase, commitTags, commitIssueId).codes).toContain(commitlint.ERROR_MISSING_HEADLINE_NEWLINE);
    })
});


describe("Test lint issue number:", function () {
    it("Valid issue number", function () {
        expect(commitlint.lintIssueNumber(testcase, commitTags, commitIssueId).codes).toContain(commitlint.PASSED);
    });

    it("Valid issue number with smart commit", function () {
        testcaseSmartCommit =
            `new: VBoxManageList commands work with API

[PFE-4] #review-task #comment using smart commit
testing smart commit integration with Jira`.split("\n");
        expect(commitlint.lintIssueNumber(testcaseSmartCommit, commitTags, commitIssueId).codes).toContain(commitlint.PASSED);
    });

    it("Bad: Missing issue number", function () {
        const badTestCase =
            `new: VBoxManageList commands work with API

`.split("\n");
        expect(commitlint.lintIssueNumber(badTestCase, commitTags, commitIssueId).codes).toContain(commitlint.ERROR_MISSING_ISSUE);
        expect(commitlint.lintIssueNumber(badTestCase, commitTags, commitIssueId).codes).toContain(commitlint.ERROR_MISSING_ISSUE_OPEN_BRACKET);
        expect(commitlint.lintIssueNumber(badTestCase, commitTags, commitIssueId).codes).toContain(commitlint.ERROR_INCORRECT_ISSUE_ID);
        expect(commitlint.lintIssueNumber(badTestCase, commitTags, commitIssueId).codes).toContain(commitlint.ERROR_MISSING_ISSUE_NUMBER);
        expect(commitlint.lintIssueNumber(badTestCase, commitTags, commitIssueId).codes).toContain(commitlint.ERROR_MISSING_ISSUE_CLOSE_BRACKET);
    });

    it("Bad: Missing '[' bracket issue number", function () {
        const badTestCase =
            `new: VBoxManageList commands work with API

PFE-4]`.split("\n");
        expect(commitlint.lintIssueNumber(badTestCase, commitTags, commitIssueId).codes).toContain(commitlint.ERROR_MISSING_ISSUE_OPEN_BRACKET);
    });

    it("Bad: Incorrect issue id", function () {
        const badTestCase =
            `new: VBoxManageList commands work with API

[WRONG-4`.split("\n");
        expect(commitlint.lintIssueNumber(badTestCase, commitTags, commitIssueId).codes).toContain(commitlint.ERROR_INCORRECT_ISSUE_ID);
        expect(commitlint.lintIssueNumber(badTestCase, commitTags, commitIssueId).codes).toContain(commitlint.ERROR_MISSING_ISSUE_CLOSE_BRACKET);
    });

    it("Bad: Missing issue number", function () {
        const badTestCase =
            `new: VBoxManageList commands work with API

[PFE-]`.split("\n");
        expect(commitlint.lintIssueNumber(badTestCase, commitTags, commitIssueId).codes).toContain(commitlint.ERROR_MISSING_ISSUE_NUMBER);
    });

    it("Bad: Missing ']' bracket issue number", function () {
        const badTestCase =
            `new: VBoxManageList commands work with API

[PFE-4`.split("\n");
        expect(commitlint.lintIssueNumber(badTestCase, commitTags, commitIssueId).codes).toContain(commitlint.ERROR_MISSING_ISSUE_CLOSE_BRACKET);
    });
});

describe("Test lint description of essential changes:", function () {
    it("Valid description", function () {
        expect(commitlint.lintDescriptionBody(testcase, commitTags, commitIssueId).codes).toContain(commitlint.PASSED);
    });

    it("Bad: Description with whitespaces only", function () {
        const badTestCase =
            `new: VBoxManageList commands work with API

[PFE-4]
       `.split("\n")
        expect(commitlint.lintDescriptionBody(badTestCase, commitTags, commitIssueId).codes).toContain(commitlint.ERROR_MISSING_DESCRIPTION);
    });

    it("Bad: Description with newline only", function () {
        const badTestCase =
            `new: VBoxManageList commands work with API

[PFE-4]



`.split("\n")
        expect(commitlint.lintDescriptionBody(badTestCase, commitTags, commitIssueId).codes).toContain(commitlint.ERROR_MISSING_DESCRIPTION);
    });

    it("Bad: Description with newline and whitespaces only", function () {
        const badTestCase =
            `new: VBoxManageList commands work with API

[PFE-4]

           
   
`.split("\n")
        expect(commitlint.lintDescriptionBody(badTestCase, commitTags, commitIssueId).codes).toContain(commitlint.ERROR_MISSING_DESCRIPTION);
    });
});