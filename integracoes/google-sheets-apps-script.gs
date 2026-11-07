/**
 * Recebe os leads do Diagnóstico LIFE Pocket numa planilha Google.
 *
 * Como usar:
 * 1. Crie uma planilha no Google Sheets.
 * 2. Menu Extensões > Apps Script. Apague o conteúdo e cole este arquivo.
 * 3. Implantar > Nova implantação > Tipo "App da Web".
 *    Executar como: você. Quem pode acessar: "Qualquer pessoa".
 * 4. Copie a URL gerada e cole em src/config.js, no campo webhookLead.
 * 5. Rode `node build.mjs` e publique a pasta dist/ de novo.
 *
 * Cada lead gera até 3 eventos: lead_iniciou (preencheu os dados),
 * diagnostico_concluido (viu o resultado) e clicou_especialista_* (clicou para falar).
 */
const COLUNAS = [
  'data', 'evento', 'temperatura', 'nome', 'telefone', 'email',
  'notaLife', 'perfil', 'independenciaPct', 'sobraMensal', 'reservaMeses', 'patrimonioBruto',
  'prioridade', 'sentimento', 'renda', 'oportunidades', 'atuarDeImediato',
  'tempoTotalSeg', 'utm_source', 'utm_campaign', 'json'
];

function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (aba.getLastRow() === 0) aba.appendRow(COLUNAS);
  const r = d.resultado || {};
  const resp = d.respostas || {};
  aba.appendRow([
    d.data, d.evento, d.temperatura || '', d.lead.nome, "'" + d.lead.telefone, d.lead.email,
    r.notaLife ?? '', r.perfil || '', r.independenciaPct ?? '', r.sobraMensal ?? '', r.reservaMeses ?? '', r.patrimonioBruto ?? '',
    resp.prioridade || '', resp.sentimento || '', resp.renda || '',
    (r.oportunidades || []).map(o => o.produto + ': ' + o.titulo).join(' | '),
    (r.atuarDeImediato || []).join(' | '),
    (d.comportamento || {}).tempoTotalSeg || '',
    (d.origem || {}).utm_source || '', (d.origem || {}).utm_campaign || '',
    JSON.stringify(d)
  ]);
  return ContentService.createTextOutput('ok');
}
