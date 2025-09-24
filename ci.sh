echo "== Stage: Docker build/deploy =="

HOST_PORT=${HOST_PORT:-8081}
IMAGE="discountmate:${BUILD_NUMBER:-local}"

# Remove any old container named discountmate (safe)
docker rm -f discountmate >/dev/null 2>&1 || true

# Build image (assumes Dockerfile at repo root)
docker build -t "$IMAGE" .

# Ensure no old container remains, then run the new one mapping HOST_PORT -> container:8080
docker rm -f discountmate >/dev/null 2>&1 || true
docker run -d --name discountmate -p ${HOST_PORT}:8080 "$IMAGE" || {
  echo "Failed to run container on host port ${HOST_PORT}. Current listeners:"
  ss -ltnp | grep ":${HOST_PORT}" || true
  docker ps -a
  exit 1
}

# Robust healthcheck (retries)
echo "Waiting for app to become healthy on localhost:${HOST_PORT}..."
for i in 1 2 3 4 5; do
  echo "Healthcheck attempt $i..."
  if curl -fsS http://localhost:${HOST_PORT}/healthz >/dev/null 2>&1; then
    echo "Healthcheck OK"
    break
  fi
  sleep 2
done

# Final check: if still not healthy, dump logs and fail
curl -fsS http://localhost:${HOST_PORT}/healthz || {
  echo "Healthcheck failed after retries; container logs:"
  docker logs discountmate --tail 300
  exit 1
}

echo "Deployment and healthcheck succeeded (host port ${HOST_PORT})."
