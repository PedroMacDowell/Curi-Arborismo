/**
 * Configuração da LP Curi Arborismo.
 *
 * Tudo o que ainda depende do cliente fica neste arquivo. Enquanto um item
 * estiver vazio, a página continua funcionando de forma segura:
 *  - sem destino do formulário, o envio mostra a mensagem de erro (nunca um falso sucesso);
 *  - sem dados do Google, o bloco de avaliações só aparece na versão de revisão, com cartões de exemplo;
 *  - sem URL da política de privacidade, o aviso junto ao formulário aparece sem link.
 */
window.CURI_CONFIG = {
  // Versão de revisão: exibe os 5 cartões demonstrativos de avaliações para aprovar o layout.
  // ANTES DE PUBLICAR a versão pública, mude para false: o bloco some até a conexão com avaliações reais.
  // Com false, ainda é possível ver os cartões abrindo a página com ?revisao=1 no fim da URL.
  reviewMode: true,

  whatsapp: {
    // Número comercial confirmado: +55 21 99991-8187 (só dígitos, com código do país e DDD).
    // Os links já estão no HTML; este valor os mantém atualizados e registra os cliques.
    number: "5521999918187",
    // Mensagens aprovadas. A chave é usada no atributo data-wa dos botões:
    // sessões 1, 3 e 5 → hero · sessão 8 → regiao · sessão 10 → final
    messages: {
      hero: "Olá! Gostaria de solicitar uma avaliação para orçamento de um serviço de arborismo.",
      regiao: "Olá! Gostaria de saber sobre atendimento da Curi Arborismo na minha região e solicitar uma avaliação para orçamento.",
      final: "Olá! Gostaria de solicitar uma avaliação para orçamento. Posso enviar algumas fotos e informações sobre a árvore?",
      // Abertura da conversa que o formulário abre ao ser enviado. Depois dela entram os dados preenchidos
      // (nome, cidade, bairro, tipo de local e descrição). PENDENTE: confirmar a redação com o cliente.
      formulario: "Olá! Gostaria de solicitar uma avaliação para orçamento. Seguem meus dados:"
    }
  },

  form: {
    // Destino: FormSubmit (formsubmit.co), que encaminha cada envio para um e-mail, sem conta nem backend.
    // PENDENTE: ativar este endereço. O primeiro envio só dispara um e-mail do FormSubmit com o link
    // "Activate Form"; é preciso clicar nele para os envios seguintes chegarem.
    // Esse e-mail traz também um código que pode entrar aqui no lugar do endereço, para ele não
    // ficar visível no código-fonte.
    to: "curiarborismogestao@gmail.com",
    // Nas duas URLs, {to} é trocado pelo valor acima.
    // Envios sem fotos: resposta em JSON, e o sucesso só aparece quando o destino confirma o recebimento.
    endpoint: "https://formsubmit.co/ajax/{to}",
    // Envios com fotos: o endereço /ajax do FormSubmit descarta anexos, então vão por POST clássico em um
    // iframe oculto. O sucesso só aparece quando o destino redireciona para a página de confirmação abaixo.
    // Deixe vazio se o destino aceitar anexos no endpoint acima.
    uploadEndpoint: "https://formsubmit.co/{to}",
    confirmPage: "enviado.html",
    // {n} vira 1, 2, 3...: cada foto vai em um campo próprio (foto_1, foto_2...).
    fileField: "foto_{n}",
    // Campos de controle do destino, enviados junto com os dados (assunto e formato do e-mail).
    extraFields: {
      _subject: "Nova solicitação de avaliação · LP Curi Arborismo",
      _template: "table",
      _captcha: "false"
    },
    maxFiles: 5,
    maxFileSizeMB: 10,
    // O FormSubmit aceita até 10 MB somando todos os anexos. Use 0 se o destino não tiver limite total.
    maxTotalMB: 10,
    timeoutMs: 60000
  },

  privacy: {
    // PENDENTE: URL real da política de privacidade. Enquanto estiver vazia, o aviso aparece sem link
    // e o link do rodapé fica oculto (nada de link sem destino).
    url: "",
    // PENDENTE: texto provisório. Confirmar a redação definitiva com o responsável.
    notice: "Os dados e as fotos enviados serão usados apenas para avaliar sua solicitação e retornar o contato.",
    // Frase acrescentada ao aviso quando houver URL. {link} vira o link "Política de Privacidade".
    linkSentence: "Saiba mais na {link}."
  },

  // PENDENTE: dados conferidos do perfil no Google. Enquanto for null, a versão pública não mostra o bloco.
  // Quando preenchido, substitui os cartões de exemplo (mesmo na versão de revisão).
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
