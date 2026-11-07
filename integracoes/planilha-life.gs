/**
 * PLANILHA DO DIAGNÓSTICO LIFE DINÂMICO  (Google Apps Script)
 *
 * Grava tudo numa planilha do seu Google Drive:
 *   - Leads ............... uma linha por lead: dados, respostas, resultado, contato e agendamento
 *   - Pedidos de contato .. quem pediu ligação, WhatsApp ou e-mail (e o melhor período)
 *   - Agendamentos ........ Diagnósticos Completos agendados
 *   - Histórico ........... cada evento recebido, na íntegra
 * E, a cada agendamento: cria o evento no seu Google Agenda, envia o convite
 * e um e-mail de confirmação para o lead.
 *
 * COMO INSTALAR (uma vez, uns 5 minutos)
 * 1. No Google Drive, crie uma planilha nova (ex.: "Leads Diagnóstico LIFE").
 * 2. Na planilha: Extensões > Apps Script. Apague o que aparecer e cole este arquivo inteiro.
 * 3. Ajuste o bloco AJUSTES abaixo, se quiser, e clique em Salvar.
 * 4. Selecione a função "configurar" no topo e clique em Executar.
 *    O Google vai pedir autorização (planilha, agenda e e-mail): aceite.
 * 5. Implantar > Nova implantação > engrenagem > "App da Web".
 *    Executar como: Eu.   Quem pode acessar: Qualquer pessoa.   Implantar.
 * 6. Copie a "URL do app da Web" (termina em /exec) e cole em src/config.js, no campo urlPlanilha.
 * 7. Rode `node build.mjs` e publique a pasta dist/ no site.
 *
 * Ao alterar este script depois: Implantar > Gerenciar implantações > editar > Nova versão.
 * Limite do Google: cerca de 100 e-mails por dia em conta gratuita e 1.500 no Google Workspace.
 */

const AJUSTES = {
  FUSO: 'America/Sao_Paulo',
  DURACAO_MIN: 60,
  CRIAR_EVENTO_NA_AGENDA: true,      // cria a reunião no Google Agenda de quem implantou o script
  ENVIAR_CONVITE_DA_AGENDA: true,    // o lead recebe o convite do Google Agenda
  ENVIAR_EMAIL_CONFIRMACAO: true,    // e-mail de confirmação com data, hora e formato
  CONSIDERAR_AGENDA_OCUPADA: true,   // esconde do lead os horários em que você já tem compromisso
  EMAIL_DA_EQUIPE: '',               // opcional: quem recebe aviso de cada agendamento e pedido de contato
  NOME_REMETENTE: 'Grupo Life Brasil',
  LINK_REUNIAO_ONLINE: '',           // opcional: link fixo de Meet/Zoom/Teams para reuniões online
  ENDERECO_PRESENCIAL: '',           // opcional: endereço para reuniões presenciais
  SITE: 'https://www.grupolifebrasil.com.br'
};

const ABAS = { LEADS: 'Leads', CONTATOS: 'Pedidos de contato', AGENDA: 'Agendamentos', HISTORICO: 'Histórico' };

