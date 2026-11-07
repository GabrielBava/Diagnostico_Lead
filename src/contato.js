/* =====================================================================
   CONTATO COM ESPECIALISTA, AGENDA DO DIAGNÓSTICO COMPLETO E PLANILHA
   ===================================================================== */

const ICO_CANAL = {
  ligacao: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.8 3.5h2.5l1.4 4.1-1.9 1.4a12.5 12.5 0 0 0 6.2 6.2l1.4-1.9 4.1 1.4v2.5a2 2 0 0 1-2.2 2A16.6 16.6 0 0 1 4.8 5.7a2 2 0 0 1 2-2.2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5a8.5 8.5 0 0 0-7.3 12.8L3.5 20.5l4.3-1.1A8.5 8.5 0 1 0 12 3.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 8.6c.3 2.9 2.3 5 5.2 5.6l1-1.3-1.7-.9-.7.6c-1-.4-1.8-1.2-2.2-2.2l.6-.7-.9-1.7z" fill="currentColor"/></svg>',
  email: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4 7l8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  agenda: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M8.5 14.5l2.2 2.2 4.6-4.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};

const soDigitos = v => String(v || '').replace(/\D/g, '');
const fmtTelefone = d => {
  d = soDigitos(d).replace(/^55(?=\d{10,11}$)/, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return d;
};
const NOTA_PREVIA = 'Prévia: a planilha ainda não está conectada, então este pedido não foi gravado.';

/* ---------------- sessão e envio para a planilha ---------------- */
function novaSessao() {
  try {
    const a = new Uint8Array(4); crypto.getRandomValues(a);
    return 'L' + Date.now().toString(36).toUpperCase() + Array.from(a, b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  } catch (e) { return 'L' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 8).toUpperCase(); }
}
let sessaoId = novaSessao();

function corpoBase(evento, lead) {
  return {
    evento, sessao: sessaoId, data: new Date().toISOString(), produto: CONFIG.produto,
    lead: lead || estado.lead, origem: estado.origem,
    dispositivo: { largura: window.innerWidth, mobile: /Mobi|Android/i.test(navigator.userAgent), idioma: navigator.language }
  };
}
/* sem esperar: dispara e segue; esperando: lê a resposta da planilha (agenda) */
async function enviarPlanilha(corpo, esperar) {
  const url = CONFIG.urlPlanilha;
  if (!url) return { ok: false, semPlanilha: true };
  const dados = JSON.stringify(corpo);
  if (!esperar) {
    try { fetch(url, { method: 'POST', mode: 'no-cors', keepalive: dados.length < 60000, body: dados }).catch(() => {}); } catch (e) { /* sem rede */ }
    return { ok: true };
  }
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 25000);
    const r = await fetch(url, { method: 'POST', body: dados, redirect: 'follow', signal: ctrl.signal });
    clearTimeout(t);
    return await r.json();
  } catch (e) { return { ok: false, erro: true }; }
}

/* ---------------- modal genérico ---------------- */
function abrirModal(html, classe = '') {
  const m = $('#modal');
  m.innerHTML = `<div class="modal-caixa ${classe}" role="dialog" aria-modal="true" aria-labelledby="modal-tit">
    <button class="modal-fechar" type="button" aria-label="Fechar">×</button>${html}</div>`;
  m.hidden = false;
  const fechar = () => { m.hidden = true; m.innerHTML = ''; };
  $('.modal-fechar', m).addEventListener('click', fechar);
  m.onclick = e => { if (e.target === m) fechar(); };
  return { caixa: $('.modal-caixa', m), fechar };
}

/* =====================================================================
   FALAR COM ESPECIALISTA: Ligação, WhatsApp ou E-mail
   ===================================================================== */
function botaoEspecialista(classe = 'btn btn-vidro', rotulo = 'Falar com especialista', origem = '') {
  return `<button type="button" class="${classe}" data-contato="${origem}">${ICO.chat}<span>${rotulo}</span></button>`;
}
function botaoAgendar(classe = 'btn btn-primario', rotulo = 'Agendar Diagnóstico Completo', origem = '') {
  const ag = estado.agendamento;
  const txt = ag ? `Agendado: ${ag.rotuloCurto}` : rotulo;
  return `<button type="button" class="${classe}" data-agendar="${origem}">${ICO_CANAL.agenda}<span>${txt}</span></button>`;
}

