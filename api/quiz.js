export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  const { resumo } = req.body;

  const resposta = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: `Crie exatamente 3 perguntas de múltipla escolha sobre o texto a seguir, cada uma com 4 alternativas (apenas uma correta) e uma breve explicação da resposta certa. Responda SOMENTE em formato JSON válido, sem nenhum texto antes ou depois, seguindo essa estrutura:
[
  {
    "pergunta": "texto da pergunta",
    "alternativas": ["alt 1", "alt 2", "alt 3", "alt 4"],
    "correta": 0,
    "explicacao": "breve explicação de por que essa é a resposta certa"
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

  const dados = await resposta.json();
  const conteudo = dados.choices[0].message.content;
  res.status(200).json({ perguntas: JSON.parse(conteudo) });
}