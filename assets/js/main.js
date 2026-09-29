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

  (function whatsappLinks() {
    var links = $$('[data-wa]');
    if (!waNumber) {
      if (links.length) console.warn('[Curi] Número de WhatsApp não configurado em assets/js/config.js. Os botões levam ao formulário.');
      return;
    }
    links.forEach(function (a) {
      a.href = waUrl(a.getAttribute('data-wa'));
      a.target = '_blank';
      a.rel = 'noopener';
      var hint = document.createElement('span');
      hint.className = 'sr-only';
      hint.textContent = ' (abre o WhatsApp)';
      a.appendChild(hint);
      a.addEventListener('click', function () {
        track('whatsapp_click', { cta_location: a.getAttribute('data-wa-location') || a.getAttribute('data-wa') });
      });
    });
  })();

  /* Avaliações do Google -------------------------------------------------- */
  (function reviews() {
    var box = $('[data-reviews]');
    var g = CONFIG.google;
    if (!box || !g || !(g.rating > 0) || !(g.count > 0) || !g.url) return;

    var rating = Math.min(Math.max(Number(g.rating), 0), 5);
    var ratingText = rating.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

    $('[data-rating-value]', box).textContent = ratingText;
    var stars = $('[data-rating-stars]', box);
    stars.style.setProperty('--rating', rating);
    stars.setAttribute('aria-label', 'Nota ' + ratingText + ' de 5');
    $('[data-rating-count]', box).textContent = 'com ' + Number(g.count).toLocaleString('pt-BR') + ' avaliações no Google';
    $('[data-reviews-link]', box).href = g.url;

    var list = $('[data-review-list]', box);
    (g.reviews || []).slice(0, 3).forEach(function (r) {
      if (!r || !r.text) return;
      var li = document.createElement('li');
      li.className = 'review-card';
      var quote = document.createElement('blockquote');
      var p = document.createElement('p');
      p.textContent = r.text;
      quote.appendChild(p);
      li.appendChild(quote);
      if (r.author) {
        var author = document.createElement('p');
        author.className = 'review-author';
        author.textContent = r.author;
        li.appendChild(author);
      }
      list.appendChild(li);
    });
    box.hidden = false;
  })();

  /* Política de privacidade ----------------------------------------------- */
  (function privacy() {
    var p = CONFIG.privacy || {};
    if (!p.url) return;
    var footerLink = $('[data-privacy-link]');
    if (footerLink) { footerLink.href = p.url; footerLink.hidden = false; }

    var note = $('[data-privacy-note]');
    if (!note || !p.notice) return;
    var parts = String(p.notice).split('{link}');
    note.textContent = '';
    parts.forEach(function (part, i) {
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

    var cfg = Object.assign({ endpoint: '', fileField: 'fotos', maxFiles: 5, maxFileSizeMB: 10, timeoutMs: 60000 }, CONFIG.form || {});
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

    var limits = $('[data-file-limits]', form);
    if (limits) limits.textContent = 'Até ' + cfg.maxFiles + ' imagens (JPG, PNG, WEBP ou HEIC), com até ' + cfg.maxFileSizeMB + ' MB cada.';

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
      var rejected = { type: 0, size: 0, count: 0 };
      Array.prototype.forEach.call(list, function (f) {
        if (!ACCEPT_MIME.test(f.type) && !ACCEPT_EXT.test(f.name)) { rejected.type++; return; }
        if (f.size > maxBytes) { rejected.size++; return; }
        var duplicate = files.some(function (x) { return x.file.name === f.name && x.file.size === f.size && x.file.lastModified === f.lastModified; });
        if (duplicate) return;
        if (files.length >= cfg.maxFiles) { rejected.count++; return; }
        files.push({ file: f, url: /^image\/(jpeg|png|webp)$/i.test(f.type) ? URL.createObjectURL(f) : null });
      });

      var reasons = [];
      if (rejected.type) reasons.push('Envie imagens nos formatos JPG, PNG, WEBP ou HEIC.');
      if (rejected.size) reasons.push('Cada imagem pode ter até ' + cfg.maxFileSizeMB + ' MB.');
      if (rejected.count) reasons.push('Você pode enviar até ' + cfg.maxFiles + ' imagens.');
      var total = rejected.type + rejected.size + rejected.count;
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

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sending) return;
      submitted = true;
      errorAlert.hidden = true;

      if (form.elements.site && form.elements.site.value) return; // campo anti-spam preenchido

      var invalid = validateAll();
      if (invalid) { invalid.focus(); return; }

      if (!cfg.endpoint) {
        console.warn('[Curi] Destino do formulário não configurado em assets/js/config.js (form.endpoint).');
        showError();
        return;
      }

      var data = new FormData(form);
      data.delete('site');
      data.delete(fileInput ? fileInput.name : 'fotos');
      files.forEach(function (item) { data.append(cfg.fileField, item.file, item.file.name); });
      data.set('whatsapp', formatPhone(phoneInput.value));
      data.append('whatsapp_e164', '+55' + phoneDigits(phoneInput.value));
      data.append('origem', 'LP Curi Arborismo');
      data.append('pagina', location.href.split('#')[0]);
      Object.keys(campaign).forEach(function (k) { data.append(k, campaign[k]); });

      var photoCount = files.length;
      setSending(true);
      var controller = 'AbortController' in window ? new AbortController() : null;
      var timer = controller ? setTimeout(function () { controller.abort(); }, cfg.timeoutMs) : null;

      fetch(cfg.endpoint, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
        signal: controller ? controller.signal : undefined
      })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          // Sucesso somente após confirmação de recebimento pelo destino
          showSuccess();
          track('generate_lead', { form: 'avaliacao_orcamento', fotos: photoCount });
        })
        .catch(function (err) {
          console.error('[Curi] Falha no envio do formulário:', err);
          showError();
        })
        .then(function () {
          if (timer) clearTimeout(timer);
          setSending(false);
        });
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