const COLUNAS = {
  Leads: [
    ['sessao', 'Sessão'], ['inicio', 'Primeiro acesso'], ['atualizado', 'Última atualização'], ['status', 'Status'], ['temperatura', 'Temperatura'],
    ['nome', 'Nome'], ['telefone', 'WhatsApp'], ['email', 'E-mail'],
    ['r_idade', 'Idade'], ['r_familia', 'Família'], ['r_dependentes', 'Dependentes'], ['r_trabalho', 'Renda principal'],
    ['r_renda', 'Renda mensal'], ['r_gastos', 'Custo de vida'], ['r_parcelas', 'Parcelas'], ['r_essencial', 'Parte essencial'], ['r_dividaCara', 'Crédito caro'],
    ['r_reserva', 'Reserva'], ['r_seguroVida', 'Seguro de vida'], ['r_invalidez', 'Proteção da renda'], ['r_sucessao', 'Sucessão'],
    ['r_investido', 'Investido'], ['r_ondeInveste', 'Onde investe'], ['r_aporte', 'Guarda por mês'],
    ['r_temBens', 'Imóvel ou carro'], ['r_valorBens', 'Valor dos bens'], ['r_saldoDevedor', 'Saldo a pagar'], ['r_bensSeguro', 'Seguro dos bens'],
    ['r_objetivos', 'Objetivos'], ['r_expandir', 'Pretende expandir'], ['r_valorDesejo', 'Valor desejado'], ['r_comoConquistar', 'Como pretende adquirir'],
    ['r_idadeAposentar', 'Idade para se aposentar'], ['r_estilo', 'Padrão na aposentadoria'],
    ['r_ir', 'Declaração de IR'], ['r_controle', 'Controle de gastos'], ['r_sentimento', 'Como se sente'], ['r_conhecimento', 'Segurança (0 a 10)'], ['r_prioridade', 'Prioridade'],
    ['notaLife', 'Nota LIFE'], ['perfil', 'Perfil financeiro'],
    ['p_organizacao', 'Organização (%)'], ['p_comportamento', 'Comportamento (%)'], ['p_protecao', 'Proteção (%)'], ['p_objetivos', 'Objetivos (%)'],
    ['p_acumulo', 'Acúmulo (%)'], ['p_aposentadoria', 'Aposentadoria (%)'], ['p_expansao', 'Expansão (%)'], ['p_sucessao', 'Sucessão (%)'],
    ['independencia', 'Independência financeira (%)'], ['aporteNecessario', 'Aporte necessário por mês'], ['sobra', 'Sobra mensal'],
    ['imediato', 'Atuar de imediato'], ['otimizar', 'Otimizar'], ['oportunidades', 'Oportunidades com a Life'], ['produtos', 'Potencial por produto'],
    ['contato', 'Pedido de contato'], ['agendamento', 'Diagnóstico Completo agendado'],
    ['tempo', 'Tempo de resposta (min)'], ['utm_source', 'Origem'], ['utm_medium', 'Mídia'], ['utm_campaign', 'Campanha'], ['dispositivo', 'Dispositivo']
  ],
  'Pedidos de contato': [
    ['data', 'Recebido em'], ['sessao', 'Sessão'], ['nome', 'Nome'], ['telefone', 'WhatsApp'], ['email', 'E-mail'],
    ['canal', 'Canal'], ['tipo', 'Tipo'], ['periodo', 'Melhor período'], ['origem', 'Onde clicou'], ['status', 'Status']
  ],
  Agendamentos: [
    ['registrado', 'Registrado em'], ['sessao', 'Sessão'], ['nome', 'Nome'], ['email', 'E-mail da confirmação'], ['telefone', 'WhatsApp'],
    ['quando', 'Data e hora'], ['formato', 'Formato'], ['observacao', 'Observação do lead'], ['notaLife', 'Nota LIFE'], ['perfil', 'Perfil'],
    ['temperatura', 'Temperatura'], ['status', 'Status'], ['emailEnviado', 'E-mail enviado'], ['idEvento', 'ID do evento na agenda'], ['chave', 'Chave do horário']
  ],
  'Histórico': [['data', 'Recebido em'], ['sessao', 'Sessão'], ['evento', 'Evento'], ['nome', 'Nome'], ['email', 'E-mail'], ['json', 'Dados completos']]
};

const STATUS = { lead_iniciou: 'Iniciou o diagnóstico', diagnostico_concluido: 'Concluiu o diagnóstico', contato: 'Pediu contato', agendamento: 'Agendou o Diagnóstico Completo' };
const ORDEM_STATUS = ['Iniciou o diagnóstico', 'Concluiu o diagnóstico', 'Pediu contato', 'Agendou o Diagnóstico Completo'];
const CANAL = { ligacao: 'Ligação', whatsapp: 'WhatsApp', email: 'E-mail' };

