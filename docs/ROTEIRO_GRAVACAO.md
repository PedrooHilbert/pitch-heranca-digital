# Roteiro de gravação da narração — Herança Digital (v2)

> Gerado de `src/data/narracao.ts` (rode `npm run roteiro` se o texto mudar).
> Total: 34 frases · 426 palavras · ritmo-alvo 160–170 palavras/min (≈ 2 min 40 s de fala).

## Guia rápido de gravação
1. **Lugar:** o mais silencioso possível. Grave num cômodo com tecido (guarda-roupa aberto, cobertor nas costas, sofá). Nada de ventilador/ar-condicionado.
2. **Celular a ~20 cm da boca**, um pouco de lado (evita o "p" estourar). Use o gravador de voz do celular (qualidade alta) ou o computador com fone com microfone.
3. **Uma frase por arquivo**, com o nome do `id` (ex.: `s01_01.m4a`). Deixe ~0,5 s de silêncio antes e depois — o script corta.
4. **Grave 3 tomadas** de cada frase e escolha a melhor. Se errar, recomece a frase inteira.
5. **Sem música de fundo.** Fale com sorriso, confiante e caloroso, ritmo médio-rápido. Pausas curtas nas vírgulas.
6. Ênfases principais: **"quem fica"**, **"três partes"**, **"só a sua parte"**, **"Desfazer"**.
7. Coloque os arquivos em `video/gravacoes/` (wav, mp3, m4a, ogg ou flac) e rode:
   ```
   npm run voz:importar
   ```
   Isso corta silêncio (deixa 80 ms), remove cliques, normaliza para −16 LUFS, mede a duração real, alinha palavra por palavra (whisper, se instalado) e refaz timeline, legendas, efeitos e trilha. Depois: `npm run render`.
8. Pode misturar: frases gravadas substituem as sintéticas; as que faltarem continuam com a voz sintética.

