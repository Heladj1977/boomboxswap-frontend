(function () {
  const NS = 'WC_FALLBACK';
  function log(level, msg, data) {
    const fn = console[level] || console.log;
    fn.call(console, `[${NS}] ${msg}`, data || '');
  }

  function ensureFallbackAfterDelay() {
    setTimeout(() => {
      try {
        if (window.WalletConnectEthereumProvider) return;
        log('warn', 'ESM non disponible, chargement fallback Web3Modal');
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@web3modal/standalone@2.4.3/dist/index.js';
        script.onload = () => {
          log('log', 'Web3Modal standalone chargé');
          window.WalletConnectEthereumProvider = {
            init: async (config) => {
              log('log', 'Init WalletConnect via Web3Modal...');
              const modal = new window.Web3Modal.WalletConnectModal({
                projectId: config.projectId,
                chains: config.chains
              });
              return {
                enable: async () => {
                  log('log', 'Ouverture WalletConnect modal...');
                  return await modal.openModal();
                },
                on: () => {},
                removeListener: () => {},
                disconnect: async () => {
                  await modal.closeModal();
                }
              };
            }
          };
          window.dispatchEvent(new CustomEvent('walletconnect-loaded'));
        };
        document.head.appendChild(script);
      } catch (e) {
        log('warn', 'Fallback Web3Modal échoué', e);
      }
    }, 3000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureFallbackAfterDelay);
  } else {
    ensureFallbackAfterDelay();
  }
})();


