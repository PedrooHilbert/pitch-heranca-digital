// ARQUIVO GERADO de src/data/project.json por scripts/gerar-studio.mjs — não edite à mão.
// É aqui que o botão "Salvar" do painel de props do Remotion Studio grava; com `npm run dev`
// aberto, as mudanças são validadas e copiadas de volta para o project.json automaticamente.
import React from "react";
import { Composition } from "remotion";
import { PitchHerancaDigital } from "../PitchHerancaDigital";
import { projetoSchema, LIMITE_QUADROS, type Projeto } from "../data/schema";

export const ComposicaoPitch: React.FC = () => (
  <Composition
    id="PitchHerancaDigital"
    component={PitchHerancaDigital}
    schema={projetoSchema}
    fps={30}
    width={1920}
    height={1080}
    durationInFrames={5400}
    calculateMetadata={({ props }) => {
      const total = (props as Projeto).cenas.reduce((a, c) => a + c.dur, 0);
      if (total > LIMITE_QUADROS) throw new Error(`Duração total ${total} q passa de ${LIMITE_QUADROS} (180 s).`);
      return { durationInFrames: total };
    }}
    defaultProps={{
      "versao": 3,
      "fps": 30,
      "largura": 1920,
      "altura": 1080,
      "bpm": 112.5,
      "framesPorBatida": 16,
      "vozSintetica": "pt-BR-ThalitaMultilingualNeural",
      "equipe": {
        "marca": "Herança Digital",
        "nomeDoGrupo": "EternaByte",
        "disciplina": "Projeto UC HUB · Sprint 2",
        "contato": "",
        "membros": [
          {
            "nome": "Christhopher",
            "funcao": ""
          },
          {
            "nome": "Pedro Hilbert",
            "funcao": ""
          },
          {
            "nome": "Matheus Victor",
            "funcao": ""
          },
          {
            "nome": "Daniel Almeida",
            "funcao": ""
          }
        ],
        "logoSimbolo": "brand/logo-simbolo-menta-fundo-escuro.png",
        "slogan": "Seus dados, sua história, seu futuro."
      },
      "tema": {
        "teal900": "#0B3F3D",
        "teal800": "#07302F",
        "teal700": "#0E5A57",
        "teal600": "#14706B",
        "teal400": "#2FA79A",
        "mint": "#7FD1C5",
        "mintSoft": "#CFE3DF",
        "mintSoft2": "#A9C7C2",
        "tealTint": "#E2F0ED",
        "bg": "#F3F6F4",
        "bg2": "#E9F1EE",
        "card": "#FFFFFF",
        "cardBorder": "#DCE3E0",
        "ink": "#13211F",
        "ink2": "#44544F",
        "ink3": "#5E6E69",
        "amber": "#B45309",
        "amberBg": "#FFF3D6",
        "amberBorder": "#F5C86B",
        "green": "#15803D",
        "greenBg": "#E3F4E8",
        "blue": "#1E4E6B",
        "blueBg": "#D7E9F5",
        "red": "#B42318",
        "white": "#FFFFFF"
      },
      "audio": {
        "voz": {
          "ativo": true,
          "ganhoDb": 0
        },
        "trilha": {
          "ativo": true,
          "ganhoDb": 1.5,
          "duckingDb": -8.5
        },
        "sfx": {
          "ativo": true,
          "ganhoDb": -1.5
        }
      },
      "cenas": [
        {
          "id": "s1",
          "nome": "Abertura",
          "dur": 368,
          "fundos": {
            "gancho": "preto",
            "estouro": "escuro",
            "logo": "escuro"
          },
          "textos": {
            "gancho": "QUANDO VOCÊ MORRER…",
            "pergunta1": "QUEM FICA COM O SEU *INSTAGRAM?*",
            "pergunta2": "COM O SEU *E-MAIL?*",
            "pergunta3": "COM AS SUAS *CRIPTOMOEDAS?*",
            "titulo": "Sua história também vive no *digital.*",
            "chip": "Squad"
          },
          "telas": {}
        },
        {
          "id": "s2",
          "nome": "Problema",
          "dur": 616,
          "fundos": {
            "lista": "claro",
            "semLista": "claro",
            "semSenhas": "escuro",
            "semInstrucoes": "claro",
            "resultado": "ambar"
          },
          "textos": {
            "chamada": "HOJE, QUASE TODO MUNDO TEM",
            "frase": "uma vida inteira no *digital*",
            "ativo1": "E-mail",
            "ativo2": "Redes sociais",
            "ativo3": "Banco digital",
            "ativo4": "Cripto",
            "ativo5": "Fotos na nuvem",
            "ativo6": "Assinaturas",
            "ativo7": "Domínios",
            "semLista": "Sem *lista.*",
            "semSenhas": "Sem *senhas.*",
            "campoSenha": "Senha do Gmail da mãe",
            "digitando": "digitando…",
            "senhaErro": "Senha incorreta. Conta bloqueada.",
            "carimbo": "TRANCADO",
            "semInstrucoes": "Sem *instruções.*",
            "resultado": "Resultado:",
            "card1Titulo": "Bens com valor perdidos",
            "card1Texto": "Cripto, milhas, perfis que geram renda — sem ninguém saber que existem.",
            "card2Titulo": "Assinaturas cobrando para sempre",
            "card2Itens": "Streaming, Armazenamento, Música, App de treino, Jornal",
            "card2Rotulo": "cobrando…",
            "card3Titulo": "Perfis abandonados",
            "card3Texto": "Ninguém mais cuida da conta.",
            "card3TituloAlerta": "Perfil virou alvo de golpe",
            "card3TextoAlerta": "⚠ Mensagens pedindo dinheiro em nome de quem já partiu."
          },
          "telas": {}
        },
        {
          "id": "s3",
          "nome": "Proposta de valor",
          "dur": 544,
          "fundos": {
            "abertura": "escuro",
            "t1": "claro",
            "t2": "escuro",
            "t3": "claro",
            "fecho": "claro"
          },
          "textos": {
            "abertura": "Um *cofre* para a sua vida digital",
            "pilares": "pilares numa plataforma só",
            "t1Titulo": "Inventário digital",
            "t1Sub": "A lista do que existe e o destino de cada item.",
            "t2Titulo": "Cofre de acessos",
            "t2Sub": "Senhas cifradas. Ninguém lê — nem a empresa.",
            "t3Titulo": "Liberação pela via legal",
            "t3Sub": "Só depois do inventário — na justiça ou em cartório.",
            "fecho": "Uma plataforma. Três *pilares.*",
            "card1": "Inventário digital",
            "card2": "Cofre de acessos",
            "card3": "Liberação via legal"
          },
          "telas": {
            "t1": {
              "tela": "Inventario",
              "regioes": [
                0,
                2,
                3,
                5,
                7,
                6
              ]
            },
            "t2": {
              "tela": "Confirmar",
              "regioes": [
                0
              ]
            },
            "t3": {
              "tela": "Regras",
              "regioes": [
                0,
                2,
                3,
                4,
                5,
                6
              ]
            }
          }
        },
        {
          "id": "s4",
          "nome": "Como funciona",
          "dur": 432,
          "fundos": {
            "trilho": "claro"
          },
          "textos": {
            "estacao1": "Em vida",
            "estacao2": "Falecimento",
            "estacao3": "Liberação",
            "ativo1": "Instagram",
            "destino1": "Memorial",
            "ativo2": "E-mail",
            "destino2": "Entregar ao Lucas",
            "ativo3": "Criptomoedas",
            "destino3": "Conforme a partilha",
            "carimbo": "COFRE CONGELADO",
            "passo1": "Pedido",
            "passo2": "Validação",
            "passo3": "Carência",
            "passo4": "Liberação",
            "carencia": "Carência:",
            "dias": "dias para contestar",
            "herdeiro1": "Lucas",
            "herdeiro2": "Ana",
            "herdeiro3": "Carlos",
            "suaParte": "só a sua parte",
            "diasOk": "dias ✓"
          },
          "telas": {
            "aviso": {
              "tela": "AvisoObito",
              "regioes": [
                0,
                1
              ]
            }
          }
        },
        {
          "id": "s5",
          "nome": "Demo do protótipo",
          "dur": 1240,
          "fundos": {
            "demo": "claro"
          },
          "textos": {
            "abertura": "Este é o *protótipo.*",
            "selo": "PROTÓTIPO",
            "etapa": "etapa {n} de 7",
            "digitalOk": "Digital reconhecida",
            "anel": "itens\nconcluídos",
            "contador1": "ativos",
            "contador2": "herdeiros",
            "contador3": "com destino",
            "contador4": "sem destino",
            "donut1": "Entrega direta",
            "donut2": "Conforme a partilha",
            "donut3": "Encerrar ou apagar",
            "donut4": "Sem destino",
            "alertaSemDestino": "2 ativos sem destino",
            "tipo1": "Redes sociais",
            "tipo2": "E-mails",
            "tipo3": "Cripto",
            "tipo4": "Assinaturas",
            "rotulo": "X (Twitter): sem destino",
            "destino1": "Pessoal",
            "destino1Sub": "memorial, apagar, entregar",
            "destino2": "Patrimonial",
            "destino2Sub": "tem valor: entra no inventário",
            "destino3": "Encerrar",
            "destino3Sub": "fechar a conta",
            "herdeiro1": "Lucas Souza",
            "parentesco1": "Filho",
            "herdeiro2": "Ana Souza",
            "parentesco2": "Filha",
            "herdeiro3": "Carlos Souza",
            "parentesco3": "Irmão",
            "herdeiroRotulo": "herdeiro",
            "carencia": "Carência",
            "dias": "dias",
            "check1": "Certidão de óbito",
            "check2": "Documento do inventário",
            "check3": "Identidade confirmada",
            "selfie": "selfie",
            "aviso1": "Lucas foi avisado",
            "aviso2": "Ana foi avisada",
            "aviso3": "Carlos foi avisado",
            "carimbo": "LIBERAÇÃO SUSPENSA",
            "senha": "Senha:",
            "senhaValor": "exemplo-1234",
            "copiar": "Copiar",
            "copiado": "Copiado",
            "item1": "Instagram",
            "item1Sub": "manter como memorial",
            "item2": "Item de outro herdeiro",
            "item2Sub": "só a parte dele",
            "item3": "Item de outro herdeiro",
            "item3Sub": "só a parte dele",
            "item4": "Domínio",
            "item4Sub": "conforme a partilha"
          },
          "telas": {
            "login": {
              "tela": "Main",
              "regioes": [
                0,
                1
              ]
            },
            "inicio": {
              "tela": "Dashboard",
              "regioes": [
                0,
                2,
                3,
                5,
                6,
                8,
                9
              ]
            },
            "ativos": {
              "tela": "Inventario",
              "regioes": [
                0,
                2,
                3,
                4,
                7
              ]
            },
            "novo": {
              "tela": "NovoAtivo",
              "regioes": [
                0,
                2,
                3,
                4
              ]
            },
            "herdeiros": {
              "tela": "Herdeiros",
              "regioes": [
                0,
                2,
                3,
                4,
                6,
                7
              ]
            },
            "regras": {
              "tela": "Regras",
              "regioes": [
                0,
                2,
                3,
                4,
                5,
                6
              ]
            },
            "pedido": {
              "tela": "AbrirPedido",
              "regioes": [
                0,
                1,
                2,
                3
              ]
            },
            "acompanhar": {
              "tela": "Solicitacao",
              "regioes": [
                0,
                1,
                2,
                3
              ]
            },
            "contestar": {
              "tela": "Contestacao",
              "regioes": [
                0,
                1
              ]
            },
            "acesso": {
              "tela": "AcessoLiberado",
              "regioes": [
                0,
                1,
                2
              ]
            },
            "celular": {
              "tela": "Mobile-Acesso",
              "regioes": [
                1,
                2
              ]
            }
          }
        },
        {
          "id": "s6",
          "nome": "Segurança",
          "dur": 608,
          "fundos": {
            "seguranca": "escuro"
          },
          "textos": {
            "titulo": "Segurança é o *coração* do produto.",
            "cifrado": "*Cifrado* no aparelho.",
            "aparelho": "Aparelho do titular",
            "linha1": "Gmail: maria@exemplo",
            "linha2": "Senha: ••••••••",
            "linha3": "Instruções: memorial",
            "servidor": "Servidor",
            "ilegivel": "só conteúdo ilegível",
            "chave": "A *chave* de sucessão",
            "sozinha": "Nem a empresa abre *sozinha.*",
            "parte1": "Plataforma (HSM)",
            "parte2": "Custodiante independente",
            "parte3": "Cópia offline",
            "deTres": "de 3",
            "alerta": "Mudança crítica? *Alerta* na hora.",
            "herdeira": "Ana Souza",
            "herdeiraSub": "herdeira · 2 ativos",
            "restaurada": "restaurada"
          },
          "telas": {
            "alerta": {
              "tela": "Seguranca",
              "regioes": [
                5
              ]
            }
          }
        },
        {
          "id": "s7",
          "nome": "Concorrência",
          "dur": 456,
          "fundos": {
            "tabela": "claro"
          },
          "textos": {
            "titulo": "Por que não só um *gerenciador* de senhas?",
            "col1": "Gerenciadores de senha",
            "col1Sub": "Bitwarden, 1Password",
            "col2": "Contatos de legado",
            "col2Sub": "Google · Apple · Meta",
            "col3": "Herança Digital",
            "col3Sub": "nossa proposta",
            "linha1": "Inventário de todos os ativos",
            "linha1Marcas": "parcial, nao, sim",
            "linha2": "Funciona entre plataformas",
            "linha2Marcas": "sim, nao, sim",
            "linha3": "Segue o rito legal brasileiro",
            "linha3Marcas": "nao, nao, sim",
            "linha4": "Entrega por herdeiro, com auditoria",
            "linha4Marcas": "nao, parcial, sim",
            "rodape": "Comparação conceitual — a validar com pesquisa de mercado."
          },
          "telas": {}
        },
        {
          "id": "s8",
          "nome": "Modelo de negócio",
          "dur": 480,
          "fundos": {
            "negocio": "escuro"
          },
          "textos": {
            "chamada": "COMO O PROJETO SE SUSTENTA",
            "pilula1": "Assinatura anual do titular",
            "pilula1Sub": "plano grátis + plano completo",
            "pilula2": "Taxa na liberação",
            "pilula2Sub": "paga pelo espólio / herdeiros",
            "pilula3": "Plano para escritórios",
            "pilula3Sub": "advogados de sucessões",
            "pilula4": "Parceria com cartórios",
            "pilula4Sub": "repasse por cofre ativo",
            "pilula5": "Bancos, seguradoras, planos funerários",
            "pilula5Sub": "canais de venda",
            "previsto": "PREVISTO",
            "valores": "Valores a definir após pesquisa com usuários."
          },
          "telas": {}
        },
        {
          "id": "s9",
          "nome": "Equipe e fechamento",
          "dur": 656,
          "fundos": {
            "equipe": "claro",
            "passos": "claro",
            "fim": "escuro"
          },
          "textos": {
            "quemSomos": "Quem somos",
            "chip": "Projeto de faculdade · UC HUB · Sprint 2",
            "parceiro1": "Escritórios",
            "parceiro2": "Cartórios",
            "parceiro3": "Verificação de identidade",
            "previsto": "PREVISTO",
            "passosTitulo": "Próximos *passos*",
            "passo1": "Validar com um advogado de sucessões",
            "passo1Sub": "a lista de pontos legais em aberto",
            "passo2": "Ouvir usuários",
            "passo2Sub": "preço, carência e primeiro público",
            "passo3": "Construir o MVP",
            "passo3Sub": "login, inventário, cofre cifrado, herdeiros, liberação, auditoria",
            "slogan": "Seus dados, sua história, seu *futuro.*",
            "obrigado": "Obrigado!"
          },
          "telas": {}
        }
      ],
      "frases": [
        {
          "id": "s01_01",
          "cena": "s1",
          "texto": "Quando você morrer…",
          "fonte": "sintetica",
          "src": "audio/voz/s01_01.mp3",
          "dur": 36,
          "inicio": 14,
          "palavras": [
            {
              "w": "Quando",
              "de": 16,
              "ate": 23
            },
            {
              "w": "você",
              "de": 23,
              "ate": 31
            },
            {
              "w": "morrer…",
              "de": 31,
              "ate": 46
            }
          ]
        },
        {
          "id": "s01_02",
          "cena": "s1",
          "texto": "quem fica com o seu Instagram?",
          "fonte": "sintetica",
          "src": "audio/voz/s01_02.mp3",
          "dur": 51,
          "inicio": 53,
          "palavras": [
            {
              "w": "quem",
              "de": 55,
              "ate": 60
            },
            {
              "w": "fica",
              "de": 60,
              "ate": 72
            },
            {
              "w": "com",
              "de": 72,
              "ate": 76
            },
            {
              "w": "o",
              "de": 76,
              "ate": 77
            },
            {
              "w": "seu",
              "de": 77,
              "ate": 84
            },
            {
              "w": "Instagram?",
              "de": 84,
              "ate": 101
            }
          ]
        },
        {
          "id": "s01_03",
          "cena": "s1",
          "texto": "Com o seu e-mail?",
          "fonte": "sintetica",
          "src": "audio/voz/s01_03.mp3",
          "dur": 36,
          "inicio": 107,
          "palavras": [
            {
              "w": "Com",
              "de": 109,
              "ate": 115
            },
            {
              "w": "o",
              "de": 115,
              "ate": 116
            },
            {
              "w": "seu",
              "de": 116,
              "ate": 123
            },
            {
              "w": "e-mail?",
              "de": 123,
              "ate": 139
            }
          ]
        },
        {
          "id": "s01_04",
          "cena": "s1",
          "texto": "Com as suas criptomoedas?",
          "fonte": "sintetica",
          "src": "audio/voz/s01_04.mp3",
          "dur": 58,
          "inicio": 146,
          "palavras": [
            {
              "w": "Com",
              "de": 148,
              "ate": 154
            },
            {
              "w": "as",
              "de": 154,
              "ate": 158
            },
            {
              "w": "suas",
              "de": 158,
              "ate": 166
            },
            {
              "w": "criptomoedas?",
              "de": 166,
              "ate": 200
            }
          ]
        },
        {
          "id": "s01_05",
          "cena": "s1",
          "texto": "Somos o grupo EternaByte, e esta é a Herança Digital.",
          "fonte": "sintetica",
          "src": "audio/voz/s01_05.mp3",
          "dur": 110,
          "inicio": 246,
          "palavras": [
            {
              "w": "Somos",
              "de": 248,
              "ate": 259
            },
            {
              "w": "o",
              "de": 259,
              "ate": 263
            },
            {
              "w": "grupo",
              "de": 263,
              "ate": 273
            },
            {
              "w": "EternaByte,",
              "de": 273,
              "ate": 299
            },
            {
              "w": "e",
              "de": 304,
              "ate": 307
            },
            {
              "w": "esta",
              "de": 307,
              "ate": 317
            },
            {
              "w": "é",
              "de": 317,
              "ate": 320
            },
            {
              "w": "a",
              "de": 320,
              "ate": 323
            },
            {
              "w": "Herança",
              "de": 323,
              "ate": 336
            },
            {
              "w": "Digital.",
              "de": 336,
              "ate": 352
            }
          ]
        },
        {
          "id": "s02_01",
          "cena": "s2",
          "texto": "Hoje quase todo mundo tem e-mail, redes sociais, banco digital, criptomoedas, fotos na nuvem e assinaturas.",
          "fonte": "sintetica",
          "src": "audio/voz/s02_01.mp3",
          "dur": 217,
          "inicio": 8,
          "palavras": [
            {
              "w": "Hoje",
              "de": 10,
              "ate": 17
            },
            {
              "w": "quase",
              "de": 17,
              "ate": 27
            },
            {
              "w": "todo",
              "de": 27,
              "ate": 32
            },
            {
              "w": "mundo",
              "de": 32,
              "ate": 41
            },
            {
              "w": "tem",
              "de": 41,
              "ate": 46
            },
            {
              "w": "e-mail,",
              "de": 46,
              "ate": 59
            },
            {
              "w": "redes",
              "de": 64,
              "ate": 71
            },
            {
              "w": "sociais,",
              "de": 71,
              "ate": 91
            },
            {
              "w": "banco",
              "de": 96,
              "ate": 106
            },
            {
              "w": "digital,",
              "de": 106,
              "ate": 125
            },
            {
              "w": "criptomoedas,",
              "de": 129,
              "ate": 155
            },
            {
              "w": "fotos",
              "de": 161,
              "ate": 172
            },
            {
              "w": "na",
              "de": 172,
              "ate": 178
            },
            {
              "w": "nuvem",
              "de": 178,
              "ate": 193
            },
            {
              "w": "e",
              "de": 193,
              "ate": 196
            },
            {
              "w": "assinaturas.",
              "de": 196,
              "ate": 221
            }
          ]
        },
        {
          "id": "s02_02",
          "cena": "s2",
          "texto": "Quando a pessoa morre, a família não sabe o que existe, não tem as senhas, e não sabe o que ela queria.",
          "fonte": "sintetica",
          "src": "audio/voz/s02_02.mp3",
          "dur": 167,
          "inicio": 231,
          "palavras": [
            {
              "w": "Quando",
              "de": 233,
              "ate": 238
            },
            {
              "w": "a",
              "de": 238,
              "ate": 239
            },
            {
              "w": "pessoa",
              "de": 239,
              "ate": 249
            },
            {
              "w": "morre,",
              "de": 249,
              "ate": 261
            },
            {
              "w": "a",
              "de": 267,
              "ate": 269
            },
            {
              "w": "família",
              "de": 269,
              "ate": 280
            },
            {
              "w": "não",
              "de": 280,
              "ate": 285
            },
            {
              "w": "sabe",
              "de": 285,
              "ate": 295
            },
            {
              "w": "o",
              "de": 295,
              "ate": 296
            },
            {
              "w": "que",
              "de": 297,
              "ate": 299
            },
            {
              "w": "existe,",
              "de": 299,
              "ate": 314
            },
            {
              "w": "não",
              "de": 320,
              "ate": 326
            },
            {
              "w": "tem",
              "de": 326,
              "ate": 334
            },
            {
              "w": "as",
              "de": 334,
              "ate": 337
            },
            {
              "w": "senhas,",
              "de": 337,
              "ate": 350
            },
            {
              "w": "e",
              "de": 356,
              "ate": 358
            },
            {
              "w": "não",
              "de": 358,
              "ate": 365
            },
            {
              "w": "sabe",
              "de": 365,
              "ate": 375
            },
            {
              "w": "o",
              "de": 375,
              "ate": 376
            },
            {
              "w": "que",
              "de": 376,
              "ate": 378
            },
            {
              "w": "ela",
              "de": 378,
              "ate": 382
            },
            {
              "w": "queria.",
              "de": 382,
              "ate": 395
            }
          ]
        },
        {
          "id": "s02_03",
          "cena": "s2",
          "texto": "Resultado: bens com valor perdidos, assinaturas cobrando para sempre e perfis virando alvo de golpe.",
          "fonte": "sintetica",
          "src": "audio/voz/s02_03.mp3",
          "dur": 191,
          "inicio": 404,
          "palavras": [
            {
              "w": "Resultado:",
              "de": 406,
              "ate": 427
            },
            {
              "w": "bens",
              "de": 435,
              "ate": 445
            },
            {
              "w": "com",
              "de": 445,
              "ate": 449
            },
            {
              "w": "valor",
              "de": 449,
              "ate": 458
            },
            {
              "w": "perdidos,",
              "de": 458,
              "ate": 479
            },
            {
              "w": "assinaturas",
              "de": 484,
              "ate": 503
            },
            {
              "w": "cobrando",
              "de": 503,
              "ate": 516
            },
            {
              "w": "para",
              "de": 516,
              "ate": 522
            },
            {
              "w": "sempre",
              "de": 522,
              "ate": 536
            },
            {
              "w": "e",
              "de": 536,
              "ate": 537
            },
            {
              "w": "perfis",
              "de": 536,
              "ate": 553
            },
            {
              "w": "virando",
              "de": 553,
              "ate": 566
            },
            {
              "w": "alvo",
              "de": 566,
              "ate": 575
            },
            {
              "w": "de",
              "de": 575,
              "ate": 578
            },
            {
              "w": "golpe.",
              "de": 578,
              "ate": 591
            }
          ]
        },
        {
          "id": "s03_01",
          "cena": "s3",
          "texto": "A Herança Digital é um cofre onde você organiza, em vida, tudo o que tem no mundo digital.",
          "fonte": "sintetica",
          "src": "audio/voz/s03_01.mp3",
          "dur": 164,
          "inicio": 10,
          "palavras": [
            {
              "w": "A",
              "de": 12,
              "ate": 16
            },
            {
              "w": "Herança",
              "de": 16,
              "ate": 27
            },
            {
              "w": "Digital",
              "de": 27,
              "ate": 46
            },
            {
              "w": "é",
              "de": 46,
              "ate": 48
            },
            {
              "w": "um",
              "de": 48,
              "ate": 52
            },
            {
              "w": "cofre",
              "de": 52,
              "ate": 61
            },
            {
              "w": "onde",
              "de": 61,
              "ate": 68
            },
            {
              "w": "você",
              "de": 68,
              "ate": 75
            },
            {
              "w": "organiza,",
              "de": 75,
              "ate": 97
            },
            {
              "w": "em",
              "de": 102,
              "ate": 107
            },
            {
              "w": "vida,",
              "de": 107,
              "ate": 120
            },
            {
              "w": "tudo",
              "de": 125,
              "ate": 132
            },
            {
              "w": "o",
              "de": 132,
              "ate": 133
            },
            {
              "w": "que",
              "de": 132,
              "ate": 136
            },
            {
              "w": "tem",
              "de": 136,
              "ate": 141
            },
            {
              "w": "no",
              "de": 141,
              "ate": 143
            },
            {
              "w": "mundo",
              "de": 143,
              "ate": 154
            },
            {
              "w": "digital.",
              "de": 154,
              "ate": 171
            }
          ]
        },
        {
          "id": "s03_02",
          "cena": "s3",
          "texto": "Juntamos três coisas: um inventário dos seus ativos, um cofre de acessos criptografado,",
          "fonte": "sintetica",
          "src": "audio/voz/s03_02.mp3",
          "dur": 175,
          "inicio": 180,
          "palavras": [
            {
              "w": "Juntamos",
              "de": 182,
              "ate": 198
            },
            {
              "w": "três",
              "de": 198,
              "ate": 209
            },
            {
              "w": "coisas:",
              "de": 209,
              "ate": 224
            },
            {
              "w": "um",
              "de": 233,
              "ate": 236
            },
            {
              "w": "inventário",
              "de": 236,
              "ate": 254
            },
            {
              "w": "dos",
              "de": 254,
              "ate": 257
            },
            {
              "w": "seus",
              "de": 257,
              "ate": 261
            },
            {
              "w": "ativos,",
              "de": 261,
              "ate": 279
            },
            {
              "w": "um",
              "de": 285,
              "ate": 289
            },
            {
              "w": "cofre",
              "de": 289,
              "ate": 301
            },
            {
              "w": "de",
              "de": 301,
              "ate": 303
            },
            {
              "w": "acessos",
              "de": 303,
              "ate": 318
            },
            {
              "w": "criptografado,",
              "de": 318,
              "ate": 351
            }
          ]
        },
        {
          "id": "s03_03",
          "cena": "s3",
          "texto": "e uma liberação que só vale pelo caminho legal: inventário em cartório ou na justiça.",
          "fonte": "sintetica",
          "src": "audio/voz/s03_03.mp3",
          "dur": 153,
          "inicio": 361,
          "palavras": [
            {
              "w": "e",
              "de": 363,
              "ate": 366
            },
            {
              "w": "uma",
              "de": 366,
              "ate": 369
            },
            {
              "w": "liberação",
              "de": 369,
              "ate": 389
            },
            {
              "w": "que",
              "de": 389,
              "ate": 391
            },
            {
              "w": "só",
              "de": 391,
              "ate": 397
            },
            {
              "w": "vale",
              "de": 397,
              "ate": 407
            },
            {
              "w": "pelo",
              "de": 407,
              "ate": 412
            },
            {
              "w": "caminho",
              "de": 412,
              "ate": 421
            },
            {
              "w": "legal:",
              "de": 421,
              "ate": 434
            },
            {
              "w": "inventário",
              "de": 441,
              "ate": 460
            },
            {
              "w": "em",
              "de": 460,
              "ate": 462
            },
            {
              "w": "cartório",
              "de": 462,
              "ate": 483
            },
            {
              "w": "ou",
              "de": 483,
              "ate": 488
            },
            {
              "w": "na",
              "de": 488,
              "ate": 492
            },
            {
              "w": "justiça.",
              "de": 492,
              "ate": 511
            }
          ]
        },
        {
          "id": "s04_01",
          "cena": "s4",
          "texto": "Em vida, o titular cadastra os ativos e escolhe o destino de cada um.",
          "fonte": "sintetica",
          "src": "audio/voz/s04_01.mp3",
          "dur": 138,
          "inicio": 8,
          "palavras": [
            {
              "w": "Em",
              "de": 10,
              "ate": 16
            },
            {
              "w": "vida,",
              "de": 16,
              "ate": 28
            },
            {
              "w": "o",
              "de": 34,
              "ate": 36
            },
            {
              "w": "titular",
              "de": 36,
              "ate": 52
            },
            {
              "w": "cadastra",
              "de": 52,
              "ate": 67
            },
            {
              "w": "os",
              "de": 67,
              "ate": 68
            },
            {
              "w": "ativos",
              "de": 67,
              "ate": 85
            },
            {
              "w": "e",
              "de": 85,
              "ate": 91
            },
            {
              "w": "escolhe",
              "de": 91,
              "ate": 104
            },
            {
              "w": "o",
              "de": 104,
              "ate": 106
            },
            {
              "w": "destino",
              "de": 106,
              "ate": 121
            },
            {
              "w": "de",
              "de": 121,
              "ate": 125
            },
            {
              "w": "cada",
              "de": 125,
              "ate": 136
            },
            {
              "w": "um.",
              "de": 136,
              "ate": 143
            }
          ]
        },
        {
          "id": "s04_02",
          "cena": "s4",
          "texto": "No falecimento, o cofre é congelado.",
          "fonte": "sintetica",
          "src": "audio/voz/s04_02.mp3",
          "dur": 77,
          "inicio": 152,
          "palavras": [
            {
              "w": "No",
              "de": 154,
              "ate": 158
            },
            {
              "w": "falecimento,",
              "de": 158,
              "ate": 183
            },
            {
              "w": "o",
              "de": 188,
              "ate": 191
            },
            {
              "w": "cofre",
              "de": 191,
              "ate": 202
            },
            {
              "w": "é",
              "de": 202,
              "ate": 203
            },
            {
              "w": "congelado.",
              "de": 203,
              "ate": 225
            }
          ]
        },
        {
          "id": "s04_03",
          "cena": "s4",
          "texto": "Só depois do inventário e de um prazo para contestação, cada herdeiro recebe apenas a sua parte.",
          "fonte": "sintetica",
          "src": "audio/voz/s04_03.mp3",
          "dur": 174,
          "inicio": 235,
          "palavras": [
            {
              "w": "Só",
              "de": 237,
              "ate": 243
            },
            {
              "w": "depois",
              "de": 243,
              "ate": 253
            },
            {
              "w": "do",
              "de": 253,
              "ate": 255
            },
            {
              "w": "inventário",
              "de": 255,
              "ate": 279
            },
            {
              "w": "e",
              "de": 279,
              "ate": 281
            },
            {
              "w": "de",
              "de": 281,
              "ate": 284
            },
            {
              "w": "um",
              "de": 284,
              "ate": 287
            },
            {
              "w": "prazo",
              "de": 287,
              "ate": 298
            },
            {
              "w": "para",
              "de": 298,
              "ate": 303
            },
            {
              "w": "contestação,",
              "de": 303,
              "ate": 330
            },
            {
              "w": "cada",
              "de": 334,
              "ate": 341
            },
            {
              "w": "herdeiro",
              "de": 341,
              "ate": 354
            },
            {
              "w": "recebe",
              "de": 354,
              "ate": 367
            },
            {
              "w": "apenas",
              "de": 367,
              "ate": 381
            },
            {
              "w": "a",
              "de": 381,
              "ate": 384
            },
            {
              "w": "sua",
              "de": 384,
              "ate": 390
            },
            {
              "w": "parte.",
              "de": 390,
              "ate": 405
            }
          ]
        },
        {
          "id": "s05_01",
          "cena": "s5",
          "texto": "Este é o protótipo.",
          "fonte": "sintetica",
          "src": "audio/voz/s05_01.mp3",
          "dur": 41,
          "inicio": 10,
          "palavras": [
            {
              "w": "Este",
              "de": 12,
              "ate": 22
            },
            {
              "w": "é",
              "de": 22,
              "ate": 23
            },
            {
              "w": "o",
              "de": 23,
              "ate": 25
            },
            {
              "w": "protótipo.",
              "de": 25,
              "ate": 48
            }
          ]
        },
        {
          "id": "s05_02",
          "cena": "s5",
          "texto": "O titular entra com a chave de acesso do celular e vê o que falta para o plano ficar completo.",
          "fonte": "sintetica",
          "src": "audio/voz/s05_02.mp3",
          "dur": 147,
          "inicio": 57,
          "palavras": [
            {
              "w": "O",
              "de": 59,
              "ate": 61
            },
            {
              "w": "titular",
              "de": 61,
              "ate": 77
            },
            {
              "w": "entra",
              "de": 77,
              "ate": 84
            },
            {
              "w": "com",
              "de": 84,
              "ate": 88
            },
            {
              "w": "a",
              "de": 88,
              "ate": 89
            },
            {
              "w": "chave",
              "de": 89,
              "ate": 98
            },
            {
              "w": "de",
              "de": 98,
              "ate": 101
            },
            {
              "w": "acesso",
              "de": 101,
              "ate": 113
            },
            {
              "w": "do",
              "de": 113,
              "ate": 116
            },
            {
              "w": "celular",
              "de": 116,
              "ate": 133
            },
            {
              "w": "e",
              "de": 133,
              "ate": 139
            },
            {
              "w": "vê",
              "de": 139,
              "ate": 145
            },
            {
              "w": "o",
              "de": 145,
              "ate": 147
            },
            {
              "w": "que",
              "de": 147,
              "ate": 150
            },
            {
              "w": "falta",
              "de": 150,
              "ate": 162
            },
            {
              "w": "para",
              "de": 162,
              "ate": 167
            },
            {
              "w": "o",
              "de": 167,
              "ate": 168
            },
            {
              "w": "plano",
              "de": 167,
              "ate": 175
            },
            {
              "w": "ficar",
              "de": 175,
              "ate": 183
            },
            {
              "w": "completo.",
              "de": 183,
              "ate": 200
            }
          ]
        },
        {
          "id": "s05_03",
          "cena": "s5",
          "texto": "No inventário, cada ativo (redes sociais, e-mails, cripto, assinaturas) recebe um destino: pessoal, patrimonial ou encerrar.",
          "fonte": "sintetica",
          "src": "audio/voz/s05_03.mp3",
          "dur": 278,
          "inicio": 210,
          "palavras": [
            {
              "w": "No",
              "de": 212,
              "ate": 216
            },
            {
              "w": "inventário,",
              "de": 216,
              "ate": 238
            },
            {
              "w": "cada",
              "de": 243,
              "ate": 250
            },
            {
              "w": "ativo",
              "de": 250,
              "ate": 264
            },
            {
              "w": "(redes",
              "de": 271,
              "ate": 282
            },
            {
              "w": "sociais,",
              "de": 282,
              "ate": 300
            },
            {
              "w": "e-mails,",
              "de": 306,
              "ate": 324
            },
            {
              "w": "cripto,",
              "de": 329,
              "ate": 342
            },
            {
              "w": "assinaturas)",
              "de": 347,
              "ate": 371
            },
            {
              "w": "recebe",
              "de": 377,
              "ate": 388
            },
            {
              "w": "um",
              "de": 388,
              "ate": 389
            },
            {
              "w": "destino:",
              "de": 389,
              "ate": 405
            },
            {
              "w": "pessoal,",
              "de": 411,
              "ate": 430
            },
            {
              "w": "patrimonial",
              "de": 435,
              "ate": 462
            },
            {
              "w": "ou",
              "de": 462,
              "ate": 468
            },
            {
              "w": "encerrar.",
              "de": 468,
              "ate": 484
            }
          ]
        },
        {
          "id": "s05_04",
          "cena": "s5",
          "texto": "Depois, ele escolhe os herdeiros e define a carência: quinze, trinta, sessenta ou noventa dias.",
          "fonte": "sintetica",
          "src": "audio/voz/s05_04.mp3",
          "dur": 189,
          "inicio": 494,
          "palavras": [
            {
              "w": "Depois,",
              "de": 496,
              "ate": 512
            },
            {
              "w": "ele",
              "de": 519,
              "ate": 523
            },
            {
              "w": "escolhe",
              "de": 523,
              "ate": 533
            },
            {
              "w": "os",
              "de": 533,
              "ate": 534
            },
            {
              "w": "herdeiros",
              "de": 534,
              "ate": 551
            },
            {
              "w": "e",
              "de": 551,
              "ate": 554
            },
            {
              "w": "define",
              "de": 554,
              "ate": 565
            },
            {
              "w": "a",
              "de": 565,
              "ate": 566
            },
            {
              "w": "carência:",
              "de": 566,
              "ate": 581
            },
            {
              "w": "quinze,",
              "de": 588,
              "ate": 602
            },
            {
              "w": "trinta,",
              "de": 607,
              "ate": 619
            },
            {
              "w": "sessenta",
              "de": 626,
              "ate": 646
            },
            {
              "w": "ou",
              "de": 646,
              "ate": 649
            },
            {
              "w": "noventa",
              "de": 649,
              "ate": 664
            },
            {
              "w": "dias.",
              "de": 664,
              "ate": 679
            }
          ]
        },
        {
          "id": "s05_05",
          "cena": "s5",
          "texto": "Quando o titular falece, o herdeiro abre o pedido com a certidão de óbito, o documento do inventário e uma selfie para confirmar a identidade.",
          "fonte": "sintetica",
          "src": "audio/voz/s05_05.mp3",
          "dur": 240,
          "inicio": 689,
          "palavras": [
            {
              "w": "Quando",
              "de": 691,
              "ate": 696
            },
            {
              "w": "o",
              "de": 696,
              "ate": 697
            },
            {
              "w": "titular",
              "de": 697,
              "ate": 708
            },
            {
              "w": "falece,",
              "de": 708,
              "ate": 726
            },
            {
              "w": "o",
              "de": 731,
              "ate": 734
            },
            {
              "w": "herdeiro",
              "de": 734,
              "ate": 748
            },
            {
              "w": "abre",
              "de": 748,
              "ate": 756
            },
            {
              "w": "o",
              "de": 756,
              "ate": 757
            },
            {
              "w": "pedido",
              "de": 757,
              "ate": 769
            },
            {
              "w": "com",
              "de": 769,
              "ate": 772
            },
            {
              "w": "a",
              "de": 772,
              "ate": 774
            },
            {
              "w": "certidão",
              "de": 774,
              "ate": 792
            },
            {
              "w": "de",
              "de": 792,
              "ate": 796
            },
            {
              "w": "óbito,",
              "de": 796,
              "ate": 809
            },
            {
              "w": "o",
              "de": 814,
              "ate": 816
            },
            {
              "w": "documento",
              "de": 816,
              "ate": 832
            },
            {
              "w": "do",
              "de": 832,
              "ate": 834
            },
            {
              "w": "inventário",
              "de": 834,
              "ate": 859
            },
            {
              "w": "e",
              "de": 859,
              "ate": 862
            },
            {
              "w": "uma",
              "de": 862,
              "ate": 866
            },
            {
              "w": "selfie",
              "de": 866,
              "ate": 881
            },
            {
              "w": "para",
              "de": 881,
              "ate": 887
            },
            {
              "w": "confirmar",
              "de": 887,
              "ate": 903
            },
            {
              "w": "a",
              "de": 903,
              "ate": 904
            },
            {
              "w": "identidade.",
              "de": 904,
              "ate": 925
            }
          ]
        },
        {
          "id": "s05_06",
          "cena": "s5",
          "texto": "A equipe valida, todos são avisados e podem contestar.",
          "fonte": "sintetica",
          "src": "audio/voz/s05_06.mp3",
          "dur": 109,
          "inicio": 935,
          "palavras": [
            {
              "w": "A",
              "de": 937,
              "ate": 941
            },
            {
              "w": "equipe",
              "de": 941,
              "ate": 953
            },
            {
              "w": "valida,",
              "de": 953,
              "ate": 968
            },
            {
              "w": "todos",
              "de": 975,
              "ate": 984
            },
            {
              "w": "são",
              "de": 984,
              "ate": 989
            },
            {
              "w": "avisados",
              "de": 989,
              "ate": 1006
            },
            {
              "w": "e",
              "de": 1006,
              "ate": 1010
            },
            {
              "w": "podem",
              "de": 1010,
              "ate": 1020
            },
            {
              "w": "contestar.",
              "de": 1020,
              "ate": 1040
            }
          ]
        },
        {
          "id": "s05_07",
          "cena": "s5",
          "texto": "Terminado o prazo, cada herdeiro vê só o que foi destinado a ele, com instruções para cada ativo.",
          "fonte": "sintetica",
          "src": "audio/voz/s05_07.mp3",
          "dur": 171,
          "inicio": 1050,
          "palavras": [
            {
              "w": "Terminado",
              "de": 1052,
              "ate": 1066
            },
            {
              "w": "o",
              "de": 1066,
              "ate": 1068
            },
            {
              "w": "prazo,",
              "de": 1068,
              "ate": 1082
            },
            {
              "w": "cada",
              "de": 1086,
              "ate": 1093
            },
            {
              "w": "herdeiro",
              "de": 1093,
              "ate": 1106
            },
            {
              "w": "vê",
              "de": 1106,
              "ate": 1115
            },
            {
              "w": "só",
              "de": 1115,
              "ate": 1126
            },
            {
              "w": "o",
              "de": 1126,
              "ate": 1127
            },
            {
              "w": "que",
              "de": 1127,
              "ate": 1130
            },
            {
              "w": "foi",
              "de": 1130,
              "ate": 1135
            },
            {
              "w": "destinado",
              "de": 1135,
              "ate": 1152
            },
            {
              "w": "a",
              "de": 1152,
              "ate": 1155
            },
            {
              "w": "ele,",
              "de": 1155,
              "ate": 1165
            },
            {
              "w": "com",
              "de": 1169,
              "ate": 1173
            },
            {
              "w": "instruções",
              "de": 1173,
              "ate": 1190
            },
            {
              "w": "para",
              "de": 1190,
              "ate": 1196
            },
            {
              "w": "cada",
              "de": 1196,
              "ate": 1203
            },
            {
              "w": "ativo.",
              "de": 1203,
              "ate": 1217
            }
          ]
        },
        {
          "id": "s06_01",
          "cena": "s6",
          "texto": "Segurança é o coração do produto.",
          "fonte": "sintetica",
          "src": "audio/voz/s06_01.mp3",
          "dur": 69,
          "inicio": 8,
          "palavras": [
            {
              "w": "Segurança",
              "de": 10,
              "ate": 32
            },
            {
              "w": "é",
              "de": 32,
              "ate": 34
            },
            {
              "w": "o",
              "de": 34,
              "ate": 36
            },
            {
              "w": "coração",
              "de": 36,
              "ate": 54
            },
            {
              "w": "do",
              "de": 54,
              "ate": 57
            },
            {
              "w": "produto.",
              "de": 57,
              "ate": 74
            }
          ]
        },
        {
          "id": "s06_02",
          "cena": "s6",
          "texto": "O conteúdo é cifrado no aparelho do titular.",
          "fonte": "sintetica",
          "src": "audio/voz/s06_02.mp3",
          "dur": 80,
          "inicio": 83,
          "palavras": [
            {
              "w": "O",
              "de": 85,
              "ate": 87
            },
            {
              "w": "conteúdo",
              "de": 87,
              "ate": 107
            },
            {
              "w": "é",
              "de": 107,
              "ate": 108
            },
            {
              "w": "cifrado",
              "de": 108,
              "ate": 124
            },
            {
              "w": "no",
              "de": 124,
              "ate": 126
            },
            {
              "w": "aparelho",
              "de": 126,
              "ate": 141
            },
            {
              "w": "do",
              "de": 141,
              "ate": 144
            },
            {
              "w": "titular.",
              "de": 144,
              "ate": 159
            }
          ]
        },
        {
          "id": "s06_03",
          "cena": "s6",
          "texto": "A chave de sucessão é dividida em três partes, e duas são necessárias para abri-la: nem a empresa consegue abrir o cofre sozinha.",
          "fonte": "sintetica",
          "src": "audio/voz/s06_03.mp3",
          "dur": 219,
          "inicio": 169,
          "palavras": [
            {
              "w": "A",
              "de": 171,
              "ate": 174
            },
            {
              "w": "chave",
              "de": 174,
              "ate": 185
            },
            {
              "w": "de",
              "de": 185,
              "ate": 188
            },
            {
              "w": "sucessão",
              "de": 188,
              "ate": 206
            },
            {
              "w": "é",
              "de": 206,
              "ate": 208
            },
            {
              "w": "dividida",
              "de": 208,
              "ate": 221
            },
            {
              "w": "em",
              "de": 221,
              "ate": 224
            },
            {
              "w": "três",
              "de": 224,
              "ate": 234
            },
            {
              "w": "partes,",
              "de": 234,
              "ate": 249
            },
            {
              "w": "e",
              "de": 256,
              "ate": 258
            },
            {
              "w": "duas",
              "de": 258,
              "ate": 268
            },
            {
              "w": "são",
              "de": 268,
              "ate": 272
            },
            {
              "w": "necessárias",
              "de": 272,
              "ate": 292
            },
            {
              "w": "para",
              "de": 292,
              "ate": 297
            },
            {
              "w": "abri-la:",
              "de": 297,
              "ate": 307
            },
            {
              "w": "nem",
              "de": 317,
              "ate": 322
            },
            {
              "w": "a",
              "de": 322,
              "ate": 323
            },
            {
              "w": "empresa",
              "de": 323,
              "ate": 337
            },
            {
              "w": "consegue",
              "de": 337,
              "ate": 349
            },
            {
              "w": "abrir",
              "de": 349,
              "ate": 357
            },
            {
              "w": "o",
              "de": 357,
              "ate": 358
            },
            {
              "w": "cofre",
              "de": 358,
              "ate": 366
            },
            {
              "w": "sozinha.",
              "de": 366,
              "ate": 384
            }
          ]
        },
        {
          "id": "s06_04",
          "cena": "s6",
          "texto": "Mudanças críticas, como remover um herdeiro, geram um alerta: Não foi você? Desfazer.",
          "fonte": "sintetica",
          "src": "audio/voz/s06_04.mp3",
          "dur": 191,
          "inicio": 394,
          "palavras": [
            {
              "w": "Mudanças",
              "de": 396,
              "ate": 415
            },
            {
              "w": "críticas,",
              "de": 415,
              "ate": 433
            },
            {
              "w": "como",
              "de": 437,
              "ate": 443
            },
            {
              "w": "remover",
              "de": 443,
              "ate": 459
            },
            {
              "w": "um",
              "de": 459,
              "ate": 462
            },
            {
              "w": "herdeiro,",
              "de": 462,
              "ate": 476
            },
            {
              "w": "geram",
              "de": 483,
              "ate": 494
            },
            {
              "w": "um",
              "de": 494,
              "ate": 496
            },
            {
              "w": "alerta:",
              "de": 496,
              "ate": 511
            },
            {
              "w": "Não",
              "de": 521,
              "ate": 527
            },
            {
              "w": "foi",
              "de": 527,
              "ate": 532
            },
            {
              "w": "você?",
              "de": 532,
              "ate": 546
            },
            {
              "w": "Desfazer.",
              "de": 557,
              "ate": 581
            }
          ]
        },
        {
          "id": "s07_01",
          "cena": "s7",
          "texto": "Gerenciadores de senha resolvem o dia a dia, não a sucessão.",
          "fonte": "sintetica",
          "src": "audio/voz/s07_01.mp3",
          "dur": 120,
          "inicio": 8,
          "palavras": [
            {
              "w": "Gerenciadores",
              "de": 10,
              "ate": 34
            },
            {
              "w": "de",
              "de": 34,
              "ate": 37
            },
            {
              "w": "senha",
              "de": 37,
              "ate": 48
            },
            {
              "w": "resolvem",
              "de": 48,
              "ate": 66
            },
            {
              "w": "o",
              "de": 66,
              "ate": 69
            },
            {
              "w": "dia",
              "de": 69,
              "ate": 76
            },
            {
              "w": "a",
              "de": 76,
              "ate": 77
            },
            {
              "w": "dia,",
              "de": 77,
              "ate": 87
            },
            {
              "w": "não",
              "de": 94,
              "ate": 104
            },
            {
              "w": "a",
              "de": 104,
              "ate": 105
            },
            {
              "w": "sucessão.",
              "de": 104,
              "ate": 125
            }
          ]
        },
        {
          "id": "s07_02",
          "cena": "s7",
          "texto": "Os contatos de legado de Google, Apple e Meta cobrem só a própria plataforma.",
          "fonte": "sintetica",
          "src": "audio/voz/s07_02.mp3",
          "dur": 147,
          "inicio": 134,
          "palavras": [
            {
              "w": "Os",
              "de": 136,
              "ate": 139
            },
            {
              "w": "contatos",
              "de": 139,
              "ate": 156
            },
            {
              "w": "de",
              "de": 156,
              "ate": 158
            },
            {
              "w": "legado",
              "de": 158,
              "ate": 169
            },
            {
              "w": "de",
              "de": 169,
              "ate": 173
            },
            {
              "w": "Google,",
              "de": 173,
              "ate": 188
            },
            {
              "w": "Apple",
              "de": 193,
              "ate": 209
            },
            {
              "w": "e",
              "de": 209,
              "ate": 212
            },
            {
              "w": "Meta",
              "de": 212,
              "ate": 223
            },
            {
              "w": "cobrem",
              "de": 223,
              "ate": 236
            },
            {
              "w": "só",
              "de": 236,
              "ate": 243
            },
            {
              "w": "a",
              "de": 243,
              "ate": 245
            },
            {
              "w": "própria",
              "de": 245,
              "ate": 257
            },
            {
              "w": "plataforma.",
              "de": 257,
              "ate": 277
            }
          ]
        },
        {
          "id": "s07_03",
          "cena": "s7",
          "texto": "A Herança Digital reúne tudo em um só lugar, seguindo o rito legal brasileiro.",
          "fonte": "sintetica",
          "src": "audio/voz/s07_03.mp3",
          "dur": 147,
          "inicio": 287,
          "palavras": [
            {
              "w": "A",
              "de": 289,
              "ate": 293
            },
            {
              "w": "Herança",
              "de": 293,
              "ate": 304
            },
            {
              "w": "Digital",
              "de": 304,
              "ate": 320
            },
            {
              "w": "reúne",
              "de": 320,
              "ate": 333
            },
            {
              "w": "tudo",
              "de": 333,
              "ate": 341
            },
            {
              "w": "em",
              "de": 341,
              "ate": 344
            },
            {
              "w": "um",
              "de": 344,
              "ate": 347
            },
            {
              "w": "só",
              "de": 347,
              "ate": 355
            },
            {
              "w": "lugar,",
              "de": 355,
              "ate": 367
            },
            {
              "w": "seguindo",
              "de": 375,
              "ate": 390
            },
            {
              "w": "o",
              "de": 390,
              "ate": 391
            },
            {
              "w": "rito",
              "de": 391,
              "ate": 401
            },
            {
              "w": "legal",
              "de": 401,
              "ate": 412
            },
            {
              "w": "brasileiro.",
              "de": 412,
              "ate": 430
            }
          ]
        },
        {
          "id": "s08_01",
          "cena": "s8",
          "texto": "A receita vem da assinatura anual do titular e de uma taxa na liberação.",
          "fonte": "sintetica",
          "src": "audio/voz/s08_01.mp3",
          "dur": 131,
          "inicio": 8,
          "palavras": [
            {
              "w": "A",
              "de": 10,
              "ate": 13
            },
            {
              "w": "receita",
              "de": 13,
              "ate": 32
            },
            {
              "w": "vem",
              "de": 32,
              "ate": 38
            },
            {
              "w": "da",
              "de": 38,
              "ate": 41
            },
            {
              "w": "assinatura",
              "de": 41,
              "ate": 58
            },
            {
              "w": "anual",
              "de": 58,
              "ate": 68
            },
            {
              "w": "do",
              "de": 68,
              "ate": 71
            },
            {
              "w": "titular",
              "de": 71,
              "ate": 88
            },
            {
              "w": "e",
              "de": 88,
              "ate": 92
            },
            {
              "w": "de",
              "de": 92,
              "ate": 95
            },
            {
              "w": "uma",
              "de": 95,
              "ate": 100
            },
            {
              "w": "taxa",
              "de": 100,
              "ate": 112
            },
            {
              "w": "na",
              "de": 112,
              "ate": 114
            },
            {
              "w": "liberação.",
              "de": 114,
              "ate": 135
            }
          ]
        },
        {
          "id": "s08_02",
          "cena": "s8",
          "texto": "Escritórios de advocacia, cartórios, bancos e seguradoras são parceiros previstos e canais de venda.",
          "fonte": "sintetica",
          "src": "audio/voz/s08_02.mp3",
          "dur": 191,
          "inicio": 145,
          "palavras": [
            {
              "w": "Escritórios",
              "de": 147,
              "ate": 168
            },
            {
              "w": "de",
              "de": 168,
              "ate": 171
            },
            {
              "w": "advocacia,",
              "de": 171,
              "ate": 196
            },
            {
              "w": "cartórios,",
              "de": 201,
              "ate": 222
            },
            {
              "w": "bancos",
              "de": 227,
              "ate": 240
            },
            {
              "w": "e",
              "de": 240,
              "ate": 244
            },
            {
              "w": "seguradoras",
              "de": 244,
              "ate": 265
            },
            {
              "w": "são",
              "de": 265,
              "ate": 269
            },
            {
              "w": "parceiros",
              "de": 269,
              "ate": 283
            },
            {
              "w": "previstos",
              "de": 283,
              "ate": 303
            },
            {
              "w": "e",
              "de": 303,
              "ate": 306
            },
            {
              "w": "canais",
              "de": 306,
              "ate": 317
            },
            {
              "w": "de",
              "de": 317,
              "ate": 320
            },
            {
              "w": "venda.",
              "de": 320,
              "ate": 332
            }
          ]
        },
        {
          "id": "s08_03",
          "cena": "s8",
          "texto": "Os valores serão definidos depois da pesquisa com usuários.",
          "fonte": "sintetica",
          "src": "audio/voz/s08_03.mp3",
          "dur": 110,
          "inicio": 342,
          "palavras": [
            {
              "w": "Os",
              "de": 344,
              "ate": 348
            },
            {
              "w": "valores",
              "de": 348,
              "ate": 364
            },
            {
              "w": "serão",
              "de": 364,
              "ate": 371
            },
            {
              "w": "definidos",
              "de": 371,
              "ate": 388
            },
            {
              "w": "depois",
              "de": 388,
              "ate": 399
            },
            {
              "w": "da",
              "de": 399,
              "ate": 403
            },
            {
              "w": "pesquisa",
              "de": 403,
              "ate": 421
            },
            {
              "w": "com",
              "de": 421,
              "ate": 428
            },
            {
              "w": "usuários.",
              "de": 428,
              "ate": 448
            }
          ]
        },
        {
          "id": "s09_01",
          "cena": "s9",
          "texto": "Somos um projeto de faculdade; escritórios, cartórios e verificação de identidade são parceiros previstos.",
          "fonte": "sintetica",
          "src": "audio/voz/s09_01.mp3",
          "dur": 203,
          "inicio": 8,
          "palavras": [
            {
              "w": "Somos",
              "de": 10,
              "ate": 21
            },
            {
              "w": "um",
              "de": 21,
              "ate": 25
            },
            {
              "w": "projeto",
              "de": 25,
              "ate": 38
            },
            {
              "w": "de",
              "de": 38,
              "ate": 40
            },
            {
              "w": "faculdade;",
              "de": 40,
              "ate": 62
            },
            {
              "w": "escritórios,",
              "de": 68,
              "ate": 91
            },
            {
              "w": "cartórios",
              "de": 96,
              "ate": 115
            },
            {
              "w": "e",
              "de": 115,
              "ate": 121
            },
            {
              "w": "verificação",
              "de": 121,
              "ate": 144
            },
            {
              "w": "de",
              "de": 144,
              "ate": 146
            },
            {
              "w": "identidade",
              "de": 146,
              "ate": 166
            },
            {
              "w": "são",
              "de": 166,
              "ate": 171
            },
            {
              "w": "parceiros",
              "de": 171,
              "ate": 185
            },
            {
              "w": "previstos.",
              "de": 185,
              "ate": 207
            }
          ]
        },
        {
          "id": "s09_02",
          "cena": "s9",
          "texto": "Próximos passos: validar com um advogado de sucessões, ouvir usuários e construir o MVP.",
          "fonte": "sintetica",
          "src": "audio/voz/s09_02.mp3",
          "dur": 187,
          "inicio": 217,
          "palavras": [
            {
              "w": "Próximos",
              "de": 219,
              "ate": 233
            },
            {
              "w": "passos:",
              "de": 233,
              "ate": 249
            },
            {
              "w": "validar",
              "de": 257,
              "ate": 271
            },
            {
              "w": "com",
              "de": 271,
              "ate": 275
            },
            {
              "w": "um",
              "de": 275,
              "ate": 277
            },
            {
              "w": "advogado",
              "de": 277,
              "ate": 295
            },
            {
              "w": "de",
              "de": 295,
              "ate": 298
            },
            {
              "w": "sucessões,",
              "de": 298,
              "ate": 321
            },
            {
              "w": "ouvir",
              "de": 326,
              "ate": 338
            },
            {
              "w": "usuários",
              "de": 338,
              "ate": 354
            },
            {
              "w": "e",
              "de": 354,
              "ate": 358
            },
            {
              "w": "construir",
              "de": 358,
              "ate": 375
            },
            {
              "w": "o",
              "de": 375,
              "ate": 378
            },
            {
              "w": "MVP.",
              "de": 378,
              "ate": 400
            }
          ]
        },
        {
          "id": "s09_03",
          "cena": "s9",
          "texto": "Herança Digital: seus dados, sua história, seu futuro. Obrigado!",
          "fonte": "sintetica",
          "src": "audio/voz/s09_03.mp3",
          "dur": 160,
          "inicio": 410,
          "palavras": [
            {
              "w": "Herança",
              "de": 412,
              "ate": 425
            },
            {
              "w": "Digital:",
              "de": 425,
              "ate": 442
            },
            {
              "w": "seus",
              "de": 449,
              "ate": 458
            },
            {
              "w": "dados,",
              "de": 458,
              "ate": 475
            },
            {
              "w": "sua",
              "de": 480,
              "ate": 486
            },
            {
              "w": "história,",
              "de": 486,
              "ate": 501
            },
            {
              "w": "seu",
              "de": 507,
              "ate": 515
            },
            {
              "w": "futuro.",
              "de": 515,
              "ate": 532
            },
            {
              "w": "Obrigado!",
              "de": 542,
              "ate": 566
            }
          ]
        }
      ],
      "legendas": [
        {
          "id": "L01",
          "cena": "s1",
          "fraseId": "s01_01",
          "de": 12,
          "ate": 51,
          "palavras": [
            {
              "w": "Quando",
              "de": 16,
              "ate": 23
            },
            {
              "w": "você",
              "de": 23,
              "ate": 31
            },
            {
              "w": "morrer…",
              "de": 31,
              "ate": 46
            }
          ]
        },
        {
          "id": "L02",
          "cena": "s1",
          "fraseId": "s01_02",
          "de": 51,
          "ate": 119,
          "palavras": [
            {
              "w": "quem",
              "de": 55,
              "ate": 60
            },
            {
              "w": "fica",
              "de": 60,
              "ate": 72
            },
            {
              "w": "com",
              "de": 72,
              "ate": 76
            },
            {
              "w": "o",
              "de": 76,
              "ate": 77
            },
            {
              "w": "seu",
              "de": 77,
              "ate": 84
            },
            {
              "w": "Instagram?",
              "de": 84,
              "ate": 101
            }
          ]
        },
        {
          "id": "L03",
          "cena": "s1",
          "fraseId": "s01_03",
          "de": 119,
          "ate": 158,
          "palavras": [
            {
              "w": "Com",
              "de": 109,
              "ate": 115
            },
            {
              "w": "o",
              "de": 115,
              "ate": 116
            },
            {
              "w": "seu",
              "de": 116,
              "ate": 123
            },
            {
              "w": "e-mail?",
              "de": 123,
              "ate": 139
            }
          ]
        },
        {
          "id": "L04",
          "cena": "s1",
          "fraseId": "s01_04",
          "de": 158,
          "ate": 210,
          "palavras": [
            {
              "w": "Com",
              "de": 148,
              "ate": 154
            },
            {
              "w": "as",
              "de": 154,
              "ate": 158
            },
            {
              "w": "suas",
              "de": 158,
              "ate": 166
            },
            {
              "w": "criptomoedas?",
              "de": 166,
              "ate": 200
            }
          ]
        },
        {
          "id": "L05",
          "cena": "s1",
          "fraseId": "s01_05",
          "de": 244,
          "ate": 362,
          "palavras": [
            {
              "w": "Somos",
              "de": 248,
              "ate": 259
            },
            {
              "w": "o",
              "de": 259,
              "ate": 263
            },
            {
              "w": "grupo",
              "de": 263,
              "ate": 273
            },
            {
              "w": "EternaByte,",
              "de": 273,
              "ate": 299
            },
            {
              "w": "e",
              "de": 304,
              "ate": 307
            },
            {
              "w": "esta",
              "de": 307,
              "ate": 317
            },
            {
              "w": "é",
              "de": 317,
              "ate": 320
            },
            {
              "w": "a",
              "de": 320,
              "ate": 323
            },
            {
              "w": "Herança",
              "de": 323,
              "ate": 336
            },
            {
              "w": "Digital.",
              "de": 336,
              "ate": 352
            }
          ]
        },
        {
          "id": "L06",
          "cena": "s2",
          "fraseId": "s02_01",
          "de": 6,
          "ate": 157,
          "palavras": [
            {
              "w": "Hoje",
              "de": 10,
              "ate": 17
            },
            {
              "w": "quase",
              "de": 17,
              "ate": 27
            },
            {
              "w": "todo",
              "de": 27,
              "ate": 32
            },
            {
              "w": "mundo",
              "de": 32,
              "ate": 41
            },
            {
              "w": "tem",
              "de": 41,
              "ate": 46
            },
            {
              "w": "e-mail,",
              "de": 46,
              "ate": 59
            },
            {
              "w": "redes",
              "de": 64,
              "ate": 71
            },
            {
              "w": "sociais,",
              "de": 71,
              "ate": 91
            },
            {
              "w": "banco",
              "de": 96,
              "ate": 106
            },
            {
              "w": "digital,",
              "de": 106,
              "ate": 125
            },
            {
              "w": "criptomoedas,",
              "de": 129,
              "ate": 155
            }
          ]
        },
        {
          "id": "L07",
          "cena": "s2",
          "fraseId": "s02_01",
          "de": 157,
          "ate": 229,
          "palavras": [
            {
              "w": "fotos",
              "de": 161,
              "ate": 172
            },
            {
              "w": "na",
              "de": 172,
              "ate": 178
            },
            {
              "w": "nuvem",
              "de": 178,
              "ate": 193
            },
            {
              "w": "e",
              "de": 193,
              "ate": 196
            },
            {
              "w": "assinaturas.",
              "de": 196,
              "ate": 221
            }
          ]
        },
        {
          "id": "L08",
          "cena": "s2",
          "fraseId": "s02_02",
          "de": 229,
          "ate": 366,
          "palavras": [
            {
              "w": "Quando",
              "de": 233,
              "ate": 238
            },
            {
              "w": "a",
              "de": 238,
              "ate": 239
            },
            {
              "w": "pessoa",
              "de": 239,
              "ate": 249
            },
            {
              "w": "morre,",
              "de": 249,
              "ate": 261
            },
            {
              "w": "a",
              "de": 267,
              "ate": 269
            },
            {
              "w": "família",
              "de": 269,
              "ate": 280
            },
            {
              "w": "não",
              "de": 280,
              "ate": 285
            },
            {
              "w": "sabe",
              "de": 285,
              "ate": 295
            },
            {
              "w": "o",
              "de": 295,
              "ate": 296
            },
            {
              "w": "que",
              "de": 297,
              "ate": 299
            },
            {
              "w": "existe,",
              "de": 299,
              "ate": 314
            },
            {
              "w": "não",
              "de": 320,
              "ate": 326
            },
            {
              "w": "tem",
              "de": 326,
              "ate": 334
            },
            {
              "w": "as",
              "de": 334,
              "ate": 337
            },
            {
              "w": "senhas,",
              "de": 337,
              "ate": 350
            }
          ]
        },
        {
          "id": "L09",
          "cena": "s2",
          "fraseId": "s02_02",
          "de": 366,
          "ate": 416,
          "palavras": [
            {
              "w": "e",
              "de": 356,
              "ate": 358
            },
            {
              "w": "não",
              "de": 358,
              "ate": 365
            },
            {
              "w": "sabe",
              "de": 365,
              "ate": 375
            },
            {
              "w": "o",
              "de": 375,
              "ate": 376
            },
            {
              "w": "que",
              "de": 376,
              "ate": 378
            },
            {
              "w": "ela",
              "de": 378,
              "ate": 382
            },
            {
              "w": "queria.",
              "de": 382,
              "ate": 395
            }
          ]
        },
        {
          "id": "L10",
          "cena": "s2",
          "fraseId": "s02_03",
          "de": 416,
          "ate": 601,
          "palavras": [
            {
              "w": "Resultado:",
              "de": 406,
              "ate": 427
            },
            {
              "w": "bens",
              "de": 435,
              "ate": 445
            },
            {
              "w": "com",
              "de": 445,
              "ate": 449
            },
            {
              "w": "valor",
              "de": 449,
              "ate": 458
            },
            {
              "w": "perdidos,",
              "de": 458,
              "ate": 479
            },
            {
              "w": "assinaturas",
              "de": 484,
              "ate": 503
            },
            {
              "w": "cobrando",
              "de": 503,
              "ate": 516
            },
            {
              "w": "para",
              "de": 516,
              "ate": 522
            },
            {
              "w": "sempre",
              "de": 522,
              "ate": 536
            },
            {
              "w": "e",
              "de": 536,
              "ate": 537
            },
            {
              "w": "perfis",
              "de": 536,
              "ate": 553
            },
            {
              "w": "virando",
              "de": 553,
              "ate": 566
            },
            {
              "w": "alvo",
              "de": 566,
              "ate": 575
            },
            {
              "w": "de",
              "de": 575,
              "ate": 578
            },
            {
              "w": "golpe.",
              "de": 578,
              "ate": 591
            }
          ]
        },
        {
          "id": "L11",
          "cena": "s3",
          "fraseId": "s03_01",
          "de": -3,
          "ate": 189,
          "palavras": [
            {
              "w": "A",
              "de": 12,
              "ate": 16
            },
            {
              "w": "Herança",
              "de": 16,
              "ate": 27
            },
            {
              "w": "Digital",
              "de": 27,
              "ate": 46
            },
            {
              "w": "é",
              "de": 46,
              "ate": 48
            },
            {
              "w": "um",
              "de": 48,
              "ate": 52
            },
            {
              "w": "cofre",
              "de": 52,
              "ate": 61
            },
            {
              "w": "onde",
              "de": 61,
              "ate": 68
            },
            {
              "w": "você",
              "de": 68,
              "ate": 75
            },
            {
              "w": "organiza,",
              "de": 75,
              "ate": 97
            },
            {
              "w": "em",
              "de": 102,
              "ate": 107
            },
            {
              "w": "vida,",
              "de": 107,
              "ate": 120
            },
            {
              "w": "tudo",
              "de": 125,
              "ate": 132
            },
            {
              "w": "o",
              "de": 132,
              "ate": 133
            },
            {
              "w": "que",
              "de": 132,
              "ate": 136
            },
            {
              "w": "tem",
              "de": 136,
              "ate": 141
            },
            {
              "w": "no",
              "de": 141,
              "ate": 143
            },
            {
              "w": "mundo",
              "de": 143,
              "ate": 154
            },
            {
              "w": "digital.",
              "de": 154,
              "ate": 171
            }
          ]
        },
        {
          "id": "L12",
          "cena": "s3",
          "fraseId": "s03_02",
          "de": 189,
          "ate": 359,
          "palavras": [
            {
              "w": "Juntamos",
              "de": 182,
              "ate": 198
            },
            {
              "w": "três",
              "de": 198,
              "ate": 209
            },
            {
              "w": "coisas:",
              "de": 209,
              "ate": 224
            },
            {
              "w": "um",
              "de": 233,
              "ate": 236
            },
            {
              "w": "inventário",
              "de": 236,
              "ate": 254
            },
            {
              "w": "dos",
              "de": 254,
              "ate": 257
            },
            {
              "w": "seus",
              "de": 257,
              "ate": 261
            },
            {
              "w": "ativos,",
              "de": 261,
              "ate": 279
            },
            {
              "w": "um",
              "de": 285,
              "ate": 289
            },
            {
              "w": "cofre",
              "de": 289,
              "ate": 301
            },
            {
              "w": "de",
              "de": 301,
              "ate": 303
            },
            {
              "w": "acessos",
              "de": 303,
              "ate": 318
            },
            {
              "w": "criptografado,",
              "de": 318,
              "ate": 351
            }
          ]
        },
        {
          "id": "L13",
          "cena": "s3",
          "fraseId": "s03_03",
          "de": 359,
          "ate": 451,
          "palavras": [
            {
              "w": "e",
              "de": 363,
              "ate": 366
            },
            {
              "w": "uma",
              "de": 366,
              "ate": 369
            },
            {
              "w": "liberação",
              "de": 369,
              "ate": 389
            },
            {
              "w": "que",
              "de": 389,
              "ate": 391
            },
            {
              "w": "só",
              "de": 391,
              "ate": 397
            },
            {
              "w": "vale",
              "de": 397,
              "ate": 407
            },
            {
              "w": "pelo",
              "de": 407,
              "ate": 412
            },
            {
              "w": "caminho",
              "de": 412,
              "ate": 421
            },
            {
              "w": "legal:",
              "de": 421,
              "ate": 434
            }
          ]
        },
        {
          "id": "L14",
          "cena": "s3",
          "fraseId": "s03_03",
          "de": 451,
          "ate": 523,
          "palavras": [
            {
              "w": "inventário",
              "de": 441,
              "ate": 460
            },
            {
              "w": "em",
              "de": 460,
              "ate": 462
            },
            {
              "w": "cartório",
              "de": 462,
              "ate": 483
            },
            {
              "w": "ou",
              "de": 483,
              "ate": 488
            },
            {
              "w": "na",
              "de": 488,
              "ate": 492
            },
            {
              "w": "justiça.",
              "de": 492,
              "ate": 511
            }
          ]
        },
        {
          "id": "L15",
          "cena": "s4",
          "fraseId": "s04_01",
          "de": 1,
          "ate": 150,
          "palavras": [
            {
              "w": "Em",
              "de": 10,
              "ate": 16
            },
            {
              "w": "vida,",
              "de": 16,
              "ate": 28
            },
            {
              "w": "o",
              "de": 34,
              "ate": 36
            },
            {
              "w": "titular",
              "de": 36,
              "ate": 52
            },
            {
              "w": "cadastra",
              "de": 52,
              "ate": 67
            },
            {
              "w": "os",
              "de": 67,
              "ate": 68
            },
            {
              "w": "ativos",
              "de": 67,
              "ate": 85
            },
            {
              "w": "e",
              "de": 85,
              "ate": 91
            },
            {
              "w": "escolhe",
              "de": 91,
              "ate": 104
            },
            {
              "w": "o",
              "de": 104,
              "ate": 106
            },
            {
              "w": "destino",
              "de": 106,
              "ate": 121
            },
            {
              "w": "de",
              "de": 121,
              "ate": 125
            },
            {
              "w": "cada",
              "de": 125,
              "ate": 136
            },
            {
              "w": "um.",
              "de": 136,
              "ate": 143
            }
          ]
        },
        {
          "id": "L16",
          "cena": "s4",
          "fraseId": "s04_02",
          "de": 150,
          "ate": 233,
          "palavras": [
            {
              "w": "No",
              "de": 154,
              "ate": 158
            },
            {
              "w": "falecimento,",
              "de": 158,
              "ate": 183
            },
            {
              "w": "o",
              "de": 188,
              "ate": 191
            },
            {
              "w": "cofre",
              "de": 191,
              "ate": 202
            },
            {
              "w": "é",
              "de": 202,
              "ate": 203
            },
            {
              "w": "congelado.",
              "de": 203,
              "ate": 225
            }
          ]
        },
        {
          "id": "L17",
          "cena": "s4",
          "fraseId": "s04_03",
          "de": 233,
          "ate": 415,
          "palavras": [
            {
              "w": "Só",
              "de": 237,
              "ate": 243
            },
            {
              "w": "depois",
              "de": 243,
              "ate": 253
            },
            {
              "w": "do",
              "de": 253,
              "ate": 255
            },
            {
              "w": "inventário",
              "de": 255,
              "ate": 279
            },
            {
              "w": "e",
              "de": 279,
              "ate": 281
            },
            {
              "w": "de",
              "de": 281,
              "ate": 284
            },
            {
              "w": "um",
              "de": 284,
              "ate": 287
            },
            {
              "w": "prazo",
              "de": 287,
              "ate": 298
            },
            {
              "w": "para",
              "de": 298,
              "ate": 303
            },
            {
              "w": "contestação,",
              "de": 303,
              "ate": 330
            },
            {
              "w": "cada",
              "de": 334,
              "ate": 341
            },
            {
              "w": "herdeiro",
              "de": 341,
              "ate": 354
            },
            {
              "w": "recebe",
              "de": 354,
              "ate": 367
            },
            {
              "w": "apenas",
              "de": 367,
              "ate": 381
            },
            {
              "w": "a",
              "de": 381,
              "ate": 384
            },
            {
              "w": "sua",
              "de": 384,
              "ate": 390
            },
            {
              "w": "parte.",
              "de": 390,
              "ate": 405
            }
          ]
        },
        {
          "id": "L18",
          "cena": "s5",
          "fraseId": "s05_01",
          "de": 6,
          "ate": 55,
          "palavras": [
            {
              "w": "Este",
              "de": 12,
              "ate": 22
            },
            {
              "w": "é",
              "de": 22,
              "ate": 23
            },
            {
              "w": "o",
              "de": 23,
              "ate": 25
            },
            {
              "w": "protótipo.",
              "de": 25,
              "ate": 48
            }
          ]
        },
        {
          "id": "L19",
          "cena": "s5",
          "fraseId": "s05_02",
          "de": 55,
          "ate": 222,
          "palavras": [
            {
              "w": "O",
              "de": 59,
              "ate": 61
            },
            {
              "w": "titular",
              "de": 61,
              "ate": 77
            },
            {
              "w": "entra",
              "de": 77,
              "ate": 84
            },
            {
              "w": "com",
              "de": 84,
              "ate": 88
            },
            {
              "w": "a",
              "de": 88,
              "ate": 89
            },
            {
              "w": "chave",
              "de": 89,
              "ate": 98
            },
            {
              "w": "de",
              "de": 98,
              "ate": 101
            },
            {
              "w": "acesso",
              "de": 101,
              "ate": 113
            },
            {
              "w": "do",
              "de": 113,
              "ate": 116
            },
            {
              "w": "celular",
              "de": 116,
              "ate": 133
            },
            {
              "w": "e",
              "de": 133,
              "ate": 139
            },
            {
              "w": "vê",
              "de": 139,
              "ate": 145
            },
            {
              "w": "o",
              "de": 145,
              "ate": 147
            },
            {
              "w": "que",
              "de": 147,
              "ate": 150
            },
            {
              "w": "falta",
              "de": 150,
              "ate": 162
            },
            {
              "w": "para",
              "de": 162,
              "ate": 167
            },
            {
              "w": "o",
              "de": 167,
              "ate": 168
            },
            {
              "w": "plano",
              "de": 167,
              "ate": 175
            },
            {
              "w": "ficar",
              "de": 175,
              "ate": 183
            },
            {
              "w": "completo.",
              "de": 183,
              "ate": 200
            }
          ]
        },
        {
          "id": "L20",
          "cena": "s5",
          "fraseId": "s05_03",
          "de": 222,
          "ate": 407,
          "palavras": [
            {
              "w": "No",
              "de": 212,
              "ate": 216
            },
            {
              "w": "inventário,",
              "de": 216,
              "ate": 238
            },
            {
              "w": "cada",
              "de": 243,
              "ate": 250
            },
            {
              "w": "ativo",
              "de": 250,
              "ate": 264
            },
            {
              "w": "(redes",
              "de": 271,
              "ate": 282
            },
            {
              "w": "sociais,",
              "de": 282,
              "ate": 300
            },
            {
              "w": "e-mails,",
              "de": 306,
              "ate": 324
            },
            {
              "w": "cripto,",
              "de": 329,
              "ate": 342
            },
            {
              "w": "assinaturas)",
              "de": 347,
              "ate": 371
            },
            {
              "w": "recebe",
              "de": 377,
              "ate": 388
            },
            {
              "w": "um",
              "de": 388,
              "ate": 389
            },
            {
              "w": "destino:",
              "de": 389,
              "ate": 405
            }
          ]
        },
        {
          "id": "L21",
          "cena": "s5",
          "fraseId": "s05_03",
          "de": 407,
          "ate": 492,
          "palavras": [
            {
              "w": "pessoal,",
              "de": 411,
              "ate": 430
            },
            {
              "w": "patrimonial",
              "de": 435,
              "ate": 462
            },
            {
              "w": "ou",
              "de": 462,
              "ate": 468
            },
            {
              "w": "encerrar.",
              "de": 468,
              "ate": 484
            }
          ]
        },
        {
          "id": "L22",
          "cena": "s5",
          "fraseId": "s05_04",
          "de": 492,
          "ate": 594,
          "palavras": [
            {
              "w": "Depois,",
              "de": 496,
              "ate": 512
            },
            {
              "w": "ele",
              "de": 519,
              "ate": 523
            },
            {
              "w": "escolhe",
              "de": 523,
              "ate": 533
            },
            {
              "w": "os",
              "de": 533,
              "ate": 534
            },
            {
              "w": "herdeiros",
              "de": 534,
              "ate": 551
            },
            {
              "w": "e",
              "de": 551,
              "ate": 554
            },
            {
              "w": "define",
              "de": 554,
              "ate": 565
            },
            {
              "w": "a",
              "de": 565,
              "ate": 566
            },
            {
              "w": "carência:",
              "de": 566,
              "ate": 581
            }
          ]
        },
        {
          "id": "L23",
          "cena": "s5",
          "fraseId": "s05_04",
          "de": 594,
          "ate": 687,
          "palavras": [
            {
              "w": "quinze,",
              "de": 588,
              "ate": 602
            },
            {
              "w": "trinta,",
              "de": 607,
              "ate": 619
            },
            {
              "w": "sessenta",
              "de": 626,
              "ate": 646
            },
            {
              "w": "ou",
              "de": 646,
              "ate": 649
            },
            {
              "w": "noventa",
              "de": 649,
              "ate": 664
            },
            {
              "w": "dias.",
              "de": 664,
              "ate": 679
            }
          ]
        },
        {
          "id": "L24",
          "cena": "s5",
          "fraseId": "s05_05",
          "de": 687,
          "ate": 824,
          "palavras": [
            {
              "w": "Quando",
              "de": 691,
              "ate": 696
            },
            {
              "w": "o",
              "de": 696,
              "ate": 697
            },
            {
              "w": "titular",
              "de": 697,
              "ate": 708
            },
            {
              "w": "falece,",
              "de": 708,
              "ate": 726
            },
            {
              "w": "o",
              "de": 731,
              "ate": 734
            },
            {
              "w": "herdeiro",
              "de": 734,
              "ate": 748
            },
            {
              "w": "abre",
              "de": 748,
              "ate": 756
            },
            {
              "w": "o",
              "de": 756,
              "ate": 757
            },
            {
              "w": "pedido",
              "de": 757,
              "ate": 769
            },
            {
              "w": "com",
              "de": 769,
              "ate": 772
            },
            {
              "w": "a",
              "de": 772,
              "ate": 774
            },
            {
              "w": "certidão",
              "de": 774,
              "ate": 792
            },
            {
              "w": "de",
              "de": 792,
              "ate": 796
            },
            {
              "w": "óbito,",
              "de": 796,
              "ate": 809
            }
          ]
        },
        {
          "id": "L25",
          "cena": "s5",
          "fraseId": "s05_05",
          "de": 824,
          "ate": 946,
          "palavras": [
            {
              "w": "o",
              "de": 814,
              "ate": 816
            },
            {
              "w": "documento",
              "de": 816,
              "ate": 832
            },
            {
              "w": "do",
              "de": 832,
              "ate": 834
            },
            {
              "w": "inventário",
              "de": 834,
              "ate": 859
            },
            {
              "w": "e",
              "de": 859,
              "ate": 862
            },
            {
              "w": "uma",
              "de": 862,
              "ate": 866
            },
            {
              "w": "selfie",
              "de": 866,
              "ate": 881
            },
            {
              "w": "para",
              "de": 881,
              "ate": 887
            },
            {
              "w": "confirmar",
              "de": 887,
              "ate": 903
            },
            {
              "w": "a",
              "de": 903,
              "ate": 904
            },
            {
              "w": "identidade.",
              "de": 904,
              "ate": 925
            }
          ]
        },
        {
          "id": "L26",
          "cena": "s5",
          "fraseId": "s05_06",
          "de": 946,
          "ate": 1048,
          "palavras": [
            {
              "w": "A",
              "de": 937,
              "ate": 941
            },
            {
              "w": "equipe",
              "de": 941,
              "ate": 953
            },
            {
              "w": "valida,",
              "de": 953,
              "ate": 968
            },
            {
              "w": "todos",
              "de": 975,
              "ate": 984
            },
            {
              "w": "são",
              "de": 984,
              "ate": 989
            },
            {
              "w": "avisados",
              "de": 989,
              "ate": 1006
            },
            {
              "w": "e",
              "de": 1006,
              "ate": 1010
            },
            {
              "w": "podem",
              "de": 1010,
              "ate": 1020
            },
            {
              "w": "contestar.",
              "de": 1020,
              "ate": 1040
            }
          ]
        },
        {
          "id": "L27",
          "cena": "s5",
          "fraseId": "s05_07",
          "de": 1048,
          "ate": 1240,
          "palavras": [
            {
              "w": "Terminado",
              "de": 1052,
              "ate": 1066
            },
            {
              "w": "o",
              "de": 1066,
              "ate": 1068
            },
            {
              "w": "prazo,",
              "de": 1068,
              "ate": 1082
            },
            {
              "w": "cada",
              "de": 1086,
              "ate": 1093
            },
            {
              "w": "herdeiro",
              "de": 1093,
              "ate": 1106
            },
            {
              "w": "vê",
              "de": 1106,
              "ate": 1115
            },
            {
              "w": "só",
              "de": 1115,
              "ate": 1126
            },
            {
              "w": "o",
              "de": 1126,
              "ate": 1127
            },
            {
              "w": "que",
              "de": 1127,
              "ate": 1130
            },
            {
              "w": "foi",
              "de": 1130,
              "ate": 1135
            },
            {
              "w": "destinado",
              "de": 1135,
              "ate": 1152
            },
            {
              "w": "a",
              "de": 1152,
              "ate": 1155
            },
            {
              "w": "ele,",
              "de": 1155,
              "ate": 1165
            },
            {
              "w": "com",
              "de": 1169,
              "ate": 1173
            },
            {
              "w": "instruções",
              "de": 1173,
              "ate": 1190
            },
            {
              "w": "para",
              "de": 1190,
              "ate": 1196
            },
            {
              "w": "cada",
              "de": 1196,
              "ate": 1203
            },
            {
              "w": "ativo.",
              "de": 1203,
              "ate": 1217
            }
          ]
        },
        {
          "id": "L28",
          "cena": "s6",
          "fraseId": "s06_01",
          "de": 6,
          "ate": 81,
          "palavras": [
            {
              "w": "Segurança",
              "de": 10,
              "ate": 32
            },
            {
              "w": "é",
              "de": 32,
              "ate": 34
            },
            {
              "w": "o",
              "de": 34,
              "ate": 36
            },
            {
              "w": "coração",
              "de": 36,
              "ate": 54
            },
            {
              "w": "do",
              "de": 54,
              "ate": 57
            },
            {
              "w": "produto.",
              "de": 57,
              "ate": 74
            }
          ]
        },
        {
          "id": "L29",
          "cena": "s6",
          "fraseId": "s06_02",
          "de": 81,
          "ate": 173,
          "palavras": [
            {
              "w": "O",
              "de": 85,
              "ate": 87
            },
            {
              "w": "conteúdo",
              "de": 87,
              "ate": 107
            },
            {
              "w": "é",
              "de": 107,
              "ate": 108
            },
            {
              "w": "cifrado",
              "de": 108,
              "ate": 124
            },
            {
              "w": "no",
              "de": 124,
              "ate": 126
            },
            {
              "w": "aparelho",
              "de": 126,
              "ate": 141
            },
            {
              "w": "do",
              "de": 141,
              "ate": 144
            },
            {
              "w": "titular.",
              "de": 144,
              "ate": 159
            }
          ]
        },
        {
          "id": "L30",
          "cena": "s6",
          "fraseId": "s06_03",
          "de": 173,
          "ate": 327,
          "palavras": [
            {
              "w": "A",
              "de": 171,
              "ate": 174
            },
            {
              "w": "chave",
              "de": 174,
              "ate": 185
            },
            {
              "w": "de",
              "de": 185,
              "ate": 188
            },
            {
              "w": "sucessão",
              "de": 188,
              "ate": 206
            },
            {
              "w": "é",
              "de": 206,
              "ate": 208
            },
            {
              "w": "dividida",
              "de": 208,
              "ate": 221
            },
            {
              "w": "em",
              "de": 221,
              "ate": 224
            },
            {
              "w": "três",
              "de": 224,
              "ate": 234
            },
            {
              "w": "partes,",
              "de": 234,
              "ate": 249
            },
            {
              "w": "e",
              "de": 256,
              "ate": 258
            },
            {
              "w": "duas",
              "de": 258,
              "ate": 268
            },
            {
              "w": "são",
              "de": 268,
              "ate": 272
            },
            {
              "w": "necessárias",
              "de": 272,
              "ate": 292
            },
            {
              "w": "para",
              "de": 292,
              "ate": 297
            },
            {
              "w": "abri-la:",
              "de": 297,
              "ate": 307
            }
          ]
        },
        {
          "id": "L31",
          "cena": "s6",
          "fraseId": "s06_03",
          "de": 327,
          "ate": 406,
          "palavras": [
            {
              "w": "nem",
              "de": 317,
              "ate": 322
            },
            {
              "w": "a",
              "de": 322,
              "ate": 323
            },
            {
              "w": "empresa",
              "de": 323,
              "ate": 337
            },
            {
              "w": "consegue",
              "de": 337,
              "ate": 349
            },
            {
              "w": "abrir",
              "de": 349,
              "ate": 357
            },
            {
              "w": "o",
              "de": 357,
              "ate": 358
            },
            {
              "w": "cofre",
              "de": 358,
              "ate": 366
            },
            {
              "w": "sozinha.",
              "de": 366,
              "ate": 384
            }
          ]
        },
        {
          "id": "L32",
          "cena": "s6",
          "fraseId": "s06_04",
          "de": 406,
          "ate": 517,
          "palavras": [
            {
              "w": "Mudanças",
              "de": 396,
              "ate": 415
            },
            {
              "w": "críticas,",
              "de": 415,
              "ate": 433
            },
            {
              "w": "como",
              "de": 437,
              "ate": 443
            },
            {
              "w": "remover",
              "de": 443,
              "ate": 459
            },
            {
              "w": "um",
              "de": 459,
              "ate": 462
            },
            {
              "w": "herdeiro,",
              "de": 462,
              "ate": 476
            },
            {
              "w": "geram",
              "de": 483,
              "ate": 494
            },
            {
              "w": "um",
              "de": 494,
              "ate": 496
            },
            {
              "w": "alerta:",
              "de": 496,
              "ate": 511
            }
          ]
        },
        {
          "id": "L33",
          "cena": "s6",
          "fraseId": "s06_04",
          "de": 517,
          "ate": 591,
          "palavras": [
            {
              "w": "Não",
              "de": 521,
              "ate": 527
            },
            {
              "w": "foi",
              "de": 527,
              "ate": 532
            },
            {
              "w": "você?",
              "de": 532,
              "ate": 546
            },
            {
              "w": "Desfazer.",
              "de": 557,
              "ate": 581
            }
          ]
        },
        {
          "id": "L34",
          "cena": "s7",
          "fraseId": "s07_01",
          "de": 6,
          "ate": 132,
          "palavras": [
            {
              "w": "Gerenciadores",
              "de": 10,
              "ate": 34
            },
            {
              "w": "de",
              "de": 34,
              "ate": 37
            },
            {
              "w": "senha",
              "de": 37,
              "ate": 48
            },
            {
              "w": "resolvem",
              "de": 48,
              "ate": 66
            },
            {
              "w": "o",
              "de": 66,
              "ate": 69
            },
            {
              "w": "dia",
              "de": 69,
              "ate": 76
            },
            {
              "w": "a",
              "de": 76,
              "ate": 77
            },
            {
              "w": "dia,",
              "de": 77,
              "ate": 87
            },
            {
              "w": "não",
              "de": 94,
              "ate": 104
            },
            {
              "w": "a",
              "de": 104,
              "ate": 105
            },
            {
              "w": "sucessão.",
              "de": 104,
              "ate": 125
            }
          ]
        },
        {
          "id": "L35",
          "cena": "s7",
          "fraseId": "s07_02",
          "de": 132,
          "ate": 285,
          "palavras": [
            {
              "w": "Os",
              "de": 136,
              "ate": 139
            },
            {
              "w": "contatos",
              "de": 139,
              "ate": 156
            },
            {
              "w": "de",
              "de": 156,
              "ate": 158
            },
            {
              "w": "legado",
              "de": 158,
              "ate": 169
            },
            {
              "w": "de",
              "de": 169,
              "ate": 173
            },
            {
              "w": "Google,",
              "de": 173,
              "ate": 188
            },
            {
              "w": "Apple",
              "de": 193,
              "ate": 209
            },
            {
              "w": "e",
              "de": 209,
              "ate": 212
            },
            {
              "w": "Meta",
              "de": 212,
              "ate": 223
            },
            {
              "w": "cobrem",
              "de": 223,
              "ate": 236
            },
            {
              "w": "só",
              "de": 236,
              "ate": 243
            },
            {
              "w": "a",
              "de": 243,
              "ate": 245
            },
            {
              "w": "própria",
              "de": 245,
              "ate": 257
            },
            {
              "w": "plataforma.",
              "de": 257,
              "ate": 277
            }
          ]
        },
        {
          "id": "L36",
          "cena": "s7",
          "fraseId": "s07_03",
          "de": 285,
          "ate": 440,
          "palavras": [
            {
              "w": "A",
              "de": 289,
              "ate": 293
            },
            {
              "w": "Herança",
              "de": 293,
              "ate": 304
            },
            {
              "w": "Digital",
              "de": 304,
              "ate": 320
            },
            {
              "w": "reúne",
              "de": 320,
              "ate": 333
            },
            {
              "w": "tudo",
              "de": 333,
              "ate": 341
            },
            {
              "w": "em",
              "de": 341,
              "ate": 344
            },
            {
              "w": "um",
              "de": 344,
              "ate": 347
            },
            {
              "w": "só",
              "de": 347,
              "ate": 355
            },
            {
              "w": "lugar,",
              "de": 355,
              "ate": 367
            },
            {
              "w": "seguindo",
              "de": 375,
              "ate": 390
            },
            {
              "w": "o",
              "de": 390,
              "ate": 391
            },
            {
              "w": "rito",
              "de": 391,
              "ate": 401
            },
            {
              "w": "legal",
              "de": 401,
              "ate": 412
            },
            {
              "w": "brasileiro.",
              "de": 412,
              "ate": 430
            }
          ]
        },
        {
          "id": "L37",
          "cena": "s8",
          "fraseId": "s08_01",
          "de": -5,
          "ate": 147,
          "palavras": [
            {
              "w": "A",
              "de": 10,
              "ate": 13
            },
            {
              "w": "receita",
              "de": 13,
              "ate": 32
            },
            {
              "w": "vem",
              "de": 32,
              "ate": 38
            },
            {
              "w": "da",
              "de": 38,
              "ate": 41
            },
            {
              "w": "assinatura",
              "de": 41,
              "ate": 58
            },
            {
              "w": "anual",
              "de": 58,
              "ate": 68
            },
            {
              "w": "do",
              "de": 68,
              "ate": 71
            },
            {
              "w": "titular",
              "de": 71,
              "ate": 88
            },
            {
              "w": "e",
              "de": 88,
              "ate": 92
            },
            {
              "w": "de",
              "de": 92,
              "ate": 95
            },
            {
              "w": "uma",
              "de": 95,
              "ate": 100
            },
            {
              "w": "taxa",
              "de": 100,
              "ate": 112
            },
            {
              "w": "na",
              "de": 112,
              "ate": 114
            },
            {
              "w": "liberação.",
              "de": 114,
              "ate": 135
            }
          ]
        },
        {
          "id": "L38",
          "cena": "s8",
          "fraseId": "s08_02",
          "de": 147,
          "ate": 340,
          "palavras": [
            {
              "w": "Escritórios",
              "de": 147,
              "ate": 168
            },
            {
              "w": "de",
              "de": 168,
              "ate": 171
            },
            {
              "w": "advocacia,",
              "de": 171,
              "ate": 196
            },
            {
              "w": "cartórios,",
              "de": 201,
              "ate": 222
            },
            {
              "w": "bancos",
              "de": 227,
              "ate": 240
            },
            {
              "w": "e",
              "de": 240,
              "ate": 244
            },
            {
              "w": "seguradoras",
              "de": 244,
              "ate": 265
            },
            {
              "w": "são",
              "de": 265,
              "ate": 269
            },
            {
              "w": "parceiros",
              "de": 269,
              "ate": 283
            },
            {
              "w": "previstos",
              "de": 283,
              "ate": 303
            },
            {
              "w": "e",
              "de": 303,
              "ate": 306
            },
            {
              "w": "canais",
              "de": 306,
              "ate": 317
            },
            {
              "w": "de",
              "de": 317,
              "ate": 320
            },
            {
              "w": "venda.",
              "de": 320,
              "ate": 332
            }
          ]
        },
        {
          "id": "L39",
          "cena": "s8",
          "fraseId": "s08_03",
          "de": 340,
          "ate": 458,
          "palavras": [
            {
              "w": "Os",
              "de": 344,
              "ate": 348
            },
            {
              "w": "valores",
              "de": 348,
              "ate": 364
            },
            {
              "w": "serão",
              "de": 364,
              "ate": 371
            },
            {
              "w": "definidos",
              "de": 371,
              "ate": 388
            },
            {
              "w": "depois",
              "de": 388,
              "ate": 399
            },
            {
              "w": "da",
              "de": 399,
              "ate": 403
            },
            {
              "w": "pesquisa",
              "de": 403,
              "ate": 421
            },
            {
              "w": "com",
              "de": 421,
              "ate": 428
            },
            {
              "w": "usuários.",
              "de": 428,
              "ate": 448
            }
          ]
        },
        {
          "id": "L40",
          "cena": "s9",
          "fraseId": "s09_01",
          "de": 6,
          "ate": 215,
          "palavras": [
            {
              "w": "Somos",
              "de": 10,
              "ate": 21
            },
            {
              "w": "um",
              "de": 21,
              "ate": 25
            },
            {
              "w": "projeto",
              "de": 25,
              "ate": 38
            },
            {
              "w": "de",
              "de": 38,
              "ate": 40
            },
            {
              "w": "faculdade;",
              "de": 40,
              "ate": 62
            },
            {
              "w": "escritórios,",
              "de": 68,
              "ate": 91
            },
            {
              "w": "cartórios",
              "de": 96,
              "ate": 115
            },
            {
              "w": "e",
              "de": 115,
              "ate": 121
            },
            {
              "w": "verificação",
              "de": 121,
              "ate": 144
            },
            {
              "w": "de",
              "de": 144,
              "ate": 146
            },
            {
              "w": "identidade",
              "de": 146,
              "ate": 166
            },
            {
              "w": "são",
              "de": 166,
              "ate": 171
            },
            {
              "w": "parceiros",
              "de": 171,
              "ate": 185
            },
            {
              "w": "previstos.",
              "de": 185,
              "ate": 207
            }
          ]
        },
        {
          "id": "L41",
          "cena": "s9",
          "fraseId": "s09_02",
          "de": 215,
          "ate": 408,
          "palavras": [
            {
              "w": "Próximos",
              "de": 219,
              "ate": 233
            },
            {
              "w": "passos:",
              "de": 233,
              "ate": 249
            },
            {
              "w": "validar",
              "de": 257,
              "ate": 271
            },
            {
              "w": "com",
              "de": 271,
              "ate": 275
            },
            {
              "w": "um",
              "de": 275,
              "ate": 277
            },
            {
              "w": "advogado",
              "de": 277,
              "ate": 295
            },
            {
              "w": "de",
              "de": 295,
              "ate": 298
            },
            {
              "w": "sucessões,",
              "de": 298,
              "ate": 321
            },
            {
              "w": "ouvir",
              "de": 326,
              "ate": 338
            },
            {
              "w": "usuários",
              "de": 338,
              "ate": 354
            },
            {
              "w": "e",
              "de": 354,
              "ate": 358
            },
            {
              "w": "construir",
              "de": 358,
              "ate": 375
            },
            {
              "w": "o",
              "de": 375,
              "ate": 378
            },
            {
              "w": "MVP.",
              "de": 378,
              "ate": 400
            }
          ]
        },
        {
          "id": "L42",
          "cena": "s9",
          "fraseId": "s09_03",
          "de": 408,
          "ate": 576,
          "palavras": [
            {
              "w": "Herança",
              "de": 412,
              "ate": 425
            },
            {
              "w": "Digital:",
              "de": 425,
              "ate": 442
            },
            {
              "w": "seus",
              "de": 449,
              "ate": 458
            },
            {
              "w": "dados,",
              "de": 458,
              "ate": 475
            },
            {
              "w": "sua",
              "de": 480,
              "ate": 486
            },
            {
              "w": "história,",
              "de": 486,
              "ate": 501
            },
            {
              "w": "seu",
              "de": 507,
              "ate": 515
            },
            {
              "w": "futuro.",
              "de": 515,
              "ate": 532
            },
            {
              "w": "Obrigado!",
              "de": 542,
              "ate": 566
            }
          ]
        }
      ],
      "sfx": [
        {
          "id": "x001",
          "cena": "s1",
          "frame": 8,
          "som": "impact_low",
          "ganhoDb": -8
        },
        {
          "id": "x002",
          "cena": "s1",
          "frame": 10,
          "som": "thunk",
          "ganhoDb": -19
        },
        {
          "id": "x003",
          "cena": "s1",
          "frame": 20,
          "som": "thunk",
          "ganhoDb": -19
        },
        {
          "id": "x004",
          "cena": "s1",
          "frame": 28,
          "som": "thunk",
          "ganhoDb": -19
        },
        {
          "id": "x005",
          "cena": "s1",
          "frame": 54,
          "som": "whoosh_short",
          "ganhoDb": -17
        },
        {
          "id": "x006",
          "cena": "s1",
          "frame": 80,
          "som": "pop",
          "ganhoDb": -13
        },
        {
          "id": "x007",
          "cena": "s1",
          "frame": 81,
          "som": "impact_low",
          "ganhoDb": -17
        },
        {
          "id": "x008",
          "cena": "s1",
          "frame": 108,
          "som": "whoosh_short",
          "ganhoDb": -17
        },
        {
          "id": "x009",
          "cena": "s1",
          "frame": 119,
          "som": "pop",
          "ganhoDb": -13
        },
        {
          "id": "x010",
          "cena": "s1",
          "frame": 120,
          "som": "impact_low",
          "ganhoDb": -17
        },
        {
          "id": "x011",
          "cena": "s1",
          "frame": 147,
          "som": "whoosh_short",
          "ganhoDb": -17
        },
        {
          "id": "x012",
          "cena": "s1",
          "frame": 162,
          "som": "pop",
          "ganhoDb": -13
        },
        {
          "id": "x013",
          "cena": "s1",
          "frame": 163,
          "som": "impact_low",
          "ganhoDb": -17
        },
        {
          "id": "x014",
          "cena": "s1",
          "frame": 175,
          "som": "pop",
          "ganhoDb": -20
        },
        {
          "id": "x015",
          "cena": "s1",
          "frame": 176,
          "som": "whoosh_long",
          "ganhoDb": -16
        },
        {
          "id": "x016",
          "cena": "s1",
          "frame": 178,
          "som": "pop",
          "ganhoDb": -20
        },
        {
          "id": "x017",
          "cena": "s1",
          "frame": 178,
          "som": "thunk",
          "ganhoDb": -13
        },
        {
          "id": "x018",
          "cena": "s1",
          "frame": 181,
          "som": "pop",
          "ganhoDb": -20
        },
        {
          "id": "x019",
          "cena": "s1",
          "frame": 184,
          "som": "pop",
          "ganhoDb": -20
        },
        {
          "id": "x020",
          "cena": "s1",
          "frame": 186,
          "som": "thunk",
          "ganhoDb": -13
        },
        {
          "id": "x021",
          "cena": "s1",
          "frame": 194,
          "som": "thunk",
          "ganhoDb": -13
        },
        {
          "id": "x022",
          "cena": "s1",
          "frame": 202,
          "som": "thunk",
          "ganhoDb": -13
        },
        {
          "id": "x023",
          "cena": "s1",
          "frame": 210,
          "som": "thunk",
          "ganhoDb": -13
        },
        {
          "id": "x024",
          "cena": "s1",
          "frame": 218,
          "som": "thunk",
          "ganhoDb": -13
        },
        {
          "id": "x025",
          "cena": "s1",
          "frame": 226,
          "som": "thunk",
          "ganhoDb": -13
        },
        {
          "id": "x026",
          "cena": "s1",
          "frame": 230,
          "som": "glitch_zap",
          "ganhoDb": -14
        },
        {
          "id": "x027",
          "cena": "s1",
          "frame": 234,
          "som": "riser",
          "ganhoDb": -17
        },
        {
          "id": "x028",
          "cena": "s1",
          "frame": 244,
          "som": "impact_low",
          "ganhoDb": -9
        },
        {
          "id": "x029",
          "cena": "s1",
          "frame": 244,
          "som": "stinger_logo",
          "ganhoDb": -12
        },
        {
          "id": "x030",
          "cena": "s1",
          "frame": 273,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x031",
          "cena": "s1",
          "frame": 321,
          "som": "type",
          "ganhoDb": -22
        },
        {
          "id": "x032",
          "cena": "s1",
          "frame": 324,
          "som": "type",
          "ganhoDb": -22
        },
        {
          "id": "x033",
          "cena": "s1",
          "frame": 327,
          "som": "type",
          "ganhoDb": -22
        },
        {
          "id": "x034",
          "cena": "s1",
          "frame": 330,
          "som": "type",
          "ganhoDb": -22
        },
        {
          "id": "x035",
          "cena": "s1",
          "frame": 333,
          "som": "type",
          "ganhoDb": -22
        },
        {
          "id": "x036",
          "cena": "s1",
          "frame": 336,
          "som": "type",
          "ganhoDb": -22
        },
        {
          "id": "x037",
          "cena": "s2",
          "frame": 0,
          "som": "whoosh_long",
          "ganhoDb": -16
        },
        {
          "id": "x038",
          "cena": "s2",
          "frame": 42,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x039",
          "cena": "s2",
          "frame": 60,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x040",
          "cena": "s2",
          "frame": 92,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x041",
          "cena": "s2",
          "frame": 125,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x042",
          "cena": "s2",
          "frame": 157,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x043",
          "cena": "s2",
          "frame": 192,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x044",
          "cena": "s2",
          "frame": 204,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x045",
          "cena": "s2",
          "frame": 229,
          "som": "whoosh_short",
          "ganhoDb": -17
        },
        {
          "id": "x046",
          "cena": "s2",
          "frame": 296,
          "som": "impact_low",
          "ganhoDb": -14.9
        },
        {
          "id": "x047",
          "cena": "s2",
          "frame": 302,
          "som": "glitch_zap",
          "ganhoDb": -17
        },
        {
          "id": "x048",
          "cena": "s2",
          "frame": 316,
          "som": "whoosh_short",
          "ganhoDb": -17
        },
        {
          "id": "x049",
          "cena": "s2",
          "frame": 320,
          "som": "type",
          "ganhoDb": -22
        },
        {
          "id": "x050",
          "cena": "s2",
          "frame": 323,
          "som": "type",
          "ganhoDb": -22
        },
        {
          "id": "x051",
          "cena": "s2",
          "frame": 326,
          "som": "type",
          "ganhoDb": -22
        },
        {
          "id": "x052",
          "cena": "s2",
          "frame": 329,
          "som": "type",
          "ganhoDb": -22
        },
        {
          "id": "x053",
          "cena": "s2",
          "frame": 332,
          "som": "type",
          "ganhoDb": -22
        },
        {
          "id": "x054",
          "cena": "s2",
          "frame": 334,
          "som": "thunk",
          "ganhoDb": -14
        },
        {
          "id": "x055",
          "cena": "s2",
          "frame": 338,
          "som": "impact_low",
          "ganhoDb": -14
        },
        {
          "id": "x056",
          "cena": "s2",
          "frame": 354,
          "som": "whoosh_short",
          "ganhoDb": -17
        },
        {
          "id": "x057",
          "cena": "s2",
          "frame": 399,
          "som": "whoosh_short",
          "ganhoDb": -17
        },
        {
          "id": "x058",
          "cena": "s2",
          "frame": 402,
          "som": "impact_low",
          "ganhoDb": -11
        },
        {
          "id": "x059",
          "cena": "s2",
          "frame": 455,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x060",
          "cena": "s2",
          "frame": 481,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x061",
          "cena": "s2",
          "frame": 489,
          "som": "tick",
          "ganhoDb": -21
        },
        {
          "id": "x062",
          "cena": "s2",
          "frame": 498,
          "som": "tick",
          "ganhoDb": -21
        },
        {
          "id": "x063",
          "cena": "s2",
          "frame": 507,
          "som": "tick",
          "ganhoDb": -21
        },
        {
          "id": "x064",
          "cena": "s2",
          "frame": 516,
          "som": "tick",
          "ganhoDb": -21
        },
        {
          "id": "x065",
          "cena": "s2",
          "frame": 525,
          "som": "tick",
          "ganhoDb": -21
        },
        {
          "id": "x066",
          "cena": "s2",
          "frame": 533,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x067",
          "cena": "s2",
          "frame": 534,
          "som": "tick",
          "ganhoDb": -21
        },
        {
          "id": "x068",
          "cena": "s2",
          "frame": 575,
          "som": "glitch_zap",
          "ganhoDb": -17
        },
        {
          "id": "x069",
          "cena": "s2",
          "frame": 614,
          "som": "whoosh_short",
          "ganhoDb": -17
        },
        {
          "id": "x070",
          "cena": "s3",
          "frame": 49,
          "som": "impact_low",
          "ganhoDb": -14
        },
        {
          "id": "x071",
          "cena": "s3",
          "frame": 122,
          "som": "whoosh_long",
          "ganhoDb": -16
        },
        {
          "id": "x072",
          "cena": "s3",
          "frame": 140,
          "som": "lock_click",
          "ganhoDb": -15
        },
        {
          "id": "x073",
          "cena": "s3",
          "frame": 195,
          "som": "tick",
          "ganhoDb": -21
        },
        {
          "id": "x074",
          "cena": "s3",
          "frame": 204,
          "som": "tick",
          "ganhoDb": -21
        },
        {
          "id": "x075",
          "cena": "s3",
          "frame": 213,
          "som": "tick",
          "ganhoDb": -21
        },
        {
          "id": "x076",
          "cena": "s3",
          "frame": 222,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x077",
          "cena": "s3",
          "frame": 230,
          "som": "whoosh_short",
          "ganhoDb": -17
        },
        {
          "id": "x078",
          "cena": "s3",
          "frame": 234,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x079",
          "cena": "s3",
          "frame": 283,
          "som": "whoosh_short",
          "ganhoDb": -17
        },
        {
          "id": "x080",
          "cena": "s3",
          "frame": 287,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x081",
          "cena": "s3",
          "frame": 315,
          "som": "glitch_zap",
          "ganhoDb": -17
        },
        {
          "id": "x082",
          "cena": "s3",
          "frame": 333,
          "som": "lock_click",
          "ganhoDb": -15
        },
        {
          "id": "x083",
          "cena": "s3",
          "frame": 363,
          "som": "whoosh_short",
          "ganhoDb": -17
        },
        {
          "id": "x084",
          "cena": "s3",
          "frame": 367,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x085",
          "cena": "s3",
          "frame": 418,
          "som": "chime_ok",
          "ganhoDb": -16
        },
        {
          "id": "x086",
          "cena": "s3",
          "frame": 495,
          "som": "whoosh_long",
          "ganhoDb": -16
        },
        {
          "id": "x087",
          "cena": "s3",
          "frame": 505,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x088",
          "cena": "s3",
          "frame": 511,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x089",
          "cena": "s3",
          "frame": 517,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x090",
          "cena": "s3",
          "frame": 542,
          "som": "whoosh_short",
          "ganhoDb": -17
        },
        {
          "id": "x091",
          "cena": "s4",
          "frame": 19,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x092",
          "cena": "s4",
          "frame": 27,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x093",
          "cena": "s4",
          "frame": 35,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x094",
          "cena": "s4",
          "frame": 103,
          "som": "tick",
          "ganhoDb": -21
        },
        {
          "id": "x095",
          "cena": "s4",
          "frame": 109,
          "som": "tick",
          "ganhoDb": -21
        },
        {
          "id": "x096",
          "cena": "s4",
          "frame": 115,
          "som": "tick",
          "ganhoDb": -21
        },
        {
          "id": "x097",
          "cena": "s4",
          "frame": 146,
          "som": "whoosh_short",
          "ganhoDb": -17
        },
        {
          "id": "x098",
          "cena": "s4",
          "frame": 159,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x099",
          "cena": "s4",
          "frame": 200,
          "som": "impact_low",
          "ganhoDb": -11
        },
        {
          "id": "x100",
          "cena": "s4",
          "frame": 202,
          "som": "thunk",
          "ganhoDb": -14
        },
        {
          "id": "x101",
          "cena": "s4",
          "frame": 229,
          "som": "whoosh_short",
          "ganhoDb": -17
        },
        {
          "id": "x102",
          "cena": "s4",
          "frame": 252,
          "som": "tick",
          "ganhoDb": -21
        },
        {
          "id": "x103",
          "cena": "s4",
          "frame": 266,
          "som": "tick",
          "ganhoDb": -21
        },
        {
          "id": "x104",
          "cena": "s4",
          "frame": 284,
          "som": "tick",
          "ganhoDb": -21
        },
        {
          "id": "x105",
          "cena": "s4",
          "frame": 290,
          "som": "tick",
          "ganhoDb": -21
        },
        {
          "id": "x106",
          "cena": "s4",
          "frame": 296,
          "som": "tick",
          "ganhoDb": -21
        },
        {
          "id": "x107",
          "cena": "s4",
          "frame": 302,
          "som": "tick",
          "ganhoDb": -21
        },
        {
          "id": "x108",
          "cena": "s4",
          "frame": 310,
          "som": "chime_ok",
          "ganhoDb": -16
        },
        {
          "id": "x109",
          "cena": "s4",
          "frame": 331,
          "som": "lock_click",
          "ganhoDb": -15
        },
        {
          "id": "x110",
          "cena": "s4",
          "frame": 338,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x111",
          "cena": "s4",
          "frame": 346,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x112",
          "cena": "s4",
          "frame": 354,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x113",
          "cena": "s4",
          "frame": 387,
          "som": "chime_ok",
          "ganhoDb": -16
        },
        {
          "id": "x114",
          "cena": "s4",
          "frame": 430,
          "som": "whoosh_short",
          "ganhoDb": -17
        },
        {
          "id": "x115",
          "cena": "s5",
          "frame": 10,
          "som": "impact_low",
          "ganhoDb": -14
        },
        {
          "id": "x116",
          "cena": "s5",
          "frame": 45,
          "som": "whoosh_long",
          "ganhoDb": -16
        },
        {
          "id": "x117",
          "cena": "s5",
          "frame": 92,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x118",
          "cena": "s5",
          "frame": 94,
          "som": "ping",
          "ganhoDb": -17
        },
        {
          "id": "x119",
          "cena": "s5",
          "frame": 135,
          "som": "whoosh_short",
          "ganhoDb": -17
        },
        {
          "id": "x120",
          "cena": "s5",
          "frame": 147,
          "som": "tick",
          "ganhoDb": -21
        },
        {
          "id": "x121",
          "cena": "s5",
          "frame": 150,
          "som": "tick",
          "ganhoDb": -21
        },
        {
          "id": "x122",
          "cena": "s5",
          "frame": 153,
          "som": "tick",
          "ganhoDb": -21
        },
        {
          "id": "x123",
          "cena": "s5",
          "frame": 156,
          "som": "tick",
          "ganhoDb": -21
        },
        {
          "id": "x124",
          "cena": "s5",
          "frame": 159,
          "som": "tick",
          "ganhoDb": -21
        },
        {
          "id": "x125",
          "cena": "s5",
          "frame": 162,
          "som": "tick",
          "ganhoDb": -21
        },
        {
          "id": "x126",
          "cena": "s5",
          "frame": 165,
          "som": "tick",
          "ganhoDb": -21
        },
        {
          "id": "x127",
          "cena": "s5",
          "frame": 168,
          "som": "tick",
          "ganhoDb": -21
        },
        {
          "id": "x128",
          "cena": "s5",
          "frame": 173,
          "som": "tick",
          "ganhoDb": -21
        },
        {
          "id": "x129",
          "cena": "s5",
          "frame": 176,
          "som": "tick",
          "ganhoDb": -21
        },
        {
          "id": "x130",
          "cena": "s5",
          "frame": 179,
          "som": "tick",
          "ganhoDb": -21
        },
        {
          "id": "x131",
          "cena": "s5",
          "frame": 182,
          "som": "tick",
          "ganhoDb": -21
        },
        {
          "id": "x132",
          "cena": "s5",
          "frame": 185,
          "som": "tick",
          "ganhoDb": -21
        },
        {
          "id": "x133",
          "cena": "s5",
          "frame": 194,
          "som": "thunk",
          "ganhoDb": -14
        },
        {
          "id": "x134",
          "cena": "s5",
          "frame": 206,
          "som": "whoosh_short",
          "ganhoDb": -17
        },
        {
          "id": "x135",
          "cena": "s5",
          "frame": 253,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x136",
          "cena": "s5",
          "frame": 268,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x137",
          "cena": "s5",
          "frame": 303,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x138",
          "cena": "s5",
          "frame": 326,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x139",
          "cena": "s5",
          "frame": 344,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x140",
          "cena": "s5",
          "frame": 383,
          "som": "whoosh_short",
          "ganhoDb": -17
        },
        {
          "id": "x141",
          "cena": "s5",
          "frame": 408,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x142",
          "cena": "s5",
          "frame": 432,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x143",
          "cena": "s5",
          "frame": 465,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x144",
          "cena": "s5",
          "frame": 490,
          "som": "whoosh_short",
          "ganhoDb": -17
        },
        {
          "id": "x145",
          "cena": "s5",
          "frame": 531,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x146",
          "cena": "s5",
          "frame": 537,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x147",
          "cena": "s5",
          "frame": 543,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x148",
          "cena": "s5",
          "frame": 560,
          "som": "whoosh_short",
          "ganhoDb": -17
        },
        {
          "id": "x149",
          "cena": "s5",
          "frame": 585,
          "som": "tick",
          "ganhoDb": -21
        },
        {
          "id": "x150",
          "cena": "s5",
          "frame": 604,
          "som": "tick",
          "ganhoDb": -21
        },
        {
          "id": "x151",
          "cena": "s5",
          "frame": 623,
          "som": "tick",
          "ganhoDb": -21
        },
        {
          "id": "x152",
          "cena": "s5",
          "frame": 646,
          "som": "tick",
          "ganhoDb": -21
        },
        {
          "id": "x153",
          "cena": "s5",
          "frame": 664,
          "som": "lock_click",
          "ganhoDb": -15
        },
        {
          "id": "x154",
          "cena": "s5",
          "frame": 685,
          "som": "whoosh_short",
          "ganhoDb": -17
        },
        {
          "id": "x155",
          "cena": "s5",
          "frame": 771,
          "som": "chime_ok",
          "ganhoDb": -16
        },
        {
          "id": "x156",
          "cena": "s5",
          "frame": 813,
          "som": "chime_ok",
          "ganhoDb": -16
        },
        {
          "id": "x157",
          "cena": "s5",
          "frame": 875,
          "som": "shutter",
          "ganhoDb": -15
        },
        {
          "id": "x158",
          "cena": "s5",
          "frame": 901,
          "som": "chime_ok",
          "ganhoDb": -16
        },
        {
          "id": "x159",
          "cena": "s5",
          "frame": 931,
          "som": "whoosh_short",
          "ganhoDb": -17
        },
        {
          "id": "x160",
          "cena": "s5",
          "frame": 950,
          "som": "tick",
          "ganhoDb": -21
        },
        {
          "id": "x161",
          "cena": "s5",
          "frame": 986,
          "som": "ping",
          "ganhoDb": -17
        },
        {
          "id": "x162",
          "cena": "s5",
          "frame": 994,
          "som": "ping",
          "ganhoDb": -17
        },
        {
          "id": "x163",
          "cena": "s5",
          "frame": 1002,
          "som": "ping",
          "ganhoDb": -17
        },
        {
          "id": "x164",
          "cena": "s5",
          "frame": 1016,
          "som": "whoosh_short",
          "ganhoDb": -17
        },
        {
          "id": "x165",
          "cena": "s5",
          "frame": 1022,
          "som": "impact_low",
          "ganhoDb": -11
        },
        {
          "id": "x166",
          "cena": "s5",
          "frame": 1046,
          "som": "whoosh_short",
          "ganhoDb": -17
        },
        {
          "id": "x167",
          "cena": "s5",
          "frame": 1056,
          "som": "whoosh_long",
          "ganhoDb": -16
        },
        {
          "id": "x168",
          "cena": "s5",
          "frame": 1116,
          "som": "lock_click",
          "ganhoDb": -15
        },
        {
          "id": "x169",
          "cena": "s5",
          "frame": 1150,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x170",
          "cena": "s5",
          "frame": 1170,
          "som": "chime_ok",
          "ganhoDb": -16
        },
        {
          "id": "x171",
          "cena": "s5",
          "frame": 1238,
          "som": "whoosh_short",
          "ganhoDb": -17
        },
        {
          "id": "x172",
          "cena": "s6",
          "frame": 33,
          "som": "thunk",
          "ganhoDb": -14
        },
        {
          "id": "x173",
          "cena": "s6",
          "frame": 47,
          "som": "thunk",
          "ganhoDb": -18.4
        },
        {
          "id": "x174",
          "cena": "s6",
          "frame": 105,
          "som": "glitch_zap",
          "ganhoDb": -17
        },
        {
          "id": "x175",
          "cena": "s6",
          "frame": 123,
          "som": "whoosh_short",
          "ganhoDb": -17
        },
        {
          "id": "x176",
          "cena": "s6",
          "frame": 141,
          "som": "tick",
          "ganhoDb": -21
        },
        {
          "id": "x177",
          "cena": "s6",
          "frame": 221,
          "som": "riser",
          "ganhoDb": -17
        },
        {
          "id": "x178",
          "cena": "s6",
          "frame": 221,
          "som": "impact_low",
          "ganhoDb": -11
        },
        {
          "id": "x179",
          "cena": "s6",
          "frame": 231,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x180",
          "cena": "s6",
          "frame": 237,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x181",
          "cena": "s6",
          "frame": 243,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x182",
          "cena": "s6",
          "frame": 265,
          "som": "lock_click",
          "ganhoDb": -15
        },
        {
          "id": "x183",
          "cena": "s6",
          "frame": 294,
          "som": "chime_ok",
          "ganhoDb": -16
        },
        {
          "id": "x184",
          "cena": "s6",
          "frame": 363,
          "som": "glitch_zap",
          "ganhoDb": -17
        },
        {
          "id": "x185",
          "cena": "s6",
          "frame": 388,
          "som": "whoosh_short",
          "ganhoDb": -17
        },
        {
          "id": "x186",
          "cena": "s6",
          "frame": 446,
          "som": "whoosh_short",
          "ganhoDb": -17
        },
        {
          "id": "x187",
          "cena": "s6",
          "frame": 493,
          "som": "ping",
          "ganhoDb": -17
        },
        {
          "id": "x188",
          "cena": "s6",
          "frame": 554,
          "som": "rewind",
          "ganhoDb": -15
        },
        {
          "id": "x189",
          "cena": "s6",
          "frame": 578,
          "som": "chime_ok",
          "ganhoDb": -16
        },
        {
          "id": "x190",
          "cena": "s6",
          "frame": 606,
          "som": "whoosh_short",
          "ganhoDb": -17
        },
        {
          "id": "x191",
          "cena": "s7",
          "frame": 7,
          "som": "whoosh_short",
          "ganhoDb": -17
        },
        {
          "id": "x192",
          "cena": "s7",
          "frame": 66,
          "som": "lock_click",
          "ganhoDb": -18.4
        },
        {
          "id": "x193",
          "cena": "s7",
          "frame": 72,
          "som": "lock_click",
          "ganhoDb": -18.4
        },
        {
          "id": "x194",
          "cena": "s7",
          "frame": 78,
          "som": "lock_click",
          "ganhoDb": -18.4
        },
        {
          "id": "x195",
          "cena": "s7",
          "frame": 84,
          "som": "lock_click",
          "ganhoDb": -18.4
        },
        {
          "id": "x196",
          "cena": "s7",
          "frame": 136,
          "som": "whoosh_short",
          "ganhoDb": -17
        },
        {
          "id": "x197",
          "cena": "s7",
          "frame": 155,
          "som": "lock_click",
          "ganhoDb": -18.4
        },
        {
          "id": "x198",
          "cena": "s7",
          "frame": 161,
          "som": "lock_click",
          "ganhoDb": -18.4
        },
        {
          "id": "x199",
          "cena": "s7",
          "frame": 167,
          "som": "lock_click",
          "ganhoDb": -18.4
        },
        {
          "id": "x200",
          "cena": "s7",
          "frame": 173,
          "som": "lock_click",
          "ganhoDb": -18.4
        },
        {
          "id": "x201",
          "cena": "s7",
          "frame": 290,
          "som": "whoosh_short",
          "ganhoDb": -17
        },
        {
          "id": "x202",
          "cena": "s7",
          "frame": 317,
          "som": "thunk",
          "ganhoDb": -14
        },
        {
          "id": "x203",
          "cena": "s7",
          "frame": 324,
          "som": "thunk",
          "ganhoDb": -14
        },
        {
          "id": "x204",
          "cena": "s7",
          "frame": 330,
          "som": "chime_ok",
          "ganhoDb": -16
        },
        {
          "id": "x205",
          "cena": "s7",
          "frame": 331,
          "som": "thunk",
          "ganhoDb": -14
        },
        {
          "id": "x206",
          "cena": "s7",
          "frame": 338,
          "som": "thunk",
          "ganhoDb": -14
        },
        {
          "id": "x207",
          "cena": "s7",
          "frame": 352,
          "som": "whoosh_long",
          "ganhoDb": -16
        },
        {
          "id": "x208",
          "cena": "s7",
          "frame": 454,
          "som": "whoosh_short",
          "ganhoDb": -17
        },
        {
          "id": "x209",
          "cena": "s8",
          "frame": 4,
          "som": "impact_low",
          "ganhoDb": -14.9
        },
        {
          "id": "x210",
          "cena": "s8",
          "frame": 35,
          "som": "whoosh_short",
          "ganhoDb": -17
        },
        {
          "id": "x211",
          "cena": "s8",
          "frame": 45,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x212",
          "cena": "s8",
          "frame": 94,
          "som": "whoosh_short",
          "ganhoDb": -17
        },
        {
          "id": "x213",
          "cena": "s8",
          "frame": 104,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x214",
          "cena": "s8",
          "frame": 141,
          "som": "whoosh_short",
          "ganhoDb": -17
        },
        {
          "id": "x215",
          "cena": "s8",
          "frame": 151,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x216",
          "cena": "s8",
          "frame": 195,
          "som": "whoosh_short",
          "ganhoDb": -17
        },
        {
          "id": "x217",
          "cena": "s8",
          "frame": 205,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x218",
          "cena": "s8",
          "frame": 221,
          "som": "whoosh_short",
          "ganhoDb": -17
        },
        {
          "id": "x219",
          "cena": "s8",
          "frame": 231,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x220",
          "cena": "s8",
          "frame": 280,
          "som": "thunk",
          "ganhoDb": -14
        },
        {
          "id": "x221",
          "cena": "s8",
          "frame": 285,
          "som": "thunk",
          "ganhoDb": -14
        },
        {
          "id": "x222",
          "cena": "s8",
          "frame": 345,
          "som": "type",
          "ganhoDb": -22
        },
        {
          "id": "x223",
          "cena": "s8",
          "frame": 348,
          "som": "type",
          "ganhoDb": -22
        },
        {
          "id": "x224",
          "cena": "s8",
          "frame": 351,
          "som": "type",
          "ganhoDb": -22
        },
        {
          "id": "x225",
          "cena": "s8",
          "frame": 354,
          "som": "type",
          "ganhoDb": -22
        },
        {
          "id": "x226",
          "cena": "s8",
          "frame": 357,
          "som": "type",
          "ganhoDb": -22
        },
        {
          "id": "x227",
          "cena": "s8",
          "frame": 360,
          "som": "type",
          "ganhoDb": -22
        },
        {
          "id": "x228",
          "cena": "s8",
          "frame": 363,
          "som": "type",
          "ganhoDb": -22
        },
        {
          "id": "x229",
          "cena": "s8",
          "frame": 366,
          "som": "type",
          "ganhoDb": -22
        },
        {
          "id": "x230",
          "cena": "s8",
          "frame": 478,
          "som": "whoosh_short",
          "ganhoDb": -17
        },
        {
          "id": "x231",
          "cena": "s9",
          "frame": 7,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x232",
          "cena": "s9",
          "frame": 13,
          "som": "type",
          "ganhoDb": -22
        },
        {
          "id": "x233",
          "cena": "s9",
          "frame": 14,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x234",
          "cena": "s9",
          "frame": 16,
          "som": "type",
          "ganhoDb": -22
        },
        {
          "id": "x235",
          "cena": "s9",
          "frame": 19,
          "som": "type",
          "ganhoDb": -22
        },
        {
          "id": "x236",
          "cena": "s9",
          "frame": 21,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x237",
          "cena": "s9",
          "frame": 22,
          "som": "type",
          "ganhoDb": -22
        },
        {
          "id": "x238",
          "cena": "s9",
          "frame": 25,
          "som": "type",
          "ganhoDb": -22
        },
        {
          "id": "x239",
          "cena": "s9",
          "frame": 28,
          "som": "type",
          "ganhoDb": -22
        },
        {
          "id": "x240",
          "cena": "s9",
          "frame": 31,
          "som": "type",
          "ganhoDb": -22
        },
        {
          "id": "x241",
          "cena": "s9",
          "frame": 34,
          "som": "type",
          "ganhoDb": -22
        },
        {
          "id": "x242",
          "cena": "s9",
          "frame": 37,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x243",
          "cena": "s9",
          "frame": 65,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x244",
          "cena": "s9",
          "frame": 93,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x245",
          "cena": "s9",
          "frame": 118,
          "som": "pop",
          "ganhoDb": -17
        },
        {
          "id": "x246",
          "cena": "s9",
          "frame": 182,
          "som": "thunk",
          "ganhoDb": -14
        },
        {
          "id": "x247",
          "cena": "s9",
          "frame": 186,
          "som": "thunk",
          "ganhoDb": -14
        },
        {
          "id": "x248",
          "cena": "s9",
          "frame": 190,
          "som": "thunk",
          "ganhoDb": -14
        },
        {
          "id": "x249",
          "cena": "s9",
          "frame": 211,
          "som": "whoosh_short",
          "ganhoDb": -17
        },
        {
          "id": "x250",
          "cena": "s9",
          "frame": 260,
          "som": "chime_ok",
          "ganhoDb": -16
        },
        {
          "id": "x251",
          "cena": "s9",
          "frame": 329,
          "som": "chime_ok",
          "ganhoDb": -16
        },
        {
          "id": "x252",
          "cena": "s9",
          "frame": 361,
          "som": "chime_ok",
          "ganhoDb": -16
        },
        {
          "id": "x253",
          "cena": "s9",
          "frame": 396,
          "som": "whoosh_long",
          "ganhoDb": -16
        },
        {
          "id": "x254",
          "cena": "s9",
          "frame": 408,
          "som": "riser",
          "ganhoDb": -17
        },
        {
          "id": "x255",
          "cena": "s9",
          "frame": 408,
          "som": "stinger_logo",
          "ganhoDb": -12
        },
        {
          "id": "x256",
          "cena": "s9",
          "frame": 539,
          "som": "impact_low",
          "ganhoDb": -14
        }
      ]
    }}
  />
);
