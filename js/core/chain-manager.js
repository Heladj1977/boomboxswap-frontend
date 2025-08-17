/**
 * BOOMBOXSWAP V1 - Chain Manager
 * Gestion multi-chain BSC/Arbitrum/Solana
 */

class ChainManager {
    constructor() {
        this.currentChain = 'bsc';
        this.chains = {
            bsc: {
                type: 'evm',
                id: 56,
                hexId: '0x38',
                name: 'BSC',
                nativeToken: 'BNB',
                rpcUrl: 'https://bsc-dataseed1.binance.org',
                explorer: 'https://bscscan.com',
                addParams: {
                    chainId: '0x38',
                    chainName: 'BNB Smart Chain',
                    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
                    rpcUrls: [
                        'https://bsc-dataseed1.binance.org',
                        'https://bsc-dataseed.binance.org'
                    ],
                    blockExplorerUrls: ['https://bscscan.com']
                },
                tokens: {
                    USDT: '0x55d398326f99059fF775485246999027B3197955',
                    USDC: '0x8ac76a51CC950d9822D68b83Fe1aD97B32CD580d',
                    CAKE: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82'
                }
            },
            arbitrum: {
                type: 'evm',
                id: 42161,
                hexId: '0xa4b1',
                name: 'Arbitrum',
                nativeToken: 'ETH',
                rpcUrl: 'https://arb1.arbitrum.io/rpc',
                explorer: 'https://arbiscan.io',
                addParams: {
                    chainId: '0xa4b1',
                    chainName: 'Arbitrum One',
                    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
                    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
                    blockExplorerUrls: ['https://arbiscan.io']
                },
                tokens: {
                    USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
                    CAKE: '0x912CE59144191C1204E64559FE8253a0e49E6548'
                }
            },
            solana: {
                type: 'solana',
                id: 0,
                name: 'Solana',
                nativeToken: 'SOL',
                rpcUrl: 'https://api.mainnet-beta.solana.com',
                explorer: 'https://solscan.io',
                tokens: {
                    USDC: 'SPL_USDC',
                    CAKE: 'SPL_CAKE'
                }
            },
            
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

        // Ajuster la modale wallet selon la chaîne au chargement initial
        try {
            const chain = this.currentChain;
            if (window.BoomboxEvents) {
                window.BoomboxEvents.emit(
                    window.BoomboxEvents.EVENTS.CHAIN_CHANGED,
                    { oldChain: null, newChain: chain, chainData: this.chains[chain] }
                );
            }
        } catch (_) {}
    }

    /**
     * Changer de chain
     * @param {string} chainId - ID de la nouvelle chain
     */
    async switchChain(chainId, options) {
        const opts = options || {};
        if (!this.chains[chainId]) {
            console.error(`CHAIN INCONNUE: ${chainId}`);
            return false;
        }

        const oldChain = this.currentChain;

        // Tenter le switch réseau UNIQUEMENT si wallet EVM actif
        if (!opts.noWalletSwitch) {
            const isWalletConnected = !!window.BOOMSWAP_CURRENT_ADDRESS;
            const wasSolana = (oldChain === 'solana') || (window.BOOMSWAP_CURRENT_CHAIN_ID === 0);
            const provider = window.BOOMSWAP_CURRENT_PROVIDER || window.ethereum;
            const isPhantom = !!(provider && provider.isPhantom);

            // Si on vient de Solana (Phantom) → ignorer toute tentative EVM ici
            if (wasSolana || isPhantom) {
                // On passe en UI uniquement; la modale EVM s'ouvrira plus bas
                this.currentChain = chainId;
                localStorage.setItem('boombox_current_chain', chainId);
                this.updateUI();
                if (window.BoomboxEvents) {
                    window.BoomboxEvents.emit(
                        window.BoomboxEvents.EVENTS.CHAIN_CHANGED,
                        { oldChain, newChain: chainId, chainData: this.chains[chainId] }
                    );
                }
            } else if (!isWalletConnected) {
                // Pas de wallet connecté → ne pas solliciter MetaMask/WalletConnect
                // On bascule seulement l'UI et on persiste la préférence
                this.currentChain = chainId;
                localStorage.setItem('boombox_current_chain', chainId);
                this.updateUI();
                if (window.BoomboxEvents) {
                    window.BoomboxEvents.emit(
                        window.BoomboxEvents.EVENTS.CHAIN_CHANGED,
                        { oldChain, newChain: chainId, chainData: this.chains[chainId] }
                    );
                }
                console.log('[CHAIN] Switch UI sans wallet (déconnecté)');
                return true;
            } else if (provider && typeof provider.request === 'function') {
                try {
                    const target = this.chains[chainId];
                    if (target.type === 'evm') {
                        await provider.request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: target.hexId }]
                        });
                        // Aligner l'état global
                        try { window.BOOMSWAP_CURRENT_CHAIN_ID = target.id; } catch (_) {}
                        // Synchroniser aussi avec MetaMask-config listeners
                        try {
                            if (typeof window.ethereum?.emit === 'function') {
                                // Certaines implémentations ne supportent pas emit ; ignorer en silence
                            }
                        } catch (_) {}
                    }
                } catch (err) {
                    // Si la chaîne n'existe pas dans le wallet, tenter l'ajout
                    if (err && (err.code === 4902 || err.code === -32603)) {
                        try {
                            const p = this.chains[chainId].addParams;
                            await provider.request({
                                method: 'wallet_addEthereumChain',
                                params: [p]
                            });
                            try { window.BOOMSWAP_CURRENT_CHAIN_ID = this.chains[chainId].id; } catch (_) {}
                        } catch (addErr) {
                            if (window.showNotification) {
                                window.showNotification(
                                    'Changement de réseau refusé', 'error'
                                );
                            }
                            return false;
                        }
                    } else {
                        // Provider non-EVM ou refuse → continuer sans bloquer
                    }
                }
            }
        }

        this.currentChain = chainId;

        // Sauvegarder préférence
        localStorage.setItem('boombox_current_chain', chainId);

        // Mettre à jour l'interface
        this.updateUI();

        // Activer/désactiver uniquement le flag de fetch EVM selon la chaîne
        try {
            window.BOOMB_STATE_DISABLE_EVM_FETCH = (chainId === 'solana');
        } catch (_) {}

        // Informer ProviderManager (annulation des fetchs + nouvelle politique)
        try {
            if (window.BoomboxProviderManager && typeof window.BoomboxProviderManager.setChain === 'function') {
                window.BoomboxProviderManager.setChain(chainId);
            }
        } catch (_) {}

        // Émettre événement
        if (window.BoomboxEvents) {
            window.BoomboxEvents.emit(window.BoomboxEvents.EVENTS.CHAIN_CHANGED, {
                oldChain,
                newChain: chainId,
                chainData: this.chains[chainId]
            });
        }

        // UX: ouvrir la modale adaptée selon direction
        try {
            if (chainId === 'solana') {
                const modalApi = window.BoomboxWalletModal;
                if (modalApi && typeof modalApi.show === 'function') {
                    modalApi.show();
                }
            } else if (oldChain === 'solana') {
                // Retour vers EVM depuis Solana → proposer choix MetaMask/WalletConnect
                const modalApi = window.BoomboxWalletModal;
                if (modalApi && typeof modalApi.show === 'function') {
                    modalApi.show();
                }
            }
        } catch (_) {}

        // Harmoniser le bouton via fonction centralisée
        try {
            window.BOOMB_WALLET_UI_LOCK = (chainId === 'solana') ? 'solana' : null;
            if (chainId !== 'solana') {
                // Restaurer l'adresse EVM si disponible
                if (window.BOOMSWAP_EVM_ADDRESS) {
                    window.BOOMSWAP_CURRENT_ADDRESS = window.BOOMSWAP_EVM_ADDRESS;
                }
                // Nettoyer la pubkey Solana pour l'affichage bouton
                window.BOOMB_SOLANA_PUBLIC_KEY = null;
            }
        } catch (_) {}
        try { if (typeof window.BOOMB_APPLY_WALLET_HEADER === 'function') window.BOOMB_APPLY_WALLET_HEADER(); } catch (_) {}

        console.log(`CHAIN CHANGE: ${oldChain} → ${chainId}`);
        return true;
    }

    /**
     * Synchroniser l'état à partir d'un chainId numérique wallet (sans switch)
     */
    syncFromWallet(numericChainId) {
        const map = { 56: 'bsc', 42161: 'arbitrum' };
        const key = map[numericChainId];
        if (!key || !this.chains[key]) return;
        if (this.currentChain === key) return;
        this.currentChain = key;
        localStorage.setItem('boombox_current_chain', key);
        this.updateUI();
        if (window.BoomboxEvents) {
            window.BoomboxEvents.emit(window.BoomboxEvents.EVENTS.CHAIN_CHANGED, {
                oldChain: null,
                newChain: key,
                chainData: this.chains[key]
            });
        }
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
        // Mettre à jour le libellé du stablecoin dans la Card 1 (USDT ↔ USDC)
        try {
            const chain = this.chains[this.currentChain];
            const stableSymbol = (chain.type === 'solana') ? 'USDC' : 'USDT';
            const stableNameEl = document.getElementById('stable-token-name');
            if (stableNameEl) {
                stableNameEl.textContent = stableSymbol;
            }
            // Mettre à jour le logo si nécessaire
            const stableLabel = stableNameEl ? stableNameEl.closest('.balance-label') : null;
            const stableLogo = stableLabel ? stableLabel.querySelector('.token-logo') : null;
            if (stableLogo) {
                const expectedSrc = (stableSymbol === 'USDC')
                    ? 'assets/images/tokens/usdc.svg'
                    : 'assets/images/tokens/usdt.svg';

                // Fallback robuste: si le logo USDC est introuvable, utiliser un placeholder SVG
                if (stableSymbol === 'USDC') {
                    try {
                        stableLogo.onerror = () => {
                            try {
                                const svg = (
                                    "<svg xmlns='http://www.w3.org/2000/svg' " +
                                    "width='16' height='16' viewBox='0 0 16 16'>" +
                                    "<circle cx='8' cy='8' r='8' fill='#2775CA'/>") +
                                    "<text x='8' y='11' font-family='Arial' " +
                                    "font-size='7' text-anchor='middle' fill='white'>U</text>" +
                                    "</svg>";
                                const dataUri = 'data:image/svg+xml;base64,' + btoa(svg);
                                stableLogo.onerror = null;
                                stableLogo.src = dataUri;
                            } catch (_) {}
                        };
                    } catch (_) {}
                } else {
                    try { stableLogo.onerror = null; } catch (_) {}
                }

                if (!stableLogo.getAttribute('src') || !stableLogo.getAttribute('src').includes(expectedSrc)) {
                    stableLogo.src = expectedSrc;
                    stableLogo.alt = stableSymbol;
                } else if (stableLogo.alt !== stableSymbol) {
                    stableLogo.alt = stableSymbol;
                }
            }
        } catch (_) {}
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

        // Mettre à jour le titre de la carte prix (BNB/USDT ↔ ETH/USDT)
        const priceCards = document.querySelectorAll('.smart-card.top-row');
        priceCards.forEach((card) => {
            const title = card.querySelector('.card-title');
            if (!title) return;
            const stableSymbol = (chain.type === 'solana') ? 'USDC' : 'USDT';
            const parts = title.textContent.split('/');
            if (parts.length === 2) {
                // Card 2 titre = NATIF/STABLE
                title.textContent = `${nativeToken}/${stableSymbol}`;
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
            // Déterminer la source attendue et éviter les réassignations inutiles
            let expectedSrc = '';
            let expectedAlt = '';
            if (nativeToken === 'BNB') {
                expectedSrc = 'assets/images/tokens/bnb.svg';
                expectedAlt = 'BNB';
            } else if (nativeToken === 'ETH') {
                expectedSrc = 'assets/images/tokens/ethereum.svg';
                expectedAlt = 'ETH';
            } else if (nativeToken === 'SOL') {
                expectedSrc = 'assets/images/tokens/sol.svg';
                expectedAlt = 'SOL';
            }
            // Si tout est déjà correct (cas BSC au démarrage), ne rien toucher
            const labelForCheck = nativeBalanceItem.querySelector('.balance-label');
            const labelText = labelForCheck ? labelForCheck.textContent.replace(/\s+/g, ' ').trim() : '';
            const alreadyOk = (
                nativeLogo && (nativeLogo.getAttribute('src') || '').includes(expectedSrc) &&
                nativeLogo.alt === expectedAlt &&
                labelText.endsWith(expectedAlt)
            );
            if (alreadyOk) {
                // Éviter tout retraitement qui causerait un reflow/flicker
            } else {
            // Ne mettre à jour que si différent pour éviter un rechargement/flicker
            const currentSrc = nativeLogo.getAttribute('src') || '';
            if (!currentSrc.includes(expectedSrc)) {
                nativeLogo.src = expectedSrc;
            }
            if (nativeLogo.alt !== expectedAlt) {
                nativeLogo.alt = expectedAlt;
            }
            }
            // Texte natif (après le logo) - préserver le logo, supprimer les
            // nœuds texte parasites (espaces/retours chariot), puis écrire le nom
            const nativeLabel = nativeBalanceItem.querySelector('.balance-label');
            if (nativeLabel) {
                // Si déjà correct, ne rien faire pour le texte
                const txt = nativeLabel.textContent.replace(/\s+/g, ' ').trim();
                if (txt.endsWith(expectedAlt)) {
                    // pas de modification du texte, mais poursuivre les autres
                } else {
                // S'assurer que le logo est bien le premier enfant
                if (nativeLogo && nativeLabel.firstChild !== nativeLogo) {
                    nativeLabel.insertBefore(nativeLogo, nativeLabel.firstChild);
                }
                // Supprimer tous les nœuds texte existants
                const nodes = Array.from(nativeLabel.childNodes);
                nodes.forEach((node) => {
                    if (node.nodeType === Node.TEXT_NODE) {
                        nativeLabel.removeChild(node);
                    }
                });
                // Ajouter l'intitulé du token avec un espace insécable devant
                nativeLabel.appendChild(document.createTextNode(' ' + nativeToken));
                }
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
