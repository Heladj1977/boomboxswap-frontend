// Charge WalletConnect EthereumProvider via ESM (module dédié)
// Respecte la règle: pas de scripts inline dans le HTML

/* eslint-disable no-undef */
export {};

try {
  // Import ESM distant
  // Note: l'import externe est volontaire pour bénéficier d'une version figée
  // sans injecter de code inline dans le HTML
  const mod = await import(
    'https://esm.sh/@walletconnect/ethereum-provider@2.13.0'
  );
  const { EthereumProvider } = mod;
  // Exposer sur window pour la config appkit
  window.WalletConnectEthereumProvider = EthereumProvider;
  console.log('WalletConnect chargé via ESM:', !!EthereumProvider);
  window.dispatchEvent(new CustomEvent('walletconnect-loaded'));
} catch (e) {
  console.warn('[WALLETCONNECT] ESM import échoué', e);
}


