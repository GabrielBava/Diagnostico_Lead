/* =====================================================================
   INTERFACE DO DIAGNÓSTICO LIFE POCKET
   Telas: início (vídeo) → acesso → perguntas → processando → resultado
   ===================================================================== */

const estado = {
  tela: 'inicio', lead: null, respostas: {}, atual: null, resultado: null,
  tempos: {}, inicioPergunta: 0, inicioQuiz: 0, voltas: 0, origem: {}
};
const IMG = { logo: '{{LOGO}}', coracao: '{{CORACAO}}' };
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const reduzMovimento = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------- ícones (traço 1.8) ---------------- */
const ICO = {
  chat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5h16v10H9.5L5 19.5v-4H4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8 9.5h8M8 12.5h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  seta: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  voltar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H6M11 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  relogio: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  escudo: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7.5 3v5.5c0 4.5-3.2 8-7.5 9.5-4.3-1.5-7.5-5-7.5-9.5V6z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8.8 12l2.2 2.2 4.2-4.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  cadeado: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  alerta: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4l9 16H3z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 10v4.5M12 17.2v.3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  ajuste: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h2M10 17h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="16" cy="7" r="2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="8" cy="17" r="2" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
  juntos: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="9" r="3.2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="16.5" cy="10" r="2.6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 19c.8-3 3-4.6 5.5-4.6s4.7 1.6 5.5 4.6M14.5 15c2.3-.4 4.6.8 5.5 3.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
};

/* ---------------- especialista ---------------- */
function primeiroNome() { return estado.lead ? estado.lead.nome.trim().split(/\s+/)[0] : ''; }
function linkEspecialista(motivo) {
  const num = (CONFIG.whatsappEspecialista || '').replace(/\D/g, '');
  if (!num) return null;
  const msg = estado.lead
    ? CONFIG.mensagemWhatsapp.replace('{nome}', estado.lead.nome.trim())
    : 'Olá! Vim pelo site e quero falar com um especialista sobre o Diagnóstico LIFE.';
  return `https://wa.me/${num}?text=${encodeURIComponent(motivo === 'completo' && estado.lead ? msg : msg)}`;
}
function botaoEspecialista(classe = 'btn btn-vidro', rotulo = 'Falar com especialista', motivo = '') {
  const url = linkEspecialista(motivo);
  const attrs = url ? `href="${url}" target="_blank" rel="noopener"` : 'href="#especialista" data-modal-especialista';
  return `<a class="${classe}" ${attrs} data-rastrear="especialista${motivo ? '_' + motivo : ''}">${ICO.chat}<span>${rotulo}</span></a>`;
}
function abrirModalEspecialista() {
  const m = $('#modal');
  m.innerHTML = `<div class="modal-caixa" role="dialog" aria-modal="true" aria-labelledby="modal-tit">
    <button class="modal-fechar" type="button" aria-label="Fechar">×</button>
    <img class="modal-coracao" src="${IMG.coracao}" alt="">
    <h3 id="modal-tit">Fale com um especialista Life</h3>
    <p>Nossos planejadores explicam o seu resultado e mostram como funciona a versão completa do diagnóstico.</p>
    <div class="modal-contatos">
      <span>E-mail</span><b>${CONFIG.emailContato}</b>
      <span>Site</span><a href="${CONFIG.site}" target="_blank" rel="noopener">${CONFIG.site.replace(/^https?:\/\//, '')}</a>
    </div>
  </div>`;
  m.hidden = false;
  rastrear('abriu_contato');
  const fechar = () => { m.hidden = true; m.innerHTML = ''; };
  $('.modal-fechar', m).addEventListener('click', fechar);
  m.addEventListener('click', e => { if (e.target === m) fechar(); }, { once: true });
}

/* ---------------- avisos ---------------- */
let toastTimer;
function aviso(msg) {
  const t = $('#toast');
  t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
}

/* ---------------- rastreio e envio do lead ---------------- */
const eventos = [];
function rastrear(nome) { eventos.push({ e: nome, t: Math.round((Date.now() - (estado.inicioQuiz || Date.now())) / 1000) }); }
function capturarOrigem() {
  try {
    const p = new URLSearchParams(location.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'].forEach(k => { if (p.get(k)) estado.origem[k] = p.get(k); });
  } catch (e) { /* sem query */ }
  estado.origem.referrer = document.referrer || '';
  estado.origem.pagina = location.href.split('#')[0].split('?')[0];
}
function temperatura(r, res) {
  let pts = 0;
  if (['protecao', 'bens', 'aposentadoria', 'investir', 'impostos'].includes(r.prioridade)) pts += 2;
  if (['sem_plano', 'apertado'].includes(r.sentimento)) pts += 1;
  if (res.renda >= 10000) pts += 2; else if (res.renda >= 5000) pts += 1;
  if (res.plano.juntos.length >= 3) pts += 1;
  if (res.patrimonioBruto >= 300000) pts += 1;
  return pts >= 5 ? 'quente' : pts >= 3 ? 'morno' : 'frio';
}
function enviarLead(evento) {
  const url = CONFIG.webhookLead;
  if (!url || !estado.lead) return;
  const res = estado.resultado;
  const corpo = {
    evento, data: new Date().toISOString(), produto: CONFIG.produto,
    lead: estado.lead, origem: estado.origem,
    dispositivo: { largura: window.innerWidth, mobile: /Mobi|Android/i.test(navigator.userAgent), idioma: navigator.language },
    respostas: estado.respostas,
    comportamento: {
      tempoTotalSeg: estado.inicioQuiz ? Math.round((Date.now() - estado.inicioQuiz) / 1000) : 0,
      temposPorPerguntaSeg: Object.fromEntries(Object.entries(estado.tempos).map(([k, v]) => [k, Math.round(v / 100) / 10])),
      voltas: estado.voltas, eventos
    }
  };
  if (res) {
    corpo.resultado = {
      notaLife: res.notaLife, perfil: res.perfil.nome,
      pilares: Object.fromEntries(res.pilares.map(p => [p.id, p.pct])),
      independenciaPct: Math.round(res.independencia.pct * 100), idadeAlvo: res.independencia.idadeAlvo,
      aporteNecessario: Math.round(res.independencia.aporteNecessario), sobraMensal: Math.round(res.sobra),
      taxaPoupancaPct: Math.round(res.taxaPoupanca * 100), reservaMeses: res.reservaMeses,
      patrimonioBruto: Math.round(res.patrimonioBruto),
      atuarDeImediato: res.plano.imediato.map(i => i.titulo),
      oportunidades: res.oportunidades.map(o => ({ produto: o.produto, titulo: o.titulo, potencial: o.potencial })),
      potencialPorProduto: res.produtos
    };
    corpo.temperatura = temperatura(estado.respostas, res);
  }
  try {
    fetch(url, { method: 'POST', mode: 'no-cors', keepalive: true, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(corpo) }).catch(() => {});
  } catch (e) { /* sem rede */ }
}

/* ---------------- cena (vídeo de fundo) ---------------- */
function prepararVideo() {
  const v = $('#video-fundo');
  if (!v) return;
  const src = window.innerWidth < 900 ? 'assets/video/familia-720.mp4' : 'assets/video/familia-1080.mp4';
  v.src = src;
  v.muted = true;
  const tocar = () => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };
  if (reduzMovimento()) { v.removeAttribute('autoplay'); v.pause(); } else tocar();
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !reduzMovimento() && estado.tela !== 'resultado') tocar(); });
}
function trocarTela(tela) {
  estado.tela = tela;
  document.body.dataset.tela = tela;
  const v = $('#video-fundo');
  if (v && !reduzMovimento()) { if (tela === 'resultado') v.pause(); else { const p = v.play(); if (p && p.catch) p.catch(() => {}); } }
  window.scrollTo(0, 0);
}

