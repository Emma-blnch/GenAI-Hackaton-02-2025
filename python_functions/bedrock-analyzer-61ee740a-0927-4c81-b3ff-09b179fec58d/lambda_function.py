import json
import boto3
import sentiment
import summary

lambda_client = boto3.client('lambda')

def lambda_handler(event, context):
    try:
        # ✅ Extract text from request
        text = json.loads(event['body']).get('text', '')

        if not text:
            raise ValueError("No text provided.")

        # ✅ Call Sentiment Analysis Locally
        sentiment_result = sentiment.analyze_sentiment(text)  # ✅ Use function, not lambda_handler

        # ✅ Invoke Summary Analysis via AWS Lambda
        response = lambda_client.invoke(
            FunctionName='summary',
            InvocationType='RequestResponse',  # Wait for response
            Payload=json.dumps({'text': text})  # ✅ Corrected payload format
        )

        # ✅ Parse Summary Lambda Response
        theme_result = json.loads(response['Payload'].read())

        # ✅ Return Combined Response
        return {
            'statusCode': 200,
            'body': json.dumps({
                'sentiment_analysis': sentiment_result,
                'theme_analysis': theme_result
            })
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
