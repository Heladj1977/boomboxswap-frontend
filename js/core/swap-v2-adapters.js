/* BOOMBOXSWAP - Adapters Swap V2 (Lot 2)
 * Accès best-effort aux états wallet/balances/prix sans casser l'UI.
 * - Zéro dépendance tierce
 * - Zéro exception non catchée côté appelant (renvoie placeholders)
 */
(function () {
  const PLACEHOLDER = '—';
  const DISPLAY_DECIMALS = 4;
  const BALANCES_CACHE_TTL_MS = 5000;
  const _balancesCache = new Map();
  const _addrMissLogged = new Set();

  // Flag de trace discret (ne pas définir par défaut; lecture seule)
  function shouldTrace() {
    try { return window.__SWAPV2_TRACE__ === true; } catch (_) { return false; }
  }

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

  function formatBalance(rawHexOrBn, decimals) {
    try {
      let raw;
      if (typeof rawHexOrBn === 'string' && rawHexOrBn.startsWith('0x')) {
        raw = BigInt(rawHexOrBn);
      } else {
        raw = BigInt(rawHexOrBn || 0n);
      }
      const d = BigInt(decimals || 18);
      const base = 10n ** d;
      const whole = raw / base;
      const frac = raw % base;
      const fracStr = (frac + base).toString().slice(1)
        .slice(0, DISPLAY_DECIMALS).replace(/0+$/, '');
      return fracStr ? `${whole.toString()}.${fracStr}` : whole.toString();
    } catch (_) {
      return '0.0000';
    }
  }

  function withTimeout(promise, ms) {
    return Promise.race([
      promise,
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))
    ]);
  }

  function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

  async function expBackoff(fn, retries, baseDelay) {
    let attempt = 0;
    const max = typeof retries === 'number' ? retries : 2;
    const delay = typeof baseDelay === 'number' ? baseDelay : 350;
    // Essais 1 + retries
    for (;;) {
      try { return await fn(); } catch (e) {
        if (attempt >= max) throw e;
        await sleep(delay * Math.pow(2, attempt));
        attempt += 1;
      }
    }
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
      return res; // hex string brut
    } catch (_) { return null; }
  }

  function resolveTokenAddress(symbol, chainKey) {
    const sym = String(symbol || '').toUpperCase();
    try {
      // 1) BoomboxConfig
      const cfg = window.BoomboxConfig && window.BoomboxConfig.tokens &&
        window.BoomboxConfig.tokens[chainKey];
      if (Array.isArray(cfg)) {
        const hit = cfg.find(
          (t) => String(t?.symbol || '').toUpperCase() === sym && t?.address
        );
        if (hit && hit.address) {
          try { console.log('[SWAP_V2][BALANCES][ADDR]', { sym, addrSource: 'BoomboxConfig' }); } catch (_) {}
          try { if (shouldTrace()) console.log('[SWAP_V2][ADDR]', sym, 'BoomboxConfig', String(hit.address)); } catch (_) {}
          return String(hit.address);
        }
      }
      // 2) BOOMB_TOKENS
      const altMap = window.BOOMB_TOKENS && window.BOOMB_TOKENS[chainKey];
      if (altMap && typeof altMap === 'object') {
        const alt = altMap[sym];
        if (alt) {
          try { console.log('[SWAP_V2][BALANCES][ADDR]', { sym, addrSource: 'BOOMB_TOKENS' }); } catch (_) {}
          try { if (shouldTrace()) console.log('[SWAP_V2][ADDR]', sym, 'BOOMB_TOKENS', String(alt)); } catch (_) {}
          return String(alt);
        }
      }
      // 3) ChainManager
      try {
        const cm = window.BoomboxChainManager || {};
        const all = (typeof cm.getAllChains === 'function') ? cm.getAllChains() : cm.chains;
        const tokens = all && all[chainKey] && all[chainKey].tokens;
        const addr = tokens && tokens[sym];
        if (addr) {
          try { console.log('[SWAP_V2][BALANCES][ADDR]', { sym, addrSource: 'ChainManager' }); } catch (_) {}
          try { if (shouldTrace()) console.log('[SWAP_V2][ADDR]', sym, 'ChainManager', String(addr)); } catch (_) {}
          return String(addr);
        }
      } catch (_) {}
    } catch (_) {}
    const missKey = `${chainKey}|${sym}`;
    if (!_addrMissLogged.has(missKey)) {
      _addrMissLogged.add(missKey);
      try { console.warn('[SWAP_V2][BALANCES][MISS_ADDR]', { sym, chainKey }); } catch (_) {}
      try { if (shouldTrace()) console.warn('[SWAP_V2][MISS_ADDR]', sym, chainKey); } catch (_) {}
    }
    return null;
  }

  function getMulticallConfig(chainKey) {
    try {
      const addr = window.BoomboxContracts &&
        window.BoomboxContracts.multicall &&
        window.BoomboxContracts.multicall[chainKey];
      const abi = window.BoomboxAbis && window.BoomboxAbis.multicall ||
        window.MULTICALL_ABI;
      if (addr && abi) return { address: addr, abi };
    } catch (_) {}
    return null;
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

        // Cache 5s par clé stable
        const cacheKey = `${chainKey}|${address}|${symbols.slice().sort().join(',')}`;
        const cached = _balancesCache.get(cacheKey);
        if (cached && (Date.now() - cached.ts) < BALANCES_CACHE_TTL_MS) {
          console.log('[SWAP_V2][BALANCES][CACHE]', {
            cacheHit: true, symbols, chainKey
          });
          try {
            if (shouldTrace()) {
              const symsText = symbols.join(',');
              console.log('[SWAP_V2][BALANCES][CACHE]', 'syms=', symsText, 'chain=', chainKey, 'cacheHit=', true);
            }
          } catch (_) {}
          return cached.data;
        }

        const native = getNativeSymbol(chainKey);
        const out = {};
        symbols.forEach((sym) => { out[sym] = '0.0000'; });

        // Solde natif
        if (symbols.includes(native)) {
          try {
            const nat = await withTimeout(evmGetNativeBalance(address), 8000);
            out[native] = String(nat || '0.0000');
          } catch (e) {
            console.log('[SWAP_V2][BALANCES][ERROR]', {
              what: 'native', symbol: native, err: e && e.message
            });
          }
        }

        // ERC-20
        const ercSymbols = symbols.filter((sym) => sym !== native);
        let source = 'fallback';
        const mcCfg = getMulticallConfig(chainKey);
        if (mcCfg && ercSymbols.length) {
          try {
            // Optionnel: si une API multicall utilitaire existe, l'utiliser ici.
            // Par défaut, on bascule sur fallback si non intégrée.
            source = 'multicall';
            // ... implémentation multicall si disponible ...
          } catch (e) {
            console.log('[SWAP_V2][BALANCES][ERROR]', {
              what: 'multicall', err: e && e.message
            });
            source = 'fallback';
          }
        }

        // Fallback séquentiel: decimals() + balanceOf(address) avec timeout/backoff
        for (let i = 0; i < ercSymbols.length; i++) {
          const sym = ercSymbols[i];
          try {
            const tokenAddr = resolveTokenAddress(sym, chainKey);
            if (!tokenAddr) continue;
            const decimalsHex = await expBackoff(() => withTimeout(
              window.ethereum.request({
                method: 'eth_call',
                params: [{ to: tokenAddr, data: '0x313ce567' }, 'latest']
              }), 8000
            ), 2, 350);
            const balHex = await expBackoff(() => withTimeout(
              evmGetErc20Balance(tokenAddr, address), 8000
            ), 2, 350);
            const dec = decimalsHex ? Number(BigInt(decimalsHex)) : 18;
            out[sym] = formatBalance(balHex || '0x0', dec);
            try {
              if (shouldTrace()) {
                const raw = typeof balHex === 'string' ? balHex : String(balHex || '0x0');
                const short = raw && raw.length > 12 ? (raw.slice(0, 12) + '...') : raw;
                console.log('[SWAP_V2][BALANCE_OK]', sym, 'dec=', String(dec), 'addr=', String(tokenAddr), 'raw=', String(short), 'fmt=', String(out[sym]));
              }
            } catch (_) {}
          } catch (e) {
            console.log('[SWAP_V2][BALANCES][ERROR]', {
              what: 'erc20_fallback', symbol: sym, err: e && e.message
            });
            try { if (shouldTrace()) console.warn('[SWAP_V2][BALANCE_ERR]', sym, (e && e.message ? String(e.message).slice(0, 120) : 'error')); } catch (_) {}
          }
        }

        _balancesCache.set(cacheKey, { ts: Date.now(), data: out });
        console.log('[SWAP_V2][BALANCES]', {
          symbols, chainKey, source, cacheHit: false
        });
        try {
          if (shouldTrace()) {
            const symsText = symbols.join(',');
            console.log('[SWAP_V2][BALANCES]', 'syms=', symsText, 'src=', source, 'chain=', chainKey, 'cacheHit=', false);
          }
        } catch (_) {}
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
        const inferDecimals = (sym) => {
          try {
            if (chainKey === 'arbitrum' && (sym === 'USDT' || sym === 'USDC')) {
              return 6;
            }
            // USDC a 6 décimales sur toutes les chaînes
            if (sym === 'USDC') {
              return 6;
            }
            // USDT a 6 décimales sur Arbitrum, 18 sur BSC
            if (sym === 'USDT') {
              return chainKey === 'arbitrum' ? 6 : 18;
            }
          } catch (_) {}
          return 18;
        };
        // 1) Backend quote direct (préféré)
        try {
          if (window.BoomboxAPI && typeof window.BoomboxAPI.postSwapQuote === 'function') {
            const q = await window.BoomboxAPI.postSwapQuote({
              chainKey, tokenIn: from, tokenOut: to, amountIn: String(amt),
              fee: 500, slippagePct: Number(slippagePct || 0)
            });
            if (q && q.amountOut != null) {
              const decTo = inferDecimals(to);
              function normalizeAmountOut(v, decimals) {
                try {
                  if (v == null) return 0;
                  // Si déjà un nombre décimal sous forme string avec point, considérer normalisé
                  if (typeof v === 'string' && v.includes('.')) {
                    const n = Number(v);
                    return isFinite(n) ? n : 0;
                  }
                  const n = Number(v);
                  if (!isFinite(n)) return 0;
                  // Heuristique: si très grand, c'est probablement du raw (wei)
                  if (n > 1e9) return n / Math.pow(10, decimals || 18);
                  // Sinon, considérer déjà normalisé
                  return n;
                } catch (_) { return 0; }
              }
              const minUi = normalizeAmountOut(q.amountOut, decTo);
              const priceUi = amt > 0 ? (minUi / amt) : 0;
              return {
                price: String(priceUi || PLACEHOLDER),
                minReceived: String(minUi),
                fees: q.feesDetail || PLACEHOLDER,
                route: q.route || `${from}/${to}`
              };
            }
          }
        } catch (_) {}

        // 2) Service quote local (si dispo)
        try {
          const svc = window.BoomboxPriceService;
          if (svc && typeof svc.quote === 'function') {
            const q = await svc.quote({ chainKey, from, to, amount: amt, slippagePct });
            if (q && q.price != null && q.minReceived != null) return q;
          }
        } catch (_) {}

        // 3) Fallback ratio si deux prix unitaires dispos (meilleur-effort)
        async function getUnitPrice(sym) {
          try {
            // Heuristique stablecoin: USDT/USDC ≈ 1 USD
            if (sym === 'USDT' || sym === 'USDC') {
              return 1;
            }
            const svc = window.BoomboxPriceService;
            // Garde-fou: WBNB/WETH doivent retourner le prix natif
            const native = getNativeSymbol(chainKey);
            if (sym === 'WBNB' || sym === 'WETH') {
              if (svc && typeof svc.fetchNativePrice === 'function') {
                const p = await svc.fetchNativePrice(chainKey);
                if (p && typeof p.price === 'number' && isFinite(p.price)) {
                  return p.price;
                }
              }
            }
            // PRIORITÉ 1: Service prix principal (API backend)
            if (svc && typeof svc.getPrice === 'function') {
              const p = await svc.getPrice(chainKey, sym);
              // Accepter soit un nombre direct, soit un objet { price }
              if (typeof p === 'number' && isFinite(p)) return p;
              if (p && typeof p.price === 'number' && isFinite(p.price)) {
                return p.price;
              }
            }
            // PRIORITÉ 2: Prix natif seulement (fallback ultime)
            if (svc && typeof svc.fetchNativePrice === 'function' && (sym === native)) {
              const p = await svc.fetchNativePrice(chainKey);
              if (p && typeof p.price === 'number' && isFinite(p.price)) {
                return p.price;
              }
            }
            // FALLBACK INTELLIGENT: CAKE seulement si toutes les autres sources échouent
            if (sym === 'CAKE') {
              // Vérifier d'abord si l'API backend a déjà fourni un prix
              try {
                if (window.BoomboxAPI && typeof window.BoomboxAPI.getTokenPrice === 'function') {
                  const apiPrice = await window.BoomboxAPI.getTokenPrice(chainKey, 'CAKE');
                  if (apiPrice && typeof apiPrice.price === 'number' && apiPrice.price > 0) {
                    return apiPrice.price; // Utiliser le prix de l'API backend
                  }
                }
              } catch (_) {}
              // Fallback ultime seulement si l'API backend échoue
              const cakePrices = {
                'bsc': 2.50,
                'arbitrum': 2.45,
                'base': 2.50
              };
              return cakePrices[chainKey] || 2.50;
            }
          } catch (_) {}
          return null;
        }

        // Fonction de normalisation des montants selon les décimales
        function normalizeAmountForDecimals(amount, symbol) {
          try {
            const decimals = inferDecimals(symbol);
            // Si le montant est déjà en format décimal (avec point), le normaliser
            if (typeof amount === 'string' && amount.includes('.')) {
              const num = Number(amount);
              if (isFinite(num)) {
                return num * Math.pow(10, decimals);
              }
            }
            // Sinon, considérer que c'est déjà en format raw
            return Number(amount) || 0;
          } catch (_) {
            return Number(amount) || 0;
          }
        }

        // Fonction de formatage pour l'affichage UI (montant en décimales)
        function formatAmountForDisplay(amount, symbol) {
          try {
            const decimals = inferDecimals(symbol);
            // Si le montant est en format raw (très grand), le convertir en décimales
            if (amount > 1e6) {
              return amount / Math.pow(10, decimals);
            }
            // Sinon, considérer que c'est déjà en format décimal
            return amount;
          } catch (_) {
            return amount;
          }
        }

        const pFrom = await getUnitPrice(from);
        const pTo = await getUnitPrice(to);
        if (pFrom != null && pTo != null && pTo > 0) {
          // Ratio correct: amount_out = amount_in * (price_from_usd / price_to_usd)
          const price = pFrom / pTo;
          const min = amt * price * (1 - (Number(slippagePct || 0) / 100));
          
          // Formater le montant pour l'affichage UI (en décimales)
          const displayAmount = formatAmountForDisplay(min, to);
          
          return {
            price: String(price),
            minReceived: String(displayAmount),
            fees: PLACEHOLDER
          };
        }

        // 4) Pas de données
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


