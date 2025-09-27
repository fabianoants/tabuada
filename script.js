// SELEÇÃO DE ELEMENTOS DO HTML
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

// Esconde elementos ao carregar a página
gameDisplayContainerEl.classList.add('hidden');
botoesRespostaContainerEl.classList.add('hidden');
fimJogoMensagemEl.classList.add('hidden');
rankContainerEl.classList.add('hidden');
btnReiniciar.classList.add('hidden');

// VARIÁVEIS DE ESTADO DO JOGO
let num1, num2, respostaCorreta;
let pontuacao = 0;
let respostasCorretasConteo = 0;
let tempoInicial = 60;
let tempoRestante;
let timerInterval;
let top5Pontuacoes = [];
let nomeJogador = '';
let respostaAtual = '';
let tabuadasSelecionadas = [];
const historicoPerguntasAnteriores = [];
const URL_API = 'https://tabuada-bay.vercel.app/api/ranking';


// FUNÇÕES DO RANKING ONLINE
function salvarPontuacaoOnline(novaPontuacao, nome) {
    fetch(URL_API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome: nome, pontuacao: novaPontuacao }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Sucesso:', data.mensagem);
        console.log('Ranking atualizado:', data.ranking_atualizado);
        mostrarRank(data.ranking_atualizado);
    })
    .catch((error) => {
        console.error('Erro:', error);
        alert('Não foi possível salvar a pontuação. Tente novamente.');
        carregarRankingOnline();
    });
}

function carregarRankingOnline() {
    fetch(URL_API)
    .then(response => response.json())
    .then(data => {
        console.log('Ranking carregado:', data);
        mostrarRank(data);
    })
    .catch((error) => {
        console.error('Erro ao carregar o ranking:', error);
        const li = document.createElement('li');
        li.textContent = 'Não foi possível carregar o ranking online.';
        rankListEl.appendChild(li);
    });
}

