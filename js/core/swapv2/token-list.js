export class TokenListManager {
  constructor({ apiClient, ttlMs = 5*60*1000 }) {
    this.apiClient = apiClient; 
    this.cache = new Map(); 
    this.lastUpdate = 0; 
    this.ttlMs = ttlMs;
  }
  
  async load(chainKey) {
    try {
      // 1) Config globale éventuelle
      const cfg = (window.BoomboxConfig && window.BoomboxConfig.tokens && window.BoomboxConfig.tokens[chainKey]) || null;
      if (Array.isArray(cfg) && cfg.length) {
        this.cache.set(chainKey, cfg);
        this.lastUpdate = Date.now();
        console.log('[TOKEN_LIST] Loaded from BoomboxConfig', { chainKey, count: cfg.length });
        return cfg;
      }
      
      // 2) Via ApiClient centralisé
      try {
        const list = await this.apiClient.getTokenList(chainKey);
        if (Array.isArray(list) && list.length) {
          this.cache.set(chainKey, list);
          this.lastUpdate = Date.now();
          console.log('[TOKEN_LIST] Loaded via ApiClient', { chainKey, count: list.length });
          return list;
        }
      } catch (error) {
        console.warn('[TOKEN_LIST] ApiClient failed, using whitelist fallback', { chainKey, error });
      }
      
      // 3) Fallback symbol-only depuis whitelist
      const wl = this._getWhitelistForChain(chainKey) || [];
      const fallbackList = wl.map(sym => ({ symbol: sym }));
      this.cache.set(chainKey, fallbackList);
      this.lastUpdate = Date.now();
      console.log('[TOKEN_LIST] Loaded from whitelist fallback', { chainKey, count: fallbackList.length });
      return fallbackList;
    } catch (e) {
      console.error('[TOKEN_LIST] Load failed', e);
      return [];
    }
  }
  
  _getWhitelistForChain(chainKey) {
    const TOKENS_BY_CHAIN = {
      bsc: ['BNB', 'USDT', 'USDC', 'CAKE'],
      arbitrum: ['ETH', 'WETH', 'USDT', 'USDC', 'CAKE'],
      solana: ['SOL', 'USDC', 'USDT', 'CAKE']
    };
    return TOKENS_BY_CHAIN[chainKey] || [];
  }
  
  validate(/*symbol*/) {
    /* TODO: uppercase/format validation */
  }
  
  getCached(/*symbol*/) {
    /* TODO: cache lookup + fallback */
  }
  
  isCacheFresh() { 
    return Date.now() - this.lastUpdate < this.ttlMs; 
  }
  
  clear() { 
    this.cache.clear(); 
  }
}