function abrirContato(origem) {
  const tel = soDigitos(CONFIG.telefoneEspecialista);
  const wpp = soDigitos(CONFIG.whatsappEspecialista);
  const email = CONFIG.emailContato;
  const { caixa } = abrirModal(`
    <img class="modal-coracao" src="${IMG.coracao}" alt="">
    <h3 id="modal-tit">Fale com um especialista Life</h3>
    <p>Como prefere conversar?</p>
    <div class="canais" role="group" aria-label="Canal de contato">
      <button type="button" class="canal" data-canal="ligacao">${ICO_CANAL.ligacao}<b>Ligação</b><small>${tel ? 'Ligue agora ou receba a nossa ligação' : 'Um especialista liga para você'}</small></button>
      <button type="button" class="canal" data-canal="whatsapp">${ICO_CANAL.whatsapp}<b>WhatsApp</b><small>${wpp ? 'Converse agora com a nossa equipe' : 'Um especialista chama você'}</small></button>
      <button type="button" class="canal" data-canal="email">${ICO_CANAL.email}<b>E-mail</b><small>Escreva para a nossa equipe</small></button>
    </div>
    <div class="canal-detalhe" id="canal-detalhe" aria-live="polite"></div>`, 'modal-contato');
  rastrear('abriu_contato');
  $$('.canal', caixa).forEach(b => b.addEventListener('click', () => {
    $$('.canal', caixa).forEach(x => x.classList.toggle('sel', x === b));
    detalheCanal(b.dataset.canal, origem, { tel, wpp, email });
  }));
}

function detalheCanal(canal, origem, { tel, wpp, email }) {
  const alvo = $('#canal-detalhe');
  const lead = estado.lead;
  const msgWpp = (lead ? CONFIG.mensagemWhatsapp.replace('{nome}', lead.nome) : 'Olá! Vim pelo site e quero falar com um especialista sobre o Diagnóstico LIFE.');
  let direto = '';
  if (canal === 'ligacao' && tel) direto = `<a class="btn btn-primario btn-bloco" href="tel:+${tel}" data-direto="ligacao">${ICO_CANAL.ligacao}<span>Ligar para ${fmtTelefone(tel)}</span></a>`;
  if (canal === 'whatsapp' && wpp) direto = `<a class="btn btn-primario btn-bloco" href="https://wa.me/${wpp}?text=${encodeURIComponent(msgWpp)}" target="_blank" rel="noopener" data-direto="whatsapp">${ICO_CANAL.whatsapp}<span>Abrir conversa no WhatsApp</span></a>`;
  if (canal === 'email') direto = `<a class="btn btn-primario btn-bloco" href="mailto:${email}?subject=${encodeURIComponent('Diagnóstico LIFE: quero falar com um especialista')}&body=${encodeURIComponent((lead ? `Olá! Sou ${lead.nome}. ` : 'Olá! ') + 'Quero conversar sobre o Diagnóstico Completo.')}" data-direto="email">${ICO_CANAL.email}<span>Escrever para ${email}</span></a>`;
  const rotulos = {
    ligacao: ['Prefiro que me liguem', 'Quero receber uma ligação'],
    whatsapp: ['Prefiro que me chamem', 'Quero ser chamado no WhatsApp'],
    email: ['Prefiro receber um e-mail', 'Quero receber um e-mail']
  }[canal];
  const pedeEmail = canal === 'email';
  const campos = lead ? '' : `
    <label class="campo" for="ct-nome"><span>Seu nome</span><input id="ct-nome" type="text" autocomplete="name"></label>
    ${pedeEmail
      ? '<label class="campo" for="ct-email"><span>Seu e-mail</span><input id="ct-email" type="email" autocomplete="email"></label>'
      : '<label class="campo" for="ct-tel"><span>Seu WhatsApp com DDD</span><input id="ct-tel" type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="(00) 00000-0000"></label>'}`;
  const periodo = pedeEmail ? '' : `<p class="ag-rot">Melhor período</p>
    <div class="atalhos" role="radiogroup">${['Manhã', 'Tarde', 'Noite'].map((p, i) => `<button type="button" class="chip${i === 0 ? ' sel' : ''}" data-periodo="${p}" role="radio" aria-checked="${i === 0}">${p}</button>`).join('')}</div>`;
  alvo.innerHTML = `${direto ? `${direto}<p class="ou"><span>${rotulos[0]}?</span></p>` : ''}
    <form class="pedido" id="form-pedido" novalidate>${campos}${periodo}
      <p class="erro" id="ct-erro"></p>
      <button type="submit" class="btn ${direto ? 'btn-fantasma' : 'btn-primario'} btn-bloco">${rotulos[1]}</button>
    </form>`;
  const tInput = $('#ct-tel');
  if (tInput) tInput.addEventListener('input', () => { tInput.value = mascaraTelefone(tInput.value); });
  $$('[data-periodo]', alvo).forEach(c => c.addEventListener('click', () => {
    $$('[data-periodo]', alvo).forEach(x => { x.classList.toggle('sel', x === c); x.setAttribute('aria-checked', x === c); });
  }));
  $$('[data-direto]', alvo).forEach(a => a.addEventListener('click', () => {
    rastrear('contato_direto_' + a.dataset.direto);
    enviarPlanilha({ ...corpoBase('contato_direto', lead || { nome: '', telefone: '', email: '' }), contato: { canal: a.dataset.direto, origem } });
  }));
  $('#form-pedido').addEventListener('submit', e => {
    e.preventDefault();
    let quem = lead;
    if (!quem) {
      const nome = ($('#ct-nome').value || '').trim();
      const telefone = soDigitos($('#ct-tel') ? $('#ct-tel').value : '');
      const em = ($('#ct-email') ? $('#ct-email').value : '').trim();
      let erro = '';
      if (nome.length < 3) erro = 'Informe o seu nome.';
      else if (!pedeEmail && !(telefone.length === 10 || telefone.length === 11)) erro = 'Informe o WhatsApp com DDD.';
      else if (pedeEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) erro = 'Confira o e-mail.';
      if (erro) { $('#ct-erro').textContent = erro; return; }
      quem = { nome, telefone, telefoneFormatado: fmtTelefone(telefone), email: em };
    }
    const sel = $('[data-periodo].sel', alvo);
    const periodoEscolhido = sel ? sel.dataset.periodo : '';
    rastrear('pediu_' + canal);
    enviarPlanilha({ ...corpoBase('contato_solicitado', quem), contato: { canal, periodo: periodoEscolhido, origem } });
    const destino = canal === 'email' ? `no e-mail ${quem.email}` : `no ${canal === 'whatsapp' ? 'WhatsApp' : 'telefone'} ${quem.telefoneFormatado || fmtTelefone(quem.telefone)}`;
    alvo.innerHTML = `<div class="sucesso">${ICO.check}<div><b>Pedido enviado</b><p>Um especialista do Grupo Life Brasil vai falar com você ${destino}${periodoEscolhido ? `, no período da ${periodoEscolhido.toLowerCase()}` : ''}.</p>${CONFIG.urlPlanilha ? '' : `<p class="nota-previa">${NOTA_PREVIA}</p>`}</div></div>`;
  });
}

