// Seleciona os elementos do HTML que vamos manipular
const perguntaEl = document.getElementById('pergunta');
const fimJogoMensagemEl = document.getElementById('fim-jogo-mensagem');
const respostaDisplayEl = document.getElementById('resposta-display');
const botoesRespostaContainerEl = document.getElementById('botoes-resposta-container');
const botoesRespostaEl = document.querySelectorAll('.btn-resposta');
const btnLimpar = document.getElementById('btn-limpar');
const nomeInput = document.getElementById('nome-jogador');
const btnIniciar = document.getElementById('btn-iniciar');
const btnEnviar = document.getElementById('btn-enviar');
const feedbackEl = document.getElementById('feedback');
const placarEl = document.getElementById('placar');
const timerEl = document.getElementById('timer');
const rankContainerEl = document.getElementById('rank-container');
const rankListEl = document.getElementById('rank-list');

// Variáveis para o quiz e o temporizador
let num1, num2, respostaCorreta;
let pontuacao = 0;
let respostasCorretasConteo = 0;
let tempoInicial = 60;
let tempoRestante;
let timerInterval;
let top5Pontuacoes = [];
let nomeJogador = '';
let respostaAtual = '';

// Variável para armazenar o histórico de perguntas
const historicoPerguntasAnteriores = [];

// Funções do Rank
function carregarPontuacoes() {
    const pontuacoesSalvas = localStorage.getItem('top5Pontuacoes');
    if (pontuacoesSalvas) {
        top5Pontuacoes = JSON.parse(pontuacoesSalvas);
    }
}

function salvarPontuacoes() {
    localStorage.setItem('top5Pontuacoes', JSON.stringify(top5Pontuacoes));
}

function atualizarRank(novaPontuacao, nome) {
    top5Pontuacoes.push({ pontuacao: novaPontuacao, nome: nome });
    top5Pontuacoes.sort((a, b) => b.pontuacao - a.pontuacao); // Ordena do maior para o menor
    top5Pontuacoes = top5Pontuacoes.slice(0, 5); // Mantém apenas os 5 primeiros
    salvarPontuacoes();
}

