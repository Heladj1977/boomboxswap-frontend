/**
 * BOOMBOXSWAP V1 - Range Config Controller
 * Gère la configuration du range pour les positions LP.
 */

class BoomboxRangeConfigController {
    constructor() {
        this.currentAmount = null;
        this.init();
    }

    init() {
        this.setupRangeConfig();
        this.loadSavedConfig();
    }

    setupRangeConfig() {
        const presetButtons = document.querySelectorAll('.preset-btn');
        const saveConfigBtn = document.getElementById('save-range-btn');
        const rangeAmount = document.getElementById('custom-range-input');

        // Boutons presets
        presetButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const amount = e.target.dataset.value;
                this.setRangeAmount(amount);
            });
        });

        // Sauvegarder configuration
        if (saveConfigBtn) {
            saveConfigBtn.addEventListener('click', () => {
                this.saveRangeConfig();
            });
        }

        // Input range amount
        if (rangeAmount) {
            rangeAmount.addEventListener('input', (e) => {
                this.updateRangePreview(e.target.value);
            });
        }
    }

    loadSavedConfig() {
        try {
            const savedConfig = localStorage.getItem('boombox_range_config');
            if (savedConfig) {
                this.setRangeAmount(savedConfig);
                console.log('CONFIGURATION RANGE CHARGEE:', savedConfig);
            }
        } catch (error) {
            console.warn('ERREUR CHARGEMENT CONFIG RANGE:', error);
        }
    }

    setRangeAmount(amount) {
        const rangeAmount = document.getElementById('custom-range-input');
        if (rangeAmount) {
            rangeAmount.value = amount;
            this.currentAmount = amount;
            this.updateRangePreview(amount);
        }
    }

    updateRangePreview(amount) {
        const rangeLower = document.getElementById('range-lower');
        const rangeUpper = document.getElementById('range-upper');
        const rangeSpread = document.getElementById('range-spread');
        const currentPricePreview = document.getElementById('current-price-preview');

        if (rangeLower && rangeUpper && rangeSpread && amount) {
            const numAmount = parseFloat(amount);
            const currentPrice = this.getCurrentNativePrice();
            
            if (currentPrice) {
                const min = (currentPrice - numAmount / 2).toFixed(2);
                const max = (currentPrice + numAmount / 2).toFixed(2);

                rangeLower.textContent = `$${min}`;
                rangeUpper.textContent = `$${max}`;
                rangeSpread.textContent = `$${numAmount.toFixed(1)}`;
                
                if (currentPricePreview) {
                    currentPricePreview.textContent = `$${currentPrice.toFixed(2)}`;
                }
            }
        }
    }

    getCurrentNativePrice() {
        // Récupérer le prix natif actuel (BNB/ETH) depuis l'interface
        const priceElement = document.getElementById('bnbPrice');
        if (priceElement) {
            const priceText = priceElement.textContent;
            const priceMatch = priceText.match(/\$([\d.]+)/);
            if (priceMatch) {
                return parseFloat(priceMatch[1]);
            }
        }
        return null;
    }

    saveRangeConfig() {
        const rangeAmount = document.getElementById('custom-range-input');
        if (rangeAmount && rangeAmount.value) {
            const amount = rangeAmount.value;

            // Sauvegarder en localStorage
            localStorage.setItem('boombox_range_config', amount);
            this.currentAmount = amount;

            console.log(`CONFIGURATION RANGE SAUVEGARDEE: $${amount}`);

            // Émettre événement
            if (window.BoomboxEvents) {
                window.BoomboxEvents.emit(window.BoomboxEvents.EVENTS.RANGE_CONFIG_SAVED, {
                    amount: parseFloat(amount),
                    timestamp: new Date().toISOString()
                });
            }

            // Afficher notification de succès
            if (window.showNotification) {
                window.showNotification('CONFIGURATION SAUVEGARDEE', 'success');
            }

            return true;
        }
        return false;
    }

    getCurrentConfig() {
        return {
            amount: this.currentAmount,
            saved: localStorage.getItem('boombox_range_config')
        };
    }

    resetConfig() {
        localStorage.removeItem('boombox_range_config');
        this.currentAmount = null;
        const rangeAmount = document.getElementById('custom-range-input');
        if (rangeAmount) {
            rangeAmount.value = '';
        }
    }

    destroy() {
        // Cleanup si nécessaire
    }
}

// Export global
window.BoomboxRangeConfigController = BoomboxRangeConfigController;
