/**
 * Curi Arborismo · comportamento da landing page
 * Sem dependências. Todas as partes são opcionais: se um elemento não existir, o bloco é ignorado.
 */
(function () {
  'use strict';

  var CONFIG = window.CURI_CONFIG || {};
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Eventos para Google Tag Manager / GA4, se estiverem instalados
  function track(event, params) {
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push(Object.assign({ event: event }, params || {}));
    }
  }

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function icon(name) {
    return '<svg class="icon" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
  }

  /* Cabeçalho e menu ------------------------------------------------------ */
  (function header() {
    var el = $('[data-header]');
    if (!el) return;
    var toggle = $('[data-nav-toggle]', el);
    var nav = $('[data-nav]', el);
    var label = toggle && $('.sr-only', toggle);

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        el.classList.toggle('is-scrolled', window.scrollY > 8);
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (!toggle || !nav) return;

    function setOpen(open) {
      el.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      if (label) label.textContent = open ? 'Fechar menu' : 'Abrir menu';
    }

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && el.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (el.classList.contains('is-open') && !el.contains(e.target)) setOpen(false);
    });
    window.matchMedia('(min-width: 1080px)').addEventListener('change', function (mq) {
      if (mq.matches) setOpen(false);
    });
  })();

  /* Links de WhatsApp ----------------------------------------------------- */
  var wa = CONFIG.whatsapp || {};
  var waNumber = String(wa.number || '').replace(/\D/g, '');

  function waUrl(key) {
    var messages = wa.messages || {};
    var text = messages[key] || messages.hero || '';
    return 'https://wa.me/' + waNumber + (text ? '?text=' + encodeURIComponent(text) : '');
  }

  // Os links já vêm prontos no HTML (funcionam sem JS); aqui eles seguem o config.js e registram o clique
  (function whatsappLinks() {
    $$('[data-wa]').forEach(function (a) {
      if (waNumber) a.href = waUrl(a.getAttribute('data-wa'));
      a.addEventListener('click', function () {
        track('whatsapp_click', { cta_location: a.getAttribute('data-wa-location') || a.getAttribute('data-wa') });
      });
    });
  })();

  /* Avaliações ------------------------------------------------------------ */
  // Com dados do Google no config.js: mostra nota, quantidade e, se houver, os comentários reais.
  // Os 5 cartões de exemplo aparecem só na versão de revisão (reviewMode ou ?revisao=1) e enquanto
  // não houver comentários reais.
  (function reviews() {
    var box = $('[data-reviews]');
    if (!box) return;
    var list = $('[data-review-list]', box);
    var g = CONFIG.google;
    var hasGoogle = !!(g && g.rating > 0 && g.count > 0 && g.url);
    var reviewMode = CONFIG.reviewMode === true || new URLSearchParams(location.search).has('revisao');
    var demoNote = $('[data-reviews-demo-note]', box);

    if (hasGoogle) {
      var rating = Math.min(Math.max(Number(g.rating), 0), 5);
      var ratingText = rating.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
      $('[data-rating-value]', box).textContent = ratingText;
      var stars = $('[data-rating-stars]', box);
      stars.style.setProperty('--rating', rating);
      stars.setAttribute('aria-label', 'Nota ' + ratingText + ' de 5');
      $('[data-rating-count]', box).textContent = 'com ' + Number(g.count).toLocaleString('pt-BR') + ' avaliações no Google';
      $('[data-rating-summary]', box).hidden = false;
      var link = $('[data-reviews-link]', box);
      link.href = g.url;
      link.hidden = false;

      var real = (g.reviews || []).filter(function (r) { return r && r.text; });
      if (real.length || !reviewMode) {
        $$('[data-review-demo]', list).forEach(function (el) { el.remove(); });
        if (demoNote) demoNote.remove();
      } else if (demoNote) {
        demoNote.textContent = 'Comentários de exemplo, para aprovar o layout. Eles dão lugar aos comentários reais do Google assim que forem cadastrados.';
      }
      real.forEach(function (r) { list.appendChild(reviewCard(r)); });
      // Sem comentários, ficam só a nota e o link (nada de lista vazia)
      list.hidden = !$$('.review-card', list).length;
    } else if (!reviewMode) {
      return; // versão pública sem avaliações reais: o bloco continua oculto
    }

    box.hidden = false;
    carousel(box);
  })();

  // Cartão de uma avaliação real: estrelas (quando a nota vem informada), comentário e nome do autor
  function reviewCard(r) {
    var li = document.createElement('li');
    li.className = 'review-card';

    var rating = Math.min(Math.max(Number(r.rating) || 0, 0), 5);
    if (rating) {
      var stars = document.createElement('span');
      stars.className = 'stars';
      stars.setAttribute('role', 'img');
      stars.setAttribute('aria-label', 'Nota ' + rating.toLocaleString('pt-BR') + ' de 5');
      stars.style.setProperty('--rating', rating);
      li.appendChild(stars);
    }

    var quote = document.createElement('blockquote');
    var p = document.createElement('p');
    p.textContent = r.text;
    quote.appendChild(p);
    li.appendChild(quote);

    var name = String(r.author || '').trim();
    var author = document.createElement('p');
    author.className = 'review-author';
    var avatar = document.createElement('span');
    avatar.className = 'review-avatar review-avatar--initial';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = name ? name.charAt(0).toUpperCase() : '';
    var label = document.createElement('span');
    label.textContent = name || 'Cliente';
    var source = document.createElement('small');
    source.textContent = 'Avaliação no Google';
    label.appendChild(source);
    author.appendChild(avatar);
    author.appendChild(label);
    li.appendChild(author);
    return li;
  }

  // Carrossel 3D: o cartão do centro fica de frente e os vizinhos giram para trás (o desenho está no CSS).
  // A lista continua rolando com encaixe (toque, teclado e botões), sem avanço automático; aqui cada cartão
  // recebe a sua posição em relação ao centro: --pos (0 no centro, -1 e 1 nos vizinhos) e --dist.
  function carousel(box) {
    var track = $('[data-review-list]', box);
    var prev = $('[data-carousel-prev]', box);
    var next = $('[data-carousel-next]', box);
    var status = $('[data-carousel-status]', box);
    var controls = $('[data-carousel-controls]', box);
    var cards = $$('.review-card', track);
    if (!track || !cards.length) { if (controls) controls.hidden = true; return; }
    var active = 0; // cartão mais perto do centro agora
    var target = 0; // cartão para onde os botões estão levando (cliques seguidos se acumulam)

    // offsetLeft não muda com o transform dos cartões, ao contrário de getBoundingClientRect
    function centerOf(card) { return card.offsetLeft + card.offsetWidth / 2; }
    function leftFor(i) { return centerOf(cards[i]) - track.clientWidth / 2; }

    // aria-disabled em vez de disabled: o foco não se perde quando o botão chega ao fim
    function setDisabled(btn, off) {
      btn.setAttribute('aria-disabled', String(off));
    }

    var lastText = '';
    function update() {
      var mid = track.scrollLeft + track.clientWidth / 2;
      var nearest = Infinity;
      cards.forEach(function (card, i) {
        var pos = (centerOf(card) - mid) / card.offsetWidth;
        var dist = Math.abs(pos);
        if (dist < nearest) { nearest = dist; active = i; }
        card.style.setProperty('--pos', Math.max(-2, Math.min(2, pos)).toFixed(3));
        card.style.setProperty('--dist', Math.min(dist, 2).toFixed(3));
        card.style.zIndex = String(100 - Math.round(Math.min(dist, 9) * 10)); // o do centro por cima
      });
      cards.forEach(function (card, i) { card.classList.toggle('is-active', i === active); });

      var text = (active + 1) + ' de ' + cards.length;
      if (text !== lastText) { status.textContent = text; lastText = text; }
      setDisabled(prev, active === 0);
      setDisabled(next, active === cards.length - 1);
      controls.hidden = cards.length < 2;
    }

    function go(i) {
      target = Math.max(0, Math.min(cards.length - 1, i));
      track.scrollTo({ left: leftFor(target), behavior: reduceMotion ? 'auto' : 'smooth' });
    }
    // Sem animação: a rolagem suave do CSS é desligada só durante o salto
    function jump(i) {
      target = i;
      track.style.scrollBehavior = 'auto';
      track.scrollLeft = leftFor(i);
      track.style.scrollBehavior = '';
    }

    prev.addEventListener('click', function () { go(target - 1); });
    next.addEventListener('click', function () { go(target + 1); });
    cards.forEach(function (card, i) {
      card.addEventListener('click', function () { if (i !== active) go(i); });
    });
    track.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      go(target + (e.key === 'ArrowRight' ? 1 : -1));
    });

    var ticking = false;
    var settle = null;
    function schedule() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { update(); ticking = false; });
    }
    track.addEventListener('scroll', function () {
      schedule();
      // Quando a rolagem para (botão, toque ou teclado), o destino passa a ser o cartão que ficou no centro
      clearTimeout(settle);
      settle = setTimeout(function () { update(); target = active; }, 140);
    }, { passive: true });
    window.addEventListener('resize', function () { jump(active); schedule(); });

    // Começa no segundo cartão para já haver vizinhos dos dois lados
    if (cards.length >= 3) jump(1);
    update();
  }

  /* Política de privacidade ----------------------------------------------- */
  // O aviso aparece junto ao formulário; o link só entra quando houver URL real (nunca um link sem destino).
  (function privacy() {
    var p = CONFIG.privacy || {};
    var footerLink = $('[data-privacy-link]');
    if (footerLink && p.url) { footerLink.href = p.url; footerLink.hidden = false; }

    var note = $('[data-privacy-note]');
    if (!note || !p.notice) return;
    note.textContent = p.notice;
    if (p.url && p.linkSentence) {
      note.appendChild(document.createTextNode(' '));
      String(p.linkSentence).split('{link}').forEach(function (part, i, parts) {
        note.appendChild(document.createTextNode(part));
        if (i < parts.length - 1) {
          var a = document.createElement('a');
          a.href = p.url;
          a.target = '_blank';
          a.rel = 'noopener';
          a.textContent = 'Política de Privacidade';
          note.appendChild(a);
        }
      });
    }
    note.hidden = false;
  })();

  /* Vídeos da galeria ----------------------------------------------------- */
  (function galleryVideos() {
    var videos = $$('video[data-autoplay]');
    var saveData = navigator.connection && navigator.connection.saveData;
    // Sem autoplay para quem prefere menos movimento ou economia de dados: os controles nativos continuam visíveis
    if (!videos.length || reduceMotion || saveData || !('IntersectionObserver' in window)) return;

    videos.forEach(function (v) {
      v.removeAttribute('controls');
      v.muted = true;

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'video-toggle';
      v.parentElement.appendChild(btn);

      function render() {
        var playing = !v.paused;
        btn.innerHTML = icon(playing ? 'pause' : 'play');
        btn.setAttribute('aria-label', playing ? 'Pausar vídeo' : 'Reproduzir vídeo');
      }
      btn.addEventListener('click', function () {
        if (v.paused) {
          v.dataset.userPaused = '';
          v.play().catch(function () {});
        } else {
          v.dataset.userPaused = '1';
          v.pause();
        }
      });
      v.addEventListener('play', render);
      v.addEventListener('pause', render);
      render();
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var v = entry.target;
        if (entry.isIntersecting) {
          if (!v.dataset.userPaused) v.play().catch(function () {});
        } else if (!v.paused) {
          v.pause();
        }
      });
    }, { threshold: 0.5 });
    videos.forEach(function (v) { io.observe(v); });
  })();

  /* Parâmetros de campanha (UTM) ----------------------------------------- */
  var CAMPAIGN_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];
  var campaign = (function () {
    var data = {};
    try { data = JSON.parse(sessionStorage.getItem('curi_campaign') || '{}'); } catch (e) { data = {}; }
    var params = new URLSearchParams(location.search);
    CAMPAIGN_KEYS.forEach(function (k) { if (params.get(k)) data[k] = params.get(k); });
    try { sessionStorage.setItem('curi_campaign', JSON.stringify(data)); } catch (e) { /* armazenamento indisponível */ }
    return data;
  })();

  /* Formulário ------------------------------------------------------------ */
  (function leadForm() {
    var form = $('[data-lead-form]');
    if (!form) return;

    var cfg = Object.assign({ to: '', endpoint: '', uploadEndpoint: '', confirmPage: 'enviado.html', fileField: 'fotos', extraFields: null, maxFiles: 5, maxFileSizeMB: 10, maxTotalMB: 0, timeoutMs: 60000 }, CONFIG.form || {});
    // {to} nas URLs vira o destinatário configurado; sem destinatário, a URL fica vazia
    function destination(url) {
      url = String(url || '');
      if (url.indexOf('{to}') < 0) return url;
      return cfg.to ? url.replace('{to}', cfg.to) : '';
    }
    var endpoint = destination(cfg.endpoint);
    var uploadEndpoint = destination(cfg.uploadEndpoint);
    var MSG = {
      required: 'Preencha este campo para continuar.',
      phone: 'Confira o número de WhatsApp e inclua o DDD.',
      sending: 'Enviando solicitação…'
    };

    var submitBtn = $('[data-submit]', form);
    var submitLabel = $('[data-submit-label]', form);
    var status = $('[data-form-status]', form);
    var errorAlert = $('[data-form-error]', form);
    var success = $('[data-form-success]');
    var phoneInput = $('[data-phone]', form);
    var fileInput = $('input[type="file"]', form);
    var dropzone = $('[data-dropzone]', form);
    var fileList = $('[data-file-list]', form);
    var fileError = $('#f-fotos-error', form);
    var files = [];
    var submitted = false;
    var sending = false;

    /* Telefone */
    function phoneDigits(value) {
      var d = String(value || '').replace(/\D/g, '');
      if (d.length > 11 && d.indexOf('55') === 0) d = d.slice(2);
      return d.slice(0, 11);
    }
    function formatPhone(value) {
      var d = phoneDigits(value);
      if (!d) return '';
      if (d.length <= 2) return '(' + d;
      if (d.length <= 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
      if (d.length <= 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
      return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
    }
    function isValidPhone(value) {
      var d = phoneDigits(value);
      if (d.length !== 10 && d.length !== 11) return false;
      if (!/^[1-9][1-9]/.test(d)) return false; // DDD válido
      return d.length === 10 || d.charAt(2) === '9'; // celular com 9 dígitos
    }
    if (phoneInput) {
      phoneInput.addEventListener('input', function () {
        // Formata apenas quando o cursor está no fim, para não atrapalhar edições no meio do número
        if (phoneInput.selectionStart === phoneInput.value.length) phoneInput.value = formatPhone(phoneInput.value);
      });
      phoneInput.addEventListener('blur', function () { phoneInput.value = formatPhone(phoneInput.value); });
    }

    /* Validação */
    function fieldOf(control) { return control.closest('[data-field]'); }

    function setError(wrap, message) {
      var err = $('.field-error', wrap);
      var controls = $$('input, textarea', wrap);
      wrap.classList.toggle('has-error', !!message);
      controls.forEach(function (c) {
        if (message) c.setAttribute('aria-invalid', 'true');
        else c.removeAttribute('aria-invalid');
      });
      if (err) {
        err.textContent = message || '';
        err.hidden = !message;
      }
    }

    function validateControl(control) {
      var wrap = fieldOf(control);
      var message = '';
      if (control.type === 'radio') {
        var checked = $$('input[name="' + control.name + '"]', form).some(function (r) { return r.checked; });
        if (!checked) message = MSG.required;
      } else if (control.required && !control.value.trim()) {
        message = MSG.required;
      } else if (control === phoneInput && !isValidPhone(control.value)) {
        message = MSG.phone;
      }
      setError(wrap, message);
      return !message;
    }

    var requiredControls = $$('[required]', form);

    function validateAll() {
      var firstInvalid = null;
      requiredControls.forEach(function (c) {
        if (!validateControl(c) && !firstInvalid) firstInvalid = c;
      });
      return firstInvalid;
    }

    requiredControls.forEach(function (c) {
      var evt = c.type === 'radio' ? 'change' : 'blur';
      $$(c.type === 'radio' ? 'input[name="' + c.name + '"]' : '#' + c.id, form).forEach(function (el) {
        el.addEventListener(evt, function () { if (submitted || el.value) validateControl(c); });
        el.addEventListener('input', function () {
          if (fieldOf(c).classList.contains('has-error')) validateControl(c);
        });
      });
    });

    /* Fotos */
    var ACCEPT_MIME = /^image\/(jpeg|png|webp|heic|heif)$/i;
    var ACCEPT_EXT = /\.(jpe?g|png|webp|heic|heif)$/i;
    var maxBytes = cfg.maxFileSizeMB * 1024 * 1024;
    var maxTotalBytes = (cfg.maxTotalMB || 0) * 1024 * 1024;

    var limits = $('[data-file-limits]', form);
    if (limits) {
      limits.textContent = 'Até ' + cfg.maxFiles + ' imagens (JPG, PNG, WEBP ou HEIC), ' +
        (maxTotalBytes ? 'somando até ' + cfg.maxTotalMB + ' MB.' : 'com até ' + cfg.maxFileSizeMB + ' MB cada.');
    }

    function formatSize(bytes) {
      if (bytes < 1024 * 1024) return Math.max(1, Math.round(bytes / 1024)) + ' KB';
      return (bytes / 1024 / 1024).toFixed(1).replace('.', ',') + ' MB';
    }

    function showFileNotice(message) {
      if (!fileError) return;
      fileError.textContent = message || '';
      fileError.hidden = !message;
    }

    function addFiles(list) {
      var rejected = { type: 0, size: 0, count: 0, sum: 0 };
      var usedBytes = files.reduce(function (sum, x) { return sum + x.file.size; }, 0);
      Array.prototype.forEach.call(list, function (f) {
        if (!ACCEPT_MIME.test(f.type) && !ACCEPT_EXT.test(f.name)) { rejected.type++; return; }
        if (f.size > maxBytes) { rejected.size++; return; }
        var duplicate = files.some(function (x) { return x.file.name === f.name && x.file.size === f.size && x.file.lastModified === f.lastModified; });
        if (duplicate) return;
        if (files.length >= cfg.maxFiles) { rejected.count++; return; }
        if (maxTotalBytes && usedBytes + f.size > maxTotalBytes) { rejected.sum++; return; }
        usedBytes += f.size;
        files.push({ file: f, url: /^image\/(jpeg|png|webp)$/i.test(f.type) ? URL.createObjectURL(f) : null });
      });

      var reasons = [];
      if (rejected.type) reasons.push('Envie imagens nos formatos JPG, PNG, WEBP ou HEIC.');
      if (rejected.size) reasons.push('Cada imagem pode ter até ' + cfg.maxFileSizeMB + ' MB.');
      if (rejected.count) reasons.push('Você pode enviar até ' + cfg.maxFiles + ' imagens.');
      if (rejected.sum) reasons.push('Juntas, as imagens podem somar até ' + cfg.maxTotalMB + ' MB.');
      var total = rejected.type + rejected.size + rejected.count + rejected.sum;
      showFileNotice(total ? (total === 1 ? 'Uma imagem não foi adicionada. ' : total + ' imagens não foram adicionadas. ') + reasons.join(' ') : '');
      renderFiles();
    }

    function removeFile(index) {
      var item = files.splice(index, 1)[0];
      if (item && item.url) URL.revokeObjectURL(item.url);
      showFileNotice('');
      renderFiles();
      var buttons = $$('.file-remove', fileList);
      (buttons[Math.min(index, buttons.length - 1)] || fileInput).focus();
    }

    function renderFiles() {
      fileList.textContent = '';
      files.forEach(function (item, i) {
        var li = document.createElement('li');
        li.className = 'file-item';

        var thumb = document.createElement('span');
        thumb.className = 'file-thumb';
        if (item.url) {
          var img = document.createElement('img');
          img.src = item.url;
          img.alt = '';
          thumb.appendChild(img);
        } else {
          thumb.innerHTML = icon('image');
        }

        var meta = document.createElement('span');
        meta.className = 'file-meta';
        var name = document.createElement('span');
        name.className = 'file-name';
        name.textContent = item.file.name;
        var size = document.createElement('span');
        size.className = 'file-size';
        size.textContent = formatSize(item.file.size);
        meta.appendChild(name);
        meta.appendChild(document.createElement('br'));
        meta.appendChild(size);

        var remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'file-remove';
        remove.setAttribute('aria-label', 'Remover ' + item.file.name);
        remove.innerHTML = icon('x');
        remove.addEventListener('click', function () { removeFile(i); });

        li.appendChild(thumb);
        li.appendChild(meta);
        li.appendChild(remove);
        fileList.appendChild(li);
      });
    }

    if (fileInput) {
      fileInput.addEventListener('change', function () {
        addFiles(fileInput.files);
        fileInput.value = '';
      });
      ['dragenter', 'dragover'].forEach(function (evt) {
        dropzone.addEventListener(evt, function () { dropzone.classList.add('is-dragover'); });
      });
      ['dragleave', 'drop'].forEach(function (evt) {
        dropzone.addEventListener(evt, function () { dropzone.classList.remove('is-dragover'); });
      });
    }

    /* Envio */
    function setSending(on) {
      sending = on;
      submitBtn.disabled = on;
      submitBtn.classList.toggle('is-loading', on);
      submitBtn.setAttribute('aria-busy', String(on));
      submitLabel.textContent = on ? MSG.sending : 'Enviar solicitação';
      status.textContent = on ? MSG.sending : '';
    }

    function showError() {
      errorAlert.hidden = false;
      errorAlert.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
      track('form_error');
    }

    function showSuccess() {
      files.forEach(function (item) { if (item.url) URL.revokeObjectURL(item.url); });
      files = [];
      form.reset();
      renderFiles();
      form.hidden = true;
      success.hidden = false;
      success.focus();
    }

    // keepalive deixa o envio terminar mesmo se o navegador for para segundo plano (só para envios pequenos, sem fotos)
    function sendByFetch(data, keepalive) {
      var controller = 'AbortController' in window ? new AbortController() : null;
      var timer = controller ? setTimeout(function () { controller.abort(); }, cfg.timeoutMs) : null;
      function clear() { if (timer) clearTimeout(timer); }

      return fetch(endpoint, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
        keepalive: !!keepalive,
        signal: controller ? controller.signal : undefined
      })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json().catch(function () { return null; });
        })
        .then(function (body) {
          clear();
          // Há destinos (como o FormSubmit) que respondem 200 com success "false" quando recusam o envio
          if (body && String(body.success) === 'false') throw new Error(body.message || 'Envio recusado pelo destino');
        }, function (err) {
          clear();
          throw err;
        });
    }

    // POST clássico em um iframe oculto, para destinos que só aceitam anexos fora do endpoint AJAX.
    // A resposta vem de outra origem e não pode ser lida: a confirmação é o destino redirecionar o
    // iframe para a página de confirmação deste site (campo _next).
    function sendInFrame(data) {
      return new Promise(function (resolve, reject) {
        var frame = document.createElement('iframe');
        var post = document.createElement('form');
        var done = false;
        var graceTimer = null;
        var timer = setTimeout(function () { finish(new Error('Tempo esgotado')); }, cfg.timeoutMs);

        function finish(err) {
          if (done) return;
          done = true;
          clearTimeout(timer);
          clearTimeout(graceTimer);
          post.remove();
          frame.remove();
          if (err) reject(err); else resolve();
        }

        try {
          frame.name = 'curi-envio-' + Date.now();
          frame.hidden = true;
          frame.tabIndex = -1;
          frame.setAttribute('aria-hidden', 'true');

          post.method = 'POST';
          post.enctype = 'multipart/form-data';
          post.action = uploadEndpoint;
          post.target = frame.name;
          post.hidden = true;

          data.set('_next', new URL(cfg.confirmPage, location.href).href);
          data.forEach(function (value, key) {
            var input = document.createElement('input');
            input.name = key;
            if (typeof value === 'string') {
              input.type = 'hidden';
              input.value = value;
            } else {
              var transfer = new DataTransfer();
              transfer.items.add(value);
              input.type = 'file';
              input.files = transfer.files;
            }
            post.appendChild(input);
          });

          frame.addEventListener('load', function () {
            var href = null;
            try { href = frame.contentWindow.location.href; } catch (err) { /* outra origem: página do próprio destino */ }
            if (href === 'about:blank') return; // carregamento inicial do iframe vazio
            if (href !== null) { finish(); return; } // voltou para este site: envio aceito
            // Página do destino: aguarda um eventual redirecionamento antes de considerar falha
            clearTimeout(graceTimer);
            graceTimer = setTimeout(function () { finish(new Error('O destino não confirmou o recebimento')); }, 4000);
          });

          document.body.appendChild(frame);
          document.body.appendChild(post);
          post.submit();
        } catch (err) {
          finish(err);
        }
      });
    }

    /* WhatsApp com os dados do formulário
       Além do e-mail, o envio abre uma conversa no WhatsApp com os dados já preenchidos.
       A abertura precisa acontecer dentro do clique, senão o navegador a bloqueia como pop-up:
       - sem fotos, a conversa abre na hora e o envio (pequeno) segue em segundo plano;
       - com fotos, a aba abre em espera e só vai para o WhatsApp depois que o envio é confirmado,
         para o navegador do celular não sair de cena no meio do upload. */
    var chatLinks = $$('[data-form-chat]');

    function chatUrl(photoCount) {
      var el = form.elements;
      var lines = [
        (wa.messages || {}).formulario || 'Olá! Gostaria de solicitar uma avaliação para orçamento. Seguem meus dados:',
        '',
        '*Nome:* ' + el.nome.value.trim(),
        '*Cidade:* ' + el.cidade.value.trim(),
        '*Bairro:* ' + el.bairro.value.trim(),
        '*Tipo de local:* ' + el.tipo_local.value,
        '',
        '*Como podemos ajudar:* ' + el.mensagem.value.trim()
      ];
      if (photoCount) lines.push('', 'Também enviei ' + (photoCount === 1 ? '1 foto' : photoCount + ' fotos') + ' pelo formulário do site.');
      return 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(lines.join('\n'));
    }

    function setChatLinks(url) {
      chatLinks.forEach(function (a) { a.href = url; });
    }

    function openWaitingTab() {
      var tab = window.open('', '_blank');
      if (!tab) return null;
      try {
        tab.document.write('<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8">' +
          '<meta name="viewport" content="width=device-width, initial-scale=1"><title>Enviando… | Curi Arborismo</title></head>' +
          '<body style="display:grid;place-items:center;min-height:100vh;margin:0;padding:1.5rem;box-sizing:border-box;' +
          'background:#283618;color:#FEFAE0;font:500 1.125rem/1.5 system-ui,sans-serif;text-align:center">' +
          '<p>Enviando sua solicitação e as fotos…<br>O WhatsApp abre em seguida.</p></body></html>');
        tab.document.close();
      } catch (err) { /* sem acesso à aba: ela fica em branco até o envio terminar */ }
      return tab;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sending) return;
      submitted = true;
      errorAlert.hidden = true;

      if (form.elements.site && form.elements.site.value) return; // campo anti-spam preenchido

      var invalid = validateAll();
      if (invalid) { invalid.focus(); return; }

      if (!endpoint) {
        console.warn('[Curi] Destino do formulário não configurado em assets/js/config.js (form.endpoint).');
        showError();
        return;
      }

      var data = new FormData(form);
      data.delete('site');
      data.delete(fileInput ? fileInput.name : 'fotos');
      files.forEach(function (item, i) { data.append(cfg.fileField.replace('{n}', i + 1), item.file, item.file.name); });
      Object.keys(cfg.extraFields || {}).forEach(function (k) { data.append(k, cfg.extraFields[k]); });
      data.set('whatsapp', formatPhone(phoneInput.value));
      data.append('whatsapp_e164', '+55' + phoneDigits(phoneInput.value));
      data.append('origem', 'LP Curi Arborismo');
      data.append('pagina', location.href.split('#')[0]);
      Object.keys(campaign).forEach(function (k) { data.append(k, campaign[k]); });

      var photoCount = files.length;
      var chatPlain = waNumber ? chatUrl(0) : '';
      var chatWithPhotos = waNumber ? chatUrl(photoCount) : '';
      var chatTab = null;
      if (waNumber) {
        // Os links do sucesso e do erro levam os mesmos dados (o do erro, sem citar fotos que não chegaram)
        setChatLinks(chatPlain);
        if (photoCount) {
          chatTab = openWaitingTab();
        } else {
          window.open(chatPlain, '_blank', 'noopener');
          track('whatsapp_click', { cta_location: 'formulario' });
        }
      }
      setSending(true);

      (photoCount && uploadEndpoint ? sendInFrame(data) : sendByFetch(data, !photoCount))
        .then(function () {
          if (waNumber && photoCount) {
            setChatLinks(chatWithPhotos);
            // Falha ao redirecionar a aba não pode virar erro de envio: o botão do sucesso cobre esse caso
            try {
              if (chatTab && !chatTab.closed) {
                chatTab.opener = null;
                chatTab.location.replace(chatWithPhotos);
                track('whatsapp_click', { cta_location: 'formulario' });
              }
            } catch (err) { /* segue para o sucesso */ }
          }
          // Sucesso somente após confirmação de recebimento pelo destino
          showSuccess();
          track('generate_lead', { form: 'avaliacao_orcamento', fotos: photoCount });
        })
        .catch(function (err) {
          console.error('[Curi] Falha no envio do formulário:', err);
          if (chatTab && !chatTab.closed) chatTab.close();
          showError();
        })
        .then(function () { setSending(false); });
    });
  })();

  /* Animação de entrada --------------------------------------------------- */
  (function reveal() {
    var items = $$('[data-reveal]');
    if (!items.length || reduceMotion || !('IntersectionObserver' in window)) return;

    // Elementos já visíveis no carregamento não são escondidos (evita piscar)
    var vh = window.innerHeight;
    items.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) el.classList.add('is-visible');
    });
    root.classList.add('reveal-ready');

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { if (!el.classList.contains('is-visible')) io.observe(el); });
  })();

  /* Ano no rodapé */
  var year = $('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
