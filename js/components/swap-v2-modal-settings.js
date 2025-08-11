/* BOOMBOXSWAP - Modale Paramètres Swap V2 (Lot 1, UI seulement) */
(function () {
  const ID = 'swapv2-settings-modal';

  function ensureModal() {
    let el = document.getElementById(ID);
    if (el) return el;
    el = document.createElement('div');
    el.id = ID;
    el.className = 'swapv2-modal hidden';
    el.innerHTML = `
      <div class="swapv2-modal-backdrop" data-close="1"></div>
      <div class="swapv2-modal-content" role="dialog" aria-modal="true" aria-labelledby="swapv2-settings-title">
        <h3 id="swapv2-settings-title" class="swapv2-modal-title">Paramètres</h3>
        <div class="swapv2-form-row">
          <label class="swapv2-label">Tolérance de slippage (%)</label>
          <input id="swapv2-slippage" class="swapv2-input" type="number" step="0.1" min="0" value="0.5" />
        </div>
        <div class="swapv2-form-row">
          <label class="swapv2-label">Délai maximum (minutes)</label>
          <input id="swapv2-deadline" class="swapv2-input" type="number" step="1" min="1" value="20" />
        </div>
        <div class="swapv2-modal-actions">
          <button id="swapv2-settings-save" class="swapv2-btn swapv2-btn-primary" type="button">Enregistrer</button>
          <button id="swapv2-settings-cancel" class="swapv2-btn" type="button">Annuler</button>
        </div>
      </div>
    `;
    document.body.appendChild(el);
    return el;
  }

  function show(opts) {
    const el = ensureModal();
    const sl = el.querySelector('#swapv2-slippage');
    const dl = el.querySelector('#swapv2-deadline');
    sl.value = String(opts?.slippagePct ?? 0.5);
    dl.value = String(opts?.deadlineMin ?? 20);
    el.classList.remove('hidden');
    try { document.body.classList.add('modal-open'); } catch (_) {}

    function close() {
      el.classList.add('hidden');
      try { document.body.classList.remove('modal-open'); } catch (_) {}
      cleanup();
    }
    function save() {
      const slVal = Math.max(0, parseFloat(sl.value || '0.5'));
      const dlVal = Math.max(1, parseInt(dl.value || '20', 10));
      try { opts?.onSave?.({ slippagePct: slVal, deadlineMin: dlVal }); } catch (_) {}
      close();
    }
    function cleanup() {
      el.querySelector('[data-close]')?.removeEventListener('click', onBackdrop);
      el.querySelector('#swapv2-settings-save')?.removeEventListener('click', save);
      el.querySelector('#swapv2-settings-cancel')?.removeEventListener('click', close);
    }
    function onBackdrop(e) { if (e?.target?.getAttribute('data-close')) close(); }

    el.querySelector('[data-close]')?.addEventListener('click', onBackdrop);
    el.querySelector('#swapv2-settings-save')?.addEventListener('click', save);
    el.querySelector('#swapv2-settings-cancel')?.addEventListener('click', close);

    // Fermeture ESC
    function onKey(e) { if (e.key === 'Escape') { close(); } }
    document.addEventListener('keydown', onKey, { once: true });
  }

  if (!window.SwapV2SettingsModal) {
    window.SwapV2SettingsModal = { show };
  }
})();