/* =====================================================================
   TELA 1 — INÍCIO
   ===================================================================== */
function telaInicio() {
  trocarTela('inicio');
  $('#app').innerHTML = `
  <header class="topo">
    <img class="logo" src="${IMG.logo}" alt="Grupo Life Brasil Planejamento" width="220" height="69">
    ${botaoEspecialista('btn btn-vidro btn-pequeno')}
  </header>
  <main class="hero">
    <p class="selo-produto"><span>Diagnóstico Financeiro LIFE</span><b>Versão Pocket</b></p>
    <h1>Em 5 minutos, descubra onde o seu dinheiro <em>trava</em> e onde ele pode <em>crescer</em>.</h1>
    <p class="hero-texto">Uma versão rápida e pessoal do diagnóstico que os planejadores do Grupo Life Brasil fazem com cada cliente. Você responde perguntas simples e recebe na hora o seu cenário: Nota LIFE, Estrela LIFE, Radar de Independência Financeira e um plano em três frentes.</p>
    <div class="hero-acoes">
      <button class="btn btn-primario btn-grande" type="button" id="btn-iniciar">Iniciar diagnóstico ${ICO.seta}</button>
      <a class="btn btn-fantasma" href="#como-funciona">Como funciona</a>
    </div>
    <ul class="hero-fatos">
      <li>${ICO.relogio}<span>Cerca de 5 minutos</span></li>
      <li>${ICO.escudo}<span>Resultado exclusivo e protegido</span></li>
      <li>${ICO.chat}<span>Especialista a um clique</span></li>
    </ul>
  </main>

  <section class="faixa" id="como-funciona">
    <div class="faixa-int">
      <p class="sobretitulo">Como funciona</p>
      <h2>Quatro passos, do primeiro clique ao seu plano.</h2>
      <ol class="passos">
        <li><b>Identifique-se</b><span>Nome, WhatsApp e e-mail liberam o acesso ao diagnóstico.</span></li>
        <li><b>Responda</b><span>Cerca de 25 perguntas rápidas em 6 etapas. Valores aproximados bastam.</span></li>
        <li><b>Veja o seu cenário</b><span>Nota LIFE, os 8 pilares da Estrela LIFE, o Radar de Independência Financeira e o que fazer primeiro.</span></li>
        <li><b>Converse com a Life</b><span>Um especialista aprofunda o resultado e monta com você o diagnóstico completo.</span></li>
      </ol>
    </div>
  </section>

  <section class="faixa faixa-escura">
    <div class="faixa-int">
      <p class="sobretitulo">Pocket ou completo</p>
      <h2>O Pocket mostra o mapa. O completo traça a rota com você.</h2>
      <div class="comparativo" role="table" aria-label="Comparação entre a versão Pocket e a versão completa">
        <div class="cmp-linha cmp-cab" role="row"><span role="columnheader"></span><span role="columnheader">Pocket <small>grátis, online</small></span><span role="columnheader">Completo <small>com planejador Life</small></span></div>
        ${[
          ['Tempo', '5 minutos, sozinho', 'Reuniões com um planejador dedicado'],
          ['Estrela LIFE', '8 pilares em visão geral', '20 sub-pilares, cada um com justificativa'],
          ['Independência financeira', 'Projeção simplificada', 'Simulação com INSS, cenários e metas por objetivo'],
          ['Proteção da família', 'Sinais de alerta', 'Cálculo do capital ideal de seguro e coberturas'],
          ['Sucessão e impostos', 'Estimativa do custo de inventário', 'Estratégia sucessória e tributária'],
          ['Plano de ação', '3 frentes macro', 'Plano detalhado com prazos e acompanhamento']
        ].map(l => `<div class="cmp-linha" role="row"><span role="rowheader">${l[0]}</span><span role="cell">${l[1]}</span><span role="cell">${l[2]}</span></div>`).join('')}
      </div>
      <div class="faixa-acoes">
        <button class="btn btn-primario" type="button" id="btn-iniciar-2">Começar pelo Pocket ${ICO.seta}</button>
        ${botaoEspecialista('btn btn-fantasma', 'Quero falar sobre o completo', 'completo')}
      </div>
    </div>
  </section>
  <footer class="rodape">
    <img src="${IMG.coracao}" alt="" width="22" height="22">
    <span>© ${new Date().getFullYear()} Grupo Life Brasil · 28 anos de trajetória · <a href="${CONFIG.site}" target="_blank" rel="noopener">grupolifebrasil.com.br</a></span>
  </footer>`;
  $('#btn-iniciar').addEventListener('click', telaAcesso);
  $('#btn-iniciar-2').addEventListener('click', telaAcesso);
}

