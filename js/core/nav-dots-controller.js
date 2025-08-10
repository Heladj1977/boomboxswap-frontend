/**
 * BOOMBOXSWAP V1 - Navigation Dots Controller (non-intrusif)
 * Gère l'alternance Dashboard/Range via les points de navigation du header.
 */

(function () {
  function q(sel) { try { return document.querySelector(sel); } catch (_) { return null; } }
  function qa(sel) { try { return document.querySelectorAll(sel); } catch (_) { return []; } }

  function showDashboard() {
    const dash = q('#dashboard-content');
    const range = q('#range-content');
    if (dash && range) {
      dash.style.display = 'block';
      range.style.display = 'none';
    }
  }

  function showRange() {
    const dash = q('#dashboard-content');
    const range = q('#range-content');
    if (dash && range) {
      dash.style.display = 'none';
      range.style.display = 'block';
    }
  }

  function attach() {
    const dots = qa('.navigation-dots .nav-dot');
    if (!dots.length) return;

    // Assigner comportements: 1er = dashboard, 2e = range
    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        dots.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        if (idx === 0) showDashboard(); else showRange();
      });
    });

    // État initial: afficher dashboard
    showDashboard();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attach);
  } else {
    attach();
  }
})();















