import json
import boto3
import base64
import os

kms = boto3.client('kms')

def lambda_handler(event, context):
    try:
        body = json.loads(event['body'])
        raw_key_b64 = body['key']  # base64-encoded

        raw_key_bytes = base64.b64decode(raw_key_b64)
        kms_key_id = os.environ['KMS_KEY_ID']

        response = kms.encrypt(
            KeyId=kms_key_id,
            Plaintext=raw_key_bytes
        )

        encrypted_key_b64 = base64.b64encode(response['CiphertextBlob']).decode('utf-8')

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({ "encryptedKey": encrypted_key_b64 })
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({ "error": str(e) })
        }
