/**
 * BOOMBOXSWAP V1 - Chain Manager
 * Gestion multi-chain BSC/Arbitrum/Base
 */

class ChainManager {
    constructor() {
        this.currentChain = 'bsc';
        this.chains = {
            bsc: {
                id: 56,
                name: 'BSC',
                nativeToken: 'BNB',
                rpcUrl: 'https://bsc-dataseed1.binance.org',
                explorer: 'https://bscscan.com',
                tokens: {
                    USDT: '0x55d398326f99059fF775485246999027B3197955',
                    CAKE: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82'
                }
            },
            arbitrum: {
                id: 42161,
                name: 'Arbitrum',
                nativeToken: 'ETH',
                rpcUrl: 'https://arb1.arbitrum.io/rpc',
                explorer: 'https://arbiscan.io',
                tokens: {
                    USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
                    CAKE: '0x912CE59144191C1204E64559FE8253a0e49E6548'
                }
            },
            base: {
                id: 8453,
                name: 'Base',
                nativeToken: 'ETH',
                rpcUrl: 'https://mainnet.base.org',
                explorer: 'https://basescan.org',
                tokens: {
                    USDT: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
                    CAKE: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22'
                }
            }
        };

        this.init();
    }

    /**
     * Initialisation du chain manager
     */
    init() {
        // Récupérer chain sauvegardée
        const savedChain = localStorage.getItem('boombox_current_chain');
        if (savedChain && this.chains[savedChain]) {
            this.currentChain = savedChain;
        }

        // Mettre à jour l'interface
        this.updateUI();

        // Écouter changements de chain
        this.setupEventListeners();

        console.log(`CHAIN MANAGER INITIALISE: ${this.currentChain}`);
    }

    /**
     * Configuration des event listeners
     */
    setupEventListeners() {
        const chainSelector = document.getElementById('chainSelector');
        if (chainSelector) {
            chainSelector.value = this.currentChain;
            chainSelector.addEventListener('change', (e) => {
                this.switchChain(e.target.value);
            });
        }
    }

    /**
     * Changer de chain
     * @param {string} chainId - ID de la nouvelle chain
     */
    async switchChain(chainId) {
        if (!this.chains[chainId]) {
            console.error(`CHAIN INCONNUE: ${chainId}`);
            return false;
        }

        const oldChain = this.currentChain;
        this.currentChain = chainId;

        // Sauvegarder préférence
        localStorage.setItem('boombox_current_chain', chainId);

        // Mettre à jour l'interface
        this.updateUI();

        // Émettre événement
        if (window.BoomboxEvents) {
            window.BoomboxEvents.emit(window.BoomboxEvents.EVENTS.CHAIN_CHANGED, {
                oldChain,
                newChain: chainId,
                chainData: this.chains[chainId]
            });
        }

        console.log(`CHAIN CHANGE: ${oldChain} → ${chainId}`);
        return true;
    }

    /**
     * Mettre à jour l'interface utilisateur
     */
    updateUI() {
        const chainSelector = document.getElementById('chainSelector');
        if (chainSelector) {
            chainSelector.value = this.currentChain;
        }

        // Mettre à jour les tokens affichés
        this.updateTokenDisplay();
    }

