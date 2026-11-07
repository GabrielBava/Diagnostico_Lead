/* =====================================================================
   MOTOR DO DIAGNÓSTICO LIFE DINÂMICO
   Perguntas, Estrela LIFE (8 pilares), perfil financeiro, independência
   financeira, modelo 50-30-20 e plano em 3 frentes.
   Versão reduzida das regras do Diagnóstico LIFE completo.
   ===================================================================== */

const ETAPAS = [
  { id: 'voce', nome: 'Você', intro: 'Para começar, um pouco sobre você e sua família.' },
  { id: 'mes', nome: 'Seu mês', intro: 'Como o dinheiro entra e sai. Valores aproximados bastam.' },
  { id: 'protecao', nome: 'Proteção', intro: 'O que segura a sua família se algo sair do plano.' },
  { id: 'patrimonio', nome: 'Patrimônio', intro: 'O que você já construiu e como investe.' },
  { id: 'futuro', nome: 'Objetivos', intro: 'Seus próximos sonhos e a sua aposentadoria.' },
  { id: 'relacao', nome: 'Você e o dinheiro', intro: 'Para fechar, como você se relaciona com o dinheiro.' }
];

const PERGUNTAS = [
  /* ---------------- Você ---------------- */
  { id: 'idade', etapa: 'voce', tipo: 'numero', titulo: 'Quantos anos você tem?',
    min: 18, max: 90, sufixo: 'anos', placeholder: '35' },
  { id: 'familia', etapa: 'voce', tipo: 'escolha', titulo: 'Quem faz parte da sua vida financeira hoje?',
    opcoes: [
      { v: 'so', t: 'Só eu' },
      { v: 'casal', t: 'Eu e meu cônjuge' },
      { v: 'casal_filhos', t: 'Eu, meu cônjuge e filhos' },
      { v: 'filhos', t: 'Eu e meus filhos' }
    ] },
  { id: 'dependentes', etapa: 'voce', tipo: 'escolha', titulo: 'Alguém depende da sua renda?',
    ajuda: 'Filhos, pais ou outros familiares.',
    opcoes: [
      { v: 0, t: 'Ninguém' }, { v: 1, t: '1 pessoa' }, { v: 2, t: '2 pessoas' }, { v: 3, t: '3 ou mais' }
    ] },
  { id: 'trabalho', etapa: 'voce', tipo: 'escolha', titulo: 'De onde vem a sua renda principal?',
    opcoes: [
      { v: 'clt', t: 'Carteira assinada (CLT)' },
      { v: 'servidor', t: 'Serviço público' },
      { v: 'empresario', t: 'Empresa própria' },
      { v: 'autonomo', t: 'Trabalho autônomo ou liberal' },
      { v: 'aposentado', t: 'Aposentadoria' }
    ] },

  /* ---------------- Seu mês ---------------- */
  { id: 'renda', etapa: 'mes', tipo: 'moeda', titulo: 'Em média, qual é a renda mensal da família?',
    ajuda: 'Pode ser aproximada: o valor que entra já com os descontos. Escolha uma faixa ou digite.',
    min: 500, faixas: [
      { t: 'Até R$ 5 mil', v: 4000 }, { t: 'R$ 5 a 10 mil', v: 7500 }, { t: 'R$ 10 a 20 mil', v: 15000 },
      { t: 'R$ 20 a 40 mil', v: 30000 }, { t: 'Acima de R$ 40 mil', v: 50000 }
    ] },
  { id: 'gastos', etapa: 'mes', tipo: 'moeda', titulo: 'E quanto costuma sair por mês com o custo de vida?',
    ajuda: 'Casa, mercado, escola, saúde, lazer e cartão. As parcelas de financiamento entram na próxima.',
    min: 300, faixas: [
      { t: 'Até R$ 4 mil', v: 3000 }, { t: 'R$ 4 a 8 mil', v: 6000 }, { t: 'R$ 8 a 15 mil', v: 11500 },
      { t: 'R$ 15 a 30 mil', v: 22500 }, { t: 'Acima de R$ 30 mil', v: 38000 }
    ] },
  { id: 'parcelas', etapa: 'mes', tipo: 'moeda', titulo: 'Há parcelas fixas no seu mês?',
    ajuda: 'Financiamento de casa ou carro, empréstimos ou consórcios.',
    min: 0, faixas: [
      { t: 'Nenhuma', v: 0 }, { t: 'Até R$ 1 mil', v: 700 }, { t: 'R$ 1 a 3 mil', v: 2000 },
      { t: 'R$ 3 a 6 mil', v: 4500 }, { t: 'Acima de R$ 6 mil', v: 8000 }
    ] },
  { id: 'essencial', etapa: 'mes', tipo: 'escolha', titulo: 'Quanto do custo de vida vai para o essencial?',
    ajuda: 'Essencial é moradia, mercado, saúde, escola e transporte. O restante é estilo de vida.',
    opcoes: [
      { v: 85, t: 'Quase tudo', d: 'mais de 80%' },
      { v: 70, t: 'A maior parte', d: 'entre 60% e 80%' },
      { v: 50, t: 'Mais ou menos metade', d: 'entre 40% e 60%' },
      { v: 35, t: 'Menos da metade', d: 'menos de 40%' }
    ] },
  { id: 'dividaCara', etapa: 'mes', tipo: 'escolha',
    titulo: 'Quando o mês aperta, você recorre a cheque especial, rotativo do cartão ou empréstimo?',
    opcoes: [
      { v: 'nao', t: 'Não costumo precisar' },
      { v: 'as_vezes', t: 'De vez em quando' },
      { v: 'sempre', t: 'Sim, com frequência' }
    ] },

  /* ---------------- Proteção ---------------- */
  { id: 'reserva', etapa: 'protecao', tipo: 'escolha',
    titulo: 'Se a renda parasse hoje, por quanto tempo a sua reserva manteria a casa?',
    opcoes: [
      { v: 0, t: 'Ainda não tenho reserva' },
      { v: 1.5, t: 'Menos de 3 meses' },
      { v: 4.5, t: 'De 3 a 6 meses' },
      { v: 9, t: 'De 6 a 12 meses' },
      { v: 15, t: 'Mais de 1 ano' }
    ] },
  { id: 'seguroVida', etapa: 'protecao', tipo: 'escolha', titulo: 'Você tem seguro de vida?',
    opcoes: [
      { v: 'individual', t: 'Sim, contratei um' },
      { v: 'empresa', t: 'Só o da empresa ou do banco' },
      { v: 'nao', t: 'Ainda não' }
    ] },
  { id: 'invalidez', etapa: 'protecao', tipo: 'escolha',
    titulo: 'Se precisasse se afastar do trabalho por saúde, a sua renda estaria protegida?',
    mostrarSe: r => r.trabalho !== 'aposentado',
    opcoes: [
      { v: 'coberta', t: 'Sim, tenho seguro para isso', d: 'invalidez, doenças graves ou DIT' },
      { v: 'inss', t: 'Contaria só com o INSS' },
      { v: 'nao_sei', t: 'Não sei dizer' }
    ] },
  { id: 'sucessao', etapa: 'protecao', tipo: 'escolha',
    titulo: 'A sua família sabe como o patrimônio seria transmitido, se precisasse?',
    ajuda: 'Inventário, custos e quem recebe o quê.',
    opcoes: [
      { v: 'planejado', t: 'Sim, já está planejado' },
      { v: 'pensou', t: 'Já pensei, mas não organizei' },
      { v: 'nunca', t: 'Ainda não pensei nisso' }
    ] },

  /* ---------------- Patrimônio ---------------- */
  { id: 'investido', etapa: 'patrimonio', tipo: 'moeda', titulo: 'Quanto você tem guardado ou investido hoje?',
    ajuda: 'Poupança, aplicações e previdência. Imóveis e carros vêm a seguir.',
    min: 0, faixas: [
      { t: 'Ainda nada', v: 0 }, { t: 'Até R$ 20 mil', v: 10000 }, { t: 'R$ 20 a 100 mil', v: 60000 },
      { t: 'R$ 100 a 500 mil', v: 300000 }, { t: 'Acima de R$ 500 mil', v: 800000 }
    ] },
  { id: 'ondeInveste', etapa: 'patrimonio', tipo: 'multipla', titulo: 'Onde esse dinheiro está aplicado?',
    ajuda: 'Marque todas as opções que você usa.',
    mostrarSe: r => (r.investido || 0) > 0,
    opcoes: [
      { v: 'poupanca', t: 'Poupança' },
      { v: 'renda_fixa', t: 'Tesouro, CDB, LCI ou LCA' },
      { v: 'fundos', t: 'Fundos de investimento' },
      { v: 'acoes', t: 'Ações e fundos imobiliários' },
      { v: 'previdencia', t: 'Previdência privada' },
      { v: 'exterior', t: 'Exterior ou criptoativos' }
    ] },
  { id: 'aporte', etapa: 'patrimonio', tipo: 'moeda', titulo: 'Quanto você consegue guardar por mês?',
    ajuda: 'Em média, o que de fato vai para a reserva ou para investimentos.',
    min: 0, faixas: [
      { t: 'Nada no momento', v: 0 }, { t: 'Até R$ 500', v: 300 }, { t: 'R$ 500 a 2 mil', v: 1200 },
      { t: 'R$ 2 a 5 mil', v: 3500 }, { t: 'Acima de R$ 5 mil', v: 7000 }
    ] },
  { id: 'temBens', etapa: 'patrimonio', tipo: 'escolha', titulo: 'Você tem imóvel ou carro?',
    opcoes: [
      { v: 'ambos', t: 'Tenho imóvel e carro' },
      { v: 'imovel', t: 'Só imóvel' },
      { v: 'carro', t: 'Só carro' },
      { v: 'nenhum', t: 'Nenhum dos dois' }
    ] },
  { id: 'bens', etapa: 'patrimonio', tipo: 'grupo', titulo: 'Quanto valem, aproximadamente?',
    ajuda: 'Valor de mercado de hoje, somando tudo.',
    mostrarSe: r => r.temBens && r.temBens !== 'nenhum',
    campos: [
      { id: 'valorBens', tipo: 'moeda', rotulo: 'Valor dos bens', min: 0 },
      { id: 'saldoDevedor', tipo: 'moeda', rotulo: 'Quanto ainda falta pagar', min: 0, rotuloZero: 'Já está quitado' }
    ] },
  { id: 'bensSeguro', etapa: 'patrimonio', tipo: 'escolha', titulo: 'Esses bens têm seguro?',
    mostrarSe: r => r.temBens && r.temBens !== 'nenhum',
    opcoes: [
      { v: 'todos', t: 'Sim, todos' },
      { v: 'alguns', t: 'Só alguns' },
      { v: 'nenhum', t: 'Nenhum tem' }
    ] },

  /* ---------------- Objetivos e futuro ---------------- */
  { id: 'objetivos', etapa: 'futuro', tipo: 'multipla', max: 3, titulo: 'Quais conquistas estão nos seus planos?',
    ajuda: 'Escolha até 3.',
    opcoes: [
      { v: 'imovel', t: 'Imóvel próprio ou maior' },
      { v: 'veiculo', t: 'Carro novo' },
      { v: 'viagem', t: 'Viagens' },
      { v: 'educacao', t: 'Educação dos filhos' },
      { v: 'negocio', t: 'Abrir ou crescer um negócio' },
      { v: 'reforma', t: 'Reforma da casa' },
      { v: 'aposentadoria', t: 'Aposentadoria tranquila' },
      { v: 'dividas', t: 'Quitar dívidas' }
    ] },
  { id: 'expandir', etapa: 'futuro', tipo: 'escolha', titulo: 'Você pensa em adquirir um bem ou ampliar o seu patrimônio?',
    ajuda: 'Imóvel, carro, terreno, ponto comercial ou investimento no negócio.',
    opcoes: [
      { v: 24, t: 'Sim, nos próximos 2 anos' },
      { v: 48, t: 'Sim, em 3 a 5 anos' },
      { v: 96, t: 'Sim, mais para frente' },
      { v: 'nao', t: 'Não por enquanto' }
    ] },
  { id: 'valorDesejo', etapa: 'futuro', tipo: 'moeda', titulo: 'Qual é o valor aproximado desse objetivo?',
    ajuda: 'Uma estimativa já ajuda a calcular o caminho até ele.',
    mostrarSe: r => r.expandir !== undefined && r.expandir !== 'nao',
    min: 5000, faixas: [
      { t: 'Até R$ 100 mil', v: 70000 }, { t: 'R$ 100 a 300 mil', v: 200000 }, { t: 'R$ 300 a 600 mil', v: 450000 },
      { t: 'R$ 600 mil a 1 milhão', v: 800000 }, { t: 'Acima de R$ 1 milhão', v: 1500000 }
    ] },
  { id: 'comoConquistar', etapa: 'futuro', tipo: 'escolha', titulo: 'Como imagina fazer essa aquisição?',
    mostrarSe: r => r.expandir !== undefined && r.expandir !== 'nao',
    opcoes: [
      { v: 'avista', t: 'Juntando para pagar à vista' },
      { v: 'financiamento', t: 'Financiamento' },
      { v: 'consorcio', t: 'Consórcio' },
      { v: 'nao_sei', t: 'Ainda não sei' }
    ] },
  { id: 'aposentadoria', etapa: 'futuro', tipo: 'grupo', titulo: 'Como você imagina a sua aposentadoria?',
    mostrarSe: r => r.trabalho !== 'aposentado',
    campos: [
      { id: 'idadeAposentar', tipo: 'faixa', rotulo: 'Com quantos anos gostaria de não depender mais do trabalho?',
        min: 40, max: 75, padrao: 60, sufixo: 'anos' },
      { id: 'estilo', tipo: 'chips', rotulo: 'Com qual padrão de vida?', padrao: 1,
        opcoes: [
          { v: 0.7, t: 'Mais simples' }, { v: 1, t: 'Igual a hoje' },
          { v: 1.3, t: 'Mais confortável' }, { v: 1.6, t: 'Sofisticado' }
        ] }
    ] },

  /* ---------------- Você e o dinheiro ---------------- */
  { id: 'ir', etapa: 'relacao', tipo: 'escolha', titulo: 'Como você costuma declarar o Imposto de Renda?',
    opcoes: [
      { v: 'completa', t: 'Modelo completo' },
      { v: 'simplificada', t: 'Modelo simplificado' },
      { v: 'nao_declara', t: 'Não declaro' },
      { v: 'nao_sei', t: 'Não sei' }
    ] },
  { id: 'controle', etapa: 'relacao', tipo: 'escolha', titulo: 'Como você acompanha os gastos do mês?',
    opcoes: [
      { v: 'app', t: 'Com planilha ou aplicativo' },
      { v: 'cabeca', t: 'De cabeça, mais ou menos' },
      { v: 'nao', t: 'Ainda não acompanho' }
    ] },
  { id: 'sentimento', etapa: 'relacao', tipo: 'escolha', titulo: 'Qual frase mais combina com você hoje?',
    opcoes: [
      { v: 'tranquilo', t: 'Estou tranquilo e no controle' },
      { v: 'sem_plano', t: 'Sou organizado, mas sem um plano para o futuro' },
      { v: 'apertado', t: 'As contas apertam e isso me preocupa' },
      { v: 'perdido', t: 'Não sei bem por onde começar' }
    ] },
  { id: 'conhecimento', etapa: 'relacao', tipo: 'escala',
    titulo: 'De 0 a 10, quanto você se sente seguro sobre planejamento financeiro?',
    min: 0, max: 10, rotulos: ['Nada seguro', 'Mais ou menos', 'Muito seguro'] },
  { id: 'prioridade', etapa: 'relacao', tipo: 'escolha', titulo: 'Se pudesse resolver uma coisa agora, qual seria?',
    opcoes: [
      { v: 'orcamento', t: 'Organizar o orçamento e sair do aperto' },
      { v: 'protecao', t: 'Proteger a minha família' },
      { v: 'investir', t: 'Fazer o meu dinheiro render mais' },
      { v: 'bens', t: 'Conquistar um imóvel ou um carro' },
      { v: 'aposentadoria', t: 'Garantir a minha aposentadoria' },
      { v: 'impostos', t: 'Pagar menos imposto e planejar a sucessão' }
    ] }
];