## Frases
| id | Cena | Texto | Dica de entonação | Duração atual (voz sintética) |
|---|---|---|---|---|
| `s01_01` | Abertura | Quando você morrer… | Grave e lento, quase sussurrado. Segure as reticências. | 1.1 s |
| `s01_02` | Abertura | quem fica com o seu Instagram? | Pergunta direta, olhando pra plateia. Ênfase em "quem fica". | 1.7 s |
| `s01_03` | Abertura | Com o seu e-mail? | Curta, subindo a entonação. | 1.1 s |
| `s01_04` | Abertura | Com as suas criptomoedas? | Mais forte que a anterior (é o fim da escalada). | 1.9 s |
| `s01_05` | Abertura | Somos o grupo EternaByte, e esta é a Herança Digital. | Depois do silêncio, voz aberta, sorriso na voz. Ênfase em "Herança Digital". | 3.7 s |
| `s02_01` | Problema | Hoje quase todo mundo tem e-mail, redes sociais, banco digital, criptomoedas, fotos na nuvem e assinaturas. | Lista rápida, em ritmo de enumeração. | 7.2 s |
| `s02_02` | Problema | Quando a pessoa morre, a família não sabe o que existe, não tem as senhas, e não sabe o que ela queria. | Mais séria. Pequena pausa em cada vírgula (três golpes). | 5.6 s |
| `s02_03` | Problema | Resultado: bens com valor perdidos, assinaturas cobrando para sempre e perfis virando alvo de golpe. | "Resultado:" com pausa. Final firme. | 6.3 s |
| `s03_01` | Proposta de valor | A Herança Digital é um cofre onde você organiza, em vida, tudo o que tem no mundo digital. | Virada para o positivo. Voz mais aberta. | 5.5 s |
| `s03_02` | Proposta de valor | Juntamos três coisas: um inventário dos seus ativos, um cofre de acessos criptografado, | Ênfase em "três coisas". Não feche a frase (continua). | 5.8 s |
| `s03_03` | Proposta de valor | e uma liberação que só vale pelo caminho legal: inventário em cartório ou na justiça. | Ênfase em "caminho legal". | 5.1 s |
| `s04_01` | Como funciona | Em vida, o titular cadastra os ativos e escolhe o destino de cada um. | Didático, ritmo médio. | 4.6 s |
| `s04_02` | Como funciona | No falecimento, o cofre é congelado. | Mais lento e grave. Pausa depois. | 2.5 s |
| `s04_03` | Como funciona | Só depois do inventário e de um prazo para contestação, cada herdeiro recebe apenas a sua parte. | Ênfase em "só a sua parte" ("apenas a sua parte"). | 5.8 s |
| `s05_01` | Demo do protótipo | Este é o protótipo. | Curta e animada, como quem abre a cortina. | 1.4 s |
| `s05_02` | Demo do protótipo | O titular entra com a chave de acesso do celular e vê o que falta para o plano ficar completo. | Natural, descrevendo a tela. | 4.9 s |
| `s05_03` | Demo do protótipo | No inventário, cada ativo (redes sociais, e-mails, cripto, assinaturas) recebe um destino: pessoal, patrimonial ou encerrar. | Parênteses mais baixo e rápido. Ênfase nos três destinos. | 9.2 s |
| `s05_04` | Demo do protótipo | Depois, ele escolhe os herdeiros e define a carência: quinze, trinta, sessenta ou noventa dias. | Os números bem marcados, um por um. | 6.3 s |
| `s05_05` | Demo do protótipo | Quando o titular falece, o herdeiro abre o pedido com a certidão de óbito, o documento do inventário e uma selfie para confirmar a identidade. | Frase longa: respire antes. Ênfase em "selfie". | 8.0 s |
| `s05_06` | Demo do protótipo | A equipe valida, todos são avisados e podem contestar. | Três ações, ritmo firme. | 3.6 s |
| `s05_07` | Demo do protótipo | Terminado o prazo, cada herdeiro vê só o que foi destinado a ele, com instruções para cada ativo. | Ênfase em "só o que foi destinado a ele". | 5.7 s |
| `s06_01` | Segurança | Segurança é o coração do produto. | Pausa dramática depois. Voz mais baixa e confiante. | 2.3 s |
| `s06_02` | Segurança | O conteúdo é cifrado no aparelho do titular. | Claro e técnico. | 2.6 s |
| `s06_03` | Segurança | A chave de sucessão é dividida em três partes, e duas são necessárias para abri-la: nem a empresa consegue abrir o cofre sozinha. | Ênfase forte em "três partes" e "nem a empresa". | 7.3 s |
| `s06_04` | Segurança | Mudanças críticas, como remover um herdeiro, geram um alerta: Não foi você? Desfazer. | "Não foi você?" como pergunta. "Desfazer" com ênfase. | 6.3 s |
| `s07_01` | Concorrência | Gerenciadores de senha resolvem o dia a dia, não a sucessão. | Contraste: "dia a dia" × "sucessão". | 4.0 s |
| `s07_02` | Concorrência | Os contatos de legado de Google, Apple e Meta cobrem só a própria plataforma. | Neutro, sem desdenhar. | 4.9 s |
| `s07_03` | Concorrência | A Herança Digital reúne tudo em um só lugar, seguindo o rito legal brasileiro. | Confiante. Ênfase em "tudo em um só lugar". | 4.9 s |
| `s08_01` | Modelo de negócio | Em vida, é gratuito. | Curta e clara, sorriso na voz. Ênfase em "gratuito". | 1.8 s |
| `s08_02` | Modelo de negócio | Só na liberação há uma taxa única, a definir, com isenção prevista para quem não puder pagar. | Transparente e tranquila. Pequena pausa em "a definir". | 6.0 s |
| `s08_03` | Modelo de negócio | Escritórios, cartórios e governo entram como parceiros previstos. | Confiante. Ênfase leve em "previstos". | 4.5 s |
| `s09_01` | Equipe e fechamento | Somos um projeto de faculdade; escritórios, cartórios e verificação de identidade são parceiros previstos. | Honesto. Ênfase em "previstos". | 6.7 s |
| `s09_02` | Equipe e fechamento | Próximos passos: validar com um advogado de sucessões, ouvir usuários e construir o MVP. | Três passos, energia subindo. | 6.2 s |
| `s09_03` | Equipe e fechamento | Herança Digital: seus dados, sua história, seu futuro. | Slogan devagar, uma pausa por vírgula, final firme (é a última fala do vídeo). | 4.2 s |

## Pronúncia (só para voz sintética)
"MVP" → "ême vê pê" · "UC HUB" → "U-Cê Rabi" · "OAB" → "ó á bê" · "gov.br" → "gov ponto bê érre" · "LGPD" → "éle gê pê dê" (`src/data/pronuncia.ts`).
