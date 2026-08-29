// referências dos elementos da tela
const textoInput = document.getElementById("textoInput");
const btnGerar = document.getElementById("btnGerar");
const resultado = document.getElementById("resultado");

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

    resultado.innerHTML = `<div class="loading">Resumo pronto! Gerando quiz...</div>`;

    // usa o resumo pra montar o quiz em cima dele
    const perguntas = await gerarQuiz(resumo);

    exibirResultado(resumo, perguntas);

  } catch (erro) {
    resultado.innerHTML = `<div class="erro">Ocorreu um erro ao gerar o conteúdo. Tente novamente.</div>`;
    console.error(erro);
  } finally {
    btnGerar.disabled = false;
  }
}

async function gerarResumo(texto) {
  const resposta = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: "Você resume textos de forma clara e objetiva, em português, mantendo as informações mais importantes em no máximo 4 frases."
        },
        {
          role: "user",
          content: texto
        }
      ]
    })
  });

  if (!resposta.ok) {
    throw new Error("Falha ao gerar resumo");
  }

  const dados = await resposta.json();
  return dados.choices[0].message.content;
}

async function gerarQuiz(resumo) {
  const resposta = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: `Crie exatamente 3 perguntas de múltipla escolha sobre o texto a seguir, cada uma com 4 alternativas (apenas uma correta). Responda SOMENTE em formato JSON válido, sem nenhum texto antes ou depois, seguindo essa estrutura:
[
  {
    "pergunta": "texto da pergunta",
    "alternativas": ["alt 1", "alt 2", "alt 3", "alt 4"],
    "correta": 0
  }
]
O campo "correta" é o índice (0 a 3) da alternativa certa dentro do array.`
        },
        {
          role: "user",
          content: resumo
        }
      ]
    })
  });

  if (!resposta.ok) {
    throw new Error("Falha ao gerar quiz");
  }

  const dados = await resposta.json();
  const conteudo = dados.choices[0].message.content;

  return JSON.parse(conteudo);
}

function exibirResultado(resumo, perguntas) {
  // monta o bloco do resumo
  let html = `
    <div class="resumo-box">
      <h2>Resumo</h2>
      <p>${resumo}</p>
    </div>
  `;

  // monta cada card de pergunta
  perguntas.forEach((item, indice) => {
    html += `
      <div class="pergunta-card" data-indice="${indice}">
        <p>${indice + 1}. ${item.pergunta}</p>
        ${item.alternativas.map((alt, i) => `
          <button class="alternativa" data-correta="${item.correta}" data-selecionada="${i}">
            ${alt}
          </button>
        `).join("")}
      </div>
    `;
  });

  resultado.innerHTML = html;

  // depois de montar o HTML, adiciona o comportamento de clique em cada alternativa
  document.querySelectorAll(".alternativa").forEach(botao => {
    botao.addEventListener("click", verificarResposta);
  });
}

function verificarResposta(evento) {
  const botaoClicado = evento.target;
  const card = botaoClicado.closest(".pergunta-card");
  const correta = parseInt(botaoClicado.dataset.correta);
  const selecionada = parseInt(botaoClicado.dataset.selecionada);

  // desabilita todos os botões dessa pergunta pra não deixar clicar de novo
  const todosBotoes = card.querySelectorAll(".alternativa");
  todosBotoes.forEach(btn => btn.disabled = true);

  if (selecionada === correta) {
    botaoClicado.classList.add("correta");
  } else {
    botaoClicado.classList.add("incorreta");
    // mostra qual era a certa, já que o usuário errou
    todosBotoes[correta].classList.add("correta");
  }
}