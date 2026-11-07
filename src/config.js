/* =====================================================================
   CONFIGURAÇÃO DO DIAGNÓSTICO LIFE POCKET
   Edite apenas este arquivo para trocar contatos, integração e premissas.
   Depois rode:  node build.mjs   (gera a pasta dist/ para publicar)
   ===================================================================== */
const CONFIG = {
  marca: 'Grupo Life Brasil',
  produto: 'Diagnóstico LIFE Pocket',

  /* WhatsApp do especialista, só números com DDI + DDD. Ex.: '5547999998888'.
     Em branco, o botão "Falar com especialista" abre uma janela com e-mail e site. */
  whatsappEspecialista: '',
  mensagemWhatsapp:
    'Olá! Sou {nome} e acabei de fazer o Diagnóstico LIFE Pocket no site. ' +
    'Quero falar com um especialista sobre a versão completa do diagnóstico.',
  emailContato: 'planejamento@grupolifebrasil.com.br',
  site: 'https://www.grupolifebrasil.com.br',
  politicaPrivacidade: 'https://www.grupolifebrasil.com.br',

  /* Endereço que recebe os dados do lead (POST em JSON).
     Funciona com Google Sheets (Apps Script), RD Station, n8n, Make, Zapier, HubSpot etc.
     Veja integracoes/google-sheets-apps-script.gs. Em branco, nada é enviado. */
  webhookLead: '',

  /* Premissas do cálculo (as mesmas do diagnóstico completo) */
  premissas: {
    retornoReal: 0.04,     // 4% a.a. acima da inflação
    taxaRetirada: 0.04,    // renda sustentável: 4% a.a. do patrimônio
    mesesReserva: 6,       // meta da reserva de emergência
    limiteParcelas: 0.30,  // parcelas até 30% da renda
    custoInventario: 0.10  // ITCMD (~4%) + honorários e custas (~6%)
  }
};
