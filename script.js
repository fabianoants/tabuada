// =========================================================================
// SCRIPT PRINCIPAL DO JOGO DE TABUADA
// =========================================================================

// --- SELEÇÃO DE ELEMENTOS DO HTML ---
// Seleciona todos os elementos do DOM que serão manipulados.
const tituloQuizEl = document.getElementById('titulo-quiz');
const inicioContainerEl = document.getElementById('inicio-container');
const perguntaEl = document.getElementById('pergunta');
const fimJogoMensagemEl = document.getElementById('fim-jogo-mensagem');
const respostaDisplayEl = document.getElementById('resposta-display');
const botoesRespostaContainerEl = document.getElementById('botoes-resposta-container');
const botoesRespostaEl = document.querySelectorAll('.btn-resposta');
const btnLimpar = document.getElementById('btn-limpar');
const nomeInput = document.getElementById('nome-jogador');
const btnEnviar = document.getElementById('btn-enviar');
const feedbackEl = document.getElementById('feedback');
const placarEl = document.getElementById('placar');
const timerEl = document.getElementById('timer');
const rankContainerEl = document.getElementById('rank-container');
const rankListEl = document.getElementById('rank-list');
const botoesTabuadaContainerEl = document.getElementById('botoes-tabuada-container');
const botoesTabuada = document.querySelectorAll('.btn-tabuada');
const gameDisplayContainerEl = document.getElementById('game-display-container');
const pontuacaoNumeroEl = document.getElementById('pontuacao-numero');
const btnIniciar = document.getElementById('btn-iniciar');
const labelTabuadaEl = document.getElementById('label-tabuada');
const btnReiniciar = document.getElementById('btn-reiniciar');

// Esconde os elementos do jogo que não devem estar visíveis no início.
gameDisplayContainerEl.classList.add('hidden');
botoesRespostaContainerEl.classList.add('hidden');
fimJogoMensagemEl.classList.add('hidden');
rankContainerEl.classList.add('hidden');
btnReiniciar.classList.add('hidden');

// --- VARIÁVEIS DE ESTADO DO JOGO ---
let num1, num2, respostaCorreta; // Variáveis da pergunta atual.
let pontuacao = 0;
let respostasCorretasConteo = 0;
let tempoInicial = 60;
let tempoRestante;
let timerInterval;
let top5Pontuacoes = []; // Array para o ranking.
let nomeJogador = '';
let respostaAtual = ''; // Resposta que o jogador está digitando.
let tabuadaSelecionada = null;
const historicoPerguntasAnteriores = []; // Evita repetição de perguntas recentes.


// =========================================================================
// FUNÇÕES DE GERENCIAMENTO DO RANKING
// =========================================================================

// Carrega pontuações salvas no armazenamento local do navegador.
function carregarPontuacoes() {
    const pontuacoesSalvas = localStorage.getItem('top5Pontuacoes');
    if (pontuacoesSalvas) {
        top5Pontuacoes = JSON.parse(pontuacoesSalvas);
    }
}

// Salva as pontuações no armazenamento local.
function salvarPontuacoes() {
    localStorage.setItem('top5Pontuacoes', JSON.stringify(top5Pontuacoes));
}

// Adiciona uma nova pontuação ao ranking e a ordena.
function atualizarRank(novaPontuacao, nome) {
    top5Pontuacoes.push({ pontuacao: novaPontuacao, nome: nome });
    top5Pontuacoes.sort((a, b) => b.pontuacao - a.pontuacao);
    top5Pontuacoes = top5Pontuacoes.slice(0, 5);
    salvarPontuacoes();
}

