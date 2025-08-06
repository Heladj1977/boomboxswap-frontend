/**
 * BOOMBOXSWAP V1 - Diagnostic Unifié
 * Fusion de test-init.js et debug-init.js
 * Vérification complète de l'initialisation et diagnostic en temps réel
 */

// Mode debug conditionnel
window.BOOMBOX_DEBUG_MODE = window.location.search.includes('debug=true') || 
                           window.location.hostname === 'localhost';

class DiagnosticManager {
    constructor() {
        this.priceUpdateCount = 0;
        this.setAllCardsToZeroCount = 0;
        this.startTime = Date.now();
        this.init();
    }

    /**
     * Initialiser le diagnostic
     */
    init() {
        if (!window.BOOMBOX_DEBUG_MODE) {
            return; // Pas de diagnostic en production
        }

        console.log('🔍 DIAGNOSTIC BOOMBOXSWAP - DÉBUT');
        this.checkInitialState();
        this.setupMonitoring();
        this.scheduleReports();
    }

    /**
     * Vérifier l'état initial
     */
    checkInitialState() {
        // 1. État du DOM
        console.log('📊 État DOM:', document.readyState);
        console.log('📊 Nombre de cards trouvées:', document.querySelectorAll('.smart-card').length);

        // 2. Styles des cards
        const cards = document.querySelectorAll('.smart-card');
        cards.forEach((card, index) => {
            const computedStyle = window.getComputedStyle(card);
            console.log(`🎴 Card ${index + 1}:`, {
                opacity: computedStyle.opacity,
                visibility: computedStyle.visibility,
                display: computedStyle.display,
                transform: computedStyle.transform
            });
        });

        // 3. Éléments de prix
        const priceElements = document.querySelectorAll('#bnbPrice, .price-main');
        console.log('💰 Éléments prix trouvés:', priceElements.length);
        priceElements.forEach((el, index) => {
            console.log(`💰 Prix ${index + 1}:`, {
                text: el.textContent,
                opacity: window.getComputedStyle(el).opacity,
                visibility: window.getComputedStyle(el).visibility
            });
        });

        // 4. Système de contrôle
        if (window.BOOMBOX_INIT_CONTROL) {
            console.log('✅ Système de contrôle disponible');
            console.log('🏁 Flags d\'initialisation:', window.BOOMBOX_INIT_CONTROL.getStatus());
        } else {
            console.error('❌ Système de contrôle manquant');
        }

        // 5. Composants principaux
        const components = {
            'BoomboxAPI': window.BoomboxAPI,
            'BoomboxApp': window.BoomboxApp,
            'showNotification': typeof window.showNotification,
            'NotificationManager': window.NotificationManager
        };

        Object.entries(components).forEach(([name, component]) => {
            if (component) {
                console.log(`✅ ${name} disponible`);
            } else {
                console.error(`❌ ${name} manquant`);
            }
        });

        // 6. Éléments DOM critiques
        const domElements = [
            'card-portfolio',
            'bnbPrice',
            'wallet-btn',
            'chain-selector',
            'notifications-container'
        ];

        domElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                console.log(`✅ Élément DOM ${id} trouvé`);
            } else {
                console.warn(`⚠️ Élément DOM ${id} manquant`);
            }
        });
    }

    /**
     * Configurer la surveillance
     */
    setupMonitoring() {
        // Surveiller les changements de prix
        if (window.BoomboxApp?.updatePriceDisplay) {
            const originalUpdatePriceDisplay = window.BoomboxApp.updatePriceDisplay;
            window.BoomboxApp.updatePriceDisplay = function(newPrice) {
                this.priceUpdateCount++;
                console.log(`🔄 Mise à jour prix #${this.priceUpdateCount}:`, newPrice);
                return originalUpdatePriceDisplay.call(this, newPrice);
            }.bind(this);
        }

        // Surveiller les appels à setAllCardsToZero
        if (window.setAllCardsToZero) {
            const originalSetAllCardsToZero = window.setAllCardsToZero;
            window.setAllCardsToZero = function() {
                this.setAllCardsToZeroCount++;
                console.log(`🔄 setAllCardsToZero appelé (${this.setAllCardsToZeroCount}x)`);
                return originalSetAllCardsToZero();
            }.bind(this);
        }
    }

    /**
     * Programmer les rapports
     */
    scheduleReports() {
        // Rapport après 3 secondes
        setTimeout(() => {
            this.generateReport('INTERMÉDIAIRE');
        }, 3000);

        // Rapport final après 10 secondes
        setTimeout(() => {
            this.generateReport('FINAL');
        }, 10000);
    }

    /**
     * Générer un rapport de diagnostic
     */
    generateReport(type) {
        console.log(`🔍 DIAGNOSTIC BOOMBOXSWAP - ${type}`);
        console.log('📊 État DOM:', document.readyState);
        console.log('🎴 Cards visibles:', document.querySelectorAll('.smart-card:not([style*="opacity: 0"])').length);
        console.log('💰 Prix mis à jour:', this.priceUpdateCount);
        console.log('🔄 setAllCardsToZero appelé:', this.setAllCardsToZeroCount, 'fois');

        // Vérifier les animations en cours
        const animatedElements = document.querySelectorAll('.smart-card[style*="transition"]');
        console.log('🎬 Éléments animés:', animatedElements.length);

        // Vérifier les intervalles
        if (window.BOOMBOX_INIT_CONTROL?.priceUpdateInterval) {
            console.log('⏰ Intervalles actifs:', 'OUI');
        } else {
            console.log('⏰ Intervalles actifs:', 'NON');
        }

        // Vérifier les performances
        const performance = window.performance;
        if (performance && performance.timing) {
            console.log('⚡ Performance:', {
                domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.domContentLoadedEventStart,
                loadComplete: performance.timing.loadEventEnd - performance.timing.loadEventStart,
                totalTime: Date.now() - this.startTime
            });
        }

        // Vérifier les erreurs
        if (this.priceUpdateCount === 0) {
            console.warn('⚠️ Aucune mise à jour de prix détectée');
        }

        if (this.setAllCardsToZeroCount > 1) {
            console.warn('⚠️ setAllCardsToZero appelé plusieurs fois');
        }

        if (type === 'FINAL') {
            console.log('🔍 DIAGNOSTIC BOOMBOXSWAP - TERMINÉ');
            this.generateSummary();
        }
    }

    /**
     * Générer un résumé final
     */
    generateSummary() {
        const summary = {
            status: 'OK',
            issues: [],
            recommendations: []
        };

        // Vérifications critiques
        if (!window.BOOMBOX_INIT_CONTROL) {
            summary.status = 'ERREUR';
            summary.issues.push('Système de contrôle manquant');
        }

        if (this.setAllCardsToZeroCount > 1) {
            summary.status = 'ATTENTION';
            summary.issues.push('Double initialisation des cards');
        }

        if (this.priceUpdateCount === 0) {
            summary.status = 'ATTENTION';
            summary.issues.push('Aucune mise à jour de prix');
        }

        // Recommandations
        if (summary.issues.length === 0) {
            summary.recommendations.push('Architecture stable - Aucune action requise');
        } else {
            summary.recommendations.push('Vérifier les logs ci-dessus pour détails');
        }

        console.log('📋 RÉSUMÉ DIAGNOSTIC:', summary);
    }

    /**
     * Vérifier les animations flash
     */
    checkFlashAnimations() {
        const cards = document.querySelectorAll('.smart-card');
        let flashDetected = false;
        
        cards.forEach(card => {
            if (card.style.opacity === '0') {
                flashDetected = true;
            }
        });

        if (flashDetected) {
            console.warn('⚠️ Animation flash détectée sur les cards');
            return false;
        } else {
            console.log('✅ Aucune animation flash détectée');
            return true;
        }
    }
}

// Initialiser le diagnostic
window.BoomboxDiagnostic = new DiagnosticManager();

// Fonction utilitaire pour vérifier l'état
window.checkBoomboxStatus = function() {
    if (window.BoomboxDiagnostic) {
        window.BoomboxDiagnostic.generateReport('MANUEL');
    }
};

console.log('🔍 Diagnostic BOOMBOXSWAP configuré'); 