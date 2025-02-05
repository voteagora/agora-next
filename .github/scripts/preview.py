#!/usr/bin/env python3

import os
import json
import subprocess
import requests


class VercelClient:
    def __init__(self, project, token):
        self.project = project
        self.token = token

        # Set your Vercel API token and project details
        self.team_id = os.getenv('VERCEL_TEAM_ID', 'team_hKtANNG7ss8aaHhb1BkJJYdH')  # Found in Vercel's project settings

        self.org = "voteagora"
        self.repo = "agora-next"

    def deploy(self, pr, extra_message=""):

        # Vercel API endpoint
        VERCEL_DEPLOY_URL = "https://api.vercel.com/v13/deployments?forceNew=1&teamId=" + self.team_id

        # Deployment payload
        payload = {
            "name": self.project,
            "project": self.project,
        
            "gitSource": {
                "type": "github",
                "org": self.org,
                "repo": self.repo,
                "ref": f"refs/pull/{pr}/head"
            },
            "target": "staging"  # Deploy as a preview deployment
        }

        # Headers with authentication
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }

        # Make the request
        response = requests.post(VERCEL_DEPLOY_URL, json=payload, headers=headers)

        # Check response
        if response.status_code == 200:
            print("Deployment triggered successfully!")
            url = response.json().get("url")
            print("Deployment URL:", url)
            print(response.json())
        else:
            print("Failed to trigger deployment:", response.text)
            
        return f"[Preview Link]({url})"

    def set_envvar(self, key, val, branch):

        # Vercel API endpoint
        VERCEL_DEPLOY_URL = f"https://api.vercel.com/v10/projects/{self.project}/env?teamId={self.team_id}&upsert=true"

        # Deployment payload
        payload = {
            "key" : key,
            "value" : val,
            "type" : "plain",
            "gitBranch" : branch,
            "target": ["preview"]  # Deploy as a preview deployment
        }

        # Headers with authentication
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }

        # Make the request
        response = requests.post(VERCEL_DEPLOY_URL, json=payload, headers=headers)

        print(response.json())

        return f"Env Var Set : {key} = {val}"

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


def main():
    # 1. Load the GitHub event payload
    event_path = os.environ.get("GITHUB_EVENT_PATH")
    if not event_path or not os.path.exists(event_path):
        print("No event payload found. Exiting.")
        return

    # 5. Deploy to Vercel if /preview is invoked
    VERCEL_TOKEN = os.environ.get("VERCEL_TOKEN")
    if not VERCEL_TOKEN:
        print("VERCEL_TOKEN not found in environment. Exiting.")
        return
    
    with open(event_path, 'r', encoding='utf-8') as f:
        event = json.load(f)
    
    print(event)

    # We can comment on the same issue (PR) that triggered this
    issue_number = event.get("issue", {}).get("number")
    repo_owner = event.get("repository", {}).get("owner", {}).get("login")
    repo_name = event.get("repository", {}).get("name")
    branch = event.get("branch", {}).get("name", "jeff/test-vercel-commands")

    # 2. Extract comment body
    comment_body = event.get("comment", {}).get("body", "")
    print(f"Comment body: {comment_body}")

    # 3. Check if the comment starts with '/preview'
    if comment_body.startswith("/set"):
        _, project, key, val = comment_body.split(" ")
        vercel = VercelClient(project, VERCEL_TOKEN)
        msg = vercel.set_envvar(key, val, branch)

    # 3. Check if the comment starts with '/preview'
    elif comment_body.startswith("/preview"):
        _, project = comment_body.split(" ")
        vercel = VercelClient(project, VERCEL_TOKEN)
        msg = vercel.deploy(issue_number)
    
    else:

        # 6. Post a comment back to the PR indicating that we've started the preview
        github_token = os.environ.get("GITHUB_TOKEN")
        if not github_token:
            print("GITHUB_TOKEN not found; cannot comment on PR.")
            return

        if not (issue_number and repo_owner and repo_name):
            print("Could not determine issue/repo details from event. Exiting.")
            return

        post_github_comment(
            github_token=github_token,
            owner=repo_owner,
            repo=repo_name,
            issue_number=issue_number,
            body=msg
        )


if __name__ == "__main__":
    main()