/* =====================================================================
   TELA 2 — ACESSO (dados do lead)
   ===================================================================== */
const mascaraTelefone = v => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d.length ? '(' + d : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};
function telaAcesso() {
  trocarTela('acesso');
  $('#app').innerHTML = `
  <header class="topo">
    <button class="logo-botao" type="button" id="voltar-inicio" aria-label="Voltar ao início"><img class="logo" src="${IMG.logo}" alt="Grupo Life Brasil Planejamento" width="220" height="69"></button>
    ${botaoEspecialista('btn btn-vidro btn-pequeno')}
  </header>
  <main class="acesso">
    <section class="acesso-info">
      <p class="selo-produto"><span>Diagnóstico Financeiro LIFE</span><b>Versão Pocket</b></p>
      <h1>Antes de começar</h1>
      <ul class="instrucoes">
        <li><b>6 etapas, cerca de 5 minutos.</b> Você, seu mês, proteção, patrimônio, objetivos e a sua relação com o dinheiro.</li>
        <li><b>Não existe resposta certa.</b> Use valores aproximados; o importante é o retrato de hoje.</li>
        <li><b>Resultado na hora, só para você.</b> Ele aparece na tela ao final e não pode ser baixado, impresso ou copiado.</li>
        <li><b>Dúvida no caminho?</b> O botão “Falar com especialista” fica sempre visível.</li>
      </ul>
    </section>
    <form class="acesso-form" id="form-acesso" novalidate>
      <h2>Seus dados de acesso</h2>
      <label class="campo" for="f-nome"><span>Nome completo</span>
        <input id="f-nome" name="nome" type="text" autocomplete="name" placeholder="Como você se chama?" required>
        <small class="erro" data-erro="nome"></small></label>
      <label class="campo" for="f-tel"><span>WhatsApp</span>
        <input id="f-tel" name="telefone" type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="(00) 00000-0000" required>
        <small class="erro" data-erro="telefone"></small></label>
      <label class="campo" for="f-email"><span>E-mail</span>
        <input id="f-email" name="email" type="email" autocomplete="email" placeholder="voce@email.com" required>
        <small class="erro" data-erro="email"></small></label>
      <label class="consentimento" for="f-lgpd">
        <input id="f-lgpd" name="lgpd" type="checkbox" required>
        <span>Autorizo o Grupo Life Brasil a usar estas informações para gerar meu diagnóstico e entrar em contato comigo, conforme a <a href="${CONFIG.politicaPrivacidade}" target="_blank" rel="noopener">política de privacidade</a> e a LGPD.</span>
      </label>
      <small class="erro" data-erro="lgpd"></small>
      <button class="btn btn-primario btn-grande btn-bloco" type="submit">Começar meu diagnóstico ${ICO.seta}</button>
      <p class="form-nota">${ICO.escudo}<span>Seus dados ficam com o Grupo Life Brasil e não são compartilhados.</span></p>
    </form>
  </main>`;
  $('#voltar-inicio').addEventListener('click', telaInicio);
  const tel = $('#f-tel');
  tel.addEventListener('input', () => { tel.value = mascaraTelefone(tel.value); });
  $('#f-nome').focus({ preventScroll: true });
  $('#form-acesso').addEventListener('submit', e => {
    e.preventDefault();
    const nome = $('#f-nome').value.trim().replace(/\s+/g, ' ');
    const telefone = $('#f-tel').value.replace(/\D/g, '');
    const email = $('#f-email').value.trim();
    const erros = {};
    if (nome.length < 3 || !/[a-zA-ZÀ-ú]{2,}/.test(nome)) erros.nome = 'Informe o seu nome.';
    if (!(telefone.length === 10 || telefone.length === 11)) erros.telefone = 'Informe o WhatsApp com DDD, por exemplo (47) 99999-0000.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) erros.email = 'Confira o e-mail: ele precisa ter o formato nome@dominio.com.';
    if (!$('#f-lgpd').checked) erros.lgpd = 'Para continuar, marque a autorização acima.';
    $$('.erro').forEach(el => { el.textContent = erros[el.dataset.erro] || ''; });
    $$('.campo input').forEach(i => i.toggleAttribute('aria-invalid', !!erros[i.name]));
    if (Object.keys(erros).length) { const p = $('[aria-invalid]') || $('#f-lgpd'); p.focus(); return; }
    estado.lead = { nome, telefone, telefoneFormatado: mascaraTelefone(telefone), email, consentimentoLGPD: true, acessoEm: new Date().toISOString() };
    estado.respostas = {}; estado.tempos = {}; estado.voltas = 0; estado.resultado = null;
    estado.inicioQuiz = Date.now();
    Protecao.ativar();
    rastrear('acesso');
    enviarLead('lead_iniciou');
    estado.atual = visiveis()[0].id;
    telaPergunta();
  });
}

/* =====================================================================
   TELA 3 — PERGUNTAS
   ===================================================================== */
const visiveis = () => PERGUNTAS.filter(q => !q.mostrarSe || q.mostrarSe(estado.respostas));
const LETRAS = 'ABCDEFGH';
const moedaTexto = v => (v === undefined || v === null || v === '') ? '' : Math.round(v).toLocaleString('pt-BR');
const lerMoeda = s => { const d = String(s).replace(/\D/g, ''); return d ? Math.min(999999999, parseInt(d, 10)) : null; };

