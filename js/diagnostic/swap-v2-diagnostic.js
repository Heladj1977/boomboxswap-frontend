(function () {
  try {
    // Activation uniquement si paramètre/flag présent
    const params = typeof window.location?.search === 'string'
      ? window.location.search
      : '';
    const enabled = (params.indexOf('swapdiag=1') !== -1) ||
                    (window.__SWAPV2_DIAG__ === true);
    if (!enabled) return;

    const PANEL_ID = 'swapv2-diag-panel';
    const logs = [];

    function push(line) {
      try { logs.push(line); render(); } catch (_) {}
    }

    function ensurePanel() {
      let el = document.getElementById(PANEL_ID);
      if (el) return el;
      el = document.createElement('div');
      el.id = PANEL_ID;
      el.style.cssText = [
        'position:fixed','right:12px','bottom:12px','z-index:99999',
        'width:420px','max-height:60vh','overflow:auto','background:#0b1e39',
        'color:#e6f0ff','font:12px/1.4 monospace','border:1px solid #1e3a6a',
        'border-radius:6px','padding:10px','box-shadow:0 8px 24px rgba(0,0,0,.4)',
        'pointer-events:none'
      ].join(';');
      const head = document.createElement('div');
      head.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;';
      head.innerHTML = '<div>Diagnostic Swap V2 (copiable)</div>' +
        '<div><button id="swapv2-diag-copy" class="swapv2-btn" type="button">Copier</button>' +
        ' <button id="swapv2-diag-close" class="swapv2-btn" type="button">Fermer</button></div>';
      // Réactiver les interactions uniquement sur les boutons
      head.querySelectorAll('button').forEach((b) => {
        try { b.style.pointerEvents = 'auto'; } catch (_) {}
      });
      const pre = document.createElement('pre');
      pre.id = 'swapv2-diag-pre';
      pre.style.cssText = 'white-space:pre-wrap;word-break:break-word;margin:0;';
      el.appendChild(head); el.appendChild(pre);
      document.body.appendChild(el);
      document.getElementById('swapv2-diag-copy').onclick = () => {
        try { navigator.clipboard.writeText(pre.textContent || ''); } catch (_) {}
      };
      document.getElementById('swapv2-diag-close').onclick = () => {
        try { el.remove(); } catch (_) {}
      };
      return el;
    }

    function render() {
      try {
        const el = ensurePanel();
        const pre = el.querySelector('#swapv2-diag-pre');
        pre.textContent = logs.join('\n');
      } catch (_) {}
    }

    // Filtre de logs ciblés — non intrusif (n'altère pas les autres consoles)
    try {
      const origLog = console.log.bind(console);
      const origWarn = console.warn.bind(console);
      const origInfo = console.info.bind(console);
      const origError = console.error.bind(console);
      function intercept(fn) {
        return function (...args) {
          try {
            const txt = args && args[0] ? String(args[0]) : '';
            const isSwap = /\[SWAP_V2\]/.test(txt) || /\[SWAP_V2\]/.test(JSON.stringify(args));
            const wanted = (
              /\[SWAP_V2\]\[BALANCES\]/.test(txt) ||
              /\[SWAP_V2\]\[AMOUNT\]/.test(txt) ||
              /\[SWAP_V2\]\[TOKENS\]/.test(txt) ||
              /\[SWAP_V2\]\[EVENT\]/.test(txt) ||
              /\[SWAP_V2\]\[QUOTE\]/.test(txt)
            );
            const addrLine = /\[SWAP_V2\]\[BALANCES\]\[(ADDR|MISS_ADDR|CACHE|ERROR)\]/.test(txt);
            if (isSwap && (wanted || addrLine)) {
              push(args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' '));
            }
          } catch (_) {}
          return fn.apply(console, args);
        };
      }
      console.log = intercept(origLog);
      console.warn = intercept(origWarn);
      console.info = intercept(origInfo);
      console.error = intercept(origError);
    } catch (_) {}

    // Script d'auto-exécution du scénario
    async function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

    function getRoot() { return document.getElementById('swapv2-root'); }
    function getText(sel) { const el = document.querySelector(sel); return el ? (el.textContent || '').trim() : ''; }

    async function clickAndSelect(side, symbol) {
      try {
        const sideSel = side === 'from' ? '#swapv2-from-token' : '#swapv2-to-token';
        const btn = document.querySelector(sideSel);
        if (!btn) return false;
        btn.click();
        // Attendre que la modale s'affiche
        for (let i = 0; i < 20; i++) {
          const m = document.getElementById('swapv2-token-list');
          if (m && m.children && m.children.length) break;
          await wait(100);
        }
        // Cliquer sur la ligne correspondant au symbole
        const rows = Array.from(document.querySelectorAll('#swapv2-token-list .swapv2-token-row'));
        const row = rows.find(r => (r.querySelector('.swapv2-token-symbol')?.textContent || '').trim() === symbol);
        if (row) { row.click(); return true; }
      } catch (_) {}
      return false;
    }

    async function refreshAndCaptureBalances() {
      try {
        const ctrl = window.SwapV2Controller;
        if (!ctrl) return;
        const root = getRoot();
        if (!root) return;
        await ctrl.resyncWallet(root);
        await wait(250);
        // from=BNB, to=USDT (via interactions pour déclencher l'état interne)
        await clickAndSelect('from', 'BNB');
        await wait(50);
        await clickAndSelect('to', 'USDT');
        await wait(300);
        push('#swapv2-from-balance: ' + getText('#swapv2-from-balance'));
        push('#swapv2-to-balance: ' + getText('#swapv2-to-balance'));

        // Cache path (<5s)
        await wait(300);
        push('[DIAG] Cache re-read <5s');
        try { ctrl.debugStatus(); } catch (_) {}

        // Changer to=CAKE
        await clickAndSelect('to', 'CAKE');
        await wait(200);
        push('#swapv2-from-balance: ' + getText('#swapv2-from-balance'));
        push('#swapv2-to-balance: ' + getText('#swapv2-to-balance'));

        // Si USDC listé côté Swap V2
        try {
          await clickAndSelect('to', 'USDC');
          await wait(200);
          push('#swapv2-from-balance: ' + getText('#swapv2-from-balance'));
          push('#swapv2-to-balance: ' + getText('#swapv2-to-balance'));
        } catch (_) {}

        // Extrait modale (3 lignes)
        try {
          const list = [];
          // Ouvrir la modale pour côté 'to' pour lire 3 lignes
          const opened = await clickAndSelect('to', 'USDT');
          await wait(150);
          const rows = Array.from(document.querySelectorAll('#swapv2-token-list .swapv2-token-row')).slice(0, 3);
          rows.forEach((r) => {
            try {
              const sym = (r.querySelector('.swapv2-token-symbol')?.textContent || '').trim();
              const bal = (r.querySelector('.swapv2-token-balance')?.textContent || '').trim();
              list.push(`${bal}`.replace(/\s+/g, ' '));
            } catch (_) {}
          });
          if (list.length >= 3) push(list.slice(0,3).join('\n'));
        } catch (_) {}
      } catch (_) {}
    }

    async function inputAndQuote() {
      try {
        const from = document.querySelector('#swapv2-from-amount');
        if (!from) return;
        // 0.001
        from.value = '0.001';
        from.dispatchEvent(new Event('input', { bubbles: true }));
        await wait(600);
        try { const st = window.SwapV2Controller?.debugStatus?.(); push('[DIAG] debugStatus 0.001: ' + JSON.stringify(st)); } catch (_) {}
        // 0,005
        from.value = '0,005';
        from.dispatchEvent(new Event('input', { bubbles: true }));
        await wait(600);
        try { const st = window.SwapV2Controller?.debugStatus?.(); push('[DIAG] debugStatus 0,005: ' + JSON.stringify(st)); } catch (_) {}
      } catch (_) {}
    }

    // Lancement quand le contrôleur est prêt
    (async function startDiag() {
      // Attendre que Swap V2 soit initialisé
      for (let i = 0; i < 30; i++) {
        if (window.SwapV2Controller && document.getElementById('swapv2-root')) break;
        await wait(200);
      }
      // Journaliser l'état de départ
      try { const st = window.SwapV2Controller?.debugStatus?.(); if (st) push('[DIAG] init status: ' + JSON.stringify(st)); } catch (_) {}
      await refreshAndCaptureBalances();
      await inputAndQuote();
      push('[DIAG] terminé');
    })();
  } catch (e) {
    try { console.error('[SWAP_V2][DIAG] erreur', e); } catch (_) {}
  }
})();


