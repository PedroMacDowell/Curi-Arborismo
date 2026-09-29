/**
 * Configuração da LP Curi Arborismo.
 *
 * Tudo o que ainda depende do cliente fica neste arquivo. Enquanto um item
 * estiver vazio, a página continua funcionando de forma segura:
 *  - sem número de WhatsApp, os botões levam ao formulário (#contato);
 *  - sem destino do formulário, o envio mostra a mensagem de erro (nunca um falso sucesso);
 *  - sem dados do Google, o bloco de avaliações fica oculto;
 *  - sem política de privacidade, o aviso junto ao formulário fica oculto.
 */
window.CURI_CONFIG = {
  whatsapp: {
    // PENDENTE: número comercial completo, só dígitos, com código do país e DDD. Ex.: "5521999999999"
    number: "",
    // Mensagens aprovadas no documento de copy. A chave é usada no atributo data-wa dos botões.
    messages: {
      hero: "Olá! Gostaria de solicitar uma avaliação para orçamento de um serviço de arborismo.",
      regiao: "Olá! Gostaria de saber sobre atendimento da Curi Arborismo na minha região e solicitar uma avaliação para orçamento.",
      final: "Olá! Gostaria de solicitar uma avaliação para orçamento. Posso enviar algumas fotos e informações sobre a árvore?"
    }
  },

  form: {
    // PENDENTE: URL que recebe o POST multipart (Formspree, Getform, Make, n8n, backend próprio...).
    // O sucesso só aparece quando essa URL responde com status 2xx.
    endpoint: "",
    fileField: "fotos",
    // PENDENTE: confirmar limites de upload com quem vai receber os dados.
    maxFiles: 5,
    maxFileSizeMB: 10,
    timeoutMs: 60000
  },

  privacy: {
    // PENDENTE: URL da política e texto do aviso exibido acima do botão de envio.
    // Use {link} no texto para inserir o link da política. Ex.:
    // notice: "Usamos seus dados apenas para responder à sua solicitação. Leia a {link}."
    url: "",
    notice: ""
  },

  // PENDENTE: dados conferidos do perfil no Google. Enquanto for null, o bloco fica oculto.
  // Exemplo de preenchimento (não publicar valores fictícios):
  // google: {
  //   rating: 4.9,
  //   count: 37,
  //   url: "https://g.page/...",
  //   reviews: [
  //     { author: "Nome público do autor", text: "Texto integral do comentário." }
  //   ]
  // },
  google: null
};
