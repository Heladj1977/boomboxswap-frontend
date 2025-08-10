/**
 * BOOMBOXSWAP V1 - UI Contract Façade
 * But: offrir des méthodes stables pour MAJ du prix, des soldes, et du wallet
 * sans modifier la logique existante. 100% optionnel et non intrusif.
 */

(function () {
  const NS = 'UI_CONTRACT';

  function log(level, message, data) {
    if (window.BoomboxLogger && window.BoomboxLogger[level]) {
      window.BoomboxLogger[level](`[${NS}] ${message}`, data || '');
    } else {
      const fn = console[level] || console.log;
      fn.call(console, `[${NS}] ${message}`, data || '');
    }
  }

  function $(sel) {
    try { return document.querySelector(sel); } catch (_) { return null; }
  }

  function text(node, value) {
    if (node) node.textContent = value;
  }

  const state = {
    lastBnbPrice: null
  };

  const UI = {
    selectors: {
      priceMain: '#bnbPrice',
      balanceBnb: '#balance-bnb',
      balanceUsdt: '#balance-usdt',
      balanceCake: '#balance-cake',
      balanceTotal: '#total-value',
      walletBtn: '#wallet-btn',
      walletBtnText: '#wallet-btn-text',
      walletModal: '#walletModal'
    },

    setBnbPrice(price) {
      const el = $(this.selectors.priceMain);
      if (!el || typeof price !== 'number' || !isFinite(price)) return;

      // Si l'animation est gérée par la logique existante, ne pas animer ici
      const animationOwnedByMain =
        typeof window !== 'undefined' &&
        window.BOOMBOX_PRICE_ANIMATION_OWNER === 'main';

      if (!animationOwnedByMain) {
        // Animation up/down basée sur la variation
        if (state.lastBnbPrice !== null) {
          const up = price > state.lastBnbPrice;
          el.classList.remove('price-up', 'price-down');
          el.classList.add(up ? 'price-up' : 'price-down');
          el.classList.remove('pulse');
          el.classList.add('pulse');
          setTimeout(() => {
            el.classList.remove('pulse', 'price-up', 'price-down');
          }, 600);
        }
      }

      text(el, `$${price.toFixed(2)}`);
      state.lastBnbPrice = price;
    },

    setBalances({ bnb, usdt, cake, totalUsd }) {
      if (window.BOOMBOX_SUPPRESS_BALANCE_UPDATES && (
        (bnb && bnb !== 0) || (usdt && usdt !== 0) || (cake && cake !== 0) || (totalUsd && totalUsd !== 0)
      )) {
        return;
      }
      const balancesOwnedByMain =
        typeof window !== 'undefined' &&
        window.BOOMBOX_BALANCES_OWNER === 'main';
      if (balancesOwnedByMain) return; // éviter double mise à jour

      const bn = typeof bnb === 'number' && isFinite(bnb) ? bnb : null;
      const un = typeof usdt === 'number' && isFinite(usdt) ? usdt : null;
      const cn = typeof cake === 'number' && isFinite(cake) ? cake : null;
      const tn = typeof totalUsd === 'number' && isFinite(totalUsd) ? totalUsd : null;

      text($(this.selectors.balanceBnb), bn !== null ? bn.toFixed(6) : '0.000000');
      text($(this.selectors.balanceUsdt), un !== null ? un.toFixed(4) : '0.0000');
      text($(this.selectors.balanceCake), cn !== null ? cn.toFixed(6) : '0.000000');
      text($(this.selectors.balanceTotal), tn !== null ? `$${tn.toFixed(2)}` : '$0.00');
    },

    clearBalances() {
      const zero = { bnb: 0, usdt: 0, cake: 0, totalUsd: 0 };
      window.BOOMBOX_SUPPRESS_BALANCE_UPDATES = true;
      this.setBalances(zero);
      const bnbEl = $(this.selectors.balanceBnb);
      const usdtEl = $(this.selectors.balanceUsdt);
      const cakeEl = $(this.selectors.balanceCake);
      const totalEl = $(this.selectors.balanceTotal);
      text(bnbEl, '0.000000');
      text(usdtEl, '0.0000');
      text(cakeEl, '0.000000');
      text(totalEl, '$0.00');
    },

    setWalletStatus({ connected, label }) {
      const walletOwnedByMain =
        typeof window !== 'undefined' &&
        window.BOOMBOX_WALLET_OWNER === 'main';
      if (walletOwnedByMain) return; // éviter double mise à jour

      const btn = $(this.selectors.walletBtn);
      const txt = $(this.selectors.walletBtnText);
      if (!btn || !txt) return;

      btn.classList.remove('connected', 'disconnected');
      btn.classList.add(connected ? 'connected' : 'disconnected');
      text(txt, label || (connected ? 'Déconnexion' : 'Connecter Wallet'));
    },

    toggleWalletModal(show) {
      const modal = $(this.selectors.walletModal);
      if (!modal) return;
      if (show) {
        modal.classList.remove('hidden');
      } else {
        modal.classList.add('hidden');
      }
    }
  };

  // Exposer globalement sans écraser si déjà défini
  if (!window.BoomboxUI) {
    window.BoomboxUI = UI;
    log('info', 'Façade UI initialisée');
  } else {
    log('warn', 'Façade UI déjà existante, préservée');
  }
})();


