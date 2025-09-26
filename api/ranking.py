import os
import json
from pymongo import MongoClient

# Pega a string de conexão das variáveis de ambiente do Vercel
mongo_uri = os.environ.get("MONGO_URI")

# Conecta ao MongoDB Atlas
try:
    client = MongoClient(mongo_uri)
    db = client['pontuacao']
    ranking_collection = db['ranking']
except Exception as e:
    ranking_collection = None
    print(f"Erro de conexão com o MongoDB: {e}")

# Esta é a função principal que o Vercel irá rodar
def handler(request):
    if not ranking_collection:
        return json.dumps({"erro": "Erro de conexão com o banco de dados"}), 500

    if request.method == "POST":
        # Salva uma nova pontuação
        try:
            data = json.loads(request.body)
            nome = data.get('nome')
            pontuacao = data.get('pontuacao')

            if nome and pontuacao is not None:
                ranking_collection.insert_one({'nome': nome, 'pontuacao': pontuacao})
                return json.dumps({"mensagem": "Pontuação salva com sucesso!"}), 200
            return json.dumps({"erro": "Dados inválidos"}), 400
        except Exception as e:
            return json.dumps({"erro": f"Erro interno: {e}"}), 500

    elif request.method == "GET":
        # Carrega o ranking
        try:
            top_5_results = ranking_collection.find().sort("pontuacao", -1).limit(5)
            top_5 = [
                {'nome': doc['nome'], 'pontuacao': doc['pontuacao']}
                for doc in top_5_results
            ]
            return json.dumps(top_5), 200
        except Exception as e:
            return json.dumps({"erro": f"Erro interno: {e}"}), 500
    
    else:
        return json.dumps({"erro": "Método não permitido"}), 405