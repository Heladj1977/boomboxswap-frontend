/* BOOMBOXSWAP - Swap V2 Controller (Lot 1, UI seule) */
(function () {
  try {
  const NS = 'SWAP_V2';
  function log(level, msg, data) { (console[level] || console.log).call(console, `[${NS}] ${msg}`, data || ''); }

  const TOKENS_BY_CHAIN = {
    bsc: ['BNB', 'USDT', 'USDC', 'CAKE'],
    arbitrum: ['ETH', 'WETH', 'USDT', 'USDC', 'CAKE'],
    solana: ['SOL', 'USDC', 'USDT', 'CAKE']
  };
  const defaultSettings = { slippagePct: 0.5, deadlineMin: 20 };
  const state = {
    chainKey: 'bsc',
    fromToken: null,
    toToken: null,
    fromAmount: '',
    toAmount: '',
    allowReverseInput: true,
    settings: Object.assign({}, defaultSettings)
  };

  function getChainKey() {
    try { return window.BoomboxChainManager?.getCurrentChainId?.() || 'bsc'; } catch (_) { return 'bsc'; }
  }
  function getWhitelistForChain(chainKey) { return TOKENS_BY_CHAIN[chainKey] || TOKENS_BY_CHAIN['bsc']; }
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return (root || document).querySelectorAll(sel); }

  function renderHeader() {
    return `
      <div class="swapv2-header">
        <div class="swapv2-title">SWAP</div>
        <button class="swapv2-btn swapv2-btn-ghost" type="button" id="swapv2-open-settings" aria-label="Ouvrir les paramètres">Paramètres</button>
      </div>
    `;
  }
  function renderFromBlock() {
    const balance = '—';
    const tokenLabel = state.fromToken || 'Sélectionner';
    return `
      <div class="swapv2-block swapv2-from">
        <div class="swapv2-row swapv2-row-top">
          <button class="swapv2-token-btn" id="swapv2-from-token" type="button" aria-label="Sélectionner le jeton source">${tokenLabel}</button>
          <div class="swapv2-balance">
            <div class="swapv2-balance-label">Solde:</div>
            <div class="swapv2-balance-value" id="swapv2-from-balance">${balance}</div>
          </div>
        </div>
        <div class="swapv2-amount-row">
          <input id="swapv2-from-amount" class="swapv2-input" type="number" step="any" min="0" inputmode="decimal" placeholder="0,00" aria-label="Montant à échanger (source)" />
        </div>
        <div id="swapv2-from-quick" class="swapv2-quick hidden">
          <button data-q="25" class="swapv2-chip" type="button">25%</button>
          <button data-q="50" class="swapv2-chip" type="button">50%</button>
          <button data-q="100" class="swapv2-chip" type="button">MAX</button>
        </div>
      </div>
    `;
  }
  function renderSwitch() {
    return `
      <div class="swapv2-switch-row">
        <button id="swapv2-switch" class="swapv2-btn" type="button" aria-label="Inverser les jetons">Inverser</button>
      </div>
    `;
  }
  function renderToBlock() {
    const tokenLabel = state.toToken || 'Sélectionner';
    return `
      <div class="swapv2-block swapv2-to">
        <div class="swapv2-row swapv2-row-top">
          <button class="swapv2-token-btn" id="swapv2-to-token" type="button" aria-label="Sélectionner le jeton cible">${tokenLabel}</button>
          <div class="swapv2-balance">
            <div class="swapv2-balance-label">Solde:</div>
            <div class="swapv2-balance-value" id="swapv2-to-balance">—</div>
          </div>
        </div>
        <div class="swapv2-amount-row">
          <input id="swapv2-to-amount" class="swapv2-input" type="number" step="any" min="0" inputmode="decimal" placeholder="0,00" aria-label="Montant cible (lecture seule par défaut)" />
        </div>
      </div>
    `;
  }
  function renderInfo() {
    return `
      <div class="swapv2-infos">
        <div class="swapv2-info-row">
          <div class="swapv2-info-label">Prix :</div>
          <div class="swapv2-info-value" id="swapv2-price">—</div>
          <button class="swapv2-btn swapv2-btn-ghost" id="swapv2-open-infos" type="button" aria-label="Plus d'informations">Infos</button>
        </div>
        <div class="swapv2-info-row">
          <div class="swapv2-info-label">Montant minimum reçu :</div>
          <div class="swapv2-info-value" id="swapv2-min-received">—</div>
        </div>
        <div class="swapv2-info-row">
          <div class="swapv2-info-label">Frais totaux :</div>
          <div class="swapv2-info-value" id="swapv2-fees">—</div>
        </div>
      </div>
    `;
  }
  function renderFooter() {
    return `
      <div class="swapv2-footer">
        <button id="swapv2-cta" class="swapv2-btn swapv2-btn-primary" type="button" disabled>SWAP</button>
      </div>
    `;
  }
  function render() {
    return `
      <div class="swapv2-container" role="region" aria-label="Module Swap V2">
        ${renderHeader()}
        ${renderFromBlock()}
        ${renderSwitch()}
        ${renderToBlock()}
        ${renderInfo()}
        ${renderFooter()}
      </div>
    `;
  }

  function computeCtaDisabled() {
    const walletConnected = !!(window.BOOMSWAP_CURRENT_ADDRESS || window.BOOMB_SOLANA_PUBLIC_KEY);
    return (!walletConnected || !state.fromToken || !state.toToken || !state.fromAmount || Number(state.fromAmount) <= 0 || state.fromToken === state.toToken);
  }
  function updateCta(root) {
    const btn = qs('#swapv2-cta', root);
    if (!btn) return;
    btn.disabled = computeCtaDisabled();
  }

  function wireInteractions(root) {
    qs('#swapv2-open-settings', root)?.addEventListener('click', () => {
      window.SwapV2SettingsModal?.show({
        slippagePct: state.settings.slippagePct,
        deadlineMin: state.settings.deadlineMin,
        onSave: (vals) => {
          state.settings = Object.assign({}, state.settings, vals);
          { const el = qs('#swapv2-min-received', root); if (el) el.textContent = '—'; }
          { const el = qs('#swapv2-price', root); if (el) el.textContent = '—'; }
          { const el = qs('#swapv2-fees', root); if (el) el.textContent = '—'; }
        }
      });
    });

    qs('#swapv2-from-token', root)?.addEventListener('click', () => {
      const list = getWhitelistForChain(state.chainKey);
      window.SwapV2TokenSelectModal?.show({
        side: 'from', chainKey: state.chainKey, tokens: list,
        onSelect: (symbol) => {
          state.fromToken = symbol;
          qs('#swapv2-from-token', root).textContent = symbol;
          updateCta(root);
        }
      });
    });

    qs('#swapv2-to-token', root)?.addEventListener('click', () => {
      const list = getWhitelistForChain(state.chainKey).filter(t => t !== state.fromToken);
      window.SwapV2TokenSelectModal?.show({
        side: 'to', chainKey: state.chainKey, tokens: list,
        onSelect: (symbol) => {
          state.toToken = symbol;
          qs('#swapv2-to-token', root).textContent = symbol;
          updateCta(root);
        }
      });
    });

    const fromInput = qs('#swapv2-from-amount', root);
    const toInput = qs('#swapv2-to-amount', root);
    const quick = qs('#swapv2-from-quick', root);

    fromInput?.addEventListener('focus', () => { quick?.classList.remove('hidden'); });
    fromInput?.addEventListener('blur', () => { setTimeout(() => quick?.classList.add('hidden'), 120); });
    fromInput?.addEventListener('input', () => {
      state.fromAmount = (fromInput.value || '').trim();
      if (state.allowReverseInput) {
        state.toAmount = state.fromAmount;
        if (toInput) toInput.value = state.toAmount;
      }
      updateCta(root);
    });

    qsa('#swapv2-from-quick .swapv2-chip', root).forEach(btn => {
      btn.addEventListener('click', () => {
        const q = btn.getAttribute('data-q');
        if (q === '25') fromInput.value = '25';
        else if (q === '50') fromInput.value = '50';
        else if (q === '100') fromInput.value = '100';
        state.fromAmount = fromInput.value;
        state.toAmount = state.fromAmount;
        if (toInput) toInput.value = state.toAmount;
        updateCta(root);
      });
    });

    // Bouton MAX persistant supprimé: uniquement les chips 25/50/100%

    toInput?.addEventListener('input', () => {
      if (!state.allowReverseInput) return;
      state.toAmount = (toInput.value || '').trim();
      state.fromAmount = state.toAmount;
      if (fromInput) fromInput.value = state.fromAmount;
      updateCta(root);
    });

    qs('#swapv2-switch', root)?.addEventListener('click', () => {
      const prevFrom = state.fromToken;
      const prevTo = state.toToken;
      state.fromToken = prevTo;
      state.toToken = prevFrom;
      if (state.fromToken) qs('#swapv2-from-token', root).textContent = state.fromToken;
      if (state.toToken) qs('#swapv2-to-token', root).textContent = state.toToken;
      const prevFromAmt = state.fromAmount;
      state.fromAmount = state.toAmount;
      state.toAmount = prevFromAmt;
      if (fromInput) fromInput.value = state.fromAmount;
      if (toInput) toInput.value = state.toAmount;
      updateCta(root);
    });

    qs('#swapv2-open-infos', root)?.addEventListener('click', (e) => {
      window.SwapV2PopoverInfos?.toggle({
        anchor: e.currentTarget,
        data: { route: '—', priceImpact: '—', eta: '—', feesDetail: '—' }
      });
    });

    qs('#swapv2-cta', root)?.addEventListener('click', () => {
      if (computeCtaDisabled()) {
        if (!state.fromToken || !state.toToken) { window.showNotification?.('Veuillez sélectionner un jeton', 'warning'); return; }
        if (!state.fromAmount || Number(state.fromAmount) <= 0) { window.showNotification?.('Veuillez saisir un montant', 'warning'); return; }
        const walletConnected = !!(window.BOOMSWAP_CURRENT_ADDRESS || window.BOOMB_SOLANA_PUBLIC_KEY);
        if (!walletConnected) { window.showNotification?.('Wallet non connecté', 'warning'); return; }
      }
      if (state.fromToken && state.toToken && state.fromToken !== state.toToken) {
        window.showNotification?.('Approuver (statique) puis Swap (statique)', 'info');
      } else {
        window.showNotification?.('Aucune route trouvée', 'error');
      }
    });
  }

  function onChainChanged() {
    try {
      state.chainKey = getChainKey();
      const root = document.getElementById('swapv2-root');
      if (!root || root.hidden) return;
      const wl = getWhitelistForChain(state.chainKey);
      if (state.fromToken && !wl.includes(state.fromToken)) {
        state.fromToken = null;
        const fromBtn = qs('#swapv2-from-token', root); if (fromBtn) fromBtn.textContent = 'Sélectionner';
      }
      if (state.toToken && !wl.includes(state.toToken)) {
        state.toToken = null;
        const toBtn = qs('#swapv2-to-token', root); if (toBtn) toBtn.textContent = 'Sélectionner';
      }
      { const el = qs('#swapv2-price', root); if (el) el.textContent = '—'; }
      { const el = qs('#swapv2-min-received', root); if (el) el.textContent = '—'; }
      { const el = qs('#swapv2-fees', root); if (el) el.textContent = '—'; }
      updateCta(root);
    } catch (e) { log('warn', 'onChainChanged error', e); }
  }

  function mountRootIfNeeded() {
    const root = document.getElementById('swapv2-root');
    if (!root) return null;
    try { console.log('[SWAP_V2] unhide root'); } catch (_) {}
    root.hidden = false;
    root.innerHTML = render();
    wireInteractions(root);
    return root;
  }

  function init() {
    try { console.log('[SWAP_V2] init()'); } catch (_) {}
    state.chainKey = getChainKey();
    const root = mountRootIfNeeded();
    try { console.log('[SWAP_V2] root found?', !!root); } catch (_) {}
    if (root) { try { console.log('[SWAP_V2] root hidden before unhide:', root.hidden); } catch (_) {} }
    if (!root) { log('warn', 'Point de montage #swapv2-root introuvable'); return false; }
    // Masquer le header et le contenu V1 de la Card 6 pour éviter le mélange (non destructif)
    try {
      const card = root.closest('.smart-card');
      const header = card && card.querySelector('.card-header');
      const v1Content = card && card.querySelector('.swap-content');
      if (header) header.style.display = 'none';
      if (v1Content) v1Content.style.display = 'none';
    } catch (_) {}
    updateCta(root);
    console.log('[SWAP_V2] init() complete');
    try {
      const evBus = window.BoomboxEvents;
      const chainChangedEv = evBus?.EVENTS?.CHAIN_CHANGED;
      if (evBus?.on && chainChangedEv) {
        evBus.on(chainChangedEv, onChainChanged);
        console.log('[SWAP_V2] chain listener attached');
      } else {
        console.log('[SWAP_V2] chain listener skipped (BoomboxEvents or EVENTS undefined)');
      }
    } catch (e) {
      console.warn('[SWAP_V2] chain listener attach failed', e);
    }
    log('info', 'Swap V2 initialisé');
    return true;
  }

  if (!window.SwapV2Controller) { window.SwapV2Controller = { init }; }
  } catch (e) {
    console.error('[SWAP_V2:FATAL] Controller bootstrap failed:', e && e.message, e && e.stack);
  }
})();