/* =====================================================================
   AGENDAR DIAGNÓSTICO COMPLETO
   ===================================================================== */
const AG = CONFIG.agenda;
const hojeNoFuso = () => new Intl.DateTimeFormat('en-CA', { timeZone: AG.fuso, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const instanteDe = (dia, hora) => new Date(`${dia}T${hora}:00${AG.fusoOffset}`);
const diaUTC = dia => new Date(dia + 'T12:00:00Z');
const fmtDia = (dia, o) => diaUTC(dia).toLocaleDateString('pt-BR', { timeZone: 'UTC', ...o });
function diasDisponiveis() {
  const [y, m, d] = hojeNoFuso().split('-').map(Number);
  const out = [];
  for (let k = 0; k <= AG.diasAFrente; k++) {
    const dt = new Date(Date.UTC(y, m - 1, d + k, 12));
    if (AG.diasDaSemana.includes(dt.getUTCDay())) out.push(dt.toISOString().slice(0, 10));
  }
  return out;
}
const fmtCal = dt => dt.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
function linksAgenda(ag) {
  const titulo = 'Diagnóstico Completo LIFE · Grupo Life Brasil';
  const det = `Reunião com um planejador do Grupo Life Brasil (${ag.formato}).`;
  const google = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(titulo)}&dates=${fmtCal(ag.inicio)}/${fmtCal(ag.fim)}&details=${encodeURIComponent(det)}&ctz=${encodeURIComponent(AG.fuso)}`;
  const outlook = `https://outlook.live.com/calendar/0/deeplink/compose?path=%2Fcalendar%2Faction%2Fcompose&rru=addevent&subject=${encodeURIComponent(titulo)}&startdt=${encodeURIComponent(ag.inicio.toISOString())}&enddt=${encodeURIComponent(ag.fim.toISOString())}&body=${encodeURIComponent(det)}`;
  return { google, outlook };
}

async function buscarOcupados(dias) {
  const vazio = { ocupados: new Set(), intervalos: [] };
  if (!CONFIG.urlPlanilha) return vazio;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const r = await fetch(`${CONFIG.urlPlanilha}?acao=horarios&de=${dias[0]}&ate=${dias[dias.length - 1]}`, { signal: ctrl.signal, redirect: 'follow' });
    clearTimeout(t);
    const j = await r.json();
    return {
      ocupados: new Set(j.ocupados || []),
      intervalos: (j.intervalos || []).map(([a, b]) => [new Date(a).getTime(), new Date(b).getTime()])
    };
  } catch (e) { return vazio; }
}

