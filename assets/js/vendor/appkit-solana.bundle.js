/*
 * AppKit Solana - Bundle prêt-à-l'emploi (shim local)
 * Objectif: offrir une API unique BOOMB_OPEN_APPKIT_SOLANA() sans dépendances
 * externes, en s'appuyant sur WalletConnect Solana (QR) ou Phantom.
 */
(function () {
  var NS = 'APPKIT_SOLANA_SHIM';
  function log(level, msg, data) {
    try {
      if (window.BoomboxLogger && window.BoomboxLogger[level]) {
        window.BoomboxLogger[level]('[' + NS + '] ' + msg, data || '');
      } else {
        (console[level] || console.log).call(console, '[' + NS + '] ' + msg, data || '');
      }
    } catch (_) {}
  }

  async function connectViaWalletConnectSolana() {
    if (typeof window.BOOMB_CONNECT_WALLETCONNECT_SOLANA !== 'function') {
      throw new Error('WalletConnect Solana indisponible');
    }
    var res = await window.BOOMB_CONNECT_WALLETCONNECT_SOLANA();
    if (res && res.pubkey) {
      try {
        var pk = res.pubkey;
        window.BOOMB_SOLANA_PUBLIC_KEY = pk;
        var short = pk.length > 8 ? pk.slice(0, 4) + '...' + pk.slice(-4) : pk;
        var btn = document.getElementById('wallet-btn');
        var txt = document.getElementById('wallet-btn-text');
        if (btn) btn.className = 'wallet-header-btn wallet-btn connected';
        if (txt) txt.textContent = 'Solana: ' + short;
      } catch (_) {}
    }
    return !!(res && res.pubkey);
  }

  async function connectViaPhantom() {
    if (window.solana && window.solana.isPhantom) {
      try {
        var resp = await window.solana.connect({ onlyIfTrusted: false });
        var pk = String(resp.publicKey || '');
        if (pk) {
          window.BOOMB_SOLANA_PUBLIC_KEY = pk;
          var short = pk.length > 8 ? pk.slice(0, 4) + '...' + pk.slice(-4) : pk;
          var btn = document.getElementById('wallet-btn');
          var txt = document.getElementById('wallet-btn-text');
          if (btn) btn.className = 'wallet-header-btn wallet-btn connected';
          if (txt) txt.textContent = 'Solana: ' + short;
          return true;
        }
      } catch (e) {
        log('warn', 'Connexion Phantom échouée', e);
      }
    }
    return false;
  }

  window.BOOMB_OPEN_APPKIT_SOLANA = async function () {
    try {
      // Priorité: WalletConnect Solana (QR)
      var ok = false;
      try { ok = await connectViaWalletConnectSolana(); } catch (e) { log('warn', 'WC Solana indisponible', e); }
      if (ok) return true;
      // Fallback: Phantom natif
      ok = await connectViaPhantom();
      if (!ok) {
        if (window.showNotification) {
          window.showNotification('Aucun wallet Solana compatible détecté', 'warning');
        }
      }
      return ok;
    } catch (e) {
      log('error', 'Ouverture AppKit shim échouée', e);
      return false;
    }
  };

  log('info', 'Shim AppKit Solana prêt');
})();




