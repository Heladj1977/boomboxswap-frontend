/**
 * BOOMBOXSWAP V1 - Refactor Guard (Garde-fou de refactoring)
 * Objectif: Verrouiller un contrat UI minimal pour éviter les régressions
 * lors des refactorings. Aucune dépendance. Non intrusif.
 */

(function () {
  const NAMESPACE = 'REFRACTOR_GUARD';

  function log(level, message, data) {
    if (window.BoomboxLogger && window.BoomboxLogger[level]) {
      window.BoomboxLogger[level](`[${NAMESPACE}] ${message}`, data || '');
    } else {
      // Fallback console
      const fn = console[level] || console.log;
      fn.call(console, `[${NAMESPACE}] ${message}`, data || '');
    }
  }

  function showError(message) {
    if (window.showError) {
      window.showError(message, 4000);
    } else {
      console.error(`[${NAMESPACE}] ${message}`);
    }
  }

  // Contrat UI minimal à préserver
  // Ces sélecteurs doivent exister pour garantir que l'interface vitale
  // (header, prix, portefeuille, modal wallet) reste fonctionnelle.
  const REQUIRED_SELECTORS = [
    // Header & navigation
    '#wallet-btn',
    '.navigation-dots .nav-dot',
    '.chain-selector .selected-chain',

    // Prix temps réel (Card 2)
    '#bnbPrice',

    // Portefeuille (Card 1)
    '#balance-bnb',
    '#balance-usdt',
    '#balance-cake',
    '#total-value',

    // Modal wallet
    '#walletModal',
    '.wallet-logos-options',
    '#connect-metamask',
    '#connect-walletconnect'
  ];

  function queryAll(sel) {
    try {
      return document.querySelectorAll(sel);
    } catch (e) {
      return [];
    }
  }

  function validateSelectors() {
    const missing = [];
    for (const sel of REQUIRED_SELECTORS) {
      const nodes = queryAll(sel);
      if (!nodes || nodes.length === 0) {
        missing.push(sel);
      }
    }
    return missing;
  }

  function validateCriticalText() {
    // Vérifications légères de texte/structure non bloquantes
    const issues = [];

    const walletBtnText = document.getElementById('wallet-btn-text');
    if (walletBtnText && walletBtnText.textContent.trim().length === 0) {
      issues.push('Texte bouton wallet vide');
    }

    return issues;
  }

  function runGuard() {
    const missing = validateSelectors();
    if (missing.length > 0) {
      const msg = 'Contrat UI rompu: sélecteurs manquants\n' +
        missing.map((m) => `- ${m}`).join('\n');
      log('error', msg);
      showError('ATTENTION: Contrat UI rompu. Voir console.');
    } else {
      log('info', 'Contrat UI valide');
    }

    const softIssues = validateCriticalText();
    if (softIssues.length > 0) {
      log('warn', 'Anomalies texte non bloquantes', softIssues);
    }

    // Détection mélange HTML/CSS/JS (avertissements non bloquants)
    detectMixedConcerns();
  }

  function installMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      // Regarde seulement les changements structurels majeurs
      let shouldRecheck = false;
      for (const m of mutations) {
        if (m.type === 'childList' || m.type === 'attributes') {
          shouldRecheck = true;
          break;
        }
      }
      if (shouldRecheck) {
        runGuard();
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['id', 'class']
    });

    log('debug', 'MutationObserver activé');
  }

  // Avertissements contre le mélange HTML/CSS/JS (inline)
  function detectMixedConcerns() {
    try {
      // Scripts inline (balises <script> sans src)
      const inlineScripts = Array.from(
        document.querySelectorAll('script:not([src])')
      );

      // Balises <style>
      const styleTags = Array.from(document.querySelectorAll('style'));

      // Attributs style inline
      const inlineStyles = Array.from(document.querySelectorAll('[style]'));

      // Handlers inline (liste restreinte suffisante)
      const handlerSelectors = [
        '[onclick]', '[onchange]', '[oninput]', '[onsubmit]',
        '[onmouseover]', '[onmouseout]', '[onkeydown]', '[onkeyup]'
      ];
      const inlineHandlers = handlerSelectors
        .flatMap(sel => Array.from(document.querySelectorAll(sel)));

      const issues = [];
      if (inlineScripts.length > 0) {
        issues.push({ type: 'scripts_inline', count: inlineScripts.length });
      }
      if (styleTags.length > 0) {
        issues.push({ type: 'balises_style', count: styleTags.length });
      }
      if (inlineStyles.length > 0) {
        issues.push({ type: 'attributs_style', count: inlineStyles.length });
      }
      if (inlineHandlers.length > 0) {
        issues.push({ type: 'handlers_inline', count: inlineHandlers.length });
      }

      if (issues.length > 0) {
        log('warn', 'Mélange HTML/CSS/JS détecté (inline)', issues);
      }
    } catch (e) {
      log('warn', 'Détection mélange HTML/CSS/JS échouée', String(e));
    }
  }

  function init() {
    if (window.BOOMBOX_INIT_CONTROL &&
        !window.BOOMBOX_INIT_CONTROL.canInitialize('refactorGuard')) {
      return;
    }

    runGuard();
    installMutationObserver();

    if (window.BOOMBOX_INIT_CONTROL) {
      window.BOOMBOX_INIT_CONTROL.setInitialized('refactorGuard');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


