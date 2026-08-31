export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  const { texto } = req.body;

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
          content: "Você resume textos de forma clara e objetiva, em português, mantendo as informações mais importantes em no máximo 4 frases."
        },
        {
          role: "user",
          content: texto
        }
      ]
    })
  });

  const dados = await resposta.json();
  res.status(200).json({ resumo: dados.choices[0].message.content });
}