function abrirAgenda(origem) {
  if (!estado.lead) { abrirContato(origem); return; }
  if (estado.agendamento) { mostrarAgendado(estado.agendamento); return; }
  rastrear('abriu_agenda');
  const dias = diasDisponiveis();
  const st = { formato: AG.formatos[0], dia: null, hora: null, ocupados: new Set(), intervalos: [], carregando: !!CONFIG.urlPlanilha };
  const { caixa } = abrirModal(`
    <div class="ag-cab">${ICO_CANAL.agenda}<div><h3 id="modal-tit">Agendar Diagnóstico Completo</h3>
    <p>Uma conversa de cerca de ${AG.duracaoMin >= 60 ? Math.round(AG.duracaoMin / 60) + ' hora' : AG.duracaoMin + ' minutos'} com um planejador Life. Horários de Brasília.</p></div></div>
    <p class="ag-rot">Formato</p>
    <div class="atalhos" id="ag-formatos" role="radiogroup">${AG.formatos.map((f, i) => `<button type="button" class="chip${i === 0 ? ' sel' : ''}" role="radio" aria-checked="${i === 0}" data-formato="${esc(f)}">${esc(f)}</button>`).join('')}</div>
    <p class="ag-rot">Dia</p>
    <div class="ag-dias" id="ag-dias"></div>
    <p class="ag-rot">Horário</p>
    <div class="ag-horas" id="ag-horas"></div>
    <label class="campo" for="ag-email"><span>E-mail para receber a confirmação</span><input id="ag-email" type="email" autocomplete="email" value="${esc(estado.lead.email)}"></label>
    <label class="campo" for="ag-obs"><span>Quer adiantar algum assunto? (opcional)</span><textarea id="ag-obs" rows="2" maxlength="400"></textarea></label>
    <p class="erro" id="ag-erro"></p>
    <button type="button" class="btn btn-primario btn-bloco btn-grande" id="ag-confirmar" disabled>Confirmar agendamento</button>`, 'modal-agenda');

  const livre = (dia, hora) => {
    const ini = instanteDe(dia, hora).getTime();
    const fim = ini + AG.duracaoMin * 60000;
    if (ini < Date.now() + AG.antecedenciaHoras * 3600000) return false;
    if (st.ocupados.has(`${dia} ${hora}`)) return false;
    return !st.intervalos.some(([a, b]) => ini < b && fim > a);
  };
  const desenharDias = () => {
    $('#ag-dias').innerHTML = dias.map(d => {
      const algum = AG.horarios.some(h => livre(d, h));
      const sem = fmtDia(d, { weekday: 'short' }).replace('.', '');
      return `<button type="button" class="ag-dia${st.dia === d ? ' sel' : ''}" data-dia="${d}" ${algum ? '' : 'disabled'} aria-pressed="${st.dia === d}"><span>${sem}</span><b>${fmtDia(d, { day: '2-digit' })}</b><small>${fmtDia(d, { month: 'short' }).replace('.', '')}</small></button>`;
    }).join('');
    $$('[data-dia]', caixa).forEach(b => b.addEventListener('click', () => { st.dia = b.dataset.dia; st.hora = null; desenharDias(); desenharHoras(); }));
  };
  const desenharHoras = () => {
    const el = $('#ag-horas');
    if (st.carregando) { el.innerHTML = '<p class="ag-vazio">Verificando horários livres…</p>'; return; }
    if (!st.dia) { el.innerHTML = '<p class="ag-vazio">Escolha um dia para ver os horários.</p>'; atualizarBotao(); return; }
    el.innerHTML = AG.horarios.map(h => `<button type="button" class="chip ag-hora${st.hora === h ? ' sel' : ''}" data-hora="${h}" ${livre(st.dia, h) ? '' : 'disabled'}>${h}</button>`).join('');
    $$('[data-hora]', el).forEach(b => b.addEventListener('click', () => { st.hora = b.dataset.hora; desenharHoras(); }));
    atualizarBotao();
  };
  const atualizarBotao = () => {
    const b = $('#ag-confirmar');
    b.disabled = !(st.dia && st.hora);
    b.textContent = st.dia && st.hora ? `Confirmar ${fmtDia(st.dia, { weekday: 'long' })}, ${fmtDia(st.dia, { day: '2-digit', month: '2-digit' })} às ${st.hora}` : 'Confirmar agendamento';
  };
  $$('[data-formato]', caixa).forEach(c => c.addEventListener('click', () => {
    st.formato = c.dataset.formato;
    $$('[data-formato]', caixa).forEach(x => { x.classList.toggle('sel', x === c); x.setAttribute('aria-checked', x === c); });
  }));
  desenharDias(); desenharHoras();
  if (st.carregando) buscarOcupados(dias).then(o => { st.ocupados = o.ocupados; st.intervalos = o.intervalos; st.carregando = false; desenharDias(); desenharHoras(); });

  $('#ag-confirmar').addEventListener('click', async () => {
    const email = $('#ag-email').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { $('#ag-erro').textContent = 'Confira o e-mail para receber a confirmação.'; return; }
    const botao = $('#ag-confirmar');
    botao.disabled = true; botao.textContent = 'Confirmando…'; $('#ag-erro').textContent = '';
    const inicio = instanteDe(st.dia, st.hora);
    const fim = new Date(inicio.getTime() + AG.duracaoMin * 60000);
    const ag = {
      data: st.dia, hora: st.hora, formato: st.formato, duracaoMin: AG.duracaoMin,
      observacao: $('#ag-obs').value.trim(), emailConfirmacao: email,
      inicioISO: inicio.toISOString(), fimISO: fim.toISOString(),
      rotuloLongo: `${fmtDia(st.dia, { weekday: 'long', day: 'numeric', month: 'long' })}, às ${st.hora}`,
      rotuloCurto: `${fmtDia(st.dia, { weekday: 'short' }).replace('.', '')}, ${fmtDia(st.dia, { day: '2-digit', month: '2-digit' })} às ${st.hora}`
    };
    const res = estado.resultado;
    const corpo = { ...corpoBase('agendamento'), agendamento: ag,
      resultado: res ? { notaLife: res.notaLife, perfil: res.perfil.nome } : null,
      temperatura: res ? temperatura(estado.respostas, res) : '' };
    rastrear('confirmou_agenda');
    const r = await enviarPlanilha(corpo, true);
    if (r && r.ok === false && r.motivo === 'ocupado') {
      st.ocupados.add(`${st.dia} ${st.hora}`); st.hora = null;
      desenharDias(); desenharHoras();
      $('#ag-erro').textContent = 'Esse horário acabou de ser reservado. Escolha outro, por favor.';
      return;
    }
    if (r && (r.ok || r.semPlanilha)) {
      estado.agendamento = { ...ag, inicio, fim, emailEnviado: !!r.emailEnviado, semPlanilha: !!r.semPlanilha };
      $$('[data-agendar] span').forEach(s => { s.textContent = `Agendado: ${ag.rotuloCurto}`; });
      mostrarAgendado(estado.agendamento);
      return;
    }
    botao.disabled = false; atualizarBotao();
    $('#ag-erro').textContent = 'Não conseguimos confirmar agora. Verifique a internet e tente de novo, ou fale com um especialista.';
  });
}

