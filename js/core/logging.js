/**
 * BOOMBOXSWAP V1 - Logging System
 * Système de logging centralisé et professionnel
 */

class BoomboxLogger {
    constructor() {
        this.isEnabled = true;
        this.logLevel = 'info'; // debug, info, warn, error
        // Conformité anti-emoji stricte
        this.prefix = '[BOOMBOX]';
    }

    /**
     * Log de niveau debug
     */
    debug(message, data = null) {
        if (this.isEnabled && this.shouldLog('debug')) {
            console.log(`${this.prefix} [DEBUG] ${message}`, data || '');
        }
    }

    /**
     * Log de niveau info
     */
    info(message, data = null) {
        if (this.isEnabled && this.shouldLog('info')) {
            console.log(`${this.prefix} [INFO] ${message}`, data || '');
        }
    }

    /**
     * Log de niveau warning
     */
    warn(message, data = null) {
        if (this.isEnabled && this.shouldLog('warn')) {
            console.warn(`${this.prefix} [WARN] ${message}`, data || '');
        }
    }

    /**
     * Log de niveau error
     */
    error(message, error = null) {
        if (this.isEnabled && this.shouldLog('error')) {
            console.error(`${this.prefix} [ERROR] ${message}`, error || '');
        }
    }

    /**
     * Vérifier si le niveau de log doit être affiché
     */
    shouldLog(level) {
        const levels = { debug: 0, info: 1, warn: 2, error: 3 };
        return levels[level] >= levels[this.logLevel];
    }

    /**
     * Désactiver les logs
     */
    disable() {
        this.isEnabled = false;
    }

    /**
     * Activer les logs
     */
    enable() {
        this.isEnabled = true;
    }

    /**
     * Définir le niveau de log
     */
    setLogLevel(level) {
        if (['debug', 'info', 'warn', 'error'].includes(level)) {
            this.logLevel = level;
        }
    }
}

// Instance globale du logger
window.BoomboxLogger = new BoomboxLogger();

// Fonctions utilitaires pour compatibilité
window.logDebug = (message, data) => window.BoomboxLogger.debug(message, data);
window.logInfo = (message, data) => window.BoomboxLogger.info(message, data);
window.logWarn = (message, data) => window.BoomboxLogger.warn(message, data);
window.logError = (message, error) => window.BoomboxLogger.error(message, error);

// Log de chargement
window.BoomboxLogger.info('Système de logging BOOMBOXSWAP initialisé'); 

// Garde-fou central: avertir si fetch direct est utilisé hors ApiClient
// (non bloquant, impact minimal)
(function installFetchGuard() {
    try {
        if (window.__boomboxFetchGuardInstalled) return;
        window.__boomboxFetchGuardInstalled = true;

        const originalFetch = window.fetch;
        window.fetch = function(input, init) {
            try {
                const headers = (init && init.headers) || {};
                const isApiClient =
                    headers['X-Boombox-ApiClient'] === '1' ||
                    headers['x-boombox-apiclient'] === '1';
                const isApiCall = typeof input === 'string' && input.includes('/api/');
                if (isApiCall && !isApiClient) {
                    window.BoomboxLogger.warn(
                        'Appel fetch direct détecté. Utiliser ApiClient obligatoire.',
                        { input }
                    );
                }
            } catch (_) { /* no-op */ }
            return originalFetch.apply(this, arguments);
        };
    } catch (e) {
        window.BoomboxLogger.warn('Installation fetch guard échouée', e);
    }
})();