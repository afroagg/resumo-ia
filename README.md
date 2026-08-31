# ResumoIA

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

Cole um texto e o ResumoIA gera um resumo automático e monta um quiz de múltipla escolha em cima dele, tudo usando IA. Dá pra responder, ver o que acertou e errou (com explicação), e gerar quantas rodadas de perguntas quiser sobre o mesmo texto.

A ideia surgiu pensando em quem estuda por conta própria e precisa revisar conteúdo rápido, tipo resumir um capítulo de livro, um artigo ou material de aula e já testar se aprendeu de verdade.

🔗 **[Testar o app](https://resumo-ia-azure.vercel.app)**

---

## O que ele faz

O app funciona em duas etapas: primeiro resume o texto que você colou, depois usa esse resumo pra criar 3 perguntas com 4 alternativas cada. Se você errar uma questão, aparece uma explicação de por que a resposta certa é a certa. Dá pra gerar novos quizzes sobre o mesmo resumo e navegar entre eles sem perder as respostas que já deu.

## Tecnologias

`HTML5` · `CSS3` · `JavaScript` · `API da Groq (openai/gpt-oss-20b)` · `Vercel Functions` · `Git/GitHub`

## Rodando localmente

Clone o repositório:

```
git clone https://github.com/afroagg/resumo-ia.git
```

Crie um arquivo `.env` na raiz do projeto com sua chave da API (gratuita em console.groq.com):

```
GROQ_API_KEY=sua_chave_aqui
```

Depois, com a Vercel CLI instalada, rode:

```
vercel dev
```

## Próximas ideias

- Sugestão de tópicos relacionados ao assunto do texto, pra continuar estudando
- Upload de PDF/TXT em vez de só colar o texto
- Suporte a outros idiomas
- Salvar histórico entre sessões

---

Feito por [Agatha Rodrigues](https://www.linkedin.com/in/agatha-carolina-rodrigues-887567250)
