# Diagnóstico LIFE Pocket

Versão de autoatendimento do Diagnóstico LIFE para leads do site do Grupo Life Brasil.
O visitante entra pela página com o vídeo da família, informa nome, WhatsApp e e-mail,
responde cerca de 25 perguntas em 6 etapas (uns 5 minutos) e vê na tela:

- **Nota LIFE** (0 a 100) e o **perfil financeiro** (Em déficit, Endividado, Consumidor, Equilibrado, Poupador ou Construtor de patrimônio)
- **Estrela LIFE** com os 8 pilares do diagnóstico completo
- **Radar de Independência Financeira** com a projeção do patrimônio até a idade escolhida
- **Para onde vai a renda**, comparada ao modelo 50-30-20
- **Plano em 3 frentes**: atuar de imediato, otimizar e atuar junto com a Life (seguro, consórcio, investimentos, previdência, sucessão)
- Um convite para a **versão completa**, com o que só o planejador entrega

O botão **Falar com especialista** aparece em todas as telas.

## Publicar no site

1. Ajuste `src/config.js` (WhatsApp do especialista, URL que recebe os leads, links).
2. Se o site não for `grupolifebrasil.com.br`, ajuste `DOMINIOS_PERMITIDOS` no topo de `build.mjs`.
3. Gere a versão final:

   ```bash
   node build.mjs
   ```

4. Envie **apenas o conteúdo da pasta `dist/`** para o servidor, por exemplo em
   `grupolifebrasil.com.br/diagnostico/`. O botão do site só precisa apontar para esse endereço.
   Dá para medir campanhas pela URL: `.../diagnostico/?utm_source=instagram&utm_campaign=pocket`.

Para testar no computador sem as travas de domínio e de inspeção:

```bash
node build.mjs --dev
```

```bash
cd dist-dev && python3 -m http.server 8080
```

Depois abra `http://localhost:8080`.

## Onde chegam os leads

Com `webhookLead` preenchido, a página envia um JSON em três momentos:

| Evento | Quando |
|---|---|
| `lead_iniciou` | o lead preencheu nome, WhatsApp e e-mail |
| `diagnostico_concluido` | terminou as perguntas; inclui respostas, Nota LIFE, pilares, oportunidades e a **temperatura** (quente, morno, frio) |
| `clicou_especialista_*` | clicou para falar com um especialista |

O envio também traz o comportamento do lead: tempo total, tempo em cada pergunta, quantas vezes voltou,
origem (UTM, página de entrada) e o potencial por linha de produto (seguro, consórcio, investimentos,
previdência, sucessão, tributário, planejamento).

Para receber numa planilha Google, siga `integracoes/google-sheets-apps-script.gs`.
Funciona igual com RD Station, n8n, Make, Zapier ou HubSpot: basta uma URL que aceite POST.

## Travas de proteção

| O que o lead tenta | O que acontece |
|---|---|
| Imprimir ou salvar em PDF (Ctrl+P, menu) | a impressão sai em branco com o aviso "Impressão desabilitada" |
| Salvar a página (Ctrl+S) ou ver o código (Ctrl+U) | atalho bloqueado |
| Copiar, selecionar texto, arrastar imagens, botão direito | bloqueado |
| PrintScreen | a tela é coberta e a área de transferência é limpa |
| Win+Shift+S, Cmd+Shift+3/4/5, Ctrl+Shift+S | a tela é coberta antes da captura |
| Ferramenta de recorte ou trocar de janela | o diagnóstico fica oculto enquanto a janela está fora de foco |
| Abrir as ferramentas de desenvolvedor (F12) | atalhos bloqueados; se abrir pelo menu, a sessão é apagada |
| Abrir uma cópia salva da página ou hospedá-la em outro site | a página não carrega fora dos domínios permitidos |
| Ler o "motor" no código-fonte | o código vai cifrado; regras e textos do cálculo não aparecem no HTML |
| Voltar depois para ver o resultado | nada fica salvo no navegador; ao sair, o resultado some |

Sobre o resultado fica uma **marca d'água** com nome, telefone, data e hora do lead.

**Limite técnico:** nenhum site consegue impedir 100% uma captura. Uma foto da tela com outro celular,
um print no próprio celular ou um programa de gravação de tela continuam possíveis. Por isso a marca d'água
identifica quem fez a captura. Quem tiver conhecimento técnico avançado também consegue, com esforço,
decifrar o código que roda no navegador. Para blindar o motor por completo, o próximo passo é levar o
cálculo para um servidor (por exemplo, uma função na nuvem) e enviar ao navegador só o resultado pronto.

Mantenha este repositório **privado**: a pasta `src/` tem o motor legível.

## Estrutura

```
src/config.js     contatos, URL dos leads e premissas do cálculo
src/motor.js      perguntas, Estrela LIFE, perfil, independência, plano em 3 frentes e oportunidades
src/graficos.js   Estrela LIFE, Radar, projeção e barra 50-30-20 (SVG próprio, sem bibliotecas)
src/protecao.js   travas de captura, impressão, cópia e inspeção; marca d'água
src/app.js        telas: início, acesso, perguntas, processando e resultado
src/styles.css    visual
build.mjs         gera dist/ (produção) e dist-dev/ (teste)
assets/           vídeo da família (1080p e 720p), capa do vídeo, logo e ícone
```

## Premissas do cálculo

As mesmas do diagnóstico completo: retorno real de 4% ao ano, retirada de 4% ao ano na aposentadoria,
reserva de emergência de 6 meses de despesas, parcelas até 30% da renda e custo de inventário de cerca de 10%
do patrimônio (ITCMD e honorários). O INSS não entra na projeção, para manter o cenário conservador.

Cada pilar da Estrela LIFE vale de 0% a 100%. A Nota LIFE soma os pilares com o mesmo peso de sub-pilares do
diagnóstico completo (20 sub-pilares de 5 pontos = 100). Acima de 75 é saudável, de 45 a 75 pede atenção,
abaixo de 45 é crítico.
