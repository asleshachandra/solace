#!/bin/bash

LAMBDA_URL="https://hacjmskgnfhdnatfhsdq6iozee0ejkeb.lambda-url.us-east-1.on.aws/"
BLOB_KEY="sample-encrypted-message"

echo "Calling Lambda to decrypt S3 blob..."
echo ""

curl -X POST \
  -H "Content-Type: application/json" \
  -d "{\"blobKey\": \"${BLOB_KEY}\"}" \
  $LAMBDA_URL

echo ""