// Exibe a lista de ranking na tela.
function mostrarRank() {
    rankListEl.innerHTML = '';
    if (top5Pontuacoes.length > 0) {
        top5Pontuacoes.forEach((item, index) => {
            const li = document.createElement('li');
            li.textContent = `${index + 1}º: ${item.nome} - ${item.pontuacao} pontos`;
            // Adiciona classes para os 3 primeiros colocados.
            if (index === 0) {
                li.classList.add('rank-gold');
            } else if (index === 1) {
                li.classList.add('rank-silver');
            } else if (index === 2) {
                li.classList.add('rank-bronze');
            }
            rankListEl.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'Nenhuma pontuação ainda.';
        rankListEl.appendChild(li);
    }
}


// =========================================================================
// FUNÇÕES DE LÓGICA DO JOGO
// =========================================================================

// Lida com cliques nos botões de número.
function handleBotaoRespostaClick(event) {
    if (event.target.classList.contains('btn-resposta')) {
        if (respostaAtual.length < 3) {
            respostaAtual += event.target.value;
            respostaDisplayEl.textContent = respostaAtual;
        }
    }
}

// Inicia o jogo, validando nome e tabuada.
function comecarJogo() {
    nomeJogador = nomeInput.value.trim();

    if (nomeJogador === '') {
        alert('Por favor, digite seu nome para começar!');
        nomeInput.focus();
        return;
    }
    
    if (tabuadaSelecionada === null) {
        alert('Por favor, escolha uma tabuada para começar!');
        return;
    }
    
    // Esconde a tela inicial e mostra a tela do jogo.
    inicioContainerEl.classList.add('hidden');
    gameDisplayContainerEl.classList.remove('hidden');
    botoesRespostaContainerEl.classList.remove('hidden');
    placarEl.classList.remove('hidden');
    feedbackEl.classList.remove('hidden');
    timerEl.classList.remove('hidden');

    pontuacao = 0;
    pontuacaoNumeroEl.textContent = pontuacao;
    respostasCorretasConteo = 0;
    
    gerarPergunta();
}

// Inicia o temporizador do jogo.
function iniciarTimer() {
    clearInterval(timerInterval);
    tempoRestante = tempoInicial;
    timerEl.textContent = `Tempo: ${tempoRestante}s`;

    timerInterval = setInterval(() => {
        tempoRestante--;
        timerEl.textContent = `Tempo: ${tempoRestante}s`;

        if (tempoRestante <= 0) {
            clearInterval(timerInterval);
            fimDeJogo(false); // Fim de jogo se o tempo acabar.
        }
    }, 1000);
}

// Gera uma nova pergunta de multiplicação.
function gerarPergunta() {
    let perguntaAtual;
    let limiteHistorico;

    if (tabuadaSelecionada === 'aleatorio') {
        limiteHistorico = 15;
    } else {
        limiteHistorico = 4;
    }
    
    // Gera uma pergunta que não está no histórico recente.
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

// Verifica se a resposta do usuário está correta.
function verificarResposta() {
    const respostaUsuario = parseInt(respostaAtual);

    if (isNaN(respostaUsuario)) {
        feedbackEl.textContent = 'Por favor, digite um número.';
        feedbackEl.className = 'incorreto';
        return;
    }

    if (respostaUsuario === respostaCorreta) {
        // Lógica para resposta correta.
        feedbackEl.textContent = 'Correto!';
        feedbackEl.className = 'correto';
        
        respostaDisplayEl.classList.add('flash-green');
        
        pontuacao++;
        respostasCorretasConteo++;
        pontuacaoNumeroEl.textContent = pontuacao;
        
        // Animação de placar.
        pontuacaoNumeroEl.classList.remove('combo-score');
        pontuacaoNumeroEl.classList.add('combo-score');
        
        setTimeout(() => {
            respostaDisplayEl.classList.remove('flash-green');
            pontuacaoNumeroEl.classList.remove('combo-score');
        }, 500);

        setTimeout(gerarPergunta, 1000); // Gera a próxima pergunta.
    } else {
        // Lógica para resposta incorreta.
        feedbackEl.textContent = `Errado. A resposta correta era ${respostaCorreta}.`;
        feedbackEl.className = 'incorreto';
        
        respostaDisplayEl.classList.add('flash-red');

        // Desabilita os botões de resposta.
        btnEnviar.disabled = true;
        botoesRespostaEl.forEach(btn => btn.disabled = true);
        btnLimpar.disabled = true;
        
        setTimeout(() => {
            respostaDisplayEl.classList.remove('flash-red');
        }, 500);

        setTimeout(() => {
            fimDeJogo(false); // Termina o jogo.
        }, 2000);
    }
}

// Função para o fim do jogo.
function fimDeJogo(vitoria) {
    clearInterval(timerInterval); // Para o temporizador.

    if (nomeJogador) {
        atualizarRank(pontuacao, nomeJogador); // Salva a pontuação.
    }
    
    // Esconde a tela do jogo e mostra a tela de fim de jogo.
    gameDisplayContainerEl.classList.add('hidden');
    botoesRespostaContainerEl.classList.add('hidden');
    fimJogoMensagemEl.classList.remove('hidden');
    btnReiniciar.classList.remove('hidden');
    rankContainerEl.classList.remove('hidden');
    
    fimJogoMensagemEl.textContent = `Fim de Jogo, ${nomeJogador}! Sua pontuação final foi ${pontuacao}.`;
    
    // Reseta a tabuada selecionada.
    botoesTabuada.forEach(btn => btn.classList.remove('selecionado'));
    tabuadaSelecionada = null;
    
    mostrarRank(); // Exibe o ranking.
}

// Função para resetar o jogo para o estado inicial.
function resetarJogo() {
    fimJogoMensagemEl.classList.add('hidden');
    btnReiniciar.classList.add('hidden');
    rankContainerEl.classList.add('hidden');
    inicioContainerEl.classList.remove('hidden');
}


// =========================================================================
// LISTENERS DE EVENTOS
// =========================================================================

// Delegação de eventos para os botões de resposta, mais eficiente.
botoesRespostaContainerEl.addEventListener('click', handleBotaoRespostaClick);

// Listeners para botões de ação do jogo.
btnEnviar.addEventListener('click', verificarResposta);
btnLimpar.addEventListener('click', () => {
    respostaAtual = '';
    respostaDisplayEl.textContent = '';
});

// Listener para os botões de seleção de tabuada.
botoesTabuada.forEach(btn => {
    btn.addEventListener('click', () => {
        botoesTabuada.forEach(b => b.classList.remove('selecionado'));
        btn.classList.add('selecionado');
        tabuadaSelecionada = btn.dataset.value;
    });
});

// Transforma o nome do jogador em maiúsculas.
nomeInput.addEventListener('input', () => {
    nomeInput.value = nomeInput.value.toUpperCase();
});

// Listeners para iniciar e reiniciar o jogo.
btnIniciar.addEventListener('click', comecarJogo);
btnReiniciar.addEventListener('click', resetarJogo);

// Executa funções iniciais ao carregar a página.
carregarPontuacoes();
mostrarRank();