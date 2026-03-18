module.exports = async ({ github, context, core }) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    core.setFailed("GEMINI_API_KEY is missing.");
    return;
  }

  const owner = context.repo.owner;
  const repo = context.repo.repo;
  const pull_number = context.issue.number;

  let diffText = "";
  try {
    const { data } = await github.rest.pulls.get({
      owner,
      repo,
      pull_number,
      mediaType: { format: "diff" },
    });
    diffText = data;
  } catch (error) {
    core.setFailed(`Failed to fetch PR diff: ${error.message}`);
    return;
  }

  if (
    !diffText.includes('"use server"') &&
    !diffText.includes("'use server'")
  ) {
    return;
  }

  const systemPrompt = `Analyze the provided PR diff as a strict Next.js Security Auditor.

Target: Exported async functions within files declaring "use server".

Vulnerability Criteria:
1. The function performs state mutations (e.g., database writes, smart contract interactions).
2. It lacks an explicit authorization check (e.g., \`verifyJwtAndGetAddress\`, \`verifyMessage\`, \`verifyOwnerAndSiweForDraft\`, or checking admin privileges).

Rules:
- Be highly professional, concise, and concrete. Avoid conversational language.
- Flag ONLY confirmed missing authorization checks. Ignore false positives or unrelated code.
- Return strictly valid JSON containing no markdown wrappers, conforming to this schema:
{
  "summary": "Executive summary of identified Server Action vulnerabilities, or confirmation of secure implementation.",
  "issues": [
    {
      "file": "path/to/file.ts",
      "line": 42,
      "comment": "Precise identification of the missing authorization check."
    }
  ]
}`;

  const userPrompt = `Review the following git diff carefully:\n\n${diffText}`;

  const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const response = await fetch(geminiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: { response_mime_type: "application/json" },
      }),
    });

    if (!response.ok) {
      core.setFailed(`API request failed: ${response.statusText}`);
      return;
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) return;

    const report = JSON.parse(resultText);

    if (report.issues && report.issues.length > 0) {
      const { data: prData } = await github.rest.pulls.get({
        owner,
        repo,
        pull_number,
      });
      const commit_id = prData.head.sha;

      await github.rest.issues.createComment({
        owner,
        repo,
        issue_number: pull_number,
        body: `**⚠️ Security Audit: Next.js Server Actions**\n\n${report.summary}`,
      });

      for (const issue of report.issues) {
        try {
          await github.rest.pulls.createReviewComment({
            owner,
            repo,
            pull_number,
            body: `**Severity: High**\nMissing authorization check.\n\n${issue.comment}`,
            commit_id,
            path: issue.file,
            line: issue.line,
            side: "RIGHT",
          });
        } catch (err) {
          await github.rest.issues.createComment({
            owner,
            repo,
            issue_number: pull_number,
            body: `**Severity: High**\nVulnerability in \`${issue.file}\` (Line ${issue.line}):\n${issue.comment}`,
          });
        }
      }
    } else {
      await github.rest.issues.createComment({
        owner,
        repo,
        issue_number: pull_number,
        body: `**✅ Security Audit: Next.js Server Actions**\n\n${report.summary || "No unauthorized Server Actions detected."}`,
      });
    }
  } catch (err) {
    core.setFailed(`Execution failed: ${err.message}`);
  }
};
