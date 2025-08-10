/**
 * BOOMBOXSWAP V1 - Price Monitor (extraction non-intrusive)
 * Rôle: centraliser le polling des prix via l'API et exposer une API simple.
 */

(function () {
  const NS = 'PRICE_MONITOR';

  function log(level, message, data) {
    if (window.BoomboxLogger && window.BoomboxLogger[level]) {
      window.BoomboxLogger[level](`[${NS}] ${message}`, data || '');
    } else {
      const fn = console[level] || console.log;
      fn.call(console, `[${NS}] ${message}`, data || '');
    }
  }

  async function fetchNativePrice(chainId) {
    // Utiliser le service s'il existe (plus propre)
    if (window.BoomboxPriceService && typeof window.BoomboxPriceService.fetchNativePrice === 'function') {
      return window.BoomboxPriceService.fetchNativePrice(chainId);
    }
    // Fallback minimal
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    try {
      // Déterminer le symbole natif attendu
      let native = 'BNB';
      const map = { 'bsc': 'BNB', '56': 'BNB', 'arbitrum': 'ETH', '42161': 'ETH' };
      const key = String(chainId);
      native = map[key] || map[(key || '').toLowerCase()] || 'BNB';

      const data = await window.BoomboxAPI.getTokenPrice(chainId, native);
      // Normalisation: s'assurer que data.price est numérique
      if (data && typeof data.price === 'string') {
        const parsed = parseFloat(data.price);
        if (!isNaN(parsed)) data.price = parsed;
      }
      return data;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  class PriceMonitor {
    constructor() {
      this.intervalId = null;
      this.isRunning = false;
    }

    start(options) {
      const {
        getChainId,
        onPrice,
        onError,
        intervalMs = 30000
      } = options || {};

      if (this.isRunning) this.stop();

      if (typeof getChainId !== 'function' || typeof onPrice !== 'function') {
        log('warn', 'Paramètres invalides pour start');
        return false;
      }

      const fetchOnce = async () => {
        const chainId = getChainId();
        try {
          const data = await fetchNativePrice(chainId);
          if (!data || typeof data.price !== 'number' || !isFinite(data.price)) {
            throw new Error("Données de prix invalides reçues de l'API");
          }
          // Si wallet connecté, ne pas propager de fallback
          if (window.BOOMSWAP_CURRENT_ADDRESS && data.fallback) {
            throw new Error('Fallback refusé en mode connecté');
          }
          onPrice(data, chainId);
          try {
            const el = document.getElementById('bnbPrice');
            if (el) el.classList.remove('error');
          } catch (_) {}
        } catch (e) {
          if (onError) onError(e);
          try {
            const el = document.getElementById('bnbPrice');
            if (el && !window.BOOMSWAP_CURRENT_ADDRESS) {
              el.classList.add('error');
              el.textContent = 'Prix non disponible';
            }
          } catch (_) {}
          log('error', 'Erreur update prix', e);
        }
      };

      // Mise à jour immédiate puis intervalle
      // Ne rien écrire au départ pour éviter tout flash; on affiche dès la 1ère valeur
      fetchOnce();
      this.intervalId = setInterval(fetchOnce, intervalMs);
      this.isRunning = true;
      log('info', 'Monitoring prix démarré', { intervalMs });
      return true;
    }

    async fetchOnce(getChainId) {
      const chainId = typeof getChainId === 'function' ? getChainId() : (getChainId || 'bsc');
      const data = await fetchNativePrice(chainId);
      if (!data || typeof data.price !== 'number' || !isFinite(data.price)) {
        throw new Error("Données de prix invalides reçues de l'API");
      }
      return { data, chainId };
    }

    stop() {
      if (this.intervalId) clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning = false;
      log('info', 'Monitoring prix arrêté');
    }
  }

  if (!window.BoomboxPriceMonitor) {
    window.BoomboxPriceMonitor = new PriceMonitor();
  }
})();






