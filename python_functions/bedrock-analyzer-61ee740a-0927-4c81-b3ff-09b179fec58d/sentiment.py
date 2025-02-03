import json
import boto3

bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-west-2')

def analyze_sentiment(text):
    try:
        if not text:
            raise ValueError("No message provided for sentiment analysis.")

        # Format the prompt
        formatted_prompt = (
            f"<s>[INST] Tu es un analyste de l'entreprise Enedis. "
            f"Analyse le texte suivant et décris son image avec un des mots suivants, sans explication : "
            f"'positif', 'négatif', 'factuel', 'factuel positif', 'factuel négatif', 'positif nuancé', 'négatif nuancé'. "
            f"Texte : \"{text}\" [/INST]"
        )

        payload = {
            "modelId": "mistral.mistral-large-2402-v1:0",
            "contentType": "application/json",
            "accept": "application/json",
            "body": json.dumps({
                "prompt": formatted_prompt,
                "max_tokens": 10,
                "temperature": 0.1,
                "top_p": 0.2
            })
        }

        # Invoke the Bedrock model
        response = bedrock_runtime.invoke_model(
            modelId=payload["modelId"],
            contentType=payload["contentType"],
            accept=payload["accept"],
            body=payload["body"]
        )

        response_body = json.loads(response['body'].read().decode('utf-8'))
        outputs = response_body.get('outputs', [])
        reply = outputs[0].get('text', '').strip().lower() if outputs else 'No response generated.'

        # Normalize response
        reply = reply.replace(".", "").replace("\n", "").strip()

        return {'reply': reply}

    except Exception as e:
        return {'error': str(e)}