/* ------------------------------------------------------------------ */
function configurar() {
  Object.keys(COLUNAS).forEach(aba);
  CalendarApp.getDefaultCalendar();
  if (AJUSTES.ENVIAR_EMAIL_CONFIRMACAO) MailApp.getRemainingDailyQuota();
  Logger.log('Tudo pronto. Agora: Implantar > Nova implantação > App da Web.');
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.acao === 'horarios') return json(horariosOcupados(p.de, p.ate));
  return json({ ok: true, servico: 'Diagnóstico LIFE Dinâmico' });
}

function doPost(e) {
  const trava = LockService.getScriptLock();
  trava.waitLock(25000);
  try {
    const d = JSON.parse(e.postData.contents);
    d.lead = d.lead || {};
    registrarHistorico(d);
    let resposta = { ok: true };
    if (d.evento === 'agendamento') resposta = agendar(d);
    if (d.evento === 'contato_solicitado' || d.evento === 'contato_direto') registrarContato(d);
    const temLead = d.lead.nome || d.lead.telefone || d.lead.email;
    if (resposta.ok && temLead) atualizarLead(d, resposta);
    return json(resposta);
  } catch (erro) {
    return json({ ok: false, erro: String(erro) });
  } finally {
    trava.releaseLock();
  }
}

