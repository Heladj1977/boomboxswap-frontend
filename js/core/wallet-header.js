/**
 * BOOMBOXSWAP - Header Wallet Label Manager
 * Règle de priorité bouton:
 *  - Si currentChain = solana et pubkey Solana présente → "Solana: xxxx…xxxx"
 *  - Sinon si adresse EVM présente → "MetaMask: xxxx…xxxx"
 *  - Sinon → "Connecter Wallet"
 */
(function () {
  function short(text) {
    if (!text) return '';
    try {
      const s = String(text);
      return s.length > 10 ? s.slice(0, 6) + '...' + s.slice(-4) : s;
    } catch (_) { return text; }
  }

  function applyWalletHeader() {
    try {
      const walletBtn = document.getElementById('wallet-btn');
      const walletBtnText = document.getElementById('wallet-btn-text');
      if (!walletBtn || !walletBtnText) return;

      const chain = (window.BoomboxChainManager && typeof window.BoomboxChainManager.getCurrentChain === 'function')
        ? window.BoomboxChainManager.getCurrentChain()
        : null;
      const isSol = !!(chain && chain.type === 'solana');
      const solPk = window.BOOMB_SOLANA_PUBLIC_KEY || null;
      // Persistance adresse EVM
      let evmAddr = window.BOOMSWAP_EVM_ADDRESS || window.BOOMSWAP_CURRENT_ADDRESS || null;
      try {
        if (!evmAddr) {
          const saved = localStorage.getItem('boombox_last_evm_address');
          if (saved) evmAddr = saved;
        } else {
          localStorage.setItem('boombox_last_evm_address', evmAddr);
        }
      } catch (_) {}

      if (isSol) {
        if (solPk) {
          walletBtn.className = 'wallet-header-btn wallet-btn connected';
          walletBtnText.textContent = 'Phantom: ' + short(solPk);
        } else {
          walletBtn.className = 'wallet-header-btn wallet-btn disconnected';
          walletBtnText.textContent = 'Connecter Wallet';
        }
        return;
      }

      // EVM chains
      if (evmAddr) {
        walletBtn.className = 'wallet-header-btn wallet-btn connected';
        walletBtnText.textContent = 'MetaMask: ' + short(evmAddr);
      } else {
        walletBtn.className = 'wallet-header-btn wallet-btn disconnected';
        walletBtnText.textContent = 'Connecter Wallet';
      }
    } catch (_) {}
  }

  window.BOOMB_APPLY_WALLET_HEADER = applyWalletHeader;
})();



