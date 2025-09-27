const { MongoClient } = require('mongodb');

module.exports = async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  try {
    const mongo_uri = process.env.MONGO_URI;

    if (!mongo_uri) {
      return response.status(500).json({ error: 'Variável MONGO_URI não definida' });
    }

    const client = new MongoClient(mongo_uri);
    await client.connect();

    const db = client.db('pontuacaodados');
    const rankingCollection = db.collection('ranking');

    if (request.method === 'POST') {
      const { nome, pontuacao } = request.body;
      if (nome && pontuacao !== undefined) {
        await rankingCollection.insertOne({ nome, pontuacao });
        return response.status(200).json({ mensagem: 'Pontuação salva com sucesso!' });
      }
      return response.status(400).json({ erro: 'Dados inválidos' });
    }

    if (request.method === 'GET') {
      const top5 = await rankingCollection.find().sort({ pontuacao: -1 }).limit(5).toArray();
      return response.status(200).json(top5);
    }

    return response.status(405).json({ erro: 'Método não permitido' });
  } catch (e) {
    console.error(e);
    return response.status(500).json({ erro: `Erro interno do servidor: ${e.message}` });
  }
};