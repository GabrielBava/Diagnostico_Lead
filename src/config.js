/* =====================================================================
   CONFIGURAÇÃO DO DIAGNÓSTICO LIFE DINÂMICO
   Edite apenas este arquivo para trocar contatos, planilha, agenda e premissas.
   Depois rode:  node build.mjs   (gera a pasta dist/ para publicar)
   ===================================================================== */
const CONFIG = {
  marca: 'Grupo Life Brasil',
  produto: 'Diagnóstico LIFE Dinâmico',

  /* ---------- Falar com especialista ----------
     Só números, com DDI 55 + DDD. Ex.: '5547999998888'.
     Em branco, a opção vira "quero receber uma ligação / ser chamado no WhatsApp"
     e o pedido cai na planilha com o telefone do lead. */
  telefoneEspecialista: '',
  whatsappEspecialista: '',
  emailContato: 'planejamento@grupolifebrasil.com.br',
  mensagemWhatsapp:
    'Olá! Sou {nome} e acabei de fazer o Diagnóstico LIFE Dinâmico no site. ' +
    'Quero conversar com um especialista sobre o Diagnóstico Completo.',
  site: 'https://www.grupolifebrasil.com.br',
  politicaPrivacidade: 'https://www.grupolifebrasil.com.br',

  /* ---------- Planilha no Google Drive ----------
     URL do App da Web do Apps Script (integracoes/planilha-life.gs).
     Recebe leads, respostas, resultados, pedidos de contato e agendamentos.
     Em branco, nada é registrado. */
  urlPlanilha: '',

  /* ---------- Agenda do Diagnóstico Completo ---------- */
  agenda: {
    diasAFrente: 14,                        // quantos dias aparecem para escolher
    diasDaSemana: [1, 2, 3, 4, 5],          // 0 = domingo ... 6 = sábado
    horarios: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
    duracaoMin: 60,
    antecedenciaHoras: 12,                  // não mostra horários antes disso
    formatos: ['Online (videochamada)', 'Presencial', 'Por telefone'],
    fuso: 'America/Sao_Paulo',
    fusoOffset: '-03:00'                    // horário de Brasília
  },

  /* ---------- Premissas do cálculo (as mesmas do diagnóstico completo) ---------- */
  premissas: {
    retornoReal: 0.04,     // 4% a.a. acima da inflação
    taxaRetirada: 0.04,    // renda sustentável: 4% a.a. do patrimônio
    mesesReserva: 6,       // meta da reserva de emergência
    limiteParcelas: 0.30,  // parcelas até 30% da renda
    custoInventario: 0.10  // ITCMD (~4%) + honorários e custas (~6%)
  }
};
