console.log('[DEBUG] Chargement de api-client.js');
/**
 * BOOMBOXSWAP V1 - API Client
 * Communication avec le backend FastAPI
 */

class ApiClient {
    constructor() {
        this.baseUrl = 'http://127.0.0.1:8000';
        this.timeout = 10000; // 10 secondes
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 seconde
    }

    /**
     * Requête HTTP générique avec retry
     * @param {string} endpoint - Endpoint API
     * @param {Object} options - Options de requête
     * @returns {Promise} - Réponse de l'API
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            timeout: this.timeout,
            ...options
        };

        let lastError;

        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                const response = await fetch(url, config);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                return data;

            } catch (error) {
                lastError = error;
                console.warn(`TENTATIVE ${attempt}/${this.retryAttempts} ECHEC:`, error.message);

                if (attempt < this.retryAttempts) {
                    await this.delay(this.retryDelay * attempt);
                }
            }
        }

        throw new Error(`ECHEC API APRES ${this.retryAttempts} TENTATIVES: ${lastError.message}`);
    }

    /**
     * Délai asynchrone
     * @param {number} ms - Millisecondes
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Vérification santé système
     * @returns {Promise} - Statut système
     */
    async getHealth() {
        return this.request('/health');
    }

    /**
     * Rapport de santé détaillé
     * @returns {Promise} - Rapport complet
     */
    async getDetailedHealth() {
        return this.request('/health/detailed');
    }

    /**
     * Configuration multi-chain
     * @returns {Promise} - Configuration chains
     */
    async getChains() {
        return this.request('/chains');
    }

    /**
     * Prix temps réel d'un token
     * @param {string} chainId - ID de la chain
     * @param {string} token - Symbole du token
     * @returns {Promise} - Prix du token
     */
    async getTokenPrice(chainId, token) {
        return this.request(`/api/v1/price/${chainId}/${token}`);
    }

    /**
     * Mise à jour prix temps réel
     * @param {string} chainId - ID de la chain
     * @param {Array} tokens - Liste des tokens
     * @returns {Promise} - Prix de tous les tokens
     */
    async updatePrices(chainId, tokens = ['BNB']) {
        const prices = {};

        for (const token of tokens) {
            try {
                const priceData = await this.getTokenPrice(chainId, token);
                prices[token] = priceData;
            } catch (error) {
                console.error(`ERREUR PRIX ${token}:`, error);
                prices[token] = { price: 0, cached: false, error: error.message };
            }
        }

        // USDT est stable, prix fixe
        prices['USDT'] = { price: 1.0, cached: true, timestamp: new Date().toISOString() };

        return prices;
    }

    /**
     * Test connexion API
     * @returns {Promise<boolean>} - Statut connexion
     */
    async testConnection() {
        try {
            await this.getHealth();
            return true;
        } catch (error) {
            console.error('ERREUR CONNEXION API:', error);
            return false;
        }
    }

    /**
     * Gestion erreurs API
     * @param {Error} error - Erreur capturée
     * @param {string} context - Contexte de l'erreur
     */
    handleError(error, context = 'API') {
        const errorMessage = `ERREUR ${context}: ${error.message}`;
        console.error(errorMessage);

        // Émettre événement d'erreur
        if (window.BoomboxEvents) {
            window.BoomboxEvents.emit(window.BoomboxEvents.EVENTS.SYSTEM_ERROR, {
                context,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }

        return {
            success: false,
            error: error.message,
            context,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Configuration API client
     * @param {Object} config - Configuration
     */
    configure(config) {
        if (config.baseUrl) this.baseUrl = config.baseUrl;
        if (config.timeout) this.timeout = config.timeout;
        if (config.retryAttempts) this.retryAttempts = config.retryAttempts;
        if (config.retryDelay) this.retryDelay = config.retryDelay;
    }

    /**
     * Récupérer les soldes (balances) d'un utilisateur
     * @param {string} address - Adresse du wallet
     * @param {string|number} chainId - ID de la chain
     * @returns {Promise<Object>} - Soldes par token
     */
    async getBalances(address, chainId) {
        return this.request(`/api/v1/data/balances/${address}?chain_id=${chainId}`);
    }

    /**
     * Récupérer les positions d'un utilisateur
     * @param {string} address - Adresse du wallet
     * @param {string|number} chainId - ID de la chain
     * @returns {Promise<Object>} - Positions utilisateur
     */
    async getPositions(address, chainId) {
        return this.request(`/api/v1/positions/wallet/${address}?chain_id=${chainId}`);
    }
}

// Instance globale avec contrôle d'initialisation
if (!window.BoomboxAPI) {
    window.BoomboxAPI = new ApiClient();
    console.log('[DEBUG] BoomboxAPI défini:', window.BoomboxAPI);
    if (window.BOOMBOX_INIT_CONTROL) {
        window.BOOMBOX_INIT_CONTROL.setInitialized('api');
    }
} else {
    console.log('[DEBUG] BoomboxAPI déjà existant, réutilisation');
}