/* ------------------------------------------------------------------ */
function aba(nome) {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  let a = planilha.getSheetByName(nome);
  if (!a) {
    a = planilha.insertSheet(nome);
    const cab = COLUNAS[nome].map(c => c[1]);
    a.getRange(1, 1, 1, cab.length).setValues([cab]).setFontWeight('bold').setBackground('#1f1b1c').setFontColor('#ffffff');
    a.setFrozenRows(1);
  }
  return a;
}
function linhaDe(nome, valores) { return COLUNAS[nome].map(c => (valores[c[0]] === undefined || valores[c[0]] === null) ? '' : valores[c[0]]); }
function adicionar(nome, valores) { aba(nome).appendRow(linhaDe(nome, valores)); }
function agora() { return Utilities.formatDate(new Date(), AJUSTES.FUSO, 'dd/MM/yyyy HH:mm:ss'); }
function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function telefone(l) {
  const d = String(l.telefone || '').replace(/\D/g, '');
  if (d.length === 11) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
  if (d.length === 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
  return d;
}

function registrarHistorico(d) {
  adicionar(ABAS.HISTORICO, { data: agora(), sessao: d.sessao, evento: d.evento, nome: d.lead.nome, email: d.lead.email, json: JSON.stringify(d).slice(0, 45000) });
}

/* Uma linha por lead (pela sessão). O status só avança. */
function atualizarLead(d, resposta) {
  const nome = ABAS.LEADS, a = aba(nome), cols = COLUNAS[nome];
  const dados = a.getDataRange().getValues();
  let linha = -1;
  for (let i = 1; i < dados.length; i++) if (String(dados[i][0]) === String(d.sessao)) { linha = i; break; }
  const atual = {};
  if (linha > 0) cols.forEach((c, j) => { atual[c[0]] = dados[linha][j]; });
  const v = Object.assign({}, atual);
  v.sessao = d.sessao;
  v.atualizado = agora();
  if (!v.inicio) v.inicio = v.atualizado;
  if (d.lead.nome) v.nome = d.lead.nome;
  if (d.lead.telefone) v.telefone = telefone(d.lead);
  if (d.lead.email) v.email = d.lead.email;
  if (d.temperatura) v.temperatura = d.temperatura;

  const rt = d.respostasTexto || {};
  Object.keys(rt).forEach(k => { v['r_' + k] = rt[k]; });
  const r = d.resultado;
  if (r && d.evento === 'diagnostico_concluido') {
    v.notaLife = r.notaLife; v.perfil = r.perfil;
    Object.keys(r.pilares || {}).forEach(k => { v['p_' + k] = r.pilares[k]; });
    v.independencia = r.independenciaPct; v.aporteNecessario = r.aporteNecessario; v.sobra = r.sobraMensal;
    v.imediato = (r.atuarDeImediato || []).join(' | ');
    v.otimizar = (r.otimizar || []).join(' | ');
    v.oportunidades = (r.oportunidades || []).map(o => o.produto + ': ' + o.titulo + ' (' + o.potencial + ')').join(' | ');
    v.produtos = Object.keys(r.potencialPorProduto || {}).map(k => k + ' ' + r.potencialPorProduto[k]).join(', ');
  }
  if (d.comportamento && d.comportamento.tempoTotalSeg) v.tempo = Math.round(d.comportamento.tempoTotalSeg / 6) / 10;
  const o = d.origem || {};
  ['utm_source', 'utm_medium', 'utm_campaign'].forEach(k => { if (o[k]) v[k] = o[k]; });
  if (d.dispositivo) v.dispositivo = (d.dispositivo.mobile ? 'Celular' : 'Computador') + ' · ' + d.dispositivo.largura + 'px';
  if (d.contato) v.contato = (CANAL[d.contato.canal] || d.contato.canal) + (d.contato.periodo ? ' · ' + d.contato.periodo : '') + ' · ' + v.atualizado;
  if (d.agendamento) v.agendamento = d.agendamento.rotuloLongo + ' · ' + d.agendamento.formato;

  const novo = d.evento === 'agendamento' ? STATUS.agendamento
    : (d.evento === 'contato_solicitado' || d.evento === 'contato_direto') ? STATUS.contato
    : STATUS[d.evento];
  if (novo && ORDEM_STATUS.indexOf(novo) > ORDEM_STATUS.indexOf(v.status)) v.status = novo;
  if (!v.status) v.status = STATUS.lead_iniciou;

  const valores = linhaDe(nome, v);
  if (linha > 0) a.getRange(linha + 1, 1, 1, valores.length).setValues([valores]);
  else a.appendRow(valores);
}

function registrarContato(d) {
  const c = d.contato || {};
  adicionar(ABAS.CONTATOS, {
    data: agora(), sessao: d.sessao, nome: d.lead.nome, telefone: telefone(d.lead), email: d.lead.email,
    canal: CANAL[c.canal] || c.canal, tipo: d.evento === 'contato_direto' ? 'Abriu o canal direto' : 'Pediu para ser contatado',
    periodo: c.periodo || '', origem: c.origem || '', status: d.evento === 'contato_direto' ? 'Informativo' : 'Pendente'
  });
  if (AJUSTES.EMAIL_DA_EQUIPE && d.evento === 'contato_solicitado') {
    MailApp.sendEmail({ to: AJUSTES.EMAIL_DA_EQUIPE, name: AJUSTES.NOME_REMETENTE,
      subject: 'Pedido de contato (' + (CANAL[c.canal] || c.canal) + '): ' + d.lead.nome,
      htmlBody: d.lead.nome + ' pediu contato por ' + (CANAL[c.canal] || c.canal) + (c.periodo ? ', período da ' + c.periodo.toLowerCase() : '') +
        '.<br>WhatsApp: ' + telefone(d.lead) + '<br>E-mail: ' + (d.lead.email || '-') });
  }
}

/* ------------------------------------------------------------------ */
/* Horários já reservados na planilha + compromissos do seu Google Agenda */
function horariosOcupados(de, ate) {
  const ocupados = [], intervalos = [];
  if (!de || !ate) return { ok: true, ocupados: ocupados, intervalos: intervalos };
  const a = aba(ABAS.AGENDA), cols = COLUNAS[ABAS.AGENDA];
  const iChave = cols.findIndex(c => c[0] === 'chave'), iStatus = cols.findIndex(c => c[0] === 'status');
  const dados = a.getDataRange().getDisplayValues();
  for (let i = 1; i < dados.length; i++) {
    const chave = String(dados[i][iChave] || '');
    const dia = chave.slice(0, 10);
    if (chave && dados[i][iStatus] !== 'Cancelado' && dia >= de && dia <= ate) ocupados.push(chave);
  }
  if (AJUSTES.CONSIDERAR_AGENDA_OCUPADA) {
    try {
      const ini = Utilities.parseDate(de + ' 00:00', AJUSTES.FUSO, 'yyyy-MM-dd HH:mm');
      const fim = Utilities.parseDate(ate + ' 23:59', AJUSTES.FUSO, 'yyyy-MM-dd HH:mm');
      CalendarApp.getDefaultCalendar().getEvents(ini, fim).forEach(ev => {
        intervalos.push([ev.getStartTime().toISOString(), ev.getEndTime().toISOString()]);
      });
    } catch (erro) { /* sem acesso à agenda: usa só a planilha */ }
  }
  return { ok: true, ocupados: ocupados, intervalos: intervalos };
}

function agendar(d) {
  const ag = d.agendamento || {}, lead = d.lead;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ag.data || '') || !/^\d{2}:\d{2}$/.test(ag.hora || '')) return { ok: false, motivo: 'dados' };
  const chave = ag.data + ' ' + ag.hora;
  const inicio = Utilities.parseDate(chave, AJUSTES.FUSO, 'yyyy-MM-dd HH:mm');
  const fim = new Date(inicio.getTime() + (ag.duracaoMin || AJUSTES.DURACAO_MIN) * 60000);
  const agenda = horariosOcupados(ag.data, ag.data);
  const choca = agenda.intervalos.some(par => inicio < new Date(par[1]) && fim > new Date(par[0]));
  if (agenda.ocupados.indexOf(chave) >= 0 || choca) return { ok: false, motivo: 'ocupado' };

  const formato = ag.formato || '';
  const local = formato.indexOf('Presencial') === 0 ? AJUSTES.ENDERECO_PRESENCIAL : formato.indexOf('Online') === 0 ? AJUSTES.LINK_REUNIAO_ONLINE : '';
  let idEvento = '';
  if (AJUSTES.CRIAR_EVENTO_NA_AGENDA) {
    try {
      const opcoes = {
        description: 'Diagnóstico Completo LIFE com ' + lead.nome + '\nFormato: ' + formato + '\nWhatsApp: ' + telefone(lead) + '\nE-mail: ' + (ag.emailConfirmacao || lead.email) +
          (d.resultado ? '\nNota LIFE no Dinâmico: ' + d.resultado.notaLife + ' · Perfil: ' + d.resultado.perfil : '') +
          (d.temperatura ? '\nTemperatura: ' + d.temperatura : '') + (ag.observacao ? '\nObservação do lead: ' + ag.observacao : ''),
        location: local
      };
      if (AJUSTES.ENVIAR_CONVITE_DA_AGENDA && ag.emailConfirmacao) { opcoes.guests = ag.emailConfirmacao; opcoes.sendInvites = true; }
      idEvento = CalendarApp.getDefaultCalendar().createEvent('Diagnóstico Completo LIFE · ' + lead.nome, inicio, fim, opcoes).getId();
    } catch (erro) { idEvento = 'erro: ' + erro; }
  }

  let emailEnviado = false;
  if (AJUSTES.ENVIAR_EMAIL_CONFIRMACAO && ag.emailConfirmacao) {
    try {
      MailApp.sendEmail({ to: ag.emailConfirmacao, name: AJUSTES.NOME_REMETENTE,
        subject: 'Seu Diagnóstico Completo LIFE está agendado', htmlBody: emailConfirmacao(lead, ag, inicio, fim, local) });
      emailEnviado = true;
    } catch (erro) { emailEnviado = false; }
  }
  if (AJUSTES.EMAIL_DA_EQUIPE) {
    try {
      MailApp.sendEmail({ to: AJUSTES.EMAIL_DA_EQUIPE, name: AJUSTES.NOME_REMETENTE,
        subject: 'Novo Diagnóstico Completo agendado: ' + lead.nome,
        htmlBody: lead.nome + ' agendou para ' + ag.rotuloLongo + ' (' + formato + ').<br>WhatsApp: ' + telefone(lead) + '<br>E-mail: ' + ag.emailConfirmacao +
          (d.resultado ? '<br>Nota LIFE: ' + d.resultado.notaLife + ' · ' + d.resultado.perfil : '') + (ag.observacao ? '<br>Observação: ' + ag.observacao : '') });
    } catch (erro) { /* aviso opcional */ }
  }

  adicionar(ABAS.AGENDA, {
    registrado: agora(), sessao: d.sessao, nome: lead.nome, email: ag.emailConfirmacao, telefone: telefone(lead),
    quando: ag.rotuloLongo, formato: formato, observacao: ag.observacao || '',
    notaLife: d.resultado ? d.resultado.notaLife : '', perfil: d.resultado ? d.resultado.perfil : '', temperatura: d.temperatura || '',
    status: 'Confirmado', emailEnviado: emailEnviado ? 'Sim' : 'Não', idEvento: idEvento, chave: "'" + chave
  });
  return { ok: true, emailEnviado: emailEnviado };
}

