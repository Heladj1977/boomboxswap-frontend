/* BOOMBOXSWAP - Swap V2 Controller (Lot 1, UI seule) */
(function () {
  try {
  const NS = 'SWAP_V2';
  // Helpers de debug
  function log(level, msg, data) {
    (console[level] || console.log).call(
      console,
      `[${NS}][DBG]`,
      msg,
      data || ''
    );
  }
  const err = (...a) => console.error(`[${NS}][ERR]`, ...a);

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
    settings: Object.assign({}, defaultSettings),
    walletConnected: false,
    address: null,
    quoteTimer: null
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
        <button class="swapv2-icon-btn" type="button" id="swapv2-open-settings" aria-label="Ouvrir les paramètres">
          <img class="swapv2-icon-img" src="assets/images/icons/settings.svg" alt="Paramètres" width="16" height="16"/>
        </button>
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
        <button id="swapv2-switch" class="swapv2-btn" type="button" aria-label="Inverser les jetons">
          <svg class="swapv2-switch-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
            <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <!-- Flèche haut (droite) avec encore un peu plus d'espace central -->
              <path d="M4 8h5M11 5l4 3-4 3"/>
              <!-- Flèche bas (gauche) avec encore un peu plus d'espace central -->
              <path d="M20 16H15M15 19l-4-3 4-3"/>
            </g>
          </svg>
        </button>
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
        <div class="swapv2-subinfo">
          <span class="swapv2-subinfo-label">Minimum reçu:</span>
          <span class="swapv2-subinfo-value" id="swapv2-min-received">—</span>
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
    const walletConnected = !!state.walletConnected;
    return (!walletConnected || !state.fromToken || !state.toToken || !state.fromAmount || Number(state.fromAmount) <= 0 || state.fromToken === state.toToken);
  }
  function updateCta(root) {
    const btn = qs('#swapv2-cta', root);
    if (!btn) return;
    btn.disabled = computeCtaDisabled();
  }

  function savePrefs() {
    try {
      const data = {
        slippagePct: state.settings.slippagePct,
        deadlineMin: state.settings.deadlineMin,
        fromToken: state.fromToken,
        toToken: state.toToken,
        chainKey: state.chainKey
      };
      localStorage.setItem('swapv2_prefs', JSON.stringify(data));
    } catch (_) {}
  }

  function loadPrefsForChain() {
    try {
      const raw = localStorage.getItem('swapv2_prefs');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (!data) return;
      if (typeof data.slippagePct === 'number') {
        state.settings.slippagePct = data.slippagePct;
      }
      if (typeof data.deadlineMin === 'number') {
        state.settings.deadlineMin = data.deadlineMin;
      }
      const wl = getWhitelistForChain(state.chainKey);
      if (data.chainKey === state.chainKey) {
        if (data.fromToken && wl.includes(data.fromToken)) state.fromToken = data.fromToken;
        if (data.toToken && wl.includes(data.toToken)) state.toToken = data.toToken;
      }
    } catch (_) {}
  }

  function setText(sel, value, root) {
    const el = qs(sel, root);
    if (el) el.textContent = value;
  }

  function formatDisplayNumber(s) {
    try {
      const n = Number(s);
      if (!isFinite(n)) return '—';
      return n.toFixed(4);
    } catch (_) { return '—'; }
  }

  async function refreshBalances(root) {
    try {
      if (!state.walletConnected || !state.address) return;
      const symbols = [];
      if (state.fromToken) symbols.push(state.fromToken);
      if (state.toToken && state.toToken !== state.fromToken) symbols.push(state.toToken);
      if (symbols.length === 0) return;
      const ad = window.SwapV2Adapters;
      if (!ad || typeof ad.getBalances !== 'function') return;
      const r = await ad.getBalances({
        chainKey: state.chainKey,
        address: state.address,
        symbols
      });
      if (!r) return;
      if (state.fromToken && r[state.fromToken]) {
        setText('#swapv2-from-balance', formatDisplayNumber(r[state.fromToken]), root);
      }
      if (state.toToken && r[state.toToken]) {
        setText('#swapv2-to-balance', formatDisplayNumber(r[state.toToken]), root);
      }
    } catch (e) {
      log('warn', 'refreshBalances failed', e);
    }
  }

  async function runQuote(root) {
    try {
      const ad = window.SwapV2Adapters;
      if (!ad || typeof ad.quote !== 'function') {
        setText('#swapv2-price', '—', root);
        setText('#swapv2-min-received', '—', root);
        setText('#swapv2-fees', '—', root);
        return;
      }
      if (!state.fromToken || !state.toToken) return;
      const amt = Number(state.fromAmount || '0');
      if (!(amt > 0)) {
        setText('#swapv2-price', '—', root);
        setText('#swapv2-min-received', '—', root);
        setText('#swapv2-fees', '—', root);
        return;
      }
      const q = await ad.quote({
        chainKey: state.chainKey,
        from: state.fromToken,
        to: state.toToken,
        amount: amt,
        slippagePct: state.settings.slippagePct
      });
      const price = q && q.price != null ? String(q.price) : '—';
      const min = q && q.minReceived != null ? String(q.minReceived) : '—';
      const fees = q && q.fees != null ? String(q.fees) : '—';
      setText('#swapv2-price', price === '—' ? '—' : formatDisplayNumber(price), root);
      setText('#swapv2-min-received', min === '—' ? '—' : formatDisplayNumber(min), root);
      setText('#swapv2-fees', fees, root);
    } catch (e) {
      log('warn', 'quote failed', e);
      setText('#swapv2-price', '—', root);
      setText('#swapv2-min-received', '—', root);
      setText('#swapv2-fees', '—', root);
    }
  }

  function scheduleQuote(root) {
    try {
      if (state.quoteTimer) { clearTimeout(state.quoteTimer); state.quoteTimer = null; }
      state.quoteTimer = setTimeout(() => { runQuote(root); }, 250);
    } catch (_) {}
  }

  function wireInteractions(root) {
    qs('#swapv2-open-settings', root)?.addEventListener('click', () => {
      window.SwapV2SettingsModal?.show({
        slippagePct: state.settings.slippagePct,
        deadlineMin: state.settings.deadlineMin,
        onSave: (vals) => {
          state.settings = Object.assign({}, state.settings, vals);
          setText('#swapv2-min-received', '—', root);
          setText('#swapv2-price', '—', root);
          setText('#swapv2-fees', '—', root);
          savePrefs();
        }
      });
    });

    qs('#swapv2-from-token', root)?.addEventListener('click', () => {
      const list = getWhitelistForChain(state.chainKey);
      window.SwapV2TokenSelectModal?.show({
        side: 'from', chainKey: state.chainKey, tokens: list,
        onSelect: (symbol) => {
          state.fromToken = symbol;
          setText('#swapv2-from-token', symbol, root);
          updateCta(root);
          savePrefs();
          refreshBalances(root);
          scheduleQuote(root);
        }
      });
    });

    qs('#swapv2-to-token', root)?.addEventListener('click', () => {
      const list = getWhitelistForChain(state.chainKey).filter(t => t !== state.fromToken);
      window.SwapV2TokenSelectModal?.show({
        side: 'to', chainKey: state.chainKey, tokens: list,
        onSelect: (symbol) => {
          state.toToken = symbol;
          setText('#swapv2-to-token', symbol, root);
          updateCta(root);
          savePrefs();
          refreshBalances(root);
          scheduleQuote(root);
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
      scheduleQuote(root);
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
        scheduleQuote(root);
      });
    });

    // Bouton MAX persistant supprimé: uniquement les chips 25/50/100%

    toInput?.addEventListener('input', () => {
      if (!state.allowReverseInput) return;
      state.toAmount = (toInput.value || '').trim();
      state.fromAmount = state.toAmount;
      if (fromInput) fromInput.value = state.fromAmount;
      updateCta(root);
      savePrefs();
      refreshBalances(root);
      scheduleQuote(root);
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
      savePrefs();
      refreshBalances(root);
    } catch (e) { log('warn', 'onChainChanged error', e); }
  }

  function mountRootIfNeeded() {
    const root = document.getElementById('swapv2-root');
    if (!root) return null;
    root.hidden = false;
    if (!root.hasChildNodes()) {
      root.innerHTML = render();
    }
    wireInteractions(root);
    if (typeof updateCta === 'function') { try { updateCta(root); } catch (_) {} }
    return root;
  }

  function attachWalletListeners(root) {
    try {
      const evBus = window.BoomboxEvents;
      const evs = evBus && evBus.EVENTS;
      const walletEvents = [
        evs && evs.WALLET_CHANGED,
        evs && evs.WALLET_CONNECTED,
        evs && evs.WALLET_DISCONNECTED
      ].filter(Boolean);
      if (evBus && typeof evBus.on === 'function' && walletEvents.length) {
        walletEvents.forEach(evt => evBus.on(evt, () => {
          try { updateWalletState(root); refreshBalances(root); scheduleQuote(root); updateCta(root); } catch (_) {}
        }));
        return;
      }
    } catch (_) {}
    // Polling doux si aucun événement dispo
    try {
      let lastAddr = state.address || null;
      const iv = setInterval(() => {
        try {
          const ws = getWalletStateSafe();
          const changed = ws.address !== lastAddr || ws.connected !== state.walletConnected || ws.chainKey !== state.chainKey;
          if (changed) {
            state.walletConnected = ws.connected;
            state.address = ws.address || null;
            state.chainKey = ws.chainKey;
            lastAddr = state.address;
            onChainChanged();
            refreshBalances(root);
            scheduleQuote(root);
            updateCta(root);
          }
          if (state.walletConnected) { clearInterval(iv); }
        } catch (_) {}
      }, 5000);
    } catch (_) {}
  }

  function getWalletStateSafe() {
    try {
      const ad = window.SwapV2Adapters;
      if (ad && typeof ad.getWalletState === 'function') {
        return ad.getWalletState();
      }
    } catch (_) {}
    return { connected: false, chainKey: getChainKey() };
  }

  function updateWalletState(root) {
    try {
      const st = getWalletStateSafe();
      state.walletConnected = !!st.connected;
      state.address = st.address || null;
      state.chainKey = st.chainKey || getChainKey();
    } catch (_) {}
    updateCta(root);
  }

  function init() {
    // Assertions et debug préliminaires
    log('log', 'init start');
    if (!document.getElementById('swapv2-root')) {
      return err('root missing');
    }
    if (!window.SwapV2Adapters) {
      return err('adapters missing');
    }

    state.chainKey = getChainKey();
    const root = mountRootIfNeeded();
    if (!root) { log('warn', 'Point de montage #swapv2-root introuvable'); return false; }
    // Vérification des sélecteurs requis
    try {
      const reqSelectors = [
        '#swapv2-from-token',
        '#swapv2-to-token',
        '#swapv2-from-amount',
        '#swapv2-to-amount',
        '#swapv2-cta'
      ];
      for (const s of reqSelectors) {
        if (!root.querySelector(s)) { err('missing selector', s); }
      }
    } catch (_) { /* noop */ }
    // Masquer le header et le contenu V1 de la Card 6 pour éviter le mélange (non destructif)
    try {
      const card = root.closest('.smart-card');
      const header = card && card.querySelector('.card-header');
      const v1Content = card && card.querySelector('.swap-content');
      if (header) header.style.display = 'none';
      if (v1Content) v1Content.style.display = 'none';
    } catch (_) {}
    updateWalletState(root);
    loadPrefsForChain();
    // Re-appliquer labels tokens depuis prefs si présents
    if (state.fromToken) setText('#swapv2-from-token', state.fromToken, root);
    if (state.toToken) setText('#swapv2-to-token', state.toToken, root);
    updateCta(root);
    refreshBalances(root);
    scheduleQuote(root);
    // Log tailles de listes et bloque CTA si listes vides
    try {
      const fromSel = root.querySelector('#swapv2-from-token');
      const toSel = root.querySelector('#swapv2-to-token');
      const wl = getWhitelistForChain(state.chainKey) || [];
      const fromCount = (fromSel && fromSel.options && fromSel.options.length) || wl.length || 0;
      const toCount = (toSel && toSel.options && toSel.options.length) || wl.length || 0;
      log('log', 'options counts', { from: fromCount, to: toCount });
      if (!fromCount || !toCount) {
        const cta = root.querySelector('#swapv2-cta');
        if (cta) { cta.disabled = true; cta.title = 'Token list indisponible'; }
        err('Token lists empty at init()');
      }
    } catch (e) { err('options count check failed', e); }
    try {
      const evBus = window.BoomboxEvents;
      const chainChangedEv = evBus?.EVENTS?.CHAIN_CHANGED;
      if (evBus?.on && chainChangedEv) {
        evBus.on(chainChangedEv, onChainChanged);
        
      } else {
        
      }
    } catch (e) {
      console.warn('[SWAP_V2] chain listener attach failed', e);
    }
    attachWalletListeners(root);
    log('info', 'Swap V2 initialisé');
    return true;
  }

  // Exposition contrôleur + debug
  function debugStatus() {
    const root = document.getElementById('swapv2-root');
    const q = (s) => root?.querySelector?.(s);
    const fromSel = q('#swapv2-from-token');
    const toSel = q('#swapv2-to-token');
    const status = {
      root: !!root,
      rootChildren: (root && root.children && root.children.length) || 0,
      adaptersPresent: !!window.SwapV2Adapters,
      adapterKeys: Object.keys(window.SwapV2Adapters || {}),
      fromSel: !!fromSel,
      toSel: !!toSel,
      fromOptions: (fromSel && fromSel.options && fromSel.options.length) || 0,
      toOptions: (toSel && toSel.options && toSel.options.length) || 0,
      cta: !!q('#swapv2-cta'),
      network: (window && window.BoomboxChainManager && window.BoomboxChainManager.currentChain) || 'unknown'
    };
    try { console.table(status); } catch (_) { console.log(status); }
    return status;
  }

  window.SwapV2Controller = Object.assign(window.SwapV2Controller || {}, { init, debugStatus });
  } catch (e) {
    console.error('[SWAP_V2:FATAL] Controller bootstrap failed:', e && e.message, e && e.stack);
  }
})();


