import os
import json
from pymongo import MongoClient
from bson import json_util

headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
}

def handler(request):
    if request.method == "OPTIONS":
        return "", 200, headers

    try:
        mongo_uri = os.environ.get("MONGODB_URI")

        if not mongo_uri:
            return json.dumps({"erro": "Variável MONGO_URI não definida"}), 500, headers

        client = MongoClient(mongo_uri)
        db = client['seu_banco_de_dados']
        ranking_collection = db['ranking']

        if request.method == "POST":
            data = json.loads(request.body)
            nome = data.get('nome')
            pontuacao = int(data.get('pontuacao'))

            if nome and pontuacao is not None:
                ranking_collection.insert_one({'nome': nome, 'pontuacao': pontuacao})
                return json.dumps({"mensagem": "Pontuação salva com sucesso!"}), 200, headers
            return json.dumps({"erro": "Dados inválidos"}), 400, headers

        elif request.method == "GET":
            top_5_results = ranking_collection.find().sort("pontuacao", -1).limit(5)
            ranking_json = json.loads(json_util.dumps(top_5_results))
            return json.dumps(ranking_json), 200, headers

        else:
            return json.dumps({"erro": "Método não permitido"}), 405, headers

    except Exception as e:
        import traceback
        traceback.print_exc()
        return json.dumps({"erro": f"Erro interno: {e}"}), 500, headers
