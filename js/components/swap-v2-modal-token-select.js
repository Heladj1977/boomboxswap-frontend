/* BOOMBOXSWAP - Modale Sélection de Jeton (Lot 1, UI seulement) */
(function () {
  const ID = 'swapv2-token-modal';
  let currentOpts = null;

  function ensureModal() {
    let el = document.getElementById(ID);
    if (el) return el;
    el = document.createElement('div');
    el.id = ID;
    el.className = 'swapv2-modal hidden';
    el.innerHTML = `
      <div class="swapv2-modal-backdrop" data-close="1"></div>
      <div class="swapv2-modal-content" role="dialog" aria-modal="true" aria-labelledby="swapv2-token-title">
        <h3 id="swapv2-token-title" class="swapv2-modal-title">Sélectionner un jeton</h3>
        <div class="swapv2-form-row">
          <input id="swapv2-token-search" class="swapv2-input" placeholder="Rechercher par nom/adresse" />
        </div>
        <div id="swapv2-token-list" class="swapv2-token-list" role="listbox" aria-label="Liste des jetons"></div>
        <div class="swapv2-modal-actions">
          <button id="swapv2-token-cancel" class="swapv2-btn" type="button">Annuler</button>
        </div>
      </div>
    `;
    document.body.appendChild(el);
    return el;
  }

  function detectChainLabel() {
    try {
      const ck = window.BoomboxChainManager?.getCurrentChainId?.() || 'bsc';
      if (ck === 'bsc') return 'BSC';
      if (ck === 'arbitrum') return 'Arbitrum';
      if (ck === 'solana') return 'Solana';
      return ck;
    } catch (_) { return '—'; }
  }

  function renderList(container, tokens) {
    container.innerHTML = '';
    tokens.forEach(sym => {
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'swapv2-token-row';
      row.setAttribute('role', 'option');
      const bal = (currentOpts && currentOpts.balances && currentOpts.balances[sym]) ? currentOpts.balances[sym] : '0.0000';
      row.innerHTML = `
        <div class="swapv2-token-row-left">
          <div class="swapv2-token-symbol">${sym}</div>
          <div class="swapv2-token-chain">Réseau: ${detectChainLabel()}</div>
        </div>
        <div class="swapv2-token-row-right">
          <div class="swapv2-token-balance">Solde: <span class="swapv2-token-balance-value">${bal}</span></div>
        </div>
      `;
      container.appendChild(row);
      row.addEventListener('click', () => {
        try { currentOpts?.onSelect?.(sym); } catch (_) {}
        close();
      });
    });
  }

  function onBackdrop(e) { if (e?.target?.getAttribute('data-close')) close(); }
  function onSearch(e) {
    const q = (e.target.value || '').trim().toLowerCase();
    const list = (currentOpts?.tokens || []);
    const filtered = list.filter(sym => sym.toLowerCase().includes(q));
    renderList(document.getElementById('swapv2-token-list'), filtered);
  }

  function close() {
    const el = document.getElementById(ID);
    if (!el) return;
    el.classList.add('hidden');
    try {
      el.querySelector('[data-close]')?.removeEventListener('click', onBackdrop);
      el.querySelector('#swapv2-token-cancel')?.removeEventListener('click', close);
      el.querySelector('#swapv2-token-search')?.removeEventListener('input', onSearch);
    } catch (_) {}
    currentOpts = null;
  }

  function show(opts) {
    currentOpts = opts || {};
    const el = ensureModal();
    el.classList.remove('hidden');
    const listEl = el.querySelector('#swapv2-token-list');
    try {
      // Demande proactive d'une mise à jour des soldes si contrôleur présent
      try {
        const root = document.getElementById('swapv2-root');
        if (root && window.SwapV2Controller &&
            typeof window.SwapV2Controller.refreshBalances === 'function') {
          window.SwapV2Controller.refreshBalances(root);
        }
      } catch (_) {}
      // Garde-fou d'affichage: s'assurer que la liste est scrollable
      listEl.style.maxHeight = '60vh';
      listEl.style.overflowY = 'auto';
    } catch (_) {}
    try {
      const provided = Array.isArray(currentOpts.tokens) ? currentOpts.tokens : [];
      const provUp = provided.map((s) => String(s || '').toUpperCase()).filter(Boolean);
      let wl = [];
      try {
        const sc = window.SwapV2 && typeof window.SwapV2.selfCheck === 'function' ? window.SwapV2.selfCheck() : null;
        if (sc && Array.isArray(sc.whitelist)) wl = sc.whitelist.map((s) => String(s || '').toUpperCase()).filter(Boolean);
      } catch (_) {}
      if (!wl.length) {
        try {
          const ck = (window.BoomboxChainManager && typeof window.BoomboxChainManager.getCurrentChainId === 'function')
            ? window.BoomboxChainManager.getCurrentChainId() : 'bsc';
          const fallback = {
            bsc: ['BNB','USDT','USDC','CAKE'],
            arbitrum: ['ETH','WETH','USDT','USDC','CAKE'],
            solana: ['SOL','USDC','USDT','CAKE']
          };
          wl = (fallback[ck] || fallback['bsc']).slice();
        } catch (_) { wl = ['BNB','USDT','USDC','CAKE']; }
      }
      // Assurer la présence explicite de CAKE et USDC pour BSC (CAS SIGNALÉ)
      try {
        if ((window.BoomboxChainManager?.getCurrentChainId?.() || 'bsc') === 'bsc') {
          const ensure = ['CAKE', 'USDC'];
          ensure.forEach(sym => { if (!wl.includes(sym)) wl = wl.concat([sym]); });
        }
      } catch (_) {}
      const base = wl.length ? wl : provUp;
      const seen = new Set(base);
      const merged = base.concat(provUp.filter((s) => !seen.has(s)));
      currentOpts.tokens = merged.slice();
      if (window.__SWAPV2_TRACE__ === true) {
        console.log('[SWAP_V2][MODAL] tokens=', merged.join(','));
      }
    } catch (_) {}
    renderList(listEl, currentOpts.tokens || []);
    el.querySelector('[data-close]')?.addEventListener('click', onBackdrop);
    el.querySelector('#swapv2-token-cancel')?.addEventListener('click', close);
    el.querySelector('#swapv2-token-search')?.addEventListener('input', onSearch);
  }

  function updateBalances(newBalances) {
    try {
      currentOpts = currentOpts || {};
      const merged = Object.assign({}, currentOpts.balances || {}, newBalances || {});
      currentOpts.balances = merged;
      const listEl = document.getElementById('swapv2-token-list');
      const modalEl = document.getElementById(ID);
      if (modalEl && !modalEl.classList.contains('hidden') && listEl) {
        renderList(listEl, (currentOpts.tokens || []));
      }
    } catch (_) {}
  }

  if (!window.SwapV2TokenSelectModal) {
    window.SwapV2TokenSelectModal = { show, updateBalances };
  }
})();


