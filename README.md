# LP Curi Arborismo

Landing page estática (HTML, CSS e JS puros, sem build). Basta publicar a pasta em qualquer hospedagem estática: Netlify, Vercel, Cloudflare Pages, Hostinger etc.

```
index.html
enviado.html       ← página de confirmação do formulário (envios com fotos)
assets/
  css/styles.css
  js/config.js     ← tudo o que está pendente se configura aqui
  js/main.js
  img/             ← favicon, apple-touch-icon, og-image e fotos (WebP em 2 tamanhos)
  img/marca/       ← logo horizontal, vertical e símbolo em SVG (cor Kombu)
  video/           ← clipes da galeria (MP4 sem áudio + poster)
SELECAO-FOTOS.md   ← origem de cada foto e o que confirmar com o cliente
```

Para testar localmente: `python -m http.server 8080` (ou `npx serve`) na pasta e abrir http://localhost:8080.

## Identidade visual

Segue o manual "Identidade visual Curi Arborismo – v01".

| Cor | Hex | Uso na página |
|---|---|---|
| Kombu Green | `#283618` | Cabeçalho, hero, contato, rodapé, títulos |
| Dark Olive Green | `#606C38` | Sessão 4 (diferenciais), sobretítulos, foco |
| Cornsilk | `#FEFAE0` | Fundo das sessões claras e texto sobre fundo escuro |
| Fawn | `#DDA15E` | Destaques sobre fundo escuro, linha do horizonte, rótulo "Depois" |
| Liver (dogs) | `#BC6C25` | Detalhes (estrelas, borda da citação). Nos botões e números usa-se `#A65E1F`, um tom um pouco mais escuro, para o texto creme passar no contraste AA |

