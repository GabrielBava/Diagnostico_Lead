# Diagnóstico LIFE Dinâmico

Versão de autoatendimento do Diagnóstico LIFE para leads do site do Grupo Life Brasil.
O visitante entra pela página com o vídeo da família, informa nome, WhatsApp e e-mail,
responde cerca de 25 perguntas em 6 etapas (uns 5 minutos) e vê na tela:

- **Nota LIFE** (0 a 100) e o **perfil financeiro** (Em déficit, Endividado, Consumidor, Equilibrado, Poupador ou Construtor de patrimônio)
- **Estrela LIFE** com os 8 pilares do diagnóstico completo
- **Indicador de Independência Financeira** com a projeção do patrimônio até a idade escolhida
- **Para onde vai a renda**, comparada ao modelo 50-30-20
- **Plano em 3 frentes**: atuar de imediato, otimizar e atuar junto com a Life (seguro, consórcio, investimentos, previdência, sucessão)
- Um convite para a **versão completa**, com o que só o planejador entrega

O botão **Falar com especialista** aparece em todas as telas e abre três opções: **Ligação**, **WhatsApp** ou **E-mail**.
O lead pode abrir o canal direto ou pedir para ser contatado (com o melhor período), e o pedido cai na planilha.

No fim do resultado, **Agendar Diagnóstico Completo** abre a agenda: o lead escolhe formato, dia e horário livres,
recebe a confirmação por e-mail e o convite do Google Agenda, e o agendamento entra na planilha.

## Publicar no site

1. Conecte a planilha (seção abaixo) e cole a URL em `src/config.js`, no campo `urlPlanilha`.
2. Ainda em `src/config.js`, preencha `telefoneEspecialista` e `whatsappEspecialista` (só números, com 55 e DDD)
   e ajuste a agenda: dias da semana, horários, duração e formatos.
3. Se o site não for `grupolifebrasil.com.br`, ajuste `DOMINIOS_PERMITIDOS` no topo de `build.mjs`.
4. Gere a versão final:

   ```bash
   node build.mjs
   ```

5. Envie **apenas o conteúdo da pasta `dist/`** para o servidor, por exemplo em
   `grupolifebrasil.com.br/diagnostico/`. O botão do site só precisa apontar para esse endereço.
   Dá para medir campanhas pela URL: `.../diagnostico/?utm_source=instagram&utm_campaign=dinamico`.

Para testar no computador sem as travas de domínio e de inspeção:

```bash
node build.mjs --dev
```

```bash
cd dist-dev && python3 -m http.server 8080
```

Depois abra `http://localhost:8080`.

## Publicar na Vercel

O `vercel.json` já deixa tudo configurado: a Vercel roda `node build.mjs`, publica só a pasta `dist/`
(o código-fonte em `src/` não fica acessível) e libera o domínio do projeto na trava de domínio.

1. Na Vercel: **Add New > Project**, importe o repositório `Diagnostico_Lead` e clique em **Deploy**
   (não precisa mudar Framework, Build Command nem Output Directory).
2. Abra o endereço de produção (`seu-projeto.vercel.app`) e faça um diagnóstico de teste:
   o lead deve aparecer na aba **Leads** da planilha.
3. Para usar um endereço próprio, como `diagnostico.grupolifebrasil.com.br`, adicione o domínio em
   **Settings > Domains**. Subdomínios de `grupolifebrasil.com.br` já são liberados.

Endereços de **Preview** da Vercel (de outras branches) vêm com login da Vercel ligado por padrão:
use o endereço de produção para os leads.

Se publicar a pasta `dist/` por outro caminho (upload manual, outra hospedagem), inclua o domínio no build:

```bash
DOMINIOS_EXTRA=seu-projeto.vercel.app node build.mjs
```

## Planilha no Google Drive

O arquivo `integracoes/planilha-life.gs` transforma uma planilha do seu Drive no destino de tudo:

