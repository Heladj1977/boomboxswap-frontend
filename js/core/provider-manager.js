/**
 * ProviderManager - centralise la politique d'accès provider et les fetchs
 * - Jamais de eth_requestAccounts sans clic utilisateur
 * - Annule/ignore les fetchs obsolètes lors d'un changement de chaîne
 */
(function () {
  const NS = 'PROVIDER_MANAGER';

  function log(level, message, data) {
    if (window.BoomboxLogger && window.BoomboxLogger[level]) {
      window.BoomboxLogger[level](`[${NS}] ${message}`, data || '');
    } else {
      const fn = console[level] || console.log;
      fn.call(console, `[${NS}] ${message}`, data || '');
    }
  }

  let currentChainKey = 'bsc'; // 'bsc' | 'arbitrum' | 'solana'
  let fetchSeq = 0;
  let currentAbort = null;
  let evmConnected = false;

  function cancelInFlight() {
    try { if (currentAbort) currentAbort.abort(); } catch (_) {}
    currentAbort = null;
  }

  function setChain(chainKey) {
    if (!chainKey || chainKey === currentChainKey) return;
    currentChainKey = chainKey;
    fetchSeq += 1;
    cancelInFlight();
    if (typeof window !== 'undefined') {
      window.BOOMB_STATE_DISABLE_EVM_FETCH = (chainKey === 'solana');
    }
    log('info', 'Chaîne mise à jour', { chainKey });
  }

  async function connectMetaMaskOnUserClick() {
    if (!window.ethereum) {
      if (window.showNotification) window.showNotification('MetaMask introuvable', 'warning');
      return null;
    }
    try {
      const isSol = !!(window.BoomboxChainManager && window.BoomboxChainManager.getCurrentChain && window.BoomboxChainManager.getCurrentChain().type === 'solana');
      if (isSol) return null; // MVP: MetaMask interdit côté Solana
      // EVM classique
      const res = await window.BOOMSWAP_CONNECT_METAMASK?.();
      if (res && res.address) {
        evmConnected = true;
        try { window.BOOMSWAP_EVM_ADDRESS = res.address; } catch (_) {}
      }
      return res;
    } catch (e) {
      evmConnected = false;
      log('warn', 'Connexion MetaMask refusée', e);
      return null;
    }
  }

  function shouldFetchEvm() {
    try {
      const isSol = (currentChainKey === 'solana');
      // Considérer la connexion EVM effective si une adresse globale est définie
      const hasAddress = !!window.BOOMSWAP_CURRENT_ADDRESS;
      if (hasAddress) evmConnected = true;
      return !isSol && hasAddress;
    } catch (_) { return false; }
  }

  async function fetchBalances(address, numericChainId) {
    const mySeq = ++fetchSeq;
    cancelInFlight();
    currentAbort = new AbortController();
    const signal = currentAbort.signal;

    // Blocage strict selon chaîne
    if (currentChainKey === 'solana') {
      try {
        const data = await window.BoomboxAPI?.getBalances(address, 0, { signal });
        if (signal.aborted || mySeq !== fetchSeq) return null;
        return data;
      } catch (e) {
        if (e && e.name === 'AbortError') return null;
        throw e;
      }
    }

    if (shouldFetchEvm()) {
      try {
        const data = await window.BoomboxAPI?.getBalances(address, numericChainId, { signal });
        if (signal.aborted || mySeq !== fetchSeq) return null;
        return data;
      } catch (e) {
        if (e && e.name === 'AbortError') return null;
        throw e;
      }
    }

    return { bnb: '0.000000', usdt: '0.0000', cake: '0.000000', totalValue: '$0.00' };
  }

  window.BoomboxProviderManager = {
    setChain,
    cancelInFlight,
    connectMetaMaskOnUserClick,
    fetchBalances,
  };
})();


