import json

def lambda_handler(event, context):
    # Always return placeholder decrypted text
    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        "body": json.dumps({"plaintext": "[Simulated plaintext]"})
    }