function htmlMoeda(id, valor, rotuloZero, atalhos) {
  return `<div class="moeda">
    <span class="moeda-rs">R$</span>
    <input id="m-${id}" data-moeda="${id}" type="text" inputmode="numeric" autocomplete="off" placeholder="0" value="${moedaTexto(valor)}" aria-label="Valor em reais">
  </div>
  ${(atalhos || rotuloZero) ? `<div class="atalhos">${(atalhos || [0]).map(a => `<button type="button" class="chip" data-atalho="${id}" data-valor="${a}">${a === 0 ? (rotuloZero || 'R$ 0') : fmtMoeda(a)}</button>`).join('')}</div>` : ''}`;
}

function telaPergunta() {
  if (estado.tela !== 'quiz') trocarTela('quiz');
  const lista = visiveis();
  let idx = lista.findIndex(q => q.id === estado.atual);
  if (idx < 0) idx = 0;
  const q = lista[idx];
  estado.atual = q.id;
  estado.inicioPergunta = Date.now();
  const etapaIdx = ETAPAS.findIndex(e => e.id === q.etapa);
  const etapa = ETAPAS[etapaIdx];
  const primeiraDaEtapa = lista.findIndex(x => x.etapa === q.etapa) === idx;
  const r = estado.respostas;
  const progresso = Math.round(idx / lista.length * 100);

  let corpo = '';
  if (q.tipo === 'escolha') {
    corpo = `<div class="opcoes" role="radiogroup" aria-label="${esc(q.titulo)}">${q.opcoes.map((o, i) => `
      <button type="button" class="opcao${r[q.id] === o.v ? ' sel' : ''}" role="radio" aria-checked="${r[q.id] === o.v}" data-i="${i}">
        <kbd>${LETRAS[i]}</kbd><span class="opcao-t">${o.t}${o.d ? `<small>${o.d}</small>` : ''}</span>
      </button>`).join('')}</div>`;
  } else if (q.tipo === 'multipla') {
    const sel = r[q.id] || [];
    corpo = `<div class="opcoes opcoes-multi" role="group" aria-label="${esc(q.titulo)}">${q.opcoes.map((o, i) => `
      <button type="button" class="opcao multi${sel.includes(o.v) ? ' sel' : ''}" aria-pressed="${sel.includes(o.v)}" data-i="${i}">
        <span class="caixa">${ICO.check}</span><span class="opcao-t">${o.t}</span>
      </button>`).join('')}</div>${q.max ? `<p class="contador" id="contador">${sel.length} de ${q.max} escolhidas</p>` : ''}`;
  } else if (q.tipo === 'moeda') {
    corpo = htmlMoeda(q.id, r[q.id], q.rotuloZero, q.atalhos);
  } else if (q.tipo === 'numero') {
    corpo = `<div class="numero"><input id="n-${q.id}" type="text" inputmode="numeric" maxlength="2" placeholder="${q.placeholder || ''}" value="${r[q.id] ?? ''}" aria-label="${esc(q.titulo)}"><span>${q.sufixo}</span></div>`;
  } else if (q.tipo === 'escala') {
    corpo = `<div class="escala" role="radiogroup" aria-label="${esc(q.titulo)}">${Array.from({ length: q.max - q.min + 1 }, (_, k) => q.min + k).map(v => `<button type="button" class="nota${r[q.id] === v ? ' sel' : ''}" role="radio" aria-checked="${r[q.id] === v}" data-v="${v}">${v}</button>`).join('')}</div>
      <div class="escala-rotulos">${q.rotulos.map(t => `<span>${t}</span>`).join('')}</div>`;
  } else if (q.tipo === 'grupo') {
    q.campos.forEach(c => { if (c.padrao !== undefined && r[c.id] === undefined) r[c.id] = c.padrao; });
    corpo = `<div class="grupo">${q.campos.map(c => {
      if (c.tipo === 'moeda') return `<div class="grupo-campo"><p class="grupo-rot">${c.rotulo}</p>${htmlMoeda(c.id, r[c.id], c.rotuloZero, c.rotuloZero ? [0] : null)}</div>`;
      if (c.tipo === 'faixa') return `<div class="grupo-campo"><p class="grupo-rot">${c.rotulo}</p>
        <div class="faixa-campo"><input type="range" id="fx-${c.id}" min="${c.min}" max="${c.max}" step="1" value="${r[c.id]}" aria-label="${esc(c.rotulo)}"><output id="out-${c.id}">${r[c.id]} ${c.sufixo}</output></div></div>`;
      if (c.tipo === 'chips') return `<div class="grupo-campo"><p class="grupo-rot">${c.rotulo}</p><div class="atalhos" role="radiogroup">${c.opcoes.map(o => `<button type="button" class="chip${r[c.id] === o.v ? ' sel' : ''}" role="radio" aria-checked="${r[c.id] === o.v}" data-chip="${c.id}" data-valor="${o.v}">${o.t}</button>`).join('')}</div></div>`;
      return '';
    }).join('')}</div>`;
  }

  const precisaBotao = !['escolha', 'escala'].includes(q.tipo);
  $('#app').innerHTML = `
  <div class="quiz">
    <header class="quiz-topo">
      <img class="logo logo-pequeno" src="${IMG.logo}" alt="Grupo Life Brasil Planejamento" width="150" height="47">
      <ol class="etapas" aria-label="Etapas">${ETAPAS.map((e, i) => `<li class="${i < etapaIdx ? 'feita' : i === etapaIdx ? 'atual' : ''}"${i === etapaIdx ? ' aria-current="step"' : ''}><span>${e.nome}</span></li>`).join('')}</ol>
      ${botaoEspecialista('btn btn-vidro btn-pequeno btn-so-icone-mobile')}
    </header>
    <div class="progresso" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progresso}" aria-label="Progresso do diagnóstico"><span style="width:${progresso}%"></span></div>
    <main class="quiz-corpo">
      <div class="cartao-pergunta" id="cartao" data-q="${q.id}">
        <p class="etapa-rotulo">Etapa ${etapaIdx + 1} de ${ETAPAS.length} · ${etapa.nome}</p>
        ${primeiraDaEtapa ? `<p class="etapa-intro">${etapa.intro}</p>` : ''}
        <h2 class="pergunta" id="pergunta-titulo">${q.titulo}</h2>
        ${q.ajuda ? `<p class="ajuda">${q.ajuda}</p>` : ''}
        <div class="resposta">${corpo}</div>
        <p class="erro-quiz" id="erro-quiz" role="alert"></p>
        <div class="quiz-acoes">
          <button type="button" class="btn btn-fantasma" id="btn-voltar">${ICO.voltar}<span>${idx === 0 ? 'Meus dados' : 'Voltar'}</span></button>
          ${precisaBotao ? `<button type="button" class="btn btn-primario" id="btn-continuar">${idx === lista.length - 1 ? 'Ver meu diagnóstico' : 'Continuar'} ${ICO.seta}</button>` : `<span class="dica-teclado">Toque em uma opção${window.matchMedia('(hover: hover)').matches ? ' ou use as letras do teclado' : ''}</span>`}
        </div>
      </div>
      <p class="quiz-rodape">Pergunta ${idx + 1} de ${lista.length}</p>
    </main>
  </div>`;
  if (!reduzMovimento()) $('#cartao').classList.add('entrar');
  ligarPergunta(q);
}

