(function(){
  function setupClose(){
    try {
      const close = document.getElementById('close-walletqr-modal');
      if (!close) return;
      close.addEventListener('click', function(){
        try { if (window.BoomboxWalletQRModal) window.BoomboxWalletQRModal.hide(); } catch(_) {}
      });
    } catch(_) {}
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupClose);
  } else {
    setupClose();
  }
})();

