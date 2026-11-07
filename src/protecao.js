/* =====================================================================
   TRAVAS DE PROTEÇÃO DO CONTEÚDO
   - bloqueia impressão, salvar página, ver código, copiar e menu do botão direito
   - esconde o diagnóstico quando a janela perde o foco (ferramentas de recorte)
   - detecta teclas de captura de tela (PrintScreen, Win+Shift+S, Cmd+Shift+3/4/5)
   - marca d'água com nome e telefone do lead sobre o resultado
   - encerra a sessão se as ferramentas de desenvolvedor forem abertas
   Nada no navegador impede 100% uma foto da tela com outro aparelho:
   por isso a marca d'água identifica quem vazou.
   ===================================================================== */
const Protecao = (() => {
  let ativo = false;
  let motivoAtual = null;
  let liberarApos = 0;
  let opcoes = {};
  let marcaTexto = '';
  const AVISO_COPIA = 'Conteúdo protegido - Diagnóstico LIFE Pocket. Fale com um especialista do Grupo Life Brasil.';

  const ehCampo = el => !!(el && el.closest && el.closest('input, textarea, select, [contenteditable="true"]'));
  const escudo = () => document.getElementById('escudo');

  const TEXTOS = {
    foco: ['Conteúdo protegido', 'O diagnóstico fica oculto enquanto a janela está fora de foco. Clique para continuar.'],
    captura: ['Captura de tela bloqueada', 'Este diagnóstico é pessoal e protegido. Ele não pode ser fotografado, impresso ou copiado.'],
    impressao: ['Impressão desabilitada', 'Este diagnóstico é pessoal e não pode ser impresso nem salvo em PDF.'],
    devtools: ['Sessão encerrada por segurança', 'Ferramentas de inspeção foram abertas. Para proteger as suas informações, o diagnóstico foi apagado.']
  };

  function mostrar(motivo, travarMs) {
    const el = escudo();
    if (!el) return;
    if (motivoAtual === 'devtools') return;
    motivoAtual = motivo;
    liberarApos = Date.now() + (travarMs || 0);
    const [t, d] = TEXTOS[motivo] || TEXTOS.foco;
    el.querySelector('.escudo-titulo').textContent = t;
    el.querySelector('.escudo-texto').textContent = d;
    el.querySelector('.escudo-botao').hidden = motivo === 'devtools';
    el.hidden = false;
    document.documentElement.classList.add('protegido-oculto');
  }
  function esconder(forcar) {
    const el = escudo();
    if (!el || motivoAtual === 'devtools') return;
    if (!forcar && Date.now() < liberarApos) return;
    el.hidden = true;
    motivoAtual = null;
    document.documentElement.classList.remove('protegido-oculto');
  }

  function limparClipboard() {
    try { navigator.clipboard && navigator.clipboard.writeText(AVISO_COPIA).catch(() => {}); } catch (e) { /* sem acesso */ }
  }

  function aoTeclar(e) {
    const k = (e.key || '').toLowerCase();
    const mod = e.ctrlKey || e.metaKey;
    if (k === 'printscreen' || e.keyCode === 44) {
      limparClipboard();
      mostrar('captura', 1500);
      return;
    }
    /* Win+Shift (Windows) e Cmd+Shift (Mac) antecedem os atalhos de captura */
    if (e.metaKey && e.shiftKey) { mostrar('captura', 1500); if (['3', '4', '5', 's'].includes(k)) e.preventDefault(); return; }
    if (k === 'f12') { e.preventDefault(); opcoes.aviso && opcoes.aviso('Ferramentas do navegador bloqueadas.'); return; }
    if (mod && e.shiftKey && ['i', 'j', 'c', 'k', 'e', 'm'].includes(k)) { e.preventDefault(); return; }
    if (e.metaKey && e.altKey && ['i', 'j', 'c', 'u'].includes(k)) { e.preventDefault(); return; }
    if (mod && e.shiftKey && k === 's') { e.preventDefault(); mostrar('captura', 1500); return; }
    if (mod && ['p', 's', 'u'].includes(k)) {
      e.preventDefault();
      if (k === 'p') mostrar('impressao', 800);
      else opcoes.aviso && opcoes.aviso(k === 's' ? 'Não é possível salvar esta página.' : 'O código desta página é protegido.');
      return;
    }
    if (mod && ['c', 'x', 'a'].includes(k) && !ehCampo(e.target)) { e.preventDefault(); return; }
  }
  function aoSoltar(e) {
    const k = (e.key || '').toLowerCase();
    if (k === 'printscreen' || e.keyCode === 44) { limparClipboard(); mostrar('captura', 1500); }
  }

  function iniciarAntiDevtools() {
    const disparar = () => {
      if (motivoAtual === 'devtools') return;
      mostrar('devtools');
      motivoAtual = 'devtools';
      opcoes.aoEncerrar && opcoes.aoEncerrar();
    };
    setInterval(() => {
      const t0 = performance.now();
      // eslint-disable-next-line no-debugger
      (function () { debugger; })();
      if (performance.now() - t0 > 150) disparar();
    }, 1200);
  }

  function gerarMarca() {
    try {
      const c = document.createElement('canvas');
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      c.width = 420 * dpr; c.height = 240 * dpr;
      const g = c.getContext('2d');
      g.scale(dpr, dpr);
      g.translate(210, 120);
      g.rotate(-22 * Math.PI / 180);
      g.textAlign = 'center';
      g.fillStyle = 'rgba(255,255,255,0.075)';
      g.font = '600 15px Manrope, system-ui, sans-serif';
      const linhas = marcaTexto.split('\n');
      linhas.forEach((l, i) => g.fillText(l, 0, (i - (linhas.length - 1) / 2) * 20));
      return c.toDataURL('image/png');
    } catch (e) { return ''; }
  }
  function aplicarMarca() {
    let m = document.getElementById('marca-dagua');
    if (!marcaTexto) { if (m) m.remove(); return; }
    if (!m) {
      m = document.createElement('div');
      m.id = 'marca-dagua';
      m.setAttribute('aria-hidden', 'true');
      document.body.appendChild(m);
    }
    const url = gerarMarca();
    m.style.backgroundImage = url ? `url(${url})` : 'none';
  }

  return {
    iniciar(o) {
      opcoes = o || {};
      window.addEventListener('beforeprint', () => { document.documentElement.classList.add('sem-impressao'); mostrar('impressao', 800); });
      window.addEventListener('afterprint', () => document.documentElement.classList.remove('sem-impressao'));
      document.addEventListener('contextmenu', e => { if (!ehCampo(e.target)) e.preventDefault(); });
      document.addEventListener('dragstart', e => e.preventDefault());
      document.addEventListener('selectstart', e => { if (!ehCampo(e.target)) e.preventDefault(); });
      ['copy', 'cut'].forEach(t => document.addEventListener(t, e => {
        if (ehCampo(e.target)) return;
        e.preventDefault();
        try { e.clipboardData && e.clipboardData.setData('text/plain', AVISO_COPIA); } catch (x) { /* ok */ }
      }));
      window.addEventListener('keydown', aoTeclar, true);
      window.addEventListener('keyup', aoSoltar, true);
      window.addEventListener('blur', () => { if (ativo) mostrar('foco'); });
      window.addEventListener('focus', () => { if (motivoAtual === 'foco') esconder(true); });
      document.addEventListener('visibilitychange', () => { if (document.hidden && ativo) mostrar('foco'); });
      const el = escudo();
      if (el) el.addEventListener('click', () => esconder());
      if (opcoes.antiDevtools) iniciarAntiDevtools();
      /* se alguém remover a marca d'água pelo inspetor, ela volta */
      setInterval(() => { if (marcaTexto && !document.getElementById('marca-dagua')) aplicarMarca(); }, 1000);
    },
    /* liga o escudo de foco (a partir do acesso do lead) */
    ativar() { ativo = true; },
    desativar() { ativo = false; marcaTexto = ''; aplicarMarca(); esconder(true); },
    marcaDagua(texto) { marcaTexto = texto; aplicarMarca(); },
    mostrar, esconder
  };
})();
