/**
 * BOOMBOXSWAP V1 - Price Service (Façade)
 * Fournit une méthode stable pour récupérer le prix BNB depuis l'API backend.
 * Non intrusif: peut être utilisé progressivement pour remplacer les appels inline.
 */

(function () {
  const NS = 'PRICE_SERVICE';

  function log(level, message, data) {
    if (window.BoomboxLogger && window.BoomboxLogger[level]) {
      window.BoomboxLogger[level](`[${NS}] ${message}`, data || '');
    } else {
      const fn = console[level] || console.log;
      fn.call(console, `[${NS}] ${message}`, data || '');
    }
  }

  async function fetchJsonWithTimeout(url, timeoutMs) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API Error ${res.status}: ${text}`);
      }
      return await res.json();
    } finally {
      clearTimeout(id);
    }
  }

  const PriceService = {
    async fetchNativePrice(chainId) {
      // Choisir le token natif attendu par la chaîne
      let token = 'BNB';
      try {
        const cm = window.BoomboxChainManager;
        const info = cm && cm.getCurrentChain && cm.getCurrentChain();
        if (info && info.nativeToken) token = info.nativeToken;
      } catch (_) {}
      const url = `/api/v1/price/${chainId}/${token}`;
      log('debug', 'Appel API prix natif', { url });
      try {
        const data = await fetchJsonWithTimeout(url, 8000);
        if (!data || typeof data.price !== 'number' || !isFinite(data.price)) {
          throw new Error('Données de prix invalides reçues de l\'API');
        }
        return data;
      } catch (e) {
        // Si un wallet est connecté, ne jamais retourner de fallback trompeur
        if (window.BOOMSWAP_CURRENT_ADDRESS) {
          throw e;
        }
        // Sinon (non connecté), fallback visuel rapide acceptable
        const fallback = token === 'ETH' ? 3000 : (token === 'SOL' ? 100 : 300);
        return { price: fallback, cached: true, fallback: true };
      }
    }
  };

  if (!window.BoomboxPriceService) {
    window.BoomboxPriceService = PriceService;
    log('info', 'Service prix initialisé');
  } else {
    log('warn', 'Service prix déjà existant, préservé');
  }
})();






