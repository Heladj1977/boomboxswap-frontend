/**
 * BOOMBOXSWAP V1 - Positions Updater (extraction non-intrusive)
 * Rôle: centraliser l'appel API des positions et exposer une API simple.
 */

(function () {
  const NS = 'POSITIONS_UPDATER';

  function log(level, message, data) {
    if (window.BoomboxLogger && window.BoomboxLogger[level]) {
      window.BoomboxLogger[level](`[${NS}] ${message}`, data || '');
    } else {
      const fn = console[level] || console.log;
      fn.call(console, `[${NS}] ${message}`, data || '');
    }
  }

  class PositionsUpdater {
    async fetch(address, chainId) {
      if (!window.BoomboxAPI || typeof window.BoomboxAPI.getPositions !== 'function') {
        throw new Error('API client non initialisé');
      }
      return window.BoomboxAPI.getPositions(address, chainId);
    }

    async fetchAndUpdate(address, chainId, onPositions, onError) {
      try {
        const positions = await this.fetch(address, chainId);
        if (typeof onPositions === 'function') onPositions(positions);
        return positions;
      } catch (e) {
        if (typeof onError === 'function') onError(e);
        log('error', 'Erreur récupération positions', e);
        throw e;
      }
    }
  }

  if (!window.BoomboxPositionsUpdater) {
    window.BoomboxPositionsUpdater = new PositionsUpdater();
  }
})();















