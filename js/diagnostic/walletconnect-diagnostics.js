(function () {
  function logInitial() {
    console.log('=== VÉRIFICATIONS BOOMSWAP WALLETCONNECT V2 EVENT ===');
    console.log('Web3:', !!window.Web3);
    console.log('WalletConnect EthereumProvider:', !!window.WalletConnectEthereumProvider);
    console.log('WalletConnect Ready:', !!window.BOOMSWAP_WALLETCONNECT_READY);
    console.log('Connect MetaMask function:', !!window.BOOMSWAP_CONNECT_METAMASK);
    console.log('Connect WalletConnect function:', !!window.BOOMSWAP_CONNECT_WALLETCONNECT);
    console.log('Project ID:', window.BOOMSWAP_PROJECT_ID);
  }

  function logDelayed() {
    console.log('=== VÉRIFICATIONS DIFFÉRÉES (10s) ===');
    console.log('WalletConnect EthereumProvider (10s):', !!window.WalletConnectEthereumProvider);
    console.log('WalletConnect Ready (10s):', !!window.BOOMSWAP_WALLETCONNECT_READY);
    if (window.BOOMSWAP_CONNECT_METAMASK && window.BOOMSWAP_CONNECT_WALLETCONNECT) {
      if (window.BOOMSWAP_WALLETCONNECT_READY) {
        console.log('BOOMSWAP WALLET V2 COMPLET!');
        console.log('MetaMask + WalletConnect QR TOUS DISPONIBLES');
      } else {
        console.log('BOOMSWAP WALLET V2 PARTIEL!');
        console.log('MetaMask disponible, WalletConnect en cours...');
      }
      console.log('Réseaux: BSC, Arbitrum, Base');
    } else {
      console.error('Problème initialisation wallet v2');
    }
  }

  function setup() {
    window.addEventListener('load', function () {
      try { logInitial(); } catch (_) {}
      setTimeout(() => { try { logDelayed(); } catch (_) {} }, 10000);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();


