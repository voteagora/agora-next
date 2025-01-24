#!/usr/bin/env python3

import os
import json
import subprocess
import requests

def main():
    # 1. Load the GitHub event payload
    event_path = os.environ.get("GITHUB_EVENT_PATH")
    if not event_path or not os.path.exists(event_path):
        print("No event payload found. Exiting.")
        return

    with open(event_path, 'r', encoding='utf-8') as f:
        event = json.load(f)

    # 2. Extract comment body
    comment_body = event.get("comment", {}).get("body", "")
    print(f"Comment body: {comment_body}")

    # 3. Check if the comment starts with '/preview'
    if not comment_body.startswith("/preview"):
        print("Comment does not start with /preview. Exiting.")
        return

    # 4. Parse the project argument
    # Expected command format: "/preview <project>"
    tokens = comment_body.split()
    if len(tokens) > 1:
        project_arg = tokens[1]
    else:
        project_arg = "all-projects"  # default if none specified

    print(f"Project argument: {project_arg}")

    # 5. Deploy to Vercel if /preview is invoked
    vercel_token = os.environ.get("VERCEL_TOKEN")
    if not vercel_token:
        print("VERCEL_TOKEN not found in environment. Exiting.")
        return

    try:
        if project_arg == "all-projects":
            # Example: deploy multiple projects in a loop
            print("Deploying ALL projects...")
            # for proj_id in ["my-project-A", "my-project-B", ...]:
            #     deploy_vercel(proj_id, vercel_token)
            deploy_vercel(None, vercel_token, extra_message="(All projects placeholder)")
        else:
            # Deploy a single project
            print(f"Deploying project: {project_arg}")
            deploy_vercel(project_arg, vercel_token)
    except Exception as e:
        print(f"Error deploying to Vercel: {e}")

    # 6. Post a comment back to the PR indicating that we've started the preview
    github_token = os.environ.get("GITHUB_TOKEN")
    if not github_token:
        print("GITHUB_TOKEN not found; cannot comment on PR.")
        return

    # We can comment on the same issue (PR) that triggered this
    issue_number = event.get("issue", {}).get("number")
    repo_owner = event.get("repository", {}).get("owner", {}).get("login")
    repo_name = event.get("repository", {}).get("name")

    if not (issue_number and repo_owner and repo_name):
        print("Could not determine issue/repo details from event. Exiting.")
        return

    if project_arg == "all-projects":
        body_message = "Preview deployment triggered for **all** projects."
    else:
        body_message = f"Preview deployment triggered for project **{project_arg}**."

    post_github_comment(
        github_token=github_token,
        owner=repo_owner,
        repo=repo_name,
        issue_number=issue_number,
        body=body_message
    )


def deploy_vercel(project, token, extra_message=""):
    """
    Deploy to Vercel using the CLI. If `project` is None, do a placeholder
    or loop over your actual projects. Adjust flags for your org/team.
    """
    if project is None:
        # Example placeholder for all-projects scenario
        cmd = [
            "vercel",
            "--token", token,
            # Additional flags as needed
        ]
    else:
        cmd = [
            "vercel",
            "--token", token,
            "--scope", "YOUR_ORG",       # if needed
            "--project", project        # if needed
        ]

    print(f"Running Vercel command: {' '.join(cmd)}")
    completed = subprocess.run(cmd, capture_output=True, text=True)
    if completed.returncode != 0:
        raise RuntimeError(f"Vercel deploy failed: {completed.stderr}")

    # Optionally parse the deployment URL from completed.stdout and log it
    # For example:
    #   deployment_url = get_url_from_output(completed.stdout)
    #   print(f"Deployment URL: {deployment_url}")
    print(f"Vercel output:\n{completed.stdout}")
    print("Deployment succeeded!", extra_message)


def post_github_comment(github_token, owner, repo, issue_number, body):
    """
    Posts a comment to the given issue_number using the GitHub API.
    """
    url = f"https://api.github.com/repos/{owner}/{repo}/issues/{issue_number}/comments"
    headers = {
        "Authorization": f"Bearer {github_token}",
        "Accept": "application/vnd.github.v3+json"
    }
    response = requests.post(url, headers=headers, json={"body": body})
    if response.status_code >= 300:
        print(f"Failed to post comment: {response.text}")
    else:
        print("Successfully posted comment to PR!")

if __name__ == "__main__":
    main()
