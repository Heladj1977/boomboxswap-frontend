/**
 * BOOMBOXSWAP V1 - Wallet Modal Controller (extraction non-intrusive)
 * Centralise l'ouverture/fermeture de la modale wallet sans casser l'UI.
 */

(function () {
  const NS = 'WALLET_MODAL';

  function log(level, message, data) {
    if (window.BoomboxLogger && window.BoomboxLogger[level]) {
      window.BoomboxLogger[level](`[${NS}] ${message}`, data || '');
    } else {
      const fn = console[level] || console.log;
      fn.call(console, `[${NS}] ${message}`, data || '');
    }
  }

  function q(id) { return document.getElementById(id); }

  async function tryEnableMetamaskSolanaSnap() {
    try {
      if (!window.ethereum || typeof window.ethereum.request !== 'function') {
        throw new Error('Ethereum provider indisponible');
      }
      // Demande d'installation/activation du Snap Solana officiel
      await window.ethereum.request({
        method: 'wallet_requestSnaps',
        params: {
          'npm:@metamask/solana-wallet': {}
        }
      });
      // Récupérer des comptes Solana via le Snap
      const accounts = await window.ethereum.request({
        method: 'solana_requestAccounts'
      });
      return { ok: true, accounts };
    } catch (e) {
      return { ok: false, error: e };
    }
  }

  async function ensureSolanaWallet() {
    // 1) Tenter Snap MetaMask Solana (sans jamais déclencher EVM)
    const snap = await tryEnableMetamaskSolanaSnap();
    if (snap.ok) return { provider: 'metamask-snap', accounts: snap.accounts };
    // 2) Fallback Phantom si disponible
    try {
      if (window.solana && window.solana.isPhantom) {
        const resp = await window.solana.connect({ onlyIfTrusted: false });
        return { provider: 'phantom', accounts: [resp.publicKey?.toString()] };
      }
    } catch (e) {
      // ignore
    }
    return { provider: null, accounts: [] };
  }

  const Modal = {
    show() {
      const modal = q('walletModal');
      if (!modal) return false;
      const before = modal.style.display;
      modal.style.display = 'flex';
      document.body.classList.add('modal-open');
      try { if (typeof fixWalletConnectShadowDOM === 'function') fixWalletConnectShadowDOM(); } catch (_) {}
      log('info', 'Modal affichée', { before, after: modal.style.display });

      // Si UI = Solana, afficher Phantom en plus, conserver MetaMask visible
      try {
        const cm = window.BoomboxChainManager;
        const isSol = !!(cm && cm.getCurrentChain && cm.getCurrentChain().type === 'solana');
        const ph = document.getElementById('connect-phantom');
        const mm = document.getElementById('connect-metamask');
        const wc = document.getElementById('connect-walletconnect');
        if (isSol) {
          if (ph) { ph.style.display = ''; ph.classList.remove('hidden'); }
          if (mm) { mm.style.display = 'none'; mm.classList.add('hidden'); }
          if (wc) { wc.style.display = 'none'; wc.classList.add('hidden'); }
        } else {
          if (mm) { mm.style.display = ''; mm.classList.remove('hidden'); }
          if (wc) { wc.style.display = ''; wc.classList.remove('hidden'); }
        }
      } catch (_) {}
      return true;
    },
    hide() {
      const modal = q('walletModal');
      if (!modal) return false;
      const before = modal.style.display;
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
      log('info', 'Modal masquée', { before, after: modal.style.display });
      return true;
    }
  };

  const QRModal = {
    show() {
      const modal = q('walletQRModal');
      if (!modal) return false;
      const before = modal.style.display;
      modal.style.display = 'flex';
      document.body.classList.add('modal-open');
      log('info', 'QR Modal affichée', { before, after: modal.style.display });
      return true;
    },
    hide() {
      const modal = q('walletQRModal');
      if (!modal) return false;
      const before = modal.style.display;
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
      const container = q('walletqr-qrcode');
      if (container) container.innerHTML = '';
      log('info', 'QR Modal masquée', { before, after: modal.style.display });
      return true;
    }
  };

  function toggleOptionsForChain(chainId) {
    const isSolana = chainId === 'solana';
    const mm = document.getElementById('connect-metamask');
    const wc = document.getElementById('connect-walletconnect');
    const ph = document.getElementById('connect-phantom');
    // MVP: Sur Solana, uniquement Phantom (pas MetaMask Snap, pas WalletConnect)
    if (mm) {
      mm.style.display = isSolana ? 'none' : '';
      if (isSolana) mm.classList.add('hidden'); else mm.classList.remove('hidden');
    }
    if (wc) {
      wc.style.display = isSolana ? 'none' : '';
      if (isSolana) wc.classList.add('hidden'); else wc.classList.remove('hidden');
    }
    if (ph) {
      ph.style.display = isSolana ? '' : 'none';
      if (isSolana) ph.classList.remove('hidden');
    }

    // Nettoyage des états désactivés
    try {
      if (!isSolana && mm) {
        mm.classList.remove('disabled');
        mm.removeAttribute('title');
      }
    } catch (_) {}
    // Message contextuel si MetaMask EVM connecté et chaîne Solana
    try {
      const isEvmConnected = !!window.BOOMSWAP_CURRENT_ADDRESS;
      const hint = document.getElementById('solana-wallet-hint');
      if (isSolana && isEvmConnected) {
        if (hint) hint.style.display = '';
      } else {
        if (hint) hint.style.display = 'none';
      }
    } catch (_) {}
  }

  // Écouteur global des changements de chaîne pour ajuster les options
  try {
    if (window.BoomboxEvents) {
      window.BoomboxEvents.on(
        window.BoomboxEvents.EVENTS.CHAIN_CHANGED,
        (payload) => {
          try {
            const newKey = payload && payload.newChain;
            toggleOptionsForChain(newKey);
          } catch (_) {}
        }
      );
    }
  } catch (_) {}

  // Expose un connecteur solana unifié (Snap ou Phantom)
  if (!window.BoomboxConnectSolana) {
    window.BoomboxConnectSolana = ensureSolanaWallet;
  }

  if (!window.BoomboxWalletModal) {
    window.BoomboxWalletModal = Modal;
  }
  if (!window.BoomboxWalletQRModal) {
    window.BoomboxWalletQRModal = QRModal;
  }

  // Plus de bouton manuel: lancer automatiquement la config Solana quand la modale s'ouvre et que la chaîne est Solana
  // Supprimer le déclenchement automatique: laisser l'utilisateur choisir
})();