function mostrarAgendado(ag) {
  const { google, outlook } = linksAgenda(ag);
  abrirModal(`
    <div class="sucesso sucesso-grande">${ICO.check}<div>
      <h3 id="modal-tit">Diagnóstico Completo agendado</h3>
      <p class="ag-quando">${ag.rotuloLongo} <small>(horário de Brasília)</small></p>
      <p>${esc(ag.formato)} · cerca de ${AG.duracaoMin} minutos com um planejador Life.</p>
      <p>${ag.semPlanilha ? `<span class="nota-previa">${NOTA_PREVIA}</span>` : ag.emailEnviado ? `Enviamos a confirmação para <b>${esc(ag.emailConfirmacao)}</b>.` : `A confirmação vai para <b>${esc(ag.emailConfirmacao)}</b>.`}</p>
    </div></div>
    <p class="ag-rot">Adicione à sua agenda</p>
    <div class="ag-links">
      <a class="btn btn-fantasma" href="${google}" target="_blank" rel="noopener">${ICO_CANAL.agenda}<span>Google Agenda</span></a>
      <a class="btn btn-fantasma" href="${outlook}" target="_blank" rel="noopener">${ICO_CANAL.agenda}<span>Outlook</span></a>
    </div>
    <p class="ag-nota">Precisa remarcar? Use “Falar com especialista”.</p>`, 'modal-agenda');
}
