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

// versão temporária só pra testar - depois substituímos pela de verdade
function exibirResultado(resumo, perguntas) {
  console.log("RESUMO:", resumo);
  console.log("PERGUNTAS:", perguntas);
  resultado.innerHTML = `<div class="resumo-box"><p>Testando... veja o console (F12)</p></div>`;
}