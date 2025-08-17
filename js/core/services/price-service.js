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

  // Supprimé: fetch direct. Utiliser BoomboxAPI pour respecter l'architecture.

  const PriceService = {
    async getPrice(chainId, symbol, options = {}) {
      try {
        if (!window.BoomboxAPI || typeof window.BoomboxAPI.getTokenPrice !== 'function') {
          throw new Error('ApiClient non disponible');
        }
        const data = await window.BoomboxAPI.getTokenPrice(chainId, symbol);
        if (!data || typeof data.price !== 'number' || !isFinite(data.price)) {
          throw new Error('Prix invalide');
        }
        return data.price;
      } catch (_) { 
        // RESTAURÉ: Fallback CAKE pour la carte 1 (portefeuille)
        // Mais isolé pour ne pas affecter la carte 6 (swap)
        if (symbol === 'CAKE' && options.forPortfolio) {
          const cakePrices = {
            'bsc': 2.50,
            'arbitrum': 2.45,
            'base': 2.50
          };
          return cakePrices[chainId] || 2.50;
        }
        // Pour les autres cas, laisser l'API backend gérer
        return null; 
      }
    },
    async fetchNativePrice(chainId) {
      // Choisir le token natif attendu par la chaîne
      let token = 'BNB';
      try {
        const cm = window.BoomboxChainManager;
        const info = cm && cm.getCurrentChain && cm.getCurrentChain();
        if (info && info.nativeToken) token = info.nativeToken;
      } catch (_) {}
      log('debug', 'Appel API prix natif', { chainId, token });
      try {
        if (!window.BoomboxAPI || typeof window.BoomboxAPI.getTokenPrice !== 'function') {
          throw new Error('ApiClient non initialisé');
        }
        const data = await window.BoomboxAPI.getTokenPrice(chainId, token);
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






