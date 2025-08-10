/**
 * BOOMBOXSWAP V1 - Contrôleur sélecteur de chaîne
 * Branche le dropdown custom du header sur BoomboxChainManager.
 * Non intrusif: n'altère pas la structure HTML existante.
 */

(function () {
  function q(sel) { try { return document.querySelector(sel); } catch (_) { return null; } }
  function qa(sel) { try { return document.querySelectorAll(sel); } catch (_) { return []; } }

  function logInfo(msg, data) {
    if (window.BoomboxLogger) window.BoomboxLogger.info(msg, data);
    else console.log(msg, data || '');
  }
  function logWarn(msg, data) {
    if (window.BoomboxLogger) window.BoomboxLogger.warn(msg, data);
    else console.warn(msg, data || '');
  }

  function updateSelectedChainDisplay(chainId) {
    const selected = q('.selected-chain');
    if (!selected) return;

    const nameEl = selected.querySelector('.chain-name');
    const imgEl = selected.querySelector('img.chain-logo');

    const config = {
      bsc: { name: 'BSC', img: 'assets/images/chains/BSC-logo.svg' },
      arbitrum: { name: 'Arb', img: 'assets/images/chains/arbitrum-arb-logo.svg' },
      solana: { name: 'Solana', img: 'assets/images/chains/solana.svg' },
    };
    const c = config[chainId] || config.bsc;
    if (nameEl) nameEl.textContent = c.name;
    if (imgEl) { imgEl.src = c.img; imgEl.alt = c.name; }
  }

  function closeOptions() {
    const opts = q('#chain-options');
    if (opts && !opts.classList.contains('hidden')) {
      opts.classList.add('hidden');
    }
  }

  function toggleOptions() {
    const opts = q('#chain-options');
    if (!opts) return;
    const willShow = opts.classList.contains('hidden');
    if (willShow) {
      positionOptions();
      opts.classList.remove('hidden');
    } else {
      opts.classList.add('hidden');
    }
  }

  function attach() {
    const selected = q('.selected-chain');
    const options = qa('.chain-option');
    if (!selected) {
      logWarn('[CHAIN] Élément .selected-chain introuvable');
      return;
    }

    // Ouvrir/fermer le menu
    selected.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleOptions();
    });

    // Choix d'une option
    options.forEach((opt) => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const chainId = opt.getAttribute('data-value');
        if (!chainId) return;

        // Switch de chaîne via BoomboxChainManager si présent
        if (window.BoomboxChainManager &&
            typeof window.BoomboxChainManager.switchChain === 'function') {
          window.BoomboxChainManager.switchChain(chainId);
        }

        // Mettre à jour l'affichage header
        updateSelectedChainDisplay(chainId);

        // Fermer le menu
        closeOptions();

        // Demander mise à jour prix
        try {
          if (window.app && typeof window.app.updatePrices === 'function') {
            window.app.updatePrices();
          }
        } catch (_) {}

        logInfo('[CHAIN] Chaîne sélectionnée', { chainId });
      });
    });

    // Fermer en cliquant hors du menu
    document.addEventListener('click', () => closeOptions());

    // Repositionner si la fenêtre change (menu ouvert uniquement)
    window.addEventListener('resize', () => {
      const opts = q('#chain-options');
      if (opts && !opts.classList.contains('hidden')) positionOptions();
    });
    window.addEventListener('scroll', () => {
      const opts = q('#chain-options');
      if (opts && !opts.classList.contains('hidden')) positionOptions();
    }, true);

    // Sync initiale
    try {
      const current = window.BoomboxChainManager?.getCurrentChainId?.() || 'bsc';
      updateSelectedChainDisplay(current);
    } catch (_) {}
  }

  function positionOptions() {
    const container = q('.chain-selector');
    const fallback = q('.selected-chain');
    const opts = q('#chain-options');
    if (!opts || (!container && !fallback)) return;

    const rect = (container || fallback).getBoundingClientRect();

    // Largeur dynamique: calée sur le déclencheur pour BSC/Arb/Solana
    const dynamicWidth = Math.max(Math.round(rect.width), 100);

    // Aligner exactement au bord bas du conteneur (sans espace visible)
    // On chevauche de 1px pour masquer les bordures éventuelles
    const left = rect.left;
    const top = rect.bottom - 1; // effet collé visuellement

    // S’assurer que le menu reste dans l’écran avec la largeur dynamique
    const maxLeft = Math.max(0, window.innerWidth - dynamicWidth - 8);
    const safeLeft = Math.min(left, maxLeft);

    opts.style.position = 'fixed';
    opts.style.left = `${Math.round(safeLeft)}px`;
    opts.style.top = `${Math.round(top)}px`;
    // Adapter la largeur pour Solana (et autres) afin d'aligner pro avec le sélecteur
    opts.style.width = `${dynamicWidth}px`;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attach);
  } else {
    attach();
  }
})();


