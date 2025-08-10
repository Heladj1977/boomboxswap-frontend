/**
 * Connecteur Solana natif (injected) pour Phantom / Backpack
 * Sans QR, sans AppKit. Détecte les providers injectés et connecte.
 */
(function () {
  const NS = 'SOLANA_INJECTED';

  function log(level, message, data) {
    try {
      if (window.BoomboxLogger && window.BoomboxLogger[level]) {
        window.BoomboxLogger[level](`[${NS}] ${message}`, data || '');
      } else {
        const fn = console[level] || console.log;
        fn.call(console, `[${NS}] ${message}`, data || '');
      }
    } catch (_) {}
  }

  function setHeaderPubkey(pubkey) {
    try {
      const pk = String(pubkey || '');
      if (!pk) return;
      window.BOOMB_SOLANA_PUBLIC_KEY = pk;
      window.BOOMB_WALLET_LOCK_LABEL = 'solana';
      window.BOOMB_WALLET_UI_LOCK = 'solana';
      const short = pk.length > 8 ? pk.slice(0, 4) + '...' + pk.slice(-4) : pk;
      const walletBtn = document.getElementById('wallet-btn');
      const walletBtnText = document.getElementById('wallet-btn-text');
      if (walletBtn) walletBtn.className = 'wallet-header-btn wallet-btn connected';
      if (walletBtnText) walletBtnText.textContent = `Solana: ${short}`;
    } catch (_) {}
  }

  function getBackpackProvider() {
    try {
      if (window.backpack && window.backpack.solana) return window.backpack.solana;
      if (window.xnft && window.xnft.solana) return window.xnft.solana;
    } catch (_) {}
    return null;
  }

  function getPhantomProvider() {
    try {
      if (window.solana && window.solana.isPhantom) return window.solana;
    } catch (_) {}
    return null;
  }

  async function connectBackpack() {
    const provider = getBackpackProvider();
    if (!provider) return null;
    try {
      const resp = await provider.connect();
      const pk = String(resp?.publicKey || provider.publicKey || '');
      if (pk) {
        log('info', 'Backpack connecté', { pubkey: pk });
        setHeaderPubkey(pk);
        return { provider: 'backpack', pubkey: pk };
      }
    } catch (e) {
      log('warn', 'Connexion Backpack échouée', e);
    }
    return null;
  }

  async function connectPhantom() {
    const provider = getPhantomProvider();
    if (!provider) return null;
    try {
      const resp = await provider.connect({ onlyIfTrusted: false });
      const pk = String(resp?.publicKey || provider.publicKey || '');
      if (pk) {
        log('info', 'Phantom connecté', { pubkey: pk });
        setHeaderPubkey(pk);
        return { provider: 'phantom', pubkey: pk };
      }
    } catch (e) {
      log('warn', 'Connexion Phantom échouée', e);
    }
    return null;
  }

  // API unifiée
  window.BOOMB_CONNECT_SOLANA_INJECTED = async function () {
    // Priorité Backpack, puis Phantom
    const bp = await connectBackpack();
    if (bp && bp.pubkey) return bp;
    const ph = await connectPhantom();
    if (ph && ph.pubkey) return ph;
    if (window.showNotification) {
      window.showNotification('Aucun wallet Solana injecté détecté', 'warning');
    }
    return null;
  };
})();


