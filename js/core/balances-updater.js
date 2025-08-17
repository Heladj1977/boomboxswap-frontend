/**
 * BOOMBOXSWAP V1 - Balances Updater (extraction non-intrusive)
 * Rôle: centraliser l'appel API des soldes et fournir une API simple.
 */

(function () {
  const NS = 'BALANCES_UPDATER';

  function log(level, message, data) {
    if (window.BoomboxLogger && window.BoomboxLogger[level]) {
      window.BoomboxLogger[level](`[${NS}] ${message}`, data || '');
    } else {
      const fn = console[level] || console.log;
      fn.call(console, `[${NS}] ${message}`, data || '');
    }
  }

  class BalancesUpdater {
    constructor() {
      this.currentAbort = null;
      this.fetchSeq = 0;
      try {
        // Polling léger pour garder la Card 1 à jour sans F5
        if (!window.__BAL_UPDATER_POLL__) {
          window.__BAL_UPDATER_POLL__ = setInterval(() => {
            try {
              const addr = window.BOOMSWAP_CURRENT_ADDRESS || localStorage.getItem('boombox_last_evm_address');
              const cm = window.BoomboxChainManager;
              const chainId = cm && typeof cm.getCurrentChainId === 'function' ? cm.getCurrentChainId() : 'bsc';
              if (!addr) return;
              this.fetchAndUpdate(addr, chainId, (balances) => {
                try {
                  // Propager un événement pour que les écrans se rafraîchissent
                  const ev = new CustomEvent('boombox:balances:updated', { detail: balances });
                  window.dispatchEvent(ev);
                } catch (_) {}
              });
            } catch (_) {}
          }, 15000);
        }
      } catch (_) {}
    }

    async fetch(address, chainId, options = {}) {
      if (window.BOOMB_STATE_DISABLE_EVM_FETCH) {
        // Bloquer toute tentative de fetch EVM lorsque l'UI est sur Solana
        return { bnb: '0.000000', usdt: '0.0000', cake: '0.000000', totalValue: '$0.00' };
      }
      if (!window.BoomboxAPI || typeof window.BoomboxAPI.getBalances !== 'function') {
        throw new Error('API client non initialisé');
      }
      return window.BoomboxAPI.getBalances(address, chainId, options);
    }

    async fetchAndUpdate(address, chainId, onBalances, onError, options = {}) {
      try {
        // Annuler l'appel précédent et créer un nouveau contrôleur
        if (this.currentAbort) this.currentAbort.abort();
        this.currentAbort = new AbortController();
        const signal = this.currentAbort.signal;
        const seq = ++this.fetchSeq;
        const merged = {
          ...options,
          signal,
          // Baisser le timeout et tentatives pour réactivité lors des switches
          timeoutMs: 7000,
          retryAttempts: 2
        };

        const balances = await this.fetch(address, chainId, merged);
        if (signal.aborted || seq !== this.fetchSeq) return null;
        if (typeof onBalances === 'function') onBalances(balances);
        return balances;
      } catch (e) {
        if (e && e.name === 'AbortError') return null;
        if (typeof onError === 'function') onError(e);
        log('error', 'Erreur récupération soldes', e);
        throw e;
      }
    }

    cancel() {
      try { if (this.currentAbort) this.currentAbort.abort(); } catch (_) {}
      this.currentAbort = null;
    }
  }

  if (!window.BoomboxBalancesUpdater) {
    window.BoomboxBalancesUpdater = new BalancesUpdater();
  }
})();








