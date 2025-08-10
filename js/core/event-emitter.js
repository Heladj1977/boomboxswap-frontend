/**
 * BOOMBOXSWAP V1 - Event Emitter
 * Système de communication entre composants
 */

class EventEmitter {
    constructor() {
        this.events = {};
        this.onceEvents = {};
    }

    /**
     * Écouter un événement
     * @param {string} event - Nom de l'événement
     * @param {Function} callback - Fonction de callback
     */
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    /**
     * Écouter un événement une seule fois
     * @param {string} event - Nom de l'événement
     * @param {Function} callback - Fonction de callback
     */
    once(event, callback) {
        if (!this.onceEvents[event]) {
            this.onceEvents[event] = [];
        }
        this.onceEvents[event].push(callback);
    }

    /**
     * Émettre un événement
     * @param {string} event - Nom de l'événement
     * @param {*} data - Données à passer
     */
    emit(event, data) {
        // Événements normaux
        if (this.events[event]) {
            this.events[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`ERREUR EVENT ${event}:`, error);
                }
            });
        }

        // Événements once
        if (this.onceEvents[event]) {
            this.onceEvents[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`ERREUR EVENT ONCE ${event}:`, error);
                }
            });
            delete this.onceEvents[event];
        }
    }

    /**
     * Supprimer un listener
     * @param {string} event - Nom de l'événement
     * @param {Function} callback - Fonction de callback
     */
    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }

    /**
     * Supprimer tous les listeners d'un événement
     * @param {string} event - Nom de l'événement
     */
    removeAllListeners(event) {
        if (event) {
            delete this.events[event];
            delete this.onceEvents[event];
        } else {
            this.events = {};
            this.onceEvents = {};
        }
    }
}

// Instance globale
window.BoomboxEvents = new EventEmitter();

// Événements prédéfinis
const EVENTS = {
    // Wallet
    WALLET_CONNECTED: 'wallet:connected',
    WALLET_DISCONNECTED: 'wallet:disconnected',
    WALLET_CHANGED: 'wallet:changed',

    // Chain
    CHAIN_CHANGED: 'chain:changed',
    CHAIN_ERROR: 'chain:error',

    // Prix
    PRICE_UPDATED: 'price:updated',
    PRICE_ERROR: 'price:error',

    // Balance
    BALANCE_UPDATED: 'balance:updated',
    BALANCE_ERROR: 'balance:error',

    // Actions
    PLAY_CLICKED: 'action:play',
    EJECT_CLICKED: 'action:eject',
    PREV_CLICKED: 'action:prev',
    NEXT_CLICKED: 'action:next',

    // Navigation
    PAGE_CHANGED: 'navigation:page',

    // Configuration
    RANGE_CONFIG_SAVED: 'config:range_saved',
    RANGE_CONFIG_ERROR: 'config:range_error',

    // Système
    SYSTEM_ERROR: 'system:error',
    SYSTEM_WARNING: 'system:warning',
    SYSTEM_SUCCESS: 'system:success'
};

// Exposer les événements
window.BoomboxEvents.EVENTS = EVENTS;