function mostrarRank() {
    rankListEl.innerHTML = ''; // Limpa a lista antes de renderizar
    if (top5Pontuacoes.length > 0) {
        top5Pontuacoes.forEach((item, index) => {
            const li = document.createElement('li');
            li.textContent = `${index + 1}º: ${item.nome} - ${item.pontuacao} pontos`;
            rankListEl.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'Nenhuma pontuação ainda.';
        rankListEl.appendChild(li);
    }
}

// Lida com cliques nos botões de resposta
function handleBotaoRespostaClick(event) {
    if (respostaAtual.length < 3) {
        respostaAtual += event.target.value;
        respostaDisplayEl.textContent = respostaAtual;
    }
}

// Função para iniciar o jogo (chamada pelo botão "Começar")
function comecarJogo() {
    nomeJogador = nomeInput.value.trim();

    if (nomeJogador === '') {
        alert('Por favor, digite seu nome para começar!');
        nomeInput.focus();
        return;
    }
    
    // Esconde elementos iniciais
    nomeInput.classList.add('hidden');
    fimJogoMensagemEl.classList.add('hidden');
    btnIniciar.classList.add('hidden');
    
    // Mostra elementos do jogo
    placarEl.classList.remove('hidden');
    perguntaEl.classList.remove('hidden');
    respostaDisplayEl.classList.remove('hidden');
    botoesRespostaContainerEl.style.display = 'grid';
    feedbackEl.classList.remove('hidden');
    timerEl.classList.remove('hidden');
    
    // Reinicia o placar e começa a partida
    pontuacao = 0;
    placarEl.textContent = `Pontuação: ${pontuacao}`;
    respostasCorretasConteo = 0;
    tempoInicial = 60;
    
    gerarPergunta();
}

// Função para iniciar o temporizador
function iniciarTimer() {
    clearInterval(timerInterval);
    tempoRestante = tempoInicial;
    timerEl.textContent = `Tempo: ${tempoRestante}s`;

    timerInterval = setInterval(() => {
        tempoRestante--;
        timerEl.textContent = `Tempo: ${tempoRestante}s`;

        if (tempoRestante <= 0) {
            clearInterval(timerInterval);
            fimDeJogo(false); // Fim de jogo por tempo
        }
    }, 1000);
}

// Função para gerar uma nova pergunta
function gerarPergunta() {
    let perguntaAtual;
    
    // Gera uma nova pergunta até que ela não esteja no histórico
    do {
        num1 = Math.floor(Math.random() * 8) + 2;
        num2 = Math.floor(Math.random() * 8) + 2;
        respostaCorreta = num1 * num2;
        perguntaAtual = `${num1} x ${num2}?`;
    } while (historicoPerguntasAnteriores.includes(perguntaAtual));

    // Adiciona a nova pergunta ao histórico
    historicoPerguntasAnteriores.push(perguntaAtual);
    
    // Mantém o histórico com as 15 últimas perguntas
    if (historicoPerguntasAnteriores.length > 15) {
        historicoPerguntasAnteriores.shift(); // Remove o primeiro elemento
    }
    
    respostaAtual = '';
    respostaDisplayEl.textContent = '';

    perguntaEl.textContent = perguntaAtual;
    feedbackEl.textContent = '';
    feedbackEl.className = '';
    
    btnEnviar.disabled = false;
    botoesRespostaEl.forEach(btn => btn.disabled = false);
    btnLimpar.disabled = false;
    
    iniciarTimer();
}

// Função para verificar a resposta do usuário
function verificarResposta() {
    const respostaUsuario = parseInt(respostaAtual);

    if (isNaN(respostaUsuario)) {
        feedbackEl.textContent = 'Por favor, digite um número.';
        feedbackEl.className = 'incorreto';
        return;
    }

    if (respostaUsuario === respostaCorreta) {
        feedbackEl.textContent = 'Correto! 🎉';
        feedbackEl.className = 'correto';
        pontuacao++;
        respostasCorretasConteo++;
        placarEl.textContent = `Pontuação: ${pontuacao}`;
        
        if (pontuacao >= 60) {
            fimDeJogo(true);
            return;
        }

        if (respostasCorretasConteo % 10 === 0) {
            tempoInicial -= 10;
            if (tempoInicial < 10) {
                tempoInicial = 10;
            }
        }

        setTimeout(gerarPergunta, 1000); 
    } else {
        feedbackEl.textContent = `Errado. A resposta correta era ${respostaCorreta}.`;
        feedbackEl.className = 'incorreto';
        
        btnEnviar.disabled = true;
        botoesRespostaEl.forEach(btn => btn.disabled = true);
        btnLimpar.disabled = true;
        
        setTimeout(() => {
            fimDeJogo(false);
        }, 2000);
    }
}

// Função para o fim do jogo (tempo esgotado, erro ou vitória)
function fimDeJogo(vitoria) {
    clearInterval(timerInterval);

    if (nomeJogador) {
        atualizarRank(pontuacao, nomeJogador);
    }
    
    // Esconde elementos do jogo
    placarEl.classList.add('hidden');
    perguntaEl.classList.add('hidden');
    respostaDisplayEl.classList.add('hidden');
    botoesRespostaContainerEl.style.display = 'none';
    feedbackEl.classList.add('hidden');
    timerEl.classList.add('hidden');
    
    // Define o texto de fim de jogo e o exibe
    if (vitoria) {
        fimJogoMensagemEl.textContent = `Parabéns, ${nomeJogador}! Você alcançou a pontuação máxima de ${pontuacao} pontos! 🎉`;
    } else {
        fimJogoMensagemEl.textContent = `Fim de Jogo, ${nomeJogador}! Sua pontuação final foi ${pontuacao}.`;
    }
    fimJogoMensagemEl.classList.remove('hidden');
    
    // Mostra apenas o botão de Reiniciar Jogo
    btnIniciar.textContent = 'Reiniciar';
    btnIniciar.classList.remove('hidden');
    rankContainerEl.classList.remove('hidden');
    
    mostrarRank();
}

// Função para reiniciar o jogo completamente (volta ao estado inicial)
function resetarJogo() {
    // Esconde elementos do final do jogo
    fimJogoMensagemEl.classList.add('hidden');
    
    // Mostra elementos iniciais
    nomeInput.classList.remove('hidden');
    btnIniciar.textContent = 'Começar';
}


// Adiciona os "ouvintes" de evento aos botões
btnIniciar.addEventListener('click', () => {
    if (btnIniciar.textContent === 'Começar') {
        comecarJogo();
    } else {
        resetarJogo();
    }
});

btnEnviar.addEventListener('click', verificarResposta);
btnLimpar.addEventListener('click', () => {
    respostaAtual = '';
    respostaDisplayEl.textContent = '';
});

botoesRespostaEl.forEach(btn => {
    btn.addEventListener('click', handleBotaoRespostaClick);
});

// Força o contêiner de botões a ser escondido ao carregar a página
botoesRespostaContainerEl.style.display = 'none';

// Carrega as pontuações e exibe o rank ao carregar a página
carregarPontuacoes();
mostrarRank();
