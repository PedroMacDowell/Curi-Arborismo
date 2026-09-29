# LP Curi Arborismo

Landing page estática (HTML, CSS e JS puros, sem build). Basta publicar a pasta em qualquer hospedagem estática: Netlify, Vercel, Cloudflare Pages, Hostinger etc.

```
index.html
assets/
  css/styles.css
  js/config.js     ← tudo o que está pendente se configura aqui
  js/main.js
  img/             ← favicon, og-image e fotos (WebP em 2 tamanhos)
  video/           ← clipes da galeria (MP4 sem áudio + poster)
SELECAO-FOTOS.md   ← origem de cada foto e o que confirmar com o cliente
```

Para testar localmente: `python -m http.server 8080` na pasta e abrir http://localhost:8080.

## Pendências (do documento de copy)

| Pendência | Onde resolver | Enquanto não resolver |
|---|---|---|
| Número do WhatsApp comercial | `config.js` → `whatsapp.number` (ex.: `5521999999999`) | Os botões levam ao formulário |
| Destino do formulário | `config.js` → `form.endpoint` | O envio mostra a mensagem de erro com link para o WhatsApp, nunca um falso sucesso |
| Limites de upload | `config.js` → `form.maxFiles` / `maxFileSizeMB` (hoje 5 imagens de 10 MB) | Valem os padrões |
| Política de privacidade | `config.js` → `privacy.url` e `privacy.notice` | O aviso do formulário e o link do rodapé ficam ocultos |
| Nota, quantidade e depoimentos do Google | `config.js` → `google` | O bloco de avaliações fica oculto (a galeria continua visível) |
| Logo final | `index.html` (cabeçalho e rodapé) e `assets/img/favicon.svg` | Usa uma marca provisória (anéis de crescimento) |
| Domínio | `index.html` → `canonical`, `og:image` e JSON-LD com URL absoluta | A prévia de link pode não carregar a imagem em alguns apps |
| Fotos e legendas | Ver `SELECAO-FOTOS.md` | Já estão com fotos reais do álbum, mas há itens a confirmar |

## Formulário

- Envia `multipart/form-data` por POST com estes campos: `nome`, `whatsapp`, `whatsapp_e164`, `cidade_bairro`, `tipo_local`, `mensagem`, `fotos` (0 a N arquivos), `origem`, `pagina`, além de UTMs e gclid/fbclid quando existirem.
- O sucesso só aparece quando o destino responde com status 2xx. O destino precisa aceitar CORS da origem do site.
- Funciona com Formspree (upload de arquivos exige plano pago), Getform, Basin, Make/n8n (webhook) ou um backend próprio.
- Tem campo anti-spam invisível (`site`), validação acessível e máscara de telefone.

## Métricas

Se houver Google Tag Manager, a página envia para o `dataLayer`:
- `whatsapp_click`, com `cta_location` = hero | servicos | trabalhos | area | contato | erro-formulario
- `generate_lead`, após envio confirmado do formulário
- `form_error`

## Decisões de implementação

- **CTAs de WhatsApp** só nas sessões 1, 3, 5, 8 e 10, como pede a copy. Não há botão flutuante.
- **Mensagens de WhatsApp:** hero e serviços usam a mensagem do hero; área usa a de região; trabalhos e contato usam a mensagem final, que fala em enviar fotos.
- **Vídeos:** tocam sem som, em loop, só quando estão visíveis, com botão de pausa. Quem ativou "reduzir movimento" ou economia de dados vê os controles nativos, sem reprodução automática.
- **Sessão 5:** a galeria é estática no HTML. As avaliações vêm do `config.js`, e as estrelas usam exatamente a nota informada.
- **Acessibilidade:** link para pular ao conteúdo, foco visível, rótulos sempre visíveis, erros associados aos campos, acordeão nativo (`details`/`summary`) e contraste AA.

## Checklist antes de publicar

- [ ] Preencher as pendências do `config.js`
- [ ] Confirmar os itens de `SELECAO-FOTOS.md`
- [ ] Testar todos os botões de WhatsApp no celular
- [ ] Testar o formulário: sucesso, erro, upload, telefone inválido e campos vazios
- [ ] Conferir a gratuidade só para Niterói, São Gonçalo, Maricá e Rio de Janeiro
- [ ] Validar a prévia do link no WhatsApp depois de configurar o domínio
