import boto3
import os

# Replace with your actual values
bucket_name = "solace-decrypt-blob-bucket-3965c485"
kms_key_id = "0f226e6a-bd36-40c7-9e2c-8170e3a2313f"
blob_key = "sample-encrypted-message"

plaintext = "hello solace team :)".encode("utf-8")

kms = boto3.client("kms")
s3 = boto3.client("s3")

# Encrypt with KMS
response = kms.encrypt(
    KeyId=kms_key_id,
    Plaintext=plaintext
)

encrypted_blob = response["CiphertextBlob"]

# Upload to S3
s3.put_object(
    Bucket=bucket_name,
    Key=blob_key,
    Body=encrypted_blob
)

print(f"Encrypted blob uploaded to S3 as key: {blob_key}")
