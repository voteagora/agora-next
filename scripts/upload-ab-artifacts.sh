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
    DATE_STR=$(date +'%Y-%m-%d')
    ACTOR=${GITHUB_ACTOR:-"cli"}
    
    # Clean, parametric reporting taxonomy: reports / YYYY-MM-DD / username_run-ID / tenant
    TARGET_DIR="gs://agora-ab-artifacts/reports/${DATE_STR}/${ACTOR}_run-${GITHUB_RUN_ID}"
    if [ -n "$TENANT_CONTEXT" ]; then
        TARGET_DIR="${TARGET_DIR}/${TENANT_CONTEXT}"
    fi
fi

echo "Uploading artifacts to $TARGET_DIR..."
# We use gsutil or gcloud storage depending on environment
if command -v gsutil &> /dev/null; then
    gsutil -m rsync -r test-results/ab-diffs $TARGET_DIR
    # Upload run metadata (URL A/B, tenant, routes) for dashboard
    if [ -f "test-results/run_metadata.json" ]; then
        gsutil cp test-results/run_metadata.json "${TARGET_DIR}/run_metadata.json"
        echo "📝 Uploaded run_metadata.json"
    fi
else
    gcloud storage cp -r test-results/ab-diffs/* $TARGET_DIR
    if [ -f "test-results/run_metadata.json" ]; then
        gcloud storage cp test-results/run_metadata.json "${TARGET_DIR}/run_metadata.json"
        echo "📝 Uploaded run_metadata.json"
    fi
fi

echo "Upload completed successfully! You can view the artifacts in the GCP Console."