function erroQuiz(msg) { const e = $('#erro-quiz'); if (e) e.textContent = msg || ''; }

function registrarTempo(id) { estado.tempos[id] = (estado.tempos[id] || 0) + (Date.now() - estado.inicioPergunta); }

function avancar() {
  const q = PERGUNTAS.find(x => x.id === estado.atual);
  registrarTempo(q.id);
  const lista = visiveis();
  const idx = lista.findIndex(x => x.id === q.id);
  if (idx >= lista.length - 1) { finalizar(); return; }
  estado.atual = lista[idx + 1].id;
  telaPergunta();
}
function voltar() {
  const lista = visiveis();
  const idx = lista.findIndex(x => x.id === estado.atual);
  estado.voltas++;
  if (idx <= 0) { telaAcesso(); preencherAcesso(); return; }
  estado.atual = lista[idx - 1].id;
  telaPergunta();
}
function preencherAcesso() {
  if (!estado.lead) return;
  $('#f-nome').value = estado.lead.nome; $('#f-tel').value = mascaraTelefone(estado.lead.telefone);
  $('#f-email').value = estado.lead.email; $('#f-lgpd').checked = true;
}

function validarAtual(q) {
  const r = estado.respostas;
  if (q.tipo === 'moeda') {
    const v = r[q.id];
    if (v === undefined || v === null) return 'Digite um valor ou escolha uma das opções.';
    if (v < (q.min || 0)) return `O valor mínimo aqui é ${fmtMoeda(q.min)}.`;
    if (q.id === 'gastos' && r.renda && v > r.renda * 5) return 'O gasto parece muito acima da renda. Confira o valor.';
  }
  if (q.tipo === 'numero') {
    const v = r[q.id];
    if (!v || v < q.min || v > q.max) return `Informe uma idade entre ${q.min} e ${q.max} anos.`;
  }
  if (q.tipo === 'multipla' && !(r[q.id] || []).length) return 'Escolha pelo menos uma opção.';
  if (q.tipo === 'grupo') {
    for (const c of q.campos) {
      if (c.tipo === 'moeda' && (r[c.id] === undefined || r[c.id] === null)) return 'Preencha os dois valores (use R$ 0 quando não houver).';
    }
    if (q.id === 'bens' && (r.saldoDevedor || 0) > (r.valorBens || 0)) return 'O saldo a pagar não pode ser maior que o valor dos bens.';
  }
  return '';
}

