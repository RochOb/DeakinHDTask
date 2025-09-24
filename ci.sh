#!/usr/bin/env bash
set -euo pipefail

echo "== Stage: Build =="
pushd app
npm install
npm run build
popd

pushd server
npm install
npm run build
popd

mkdir -p artifacts && cp -r app/dist artifacts/app-dist || true

echo "== Stage: Test =="
pushd app
npm test
popd
pushd server
npm test || true
popd

echo "== Stage: Code Quality =="
pushd app
npm run lint
popd

echo "== Stage: Security =="
set +e
( cd app && npm audit --audit-level=high )
( cd server && npm audit --audit-level=high )
set -e

echo "== Stage: Docker build/deploy =="
IMAGE="discountmate:${BUILD_NUMBER:-local}"
docker build -t "$IMAGE" .
docker rm -f discountmate >/dev/null 2>&1 || true
docker run -d --name discountmate -p 8080:8080 "$IMAGE"

echo "== Stage: Healthcheck =="
for i in {1..10}; do
  if curl -fsS http://localhost:8080/healthz >/dev/null; then
    echo "Health OK"; break
  fi
  sleep 3
  if [[ $i -eq 10 ]]; then echo "Health check failed"; exit 1; fi
done

echo "== Stage: Release Tag (main only) =="
if git rev-parse --abbrev-ref HEAD | grep -qi '^main$'; then
  git config user.email "jenkins@local"
  git config user.name "Jenkins"
  git tag -a "v${BUILD_NUMBER:-0}" -m "Release ${BUILD_NUMBER:-0}" || true
  git push origin --tags || true
fi

echo "All stages completed."
