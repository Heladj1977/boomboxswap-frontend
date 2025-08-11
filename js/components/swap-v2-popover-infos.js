/* BOOMBOXSWAP - Popover d'Informations (Lot 1, UI seulement) */
(function () {
  const ID = 'swapv2-popover';

  function ensurePopover() {
    let el = document.getElementById(ID);
    if (el) return el;
    el = document.createElement('div');
    el.id = ID;
    el.className = 'swapv2-popover hidden';
    el.innerHTML = `
      <div class="swapv2-popover-content" role="dialog" aria-modal="false">
        <div class="swapv2-pop-row"><div class="swapv2-pop-label">Route</div><div id="swapv2-pop-route" class="swapv2-pop-value">—</div></div>
        <div class="swapv2-pop-row"><div class="swapv2-pop-label">Impact sur le prix</div><div id="swapv2-pop-impact" class="swapv2-pop-value">—</div></div>
        <div class="swapv2-pop-row"><div class="swapv2-pop-label">Durée estimée</div><div id="swapv2-pop-eta" class="swapv2-pop-value">—</div></div>
        <div class="swapv2-pop-row"><div class="swapv2-pop-label">Détail des frais</div><div id="swapv2-pop-fees" class="swapv2-pop-value">—</div></div>
      </div>
    `;
    document.body.appendChild(el);
    return el;
  }

  function position(anchor, box) {
    try {
      const r = anchor.getBoundingClientRect();
      // Positionner au-dessus du bouton pour éviter de sortir de la page
      const boxHeight = box.offsetHeight || 140; // fallback
      const desiredTop = r.top - 6 - boxHeight;
      const top = desiredTop < 0 ? (r.bottom + 6) : desiredTop;
      const left = r.left;
      box.style.top = `${Math.round(Math.max(0, top))}px`;
      box.style.left = `${Math.round(Math.max(0, Math.min(left, window.innerWidth - box.offsetWidth)))}px`;
    } catch (_) {}
  }

  function toggle({ anchor, data }) {
    const el = ensurePopover();
    const wasHidden = el.classList.contains('hidden');
    if (!wasHidden) { el.classList.add('hidden'); return; }
    el.querySelector('#swapv2-pop-route').textContent = data?.route || '—';
    el.querySelector('#swapv2-pop-impact').textContent = data?.priceImpact || '—';
    el.querySelector('#swapv2-pop-eta').textContent = data?.eta || '—';
    el.querySelector('#swapv2-pop-fees').textContent = data?.feesDetail || '—';
    el.classList.remove('hidden');
    position(anchor, el);
    function onDocClick(e) {
      if (!el.contains(e.target) && e.target !== anchor) {
        el.classList.add('hidden');
        document.removeEventListener('click', onDocClick, true);
      }
    }
    setTimeout(() => document.addEventListener('click', onDocClick, true), 0);
  }

  if (!window.SwapV2PopoverInfos) {
    window.SwapV2PopoverInfos = { toggle };
  }
})();


