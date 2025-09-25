from http.server import BaseHTTPRequestHandler
import json
from pymongo import MongoClient
import os

# Pega a string de conexão das variáveis de ambiente do Vercel
# É a forma mais segura de armazenar informações sensíveis como senhas.
mongo_uri = os.environ.get("MONGO_URI")

# Conecta ao MongoDB Atlas
client = MongoClient(mongo_uri)
db = client['banco_de_dados']  # Substitua 'seu_banco_de_dados' pelo nome que você quiser
ranking_collection = db['ranking']  # Onde as pontuações serão salvas

# Função principal que lida com as requisições
def handler(request, response):
    if request.method == 'POST':
        try:
            # Lógica para salvar uma nova pontuação
            data = json.loads(request.body)
            nome = data.get('nome')
            pontuacao = data.get('pontuacao')

            if nome and pontuacao is not None:
                # Insere o novo resultado no banco de dados
                ranking_collection.insert_one({'nome': nome, 'pontuacao': pontuacao})
                
                # Busca os 5 melhores resultados para enviar de volta
                top_5_results = ranking_collection.find().sort("pontuacao", -1).limit(5)
                top_5 = [doc for doc in top_5_results]
                
                # Prepara a resposta
                response.status_code = 200
                response.headers['Content-Type'] = 'application/json'
                response.body = json.dumps({"mensagem": "Pontuação salva com sucesso!", "ranking_atualizado": top_5})
            else:
                response.status_code = 400
                response.headers['Content-Type'] = 'application/json'
                response.body = json.dumps({"erro": "Dados inválidos"})
        except Exception as e:
            response.status_code = 500
            response.headers['Content-Type'] = 'application/json'
            response.body = json.dumps({"erro": "Erro ao salvar a pontuação", "detalhes": str(e)})

    elif request.method == 'GET':
        try:
            # Lógica para carregar o ranking
            top_5_results = ranking_collection.find().sort("pontuacao", -1).limit(5)
            top_5 = [doc for doc in top_5_results]
            
            # Prepara a resposta
            response.status_code = 200
            response.headers['Content-Type'] = 'application/json'
            response.body = json.dumps(top_5)
        except Exception as e:
            response.status_code = 500
            response.headers['Content-Type'] = 'application/json'
            response.body = json.dumps({"erro": "Erro ao carregar o ranking", "detalhes": str(e)})

    else:
        # Resposta para outros métodos HTTP
        response.status_code = 405
        response.headers['Content-Type'] = 'application/json'
        response.body = json.dumps({"erro": "Método não permitido"})