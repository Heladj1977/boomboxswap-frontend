/**
 * Reown AppKit - Intégration Solana (vanilla JS)
 * Ouvre le modal AppKit pour connecter un wallet Solana (mobile/desktop).
 */
(function () {
  const NS = 'APPKIT_SOLANA';

  function log(level, message, data) {
    if (window.BoomboxLogger && window.BoomboxLogger[level]) {
      window.BoomboxLogger[level](`[${NS}] ${message}`, data || '');
    } else {
      const fn = console[level] || console.log;
      fn.call(console, `[${NS}] ${message}`, data || '');
    }
  }

  async function setupAppKitSolana() {
    try {
      const projectId = window.BOOMSWAP_PROJECT_ID;
      if (!projectId) throw new Error('ProjectId Reown manquant');

      // Charger AppKit + Adapter Solana via ESM (multi-CDN robuste)
      async function imp(urls) {
        for (const u of urls) {
          try { return await import(u); } catch (_) {}
        }
        return null;
      }
      const appkitMod = await imp([
        'https://cdn.jsdelivr.net/npm/@reown/appkit/+esm',
        'https://unpkg.com/@reown/appkit/+esm',
        'https://esm.sh/@reown/appkit'
      ]);
      const adapterMod = await imp([
        'https://cdn.jsdelivr.net/npm/@reown/appkit-adapter-solana/+esm',
        'https://unpkg.com/@reown/appkit-adapter-solana/+esm',
        'https://esm.sh/@reown/appkit-adapter-solana'
      ]);
      const networksMod = await imp([
        'https://cdn.jsdelivr.net/npm/@reown/appkit/networks/+esm',
        'https://unpkg.com/@reown/appkit/networks/+esm',
        'https://esm.sh/@reown/appkit/networks'
      ]);
      if (!appkitMod || !adapterMod) throw new Error('Modules AppKit Solana introuvables');

      const createAppKit = appkitMod.createAppKit || appkitMod.default?.createAppKit || appkitMod.default || appkitMod['createAppKit'];
      let AdapterClass = adapterMod.SolanaAdapter || adapterMod.default?.SolanaAdapter || adapterMod.default;
      if (AdapterClass && typeof AdapterClass !== 'function' && typeof AdapterClass?.default === 'function') {
        AdapterClass = AdapterClass.default;
      }
      if (typeof createAppKit !== 'function' || typeof AdapterClass !== 'function') {
        throw new Error('Exports AppKit/SolanaAdapter invalides');
      }

      const solanaNet = (networksMod && (networksMod.solana || networksMod.default?.solana)) || { id: 'solana:mainnet' };

      // Adapter Solana minimal
      const solanaWeb3JsAdapter = new AdapterClass();

      const metadata = {
        name: 'BoomboxSwap V1',
        description: 'Interface gaming DeFi',
        url: window.location.origin,
        icons: [window.location.origin + '/assets/images/icons/walletconnect.svg']
      };

      const appKit = createAppKit({
        adapters: [solanaWeb3JsAdapter],
        networks: [solanaNet],
        metadata,
        projectId,
        features: { analytics: false }
      });

      // Bouton web component caché pour déclenchement programmatique
      const hiddenBtnId = 'appkit-solana-hidden-btn';
      if (!document.getElementById(hiddenBtnId)) {
        const btn = document.createElement('appkit-button');
        btn.id = hiddenBtnId;
        btn.style.display = 'none';
        document.body.appendChild(btn);
      }

      // Exposer une API simple d'ouverture
      window.BOOMB_OPEN_APPKIT_SOLANA = async function () {
        try {
          // Méthode 1: si appKit.open existe
          if (appKit && typeof appKit.open === 'function') {
            appKit.open();
            return true;
          }
          // Méthode 2: cliquer le web component caché
          const el = document.getElementById(hiddenBtnId);
          if (el && typeof el.click === 'function') {
            el.click();
            return true;
          }
          return false;
        } catch (e) {
          log('error', 'Ouverture AppKit échouée', e);
          return false;
        }
      };

      // Tentative de récupération pubkey après connexion via événements custom
      // AppKit n’expose pas d’API globale simple ici; on tente via provider Phantom
      window.addEventListener('focus', () => {
        try {
          // Si un provider Solana injecté est présent (Phantom desktop)
          if (window.solana && window.solana.publicKey) {
            const pk = String(window.solana.publicKey);
            if (pk) {
              window.BOOMB_SOLANA_PUBLIC_KEY = pk;
              const walletBtn = document.getElementById('wallet-btn');
              const walletBtnText = document.getElementById('wallet-btn-text');
              const short = (pk.length > 8) ? pk.substring(0,4) + '...' + pk.substring(pk.length-4) : pk;
              if (walletBtn) walletBtn.className = 'wallet-header-btn wallet-btn connected';
              if (walletBtnText) walletBtnText.textContent = `Solana: ${short}`;
            }
          }
        } catch (_) {}
      });

      log('info', 'AppKit Solana prêt');
    } catch (e) {
      log('error', 'Initialisation AppKit Solana échouée', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAppKitSolana);
  } else {
    setupAppKitSolana();
  }
})();


