/* BOOMBOXSWAP - Swap Executor (P2.LOT2.LOT2) */

export class SwapExecutor {
  constructor({ apiClient, eventBus, quoteManager }) {
    this.apiClient = apiClient;
    this.eventBus = eventBus;
    this.quoteManager = quoteManager;
    this.isExecuting = false;
  }

  async executeSwap({ chainKey, fromToken, toToken, amountIn, amountOutMin, deadline }) {
    try {
      // Validation des paramètres d'entrée
      this.validateSwapParams({ chainKey, fromToken, toToken, amountIn, amountOutMin, deadline });
      
      // Gestion d'état : début d'exécution
      this.setExecutingState(true);
      console.log('[SWAP_V2][EXEC] Début executeSwap', { chainKey, fromToken, toToken, amountIn });
      
      // 1. Construction de la transaction
      const tx = await this.buildSwapTransaction({
        chainKey, fromToken, toToken, amountIn, amountOutMin, deadline
      });
      
      if (!tx) {
        throw new Error('Échec construction transaction swap');
      }
      
      // 2. Envoi de la transaction
      const result = await this.sendTransaction(tx);
      
      console.log('[SWAP_V2][EXEC] Swap exécuté avec succès', result);
      return result;
      
    } catch (e) {
      console.error('[SWAP_V2][EXEC] executeSwap failed', e);
      throw e;
    } finally {
      // Gestion d'état : fin d'exécution (succès ou échec)
      this.setExecutingState(false);
    }
  }

  async buildSwapTransaction(params) {
    try {
      // Utilisation de l'API centralisée BoomboxAPI
      const tx = await this.apiClient.buildSwap(params);
      
      if (!tx || typeof tx !== 'object') {
        throw new Error('Transaction invalide reçue de buildSwap');
      }
      
      console.log('[SWAP_V2][EXEC] Transaction construite', { 
        chainKey: params.chainKey, 
        fromToken: params.fromToken,
        toToken: params.toToken 
      });
      
      return tx;
    } catch (e) {
      console.error('[SWAP_V2][EXEC] buildSwapTransaction failed', e);
      throw e;
    }
  }

  async sendTransaction(tx) {
    try {
      // Utilisation de l'adaptateur existant SwapV2Adapters
      if (!window.SwapV2Adapters || typeof window.SwapV2Adapters.sendTransaction !== 'function') {
        throw new Error('Adaptateur SwapV2Adapters.sendTransaction non disponible');
      }
      
      console.log('[SWAP_V2][EXEC] Envoi transaction', { 
        chainKey: tx.chainKey || 'unknown' 
      });
      
      const result = await window.SwapV2Adapters.sendTransaction(tx);
      
      if (!result) {
        throw new Error('Résultat transaction invalide');
      }
      
      console.log('[SWAP_V2][EXEC] Transaction envoyée avec succès', result);
      return result;
      
    } catch (e) {
      console.error('[SWAP_V2][EXEC] sendTransaction failed', e);
      throw e;
    }
  }

  validateSwapParams(params) {
    try {
      const { chainKey, fromToken, toToken, amountIn, amountOutMin, deadline } = params;
       
      // Validation des paramètres obligatoires
      if (!chainKey || !fromToken || !toToken || !amountIn || !amountOutMin) {
        throw new Error('Paramètres manquants pour le swap');
      }
      
      // Validation des types et valeurs
      if (typeof amountIn !== 'string' && typeof amountIn !== 'number') {
        throw new Error('amountIn doit être une chaîne ou un nombre');
      }
      
      if (typeof amountOutMin !== 'string' && typeof amountOutMin !== 'number') {
        throw new Error('amountOutMin doit être une chaîne ou un nombre');
      }
      
      // Validation deadline (défaut 20 min si absent)
      const minDeadline = 1; // 1 minute minimum
      const maxDeadline = 1440; // 24 heures maximum
      const effectiveDeadline = deadline || 20;
      
      if (effectiveDeadline < minDeadline || effectiveDeadline > maxDeadline) {
        throw new Error(`Deadline ${effectiveDeadline} min hors bornes [${minDeadline} - ${maxDeadline}]`);
      }
      
      console.log('[SWAP_V2][EXEC] Paramètres swap validés', { 
        chainKey, fromToken, toToken, amountIn, amountOutMin, effectiveDeadline 
      });
      
      return true;
    } catch (e) {
      console.error('[SWAP_V2][EXEC] validateSwapParams failed', e);
      throw e;
    }
  }

  setExecutingState(/*state*/) {
    this.isExecuting = state;
  }
}
