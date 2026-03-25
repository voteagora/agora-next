module.exports = async ({ github, context, core }) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    core.setFailed("GEMINI_API_KEY is missing.");
    return;
  }

  const owner = context.repo.owner;
  const repo = context.repo.repo;
  const pull_number = context.issue.number;

  const { data: files } = await github.rest.pulls.listFiles({
    owner,
    repo,
    pull_number,
  });

  const targetFiles = [];

  for (const file of files) {
    if (file.status === "removed") continue;
    if (
      !file.filename.endsWith(".ts") &&
      !file.filename.endsWith(".tsx") &&
      !file.filename.endsWith(".js")
    )
      continue;

    try {
      const { data: fileData } = await github.rest.repos.getContent({
        owner,
        repo,
        path: file.filename,
        ref: context.payload.pull_request.head.sha,
      });

      const content = Buffer.from(fileData.content, "base64").toString("utf8");

      const isApiRoute =
        file.filename.includes("app/api/") && file.filename.includes("route.");
      const hasUseServer =
        content.includes('"use server"') || content.includes("'use server'");

      if (isApiRoute || hasUseServer) {
        targetFiles.push({
          filename: file.filename,
          patch: file.patch,
          content: content,
        });
      }
    } catch (e) {
      console.error(`Could not fetch ${file.filename}: ${e.message}`);
    }
  }

  if (targetFiles.length === 0) {
    return;
  }

  const promptTargetFiles = targetFiles
    .map(
      (f) =>
        `File: ${f.filename}\n\n--- FULL CONTENT ---\n${f.content}\n\n--- PR DIFF PATCH ---\n${f.patch || "No patch available"}\n`
    )
    .join("\n====================\n\n");

  const systemPrompt = `Analyze the provided PR files as a strict Next.js Security Auditor.

Target Scope: Exported async functions within files declaring "use server" AND any API route handlers (route.ts).

Vulnerability Criteria:
1. The function performs state mutations (Writes, e.g., database inserts, smart contract interactions).
2. The function performs sensitive data fetching (Reads, e.g., querying private user data, non-public lists).
3. The function lacks an explicit authorization check (e.g., \`verifyJwtAndGetAddress\`, \`verifyMessage\`, \`verifyOwnerAndSiweForDraft\`, \`Tenant.current().admin\`, etc).

Rules:
- Be highly professional, concise, and concrete. Avoid conversational language.
- Flag ONLY confirmed missing authorization checks in the NEWLY ADDED or MODIFIED code (refer to the PR DIFF PATCH). Ignore old existing vulnerabilities unless the PR modifies them.
- To determine the exact \`line\` number for your JSON report, identify the line's position within the FULL CONTENT file. If you are flagging a newly modified line, it must correspond to an addition in the PR DIFF PATCH.
- Return strictly valid JSON containing no markdown wrappers, conforming to this schema:
{
  "summary": "Executive summary of identified Server Action/API vulnerabilities, or confirmation of secure implementation.",
  "issues": [
    {
      "file": "path/to/file.ts",
      "line": 42,
      "comment": "Precise identification of the missing authorization check."
    }
  ]
}`;

  const userPrompt = `Review the following files modified in this PR. For each file, the full content is provided for context, along with the specific diff patch showing what changed.\n\n${promptTargetFiles}`;

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
