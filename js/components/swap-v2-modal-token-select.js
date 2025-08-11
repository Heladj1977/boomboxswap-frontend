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
      row.innerHTML = `
        <div class="swapv2-token-row-left">
          <div class="swapv2-token-symbol">${sym}</div>
          <div class="swapv2-token-chain">Réseau: ${detectChainLabel()}</div>
        </div>
        <div class="swapv2-token-row-right">
          <div class="swapv2-token-balance">Solde: —</div>
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
    renderList(listEl, currentOpts.tokens || []);
    el.querySelector('[data-close]')?.addEventListener('click', onBackdrop);
    el.querySelector('#swapv2-token-cancel')?.addEventListener('click', close);
    el.querySelector('#swapv2-token-search')?.addEventListener('input', onSearch);
  }

  if (!window.SwapV2TokenSelectModal) {
    window.SwapV2TokenSelectModal = { show };
  }
})();


