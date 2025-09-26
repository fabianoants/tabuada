import os
import json
from pymongo import MongoClient

def handler(request):
    try:
        mongo_uri = os.environ.get("MONGO_URI")
        client = MongoClient(mongo_uri)
        client.admin.command('ping') # Tenta pingar o banco de dados
        return json.dumps({"status": "Conexao com o MongoDB Atlas foi um sucesso!"}), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return json.dumps({"status": f"Falha na conexao: {e}"}), 500