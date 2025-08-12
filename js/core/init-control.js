/**
 * BOOMBOXSWAP V1 - Contrôle d'initialisation centralisé
 * Évite les doublons et conflits d'initialisation
 */

// Système de contrôle global
window.BOOMBOX_INIT_CONTROL = {
    // Flags d'initialisation
    appInitialized: false,
    gamingInitialized: false,
    apiInitialized: false,
    walletInitialized: false,
    domReady: false,
    
    // Méthodes de contrôle
    isInitialized(component) {
        return this[component + 'Initialized'] || false;
    },
    
    setInitialized(component) {
        this[component + 'Initialized'] = true;
        console.log(`✅ ${component} initialisé`);
    },
    
    canInitialize(component) {
        if (this.isInitialized(component)) {
            console.log(`⚠️ ${component} déjà initialisé, arrêt...`);
            return false;
        }
        return true;
    },
    
    // Vérification de l'état global
    getStatus() {
        return {
            app: this.appInitialized,
            gaming: this.gamingInitialized,
            api: this.apiInitialized,
            wallet: this.walletInitialized,
            dom: this.domReady
        };
    },
    
    // Log de l'état
    logStatus() {
        const status = this.getStatus();
        console.log('=== ÉTAT INITIALISATION BOOMBOXSWAP ===');
        Object.entries(status).forEach(([key, value]) => {
            console.log(`${key}: ${value ? '✅' : '❌'}`);
        });
        console.log('========================================');
    }
};

// Event listener DOM centralisé
document.addEventListener('DOMContentLoaded', () => {
    window.BOOMBOX_INIT_CONTROL.domReady = true;
    console.log('🌐 DOM prêt pour initialisation');
    window.BOOMBOX_INIT_CONTROL.logStatus();
});

// Fonction utilitaire pour attendre que le DOM soit prêt
window.waitForDOM = function(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
};

console.log('🎛️ Contrôle d\'initialisation BOOMBOXSWAP chargé');

// Loader conditionnel Swap V2 (Lot 0–1) — sans impacter l'existant
;(function () {
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      try {
        const s = document.createElement('script');
        s.src = src;
        s.onload = () => resolve(true);
        s.onerror = (e) => reject(e);
        document.body.appendChild(s);
      } catch (e) { reject(e); }
    });
  }
  function loadCss(href) {
    return new Promise((resolve, reject) => {
      try {
        const l = document.createElement('link');
        l.rel = 'stylesheet';
        l.href = href;
        l.onload = () => resolve(true);
        l.onerror = (e) => reject(e);
        document.head.appendChild(l);
      } catch (e) { reject(e); }
    });
  }

  function start() {
    loadScript('js/core/feature-flags.js')
      .then(() => {
        let v2Enabled = false;
        try {
          v2Enabled =
            window.BoomboxFeatureFlags?.isEnabled('swap_v2_enabled') === true;
        } catch (_) {
          v2Enabled = false;
        }
        try { console.log(`[SWAP_V2] Flag check: ${v2Enabled}`); } catch (_) {}
        if (!v2Enabled) {
          try {
            const prehideEl = document.getElementById('swapv2-prehide');
            if (prehideEl) {
              prehideEl.remove();
              try {
                console.log('[SWAP_V2] Flag false → Card 6 legacy affichée');
              } catch (_) {}
            }
          } catch (e) {
            try { console.error('[SWAP_V2] ERROR:', e); } catch (_) {}
          }
          return null;
        }

        try { console.log('[SWAP_V2] Prehide stays active'); } catch (_) {}

        return Promise.resolve()
          .then(() => loadCss('assets/css/swap-v2.css'))
          .then(() => loadScript('js/core/swap-v2-adapters.js'))
          .then(() => { try { console.log('[SWAP_V2] Adapter loaded'); } catch (_) {} })
          .then(() => loadScript('js/components/swap-v2-modal-settings.js'))
          .then(() => loadScript('js/components/swap-v2-modal-token-select.js'))
          .then(() => loadScript('js/components/swap-v2-popover-infos.js'))
          .then(() => loadScript('js/core/swap-v2-controller.js'))
          .then(() => {
            try { console.log('[SWAP_V2] Controller init start'); } catch (_) {}
            try {
              const maybe = window.SwapV2Controller?.init?.();
              return Promise.resolve(maybe);
            } catch (e) {
              try { console.error('[SWAP_V2] ERROR:', e); } catch (_) {}
            }
          })
          .then(() => { try { console.log('[SWAP_V2] Controller init complete'); } catch (_) {} });
      })
      .catch((e) => {
        try { console.error('[SWAP_V2] ERROR:', e); } catch (_) {}
      });
  }

  try {
    if (typeof window.waitForDOM === 'function') {
      window.waitForDOM(start);
    } else if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
      start();
    }
  } catch (_) { /* silence */ }
})();