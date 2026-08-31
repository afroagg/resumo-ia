// referências dos elementos da tela
const textoInput = document.getElementById("textoInput");
const btnGerar = document.getElementById("btnGerar");
const resultado = document.getElementById("resultado");

let acertos = 0;
let totalRespondidas = 0;
let resumoAtual = "";
let historicoPerguntas = [];
let indiceAtual = 0;
let historicoRespostas = [];

// clique no botão dispara o processo todo
btnGerar.addEventListener("click", gerarResumoEQuiz);

async function gerarResumoEQuiz() {
  const texto = textoInput.value.trim();

  if (texto === "") {
    resultado.innerHTML = `<div class="erro">Por favor, cole um texto antes de gerar.</div>`;
    return;
  }

  btnGerar.disabled = true;
  resultado.innerHTML = `<div class="loading">Gerando resumo...</div>`;

  try {
    // primeiro gera o resumo
    const resumo = await gerarResumo(texto);
    resumoAtual = resumo; // guarda pra poder gerar mais perguntas depois
    historicoPerguntas = []; // zera o histórico, já que é um texto novo
    historicoRespostas = [];

    resultado.innerHTML = `<div class="loading">Resumo pronto! Gerando quiz...</div>`;

    // usa o resumo pra montar o quiz em cima dele
    const perguntas = await gerarQuiz(resumo);
    historicoPerguntas.push(perguntas);
    historicoRespostas.push(new Array(perguntas.length).fill(null));
    indiceAtual = 0; // primeiro conjunto gerado

    exibirResultado(resumo, perguntas);

  } catch (erro) {
    resultado.innerHTML = `<div class="erro">Ocorreu um erro ao gerar o conteúdo. Tente novamente.</div>`;
    console.error(erro);
  } finally {
    btnGerar.disabled = false;
  }
}

async function gerarResumo(texto) {
  const resposta = await fetch("/api/resumo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texto })
  });

  if (!resposta.ok) {
    throw new Error("Falha ao gerar resumo");
  }

  const dados = await resposta.json();
  return dados.resumo;
}

async function gerarQuiz(resumo) {
  const resposta = await fetch("/api/quiz", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumo })
  });

  if (!resposta.ok) {
    throw new Error("Falha ao gerar quiz");
  }

  const dados = await resposta.json();
  return dados.perguntas;
}

function exibirResultado(resumo, perguntas) {
  const respostasDoConjunto = historicoRespostas[indiceAtual];

  // recalcula o placar com base nas respostas já salvas desse conjunto
  acertos = 0;
  totalRespondidas = 0;

  let html = `
    <div class="resumo-box">
      <h2>Resumo</h2>
      <p>${resumo}</p>
    </div>
  `;

  perguntas.forEach((item, indice) => {
    const respostaSalva = respostasDoConjunto[indice];
    const jaRespondida = respostaSalva !== null;

    if (jaRespondida) {
      totalRespondidas++;
      if (respostaSalva === item.correta) acertos++;
    }

    html += `
      <div class="pergunta-card" data-indice="${indice}">
        <p>${indice + 1}. ${item.pergunta}</p>
        ${item.alternativas.map((alt, i) => {
          let classe = "alternativa";
          let desabilitado = "";

          if (jaRespondida) {
            desabilitado = "disabled";
            if (i === item.correta) classe += " correta";
            else if (i === respostaSalva) classe += " incorreta";
          }

          return `
            <button class="${classe}" data-correta="${item.correta}" data-selecionada="${i}" ${desabilitado}>
              ${alt}
            </button>
          `;
        }).join("")}
        <p class="explicacao" style="display: ${jaRespondida && respostaSalva !== item.correta ? "block" : "none"};">${item.explicacao}</p>
      </div>
    `;
  });

  html += `<div class="placar" id="placar">Acertos: ${acertos} de ${totalRespondidas}</div>`;

  html += `<div class="navegacao">`;
  if (indiceAtual > 0) {
    html += `<button id="btnAnterior">← Perguntas anteriores</button>`;
  }
  html += `<span class="contador-conjunto">Conjunto ${indiceAtual + 1} de ${historicoPerguntas.length}</span>`;
  if (indiceAtual < historicoPerguntas.length - 1) {
    html += `<button id="btnProximo">Próximas perguntas →</button>`;
  }
  html += `</div>`;

  html += `<button id="btnMaisPerguntas">Gerar mais perguntas</button>`;

  resultado.innerHTML = html;

  document.querySelectorAll(".alternativa").forEach(botao => {
    botao.addEventListener("click", verificarResposta);
  });

  document.getElementById("btnMaisPerguntas").addEventListener("click", gerarMaisPerguntas);

  const botaoAnterior = document.getElementById("btnAnterior");
  if (botaoAnterior) {
    botaoAnterior.addEventListener("click", () => {
      indiceAtual--;
      exibirResultado(resumoAtual, historicoPerguntas[indiceAtual]);
    });
  }

  const botaoProximo = document.getElementById("btnProximo");
  if (botaoProximo) {
    botaoProximo.addEventListener("click", () => {
      indiceAtual++;
      exibirResultado(resumoAtual, historicoPerguntas[indiceAtual]);
    });
  }
}

function verificarResposta(evento) {
  const botaoClicado = evento.target;
  const card = botaoClicado.closest(".pergunta-card");
  const indicePergunta = parseInt(card.dataset.indice);
  const correta = parseInt(botaoClicado.dataset.correta);
  const selecionada = parseInt(botaoClicado.dataset.selecionada);

  // salva a resposta no histórico do conjunto atual
  historicoRespostas[indiceAtual][indicePergunta] = selecionada;

  const todosBotoes = card.querySelectorAll(".alternativa");
  todosBotoes.forEach(btn => btn.disabled = true);

  totalRespondidas++;

  if (selecionada === correta) {
    botaoClicado.classList.add("correta");
    acertos++;
  } else {
    botaoClicado.classList.add("incorreta");
    todosBotoes[correta].classList.add("correta");

    const explicacao = card.querySelector(".explicacao");
    explicacao.style.display = "block";
  }

  document.getElementById("placar").textContent = `Acertos: ${acertos} de ${totalRespondidas}`;
}

// gera um novo conjunto de perguntas sobre o mesmo resumo, sem perder os anteriores
async function gerarMaisPerguntas() {
  const botao = document.getElementById("btnMaisPerguntas");
  botao.disabled = true;
  botao.textContent = "Gerando...";

  try {
    const novasPerguntas = await gerarQuiz(resumoAtual);
    historicoPerguntas.push(novasPerguntas);
    historicoRespostas.push(new Array(novasPerguntas.length).fill(null));
    indiceAtual = historicoPerguntas.length - 1; // aponta pro conjunto recém-criado
    exibirResultado(resumoAtual, novasPerguntas);
  } catch (erro) {
    resultado.innerHTML += `<div class="erro">Não foi possível gerar mais perguntas. Tente novamente.</div>`;
    console.error(erro);
  }
}