function emailConfirmacao(lead, ag, inicio, fim, local) {
  const z = d => Utilities.formatDate(d, 'UTC', "yyyyMMdd'T'HHmmss'Z'");
  const google = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent('Diagnóstico Completo LIFE · Grupo Life Brasil') +
    '&dates=' + z(inicio) + '/' + z(fim) + '&ctz=' + encodeURIComponent(AJUSTES.FUSO);
  const primeiro = String(lead.nome || '').split(' ')[0];
  return '<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#1e1b1c">' +
    '<div style="background:#161314;color:#fff;padding:24px 28px;border-radius:14px 14px 0 0">' +
    '<div style="font-size:13px;letter-spacing:2px;color:#f39a3c;text-transform:uppercase;font-weight:bold">Grupo Life Brasil · Planejamento</div>' +
    '<h1 style="font-size:22px;margin:10px 0 0">Seu Diagnóstico Completo está agendado</h1></div>' +
    '<div style="border:1px solid #eee;border-top:0;padding:24px 28px;border-radius:0 0 14px 14px">' +
    '<p>Olá, ' + primeiro + '! Que bom dar este passo com a gente.</p>' +
    '<p style="font-size:18px;margin:18px 0"><b>' + ag.rotuloLongo + '</b> (horário de Brasília)<br>' +
    '<span style="color:#6b6360">' + ag.formato + ' · cerca de ' + (ag.duracaoMin || AJUSTES.DURACAO_MIN) + ' minutos</span></p>' +
    (local ? '<p>' + (local.indexOf('http') === 0 ? 'Link da reunião: <a href="' + local + '">' + local + '</a>' : 'Local: ' + local) + '</p>' : '') +
    '<p>Para aproveitar melhor a conversa, tenha em mãos uma ideia da sua renda, das despesas do mês, dos investimentos e dos seguros que já possui.</p>' +
    '<p><a href="' + google + '" style="display:inline-block;background:#ea6a2a;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:bold">Adicionar ao Google Agenda</a></p>' +
    '<p style="color:#6b6360;font-size:13px">Precisa remarcar? Responda este e-mail ou fale com a nossa equipe.</p>' +
    '<p style="color:#6b6360;font-size:13px">' + AJUSTES.NOME_REMETENTE + ' · <a href="' + AJUSTES.SITE + '">' + AJUSTES.SITE.replace(/^https?:\/\//, '') + '</a></p>' +
    '</div></div>';
}
