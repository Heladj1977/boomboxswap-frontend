/**
 * BOOMBOXSWAP V1 - Contrôle d'initialisation centralisé
 * Évite les doublons et conflits d'initialisation
 */

// Système de contrôle global
window.BOOMBOX_INIT_CONTROL = {
    // Flags d'initialisation
    appInitialized: false,
    gamingInitialized: false,
    apiInitialized: false,
    walletInitialized: false,
    domReady: false,
    
    // Méthodes de contrôle
    isInitialized(component) {
        return this[component + 'Initialized'] || false;
    },
    
    setInitialized(component) {
        this[component + 'Initialized'] = true;
        console.log(`✅ ${component} initialisé`);
    },
    
    canInitialize(component) {
        if (this.isInitialized(component)) {
            console.log(`⚠️ ${component} déjà initialisé, arrêt...`);
            return false;
        }
        return true;
    },
    
    // Vérification de l'état global
    getStatus() {
        return {
            app: this.appInitialized,
            gaming: this.gamingInitialized,
            api: this.apiInitialized,
            wallet: this.walletInitialized,
            dom: this.domReady
        };
    },
    
    // Log de l'état
    logStatus() {
        const status = this.getStatus();
        console.log('=== ÉTAT INITIALISATION BOOMBOXSWAP ===');
        Object.entries(status).forEach(([key, value]) => {
            console.log(`${key}: ${value ? '✅' : '❌'}`);
        });
        console.log('========================================');
    }
};

// Event listener DOM centralisé
document.addEventListener('DOMContentLoaded', () => {
    window.BOOMBOX_INIT_CONTROL.domReady = true;
    console.log('🌐 DOM prêt pour initialisation');
    window.BOOMBOX_INIT_CONTROL.logStatus();
});

// Fonction utilitaire pour attendre que le DOM soit prêt
window.waitForDOM = function(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
};

console.log('🎛️ Contrôle d\'initialisation BOOMBOXSWAP chargé'); 