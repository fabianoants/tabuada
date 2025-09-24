// Seleciona os elementos do HTML que vamos manipular
const tituloQuizEl = document.getElementById('titulo-quiz');
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
const selectTabuada = document.getElementById('select-tabuada');
const labelTabuada = document.getElementById('label-tabuada');
const perguntaRespostaContainerEl = document.getElementById('pergunta-resposta-container');

// Força o contêiner de pergunta e resposta a ser escondido no início
perguntaRespostaContainerEl.style.display = 'none';

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
let tabuadaSelecionada;

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
    top5Pontuacoes.sort((a, b) => b.pontuacao - a.pontuacao);
    top5Pontuacoes = top5Pontuacoes.slice(0, 5);
    salvarPontuacoes();
}

function mostrarRank() {
    rankListEl.innerHTML = '';
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

// Função para iniciar o jogo
function comecarJogo() {
    nomeJogador = nomeInput.value.trim();
    tabuadaSelecionada = selectTabuada.value;

    if (nomeJogador === '') {
        alert('Por favor, digite seu nome para começar!');
        nomeInput.focus();
        return;
    }
    
    // Esconde elementos iniciais
    tituloQuizEl.classList.add('hidden');
    nomeInput.classList.add('hidden');
    selectTabuada.classList.add('hidden');
    labelTabuada.classList.add('hidden');
    fimJogoMensagemEl.classList.add('hidden');
    btnIniciar.classList.add('hidden');
    rankContainerEl.classList.add('hidden');
    
    // Mostra elementos do jogo
    perguntaRespostaContainerEl.style.display = 'flex';
    placarEl.classList.remove('hidden');
    feedbackEl.classList.remove('hidden');
    botoesRespostaContainerEl.style.display = 'grid';
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
            fimDeJogo(false);
        }
    }, 1000);
}

// Função para gerar uma nova pergunta
function gerarPergunta() {
    let perguntaAtual;
    let limiteHistorico;

    if (tabuadaSelecionada === 'aleatorio') {
        limiteHistorico = 15;
    } else {
        limiteHistorico = 4;
    }
    
    do {
        if (tabuadaSelecionada === 'aleatorio') {
            num1 = Math.floor(Math.random() * 8) + 2;
            num2 = Math.floor(Math.random() * 8) + 2;
        } else {
            num1 = parseInt(tabuadaSelecionada);
            num2 = Math.floor(Math.random() * 8) + 2;
        }
        respostaCorreta = num1 * num2;
        perguntaAtual = `${num1} x ${num2}?`;
    } while (historicoPerguntasAnteriores.includes(perguntaAtual));

    historicoPerguntasAnteriores.push(perguntaAtual);
    
    if (historicoPerguntasAnteriores.length > limiteHistorico) {
        historicoPerguntasAnteriores.shift();
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

// Função para o fim do jogo
function fimDeJogo(vitoria) {
    clearInterval(timerInterval);

    if (nomeJogador) {
        atualizarRank(pontuacao, nomeJogador);
    }
    
    // Esconde elementos do jogo
    perguntaRespostaContainerEl.style.display = 'none';
    placarEl.classList.add('hidden');
    feedbackEl.classList.add('hidden');
    botoesRespostaContainerEl.style.display = 'none';
    timerEl.classList.add('hidden');
    
    // Define o texto de fim de jogo e o exibe
    if (vitoria) {
        fimJogoMensagemEl.textContent = `Parabéns, ${nomeJogador}! Você alcançou a pontuação máxima de ${pontuacao} pontos! 🎉`;
    } else {
        fimJogoMensagemEl.textContent = `Fim de Jogo, ${nomeJogador}! Sua pontuação final foi ${pontuacao}.`;
    }
    fimJogoMensagemEl.classList.remove('hidden');
    
    // Mostra o botão de Reiniciar Jogo e o rank
    tituloQuizEl.classList.remove('hidden');
    btnIniciar.textContent = 'Reiniciar';
    btnIniciar.classList.remove('hidden');
    rankContainerEl.classList.remove('hidden');
    
    mostrarRank();
}

// Função para reiniciar o jogo completamente
function resetarJogo() {
    // Esconde elementos do final do jogo
    fimJogoMensagemEl.classList.add('hidden');
    
    // Mostra elementos iniciais
    perguntaRespostaContainerEl.style.display = 'none';
    tituloQuizEl.classList.remove('hidden');
    nomeInput.classList.remove('hidden');
    selectTabuada.classList.remove('hidden');
    labelTabuada.classList.remove('hidden');
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

// Garante que os elementos do jogo estejam escondidos ao carregar a página
botoesRespostaContainerEl.style.display = 'none';

// Carrega as pontuações e exibe o rank ao carregar a página
carregarPontuacoes();
mostrarRank();