function ligarPergunta(q) {
  const r = estado.respostas;
  $('#btn-voltar').addEventListener('click', voltar);
  const cont = $('#btn-continuar');
  const tentarAvancar = () => { const e = validarAtual(q); if (e) { erroQuiz(e); return; } avancar(); };
  if (cont) cont.addEventListener('click', tentarAvancar);

  if (q.tipo === 'escolha') {
    const escolher = i => {
      r[q.id] = q.opcoes[i].v;
      $$('.opcao').forEach((b, k) => { b.classList.toggle('sel', k === i); b.setAttribute('aria-checked', k === i); });
      setTimeout(avancar, reduzMovimento() ? 60 : 260);
    };
    $$('.opcao').forEach(b => b.addEventListener('click', () => escolher(+b.dataset.i)));
    estado.teclaPergunta = e => {
      const i = LETRAS.indexOf((e.key || '').toUpperCase());
      const n = parseInt(e.key, 10);
      if (i >= 0 && i < q.opcoes.length) escolher(i);
      else if (n >= 1 && n <= q.opcoes.length) escolher(n - 1);
    };
  } else if (q.tipo === 'multipla') {
    $$('.opcao').forEach(b => b.addEventListener('click', () => {
      const v = q.opcoes[+b.dataset.i].v;
      const sel = new Set(r[q.id] || []);
      if (sel.has(v)) sel.delete(v);
      else { if (q.max && sel.size >= q.max) { erroQuiz(`Escolha no máximo ${q.max}. Desmarque uma para trocar.`); return; } sel.add(v); }
      r[q.id] = q.opcoes.map(o => o.v).filter(x => sel.has(x));
      b.classList.toggle('sel', sel.has(v)); b.setAttribute('aria-pressed', sel.has(v));
      erroQuiz('');
      const c = $('#contador'); if (c) c.textContent = `${sel.size} de ${q.max} escolhidas`;
    }));
    estado.teclaPergunta = e => { if (e.key === 'Enter') tentarAvancar(); };
  } else if (q.tipo === 'escala') {
    $$('.nota').forEach(b => b.addEventListener('click', () => {
      r[q.id] = +b.dataset.v;
      $$('.nota').forEach(x => { x.classList.toggle('sel', x === b); x.setAttribute('aria-checked', x === b); });
      setTimeout(avancar, reduzMovimento() ? 60 : 260);
    }));
    estado.teclaPergunta = e => { const n = parseInt(e.key, 10); if (n >= 0 && n <= 9) { const b = $(`.nota[data-v="${n}"]`); b && b.click(); } };
  } else {
    estado.teclaPergunta = e => { if (e.key === 'Enter') { e.preventDefault(); tentarAvancar(); } };
  }

  /* campos de moeda */
  $$('[data-moeda]').forEach(inp => {
    inp.addEventListener('input', () => {
      const v = lerMoeda(inp.value);
      r[inp.dataset.moeda] = v;
      inp.value = v === null ? '' : moedaTexto(v);
      $$(`[data-atalho="${inp.dataset.moeda}"]`).forEach(c => c.classList.toggle('sel', v !== null && +c.dataset.valor === v));
      erroQuiz('');
    });
  });
  $$('[data-atalho]').forEach(c => c.addEventListener('click', () => {
    const id = c.dataset.atalho, v = +c.dataset.valor;
    r[id] = v;
    const inp = $(`[data-moeda="${id}"]`); if (inp) inp.value = moedaTexto(v);
    $$(`[data-atalho="${id}"]`).forEach(x => x.classList.toggle('sel', x === c));
    erroQuiz('');
    if (q.tipo === 'moeda') setTimeout(tentarAvancar, reduzMovimento() ? 60 : 220);
  }));
  /* número (idade) */
  const num = $('.numero input');
  if (num) num.addEventListener('input', () => { num.value = num.value.replace(/\D/g, '').slice(0, 2); r[q.id] = num.value ? parseInt(num.value, 10) : null; erroQuiz(''); });
  /* faixa e chips do grupo */
  $$('input[type="range"]').forEach(fx => fx.addEventListener('input', () => {
    const id = fx.id.replace('fx-', ''); r[id] = +fx.value;
    const c = q.campos.find(x => x.id === id); $(`#out-${id}`).textContent = `${fx.value} ${c.sufixo}`;
  }));
  $$('[data-chip]').forEach(c => c.addEventListener('click', () => {
    r[c.dataset.chip] = +c.dataset.valor;
    $$(`[data-chip="${c.dataset.chip}"]`).forEach(x => { x.classList.toggle('sel', x === c); x.setAttribute('aria-checked', x === c); });
  }));
  const primeiro = $('.resposta input[type="text"]');
  if (primeiro && window.matchMedia('(hover: hover)').matches) primeiro.focus({ preventScroll: true });
}

/* =====================================================================
   TELA 4 — PROCESSANDO
   ===================================================================== */
function finalizar() {
  /* limpa respostas de perguntas que ficaram ocultas */
  const vis = new Set(visiveis().map(q => q.id));
  PERGUNTAS.forEach(q => {
    if (vis.has(q.id)) return;
    if (q.tipo === 'grupo') q.campos.forEach(c => delete estado.respostas[c.id]);
    else delete estado.respostas[q.id];
  });
  estado.resultado = calcularDiagnostico(estado.respostas);
  rastrear('concluiu');
  enviarLead('diagnostico_concluido');
  trocarTela('processando');
  const etapas = ['Calculando a sua Nota LIFE', 'Montando a Estrela LIFE com 8 pilares', 'Projetando a sua independência financeira', 'Separando o que fazer primeiro'];
  $('#app').innerHTML = `<main class="processando" aria-live="polite">
    <img class="proc-coracao" src="${IMG.coracao}" alt="" width="72" height="72">
    <h2>Preparando o seu diagnóstico, ${esc(primeiroNome())}</h2>
    <ul class="proc-lista">${etapas.map(t => `<li><span class="proc-marca">${ICO.check}</span>${t}</li>`).join('')}</ul>
  </main>`;
  const itens = $$('.proc-lista li');
  const passo = reduzMovimento() ? 120 : 650;
  itens.forEach((li, i) => setTimeout(() => li.classList.add('ok'), passo * (i + 1)));
  setTimeout(telaResultado, passo * (itens.length + 1) + 150);
}

/* =====================================================================
   TELA 5 — RESULTADO (protegido)
   ===================================================================== */
