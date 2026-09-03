#!/usr/bin/env bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

CHALLENGE="$(tr -d '\r\n' < "$SCRIPT_DIR/challenge.txt")"
COMMIT_HASH="$(git -C "$REPO_ROOT" rev-parse HEAD)"

MESSAGE="${CHALLENGE}${COMMIT_HASH}"

DIGEST_HEX="$(printf '%s' "$MESSAGE" | openssl dgst -sha256 -hex | sed 's/^.*= //')"

printf '%s' "$DIGEST_HEX" | xxd -r -p > "$SCRIPT_DIR/message_digest.bin"

openssl pkeyutl \
  -sign \
  -rawin \
  -inkey "$SCRIPT_DIR/proof_private.pem" \
  -in "$SCRIPT_DIR/message_digest.bin" \
  -out "$SCRIPT_DIR/proof_signature.der"

base64 -w 0 "$SCRIPT_DIR/proof_signature.der" > "$SCRIPT_DIR/proof.txt"

echo "Challenge: $CHALLENGE"
echo "Commit hash: $COMMIT_HASH"
echo "SHA256(challenge + commit_hash): $DIGEST_HEX"
echo "Proof written to: $SCRIPT_DIR/proof.txt"
echo "Public key: $SCRIPT_DIR/proof_pub.pem"