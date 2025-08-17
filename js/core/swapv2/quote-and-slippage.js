/* BOOMBOXSWAP - Quote & Slippage Manager (P2.LOT2.LOT2) */

export class QuoteAndSlippageManager {
  constructor({ apiClient, eventBus }) {
    this.apiClient = apiClient;
    this.eventBus = eventBus;
    this.cache = new Map();
    this.lastUpdate = 0;
    this.ttlMs = 30 * 1000; // 30 secondes pour les quotes
  }

  async getQuote({ chainKey, fromToken, toToken, amountIn, slippagePct }) {
    try {
      // Validation slippage avant appel API
      if (!this.validateSlippage(slippagePct)) {
        throw new Error(`Slippage invalide: ${slippagePct}% (bornes: 0.1% - 50%)`);
      }
      
      // Appel API centralisé via BoomboxAPI
      const quote = await this.apiClient.getQuote({
        chainKey, fromToken, toToken, amountIn, slippagePct
      });
      
      if (!quote || !quote.amountOut) {
        throw new Error('Quote invalide reçue de l\'API');
      }
      
      // Calcul amountOutMin avec le slippage (BigInt pour précision)
      const amountOutMin = this.calculateMinOut({ 
        amountOut: quote.amountOut, 
        slippagePct 
      });
      
      return { ...quote, amountOutMin };
    } catch (e) {
      console.error('[SWAP_V2][QUOTE] getQuote failed', e);
      throw e;
    }
  }

  calculateMinOut({ amountOut, slippagePct }) {
    try {
      // Validation slippage avant calcul
      if (!this.validateSlippage(slippagePct)) {
        throw new Error(`Slippage invalide pour calcul: ${slippagePct}%`);
      }
      
      // Calcul précis avec BigInt (comme dans swap-v2-adapters.js)
      // Conversion en basis points pour éviter les erreurs de précision
      const slippageBps = Math.round(slippagePct * 100); // 0.5% → 50 bps
      const amountOutBigInt = BigInt(amountOut.toString());
      const baseBps = BigInt(10000);
      
      // amountOutMin = amountOut * (1 - slippagePct/100)
      // = amountOut * (10000 - slippageBps) / 10000
      const amountOutMinBigInt = (amountOutBigInt * (baseBps - BigInt(slippageBps))) / baseBps;
      
      console.log('[SWAP_V2][QUOTE] amountOutMin calculé', { 
        amountOut, slippagePct, slippageBps, amountOutMin: amountOutMinBigInt.toString() 
      });
      
      return amountOutMinBigInt.toString(); // Retour en string pour compatibilité
    } catch (e) {
      console.error('[SWAP_V2][QUOTE] calculateMinOut failed', e);
      throw e;
    }
  }

  validateSlippage(slippagePct) {
    try {
      // Bornes strictes : 0.1% ≤ slippagePct ≤ 50%
      const minSlippage = 0.1;
      const maxSlippage = 50;
      
      if (typeof slippagePct !== 'number' || isNaN(slippagePct)) {
        throw new Error(`Slippage doit être un nombre valide, reçu: ${slippagePct}`);
      }
      
      if (slippagePct < minSlippage || slippagePct > maxSlippage) {
        throw new Error(`Slippage ${slippagePct}% hors bornes [${minSlippage}% - ${maxSlippage}%]`);
      }
      
      return true;
    } catch (e) {
      console.error('[SWAP_V2][QUOTE] validateSlippage failed', e);
      return false;
    }
  }

  isCacheFresh() {
    return Date.now() - this.lastUpdate < this.ttlMs;
  }

  clear() {
    this.cache.clear();
  }
}
