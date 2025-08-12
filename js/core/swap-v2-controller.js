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
    quoteTimer: null,
    lastPriceSource: 'none',
    walletWatchTimer: null,
    tokenList: []
  };

  const SUPPORTED = {
    bsc: { from: 'BNB', to: 'USDT' },
    arbitrum: { from: 'ETH', to: 'USDC' },
    solana: { from: 'SOL', to: 'USDC' }
  };

  function isChainSupported(chainKey) {
    return Object.prototype.hasOwnProperty.call(SUPPORTED, chainKey);
  }

  function getDefaultPairForChain(chainKey) {
    const d = SUPPORTED[chainKey];
    return d ? { from: d.from, to: d.to } : null;
  }

  function setStatusMessage(root, text) {
    try {
      let msg = qs('#swapv2-status', root);
      if (!msg) {
        msg = document.createElement('div');
        msg.id = 'swapv2-status';
        msg.className = 'swapv2-status';
        const header = qs('.swapv2-header', root);
        const container = qs('.swapv2-container', root) || root;
        if (header && header.parentNode) {
          header.parentNode.insertBefore(msg, header.nextSibling);
        } else {
          container.insertBefore(msg, container.firstChild);
        }
      }
      msg.textContent = String(text || '');
    } catch (_) {}
  }

  function setInteractiveEnabled(root, enabled) {
    try {
      const toggle = (el) => { if (el) el.disabled = !enabled; };
      toggle(qs('#swapv2-from-amount', root));
      toggle(qs('#swapv2-to-amount', root));
      toggle(qs('#swapv2-cta', root));
      qsa('.swapv2-token-btn', root).forEach((b) => { b.disabled = !enabled; });
      qsa('.swapv2-chip', root).forEach((b) => { b.disabled = !enabled; });
      const infosBtn = qs('#swapv2-open-infos', root); toggle(infosBtn);
      const settingsBtn = qs('#swapv2-open-settings', root); toggle(settingsBtn);
    } catch (_) {}
  }

  function computeCtaReason() {
    if (!state.walletConnected) return 'Wallet non connecté';
    if (!isChainSupported(state.chainKey)) return 'Chaîne non supportée';
    if (!state.fromToken) return 'Sélectionner un jeton source';
    if (!state.toToken) return 'Sélectionner un jeton cible';
    if (state.fromToken === state.toToken) return 'Sélectionner deux jetons différents';
    const amt = Number(state.fromAmount || '0');
    if (!(amt > 0)) return 'Saisir un montant';
    return '';
  }

  function mapEvmChainIdToKey(chainId) {
    try {
      const id = typeof chainId === 'string' && chainId.startsWith('0x')
        ? parseInt(chainId, 16)
        : Number(chainId);
      if (id === 56) return 'bsc';
      if (id === 42161 || id === 421614) return 'arbitrum';
    } catch (_) {}
    return null;
  }

  function getChainKey() {
    try {
      // Priorité: BoomboxChainManager si dispo
      const cm = window.BoomboxChainManager;
      const cmKey = cm?.getCurrentChainId?.();
      if (cmKey && typeof cmKey === 'string') return cmKey;
      // EVM: window.ethereum.chainId
      const evmId = window.ethereum && (window.ethereum.chainId || window.ethereum.networkVersion);
      const key = mapEvmChainIdToKey(evmId);
      if (key) return key;
      // Solana
      if (window.BOOMB_SOLANA_PUBLIC_KEY) return 'solana';
    } catch (_) {}
    return 'bsc';
  }

  function getWallet() {
    try {
      const evmAddr = window.BOOMSWAP_CURRENT_ADDRESS || window.BOOMSWAP_EVM_ADDRESS || null;
      const solAddr = window.BOOMB_SOLANA_PUBLIC_KEY || null;
      const connected = !!(evmAddr || solAddr);
      const chainId = (window.ethereum && (window.ethereum.chainId || window.ethereum.networkVersion)) || null;
      return { connected, address: evmAddr || solAddr, chainId };
    } catch (_) { return { connected: false, address: null, chainId: null }; }
  }

  async function detectWalletViaEthereum() {
    try {
      if (!window.ethereum || typeof window.ethereum.request !== 'function') {
        return { connected: !!window.BOOMB_SOLANA_PUBLIC_KEY, address: window.BOOMB_SOLANA_PUBLIC_KEY || null, chainKey: window.BOOMB_SOLANA_PUBLIC_KEY ? 'solana' : getChainKey() };
      }
      const accounts = await window.ethereum.request({ method: 'eth_accounts' }).catch(() => []);
      const addr = Array.isArray(accounts) && accounts.length ? accounts[0] : null;
      let rawId = window.ethereum.chainId || window.ethereum.networkVersion || null;
      if (typeof rawId === 'string' && rawId.startsWith('0x')) { try { rawId = parseInt(rawId, 16); } catch (_) {} }
      const key = mapEvmChainIdToKey(rawId) || getChainKey();
      return { connected: !!addr, address: addr, chainKey: addr ? key : getChainKey() };
    } catch (e) {
      log('warn', '[WALLET] detect failed', e);
      return { connected: false, address: null, chainKey: getChainKey() };
    }
  }
  function getWhitelistForChain(chainKey) { return TOKENS_BY_CHAIN[chainKey] || TOKENS_BY_CHAIN['bsc']; }
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return (root || document).querySelectorAll(sel); }

  async function loadTokenListForChain(chainKey) {
    try {
      // 1) Config globale éventuelle
      const cfg = (window.BoomboxConfig && window.BoomboxConfig.tokens && window.BoomboxConfig.tokens[chainKey]) || null;
      if (Array.isArray(cfg) && cfg.length) {
        state.tokenList = cfg;
        console.log('[SWAP_V2][TOKENS] Loaded from BoomboxConfig', { chainKey, count: state.tokenList.length });
        return state.tokenList;
      }
      // 2) JSON local si disponible
      const url = `assets/tokens/tokens-${chainKey}.json`;
      try {
        const res = await fetch(url, { cache: 'no-cache' });
        if (res && res.ok) {
          const list = await res.json();
          if (Array.isArray(list)) {
            state.tokenList = list;
            console.log('[SWAP_V2][TOKENS] Loaded from JSON', { chainKey, count: state.tokenList.length });
            return state.tokenList;
          }
        }
      } catch (_) {}
      // 3) Fallback symbol-only depuis whitelist
      const wl = getWhitelistForChain(chainKey) || [];
      state.tokenList = wl.map(sym => ({ symbol: sym }));
      console.log('[SWAP_V2][TOKENS] Loaded from whitelist fallback', { chainKey, count: state.tokenList.length });
      return state.tokenList;
    } catch (e) {
      state.tokenList = [];
      console.error('[SWAP_V2][TOKENS] Load failed', e);
      return [];
    }
  }

  function refreshTokenButtonsUI(root) {
    try {
      const fromBtn = qs('#swapv2-from-token', root);
      const toBtn = qs('#swapv2-to-token', root);
      if (fromBtn && state.fromToken) fromBtn.textContent = state.fromToken;
      if (toBtn && state.toToken) toBtn.textContent = state.toToken;
    } catch (_) {}
  }

  function openTokenModal(side, root) {
    try {
      const list = (state.tokenList || []).map(t => t.symbol).filter(Boolean);
      if (window.SwapV2TokenSelectModal && typeof window.SwapV2TokenSelectModal.show === 'function') {
        window.SwapV2TokenSelectModal.show({
          side,
          chainKey: state.chainKey,
          tokens: list,
          onSelect: (symbol) => {
            if (side === 'from') { state.fromToken = symbol; setText('#swapv2-from-token', symbol, root); }
            else { state.toToken = symbol; setText('#swapv2-to-token', symbol, root); }
            console.log('[SWAP_V2][SELECTOR]', side, 'updated to', symbol);
            updateCta(root);
            savePrefs();
            refreshBalances(root);
            const amt = Number(state.fromAmount || '0');
            if (state.fromToken && state.toToken && amt > 0) { scheduleQuote(root); }
          }
        });
        return;
      }
      // Fallback simple
      const choice = prompt(`Choisir un token (${side})\n${list.join(', ')}`);
      if (choice && list.includes(choice)) {
        if (side === 'from') { state.fromToken = choice; setText('#swapv2-from-token', choice, root); }
        else { state.toToken = choice; setText('#swapv2-to-token', choice, root); }
        console.log('[SWAP_V2][SELECTOR]', side, 'updated to', choice);
        updateCta(root);
        const amt = Number(state.fromAmount || '0');
        if (state.fromToken && state.toToken && amt > 0) { scheduleQuote(root); }
      }
    } catch (e) { console.error('[SWAP_V2][SELECTOR] openTokenModal failed', e); }
  }

  async function initTokenSelectors(root) {
    try {
      await loadTokenListForChain(state.chainKey);
      // Attacher ouvertures modales (cliquables même hors connexion)
      const fromBtn = qs('#swapv2-from-token', root);
      const toBtn = qs('#swapv2-to-token', root);
      if (fromBtn) fromBtn.onclick = () => openTokenModal('from', root);
      if (toBtn) toBtn.onclick = () => openTokenModal('to', root);
      refreshTokenButtonsUI(root);
      console.log('[SWAP_V2][TOKENS] Selectors initialized', { chainKey: state.chainKey });
    } catch (e) { console.error('[SWAP_V2][TOKENS] initTokenSelectors failed', e); }
  }

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
    if (!walletConnected) return true;
    return (!state.fromToken || !state.toToken || !state.fromAmount || Number(state.fromAmount) <= 0 || state.fromToken === state.toToken);
  }
  function updateCta(root) {
    const btn = qs('#swapv2-cta', root);
    if (!btn) return;
    const disabled = computeCtaDisabled();
    btn.disabled = disabled;
    const reason = computeCtaReason();
    btn.title = disabled && reason ? reason : '';
    try { log('log', '[CTA]', { disabled, reason }); } catch (_) {}
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
      if (!state.walletConnected) return;
      if (!state.fromToken || !state.toToken) return;
      const amt = Number(state.fromAmount || '0');
      if (!(amt > 0)) {
        setText('#swapv2-price', '—', root);
        setText('#swapv2-min-received', '—', root);
        setText('#swapv2-fees', '—', root);
        return;
      }
      log('log', '[QUOTE] start', { chainKey: state.chainKey, from: state.fromToken, to: state.toToken, amount: amt });
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
      state.lastPriceSource = (q && q.fallback) ? 'fallback' : (price !== '—' ? 'api' : 'none');
      log('log', '[QUOTE] done', { source: state.lastPriceSource, price });
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
      if (!state.walletConnected) { window.showNotification?.('Connectez votre wallet', 'warning'); return; }
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
      if (!state.walletConnected) { window.showNotification?.('Connectez votre wallet', 'warning'); return; }
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
      if (!state.walletConnected) { window.showNotification?.('Connectez votre wallet', 'warning'); return; }
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
      if (state.walletConnected) scheduleQuote(root);
    });

    qsa('#swapv2-from-quick .swapv2-chip', root).forEach(btn => {
      btn.addEventListener('click', () => {
        if (!state.walletConnected) { window.showNotification?.('Connectez votre wallet', 'warning'); return; }
        const q = btn.getAttribute('data-q');
        if (q === '25') fromInput.value = '25';
        else if (q === '50') fromInput.value = '50';
        else if (q === '100') fromInput.value = '100';
        state.fromAmount = fromInput.value;
        state.toAmount = state.fromAmount;
        if (toInput) toInput.value = state.toAmount;
        updateCta(root);
        if (state.walletConnected) scheduleQuote(root);
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
      if (state.walletConnected) scheduleQuote(root);
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
        if (!state.walletConnected) { window.showNotification?.('Wallet non connecté', 'warning'); return; }
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
      log('log', '[CHAIN] changed to', state.chainKey);
      // UI toujours interactive; pas de message persistant
      setStatusMessage(root, '');
      setInteractiveEnabled(root, true);
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
          try {
            log('log', '[SWAP_V2][EVENT] wallet bus');
            resyncWallet(root);
          } catch (_) {}
        }));
        return;
      }
    } catch (_) {}
    // Polling doux si aucun événement dispo
    try {
      let lastAddr = state.address || null;
      const iv = setInterval(() => {
        try {
          const ws = getWallet();
          const changed = ws.address !== lastAddr || ws.connected !== state.walletConnected || getChainKey() !== state.chainKey;
          if (changed) { resyncWallet(root); lastAddr = ws.address || null; }
        } catch (_) {}
      }, 2000);
    } catch (_) {}

    // Écouteurs EVM directs + événements custom globaux
    try {
      if (window.ethereum && typeof window.ethereum.on === 'function') {
        window.ethereum.on('accountsChanged', async () => { try { const r = document.getElementById('swapv2-root'); log('log', '[SWAP_V2][EVENT] accountsChanged'); await resyncWallet(r); onChainChanged(); } catch (_) {} });
        window.ethereum.on('chainChanged', async () => { try { const r = document.getElementById('swapv2-root'); log('log', '[SWAP_V2][EVENT] chainChanged'); await resyncWallet(r); onChainChanged(); } catch (_) {} });
      }
    } catch (_) {}
    try { window.addEventListener('boombox:wallet:connected', async () => { try { const r = document.getElementById('swapv2-root'); log('log', '[SWAP_V2][EVENT] boombox:wallet:connected'); await resyncWallet(r); onChainChanged(); } catch (_) {} }); } catch (_) {}
    try { window.addEventListener('boombox:wallet:disconnected', async () => { try { const r = document.getElementById('swapv2-root'); log('log', '[SWAP_V2][EVENT] boombox:wallet:disconnected'); await resyncWallet(r); onChainChanged(); } catch (_) {} }); } catch (_) {}
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

  // Étendre debugStatus pour inclure CTA et prix
  function debugStatus() {
    const root = document.getElementById('swapv2-root');
    const q = (s) => root?.querySelector?.(s);
    const fromSel = q('#swapv2-from-token');
    const toSel = q('#swapv2-to-token');
    const cta = q('#swapv2-cta');
    const status = {
      root: !!root,
      rootChildren: (root && root.children && root.children.length) || 0,
      adaptersPresent: !!window.SwapV2Adapters,
      adapterKeys: Object.keys(window.SwapV2Adapters || {}),
      walletConnected: !!state.walletConnected,
      chain: state.chainKey,
      tokens: { from: state.fromToken, to: state.toToken },
      amount: state.fromAmount,
      ctaDisabled: !!(cta && cta.disabled),
      ctaReason: computeCtaReason(),
      priceSource: state.lastPriceSource
    };
    try { console.table(status); } catch (_) { console.log(status); }
    return status;
  }

  function updateWalletState(root) {
    try {
      const st = getWallet();
      state.walletConnected = !!st.connected;
      state.address = st.address || null;
      state.chainKey = getChainKey();
    } catch (_) {}
    updateCta(root);
  }

  async function resyncWallet(root) {
    try {
      const det = await detectWalletViaEthereum();
      state.walletConnected = !!det.connected;
      state.address = det.address || null;
      state.chainKey = det.chainKey || getChainKey();
      log('log', '[WALLET] resync', { connected: state.walletConnected, address: state.address, chain: state.chainKey });
      await initTokenSelectors(root);
      applyChainDefaultsIfNeeded(root);
      refreshBalances(root);
      updateCta(root);
      const amt = Number(state.fromAmount || '0');
      if (state.walletConnected && state.fromToken && state.toToken && amt > 0) {
        scheduleQuote(root);
      }
    } catch (e) { log('warn', '[WALLET] resync failed', e); }
  }

  function applyChainDefaultsIfNeeded(root) {
    try {
      if (!isChainSupported(state.chainKey)) {
        setStatusMessage(root, '');
        setInteractiveEnabled(root, true);
        return;
      }
      const defaults = getDefaultPairForChain(state.chainKey);
      if (!state.fromToken) state.fromToken = defaults.from;
      if (!state.toToken) state.toToken = defaults.to;
      const fromBtn = qs('#swapv2-from-token', root); if (fromBtn && state.fromToken) fromBtn.textContent = state.fromToken;
      const toBtn = qs('#swapv2-to-token', root); if (toBtn && state.toToken) toBtn.textContent = state.toToken;
    } catch (_) {}
  }

  async function initSwapV2(rootArg) {
    // Assertions et debug préliminaires
    log('log', 'init start');
    if (!document.getElementById('swapv2-root')) {
      return err('root missing');
    }
    if (!window.SwapV2Adapters) {
      return err('adapters missing');
    }

    state.chainKey = getChainKey();
    const root = rootArg || mountRootIfNeeded();
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
    // UI toujours interactive; pas de message persistant
    setStatusMessage(root, '');
    setInteractiveEnabled(root, true);
    applyChainDefaultsIfNeeded(root);
    await initTokenSelectors(root);
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
  window.SwapV2Controller = Object.assign(window.SwapV2Controller || {}, { init: initSwapV2, debugStatus, resyncWallet });
  window.initSwapV2 = initSwapV2;
  } catch (e) {
    console.error('[SWAP_V2:FATAL] Controller bootstrap failed:', e && e.message, e && e.stack);
  }
})();


