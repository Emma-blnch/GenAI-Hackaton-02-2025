#fonction sur aws lambda

import json
import boto3

bedrock_ruimport json
import boto3

bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-west-2')

def analyze_summary(text):
    try:
        if not text:
            raise ValueError("No message provided for summary analysis.")

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
ntime = boto3.client('bedrock-runtime', region_name='us-west-2')

def lambda_handler(event, context):
    try:
        if 'message' in event:
            user_message = event['message']
        else:
            body = json.loads(event.get('body', '{}'))
            user_message = body.get('message')

        if not user_message:
            raise ValueError("No message provided in the request.")

        # Nouveau prompt renforcé
        formatted_prompt = (
            f"[INST] Tu es un analyste de l'entreprise de distribution d'électricité Enedis. Trouve le sujet de ce texte et son lien avec l'entreprise de distribution d'électricité en utilisant au plus 3 mots et sans explication. Les résultats qui suivent sont des réponses valides : innovation, clients, réseau, aléas climatiques, divers, marque employeur/rh, rse, partenariats industriels / académiques, raccordement, grèves, mobilité électrique, prévention, linky, rh, rh - partenariat - rse, transition écologique."
            f"Texte : \"{user_message}\" [/INST]"
        )

        payload = {
            "modelId": "mistral.mistral-large-2402-v1:0",
            "contentType": "application/json",
            "accept": "application/json",
            "body": json.dumps({
                "prompt": formatted_prompt,
                "max_tokens": 20,
                "temperature": 0.1,
                "top_p": 0.2
            })
        }

        response = bedrock_runtime.invoke_model(
            modelId=payload["modelId"],
            contentType=payload["contentType"],
            accept=payload["accept"],
            body=payload["body"]
        )

        response_body = json.loads(response['body'].read().decode('utf-8'))
        outputs = response_body.get('outputs', [])
        reply = outputs[0].get('text', '').strip().lower() if outputs else 'No response generated.'

        # Normalisation de la réponse (suppression des espaces, gestion des variations)
        reply = reply.replace(".", "").replace("\n", "").strip()

        # Vérification des réponses attendues
        # if reply not in ['positif', 'négatif', 'factuel']:
        #     reply = 'analyse non concluante'

        return {
            'statusCode': 200,
            'headers': { 'Content-Type': 'application/json' },
            'body': json.dumps({ 'reply': reply })
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({ 'error': str(e) })
        }
