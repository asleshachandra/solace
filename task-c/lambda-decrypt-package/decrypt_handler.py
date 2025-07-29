import json
import boto3
import os
import base64
import traceback
import uuid

s3 = boto3.client('s3')
kms = boto3.client('kms')

def lambda_handler(event, context):
    print("Received event:", json.dumps(event))
    
    try:
        body = json.loads(event['body'])
        bucket = body.get('bucket') or os.environ['BUCKET']
        kms_key_id = os.environ.get('KMS_KEY_ID')

        # === Upload flow ===
        if all(k in body for k in ['iv', 'ciphertext', 'key']):
            blob_key = body.get('blobKey') or str(uuid.uuid4())

            payload = json.dumps({
                'iv': body['iv'],
                'ciphertext': body['ciphertext'],
                'key': body['key']
            }).encode()

            s3.put_object(Bucket=bucket, Key=blob_key, Body=payload)

            return {
                "statusCode": 200,
                "headers": {
                    "Content-Type": "application/json",
                },
                "body": json.dumps({ "blobKey": blob_key })
            }

        # === Decryption flow ===
        blob_key = body.get('blobKey')
        if not blob_key:
            raise ValueError("Missing blobKey for decryption")

        response = s3.get_object(Bucket=bucket, Key=blob_key)
        encrypted_blob = json.loads(response['Body'].read())

        iv = base64.b64decode(encrypted_blob['iv'])
        ciphertext = base64.b64decode(encrypted_blob['ciphertext'])
        key = base64.b64decode(encrypted_blob['key'])

        decrypted = kms.decrypt(
            CiphertextBlob=key,
            KeyId=kms_key_id
        )

        plaintext = "[Simulated plaintext]"

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
            },
            "body": json.dumps({ "plaintext": plaintext })
        }

    except Exception as e:
        print("ERROR TRACEBACK:", traceback.format_exc())

        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
            },
            "body": json.dumps({
                "error": str(e),
                "trace": traceback.format_exc()
            })
        }
