/**
 * WalletConnect v2 - Solana (vanilla JS, universal provider)
 * Objectif: permettre la connexion à un wallet Solana via QR (mobile),
 *           sans impacter le flux EVM existant.
 */
(function () {
  const NS = 'WALLETCONNECT_SOLANA';

  function log(level, message, data) {
    if (window.BoomboxLogger && window.BoomboxLogger[level]) {
      window.BoomboxLogger[level](`[${NS}] ${message}`, data || '');
    } else {
      const fn = console[level] || console.log;
      fn.call(console, `[${NS}] ${message}`, data || '');
    }
  }

  async function ensureSolanaProvider() {
    if (window.WalletConnectSolanaProvider) return window.WalletConnectSolanaProvider;
    try {
      // Tentative 1: jsDelivr (ESM)
      let mod = null;
      try {
        mod = await import('https://cdn.jsdelivr.net/npm/@walletconnect/solana-provider@0.1.0/dist/index.es.js');
      } catch (_) {}
      // Tentative 2: unpkg (ESM)
      if (!mod) {
        try { mod = await import('https://unpkg.com/@walletconnect/solana-provider@0.1.0/dist/index.es.js'); } catch (_) {}
      }
      // Tentative 3: esm.sh (ESM)
      if (!mod) {
        try { mod = await import('https://esm.sh/@walletconnect/solana-provider@0.1.0'); } catch (_) {}
      }
      if (!mod) throw new Error('CDN solana-provider introuvable');
      window.WalletConnectSolanaProvider = mod?.SolanaProvider || mod?.default || null;
      return window.WalletConnectSolanaProvider;
    } catch (e) {
      log('error', 'Chargement SolanaProvider échoué', e);
      return null;
    }
  }

  async function ensureUniversalProvider() {
    if (window.WalletConnectUniversalProvider) return window.WalletConnectUniversalProvider;
    try {
      const mod = await import('https://esm.sh/@walletconnect/universal-provider@2.11.2');
      window.WalletConnectUniversalProvider = mod?.UniversalProvider || mod?.default || null;
      return window.WalletConnectUniversalProvider;
    } catch (e) {
      log('error', 'Chargement UniversalProvider échoué', e);
      return null;
    }
  }

  async function connectSolanaWithWalletConnect() {
    try {
      const projectId = window.BOOMSWAP_PROJECT_ID;
      if (!projectId) throw new Error('Project ID WalletConnect manquant');

      // 1) Essayer le provider Solana dédié
      let provider = null;
      const SolanaProvider = await ensureSolanaProvider();
      if (SolanaProvider) {
        provider = await SolanaProvider.init({
          projectId,
          metadata: {
            name: 'BoomboxSwap V1',
            description: 'Interface gaming DeFi',
            url: window.location.origin,
            icons: [window.location.origin + '/assets/images/icons/walletconnect.svg']
          },
          relayUrl: 'wss://relay.walletconnect.com',
          chainId: 'solana:mainnet'
        });

        try {
          provider.on('display_uri', (uri) => {
            try {
              const container = document.getElementById('walletqr-qrcode');
              if (container) {
                container.innerHTML = '';
                const text = typeof uri === 'string' ? uri : (uri && (uri.uri || uri.data || (uri.params && uri.params[0]))) || '';
                if (text) {
                  new QRCode(container, { text, width: 220, height: 220, colorDark: '#000000', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.M });
                }
                if (window.BoomboxWalletQRModal) window.BoomboxWalletQRModal.show();
              }
            } catch (e) { log('warn', 'Affichage QR échoué', e); }
          });
        } catch (_) {}

        await provider.connect();

        let pubkey = null;
        try {
          const accs = provider.accounts || [];
          if (accs.length) pubkey = accs[0];
        } catch (_) {}
        if (!pubkey) {
          try {
            const ns = provider?.session?.namespaces?.solana;
            const accounts = ns?.accounts || [];
            if (accounts.length) {
              const first = accounts[0];
              const parts = first.split(':');
              pubkey = parts[2] || null;
            }
          } catch (_) {}
        }
        if (!pubkey) throw new Error('Extraction pubkey échouée');

        window.BOOMB_SOLANA_PUBLIC_KEY = pubkey;
        try { if (window.BoomboxWalletQRModal) window.BoomboxWalletQRModal.hide(); } catch (_) {}
        log('info', 'Connexion WalletConnect Solana réussie', { pubkey });
        return { provider: 'walletconnect-solana', pubkey };
      }

      // 2) Fallback UniversalProvider avec namespace Solana
      const UniversalProvider = await ensureUniversalProvider();
      if (!UniversalProvider) throw new Error('UniversalProvider indisponible');
      provider = await UniversalProvider.init({ projectId });

      try {
        provider.on('display_uri', (uri) => {
          try {
            const container = document.getElementById('walletqr-qrcode');
            if (container) {
              container.innerHTML = '';
              const text = typeof uri === 'string' ? uri : (uri && (uri.uri || uri.data || (uri.params && uri.params[0]))) || '';
              if (text) {
                new QRCode(container, { text, width: 220, height: 220, colorDark: '#000000', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.M });
              }
              if (window.BoomboxWalletQRModal) window.BoomboxWalletQRModal.show();
            }
          } catch (e) { log('warn', 'Affichage QR échoué', e); }
        });
      } catch (_) {}

      const session = await provider.connect({
        namespaces: {
          solana: {
            methods: ['solana_signMessage', 'solana_signTransaction', 'solana_signAllTransactions'],
            chains: ['solana:mainnet'],
            events: []
          }
        }
      });

      const ns = session?.namespaces?.solana || provider?.session?.namespaces?.solana;
      const accounts = ns?.accounts || [];
      if (!accounts.length) throw new Error('Aucun compte Solana retourné');
      const first = accounts[0];
      const parts = first.split(':');
      const pubkey = parts[2] || null;
      if (!pubkey) throw new Error('Extraction pubkey échouée');

      // État global minimal pour Solana
      window.BOOMB_SOLANA_PUBLIC_KEY = pubkey;
      // Ne pas écraser BOOMSWAP_CURRENT_ADDRESS (EVM). Exposer séparément.

      // Fermer le QR si encore ouvert
      try { if (window.BoomboxWalletQRModal) window.BoomboxWalletQRModal.hide(); } catch (_) {}

      log('info', 'Connexion WalletConnect Solana réussie', { pubkey });
      return { provider: 'walletconnect-solana', pubkey };
    } catch (e) {
      log('error', 'Connexion WalletConnect Solana échouée', e);
      try {
        if (String(e && (e.message || e)).includes('Requested chains are not supported')) {
          if (window.showNotification) {
            window.showNotification('Activer Solana dans votre projet WalletConnect (Cloud)', 'warning');
          }
        }
      } catch (_) {}
      throw e;
    }
  }

  window.BOOMB_CONNECT_WALLETCONNECT_SOLANA = connectSolanaWithWalletConnect;
})();


