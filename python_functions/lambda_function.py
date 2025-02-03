import json
import boto3
import base64
import uuid
import time

# Initialisation des clients AWS
s3_client = boto3.client('s3')
bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-west-2')

BUCKET_NAME = 'store-pdf-bucket'

def lambda_handler(event, context):
    try:
        body = event['body']
        if event.get('isBase64Encoded', False):
            file_content = base64.b64decode(body)
        else:
            file_content = body.encode('utf-8')

        file_name = f"upload_{uuid.uuid4()}.pdf"
        s3_client.put_object(Bucket=BUCKET_NAME, Key=file_name, Body=file_content)

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': json.dumps({'message': f'Fichier {file_name} stocké avec succès.'})
        }

    except Exception as e:
        print(f"Erreur : {e}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': json.dumps({'error': str(e)})
        }