function telaResultado() {
  const res = estado.resultado;
  if (!res || !estado.lead) { telaInicio(); return; }
  trocarTela('resultado');
  const ind = res.independencia;
  const agora = new Date();
  const dataTxt = agora.toLocaleDateString('pt-BR') + ' ' + agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  Protecao.marcaDagua(`${estado.lead.nome}\n${estado.lead.telefoneFormatado} · ${dataTxt}\nUso pessoal · Grupo Life Brasil`);
  const statusPill = st => `<span class="pill pill-${st}">${st === 'ok' ? ICO.check : st === 'critico' ? ICO.alerta : ICO.ajuste}${ROTULO_STATUS[st]}</span>`;
  const indTxt = ind.pct >= 9.99 ? '+999%' : fmtPct(ind.pct);

  let blocoIndependencia;
  if (ind.aposentado) {
    blocoIndependencia = `<div class="ind-fatos">
      <p class="ind-frase">${ind.necessario <= 0
        ? 'A sua renda atual cobre o seu custo de vida. O foco agora é preservar o patrimônio e organizar a sucessão.'
        : `Para cobrir a diferença de ${fmtMoeda(Math.max(0, res.gastos - res.renda))} por mês entre renda e gastos, o seu patrimônio precisaria ser de ${fmtMoeda(ind.necessario, true)}. Hoje ele cobre ${indTxt} disso.`}</p>
    </div>`;
  } else {
    blocoIndependencia = `<div class="ind-fatos">
      <p class="ind-frase">Para viver com <b>${fmtMoeda(ind.rendaDesejada)}</b> por mês a partir dos <b>${ind.idadeAlvo} anos</b>, você precisa acumular <b>${fmtMoeda(ind.necessario, true)}</b>.</p>
      <dl class="ind-numeros">
        <div><dt>No ritmo atual você chega com</dt><dd>${fmtMoeda(ind.projetado, true)}</dd><small>renda de ${fmtMoeda(ind.rendaProjetada)} por mês</small></div>
        <div><dt>Para chegar à meta, invista</dt><dd>${fmtMoeda(ind.aporteNecessario)}<span>/mês</span></dd><small>hoje: ${fmtMoeda(ind.aporte)} por mês</small></div>
      </dl>
    </div>`;
  }

  const itemPlano = (it, ico) => `<li><span class="plano-ico">${ico}</span><div><b>${it.titulo}</b><p>${it.texto}</p></div></li>`;
  const imediatoHtml = res.plano.imediato.length
    ? res.plano.imediato.map(i => itemPlano(i, ICO.alerta)).join('')
    : `<li class="plano-vazio"><span class="plano-ico">${ICO.check}</span><div><b>Nada urgente</b><p>O básico está em dia: mês no azul, sem crédito caro e com alguma reserva.</p></div></li>`;

  $('#app').innerHTML = `
  <div class="res protegido">
    <header class="topo topo-res">
      <img class="logo logo-pequeno" src="${IMG.logo}" alt="Grupo Life Brasil Planejamento" width="150" height="47">
      <span class="res-carimbo">${ICO.cadeado}Diagnóstico pessoal e protegido · ${dataTxt}</span>
      ${botaoEspecialista('btn btn-primario btn-pequeno btn-so-icone-mobile')}
    </header>

    <section class="res-hero">
      <div class="res-hero-texto">
        <p class="selo-produto"><span>Seu diagnóstico</span><b>Versão Pocket</b></p>
        <h1>${esc(primeiroNome())}, hoje o seu perfil é <em>${res.perfil.nome}</em>.</h1>
        <p class="res-perfil">${res.perfil.descricao}</p>
        <div class="kpis">
          <div class="kpi"><span>Sobra no mês</span><b class="${res.sobra < 0 ? 'neg' : ''}">${fmtMoeda(res.sobra)}</b><small>${res.sobra < 0 ? 'gasta mais do que ganha' : fmtPct(res.taxaPoupanca) + ' da renda · meta 20%'}</small></div>
          <div class="kpi"><span>Reserva de emergência</span><b>${res.reservaMeses > 0 ? fmtMeses(res.reservaMeses) : 'Nenhuma'}</b><small>meta: ${CONFIG.premissas.mesesReserva} meses de despesas</small></div>
          <div class="kpi"><span>Independência financeira</span><b>${indTxt}</b><small>${ind.aposentado ? 'do que o patrimônio precisa cobrir' : 'da meta aos ' + ind.idadeAlvo + ' anos'}</small></div>
        </div>
      </div>
      <aside class="nota-card" aria-label="Nota LIFE">
        <span class="nota-rot">Nota LIFE</span>
        <p class="nota-num"><b>${res.notaLife}</b><small>/100</small></p>
        <div class="nota-trilho"><span style="width:${res.notaLife}%"></span><i style="left:45%"></i><i style="left:75%"></i></div>
        ${statusPill(res.statusGeral)}
        <p class="nota-exp">Soma dos 8 pilares da Estrela LIFE. Acima de 75 é saudável; entre 45 e 75 pede atenção.</p>
      </aside>
    </section>

    <section class="bloco">
      <header class="bloco-cab"><p class="sobretitulo">Saúde financeira</p><h2>Estrela LIFE</h2><p>Os 8 pilares que os planejadores Life avaliam em todo cliente. Quanto mais a estrela se abre, mais equilibrada é a sua vida financeira.</p></header>
      <div class="estrela-grid">
        <div class="estrela-caixa">${svgEstrelaLife(res.pilares)}</div>
        <ul class="pilares">${res.pilares.map(p => `<li>
          <div class="pilar-cab"><b>${p.nome}</b>${statusPill(p.status)}</div>
          <div class="pilar-barra"><span class="b-${p.status}" style="width:${Math.max(2, p.pct)}%"></span></div>
          <p><span>${p.descricao}</span><b>${p.pct}%</b></p>
        </li>`).join('')}</ul>
      </div>
    </section>

    <section class="bloco">
      <header class="bloco-cab"><p class="sobretitulo">Futuro</p><h2>Radar de Independência Financeira</h2><p>Quanto do patrimônio necessário para viver de renda você terá ${ind.aposentado ? 'hoje' : 'na idade que escolheu'}, sem contar o INSS.</p></header>
      <div class="ind-grid">
        <div class="radar-caixa">${svgRadarIndependencia(ind.pct)}</div>
        ${blocoIndependencia}
      </div>
      ${!ind.aposentado && ind.serie.length > 1 ? `<div class="proj">
        <div class="proj-cab"><h3>Projeção do patrimônio até os ${ind.idadeAlvo} anos</h3>
          <div class="legenda legenda-linha"><span><i style="background:${COR.plano}"></i>Com planejamento</span><span><i style="background:${COR.atual}"></i>No ritmo atual</span><span><i class="i-meta"></i>Meta</span></div></div>
        <div class="proj-caixa" id="proj-caixa"></div>
      </div>` : ''}
    </section>

    <section class="bloco">
      <header class="bloco-cab"><p class="sobretitulo">Seu mês</p><h2>Para onde vai a sua renda</h2><p>Comparação com o modelo 50-30-20: até 50% no essencial, até 30% no estilo de vida e pelo menos 20% para o futuro.</p></header>
      ${htmlOrcamento(res.orcamento)}
    </section>

    <section class="bloco">
      <header class="bloco-cab"><p class="sobretitulo">Plano de ação</p><h2>Seu plano em 3 frentes</h2><p>O que corrigir já, o que ajustar para acelerar e onde a Life atua junto com você.</p></header>
      <div class="frentes">
        <article class="frente frente-1"><h3><span>1</span>Atuar de imediato</h3><ul>${imediatoHtml}</ul></article>
        <article class="frente frente-2"><h3><span>2</span>Otimizar</h3>
          <p class="frente-sub">O que você já faz bem</p><ul>${res.plano.fortes.map(i => itemPlano(i, ICO.check)).join('')}</ul>
          ${res.plano.ajustes.length ? `<p class="frente-sub">Ajustes que aceleram</p><ul>${res.plano.ajustes.map(i => itemPlano(i, ICO.ajuste)).join('')}</ul>` : ''}
        </article>
        <article class="frente frente-3"><h3><span>3</span>Atuar junto com a Life</h3><ul>${res.plano.juntos.length
          ? res.plano.juntos.map(o => `<li><span class="plano-ico">${ICO.juntos}</span><div><span class="produto">${o.produto}</span><b>${o.titulo}</b><p>${o.texto}</p></div></li>`).join('')
          : `<li><span class="plano-ico">${ICO.juntos}</span><div><b>Acompanhamento</b><p>Seu cenário é sólido. O próximo nível é otimizar impostos, sucessão e a rentabilidade da carteira.</p></div></li>`}</ul>
          ${botaoEspecialista('btn btn-primario btn-bloco', 'Montar esse plano com a Life', 'plano')}
        </article>
      </div>
    </section>

    <section class="completo">
      <div class="completo-texto">
        <p class="sobretitulo">Versão completa</p>
        <h2>Isto foi o Pocket. O diagnóstico completo vai muito além.</h2>
        <p>Com um planejador Life, o seu diagnóstico ganha os números exatos, os 20 sub-pilares e um plano de ação com prazos e acompanhamento.</p>
        <div class="completo-acoes">
          ${botaoEspecialista('btn btn-primario btn-grande', 'Quero o diagnóstico completo', 'completo')}
        </div>
      </div>
      <ul class="bloqueados">${[
        ['Plano de ação com prazos', 'Cada ação com responsável, prazo e prioridade.'],
        ['Aposentadoria completa', 'INSS, cenários de retorno e meta por objetivo.'],
        ['Capital ideal de seguro', 'Educação dos filhos, padrão de vida e inventário.'],
        ['Sucessão e inventário', 'ITCMD, honorários e a estratégia para a família.'],
        ['Planejamento tributário', 'PGBL, declaração de IR e estrutura patrimonial.'],
        ['Matriz de oportunidades', 'Seguros, consórcio e investimentos por potencial.']
      ].map(b => `<li><span class="cad">${ICO.cadeado}</span><b>${b[0]}</b><span class="borrado" aria-hidden="true"><i></i><i></i><i></i></span><small>${b[1]}</small></li>`).join('')}</ul>
    </section>

    <footer class="res-rodape">
      <p><b>Sobre este diagnóstico.</b> Resultado prévio, calculado com as suas respostas e premissas simplificadas: retorno de ${fmtPct(CONFIG.premissas.retornoReal)} ao ano acima da inflação, retirada de ${fmtPct(CONFIG.premissas.taxaRetirada)} ao ano do patrimônio na aposentadoria, sem contar o INSS, e reserva de ${CONFIG.premissas.mesesReserva} meses. Não é recomendação de investimento. Para um plano personalizado, fale com um planejador do Grupo Life Brasil.</p>
      <button type="button" class="btn btn-fantasma btn-pequeno" id="btn-encerrar">Encerrar e apagar meu diagnóstico</button>
    </footer>
  </div>`;
  if (!ind.aposentado && ind.serie.length > 1) {
    desenharProjecao($('#proj-caixa'), ind);
    let larguraAnterior = window.innerWidth, t;
    window.onresize = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        if (estado.tela !== 'resultado' || Math.abs(window.innerWidth - larguraAnterior) < 2) return;
        larguraAnterior = window.innerWidth;
        desenharProjecao($('#proj-caixa'), ind);
      }, 150);
    };
  }
  $('#btn-encerrar').addEventListener('click', () => { encerrarSessao(); aviso('Diagnóstico apagado deste navegador.'); });
}

