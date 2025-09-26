import os
import json
from pymongo import MongoClient
import urllib.parse

def handler(request):
    try:
        # Pega a string de conexão das variáveis de ambiente do Vercel
        mongo_uri = os.environ.get("MONGO_URI")

        # Conecta ao MongoDB Atlas
        client = MongoClient(mongo_uri)
        db = client['pontuacaoDados']
        ranking_collection = db['ranking']

        if request.method == "POST":
            # Salva uma nova pontuação
            data = json.loads(request.body)
            nome = data.get('nome')
            pontuacao = int(data.get('pontuacao'))

            if nome and pontuacao is not None:
                ranking_collection.insert_one({'nome': nome, 'pontuacao': pontuacao})
                return json.dumps({"mensagem": "Pontuação salva com sucesso!"}), 200
            return json.dumps({"erro": "Dados inválidos"}), 400

        elif request.method == "GET":
            # Carrega o ranking
            top_5_results = ranking_collection.find().sort("pontuacao", -1).limit(5)
            top_5 = [
                {'nome': doc['nome'], 'pontuacao': doc['pontuacao']}
                for doc in top_5_results
            ]
            return json.dumps(top_5), 200
        
        else:
            return json.dumps({"erro": "Método não permitido"}), 405
    
    except Exception as e:
        # Captura qualquer erro e o exibe no log do Vercel
        print(f"Erro na função: {e}")
        return json.dumps({"erro": f"Erro interno: {e}"}), 500