from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
import os

app = Flask(__name__)
CORS(app)

# Pega a string de conexão das variáveis de ambiente do Vercel
mongo_uri = os.environ.get("MONGO_URI")

# Conecta ao MongoDB Atlas
try:
    client = MongoClient(mongo_uri)
    db = client['seu_banco_de_dados']
    ranking_collection = db['ranking']
except Exception as e:
    # Se a conexão falhar, retorna um erro para que você possa ver nos logs
    print(f"Erro de conexão com o MongoDB: {e}")
    ranking_collection = None

# Rota para salvar uma nova pontuação
@app.route('/api/ranking', methods=['POST'])
def salvar_pontuacao():
    if not ranking_collection:
        return jsonify({"erro": "Erro de conexão com o banco de dados"}), 500
    
    data = request.json
    nome = data.get('nome')
    pontuacao = data.get('pontuacao')

    if nome and pontuacao is not None:
        ranking_collection.insert_one({'nome': nome, 'pontuacao': pontuacao})
        return jsonify({"mensagem": "Pontuação salva com sucesso!"}), 200
    return jsonify({"erro": "Dados inválidos"}), 400

# Rota para carregar o ranking
@app.route('/api/ranking', methods=['GET'])
def get_ranking():
    if not ranking_collection:
        return jsonify({"erro": "Erro de conexão com o banco de dados"}), 500
        
    top_5_results = ranking_collection.find().sort("pontuacao", -1).limit(5)
    top_5 = [
        {'nome': doc['nome'], 'pontuacao': doc['pontuacao']}
        for doc in top_5_results
    ]
    return jsonify(top_5), 200

if __name__ == '__main__':
    app.run()