function encerrarSessao() {
  estado.lead = null; estado.respostas = {}; estado.resultado = null; estado.atual = null; estado.tempos = {};
  Protecao.desativar();
  telaInicio();
}

/* =====================================================================
   INÍCIO
   ===================================================================== */
function iniciarApp() {
  capturarOrigem();
  prepararVideo();
  Protecao.iniciar({
    antiDevtools: !!(window.__LIFE_PROTECAO && window.__LIFE_PROTECAO.antiDevtools),
    aviso,
    aoEncerrar: () => {
      estado.lead = null; estado.respostas = {}; estado.resultado = null;
      Protecao.marcaDagua('');
      const app = document.getElementById('app'); if (app) app.innerHTML = '';
      setTimeout(() => { Protecao.desativar(); }, 0);
    }
  });
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-modal-especialista]');
    if (a) { e.preventDefault(); abrirModalEspecialista(); }
    const r = e.target.closest('[data-rastrear]');
    if (r && estado.lead) { rastrear(r.dataset.rastrear); enviarLead('clicou_' + r.dataset.rastrear); }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !$('#modal').hidden) { $('#modal').hidden = true; $('#modal').innerHTML = ''; return; }
    if (estado.tela !== 'quiz' || e.ctrlKey || e.metaKey || e.altKey) return;
    const emCampo = e.target.closest && e.target.closest('input');
    if (emCampo && e.key !== 'Enter') return;
    estado.teclaPergunta && estado.teclaPergunta(e);
  });
  /* nada fica salvo: ao sair da página o diagnóstico some */
  window.addEventListener('pagehide', () => {
    estado.resultado = null; estado.respostas = {};
    const app = document.getElementById('app'); if (app) app.innerHTML = '';
  });
  window.addEventListener('pageshow', e => { if (e.persisted) encerrarSessao(); });
  telaInicio();
}
