#!/usr/bin/env bash
# Generate self-signed TLS certificate for the Kuma control plane.
# Run once from the project root before `docker compose up`.
set -euo pipefail

CERT_DIR="kuma/tls"

mkdir -p "${CERT_DIR}"

openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout "${CERT_DIR}/tls.key" \
  -out "${CERT_DIR}/tls.crt" \
  -days 365 \
  -subj "/CN=kuma-cp"

echo "TLS certificate generated in ${CERT_DIR}/"
