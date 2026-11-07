/* =====================================================================
   GRÁFICOS (SVG feitos à mão, sem bibliotecas)
   Estrela LIFE · Indicador de Independência · Projeção · Orçamento 50-30-20
   ===================================================================== */

const COR = {
  essencial: '#3987e5', estilo: '#199e70', futuro: '#d95926',
  atual: '#3987e5', plano: '#d95926',
  ok: '#3dbe86', atencao: '#f0b341', critico: '#ef5a5a'
};
const ROTULO_STATUS = { ok: 'Saudável', atencao: 'Atenção', critico: 'Crítico', 'sem-dados': 'Sem dados' };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------------- Estrela LIFE ---------------- */
function svgEstrelaLife(pilares) {
  const W = 460, H = 400, cx = 230, cy = 200, R = 118, n = pilares.length;
  const ang = i => (-90 + i * 360 / n) * Math.PI / 180;
  const pt = (i, r) => [cx + r * Math.cos(ang(i)), cy + r * Math.sin(ang(i))];
  const poly = pts => pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  let s = `<svg viewBox="0 0 ${W} ${H}" class="estrela-svg" role="img" aria-label="Estrela LIFE: ${pilares.map(p => esc(p.nome) + ' ' + p.pct + '%').join(', ')}">`;
  /* estrela de fundo (100%) */
  const estrela = [];
  for (let i = 0; i < n; i++) {
    estrela.push(pt(i, R));
    const a = (-90 + (i + 0.5) * 360 / n) * Math.PI / 180;
    estrela.push([cx + R * 0.56 * Math.cos(a), cy + R * 0.56 * Math.sin(a)]);
  }
  s += `<polygon points="${poly(estrela)}" class="estrela-fundo"/>`;
  [0.25, 0.5, 0.75, 1].forEach(f => {
    s += `<polygon points="${poly(pilares.map((_, i) => pt(i, R * f)))}" class="grade"/>`;
  });
  pilares.forEach((_, i) => { const p = pt(i, R); s += `<line x1="${cx}" y1="${cy}" x2="${p[0].toFixed(1)}" y2="${p[1].toFixed(1)}" class="grade"/>`; });
  s += `<text x="${cx + 4}" y="${(cy - R * 0.5 - 3).toFixed(1)}" class="eixo-txt">50</text>`;
  s += `<text x="${cx + 4}" y="${(cy - R - 3).toFixed(1)}" class="eixo-txt">100</text>`;
  const dados = pilares.map((p, i) => pt(i, R * Math.max(0.04, p.pct / 100)));
  s += `<polygon points="${poly(dados)}" class="estrela-dados"/>`;
  dados.forEach((d, i) => {
    const p = pilares[i];
    s += `<circle cx="${d[0].toFixed(1)}" cy="${d[1].toFixed(1)}" r="6" fill="${COR[p.status] || '#888'}" class="ponto"><title>${esc(p.nome)}: ${p.pct}% (${ROTULO_STATUS[p.status]})</title></circle>`;
  });
  pilares.forEach((p, i) => {
    const [x, y] = pt(i, R + 22);
    const c = Math.cos(ang(i));
    const anchor = Math.abs(c) < 0.2 ? 'middle' : c > 0 ? 'start' : 'end';
    const dy = Math.sin(ang(i)) < -0.9 ? -14 : Math.sin(ang(i)) > 0.9 ? 6 : -4;
    s += `<text x="${x.toFixed(1)}" y="${(y + dy).toFixed(1)}" text-anchor="${anchor}" class="rot-pilar">${esc(p.curto)}</text>`;
    s += `<text x="${x.toFixed(1)}" y="${(y + dy + 16).toFixed(1)}" text-anchor="${anchor}" class="rot-pct">${p.pct}%</text>`;
  });
  return s + '</svg>';
}

