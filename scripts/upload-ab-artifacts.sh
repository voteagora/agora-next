#!/bin/bash

# Simple script to upload A/B Regression visual diffs to GCP Bucket
# Intended to be run after npm run test:ab

echo "Starting upload to gs://agora-ab-artifacts..."

if [ ! -d "test-results/ab-diffs" ]; then
  echo "Error: test-results/ab-diffs directory does not exist. Did the tests run successfully?"
  exit 1
fi

# We use rsync to cleanly mirror the directory structure into a timestamped or latest folder.
# By default, we keep a "latest" folder, and you can push to unique SHAs in CI.

TARGET_DIR="gs://agora-ab-artifacts/manual-local-run"

if [ -n "$GITHUB_SHA" ]; then
    SHORT_SHA=$(echo $GITHUB_SHA | cut -c1-7)
    BRANCH_SAFE=${GITHUB_REF_NAME:-"unknown-branch"}
    
    # Example Outcome: gs://agora-ab-artifacts/feature/visual-ab-runner/run-484824_sha-1c8aa06
    TARGET_DIR="gs://agora-ab-artifacts/${BRANCH_SAFE}/run-${GITHUB_RUN_ID}_sha-${SHORT_SHA}"
fi

echo "Uploading artifacts to $TARGET_DIR..."
# We use gsutil or gcloud storage depending on environment
if command -v gsutil &> /dev/null; then
    gsutil -m rsync -r test-results/ab-diffs $TARGET_DIR
else
    gcloud storage cp -r test-results/ab-diffs/* $TARGET_DIR
fi

echo "Upload completed successfully! You can view the artifacts in the GCP Console."