- **Tipografia:** Quicksand (Google Fonts) em títulos e textos. A Giker aparece só no logotipo, que entra vetorizado, então não é preciso carregar a fonte.
- **Logo:** o horizontal (cabeçalho e rodapé) e o símbolo (marca d'água no hero, no contato e no cartão de área) estão no sprite SVG do `index.html` e herdam a cor por `currentColor`. Foram vetorizados a partir dos PNG finais. Se o designer enviar os SVG oficiais, basta trocar o `d` dos símbolos `#logo-h` e `#logo-mark` e os arquivos de `assets/img/marca/`.
- **Motivos da marca:** fotos com topo em arco e uma linha de horizonte embaixo (como no símbolo), e um meio-sol antes de cada sobretítulo.

## Pendências

| Pendência | Onde resolver | Enquanto não resolver |
|---|---|---|
| Ativação do e-mail do formulário | Fazer um envio pela página e clicar em "Activate Form" no e-mail que o FormSubmit manda para `curiarborismogestao@gmail.com` (`config.js` → `form.to`) | O envio mostra a mensagem de erro com link para o WhatsApp, e esse primeiro envio não é entregue. **Depois de ativar, confirmar que os dados e os anexos chegam** |
| Política de privacidade | `config.js` → `privacy.url` e `privacy.notice` (texto provisório) | O aviso aparece junto ao formulário sem link, e o link do rodapé fica oculto |
| Avaliações do Google | `config.js` → `google` (ou trocar o bloco pelo plugin do Google) | Só a versão de revisão mostra os 5 cartões de exemplo |
| Versão pública | `config.js` → `reviewMode: false` | A página está como **versão de revisão** (`reviewMode: true`) |
| Fotos finais | Ver `SELECAO-FOTOS.md`. A escolha é do Lucas, depois que o restante for aprovado | Usa as fotos atuais do álbum |
| Domínio | `index.html` → `canonical`, `og:image` e JSON-LD com URL absoluta | A prévia de link pode não carregar a imagem em alguns apps |

## WhatsApp

Número comercial: +55 21 99991-8187. Os links `wa.me` já estão no HTML (funcionam sem JS) e o `main.js` os atualiza a partir do `config.js`.

| Sessão | Botão | Mensagem (`data-wa`) |
|---|---|---|
| 1 · Hero | Solicitar avaliação para orçamento | `hero` |
| 3 · Serviços | Solicitar avaliação para orçamento | `hero` |
| 5 · Trabalhos | Quero avaliar meu caso | `hero` |
| 8 · Área | Consultar atendimento na minha região | `regiao` |
| 10 · Contato | Falar pelo WhatsApp | `final` |

O link de WhatsApp da mensagem de erro do formulário também usa `final`. Não há botão flutuante.

**Formulário + WhatsApp:** além do e-mail, o envio do formulário abre uma conversa no WhatsApp com os dados preenchidos (nome, cidade, bairro, tipo de local e descrição), depois da abertura definida em `whatsapp.messages.formulario`. A pessoa ainda precisa tocar em enviar dentro do WhatsApp.
- **Sem fotos:** a conversa abre na hora do clique e o e-mail segue em segundo plano.
- **Com fotos:** abre uma aba de espera ("Enviando sua solicitação e as fotos…") que só vai para o WhatsApp depois que o envio é confirmado, para o celular não interromper o upload ao trocar de aplicativo. Se o envio falhar, a aba fecha e aparece a mensagem de erro.
- A tela de sucesso tem o botão "Abrir conversa no WhatsApp" com a mesma mensagem, para quando o navegador não abre a conversa sozinho (navegadores embutidos de Instagram e Facebook, por exemplo). O link da mensagem de erro também leva os dados preenchidos.

## Avaliações (sessão 5)

- **Versão de revisão** (`reviewMode: true`, ou qualquer versão aberta com `?revisao=1` na URL): mostra o bloco "O que nossos clientes dizem" com 5 cartões marcados como "Avaliação de exemplo". Os textos são de preenchimento, sem nomes, notas ou quantidades inventados.
- **Versão pública** (`reviewMode: false`): o bloco fica oculto até a conexão com avaliações reais.
- **Com o perfil do Google:** preencher `google` no `config.js` (nota, quantidade, link e comentários conferidos). Os exemplos somem e entram os dados reais, também na versão pública. Se preferir o plugin oficial do Google, ele substitui a lista `[data-review-list]`.
- **Carrossel:** 3 cartões no desktop, 2 no tablet e 1 no celular, com botões anterior/próximo, indicador "1–3 de 5", rolagem por toque ou teclado e nenhum avanço automático.

## Formulário

- **Destino:** [FormSubmit](https://formsubmit.co), que encaminha cada envio para um e-mail, sem conta nem backend. O endereço fica em `form.to` e entra nas duas URLs de envio no lugar de `{to}`.
- **Ativação:** o primeiro envio para cada endereço não entrega nada, só dispara um e-mail do FormSubmit com o link "Activate Form". Depois de clicar, os envios seguintes chegam. O mesmo e-mail traz um código que pode substituir o endereço na URL, para ele não ficar visível no código-fonte.
- **Para trocar o e-mail:** alterar `form.to`, fazer um envio pela página e ativar pelo link que chegar na nova caixa.
- **Sem fotos:** vai por `fetch` para `form.endpoint` (`/ajax`), que responde em JSON.
- **Com fotos:** o endereço `/ajax` do FormSubmit entrega os campos, mas descarta os anexos. Por isso o envio vai por POST clássico para `form.uploadEndpoint`, dentro de um iframe oculto, e a pessoa não sai da página. Como a resposta de outra origem não pode ser lida, a confirmação é o FormSubmit redirecionar o iframe para `enviado.html` (campo `_next`). Se isso não acontecer, aparece a mensagem de erro.
- Envia `multipart/form-data` por POST com estes campos: `nome`, `whatsapp`, `whatsapp_e164`, `cidade`, `bairro`, `tipo_local`, `mensagem`, `foto_1` a `foto_5` (0 a 5 arquivos), `origem` e `pagina`, além de UTMs e gclid/fbclid quando existirem. Os campos de `form.extraFields` (assunto e formato do e-mail) vão junto.
- Obrigatórios: nome, WhatsApp, cidade, bairro, tipo de local e descrição. Fotos são opcionais: até 5 imagens nos formatos JPG, PNG, WEBP ou HEIC, somando até 10 MB (limite de anexos do FormSubmit, em `form.maxTotalMB`).
- O sucesso só aparece quando o destino confirma o recebimento. Sem fotos: status 2xx e, se a resposta for JSON, sem `success: "false"` (é assim que o FormSubmit avisa que o e-mail ainda não foi ativado). Com fotos: o redirecionamento para `enviado.html`.
- Para usar outro destino (Getform, Basin, Make/n8n ou backend próprio), basta trocar `form.endpoint` e ajustar `fileField`, `extraFields` e os limites. Se ele aceitar anexos por `fetch` (com CORS liberado para a origem do site), deixe `form.uploadEndpoint` vazio.
- Tem campo anti-spam invisível (`site`), validação acessível e máscara de telefone.
- O texto do e-mail é o padrão do FormSubmit (em inglês, com "Someone just submitted your form on…") e não pode ser alterado: o serviço só deixa configurar o assunto (`_subject`) e o formato (`_template`), em `form.extraFields`. Para um e-mail com texto e identidade próprios é preciso trocar o destino.

## Métricas

Se houver Google Tag Manager, a página envia para o `dataLayer`:
- `whatsapp_click`, com `cta_location` = hero | servicos | trabalhos | area | contato | formulario | erro-formulario
- `generate_lead`, após envio confirmado do formulário
- `form_error`

## Decisões de implementação

- **Situações × Serviços:** a sessão 2 mantém os 4 cartões. A sessão 3 virou uma lista numerada em duas colunas (uma no celular), com divisórias e sem caixas. A gestão de resíduos vem logo depois dos nove serviços, como último item da lista e no mesmo padrão deles (ícone no lugar do número, sem caixa, cor de destaque ou foto). O CTA continua no fim.
- **Experiência (sessão 4):** o destaque "5 anos" fica abaixo da foto, sem cobrir o profissional nem os equipamentos.
- **Antes e depois:** sai do carrossel da galeria e vira um conjunto único, com mais espaço, rótulos visíveis e legenda compartilhada. Fica lado a lado no desktop e empilhado no celular.
- **Vídeos:** tocam sem som, em loop, só quando estão visíveis, com botão de pausa. Quem ativou "reduzir movimento" ou economia de dados vê os controles nativos, sem reprodução automática.
- **Acessibilidade:** link para pular ao conteúdo, foco visível, rótulos sempre visíveis, erros associados aos campos, acordeão nativo (`details`/`summary`) e contraste AA.

## Checklist antes de publicar

- [ ] Ativar `curiarborismogestao@gmail.com` pelo link do FormSubmit e testar o recebimento com e sem fotos
- [ ] Preencher `privacy.url` e o texto definitivo de `privacy.notice`
- [ ] Mudar `reviewMode` para `false` (ou conectar as avaliações reais do Google)
- [ ] Confirmar os itens de `SELECAO-FOTOS.md` e aplicar as fotos escolhidas pelo Lucas
- [ ] Testar no celular os 5 botões de WhatsApp e a mensagem de cada um
- [ ] Testar o formulário: sucesso, erro, upload, telefone inválido e campos vazios
- [ ] Conferir a gratuidade só para Niterói
- [ ] Validar a prévia do link no WhatsApp depois de configurar o domínio
