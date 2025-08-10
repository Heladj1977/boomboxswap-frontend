(function () {
  const NS = 'PHANTOM_CONFIG';

  function log(level, message, data) {
    if (window.BoomboxLogger && window.BoomboxLogger[level]) {
      window.BoomboxLogger[level](`[${NS}] ${message}`, data || '');
    } else {
      const fn = console[level] || console.log;
      fn.call(console, `[${NS}] ${message}`, data || '');
    }
  }

  async function connectPhantom() {
    try {
      const provider = window.solana;
      if (!provider || !provider.isPhantom) {
        throw new Error('Phantom non détecté');
      }

      log('info', 'Demande de connexion Phantom...');
      const resp = await provider.connect({ onlyIfTrusted: false });
      const address = (resp && resp.publicKey) ? resp.publicKey.toString() : null;
      if (!address) {
        throw new Error('Adresse Phantom introuvable');
      }

      // Marquer l'état global (Solana = chain_id 0)
      window.BOOMSWAP_CURRENT_PROVIDER = provider;
      window.BOOMSWAP_CURRENT_ADDRESS = address;
      window.BOOMSWAP_CURRENT_CHAIN_ID = 0;
      try { window.BOOMB_SOLANA_PUBLIC_KEY = address; } catch (_) {}

      try {
        // Synchroniser l'UI (sélecteur déjà sur Solana normalement)
        if (window.BoomboxChainManager) {
          // Forcer Solana comme chaîne active
          if (window.BoomboxChainManager.getCurrentChainId() !== 'solana') {
            await window.BoomboxChainManager.switchChain('solana', { noWalletSwitch: true });
          } else {
            window.BoomboxChainManager.updateUI();
          }
        }
      } catch (_) {}

      // Fermer les modals
      try { if (window.BoomboxWalletQRModal) window.BoomboxWalletQRModal.hide(); } catch (_) {}
      try { if (window.BoomboxWalletModal) window.BoomboxWalletModal.hide(); } catch (_) {}

      // Récupérer balances/positions via ApiClient
      let balances = {};
      let positions = [];
      try {
        const chainNumeric = 0;
        if (window.BoomboxAPI) {
          balances = await window.BoomboxAPI.getBalances(address, chainNumeric);
          const resp = await window.BoomboxAPI.getPositions(address, chainNumeric);
          positions = resp || [];
        }
      } catch (e) {
        log('warn', 'Erreur récupération données après connexion Phantom', e);
      }

      // Notifier l'app
      try {
        if (window.BoomboxApp && window.BoomboxApp.onWalletConnected) {
          window.BoomboxApp.onWalletConnected({ balances, positions });
        }
      } catch (_) {}

      // Verrouiller l'UI bouton côté Solana
      try {
        window.BOOMB_WALLET_LOCK_LABEL = 'solana';
        window.BOOMB_WALLET_UI_LOCK = 'solana';
        const walletBtn = document.getElementById('wallet-btn');
        const walletBtnText = document.getElementById('wallet-btn-text');
        if (walletBtn) walletBtn.className = 'wallet-header-btn wallet-btn connected';
        if (walletBtnText) {
          const short = address.length > 8 ? address.slice(0,4) + '...' + address.slice(-4) : address;
          walletBtnText.textContent = `Solana: ${short}`;
        }
        if (typeof window.BOOMB_APPLY_WALLET_HEADER === 'function') window.BOOMB_APPLY_WALLET_HEADER();
      } catch (_) {}

      log('info', 'Connexion Phantom réussie', { address });
      return { address, chainId: 0, type: 'phantom' };
    } catch (error) {
      log('error', 'Erreur connexion Phantom', error);
      throw error;
    }
  }

  // Déconnexion Phantom
  async function disconnectPhantom() {
    try {
      const provider = window.solana;
      if (provider && provider.disconnect) {
        await provider.disconnect();
      }
    } catch (_) {}
    window.BOOMSWAP_CURRENT_PROVIDER = null;
    window.BOOMSWAP_CURRENT_ADDRESS = null;
    window.BOOMSWAP_CURRENT_CHAIN_ID = null;
    try { window.BOOMB_SOLANA_PUBLIC_KEY = null; } catch (_) {}
    try { window.BOOMB_WALLET_UI_LOCK = null; window.BOOMB_WALLET_LOCK_LABEL = null; } catch (_) {}
    try { if (typeof window.BOOMB_APPLY_WALLET_HEADER === 'function') window.BOOMB_APPLY_WALLET_HEADER(); } catch (_) {}
  }

  // Exposer globalement
  window.BOOMSWAP_CONNECT_PHANTOM = connectPhantom;
  window.BOOMSWAP_DISCONNECT_PHANTOM = disconnectPhantom;

  // Sécuriser: si Phantom n'est pas installé, afficher une notification lors du clic
  document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('connect-phantom');
    if (btn) {
      btn.addEventListener('click', async function () {
        // MVP: Phantom réservé à Solana
        try {
          const cm = window.BoomboxChainManager;
          const isSol = !!(cm && cm.getCurrentChain && cm.getCurrentChain().type === 'solana');
          if (!isSol && window.showNotification) {
            window.showNotification('Phantom est réservé à Solana', 'info');
          }
        } catch (_) {}
        if (!window.solana || !window.solana.isPhantom) {
          if (window.showNotification) {
            window.showNotification('Phantom non détecté. Installez Phantom.', 'error');
          } else {
            alert('Phantom non détecté. Installez Phantom.');
          }
          return;
        }
        try {
          await connectPhantom();
        } catch (e) {
          if (window.showNotification) {
            window.showNotification('Connexion Phantom échouée', 'error');
          }
        }
      });
    }
  });
})();