/* ---------------- Indicador de Independência (medidor semicircular) ---------------- */
function svgIndicadorIndependencia(pct) {
  const W = 300, H = 212, cx = 150, cy = 176, R = 116, esp = 18;
  const v = Math.max(0, pct), frac = Math.min(1, v);
  const texto = v >= 9.99 ? '+999%' : Math.round(v * 100) + '%';
  const pt = (f, r) => { const a = Math.PI * (1 - f); return [cx + r * Math.cos(a), cy - r * Math.sin(a)]; };
  const arco = (f0, f1, r) => { const [x0, y0] = pt(f0, r), [x1, y1] = pt(f1, r); return `M${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 0 1 ${x1.toFixed(1)},${y1.toFixed(1)}`; };
  let s = `<svg viewBox="0 0 ${W} ${H}" class="indicador-svg" role="img" aria-label="Indicador de Independência Financeira: ${texto} do patrimônio necessário">`;
  s += `<defs><linearGradient id="gradIndicador" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d9452b"/><stop offset=".6" stop-color="#ea6a2a"/><stop offset="1" stop-color="#f39a3c"/></linearGradient></defs>`;
  /* faixas de leitura, as mesmas da Nota LIFE */
  [[0, 0.445, COR.critico], [0.455, 0.745, COR.atencao], [0.755, 1, COR.ok]].forEach(([a, b, c]) => {
    s += `<path d="${arco(a, b, R + 19)}" stroke="${c}" class="ind-zona"/>`;
  });
  s += `<path d="${arco(0, 1, R)}" class="ind-trilho" stroke-width="${esp}"/>`;
  if (frac > 0.002) s += `<path d="${arco(0, frac, R)}" class="ind-valor" stroke="url(#gradIndicador)" stroke-width="${esp}"/>`;
  [0, 0.25, 0.5, 0.75, 1].forEach(f => {
    const [x0, y0] = pt(f, R - esp / 2 - 4), [x1, y1] = pt(f, R - esp / 2 - 10);
    s += `<line x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}" class="ind-marca"/>`;
  });
  const [mx, my] = pt(frac, R);
  s += `<circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="10" class="ind-marcador"/>`;
  s += `<text x="${pt(0, R)[0].toFixed(1)}" y="${cy + 26}" text-anchor="middle" class="eixo-txt">0%</text>`;
  s += `<text x="${pt(1, R)[0].toFixed(1)}" y="${cy + 26}" text-anchor="middle" class="eixo-txt">100%</text>`;
  s += `<text x="${cx}" y="${pt(0.5, R + 32)[1].toFixed(1)}" text-anchor="middle" class="eixo-txt">50%</text>`;
  s += `<text x="${cx}" y="${cy - 26}" text-anchor="middle" class="ind-num">${texto}</text>`;
  s += `<text x="${cx}" y="${cy - 2}" text-anchor="middle" class="ind-sub">da meta</text>`;
  return s + '</svg>';
}