    /**
     * Mettre à jour l'affichage des tokens
     */
    updateTokenDisplay() {
        const chain = this.chains[this.currentChain];
        const nativeToken = chain.nativeToken;

        // Mettre à jour les noms de tokens dans l'interface
        const bnbElements = document.querySelectorAll('.token-name');
        bnbElements.forEach(element => {
            if (element.textContent === 'BNB') {
                element.textContent = nativeToken;
            }
        });

        // Mettre à jour les labels de prix
        const priceLabels = document.querySelectorAll('.price-label');
        priceLabels.forEach(label => {
            if (label.textContent.includes('BNB')) {
                label.textContent = label.textContent.replace('BNB', nativeToken);
            }
        });

        // Mettre à jour le swap triangle
        this.updateSwapTriangle();

        // Correction robuste du logo natif et du texte dans la card portefeuille
        const nativeBalanceItem = document.querySelector('.balance-content .balance-item:first-child');
        if (nativeBalanceItem) {
            // Logo
            let nativeLogo = nativeBalanceItem.querySelector('.token-logo');
            if (!nativeLogo) {
                // Si le logo a été supprimé, on le recrée
                nativeLogo = document.createElement('img');
                nativeLogo.className = 'token-logo';
                nativeBalanceItem.querySelector('.balance-label').prepend(nativeLogo);
            }
            if (nativeToken === 'BNB') {
                nativeLogo.src = 'assets/images/tokens/bnb.svg';
                nativeLogo.alt = 'BNB';
            } else if (nativeToken === 'ETH') {
                nativeLogo.src = 'assets/images/tokens/ethereum.svg';
                nativeLogo.alt = 'ETH';
            } else {
                nativeLogo.src = '';
                nativeLogo.alt = '';
            }
            // Texte natif (après le logo)
            const nativeLabel = nativeBalanceItem.querySelector('.balance-label');
            if (nativeLabel) {
                // Supprimer tous les nœuds texte après le logo
                while (nativeLabel.childNodes.length > 1) {
                    nativeLabel.removeChild(nativeLabel.lastChild);
                }
                nativeLabel.appendChild(document.createTextNode(' ' + nativeToken));
            }
        }

        // Correction card dépôt (titre, input-suffix, estimation)
        const depositCard = document.querySelectorAll('.smart-card.bottom-row')[0];
        if (depositCard) {
            const cardTitle = depositCard.querySelector('.card-title');
            if (cardTitle) cardTitle.textContent = 'Dépôt ' + nativeToken;
            const depositSuffix = depositCard.querySelector('.input-suffix');
            if (depositSuffix) depositSuffix.textContent = nativeToken;
            // Correction estimation label (premier .estimation-label)
            const estimationLabel = depositCard.querySelector('.estimation-label');
            if (estimationLabel) estimationLabel.textContent = nativeToken + ':';
        }
    }

    /**
     * Mettre à jour le triangle de swap
     */
    updateSwapTriangle() {
        const chain = this.chains[this.currentChain];
        const nativeToken = chain.nativeToken;

        const swapFroms = document.querySelectorAll('.swap-from');
        swapFroms.forEach(element => {
            if (element.textContent === 'BNB') {
                element.textContent = nativeToken;
            }
        });

        const swapTos = document.querySelectorAll('.swap-to');
        swapTos.forEach(element => {
            if (element.textContent === 'BNB') {
                element.textContent = nativeToken;
            }
        });
    }

    /**
     * Obtenir la chain actuelle
     * @returns {Object} - Données de la chain
     */
    getCurrentChain() {
        return this.chains[this.currentChain];
    }

    /**
     * Obtenir l'ID de la chain actuelle
     * @returns {string} - ID de la chain
     */
    getCurrentChainId() {
        return this.currentChain;
    }

    /**
     * Obtenir toutes les chains disponibles
     * @returns {Object} - Toutes les chains
     */
    getAllChains() {
        return this.chains;
    }

    /**
     * Obtenir l'adresse d'un token
     * @param {string} token - Symbole du token
     * @returns {string} - Adresse du token
     */
    getTokenAddress(token) {
        const chain = this.chains[this.currentChain];
        return chain.tokens[token] || null;
    }

    /**
     * Vérifier si une chain est supportée
     * @param {string} chainId - ID de la chain
     * @returns {boolean} - Supportée ou non
     */
    isChainSupported(chainId) {
        return !!this.chains[chainId];
    }

    /**
     * Obtenir l'explorer de la chain actuelle
     * @returns {string} - URL de l'explorer
     */
    getExplorerUrl() {
        return this.chains[this.currentChain].explorer;
    }

    /**
     * Obtenir l'URL RPC de la chain actuelle
     * @returns {string} - URL RPC
     */
    getRpcUrl() {
        return this.chains[this.currentChain].rpcUrl;
    }

    /**
     * Configuration du chain manager
     * @param {Object} config - Configuration
     */
    configure(config) {
        if (config.chains) {
            this.chains = { ...this.chains, ...config.chains };
        }
        if (config.defaultChain && this.chains[config.defaultChain]) {
            this.currentChain = config.defaultChain;
            this.updateUI();
        }
    }
}

// Instance globale
window.BoomboxChainManager = new ChainManager();