function mostrarRank(rankData) {
    rankListEl.innerHTML = '';
    if (rankData && rankData.length > 0) {
        rankData.forEach((item, index) => {
            const li = document.createElement('li');
            li.textContent = `${index + 1}º: ${item.nome} - ${item.pontuacao} pontos`;
            
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


// FUNÇÕES DE LÓGICA DO JOGO
function handleBotaoRespostaClick(event) {
    if (event.target.classList.contains('btn-resposta')) {
        if (respostaAtual.length < 3) {
            respostaAtual += event.target.value;
            respostaDisplayEl.textContent = respostaAtual;
        }
    }
}

function comecarJogo() {
    nomeJogador = nomeInput.value.trim();

    if (nomeJogador === '') {
        alert('Por favor, digite seu nome para começar!');
        nomeInput.focus();
        return;
    }
    
    if (tabuadasSelecionadas.length === 0) {
        alert('Por favor, escolha pelo menos uma tabuada para começar!');
        return;
    }
    
    tempoInicial = 60; 

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

function iniciarTimer() {
    clearInterval(timerInterval);
    tempoRestante = tempoInicial;
    timerEl.textContent = `Tempo: ${tempoRestante}s`;

    timerInterval = setInterval(() => {
        tempoRestante--;
        timerEl.textContent = `Tempo: ${tempoRestante}s`;

        // Ativa a animação de piscar em vermelho nos últimos 10 segundos
        if (tempoRestante <= 10 && !timerEl.classList.contains('flash-red')) {
            timerEl.classList.add('flash-red');
        } else if (tempoRestante > 10 && timerEl.classList.contains('flash-red')) {
            timerEl.classList.remove('flash-red');
        }
        
        if (tempoRestante <= 0) {
            clearInterval(timerInterval);
            fimDeJogo(false);
        }
    }, 1000);
}

function gerarPergunta() {
    let perguntaAtual;
    let limiteHistorico;

    // Define a tabuada com base na seleção (aleatório ou específica)
    let tabuadaParaPergunta;
    const temTodas = tabuadasSelecionadas.includes('aleatorio');
    
    if (temTodas) {
        tabuadaParaPergunta = 'aleatorio';
        limiteHistorico = 30;
    } else {
        const randomIndex = Math.floor(Math.random() * tabuadasSelecionadas.length);
        tabuadaParaPergunta = tabuadasSelecionadas[randomIndex];
        limiteHistorico = tabuadasSelecionadas.length * 4;
    }

    // Gera uma nova pergunta que ainda não foi feita recentemente
    do {
        if (tabuadaParaPergunta === 'aleatorio') {
            num1 = Math.floor(Math.random() * 8) + 2;
            num2 = Math.floor(Math.random() * 8) + 2;
        } else {
            num1 = parseInt(tabuadaParaPergunta);
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
    
    // Reativa o botão e os outros elementos, caso estejam desativados
    btnEnviar.disabled = false;
    botoesRespostaEl.forEach(btn => btn.disabled = false);
    btnLimpar.disabled = false;
    
    iniciarTimer();
}

function verificarResposta() {
    // BUG FIX: Desativa o botão de envio para prevenir múltiplos cliques
    btnEnviar.disabled = true;

    const respostaUsuario = parseInt(respostaAtual);

    if (isNaN(respostaUsuario)) {
        feedbackEl.textContent = 'Por favor, digite um número.';
        feedbackEl.className = 'incorreto';
        btnEnviar.disabled = false;
        return;
    }

    if (respostaUsuario === respostaCorreta) {
        feedbackEl.textContent = 'Correto!';
        feedbackEl.className = 'correto';
        
        // Adiciona classes para as animações de sucesso
        respostaDisplayEl.classList.add('flash-green');
        pontuacaoNumeroEl.classList.add('combo-score');
        
        pontuacao++; 
        respostasCorretasConteo++;
        pontuacaoNumeroEl.textContent = pontuacao;
        
        // Remove as classes de animação depois que a animação terminar
        respostaDisplayEl.addEventListener('animationend', function handler() {
            respostaDisplayEl.classList.remove('flash-green');
            pontuacaoNumeroEl.classList.remove('combo-score');
            respostaDisplayEl.removeEventListener('animationend', handler);
        }, { once: true });

        // Lógica de redução de tempo a cada 5 pontos
        if (pontuacao > 0 && pontuacao % 5 === 0 && tempoInicial > 5) {
            tempoInicial -= 5;
            timerEl.classList.add('flash-red');
            timerEl.addEventListener('animationend', function handler() {
                timerEl.classList.remove('flash-red');
                clearInterval(timerInterval);
                iniciarTimer();
                timerEl.removeEventListener('animationend', handler);
            }, { once: true });
        }

        // Condição de vitória
        if (!tabuadasSelecionadas.includes('aleatorio') && pontuacao >= 60) {
            fimDeJogo(true);
            return;
        }

        // Gera a próxima pergunta
        setTimeout(gerarPergunta, 500);

    } else {
        feedbackEl.textContent = `Errado. A resposta correta era ${respostaCorreta}.`;
        feedbackEl.className = 'incorreto';
        
        respostaDisplayEl.classList.add('flash-red');

        // Desativa todos os botões temporariamente
        btnEnviar.disabled = true;
        botoesRespostaEl.forEach(btn => btn.disabled = true);
        btnLimpar.disabled = true;
        
        // Remove a classe de animação e chama o fim de jogo
        respostaDisplayEl.addEventListener('animationend', function handler() {
            respostaDisplayEl.classList.remove('flash-red');
            respostaDisplayEl.removeEventListener('animationend', handler);
            fimDeJogo(false);
        }, { once: true });
    }
}

function fimDeJogo(vitoria) {
    clearInterval(timerInterval);

    if (nomeJogador) {
        salvarPontuacaoOnline(pontuacao, nomeJogador);
    }
    
    gameDisplayContainerEl.classList.add('hidden');
    botoesRespostaContainerEl.classList.add('hidden');
    fimJogoMensagemEl.classList.remove('hidden');
    btnReiniciar.classList.remove('hidden');
    rankContainerEl.classList.remove('hidden');
    
    if (vitoria) {
        fimJogoMensagemEl.textContent = `Parabéns, ${nomeJogador}! Você atingiu 60 pontos e venceu o jogo!`;
    } else {
        fimJogoMensagemEl.textContent = `Fim de Jogo, ${nomeJogador}! Sua pontuação final foi ${pontuacao}.`;
    }
    
    botoesTabuada.forEach(btn => btn.classList.remove('selecionado'));
    tabuadasSelecionadas = [];
}

function resetarJogo() {
    fimJogoMensagemEl.classList.add('hidden');
    btnReiniciar.classList.add('hidden');
    rankContainerEl.classList.add('hidden');
    inicioContainerEl.classList.remove('hidden');
}


// LISTENERS DE EVENTOS
botoesRespostaContainerEl.addEventListener('click', handleBotaoRespostaClick);

btnEnviar.addEventListener('click', verificarResposta);
btnLimpar.addEventListener('click', () => {
    respostaAtual = '';
    respostaDisplayEl.textContent = '';
});

// Lógica de seleção de tabuadas (com limite de 4)
botoesTabuada.forEach(btn => {
    btn.addEventListener('click', () => {
        const valorTabuada = btn.dataset.value;
        const index = tabuadasSelecionadas.indexOf(valorTabuada);
        
        if (valorTabuada === 'aleatorio') {
            if (index > -1) {
                tabuadasSelecionadas.splice(index, 1);
                btn.classList.remove('selecionado');
            } else {
                botoesTabuada.forEach(b => {
                    b.classList.remove('selecionado');
                });
                tabuadasSelecionadas = ['aleatorio'];
                btn.classList.add('selecionado');
            }
        } else {
            const indexTodas = tabuadasSelecionadas.indexOf('aleatorio');
            if (indexTodas > -1) {
                tabuadasSelecionadas.splice(indexTodas, 1);
                document.querySelector('.btn-tabuada[data-value="aleatorio"]').classList.remove('selecionado');
            }
            
            if (index > -1) {
                tabuadasSelecionadas.splice(index, 1);
                btn.classList.remove('selecionado');
            } else {
                if (tabuadasSelecionadas.length < 4) {
                    tabuadasSelecionadas.push(valorTabuada);
                    btn.classList.add('selecionado');
                } else {
                    alert('Você pode selecionar no máximo 4 tabuadas.');
                }
            }
        }
    });
});

nomeInput.addEventListener('input', () => {
    nomeInput.value = nomeInput.value.toUpperCase();
});

btnIniciar.addEventListener('click', comecarJogo);
btnReiniciar.addEventListener('click', resetarJogo);

carregarRankingOnline();