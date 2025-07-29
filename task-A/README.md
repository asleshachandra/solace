Task A – Enclave-Style Decryption Service

This project implements a secure decryption microservice using AWS Lambda, KMS, and S3 to simulate an enclave-style "data in use" environment. The service accepts a POST request with a blobKey, fetches the corresponding encrypted object from S3, decrypts it using KMS, and returns the plaintext response.

All infrastructure components are provisioned with Terraform.

Overview

- Receives a POST request with a blobKey
- Fetches encrypted data from S3 using the provided key
- Decrypts the data using AWS KMS, scoped with least-privilege access
- Returns plaintext as JSON over HTTPS

Setup Instructions

1. Prerequisites

- AWS CLI configured with appropriate access
- Terraform >= 1.5.x
- Python 3.9+
- boto3 installed via pip

2. Deployment

Navigate to the infra folder:

```
cd task-A/infra
terraform init
terraform apply
```

Terraform will output the following values upon success:

- s3\_bucket\_name
- kms\_key\_id
- lambda\_function\_url

Encrypting and Uploading a Test Blob

A helper script is provided to encrypt a sample message and upload it to S3:

```
cd task-A/src
python3 encrypt_and_upload.py
```

This will upload an encrypted file to your S3 bucket using the key:

```
sample-encrypted-message
```

Testing the Decryption Flow

Option A: Run the provided shell script

```
cd task-A
./decrypt_test.sh
```

Option B: Use curl manually

```
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"blobKey": "sample-encrypted-message"}' \
  https://hacjmskgnfhdnatfhsdq6iozee0ejkeb.lambda-url.us-east-1.on.aws/
```

Security Considerations

- The KMS key is scoped to allow decryption only by this Lambda function and the root account
- The S3 bucket enforces AES-256 encryption at rest
- All runtime configuration is handled via environment variables
- CORS headers are enabled on the Lambda Function URL to allow browser-based clients if needed

Developer Notes

This task provided a valuable opportunity to focus on AWS security best practices and infrastructure as code. Care was taken to ensure clarity, modularity, and correctness throughout. Particular attention was given to error handling, IAM policy design, and deployment validation to guarantee secure and reliable operation.