/* Respostas em texto legível (para a planilha) */
function respostasLegiveis(r) {
  const out = {};
  const textoOpcao = (opcoes, v) => { const o = opcoes.find(x => x.v === v); return o ? o.t : (v ?? ''); };
  PERGUNTAS.forEach(q => {
    if (q.tipo === 'grupo') {
      q.campos.forEach(c => {
        const v = r[c.id];
        if (v === undefined || v === null) return;
        out[c.id] = c.tipo === 'moeda' ? fmtMoeda(v) : c.tipo === 'chips' ? textoOpcao(c.opcoes, v) : `${v} ${c.sufixo || ''}`.trim();
      });
      return;
    }
    const v = r[q.id];
    if (v === undefined || v === null) return;
    if (q.tipo === 'escolha') out[q.id] = textoOpcao(q.opcoes, v);
    else if (q.tipo === 'multipla') out[q.id] = (v || []).map(x => textoOpcao(q.opcoes, x)).join(', ');
    else if (q.tipo === 'moeda') out[q.id] = fmtMoeda(v);
    else out[q.id] = String(v);
  });
  return out;
}

/* ---------------- utilitários ---------------- */
const clamp01 = x => Math.max(0, Math.min(1, Number.isFinite(x) ? x : 0));
const media = arr => { const v = arr.filter(x => x !== null && x !== undefined); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
const ponderada = pares => {
  const v = pares.filter(p => p[0] !== null && p[0] !== undefined);
  const peso = v.reduce((a, p) => a + p[1], 0);
  return peso > 0 ? v.reduce((a, p) => a + clamp01(p[0]) * p[1], 0) / peso : null;
};
const statusDe = pct => pct === null ? 'sem-dados' : pct >= 75 ? 'ok' : pct >= 45 ? 'atencao' : 'critico';

const fmtMoeda = (v, compacto) => {
  const n = Math.round(v || 0);
  if (compacto && Math.abs(n) >= 1e6) return 'R$ ' + (n / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mi';
  if (compacto && Math.abs(n) >= 1e4) return 'R$ ' + Math.round(n / 1e3).toLocaleString('pt-BR') + ' mil';
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
};
const fmtPct = (x, casas = 0) => (Math.round((x || 0) * 100 * Math.pow(10, casas)) / Math.pow(10, casas)).toLocaleString('pt-BR') + '%';
const fmtMeses = m => m >= 1 ? (Math.floor(m * 10) / 10).toLocaleString('pt-BR') + (m >= 2 ? ' meses' : ' mês') : 'menos de 1 mês';

/* Valor futuro com aportes mensais (taxa mensal i, n meses) */
const valorFuturo = (pv, pmt, i, n) => {
  if (n <= 0) return pv;
  const f = Math.pow(1 + i, n);
  return pv * f + (i > 0 ? pmt * (f - 1) / i : pmt * n);
};
const aporteParaMeta = (meta, pv, i, n) => {
  if (n <= 0) return 0;
  const f = Math.pow(1 + i, n);
  const falta = meta - pv * f;
  if (falta <= 0) return 0;
  return i > 0 ? falta * i / (f - 1) : falta / n;
};

/* ---------------- cálculo principal ---------------- */
function calcularDiagnostico(r) {
  const PR = CONFIG.premissas;
  const idade = Number(r.idade) || 35;
  const renda = Math.max(1, Number(r.renda) || 0);
  const gastos = Math.max(0, Number(r.gastos) || 0);
  const parcelas = Math.max(0, Number(r.parcelas) || 0);
  const despesas = gastos + parcelas;
  const sobra = renda - despesas;
  const taxaPoupanca = sobra / renda;
  const essencialPct = (Number(r.essencial) || 70) / 100;
  const necessidades = (gastos * essencialPct + parcelas) / renda;
  const desejos = gastos * (1 - essencialPct) / renda;
  const futuroPct = Math.max(0, sobra) / renda;
  const comprometimento = parcelas / renda;
  const reservaMeses = Number(r.reserva) || 0;
  const metaReserva = despesas * PR.mesesReserva;
  const reservaAtual = Math.min(despesas * reservaMeses, Math.max(Number(r.investido) || 0, despesas * reservaMeses));
  const investido = Math.max(0, Number(r.investido) || 0);
  const aporte = Math.max(0, Number(r.aporte) || 0);
  const temBens = !!r.temBens && r.temBens !== 'nenhum';
  const valorBens = temBens ? Math.max(0, Number(r.valorBens) || 0) : 0;
  const saldoDevedor = temBens ? Math.min(valorBens || Infinity, Math.max(0, Number(r.saldoDevedor) || 0)) : 0;
  const patrimonioBruto = investido + valorBens;
  const patrimonioLiquido = patrimonioBruto - saldoDevedor;
  const onde = r.ondeInveste || [];
  const temPrevidencia = onde.includes('previdencia');
  const aposentado = r.trabalho === 'aposentado';
  const temDependentes = (Number(r.dependentes) || 0) > 0 || (r.familia && r.familia !== 'so');
  const objetivos = r.objetivos || [];
  /* expansão: pretende adquirir um bem, em quanto tempo e por quanto */
  const querBens = r.expandir !== undefined && r.expandir !== 'nao';
  const prazoBem = querBens ? Number(r.expandir) || 48 : 0;
  const valorDesejo = querBens ? Math.max(0, Number(r.valorDesejo) || 0) : 0;
  const custoInventario = patrimonioLiquido > 0 ? patrimonioLiquido * PR.custoInventario : 0;

  /* -------- independência financeira -------- */
  const iMes = Math.pow(1 + PR.retornoReal, 1 / 12) - 1;
  const estilo = Number(r.estilo) || 1;
  let idadeAlvo = aposentado ? idade : (Number(r.idadeAposentar) || 60);
  if (!aposentado && idadeAlvo <= idade) idadeAlvo = idade + 1;
  const anos = Math.max(0, idadeAlvo - idade);
  const meses = anos * 12;
  let rendaDesejada, necessario, projetado, aporteNecessario, serie = [];
  if (aposentado) {
    const lacuna = Math.max(0, gastos - renda);
    rendaDesejada = gastos;
    necessario = lacuna * 12 / PR.taxaRetirada;
    projetado = investido;
    aporteNecessario = 0;
  } else {
    rendaDesejada = gastos * estilo;
    necessario = rendaDesejada * 12 / PR.taxaRetirada;
    projetado = valorFuturo(investido, aporte, iMes, meses);
    aporteNecessario = aporteParaMeta(necessario, investido, iMes, meses);
    const aportePlano = Math.max(aporte, aporteNecessario);
    for (let k = 0; k <= anos; k++) {
      serie.push({
        idade: idade + k,
        atual: valorFuturo(investido, aporte, iMes, k * 12),
        plano: valorFuturo(investido, aportePlano, iMes, k * 12)
      });
    }
  }
  const independencia = necessario > 0 ? projetado / necessario : 1;
  const aporteBem = querBens && valorDesejo > 0 ? aporteParaMeta(valorDesejo, 0, iMes, prazoBem) : 0;
  const rendaProjetada = projetado * PR.taxaRetirada / 12;

  /* -------- Estrela LIFE: 8 pilares -------- */
  const nControle = { app: 1, cabeca: 0.45, nao: 0 }[r.controle];
  const nDivida = { nao: 1, as_vezes: 0.4, sempre: 0 }[r.dividaCara];
  const nVida = { individual: 1, empresa: 0.35, nao: 0 }[r.seguroVida];
  const nInvalidez = aposentado ? null : { coberta: 1, inss: 0.25, nao_sei: 0 }[r.invalidez];
  const nBensSeg = temBens ? { todos: 1, alguns: 0.5, nenhum: 0 }[r.bensSeguro] : null;
  const nClareza = querBens ? (valorDesejo > 0 ? 1 : 0.6) : objetivos.length ? 0.5 : 0.1;
  const nConquista = querBens ? { avista: 1, consorcio: 1, nao_sei: 0.4, financiamento: 0.1 }[r.comoConquistar] : null;
  const nSucessao = { planejado: 1, pensou: 0.35, nunca: 0 }[r.sucessao];
  const classes = ['renda_fixa', 'fundos', 'acoes', 'previdencia', 'exterior'].filter(c => onde.includes(c)).length + (onde.includes('poupanca') ? 0.5 : 0);
  const fracaoFinanceira = patrimonioBruto > 0 ? investido / patrimonioBruto : 0;
  let nTributario;
  if (temPrevidencia) nTributario = r.ir === 'completa' ? 0.6 : 0.8;
  else nTributario = { completa: 0, simplificada: 0.5, nao_declara: 0.5, nao_sei: 0.25 }[r.ir] ?? 0.25;
  const esperadoIdade = idade * renda * 12 / 10;

  const defs = [
    { id: 'organizacao', nome: 'Organização Financeira', curto: 'Organização', max: 10,
      descricao: 'O mês fecha no azul e o orçamento é equilibrado.',
      subs: [
        sobra < 0 ? 0 : clamp01(taxaPoupanca / 0.2),
        clamp01(1 - (Math.max(0, necessidades - 0.5) + Math.max(0, desejos - 0.3)) / 0.3)
      ] },
    { id: 'comportamento', nome: 'Comportamento', curto: 'Comportamento', max: 10,
      descricao: 'Hábitos que fazem o dinheiro render.',
      subs: [
        media([nControle, nDivida, temPrevidencia ? 1 : 0]),
        (4 * clamp01(aporte / (0.2 * renda)) + (investido > 0 ? 1 : 0)) / 5
      ] },
    { id: 'protecao', nome: 'Proteção Financeira', curto: 'Proteção', max: 15,
      descricao: 'Família, renda e bens protegidos contra imprevistos.',
      subs: [
        ponderada([[nVida, 0.7], [nInvalidez, 0.3]]),
        clamp01(reservaMeses / PR.mesesReserva),
        nBensSeg
      ] },
    { id: 'objetivos', nome: 'Objetivos Financeiros', curto: 'Objetivos', max: 15,
      descricao: 'Sonhos com valor, prazo e dinheiro separado.',
      subs: [
        nClareza,
        ponderada([[aporteBem > 0 ? clamp01(aporte / aporteBem) : clamp01(aporte / (0.15 * renda)), 0.6], [nConquista, 0.4]])
      ] },
    { id: 'acumulo', nome: 'Acúmulo de Capital', curto: 'Acúmulo', max: 10,
      descricao: 'O dinheiro se acumula sem depender de crédito caro.',
      subs: [
        ((nDivida ?? 0) + clamp01(1 - comprometimento / PR.limiteParcelas * 0.6)) / 2,
        investido <= 0 ? 0 : 0.6 * clamp01(classes / 4) + 0.4 * clamp01(fracaoFinanceira / 0.2)
      ] },
    { id: 'aposentadoria', nome: 'Planejamento da Aposentadoria', curto: 'Aposentadoria', max: 15,
      descricao: 'O futuro sendo construído para manter o padrão de vida.',
      subs: [
        clamp01(independencia),
        aposentado ? clamp01(independencia) : (aporteNecessario <= 0 ? 1 : clamp01(aporte / aporteNecessario)),
        0.4 + 0.6 * nTributario
      ] },
    { id: 'expansao', nome: 'Expansão de Capital', curto: 'Expansão', max: 10,
      descricao: 'Bens conquistados sem juros e patrimônio que cresce com a idade.',
      subs: [
        ponderada([[valorBens > 0 ? (valorBens - saldoDevedor) / valorBens : null, 0.6], [nConquista, 0.4]]) ?? 0.3,
        clamp01(patrimonioLiquido / esperadoIdade)
      ] },
    { id: 'sucessao', nome: 'Sucessão Patrimonial', curto: 'Sucessão', max: 15,
      descricao: 'O patrimônio chega à família de forma rápida e barata.',
      subs: [
        nSucessao,
        media([r.seguroVida === 'individual' ? 1 : 0, temPrevidencia ? 1 : 0]),
        patrimonioBruto > 0 ? clamp01((r.sucessao === 'planejado' ? 0.6 : 0) + (r.seguroVida === 'individual' ? 0.4 : 0)) : null
      ] }
  ];
  const pilares = defs.map(d => {
    const f = media(d.subs.map(s => (s === null || s === undefined) ? null : clamp01(s)));
    const pct = f === null ? 0 : Math.round(f * 100);
    return { id: d.id, nome: d.nome, curto: d.curto, descricao: d.descricao, max: d.max,
      pct, pontos: Math.round(pct * d.max / 100), status: statusDe(pct) };
  });
  const notaLife = pilares.reduce((a, p) => a + p.pontos, 0);

  /* -------- perfil financeiro -------- */
  let perfil;
  if (sobra < 0) perfil = { nome: 'Em déficit', descricao: 'Gasta mais do que ganha. O primeiro passo é reorganizar o orçamento.' };
  else if (comprometimento > PR.limiteParcelas || r.dividaCara === 'sempre') perfil = { nome: 'Endividado', descricao: 'Parcelas e dívidas tomam parte relevante da renda e limitam as escolhas.' };
  else if (taxaPoupanca >= 0.2 && investido > 0) perfil = { nome: 'Construtor de patrimônio', descricao: 'Poupa com consistência e já faz o dinheiro trabalhar.' };
  else if (taxaPoupanca >= 0.2) perfil = { nome: 'Poupador', descricao: 'Gasta menos do que ganha. Falta direcionar a sobra para investimentos.' };
  else if (taxaPoupanca >= 0.1) perfil = { nome: 'Equilibrado', descricao: 'Vive bem e poupa um pouco todo mês. Dá para acelerar os objetivos.' };
  else perfil = { nome: 'Consumidor', descricao: 'Quase toda a renda vai para o dia a dia e sobra pouco para o futuro.' };

  /* -------- plano em 3 frentes -------- */
  const imediato = [];
  if (sobra < 0) imediato.push({ peso: 100, titulo: 'Fechar o mês no azul',
    texto: `Hoje faltam ${fmtMoeda(-sobra)} por mês. Sem ajuste, a diferença vira cheque especial e juros altos.` });
  if (r.dividaCara && r.dividaCara !== 'nao') imediato.push({ peso: r.dividaCara === 'sempre' ? 95 : 70, titulo: 'Sair do crédito caro',
    texto: 'Cheque especial, rotativo e empréstimo pessoal estão entre os juros mais altos do mercado e corroem a renda.' });
  if (comprometimento > PR.limiteParcelas) imediato.push({ peso: 85, titulo: 'Reduzir o peso das parcelas',
    texto: `As parcelas levam ${fmtPct(comprometimento)} da renda. O limite saudável é ${fmtPct(PR.limiteParcelas)}.` });
  if (reservaMeses < 3) imediato.push({ peso: 80, titulo: 'Criar a reserva de emergência',
    texto: `A meta é ${fmtMoeda(metaReserva)} (${PR.mesesReserva} meses de despesas). Hoje ela cobre ${reservaMeses > 0 ? fmtMeses(reservaMeses) : 'nada'}.` });
  if (temDependentes && r.seguroVida === 'nao') imediato.push({ peso: 78, titulo: 'Proteger quem depende de você',
    texto: 'Sem seguro de vida, a família perde a sua renda de uma hora para outra.' });
  if (!aposentado && r.invalidez !== 'coberta' && ['empresario', 'autonomo'].includes(r.trabalho)) imediato.push({ peso: 72, titulo: 'Proteger a sua renda',
    texto: 'Sem salário garantido, um afastamento por doença ou acidente para a renda da família.' });
  if (!aposentado && independencia < 0.35 && idade >= 45) imediato.push({ peso: 68, titulo: 'Acelerar a aposentadoria',
    texto: `No ritmo atual, você chega aos ${idadeAlvo} anos com ${fmtPct(Math.min(independencia, 1))} do patrimônio necessário.` });
  imediato.sort((a, b) => b.peso - a.peso);

  const fortes = [];
  const fraseForte = {
    organizacao: 'Seu mês fecha no azul e sobra dinheiro para o futuro.',
    comportamento: 'Bons hábitos: você poupa e investe com disciplina.',
    protecao: 'Família, renda e bens bem protegidos.',
    objetivos: 'Objetivos claros e com dinheiro direcionado.',
    acumulo: 'Patrimônio crescendo sem depender de crédito caro.',
    aposentadoria: 'Aposentadoria no caminho certo.',
    expansao: 'Bens conquistados sem pagar juros.',
    sucessao: 'Sucessão do patrimônio já pensada.'
  };
  [...pilares].sort((a, b) => b.pct - a.pct).filter(p => p.pct >= 70).slice(0, 2)
    .forEach(p => fortes.push({ titulo: p.curto, texto: fraseForte[p.id] }));
  if (!fortes.length) {
    const melhor = [...pilares].sort((a, b) => b.pct - a.pct)[0];
    fortes.push({ titulo: 'Ponto de partida', texto: melhor.pct >= 40
      ? `Seu pilar mais forte hoje é ${melhor.nome} (${melhor.pct}%). E você já deu o passo mais importante: conhecer seus números.`
      : 'Você deu o passo mais importante: olhar para os seus números com sinceridade. É daqui que o plano começa.' });
  }

  const ajustes = [];
  if (sobra >= 0 && taxaPoupanca < 0.2) ajustes.push({ peso: 70, titulo: 'Poupar 20% da renda',
    texto: `Hoje sobram ${fmtPct(taxaPoupanca)} da renda. Chegar a 20% significa ${fmtMoeda(0.2 * renda - sobra)} a mais por mês para o futuro.` });
  if (reservaMeses >= 3 && reservaMeses < PR.mesesReserva) ajustes.push({ peso: 60, titulo: 'Completar a reserva',
    texto: `Faltam cerca de ${fmtMoeda(Math.max(0, metaReserva - despesas * reservaMeses))} para cobrir ${PR.mesesReserva} meses de despesas.` });
  if (necessidades > 0.5) ajustes.push({ peso: 55, titulo: 'Aliviar o essencial',
    texto: `O essencial e as parcelas somam ${fmtPct(necessidades)} da renda. O ideal é até 50%.` });
  if (desejos > 0.3) ajustes.push({ peso: 52, titulo: 'Rever o estilo de vida',
    texto: `Estilo de vida em ${fmtPct(desejos)} da renda. O ideal é até 30%.` });
  if (investido > 0 && (onde.length === 1 && onde[0] === 'poupanca')) ajustes.push({ peso: 58, titulo: 'Tirar o dinheiro da poupança',
    texto: 'A poupança costuma render abaixo de outras opções de baixo risco. Diversificar acelera os objetivos.' });
  else if (investido > 0 && classes < 2) ajustes.push({ peso: 45, titulo: 'Diversificar os investimentos',
    texto: 'Concentrar tudo em um só tipo de aplicação aumenta o risco e limita o retorno.' });
  if (r.seguroVida === 'empresa') ajustes.push({ peso: 50, titulo: 'Ter um seguro de vida seu',
    texto: 'O seguro da empresa acaba quando você sai dela e quase nunca cobre o necessário.' });
  if (temBens && (r.bensSeguro === 'alguns' || r.bensSeguro === 'nenhum')) ajustes.push({ peso: 40, titulo: 'Segurar os bens descobertos',
    texto: `Há bens sem seguro${valorBens > 0 ? ` em um patrimônio de ${fmtMoeda(valorBens, true)}` : ''}. Um imprevisto vira prejuízo.` });
  if (querBens && aporteBem > 0 && aporte < aporteBem && sobra > 0) ajustes.push({ peso: 56, titulo: 'Separar o dinheiro do objetivo',
    texto: `Para chegar a ${fmtMoeda(valorDesejo, true)} em ${prazoBem / 12 >= 1 ? Math.round(prazoBem / 12) + ' anos' : prazoBem + ' meses'}, o ideal é guardar cerca de ${fmtMoeda(aporteBem)} por mês para ele.` });
  if (!querBens && objetivos.length) ajustes.push({ peso: 42, titulo: 'Dar valor e prazo aos objetivos',
    texto: 'Objetivo sem número vira desejo. Com valor e prazo, dá para calcular quanto separar por mês.' });
  if (r.controle !== 'app') ajustes.push({ peso: 38, titulo: 'Acompanhar os gastos todo mês',
    texto: 'Quem mede o que gasta encontra, em média, sobras que não via.' });
  ajustes.sort((a, b) => b.peso - a.peso);

  /* Oportunidades: onde a Life atua junto (seguro, consórcio, investimentos...) */
  const ops = [];
  const bonus = { protecao: ['seguro'], bens: ['consorcio'], investir: ['investimentos'], aposentadoria: ['previdencia', 'investimentos'], impostos: ['sucessao', 'tributario'], orcamento: ['planejamento'] }[r.prioridade] || [];
  const op = o => ops.push({ ...o, potencial: Math.min(100, o.potencial + (bonus.includes(o.chave) ? 10 : 0)) });
  if (temDependentes && r.seguroVida !== 'individual') {
    const capital = gastos * 12 * 5 + custoInventario;
    op({ chave: 'seguro', produto: 'Seguro de vida', titulo: 'Proteção da família',
      texto: `Seguro de vida que mantenha o padrão da família por 5 anos: capital de referência de ${fmtMoeda(capital, true)}.`, potencial: 86 });
  }
  if (!aposentado && r.invalidez !== 'coberta') op({ chave: 'seguro', produto: 'Seguro de renda', titulo: 'Renda protegida',
    texto: `Cobertura de invalidez, doenças graves e afastamento (DIT) para repor até ${fmtMoeda(renda)} por mês.`,
    potencial: ['empresario', 'autonomo'].includes(r.trabalho) ? 84 : 72 });
  const apertado = sobra < 0 || r.dividaCara === 'sempre' || comprometimento > PR.limiteParcelas;
  if (apertado) op({ chave: 'planejamento', produto: 'Planejamento financeiro', titulo: 'Orçamento sob controle',
    texto: 'Reorganizar as despesas e trocar dívidas caras por crédito mais barato, com acompanhamento mês a mês.', potencial: 90 });
  const cartaTxt = valorDesejo > 0 ? `carta de crédito de cerca de ${fmtMoeda(valorDesejo, true)}` : 'carta de crédito';
  if (querBens && r.comoConquistar !== 'avista') op({ chave: 'consorcio', produto: 'Consórcio', titulo: 'Conquista sem juros',
    texto: r.comoConquistar === 'consorcio'
      ? `Você já pensa em consórcio: a Life estrutura a ${cartaTxt}, o prazo e a estratégia de lance para o seu objetivo.`
      : `Consórcio planejado no lugar do financiamento: uma ${cartaTxt} para conquistar o bem sem os juros bancários.`,
    potencial: ({ financiamento: 90, consorcio: 84, nao_sei: 80 }[r.comoConquistar] || 76) + (prazoBem <= 24 ? 4 : 0) - (apertado ? 22 : 0) });
  else if (querBens && valorDesejo > 0) op({ chave: 'investimentos', produto: 'Investimentos', titulo: 'Objetivo com data',
    texto: `Uma carteira dedicada para juntar ${fmtMoeda(valorDesejo, true)} no prazo, com o rendimento trabalhando a seu favor.`, potencial: 66 });
  if (saldoDevedor > 0) op({ chave: 'consorcio', produto: 'Crédito', titulo: 'Revisar financiamentos',
    texto: `Portabilidade e amortização para reduzir o custo de ${fmtMoeda(saldoDevedor, true)} ainda financiados.`, potencial: 60 });
  if (!aposentado && independencia < 1) op({ chave: 'investimentos', produto: 'Investimentos', titulo: 'Plano de independência',
    texto: `Investir ${fmtMoeda(aporteNecessario)} por mês até os ${idadeAlvo} anos para viver com ${fmtMoeda(rendaDesejada)} mensais (hoje: ${fmtMoeda(aporte)}).`,
    potencial: 74 });
  if (reservaMeses < PR.mesesReserva) op({ chave: 'investimentos', produto: 'Investimentos', titulo: 'Reserva bem aplicada',
    texto: 'Reserva de emergência com liquidez diária e rendimento acima da poupança.', potencial: 58 });
  if (r.ir === 'completa' && !temPrevidencia) op({ chave: 'previdencia', produto: 'Previdência PGBL', titulo: 'Imposto a seu favor',
    texto: 'Quem declara no modelo completo pode deduzir até 12% da renda bruta no IR investindo em PGBL.', potencial: 76 });
  else if (!temPrevidencia && !aposentado) op({ chave: 'previdencia', produto: 'Previdência', titulo: 'Previdência privada',
    texto: 'Previdência com beneficiários definidos: investe para o futuro e fica fora do inventário.', potencial: 60 });
  if (patrimonioBruto >= 150000 && r.sucessao !== 'planejado') op({ chave: 'sucessao', produto: 'Sucessão', titulo: 'Inventário planejado',
    texto: `O inventário do seu patrimônio pode custar cerca de ${fmtMoeda(custoInventario, true)} entre ITCMD, honorários e custas.`,
    potencial: patrimonioBruto >= 1000000 ? 80 : 66 });
  if (patrimonioBruto >= 1000000) op({ chave: 'tributario', produto: 'Estrutura patrimonial', titulo: 'Holding e impostos',
    texto: `Com ${fmtMoeda(patrimonioBruto, true)} em patrimônio, vale avaliar holding familiar, planejamento tributário e proteção dos bens.`, potencial: 70 });
  if (temBens && (r.bensSeguro === 'alguns' || r.bensSeguro === 'nenhum')) op({ chave: 'seguro', produto: 'Seguro patrimonial', titulo: 'Bens protegidos',
    texto: `Seguro ${r.temBens === 'carro' ? 'auto' : r.temBens === 'imovel' ? 'residencial' : 'residencial e auto'}: o patrimônio protegido por um custo baixo.`, potencial: 62 });
  if (investido > 0 && classes < 2) op({ chave: 'investimentos', produto: 'Investimentos', titulo: 'Carteira diversificada',
    texto: 'Carteira montada para o seu perfil, além da poupança e de um só produto.', potencial: 64 });
  ops.sort((a, b) => b.potencial - a.potencial);
  /* no máximo 1 item por produto nas 3 primeiras posições */
  const juntos = [];
  const usados = new Set();
  ops.forEach(o => { if (juntos.length < 3 && !usados.has(o.produto)) { juntos.push(o); usados.add(o.produto); } });

  /* Potencial por linha de produto (para o time comercial) */
  const produtos = {};
  ops.forEach(o => { produtos[o.chave] = Math.max(produtos[o.chave] || 0, o.potencial); });

  return {
    renda, gastos, parcelas, despesas, sobra, taxaPoupanca, comprometimento,
    orcamento: { necessidades, desejos, futuro: futuroPct, deficit: Math.max(0, -sobra) / renda },
    reservaMeses, metaReserva, reservaAtual, investido, aporte, valorBens, saldoDevedor,
    expansao: { querBens, prazoMeses: prazoBem, valorDesejo, aporteMensal: aporteBem, como: r.comoConquistar || '' },
    patrimonioBruto, patrimonioLiquido, custoInventario,
    independencia: { pct: independencia, idadeAlvo, anos, rendaDesejada, necessario, projetado, rendaProjetada, aporteNecessario, aporte, serie, aposentado },
    pilares, notaLife, statusGeral: statusDe(notaLife), perfil,
    plano: { imediato: imediato.slice(0, 3), fortes, ajustes: ajustes.slice(0, 3), juntos },
    oportunidades: ops, produtos
  };
}
