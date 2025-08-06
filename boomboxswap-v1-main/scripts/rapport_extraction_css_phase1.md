# RAPPORT EXTRACTION CSS PHASE 1

## 📊 STATISTIQUES GÉNÉRALES

- **Règles CSS inline totales**: 140
- **Doublons identifiés**: 39
- **Sélecteurs uniques**: 88

## 📋 PLAN D'EXTRACTION

### 📤 À DÉPLACER VERS EXTERNE
- `#1a2332;
            --secondary-bg: #2a3342;
            --accent-blue: #4a90e2;
            --accent-green: #00ff88;
            --accent-red: #ff4757;
            --text-primary: #ffffff;
            --text-secondary: #b8c5d6;
            --border-color: #3a4a5a;
        }

        *`
- `.6;
            min-height: 100vh;
        }

        /* Header */
        .glass-header`
- `.logo-section`
- `.logo-icon`
- `.logo-text`
- `.logo-title`
- `.logo-subtitle`
- `.metamask-btn-disconnected`
- `.metamask-btn-disconnected:hover`
- `.dot-navigation`
- `.nav-dot`
- `.nav-dot.active`
- `.smart-card.top-row`
- `.smart-card.top-row:nth-child(3)`
- `.smart-card.top-row:nth-child(2)`
- `.smart-card.bottom-row`
- `.bottom-row .deposit-input-section`
- `.bottom-row .estimation-section`
- `.bottom-row .estimation-grid`
- `.bottom-row .music-container`
- `.music-btn-primary`
- `.music-btn-primary:hover`
- `.music-btn-nav`
- `.music-btn-nav:hover`
- `.music-btn-secondary`
- `.music-btn-secondary:hover`
- `.bottom-row .swap-content`
- `.bottom-row .swap-triangle`
- `.smart-card:hover`
- `.smart-card.top-row:hover`
- `.crypto-logo`
- `.balance-divider`
- `.balance-total`
- `.total-label`
- `.total-value`
- `.earnings-content`
- `.earnings-item`
- `.earnings-item:last-child`
- `.earnings-label`
- `.earnings-value`
- `.earnings-total-item`
- `.earnings-total-value`
- `.earnings-divider`
- `.earnings-total`
- `.deposit-input-section`
- `.input-container`
- `.deposit-input`
- `.deposit-input:focus`
- `.input-suffix`
- `.percentage-grid`
- `.percentage-btn`
- `.percentage-btn:hover`
- `.estimation-section`
- `.estimation-title`
- `.estimation-grid`
- `.estimation-item`
- `.estimation-item:last-child`
- `.estimation-label`
- `.estimation-value`
- `.swap-content`
- `.swap-triangle`
- `.swap-arrow`
- `.swap-from, .swap-to`
- `.swap-arrow-icon`
- `.swap-slippage`
- `.slippage-label`
- `.slippage-value`
- `.percentage-grid`
- `.top-row .balance-content,
        .top-row .earnings-content`
- `.top-row .price-content`
- `.top-row .balance-item`
- `.top-row .earnings-item`
- `.top-row .earnings-total-item`
- `.top-row .balance-divider,
        .top-row .earnings-divider`
- `.top-row .balance-total,
        .top-row .earnings-total`
- `.bottom-row .card-header`
- `.05); }
            100%`
- `.wallet-header-btn:hover`
- `#1a2332 !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
    padding: 16px 20px !important;
}

wcm-modal-header h2,
wcm-modal-title,
wcm-header-title`
- `.4 !important;
    margin: 8px 0 !important;
    color: #e5e7eb !important;
}

wcm-tab-button`
- `.85) !important;
}

wcm-modal-container`
- `.1) !important;
    border-radius: 50% !important;
    color: #ffffff !important;
    width: 32px !important;
    height: 32px !important;
}

@media (max-height: 700px)`
- `#3B82F6 !important;
    font-size: 13px !important;
    margin-top: 8px !important;
    text-align: center !important;
    font-weight: normal !important;
}
wcm-connecting-header`
- `.nav-point`
- `.nav-point.active`
- `.glass-header`
- `.glass-header,
.header-container,
.header-center`
- `.smart-card, .main-content, .smart-grid`

### 🔄 À FUSIONNER
- `.header-container`
- `.main-content`
- `.smart-grid`
- `.smart-card`
- `.card-header`
- `.card-title`
- `.card-icon`
- `.balance-content`
- `.balance-item`
- `.balance-label`
- `.balance-value`
- `.price-content`
- `.price-main`
- `.smart-grid`
- `.main-content`
- `.smart-grid`
- `.header-container`
- `.main-content`
- `.smart-grid`
- `.smart-card`
- `.card-title`
- `.price-main`
- `.price-main`
- `.header-container`
- `.header-center`
- `.navigation-dots`
- `.dot`
- `.chain-selector`
- `.chain-options`
- `.dot`

### 🗑️ À SUPPRIMER (DOUBLONS)
- `.music-controls`
- `.balance-item:last-child`
- `.token-logo`
- `.music-controls`
- `.close-btn`
- `.close-btn:hover`
- `.pulse`
- `.price-up`
- `.price-down`
- `.wallet-header-btn`
- `.wallet-header-btn.connected`
- `.wallet-header-btn.disconnected`
- `.header-side`
- `.header-left`
- `.header-right`
- `.dot.active`
- `.chain-selector:hover`
- `.selected-chain`
- `.chain-logo`
- `.chain-name`
- `.chain-option`
- `.chain-option:hover`

### 📌 À GARDER EN INLINE

## 🎯 OBJECTIFS PHASE 2

1. **Déplacer** tous les sélecteurs uniques vers `boombox.css`
2. **Fusionner** les doublons avec version la plus complète
3. **Supprimer** les doublons redondants
4. **Valider** que toutes les fonctionnalités sont préservées
