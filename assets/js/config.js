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

  // Perfil da Curi Arborismo no Google. Com null, o bloco volta aos cartões de exemplo (só na versão de revisão).
  // Nota e quantidade conferidas no perfil em 13/10/2026. São valores fixos, não se atualizam sozinhos:
  // quando entrarem avaliações novas, é preciso corrigir os dois números aqui.
  // O link usa o identificador do perfil (placeid) e abre sempre a lista atual de avaliações.
  // Cada item de `reviews` vira um cartão do carrossel 3D, com estrelas, texto e nome:
  // { author: "Nome público do autor", rating: 5, text: "Texto integral do comentário." }
  // Os 11 comentários abaixo vieram do perfil em 13/10/2026, na ordem "Mais relevantes" e sem edição
  // (\n é quebra de linha). As outras 4 avaliações só têm estrelas, sem texto, e por isso não viram cartão.
  // Comentários novos também precisam ser acrescentados aqui à mão.
  // Sem itens, a versão de revisão mostra os cartões de exemplo e a versão pública, só a nota e o link.
  google: {
    rating: 5.0,
    count: 15,
    url: "https://search.google.com/local/reviews?placeid=ChIJfU25b_8KZ08RMcOabCtAR7Y",
    reviews: [
      { author: "Glaucio Silva", rating: 5, text: "Esse é bom mesmo na profissão super indico 👏👊🫡" },
      { author: "Felipe Seixas", rating: 5, text: "O melhor de todos!!\nServiço impecável!!\nRecomendo." },
      { author: "Jose De Assunção", rating: 5, text: "Empresa muito boa, totalmente capacitados e instruídos sobre o assunto, não são os famosos Zé do Facão que tem por ai..." },
      { author: "Allan Nascimento", rating: 5, text: "Super indico os profissionais!!" },
      { author: "Jonas Monteiro", rating: 5, text: "Otimo trabalho, rapido, Limpo e muito profissional." },
      { author: "Yuri Seoane", rating: 5, text: "Já tive um pé de graviola e um coqueiro removidos por eles e são extremamente profissionais e atenciosos. Super recomendo 10/10" },
      { author: "Raphael Silveira", rating: 5, text: "Trabalho excelente, equipe de primeira !" },
      { author: "Gabriel Renault", rating: 5, text: "Tive uma experiência muito boa! Resolveu o meu problema e todos muito educados! Voltarei a utilizar os serviços e super recomendo!" },
      { author: "Mello Ian", rating: 5, text: "Excelente trabalho, empresa de confiança, recomendo" },
      { author: "Cauê Trindade", rating: 5, text: "Excelente profissional. Pontual, organizado, detalhista. Indico para todos, pode confiar!" },
      { author: "Matheus Zambrotti", rating: 5, text: "Equipe muito profissional. Serviço foi melhor do que o esperado, desde a poda a coleta dos resíduos. Parabéns ao Curi e a equipe!" }
    ]
  }
};