/* ---------------- Projeção do patrimônio ---------------- */
function passoBonito(max, alvoTicks = 4) {
  const bruto = max / alvoTicks;
  const p10 = Math.pow(10, Math.floor(Math.log10(bruto)));
  const m = [1, 2, 2.5, 5, 10].find(x => x * p10 >= bruto) || 10;
  return m * p10;
}
/* geometria desenhada na largura real da caixa: texto sempre em tamanho 1:1 */
function geoProjecao(ind, largura) {
  const serie = ind.serie;
  const W = Math.max(300, Math.round(largura)), estreito = W < 560;
  const H = estreito ? 240 : 300, mL = estreito ? 58 : 72, mR = 16, mT = 18, mB = 32;
  const iw = W - mL - mR, ih = H - mT - mB;
  const maxY0 = Math.max(ind.necessario * 1.08, ...serie.map(p => p.plano), ...serie.map(p => p.atual), 1);
  const passo = passoBonito(maxY0);
  const maxY = Math.ceil(maxY0 / passo) * passo;
  const x0 = serie[0].idade, x1 = serie[serie.length - 1].idade;
  const X = idade => mL + (x1 === x0 ? 0 : (idade - x0) / (x1 - x0) * iw);
  const Y = v => mT + ih - (v / maxY) * ih;
  return { serie, W, H, mL, mR, mT, mB, iw, ih, passo, maxY, x0, x1, X, Y, estreito };
}
function svgProjecao(ind, largura) {
  const g = geoProjecao(ind, largura);
  const { serie, W, H, mL, mR, mT, ih, passo, maxY, x0, x1, X, Y } = g;
  let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="proj-svg" role="img" aria-label="Projeção do patrimônio até os ${ind.idadeAlvo} anos: no ritmo atual ${esc(fmtMoeda(serie[serie.length - 1].atual, true))}, com planejamento ${esc(fmtMoeda(serie[serie.length - 1].plano, true))}, meta ${esc(fmtMoeda(ind.necessario, true))}">`;
  for (let v = 0; v <= maxY + 1; v += passo) {
    s += `<line x1="${mL}" x2="${W - mR}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" class="grade"/>`;
    s += `<text x="${mL - 8}" y="${(Y(v) + 4).toFixed(1)}" text-anchor="end" class="eixo-txt">${v === 0 ? 'R$ 0' : esc(fmtMoeda(v, true))}</text>`;
  }
  const alvoTicks = g.estreito ? 3 : 6;
  const passoX = Math.max(1, Math.ceil((x1 - x0) / alvoTicks / 5) * 5);
  const xFim = X(x1);
  for (let a = Math.ceil(x0 / passoX) * passoX; a < x1; a += passoX) {
    if (xFim - X(a) < 64) continue; /* não encosta no rótulo final */
    s += `<text x="${X(a).toFixed(1)}" y="${H - 10}" text-anchor="middle" class="eixo-txt">${a}</text>`;
  }
  s += `<text x="${W - mR}" y="${H - 10}" text-anchor="end" class="eixo-txt eixo-forte">${x1} anos</text>`;
  s += `<line x1="${mL}" x2="${W - mR}" y1="${Y(ind.necessario).toFixed(1)}" y2="${Y(ind.necessario).toFixed(1)}" class="linha-meta"/>`;
  s += `<text x="${mL + 6}" y="${(Y(ind.necessario) - 7).toFixed(1)}" class="rot-meta">Meta: ${esc(fmtMoeda(ind.necessario, true))}</text>`;
  const caminho = k => serie.map((p, i) => (i ? 'L' : 'M') + X(p.idade).toFixed(1) + ',' + Y(p[k]).toFixed(1)).join(' ');
  s += `<path d="${caminho('plano')} L${X(x1).toFixed(1)},${Y(0).toFixed(1)} L${X(x0).toFixed(1)},${Y(0).toFixed(1)} Z" fill="${COR.plano}" fill-opacity=".10"/>`;
  s += `<path d="${caminho('plano')}" class="linha" stroke="${COR.plano}"/>`;
  s += `<path d="${caminho('atual')}" class="linha" stroke="${COR.atual}"/>`;
  const u = serie[serie.length - 1];
  s += `<circle cx="${xFim.toFixed(1)}" cy="${Y(u.plano).toFixed(1)}" r="5" fill="${COR.plano}" class="ponto"/>`;
  s += `<circle cx="${xFim.toFixed(1)}" cy="${Y(u.atual).toFixed(1)}" r="5" fill="${COR.atual}" class="ponto"/>`;
  s += `<line class="cruz" x1="0" x2="0" y1="${mT}" y2="${mT + ih}" visibility="hidden"/>`;
  s += `<circle class="cruz-p cruz-plano" r="5" fill="${COR.plano}" visibility="hidden"/><circle class="cruz-p cruz-atual" r="5" fill="${COR.atual}" visibility="hidden"/>`;
  s += `<rect class="alvo-hover" x="${mL}" y="${mT}" width="${g.iw}" height="${ih}" fill="transparent"/>`;
  return s + '</svg>';
}
function desenharProjecao(caixa, ind) {
  if (!caixa) return;
  const largura = caixa.clientWidth || 600;
  caixa.innerHTML = svgProjecao(ind, largura) + '<div class="dica" hidden></div>';
  const g = geoProjecao(ind, largura);
  const svg = caixa.querySelector('svg'), dica = caixa.querySelector('.dica');
  const cruz = svg.querySelector('.cruz'), cp = svg.querySelector('.cruz-plano'), ca = svg.querySelector('.cruz-atual');
  const mover = ev => {
    const r = svg.getBoundingClientRect();
    const px = ((ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left) / r.width * g.W;
    const idade = Math.round(g.x0 + Math.max(0, Math.min(1, (px - g.mL) / g.iw)) * (g.x1 - g.x0));
    const p = g.serie.find(q => q.idade === idade) || g.serie[g.serie.length - 1];
    const x = g.X(p.idade);
    [cruz, cp, ca].forEach(e => e.setAttribute('visibility', 'visible'));
    cruz.setAttribute('x1', x); cruz.setAttribute('x2', x);
    cp.setAttribute('cx', x); cp.setAttribute('cy', g.Y(p.plano));
    ca.setAttribute('cx', x); ca.setAttribute('cy', g.Y(p.atual));
    dica.innerHTML = `<b>${p.idade} anos</b><span><i style="background:${COR.plano}"></i>Com planejamento ${fmtMoeda(p.plano, true)}</span><span><i style="background:${COR.atual}"></i>No ritmo atual ${fmtMoeda(p.atual, true)}</span>`;
    dica.hidden = false;
    const esquerda = x / g.W * r.width;
    dica.style.left = (esquerda > r.width / 2 ? esquerda - 214 : esquerda + 14) + 'px';
  };
  const sair = () => { [cruz, cp, ca].forEach(e => e.setAttribute('visibility', 'hidden')); dica.hidden = true; };
  svg.addEventListener('mousemove', mover);
  svg.addEventListener('touchmove', mover, { passive: true });
  svg.addEventListener('mouseleave', sair);
  svg.addEventListener('touchend', sair);
}

/* ---------------- Orçamento 50-30-20 ---------------- */
function htmlOrcamento(orc) {
  const total = orc.necessidades + orc.desejos + orc.futuro + orc.deficit;
  const escala = Math.max(1, total);
  const seg = (v, cor, nome, extra = '') => v > 0.001
    ? `<span class="seg ${extra}" style="flex-basis:${(v / escala * 100).toFixed(2)}%;background:${cor}" title="${nome}: ${fmtPct(v)}">${v / escala > 0.09 ? `<em>${fmtPct(v)}</em>` : ''}</span>` : '';
  const linha = (rot, n, d, f, def) => `<div class="orc-linha"><span class="orc-rot">${rot}</span><div class="orc-barra">${seg(n, COR.essencial, 'Essencial')}${seg(d, COR.estilo, 'Estilo de vida')}${seg(f, COR.futuro, 'Futuro')}${seg(def, COR.critico, 'Déficit', 'seg-deficit')}</div></div>`;
  return `<div class="orc">
    ${linha('Você hoje', orc.necessidades, orc.desejos, orc.futuro, orc.deficit)}
    ${linha('Ideal', 0.5, 0.3, 0.2, 0)}
    <div class="legenda">
      <span><i style="background:${COR.essencial}"></i>Essencial e parcelas <b>${fmtPct(orc.necessidades)}</b> <small>ideal até 50%</small></span>
      <span><i style="background:${COR.estilo}"></i>Estilo de vida <b>${fmtPct(orc.desejos)}</b> <small>ideal até 30%</small></span>
      <span><i style="background:${COR.futuro}"></i>Futuro (sobra) <b>${fmtPct(orc.futuro)}</b> <small>ideal 20% ou mais</small></span>
      ${orc.deficit > 0 ? `<span><i class="i-deficit"></i>Déficit <b>${fmtPct(orc.deficit)}</b> <small>gasto acima da renda</small></span>` : ''}
    </div>
  </div>`;
}