| Aba | O que entra |
|---|---|
| **Leads** | uma linha por lead, atualizada a cada passo: dados de contato, todas as respostas em texto, Nota LIFE, perfil, os 8 pilares, independência, plano em 3 frentes, oportunidades por produto, temperatura (quente, morno, frio), tempo de resposta, origem da campanha, pedido de contato e agendamento |
| **Pedidos de contato** | quem pediu ligação, WhatsApp ou e-mail, com o melhor período e o status (pendente) |
| **Agendamentos** | Diagnósticos Completos agendados: data, hora, formato, observação do lead, Nota LIFE e se o e-mail foi enviado |
| **Histórico** | cada evento recebido, com todos os dados |

A coluna **Status** da aba Leads mostra até onde o lead chegou: iniciou, concluiu, pediu contato ou agendou.

A cada agendamento o script também cria a reunião no seu Google Agenda, envia o convite ao lead
e um e-mail de confirmação. Os horários em que você já tem compromisso no Google Agenda,
e os já reservados por outros leads, aparecem bloqueados para o próximo lead.

**Instalação (uma vez):**

1. Crie uma planilha no Google Drive.
2. Na planilha: **Extensões > Apps Script**. Apague o conteúdo e cole o arquivo `integracoes/planilha-life.gs`.
3. Revise o bloco `AJUSTES` no topo (e-mail da equipe, link fixo de reunião online, endereço presencial).
4. Selecione a função **configurar** e clique em **Executar**. Autorize o acesso à planilha, à agenda e ao e-mail.
5. **Implantar > Nova implantação > App da Web**. Executar como: **Eu**. Quem pode acessar: **Qualquer pessoa**.
   Não use "Qualquer pessoa com Conta do Google": com login exigido, o Google recusa os envios dos leads e nada chega à planilha.
6. Copie a URL que termina em `/exec` e cole em `urlPlanilha`, no `src/config.js`. Rode `node build.mjs` e publique.

O Google limita o envio a cerca de 100 e-mails por dia em contas gratuitas e 1.500 no Google Workspace.

**Para conferir o que está no ar:** abra a URL do app com `?acao=status` no final. O certo é aparecer
`{"ok":true,"versao":"...","planilha":"...","abas":[...]}`. Se abrir a tela de login do Google,
o acesso da implantação não está como "Qualquer pessoa".
Ao trocar o script, use **Implantar > Gerenciar implantações > lápis > Versão: Nova versão**: a URL continua a mesma.

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
src/config.js     contatos, URL da planilha, agenda e premissas do cálculo
src/motor.js      perguntas, Estrela LIFE, perfil, independência, plano em 3 frentes e oportunidades
src/graficos.js   Estrela LIFE, Indicador de Independência, projeção e barra 50-30-20 (SVG próprio, sem bibliotecas)
src/protecao.js   travas de captura, impressão, cópia e inspeção; marca d'água
src/contato.js    falar com especialista (ligação, WhatsApp, e-mail), agenda e envio para a planilha
src/app.js        telas: início, acesso, perguntas, processando e resultado
src/styles.css    visual
build.mjs         gera dist/ (produção) e dist-dev/ (teste)
vercel.json       build e cabeçalhos de segurança na Vercel
integracoes/planilha-life.gs   script da planilha no Google Drive
assets/           vídeo da família (1080p e 720p), capa do vídeo, logo e ícone
```

## Premissas do cálculo

As mesmas do diagnóstico completo: retorno real de 4% ao ano, retirada de 4% ao ano na aposentadoria,
reserva de emergência de 6 meses de despesas, parcelas até 30% da renda e custo de inventário de cerca de 10%
do patrimônio (ITCMD e honorários). O INSS não entra na projeção, para manter o cenário conservador.

Cada pilar da Estrela LIFE vale de 0% a 100%. A Nota LIFE soma os pilares com o mesmo peso de sub-pilares do
diagnóstico completo (20 sub-pilares de 5 pontos = 100). Acima de 75 é saudável, de 45 a 75 pede atenção,
abaixo de 45 é crítico.
