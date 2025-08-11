/* BOOMBOXSWAP - Adapters Swap V2 (Lot 2)
 * Accès best-effort aux états wallet/balances/prix sans casser l'UI.
 * - Zéro dépendance tierce
 * - Zéro exception non catchée côté appelant (renvoie placeholders)
 */
(function () {
  const PLACEHOLDER = '—';

  function getChainKeySafe() {
    try {
      const fn = window.BoomboxChainManager &&
        window.BoomboxChainManager.getCurrentChainId;
      const val = typeof fn === 'function' ? fn.call(window.BoomboxChainManager) : null;
      return val || 'bsc';
    } catch (_) { return 'bsc'; }
  }

  function getNativeSymbol(chainKey) {
    if (chainKey === 'arbitrum') return 'ETH';
    if (chainKey === 'solana') return 'SOL';
    return 'BNB';
  }

  function hexToBigInt(hex) {
    try {
      const v = (hex || '0x0');
      return BigInt(v);
    } catch (_) { return 0n; }
  }

  function formatDecimals(valueBigInt, decimals) {
    try {
      const d = BigInt(decimals);
      const base = 10n ** d;
      const whole = valueBigInt / base;
      const frac = valueBigInt % base;
      const fracStr = (frac + base).toString().slice(1); // zero-pad
      // 4 décimales pour l'affichage
      const frac4 = fracStr.slice(0, 4).replace(/0+$/, '');
      return frac4 ? `${whole.toString()}.${frac4}` : whole.toString();
    } catch (_) { return '0'; }
  }

  async function evmGetNativeBalance(address) {
    try {
      if (!window.ethereum || !address) return null;
      const res = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });
      const wei = hexToBigInt(res);
      return formatDecimals(wei, 18);
    } catch (_) { return null; }
  }

  function encodeBalanceOf(address) {
    // keccak256("balanceOf(address)").slice(0,4) = 0x70a08231
    try {
      const clean = String(address || '').toLowerCase().replace(/^0x/, '');
      const padded = clean.padStart(64, '0');
      return '0x70a08231' + padded;
    } catch (_) { return null; }
  }

  async function evmGetErc20Balance(tokenAddress, holder) {
    try {
      if (!window.ethereum || !tokenAddress || !holder) return null;
      const data = encodeBalanceOf(holder);
      if (!data) return null;
      const res = await window.ethereum.request({
        method: 'eth_call',
        params: [{ to: tokenAddress, data }, 'latest']
      });
      const val = hexToBigInt(res);
      // Hypothèse standard 18 décimales par défaut si inconnu
      return formatDecimals(val, 18);
    } catch (_) { return null; }
  }

  // Throttle simple pour éviter le spam réseau (600ms min entre lots)
  let lastBalancesTs = 0;
  async function throttleWait(tsMinGapMs) {
    try {
      const now = Date.now();
      const delta = now - lastBalancesTs;
      if (delta < tsMinGapMs) {
        await new Promise(r => setTimeout(r, tsMinGapMs - delta));
      }
      lastBalancesTs = Date.now();
    } catch (_) {}
  }

  const Adapters = {
    getWalletState() {
      try {
        const evm = !!window.BOOMSWAP_CURRENT_ADDRESS;
        const sol = !!window.BOOMB_SOLANA_PUBLIC_KEY;
        const connected = evm || sol;
        const address = evm ? window.BOOMSWAP_CURRENT_ADDRESS : (
          sol ? window.BOOMB_SOLANA_PUBLIC_KEY : null
        );
        const chainKey = getChainKeySafe();
        return { connected: !!connected, address: address || undefined, chainKey };
      } catch (_) {
        return { connected: false, chainKey: 'bsc' };
      }
    },

    async getBalances({ chainKey, address, symbols }) {
      try {
        if (!symbols || !symbols.length || !address) return null;

        // Service maison prioritaire s'il existe
        try {
          const svc = window.BoomboxAdapters && window.BoomboxAdapters.balances;
          if (svc && typeof svc.get === 'function') {
            const r = await svc.get(chainKey, symbols, address);
            if (r) return r;
          }
        } catch (_) {}

        await throttleWait(600);

        const native = getNativeSymbol(chainKey);
        const out = {};
        for (let i = 0; i < symbols.length; i++) {
          const sym = symbols[i];
          if (!sym) continue;
          if (chainKey !== 'solana' && sym === native) {
            const v = await evmGetNativeBalance(address);
            out[sym] = v || PLACEHOLDER;
          } else {
            // Sans mapping adresse ERC20 fiable, on renvoie placeholder
            out[sym] = PLACEHOLDER;
          }
        }
        return out;
      } catch (_) {
        return null;
      }
    },

    async quote({ chainKey, from, to, amount, slippagePct }) {
      try {
        const amt = Number(amount || '0');
        if (!from || !to || !(amt > 0)) {
          return { price: PLACEHOLDER, minReceived: PLACEHOLDER };
        }
        // 1) Service quote direct
        try {
          const svc = window.BoomboxPriceService;
          if (svc && typeof svc.quote === 'function') {
            const q = await svc.quote({ chainKey, from, to, amount: amt, slippagePct });
            if (q && q.price != null && q.minReceived != null) return q;
          }
        } catch (_) {}

        // 2) Fallback ratio si deux prix unitaires dispos (meilleur-effort)
        async function getUnitPrice(sym) {
          try {
            const svc = window.BoomboxPriceService;
            if (svc && typeof svc.getPrice === 'function') {
              const p = await svc.getPrice(chainKey, sym);
              if (p && typeof p.price === 'number' && isFinite(p.price)) {
                return p.price;
              }
            }
            // Ultime fallback: prix natif seulement
            const native = getNativeSymbol(chainKey);
            if (svc && typeof svc.fetchNativePrice === 'function' && sym === native) {
              const p = await svc.fetchNativePrice(chainKey);
              if (p && typeof p.price === 'number' && isFinite(p.price)) {
                return p.price;
              }
            }
          } catch (_) {}
          return null;
        }

        const pFrom = await getUnitPrice(from);
        const pTo = await getUnitPrice(to);
        if (pFrom != null && pTo != null && pFrom > 0) {
          const price = pTo / pFrom;
          const min = amt * price * (1 - (Number(slippagePct || 0) / 100));
          return {
            price: String(price),
            minReceived: String(min),
            fees: PLACEHOLDER
          };
        }

        // 3) Pas de données
        return { price: PLACEHOLDER, minReceived: PLACEHOLDER };
      } catch (_) {
        return { price: PLACEHOLDER, minReceived: PLACEHOLDER };
      }
    }
  };

  if (!window.SwapV2Adapters) {
    window.SwapV2Adapters = Adapters;
  }
})();


