/**
 * BOOMBOXSWAP V1 - Application principale
 * Interface gaming pour PancakeSwap V3
 */

// ===== SURVEILLANCE FORENSIQUE UI MODAL WALLET =====
// Filtre anti-emoji + réduction logs verbeux (non intrusif)
try {
    const __emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;
    const __sanitize = v => typeof v === 'string' ? v.replace(__emojiRegex, '') : v;
    const __shouldDrop = (level, firstArg) => {
        if (window.BOOMBOX_DEBUG_MODE === true) return false; // laisser tout en debug
        if (typeof firstArg !== 'string') return false;
        // Filtrer les logs verbeux non critiques (laisser warn/error)
        const noisy = [
            'AUDIT SOLDES', 'AUDIT FORENSIQUE', 'INVESTIGATION',
            'DIAGNOSTIC COMPLET', 'AUDIT MODAL', 'AUDIT DOLLARS'
        ];
        if ((level === 'log' || level === 'info') && noisy.some(k => firstArg.includes(k))) {
            return true;
        }
        return false;
    };
    ['log','info','warn','error'].forEach(level => {
        const original = console[level] && console[level].bind(console);
        if (!original) return;
        console[level] = (...args) => {
            if (__shouldDrop(level, args[0])) return;
            original(...args.map(__sanitize));
        };
    });
} catch (_) {
    // Si Unicode regex indisponible, ignorer silencieusement
}
console.log('AUDIT FORENSIQUE: === SURVEILLANCE UI MODAL WALLET DEMARREE ===');

// ===== SURVEILLANCE FORENSIQUE SOLDES CARD 1 =====
console.log('AUDIT SOLDES: === SURVEILLANCE WORKFLOW SOLDES DEMARREE ===');

// Timeline des soldes pour tracer le workflow complet
window.SOLDES_TIMELINE = [];

function logSoldesEvent(event, details) {
    const entry = {
        timestamp: Date.now(),
        event: event,
        details: details,
        stack: new Error().stack
    };
    window.SOLDES_TIMELINE.push(entry);
    console.log('AUDIT SOLDES:', entry);
}

// Intercepter les appels API getBalances
const originalGetBalances = window.BoomboxAPI?.getBalances;
if (window.BoomboxAPI && originalGetBalances) {
    window.BoomboxAPI.getBalances = async function(address, chainId) {
        logSoldesEvent('API_CALL_START', {
            address: address,
            chainId: chainId,
            endpoint: 'getBalances'
        });
        
        try {
            const result = await originalGetBalances.call(this, address, chainId);
            logSoldesEvent('API_CALL_SUCCESS', {
                address: address,
                chainId: chainId,
                response: result
            });
            return result;
        } catch (error) {
            logSoldesEvent('API_CALL_ERROR', {
                address: address,
                chainId: chainId,
                error: error.message
            });
            throw error;
        }
    };
    console.log('🎯 AUDIT SOLDES: Hook API getBalances installé');
}

// Intercepter les modifications des éléments Card 1
function setupSoldesCardSurveillance() {
    const card1Elements = [
        'balance-bnb',
        'balance-usdt', 
        'balance-cake',
        'total-value'
    ];
    
    card1Elements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList' || mutation.type === 'characterData') {
                        logSoldesEvent('CARD1_DOM_UPDATE', {
                            elementId: elementId,
                            oldValue: mutation.oldValue,
                            newValue: element.textContent,
                            type: mutation.type
                        });
                    }
                });
            });
            
            observer.observe(element, { 
                childList: true, 
                characterData: true,
                characterDataOldValue: true,
                subtree: true
            });
            
            console.log(`🎯 AUDIT SOLDES: Surveillance ${elementId} configurée`);
        } else {
            console.error(`🎯 AUDIT SOLDES: Élément ${elementId} NON TROUVÉ !`);
        }
    });
}

// Fonction de diagnostic complet des soldes
window.SOLDES_DIAGNOSTIC = function() {
    console.log('🎯 AUDIT SOLDES: === DIAGNOSTIC COMPLET WORKFLOW SOLDES ===');
    console.log('🎯 AUDIT SOLDES: Timeline complète:', window.SOLDES_TIMELINE);
    
    // Analyser les étapes du workflow
    const steps = {
        connection: window.SOLDES_TIMELINE.filter(e => e.event === 'WALLET_CONNECTED'),
        apiCall: window.SOLDES_TIMELINE.filter(e => e.event === 'API_CALL_START'),
        apiResponse: window.SOLDES_TIMELINE.filter(e => e.event === 'API_CALL_SUCCESS'),
        apiError: window.SOLDES_TIMELINE.filter(e => e.event === 'API_CALL_ERROR'),
        domUpdate: window.SOLDES_TIMELINE.filter(e => e.event === 'CARD1_DOM_UPDATE')
    };
    
    console.log('🎯 AUDIT SOLDES: Analyse par étapes:');
    console.log('🎯 AUDIT SOLDES:   - Connexions wallet:', steps.connection.length);
    console.log('🎯 AUDIT SOLDES:   - Appels API:', steps.apiCall.length);
    console.log('🎯 AUDIT SOLDES:   - Réponses API:', steps.apiResponse.length);
    console.log('🎯 AUDIT SOLDES:   - Erreurs API:', steps.apiError.length);
    console.log('🎯 AUDIT SOLDES:   - Mises à jour DOM:', steps.domUpdate.length);
    
    // Vérifier l'état actuel de Card 1
    const card1Elements = {
        'balance-bnb': document.getElementById('balance-bnb')?.textContent,
        'balance-usdt': document.getElementById('balance-usdt')?.textContent,
        'balance-cake': document.getElementById('balance-cake')?.textContent,
        'total-value': document.getElementById('total-value')?.textContent
    };
    
    console.log('🎯 AUDIT SOLDES: État actuel Card 1:', card1Elements);
    
    // Identifier le point de blocage
    if (steps.connection.length === 0) {
        console.error('🎯 AUDIT SOLDES: PROBLÈME: Aucune connexion wallet détectée');
    } else if (steps.apiCall.length === 0) {
        console.error('🎯 AUDIT SOLDES: PROBLÈME: Aucun appel API détecté après connexion');
    } else if (steps.apiResponse.length === 0) {
        console.error('🎯 AUDIT SOLDES: PROBLÈME: Aucune réponse API reçue');
    } else if (steps.domUpdate.length === 0) {
        console.error('🎯 AUDIT SOLDES: PROBLÈME: Aucune mise à jour DOM détectée');
    } else {
        console.log('🎯 AUDIT SOLDES: Workflow complet détecté');
    }
    
    console.log('🎯 AUDIT SOLDES: === FIN DIAGNOSTIC ===');
};

// Fonction de test manuel de l'API des soldes
window.TEST_API_SOLDES = async function(address = null, chainId = 56) {
    console.log('🎯 AUDIT SOLDES: === TEST MANUEL API SOLDES ===');
    
    if (!address) {
        console.error('🎯 AUDIT SOLDES: Adresse requise pour le test');
        console.log('🎯 AUDIT SOLDES: Usage: TEST_API_SOLDES("0x...", 56)');
        return;
    }
    
    if (!window.BoomboxAPI) {
        console.error('🎯 AUDIT SOLDES: BoomboxAPI non disponible');
        return;
    }
    
    console.log(`🎯 AUDIT SOLDES: Test avec address: ${address}, chainId: ${chainId}`);
    
    try {
        const result = await (window.BoomboxProviderManager
            ? window.BoomboxProviderManager.fetchBalances(address, chainId)
            : window.BoomboxAPI.getBalances(address, chainId));
        console.log('🎯 AUDIT SOLDES: Réponse API:', result);
        
        // Tester la mise à jour du DOM
        console.log('🎯 AUDIT SOLDES: Test mise à jour DOM...');
        if (window.BoomboxApp && window.BoomboxApp.updatePortfolioCard) {
            window.BoomboxApp.updatePortfolioCard(result);
            console.log('🎯 AUDIT SOLDES: Mise à jour DOM effectuée');
        } else {
            console.error('🎯 AUDIT SOLDES: BoomboxApp.updatePortfolioCard non disponible');
        }
        
    } catch (error) {
        console.error('🎯 AUDIT SOLDES: Erreur test API:', error);
    }
    
    console.log('🎯 AUDIT SOLDES: === FIN TEST MANUEL ===');
};

// Système de timeline pour tracer TOUTES les modifications UI
window.UI_TIMELINE = [];

function logUIChange(component, action, details) {
    const entry = {
        timestamp: Date.now(),
        component: component,
        action: action,
        details: details,
        stack: new Error().stack
    };
    window.UI_TIMELINE.push(entry);
    console.log('📅 UI TIMELINE:', entry);
}

// Observer les modifications du DOM modal
function setupModalForensics() {
    console.log('🎯 AUDIT FORENSIQUE: Configuration surveillance DOM modal...');
    
    const walletModal = document.getElementById('walletModal');
    if (!walletModal) {
        console.error('🎯 AUDIT FORENSIQUE: Modal wallet non trouvé !');
        return;
    }
    
    // Observer les modifications du modal entier
    const modalObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            logUIChange('walletModal', 'DOM_MUTATION', {
                type: mutation.type,
                target: mutation.target.id || mutation.target.className,
                oldValue: mutation.oldValue,
                newValue: mutation.target.textContent?.substring(0, 100)
            });
        });
    });
    
    modalObserver.observe(walletModal, { 
        childList: true, 
        subtree: true, 
        characterData: true,
        characterDataOldValue: true,
        attributes: true,
        attributeOldValue: true
    });
    
    // Observer spécifiquement les boutons de connexion
    const metaMaskOption = document.getElementById('connect-metamask');
    const walletConnectOption = document.getElementById('connect-walletconnect');
    
    if (metaMaskOption) {
        console.log('🎯 AUDIT FORENSIQUE: Surveillance bouton MetaMask configurée');
        const metaMaskObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                logUIChange('metaMaskButton', 'CONTENT_CHANGE', {
                    type: mutation.type,
                    oldValue: mutation.oldValue,
                    newValue: mutation.target.textContent,
                    stack: new Error().stack
                });
            });
        });
        
        metaMaskObserver.observe(metaMaskOption, { 
            childList: true, 
            subtree: true, 
            characterData: true,
            characterDataOldValue: true 
        });
    }
    
    if (walletConnectOption) {
        console.log('🎯 AUDIT FORENSIQUE: Surveillance bouton WalletConnect configurée');
        const walletConnectObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                logUIChange('walletConnectButton', 'CONTENT_CHANGE', {
                    type: mutation.type,
                    oldValue: mutation.oldValue,
                    newValue: mutation.target.textContent,
                    stack: new Error().stack
                });
            });
        });
        
        walletConnectObserver.observe(walletConnectOption, { 
            childList: true, 
            subtree: true, 
            characterData: true,
            characterDataOldValue: true 
        });
    }
    
    // Observer les labels spécifiquement
    const walletLabels = document.querySelectorAll('.wallet-label');
    walletLabels.forEach((label, index) => {
        const labelObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                logUIChange(`walletLabel_${index}`, 'LABEL_CHANGE', {
                    type: mutation.type,
                    oldValue: mutation.oldValue,
                    newValue: mutation.target.textContent,
                    stack: new Error().stack
                });
            });
        });
        
        labelObserver.observe(label, { 
            characterData: true, 
            subtree: true,
            characterDataOldValue: true 
        });
    });
    
    console.log('🎯 AUDIT FORENSIQUE: Surveillance DOM modal configurée');
}

// Surveillance des images et logos
function setupImageForensics() {
    console.log('🎯 AUDIT FORENSIQUE: Configuration surveillance images...');
    
    // Observer les changements d'attributs src des images
    const imageObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
                logUIChange('walletImage', 'SRC_CHANGE', {
                    target: mutation.target.alt || mutation.target.className,
                    oldValue: mutation.oldValue,
                    newValue: mutation.target.src,
                    stack: new Error().stack
                });
            }
        });
    });
    
    // Observer toutes les images du modal
    const walletImages = document.querySelectorAll('#walletModal img');
    walletImages.forEach((img) => {
        imageObserver.observe(img, { 
            attributes: true, 
            attributeOldValue: true 
        });
    });
    
    console.log('🎯 AUDIT FORENSIQUE: Surveillance images configurée');
}

// Surveillance des event listeners
function setupEventListenerForensics() {
    console.log('🎯 AUDIT FORENSIQUE: Configuration surveillance event listeners...');
    
    // Intercepter les ajouts d'event listeners
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
        if (this.id === 'connect-metamask' || this.id === 'connect-walletconnect' || this.id === 'wallet-btn') {
            logUIChange('eventListener', 'ADD_LISTENER', {
                target: this.id,
                type: type,
                hasListener: !!listener,
                stack: new Error().stack
            });
        }
        return originalAddEventListener.call(this, type, listener, options);
    };
    
    // Intercepter les suppressions d'event listeners
    const originalRemoveEventListener = EventTarget.prototype.removeEventListener;
    EventTarget.prototype.removeEventListener = function(type, listener, options) {
        if (this.id === 'connect-metamask' || this.id === 'connect-walletconnect' || this.id === 'wallet-btn') {
            logUIChange('eventListener', 'REMOVE_LISTENER', {
                target: this.id,
                type: type,
                hasListener: !!listener,
                stack: new Error().stack
            });
        }
        return originalRemoveEventListener.call(this, type, listener, options);
    };
    
    console.log('🎯 AUDIT FORENSIQUE: Surveillance event listeners configurée');
}

// Surveillance des modifications de style
function setupStyleForensics() {
    console.log('🎯 AUDIT FORENSIQUE: Configuration surveillance styles...');
    
    const styleObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                logUIChange('walletStyle', 'STYLE_CHANGE', {
                    target: mutation.target.id || mutation.target.className,
                    oldValue: mutation.oldValue,
                    newValue: mutation.target.style.cssText,
                    stack: new Error().stack
                });
            }
        });
    });
    
    const walletElements = document.querySelectorAll('#walletModal *');
    walletElements.forEach((element) => {
        styleObserver.observe(element, { 
            attributes: true, 
            attributeOldValue: true 
        });
    });
    
    console.log('🎯 AUDIT FORENSIQUE: Surveillance styles configurée');
}

// Fonction de diagnostic forensique
window.FORENSIC_DIAGNOSTIC = function() {
    console.log('🎯 AUDIT FORENSIQUE: === DIAGNOSTIC COMPLET ===');
    console.log('🎯 AUDIT FORENSIQUE: Timeline UI:', window.UI_TIMELINE);
    
    // Analyser les modifications problématiques
    const problematicChanges = window.UI_TIMELINE.filter(entry => 
        entry.action === 'CONTENT_CHANGE' || 
        entry.action === 'LABEL_CHANGE' ||
        entry.action === 'SRC_CHANGE'
    );
    
    console.log('🎯 AUDIT FORENSIQUE: Modifications problématiques:', problematicChanges);
    
    // Vérifier l'état actuel du modal
    const modal = document.getElementById('walletModal');
    const metaMaskBtn = document.getElementById('connect-metamask');
    const walletConnectBtn = document.getElementById('connect-walletconnect');
    
    console.log('🎯 AUDIT FORENSIQUE: État actuel modal:');
    console.log('🎯 AUDIT FORENSIQUE:   - Modal display:', modal?.style.display);
    console.log('🎯 AUDIT FORENSIQUE:   - MetaMask HTML:', metaMaskBtn?.innerHTML);
    console.log('🎯 AUDIT FORENSIQUE:   - WalletConnect HTML:', walletConnectBtn?.innerHTML);
    
    // Vérifier les images
    const metaMaskImg = metaMaskBtn?.querySelector('img');
    const walletConnectImg = walletConnectBtn?.querySelector('img');
    
    console.log('🎯 AUDIT FORENSIQUE: État images:');
    console.log('🎯 AUDIT FORENSIQUE:   - MetaMask img src:', metaMaskImg?.src);
    console.log('🎯 AUDIT FORENSIQUE:   - WalletConnect img src:', walletConnectImg?.src);
    
    console.log('🎯 AUDIT FORENSIQUE: === FIN DIAGNOSTIC ===');
};

// Initialiser la surveillance forensique
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 AUDIT FORENSIQUE: DOM chargé, initialisation surveillance...');
    setupModalForensics();
    setupImageForensics();
    setupEventListenerForensics();
    setupStyleForensics();
});

// ===== HOOK GLOBAL D'INVESTIGATION =====
// Intercepter TOUS les appels eth_requestAccounts pour traquer les doublons
window.INVESTIGATION_CALLS = [];
if (window.ethereum && window.ethereum.request) {
    const originalRequest = window.ethereum.request;
    window.ethereum.request = function(...args) {
        if (args[0]?.method === 'eth_requestAccounts') {
            const call = {
                timestamp: performance.now(),
                stack: new Error().stack,
                args: args,
                source: 'HOOK_GLOBAL'
            };
            window.INVESTIGATION_CALLS.push(call);
            console.log('🎯 INVESTIGATION: Appel #' + window.INVESTIGATION_CALLS.length, call);
            console.log('🎯 INVESTIGATION: Total appels eth_requestAccounts:', window.INVESTIGATION_CALLS.length);
        }
        return originalRequest.apply(this, args);
    };
    console.log('🎯 INVESTIGATION: Hook global eth_requestAccounts installé');
} else {
    console.log('🎯 INVESTIGATION: window.ethereum non disponible pour hook');
}

// ===== FONCTION DE DIAGNOSTIC INVESTIGATION =====
window.INVESTIGATION_DIAGNOSTIC = function() {
    console.log('🎯 INVESTIGATION: === DIAGNOSTIC COMPLET ===');
    console.log('🎯 INVESTIGATION: Total appels eth_requestAccounts:', window.INVESTIGATION_CALLS?.length || 0);
    
    if (window.INVESTIGATION_CALLS && window.INVESTIGATION_CALLS.length > 0) {
        window.INVESTIGATION_CALLS.forEach((call, index) => {
            console.log(`🎯 INVESTIGATION: Appel #${index + 1}:`, {
                timestamp: call.timestamp,
                source: call.source,
                stack: call.stack
            });
        });
    }
    
    console.log('🎯 INVESTIGATION: État système actuel:');
    console.log('🎯 INVESTIGATION:   - window.ethereum:', !!window.ethereum);
    console.log('🎯 INVESTIGATION:   - BOOMSWAP_CONNECT_METAMASK:', typeof window.BOOMSWAP_CONNECT_METAMASK);
    console.log('🎯 INVESTIGATION:   - BOOMSWAP_CONNECT_WALLETCONNECT:', typeof window.BOOMSWAP_CONNECT_WALLETCONNECT);
    console.log('🎯 INVESTIGATION: === FIN DIAGNOSTIC ===');
};

// ===== VARIABLES GLOBALES =====

/**
 * BOOMBOXSWAP V1 - Main JavaScript
 * Orchestration de tous les composants
 */

// Le système de contrôle est maintenant dans init-control.js

// === GESTION ÉTAT WALLET ===
// SUPPRIMÉ : showWalletInvitation, hideWalletInvitation, clearPortfolioData, grisé

// SUPPRIMÉ: Fonction setAllCardsToZero() - INUTILE
// Les éléments HTML sont maintenant initialisés avec "---" par défaut

class BoomboxApp {
    constructor() {
        // Vérifier si une instance existe déjà
        if (window.BoomboxApp && window.BoomboxApp !== this) {
            console.log('Instance BoomboxApp déjà existante, arrêt...');
            return window.BoomboxApp;
        }
        
        this.isInitialized = false;
        this.priceUpdateInterval = null;
        
        // Initialiser les modules spécialisés
        this.musicController = null;
        this.rangeConfigController = null;
        this.notificationManager = null;

        // SUPPRIMÉ : this.init() automatique
        // L'initialisation se fait maintenant manuellement
        console.log('BoomboxApp créé - initialisation manuelle requise');
    }

    /**
     * Initialisation de l'application
     */
    async init() {
        const timestamp = Date.now();
        console.log(`🎯 AUDIT [${timestamp}]: BOOMBOXSWAP V1 - INITIALISATION DÉMARRÉE`);
        console.log(`🎯 AUDIT [${timestamp}]: État DOM:`, document.readyState);
        console.log(`🎯 AUDIT [${timestamp}]: BOOMBOX_INIT_CONTROL:`, !!window.BOOMBOX_INIT_CONTROL);
        console.log(`🎯 AUDIT [${timestamp}]: État système au démarrage:`);
        console.log(`🎯 AUDIT [${timestamp}]:   - window.ethereum:`, !!window.ethereum);
        console.log(`🎯 AUDIT [${timestamp}]:   - BOOMSWAP_CONNECT_METAMASK:`, typeof window.BOOMSWAP_CONNECT_METAMASK);
        console.log(`🎯 AUDIT [${timestamp}]:   - BOOMSWAP_CONNECT_WALLETCONNECT:`, typeof window.BOOMSWAP_CONNECT_WALLETCONNECT);

        try {
            // Vérifier si déjà initialisé MAIS permettre la réinitialisation
            if (window.BOOMBOX_INIT_CONTROL && window.BOOMBOX_INIT_CONTROL.isInitialized('app')) {
                console.log(`🎯 AUDIT [${timestamp}]: Application déjà initialisée, réinitialisation...`);
                // Réinitialiser les flags
                window.BOOMBOX_INIT_CONTROL.appInitialized = false;
            }

            // Attendre que le DOM soit chargé
            if (document.readyState === 'loading') {
                console.log(`🎯 AUDIT [${timestamp}]: DOM en cours de chargement, attente...`);
                document.addEventListener('DOMContentLoaded', () => {
                    const domTimestamp = Date.now();
                    console.log(`🎯 AUDIT [${domTimestamp}]: DOM chargé, appel setupApp()`);
                    this.setupApp();
                });
            } else {
                console.log(`🎯 AUDIT [${timestamp}]: DOM déjà chargé, appel setupApp() immédiat`);
                this.setupApp();
            }

        } catch (error) {
            console.error(`🎯 AUDIT [${timestamp}]: ERREUR INITIALISATION:`, error);
            this.showError('ERREUR INITIALISATION', error.message);
        }
    }

    /**
     * Configuration de l'application
     */
    async setupApp() {
        const timestamp = Date.now();
        console.log(`🎯 AUDIT [${timestamp}]: Configuration de l'application...`);
        
        try {
            // Toujours permettre l'initialisation
            console.log(`🎯 AUDIT [${timestamp}]: Début setupApp`);
            
            // Initialiser les composants
            console.log(`🎯 AUDIT [${timestamp}]: 1. setupEventListeners()`);
            this.setupEventListeners();
            
            console.log(`🎯 AUDIT [${timestamp}]: 2. setupNavigation()`);
            this.setupNavigation();
            
            console.log(`🎯 AUDIT [${timestamp}]: 3. setupWalletModal()`);
            this.setupWalletModal();
            
            console.log(`🎯 AUDIT [${timestamp}]: 4. Initialisation modules spécialisés`);
            this.initializeSpecializedModules();
            
            console.log(`🎯 AUDIT [${timestamp}]: 6. setupMetaMask()`);
            this.setupMetaMask();
            
            console.log(`🎯 AUDIT [${timestamp}]: 7. initializeWalletConnections()`);
            this.initializeWalletConnections();
            
            console.log(`🎯 AUDIT [${timestamp}]: 8. testApiConnection()`);
            await this.testApiConnection();
            
            console.log(`🎯 AUDIT [${timestamp}]: 9. startPriceMonitoring()`);
            this.startPriceMonitoring();
            
            // Initialiser la surveillance des soldes Card 1
            console.log(`🎯 AUDIT [${timestamp}]: 10. setupSoldesCardSurveillance()`);
            setupSoldesCardSurveillance();
            
            // Initialiser Card 1 à zéro au premier chargement
            try {
                window.BOOMBOX_SUPPRESS_BALANCE_UPDATES = true;
                if (window.BoomboxUI && window.BoomboxUI.clearBalances) {
                    window.BoomboxUI.clearBalances();
                } else {
                    const bnbEl = document.getElementById('balance-bnb');
                    const usdtEl = document.getElementById('balance-usdt');
                    const cakeEl = document.getElementById('balance-cake');
                    const totalEl = document.getElementById('total-value');
                    if (bnbEl) bnbEl.textContent = '0.000000';
                    if (usdtEl) usdtEl.textContent = '0.0000';
                    if (cakeEl) cakeEl.textContent = '0.000000';
                    if (totalEl) totalEl.textContent = '$0.00';
                }

                // Correction démarrage: garantir le logo natif uniquement si absent
                try {
                    const cm = window.BoomboxChainManager;
                    const chain = (
                        cm && typeof cm.getCurrentChain === 'function'
                    ) ? cm.getCurrentChain() : { nativeToken: 'BNB' };
                    const nativeToken = chain && chain.nativeToken
                        ? chain.nativeToken : 'BNB';

                    const item = document.querySelector(
                        '.balance-content .balance-item:first-child'
                    );
                    if (item) {
                        const label = item.querySelector('.balance-label');
                        let img = label && label.querySelector('.token-logo');
                        // Ne créer/assigner que si le logo est manquant ou incorrect
                        let expectedSrc = 'assets/images/tokens/bnb.svg';
                        let expectedAlt = 'BNB';
                        if (nativeToken === 'ETH') {
                            expectedSrc = 'assets/images/tokens/ethereum.svg';
                            expectedAlt = 'ETH';
                        } else if (nativeToken === 'SOL') {
                            expectedSrc = 'assets/images/tokens/sol.svg';
                            expectedAlt = 'SOL';
                        }
                        if (!img && label) {
                            img = document.createElement('img');
                            img.className = 'token-logo';
                            img.alt = expectedAlt;
                            img.src = expectedSrc;
                            label.prepend(img);
                        } else if (img) {
                            const currentSrc = img.getAttribute('src') || '';
                            if (!currentSrc.includes(expectedSrc)) {
                                img.src = expectedSrc;
                            }
                            if (img.alt !== expectedAlt) img.alt = expectedAlt;
                        }
                    }
                } catch (_) {}
            } catch (_) {}
            
            // Marquer comme initialisé
            if (window.BOOMBOX_INIT_CONTROL) {
                window.BOOMBOX_INIT_CONTROL.setInitialized('app');
            }
            
            const endTimestamp = Date.now();
            console.log(`🎯 AUDIT [${endTimestamp}]: Configuration terminée avec succès`);
            console.log(`🎯 AUDIT [${endTimestamp}]: État final système:`);
            console.log(`🎯 AUDIT [${endTimestamp}]:   - BOOMSWAP_CONNECT_METAMASK:`, typeof window.BOOMSWAP_CONNECT_METAMASK);
            console.log(`🎯 AUDIT [${endTimestamp}]:   - BOOMSWAP_CONNECT_WALLETCONNECT:`, typeof window.BOOMSWAP_CONNECT_WALLETCONNECT);
            console.log(`🎯 AUDIT [${endTimestamp}]:   - Modal display:`, document.getElementById('walletModal')?.style.display);
            
            // ===== DIAGNOSTIC INVESTIGATION AU DÉMARRAGE =====
            console.log(`🎯 INVESTIGATION: Diagnostic au démarrage...`);
            if (window.INVESTIGATION_DIAGNOSTIC) {
                window.INVESTIGATION_DIAGNOSTIC();
            }
            
        } catch (error) {
            console.error(`🎯 AUDIT [${timestamp}]: ERREUR CONFIGURATION:`, error);
            this.showError('CONFIGURATION', error.message);
        }
    }

    /**
     * Configuration des event listeners
     */
    setupEventListeners() {
        // Écouter événements système
        if (window.BoomboxEvents) {
            window.BoomboxEvents.on(window.BoomboxEvents.EVENTS.CHAIN_CHANGED, (data) => {
                this.onChainChanged(data);
            });

            window.BoomboxEvents.on(window.BoomboxEvents.EVENTS.PRICE_UPDATED, (data) => {
                this.onPriceUpdated(data);
            });

            window.BoomboxEvents.on(window.BoomboxEvents.EVENTS.SYSTEM_ERROR, (data) => {
                this.showError(data.context, data.error);
            });
        }
    }

    /**
     * Configuration navigation
     */
    setupNavigation() {
        const navPoints = document.querySelectorAll('.nav-point');
        navPoints.forEach(point => {
            point.addEventListener('click', (e) => {
                const page = e.target.dataset.page;
                this.switchPage(page);
            });
        });
    }

    /**
     * Configuration modal wallet
     */
    setupWalletModal() {
        const timestamp = Date.now();
        console.log(`🎯 AUDIT MODAL [${timestamp}]: === SETUP WALLET MODAL DÉMARRÉ ===`);
        
        // ===== SURVEILLANCE FORENSIQUE SPÉCIFIQUE =====
        console.log(`🎯 AUDIT FORENSIQUE [${timestamp}]: === SURVEILLANCE MODAL SPÉCIFIQUE ===`);
        
        // Utiliser uniquement le bouton principal wallet-btn
        const walletBtn = document.getElementById('wallet-btn');
        const walletModal = document.getElementById('walletModal');
        const closeModal = document.getElementById('closeModal');

        console.log(`🎯 AUDIT MODAL [${timestamp}]: VÉRIFICATION ÉLÉMENTS DOM:`);
        console.log(`🎯 AUDIT MODAL [${timestamp}]:   - wallet-btn trouvé:`, !!walletBtn);
        console.log(`🎯 AUDIT MODAL [${timestamp}]:   - walletModal trouvé:`, !!walletModal);
        console.log(`🎯 AUDIT MODAL [${timestamp}]:   - closeModal trouvé:`, !!closeModal);

        // ===== AUDIT STRUCTURE HTML MODAL =====
        if (walletModal) {
            console.log(`🎯 AUDIT MODAL [${timestamp}]: === INSPECTION STRUCTURE HTML MODAL ===`);
            console.log(`🎯 AUDIT MODAL [${timestamp}]: HTML modal complet:`, walletModal.innerHTML);
            
            // Inspecter les boutons de connexion
            const metaMaskOption = document.getElementById('connect-metamask');
            const walletConnectOption = document.getElementById('connect-walletconnect');
            
            console.log(`🎯 AUDIT MODAL [${timestamp}]: VÉRIFICATION BOUTONS CONNEXION:`);
            console.log(`🎯 AUDIT MODAL [${timestamp}]:   - MetaMask bouton trouvé:`, !!metaMaskOption);
            console.log(`🎯 AUDIT MODAL [${timestamp}]:   - WalletConnect bouton trouvé:`, !!walletConnectOption);
            
            if (metaMaskOption) {
                console.log(`🎯 AUDIT MODAL [${timestamp}]: DÉTAILS BOUTON METAMASK:`);
                console.log(`🎯 AUDIT MODAL [${timestamp}]:   - ID:`, metaMaskOption.id);
                console.log(`🎯 AUDIT MODAL [${timestamp}]:   - Classes:`, metaMaskOption.className);
                console.log(`🎯 AUDIT MODAL [${timestamp}]:   - HTML complet:`, metaMaskOption.innerHTML);
                console.log(`🎯 AUDIT MODAL [${timestamp}]:   - Text content:`, metaMaskOption.textContent);
                
                // Vérifier l'image MetaMask
                const metaMaskImg = metaMaskOption.querySelector('img');
                console.log(`🎯 AUDIT MODAL [${timestamp}]:   - Image trouvée:`, !!metaMaskImg);
                if (metaMaskImg) {
                    console.log(`🎯 AUDIT MODAL [${timestamp}]:   - Src image:`, metaMaskImg.src);
                    console.log(`🎯 AUDIT MODAL [${timestamp}]:   - Alt image:`, metaMaskImg.alt);
                    console.log(`🎯 AUDIT MODAL [${timestamp}]:   - Classes image:`, metaMaskImg.className);
                    
                    // ===== CORRECTION CHIRURGICALE : VÉRIFICATION IMAGES =====
                    console.log(`🎯 AUDIT IMAGES [${timestamp}]: Vérification chargement MetaMask SVG...`);
                    
                    // Test de chargement MetaMask
                    const testMetaMaskImg = new Image();
                    testMetaMaskImg.onload = () => {
                        console.log(`✅ AUDIT IMAGES [${timestamp}]: MetaMask SVG chargé avec succès`);
                    };
                    testMetaMaskImg.onerror = () => {
                        console.log(`❌ AUDIT IMAGES [${timestamp}]: MetaMask SVG INTROUVABLE - Création placeholder`);
                        // Créer placeholder SVG pour MetaMask
                        const placeholderSVG = createPlaceholderSVG('MM', '#f6851b');
                        metaMaskImg.src = placeholderSVG;
                    };
                    testMetaMaskImg.src = '/assets/images/icons/metamask.svg';
                    
                    // Vérifier CSS styles
                    console.log(`🎯 AUDIT CSS [${timestamp}]: Vérification styles wallet-logo...`);
                    const styles = window.getComputedStyle(metaMaskImg);
                    console.log(`🎯 AUDIT CSS [${timestamp}]:   - Display:`, styles.display);
                    console.log(`🎯 AUDIT CSS [${timestamp}]:   - Visibility:`, styles.visibility);
                    console.log(`🎯 AUDIT CSS [${timestamp}]:   - Width:`, styles.width);
                    console.log(`🎯 AUDIT CSS [${timestamp}]:   - Height:`, styles.height);
                    console.log(`🎯 AUDIT CSS [${timestamp}]:   - Opacity:`, styles.opacity);
                    
                    // Appliquer CSS de secours si nécessaire
                    if (styles.display === 'none' || styles.visibility === 'hidden' || styles.opacity === '0') {
                        console.log(`🔧 AUDIT CSS [${timestamp}]: Application CSS de secours pour MetaMask`);
                        metaMaskImg.style.display = 'block';
                        metaMaskImg.style.visibility = 'visible';
                        metaMaskImg.style.opacity = '1';
                    }
                }
                
                // Vérifier le label
                const metaMaskLabel = metaMaskOption.querySelector('.wallet-label');
                console.log(`🎯 AUDIT MODAL [${timestamp}]:   - Label trouvé:`, !!metaMaskLabel);
                if (metaMaskLabel) {
                    console.log(`🎯 AUDIT MODAL [${timestamp}]:   - Text label:`, metaMaskLabel.textContent);
                }
            }
            
            if (walletConnectOption) {
                console.log(`🎯 AUDIT MODAL [${timestamp}]: DÉTAILS BOUTON WALLETCONNECT:`);
                console.log(`🎯 AUDIT MODAL [${timestamp}]:   - ID:`, walletConnectOption.id);
                console.log(`🎯 AUDIT MODAL [${timestamp}]:   - Classes:`, walletConnectOption.className);
                console.log(`🎯 AUDIT MODAL [${timestamp}]:   - HTML complet:`, walletConnectOption.innerHTML);
                console.log(`🎯 AUDIT MODAL [${timestamp}]:   - Text content:`, walletConnectOption.textContent);
                
                // Vérifier l'image WalletConnect
                const walletConnectImg = walletConnectOption.querySelector('img');
                console.log(`🎯 AUDIT MODAL [${timestamp}]:   - Image trouvée:`, !!walletConnectImg);
                if (walletConnectImg) {
                    console.log(`🎯 AUDIT MODAL [${timestamp}]:   - Src image:`, walletConnectImg.src);
                    console.log(`🎯 AUDIT MODAL [${timestamp}]:   - Alt image:`, walletConnectImg.alt);
                    console.log(`🎯 AUDIT MODAL [${timestamp}]:   - Classes image:`, walletConnectImg.className);
                    
                    // ===== CORRECTION CHIRURGICALE : VÉRIFICATION IMAGES =====
                    console.log(`🎯 AUDIT IMAGES [${timestamp}]: Vérification chargement WalletConnect SVG...`);
                    
                    // Test de chargement WalletConnect
                    const testWalletConnectImg = new Image();
                    testWalletConnectImg.onload = () => {
                        console.log(`✅ AUDIT IMAGES [${timestamp}]: WalletConnect SVG chargé avec succès`);
                    };
                    testWalletConnectImg.onerror = () => {
                        console.log(`❌ AUDIT IMAGES [${timestamp}]: WalletConnect SVG INTROUVABLE - Création placeholder`);
                        // Créer placeholder SVG pour WalletConnect
                        const placeholderSVG = createPlaceholderSVG('WC', '#3b99fc');
                        walletConnectImg.src = placeholderSVG;
                    };
                    testWalletConnectImg.src = '/assets/images/icons/walletconnect.svg';
                    
                    // Vérifier CSS styles
                    console.log(`🎯 AUDIT CSS [${timestamp}]: Vérification styles wallet-logo...`);
                    const styles = window.getComputedStyle(walletConnectImg);
                    console.log(`🎯 AUDIT CSS [${timestamp}]:   - Display:`, styles.display);
                    console.log(`🎯 AUDIT CSS [${timestamp}]:   - Visibility:`, styles.visibility);
                    console.log(`🎯 AUDIT CSS [${timestamp}]:   - Width:`, styles.width);
                    console.log(`🎯 AUDIT CSS [${timestamp}]:   - Height:`, styles.height);
                    console.log(`🎯 AUDIT CSS [${timestamp}]:   - Opacity:`, styles.opacity);
                    
                    // Appliquer CSS de secours si nécessaire
                    if (styles.display === 'none' || styles.visibility === 'hidden' || styles.opacity === '0') {
                        console.log(`🔧 AUDIT CSS [${timestamp}]: Application CSS de secours pour WalletConnect`);
                        walletConnectImg.style.display = 'block';
                        walletConnectImg.style.visibility = 'visible';
                        walletConnectImg.style.opacity = '1';
                    }
                }
                
                // Vérifier le label
                const walletConnectLabel = walletConnectOption.querySelector('.wallet-label');
                console.log(`🎯 AUDIT MODAL [${timestamp}]:   - Label trouvé:`, !!walletConnectLabel);
                if (walletConnectLabel) {
                    console.log(`🎯 AUDIT MODAL [${timestamp}]:   - Text label:`, walletConnectLabel.textContent);
                }
            }
            
            console.log(`🎯 AUDIT MODAL [${timestamp}]: === INSPECTION STRUCTURE HTML TERMINÉE ===`);
        }

        if (walletBtn) {
            console.log(`🎯 AUDIT MODAL [${timestamp}]: DÉTAILS BOUTON WALLET:`);
            console.log(`🎯 AUDIT MODAL [${timestamp}]:   - ID:`, walletBtn.id);
            console.log(`🎯 AUDIT MODAL [${timestamp}]:   - Classes:`, walletBtn.className);
            console.log(`🎯 AUDIT MODAL [${timestamp}]:   - Disabled:`, walletBtn.disabled);
            console.log(`🎯 AUDIT MODAL [${timestamp}]:   - Style display:`, walletBtn.style.display);
            console.log(`🎯 AUDIT MODAL [${timestamp}]:   - Style visibility:`, walletBtn.style.visibility);
            console.log(`🎯 AUDIT MODAL [${timestamp}]:   - Style pointer-events:`, walletBtn.style.pointerEvents);
            
            // Vérifier si déjà un event listener
            const hasClickListener = walletBtn.onclick || walletBtn._hasClickListeners;
            console.log(`🎯 AUDIT MODAL [${timestamp}]:   - Déjà un event listener:`, !!hasClickListener);
            
            if (!hasClickListener) {
                // ===== CORRECTION CHIRURGICALE : DEBOUNCE OPTIMISÉ =====
                let lastClickTime = 0;
                const DEBOUNCE_DELAY = 500; // Réduit de 2000ms à 500ms pour réactivité
                
                            walletBtn.addEventListener('click', async (event) => {
                const clickTimestamp = Date.now();
                console.log(`🎯 AUDIT MODAL [${clickTimestamp}]: CLIC BOUTON WALLET DÉTECTÉ`);
                
                // ===== SURVEILLANCE FORENSIQUE BOUTON PRINCIPAL =====
                console.log(`🎯 AUDIT FORENSIQUE [${clickTimestamp}]: === CLIC BOUTON WALLET PRINCIPAL ===`);
                console.log(`🎯 AUDIT FORENSIQUE [${clickTimestamp}]: État bouton au clic:`);
                console.log(`🎯 AUDIT FORENSIQUE [${clickTimestamp}]:   - ID:`, walletBtn.id);
                console.log(`🎯 AUDIT FORENSIQUE [${clickTimestamp}]:   - Classes:`, walletBtn.className);
                console.log(`🎯 AUDIT FORENSIQUE [${clickTimestamp}]:   - Disabled:`, walletBtn.disabled);
                console.log(`🎯 AUDIT FORENSIQUE [${clickTimestamp}]:   - Text content:`, walletBtn.textContent);
                console.log(`🎯 AUDIT FORENSIQUE [${clickTimestamp}]:   - Event type:`, event.type);
                console.log(`🎯 AUDIT FORENSIQUE [${clickTimestamp}]:   - Event isTrusted:`, event.isTrusted);
                
                // DEBOUNCE PROTECTION
                const now = Date.now();
                if (now - lastClickTime < DEBOUNCE_DELAY) {
                    console.log(`🎯 AUDIT MODAL [${clickTimestamp}]: CLIC TROP RAPIDE - IGNORÉ`);
                    console.log(`🎯 AUDIT FORENSIQUE [${clickTimestamp}]: Délai depuis dernier clic:`, now - lastClickTime, 'ms');
                    return;
                }
                lastClickTime = now;
                
                console.log(`🎯 AUDIT MODAL [${clickTimestamp}]:   - Event type:`, event.type);
                console.log(`🎯 AUDIT MODAL [${clickTimestamp}]:   - Event target:`, event.target);
                console.log(`🎯 AUDIT MODAL [${clickTimestamp}]:   - Event currentTarget:`, event.currentTarget);
                
                try {
                    // Si déjà connecté, déconnecter
                    if (window.BOOMSWAP_CURRENT_ADDRESS) {
                        console.log(`🎯 AUDIT MODAL [${clickTimestamp}]: Déconnexion en cours...`);
                        console.log(`🎯 AUDIT FORENSIQUE [${clickTimestamp}]: === DÉCONNEXION WALLET ===`);
                        console.log(`🎯 AUDIT FORENSIQUE [${clickTimestamp}]: État AVANT déconnexion:`);
                        console.log(`🎯 AUDIT FORENSIQUE [${clickTimestamp}]:   - BOOMSWAP_CURRENT_ADDRESS:`, window.BOOMSWAP_CURRENT_ADDRESS);
                        console.log(`🎯 AUDIT FORENSIQUE [${clickTimestamp}]:   - Bouton classes:`, walletBtn.className);
                        console.log(`🎯 AUDIT FORENSIQUE [${clickTimestamp}]:   - Bouton disabled:`, walletBtn.disabled);
                        
                        await window.BOOMSWAP_DISCONNECT();
                        this.handleWalletDisconnected();
                        
                        console.log(`🎯 AUDIT FORENSIQUE [${clickTimestamp}]: État APRÈS déconnexion:`);
                        console.log(`🎯 AUDIT FORENSIQUE [${clickTimestamp}]:   - BOOMSWAP_CURRENT_ADDRESS:`, window.BOOMSWAP_CURRENT_ADDRESS);
                        console.log(`🎯 AUDIT FORENSIQUE [${clickTimestamp}]:   - Bouton classes:`, walletBtn.className);
                        console.log(`🎯 AUDIT FORENSIQUE [${clickTimestamp}]:   - Bouton disabled:`, walletBtn.disabled);
                        console.log(`🎯 AUDIT FORENSIQUE [${clickTimestamp}]:   - Bouton text:`, walletBtn.textContent);
                        return;
                    }
                    
                    // RESTAURÉ : Ouvrir modal de choix (comme avant)
                    console.log(`🎯 AUDIT MODAL [${clickTimestamp}]: OUVERTURE MODAL CONNEXION WALLET...`);
                    this.showWalletModal();
                    
                } catch (error) {
                    console.error(`🎯 AUDIT MODAL [${clickTimestamp}]: Erreur gestion wallet:`, error);
                    this.showError('Wallet', 'Erreur de connexion/déconnexion');
                }
            });
                walletBtn._hasClickListeners = true;
                console.log(`🎯 AUDIT MODAL [${timestamp}]: Event listener ajouté sur bouton wallet`);
            } else {
                console.log(`🎯 AUDIT MODAL [${timestamp}]: Event listener déjà présent sur bouton wallet`);
            }
        } else {
            console.error(`🎯 AUDIT MODAL [${timestamp}]: BOUTON WALLET NON TROUVÉ !`);
            console.error(`🎯 AUDIT MODAL [${timestamp}]: Vérifiez que l'élément avec ID "wallet-btn" existe dans le DOM`);
        }

        if (walletModal) {
            console.log(`🎯 AUDIT MODAL [${timestamp}]: DÉTAILS MODAL WALLET:`);
            console.log(`🎯 AUDIT MODAL [${timestamp}]:   - ID:`, walletModal.id);
            console.log(`🎯 AUDIT MODAL [${timestamp}]:   - Classes:`, walletModal.className);
            console.log(`🎯 AUDIT MODAL [${timestamp}]:   - Style display:`, walletModal.style.display);
            console.log(`🎯 AUDIT MODAL [${timestamp}]:   - Style visibility:`, walletModal.style.visibility);
        } else {
            console.error(`🎯 AUDIT MODAL [${timestamp}]: MODAL WALLET NON TROUVÉ !`);
            console.error(`🎯 AUDIT MODAL [${timestamp}]: Vérifiez que l'élément avec ID "walletModal" existe dans le DOM`);
        }

        console.log(`🎯 AUDIT MODAL [${timestamp}]: === SETUP WALLET MODAL TERMINÉ ===`);

        if (closeModal) {
            closeModal.addEventListener('click', () => {
                const closeTimestamp = Date.now();
                console.log(`🎯 AUDIT MODAL [${closeTimestamp}]: Clic sur fermer modal`);
                this.hideWalletModal();
            });
        }

        // Fermer modal en cliquant à l'extérieur
        if (walletModal) {
            walletModal.addEventListener('click', (e) => {
                if (e.target === walletModal) {
                    this.hideWalletModal();
                }
            });
        }

        // Listener sur le bouton Annuler de la modale
        const closeWalletModal = document.getElementById('close-wallet-modal');
        if (closeWalletModal) {
            closeWalletModal.onclick = () => {
                console.log('Clic sur Annuler');
                this.hideWalletModal();
            };
        }

        // Configuration WalletConnect (QR personnalisé dans notre modal)
        const walletConnectOption = document.getElementById('connect-walletconnect');
        if (walletConnectOption) {
            walletConnectOption.onclick = async () => {
                try {
                    // Routage selon la chaîne active
                    const isSol = !!(window.BoomboxChainManager && window.BoomboxChainManager.getCurrentChain && window.BoomboxChainManager.getCurrentChain().type === 'solana');

                    if (isSol) {
                        // Solana: uniquement providers injectés (MetaMask Snap via bouton MetaMask, ou Phantom)
                        try {
                            if (typeof window.BOOMB_CONNECT_SOLANA_INJECTED === 'function') {
                                const r = await window.BOOMB_CONNECT_SOLANA_INJECTED();
                                if (r && r.pubkey) {
                                    if (window.BoomboxWalletModal) window.BoomboxWalletModal.hide();
                                    if (window.showNotification) window.showNotification('Wallet Solana connecté', 'success');
                                    return;
                                }
                            }
                        } catch (_) {}
                        this.showError('Wallet', 'Aucun wallet Solana injecté détecté');
                        return;
                    }

                    // EVM uniquement: préparer et afficher le QR WalletConnect
                    const qrContainer = document.getElementById('walletqr-qrcode');
                    if (qrContainer) qrContainer.innerHTML = '';
                    if (window.BoomboxWalletQRModal) window.BoomboxWalletQRModal.show();

                    // Flux EVM existant
                    if (typeof window.BOOMSWAP_CONNECT_WALLETCONNECT === 'function') {
                        const result = await window.BOOMSWAP_CONNECT_WALLETCONNECT();
                        if (result && result.address) {
                            if (window.BoomboxWalletQRModal) window.BoomboxWalletQRModal.hide();
                            if (window.BoomboxWalletModal) window.BoomboxWalletModal.hide();
                            this.handleWalletConnected(result.address, result.chainId);
                        } else {
                            // Si le wallet dit "connecté" mais pas de result, tenter récupération comptes
                            try {
                                const prov = window.BOOMSWAP_CURRENT_PROVIDER;
                                if (prov) {
                                    const web3tmp = new Web3(prov);
                                    const accs = await web3tmp.eth.getAccounts();
                                    if (accs && accs.length > 0) {
                                        const chId = parseInt(await web3tmp.eth.getChainId());
                                        if (window.BoomboxWalletQRModal) window.BoomboxWalletQRModal.hide();
                                        if (window.BoomboxWalletModal) window.BoomboxWalletModal.hide();
                                        this.handleWalletConnected(accs[0], chId);
                                    }
                                }
                            } catch (e) {
                                console.warn('Post-connexion: récupération comptes échouée', e);
                            }
                        }
                    } else {
                        console.warn('Fonction BOOMSWAP_CONNECT_WALLETCONNECT indisponible');
                        // Trigger manuel: si provider prêt mais fonction absente
                        if (window.BOOMSWAP_WALLETCONNECT_READY && window.WalletConnectEthereumProvider) {
                            try {
                                // Démarrer un init minimal pour déclencher display_uri
                                const provider = await window.WalletConnectEthereumProvider.init({
                                    projectId: window.BOOMSWAP_PROJECT_ID,
                                    chains: window.BOOMSWAP_CHAINS,
                                    rpcMap: window.BOOMSWAP_RPC_MAP,
                                    showQrModal: false
                                });
                                // Conserver comme provider courant pour fallback post-connexion
                                window.BOOMSWAP_CURRENT_PROVIDER = provider;
                                provider.on && provider.on('display_uri', (uri) => {
                                    const container = document.getElementById('walletqr-qrcode');
                                    if (container) {
                                        container.innerHTML = '';
                                        let text = null;
                                        if (typeof uri === 'string') text = uri;
                                        else if (uri) {
                                            if (uri.uri) text = uri.uri;
                                            else if (uri.data) text = uri.data;
                                            else if (uri.params && uri.params[0]) text = uri.params[0];
                                        }
                                        if (text) new QRCode(container, { text, width: 220, height: 220, colorDark: '#000000', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.M });
                                        if (window.BoomboxWalletQRModal) window.BoomboxWalletQRModal.show();
                                    }
                                });
                                await provider.enable();
                            } catch (e) {
                                console.warn('Init WalletConnect minimal échoué', e);
                            }
                        }
                    }
                } catch (err) {
                    console.error('ERREUR WalletConnect:', err);
                    this.showError('WalletConnect', err.message || 'Erreur inconnue');
                }
            };
        } else {
            console.error(`🎯 AUDIT MODAL [${timestamp}]: BOUTON WALLETCONNECT NON TROUVÉ !`);
        }

        // Configuration MetaMask avec workflow modal correct
        const metamaskOption = document.getElementById('connect-metamask');
        if (metamaskOption) {
            // ===== SURVEILLANCE FORENSIQUE META MASK =====
            console.log(`🎯 AUDIT FORENSIQUE [${timestamp}]: === SURVEILLANCE META MASK ===`);
            console.log(`🎯 AUDIT FORENSIQUE [${timestamp}]: État initial bouton MetaMask:`);
            console.log(`🎯 AUDIT FORENSIQUE [${timestamp}]:   - HTML complet:`, metamaskOption.innerHTML);
            console.log(`🎯 AUDIT FORENSIQUE [${timestamp}]:   - Text content:`, metamaskOption.textContent);
            console.log(`🎯 AUDIT FORENSIQUE [${timestamp}]:   - onclick déjà défini:`, !!metamaskOption.onclick);
            console.log(`🎯 AUDIT FORENSIQUE [${timestamp}]:   - dataset.listenerAdded:`, metamaskOption.dataset.listenerAdded);
            
            // ===== INVESTIGATION EVENT LISTENERS =====
            console.log(`🎯 INVESTIGATION: Vérification event listeners MetaMask:`);
            console.log(`🎯 INVESTIGATION: onclick déjà défini:`, !!metamaskOption.onclick);
            console.log(`🎯 INVESTIGATION: dataset.listenerAdded:`, metamaskOption.dataset.listenerAdded);
            
            // Vérifier si déjà un event listener
            if (metamaskOption.dataset.listenerAdded) {
                console.log(`🚨 INVESTIGATION: EVENT LISTENER DÉJÀ AJOUTÉ !`);
                console.log(`🚨 INVESTIGATION: Doublon détecté - source du problème probable`);
            } else {
                metamaskOption.dataset.listenerAdded = 'true';
                console.log(`🎯 INVESTIGATION: Marqueur event listener ajouté`);
            }
            
            metamaskOption.onclick = async () => {
                const clickTimestamp = Date.now();
                console.log(`🎯 AUDIT MODAL [${clickTimestamp}]: CLIC META MASK DANS MODAL DÉTECTÉ`);
                
                // ===== SURVEILLANCE FORENSIQUE CLIC =====
                console.log(`🎯 AUDIT FORENSIQUE [${clickTimestamp}]: === CLIC META MASK ===`);
                console.log(`🎯 AUDIT FORENSIQUE [${clickTimestamp}]: État bouton AVANT clic:`);
                console.log(`🎯 AUDIT FORENSIQUE [${clickTimestamp}]:   - HTML:`, metamaskOption.innerHTML);
                console.log(`🎯 AUDIT FORENSIQUE [${clickTimestamp}]:   - Text:`, metamaskOption.textContent);
                console.log(`🎯 AUDIT FORENSIQUE [${clickTimestamp}]:   - Classes:`, metamaskOption.className);
                
                // Vérifier état système au moment du clic
                console.log(`🎯 AUDIT MODAL [${clickTimestamp}]: État système au clic:`);
                console.log(`🎯 AUDIT MODAL [${clickTimestamp}]:   - BOOMSWAP_CONNECT_METAMASK:`, typeof window.BOOMSWAP_CONNECT_METAMASK);
                console.log(`🎯 AUDIT MODAL [${clickTimestamp}]:   - window.ethereum:`, !!window.ethereum);
                console.log(`🎯 AUDIT MODAL [${clickTimestamp}]:   - isConnecting:`, window.BOOMSWAP_IS_CONNECTING ? window.BOOMSWAP_IS_CONNECTING() : 'N/A');
                
                // Désactiver le bouton pour éviter les doubles clics
                metamaskOption.disabled = true;
                metamaskOption.classList.add('disabled');
                
                // ===== CORRECTION CHIRURGICALE : PRÉSERVER LOGO PENDANT CONNEXION =====
                console.log(`🎯 AUDIT FORENSIQUE [${clickTimestamp}]: LOGO PRÉSERVÉ PENDANT CONNEXION`);
                console.log(`🎯 AUDIT FORENSIQUE [${clickTimestamp}]:   - Logo reste visible et inchangé`);
                console.log(`🎯 AUDIT FORENSIQUE [${clickTimestamp}]:   - AUCUNE modification du bouton`);
                
                // SUPPRIMÉ : metamaskOption.textContent = 'Connexion en cours...';
                // RÉSULTAT : Logo MetaMask reste visible pendant toute la connexion
                
                try {
                    if (window.BOOMSWAP_CONNECT_METAMASK) {
                        console.log(`🎯 AUDIT MODAL [${clickTimestamp}]: LANCEMENT CONNEXION META MASK...`);
                        // Si UI = Solana, l'utilisateur choisit MetaMask pour Snap
                        // MVP: si Solana, ignorer MetaMask et ne rien tenter
                        try {
                            const isSol = !!(window.BoomboxChainManager && window.BoomboxChainManager.getCurrentChain && window.BoomboxChainManager.getCurrentChain().type === 'solana');
                            if (isSol) { return; }
                        } catch (_) {}
                        const result = await window.BOOMSWAP_CONNECT_METAMASK();
                        try { delete window.BOOMBOX_USER_SELECTED_METAMASK_FOR_SOL; } catch (_) {}
                        
                        console.log(`🎯 AUDIT MODAL [${clickTimestamp}]: Résultat connexion:`, result);
                        
                        if (result && result.address) {
                            console.log(`🎯 AUDIT MODAL [${clickTimestamp}]: META MASK CONNECTÉ:`, result.address);
                            // Fermer le modal seulement après connexion réussie
                            this.hideWalletModal();
                            this.handleWalletConnected(result.address, result.chainId);
                        } else if (result === null) {
                            // Connexion déjà en cours - ne pas fermer le modal
                            console.log(`🎯 AUDIT MODAL [${clickTimestamp}]: CONNEXION DÉJÀ EN COURS`);
                        }
                    } else {
                        throw new Error('Fonction connexion MetaMask non disponible');
                    }
                } catch (error) {
                    console.error(`🎯 AUDIT MODAL [${clickTimestamp}]: ERREUR CONNEXION META MASK:`, error);
                    console.error(`🎯 AUDIT MODAL [${clickTimestamp}]:   - Code:`, error.code);
                    console.error(`🎯 AUDIT MODAL [${clickTimestamp}]:   - Message:`, error.message);
                    
                    // Gestion spécifique de l'erreur RPC
                    if (error.message && error.message.includes('Already processing')) {
                        console.log(`🎯 AUDIT MODAL [${clickTimestamp}]: AUTRE CONNEXION EN COURS`);
                        return;
                    }
                    
                    // Gestion des autres erreurs
                    this.showError('MetaMask', error.message);
                } finally {
                    // ===== CORRECTION CHIRURGICALE : RESTAURATION SIMPLIFIÉE =====
                    const restoreTimestamp = Date.now();
                    console.log(`🎯 AUDIT FORENSIQUE [${restoreTimestamp}]: === RESTAURATION BOUTON META MASK ===`);
                    console.log(`🎯 AUDIT FORENSIQUE [${restoreTimestamp}]: Logo préservé - restauration minimale`);
                    
                    // Restaurer seulement l'état du bouton (logo déjà préservé)
                    metamaskOption.disabled = false;
                    metamaskOption.classList.remove('disabled');
                    
                    // SUPPRIMÉ : metamaskOption.textContent = originalText;
                    // RÉSULTAT : Logo reste visible, pas de restauration de texte
                    
                    console.log(`🎯 AUDIT FORENSIQUE [${restoreTimestamp}]: État FINAL:`);
                    console.log(`🎯 AUDIT FORENSIQUE [${restoreTimestamp}]:   - Logo préservé:`, !!metamaskOption.querySelector('img'));
                    console.log(`🎯 AUDIT FORENSIQUE [${restoreTimestamp}]:   - Bouton activé:`, !metamaskOption.disabled);
                }
            };
        } else {
            console.error(`🎯 AUDIT MODAL [${timestamp}]: BOUTON META MASK NON TROUVÉ !`);
        }
    }

    /**
     * Initialisation des modules spécialisés
     */
    initializeSpecializedModules() {
        try {
            // Initialiser le gestionnaire de notifications
            if (window.BoomboxNotificationManager) {
                this.notificationManager = new window.BoomboxNotificationManager();
                console.log('✅ Notification Manager initialisé');
            }

            // Initialiser le contrôleur musical
            if (window.BoomboxMusicController) {
                this.musicController = new window.BoomboxMusicController();
                console.log('✅ Music Controller initialisé');
            }

            // Initialiser le contrôleur de configuration range
            if (window.BoomboxRangeConfigController) {
                this.rangeConfigController = new window.BoomboxRangeConfigController();
                console.log('✅ Range Config Controller initialisé');
            }

        } catch (error) {
            console.error('❌ Erreur initialisation modules spécialisés:', error);
        }
    }



    /**
     * Initialisation de la connexion MetaMask
     */
    setupMetaMask() {
        // Logique MetaMask simple
        if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
            console.log('🦊 MetaMask détecté');
            // Event listener supprimé ici pour éviter le conflit avec initializeWalletConnections()
        } else {
            console.warn('MetaMask non détecté. Veuillez installer l\'extension pour utiliser cette fonctionnalité.');
            // Optionnel : afficher un message dans l'UI
        }
    }

    initializeWalletConnections() {
        console.log('🔄 Initialisation connexions wallet v2...');
        
        // NOUVEAU: Vérifier les fonctions directes au lieu de Web3Modal
        if (!window.BOOMSWAP_CONNECT_METAMASK || !window.BOOMSWAP_CONNECT_WALLETCONNECT) {
            console.error('❌ Fonctions de connexion non disponibles');
            return;
        }
        
        console.log('✅ Fonctions wallet v2 prêtes');
        console.log('🦊 MetaMask function:', !!window.BOOMSWAP_CONNECT_METAMASK);
        console.log('📱 WalletConnect function:', !!window.BOOMSWAP_CONNECT_WALLETCONNECT);
        console.log('🔗 WalletConnect Ready:', !!window.BOOMSWAP_WALLETCONNECT_READY);
        
        // SUPPRESSION : Event listener déplacé dans setupWalletModal() pour éviter les doublons
        // Le bouton wallet est maintenant géré uniquement dans setupWalletModal()
        // L'initialisation MetaMask se fait automatiquement dans metamask-config.js
    }



    async disconnectWallet() {
        try {
            console.log('🔌 Déconnexion wallet...');
            // Forcer arrêt modules
            this.disableWalletFeatures && this.disableWalletFeatures();
            // Remise à zéro immédiate Card 1
            try {
                const zeroBalances = { bnb: 0, usdt: 0, cake: 0, totalUsd: 0 };
                if (window.BoomboxUI && window.BoomboxUI.setBalances) {
                    window.BoomboxUI.setBalances(zeroBalances);
                }
                const bnbEl = document.getElementById('balance-bnb');
                const usdtEl = document.getElementById('balance-usdt');
                const cakeEl = document.getElementById('balance-cake');
                const totalEl = document.getElementById('total-value');
                if (bnbEl) bnbEl.textContent = '0.000000';
                if (usdtEl) usdtEl.textContent = '0.0000';
                if (cakeEl) cakeEl.textContent = '0.000000';
                if (totalEl) totalEl.textContent = '$0.00';
            } catch (_) {}
            // Reset variables globales
            window.BOOMSWAP_CURRENT_PROVIDER = null;
            window.BOOMSWAP_CURRENT_WEB3 = null;
            window.BOOMSWAP_CURRENT_ADDRESS = null;
            window.BOOMSWAP_CURRENT_CHAIN_ID = null;
            // Reset interface
            this.handleWalletDisconnected();
            console.log('✅ Wallet déconnecté');
        } catch (error) {
            console.error('❌ Erreur déconnexion:', error);
        }
    }

    setupProviderListeners(provider) {
        // Écouter changements d'account
        provider.on('accountsChanged', (accounts) => {
            console.log('🔄 Comptes changés:', accounts);
            try { (window.WALLET_TIMELINE ||= []).push({ t: Date.now(), e: 'accountsChanged', accounts }); } catch (_) {}
            if (accounts.length === 0) {
                this.disconnectWallet();
            } else {
                window.BOOMSWAP_CURRENT_ADDRESS = accounts[0];
                this.handleWalletConnected(accounts[0], window.BOOMSWAP_CURRENT_CHAIN_ID);
            }
        });
        // Écouter changements de réseau
        provider.on('chainChanged', (chainId) => {
            const newChainId = parseInt(chainId);
            console.log('⛓️ Réseau changé:', newChainId);
            window.BOOMSWAP_CURRENT_CHAIN_ID = newChainId;
            this.handleNetworkChanged(newChainId);
        });
        // Écouter déconnexion
        provider.on('disconnect', () => {
            console.log('🔌 Provider déconnecté');
            try { (window.WALLET_TIMELINE ||= []).push({ t: Date.now(), e: 'disconnect' }); } catch (_) {}
            this.disconnectWallet();
            // Forcer remise à zéro immédiate des soldes
            try {
                window.BOOMBOX_CURRENT_PROVIDER = null;
                const zeroBalances = { bnb: 0, usdt: 0, cake: 0, totalUsd: 0 };
                if (window.BoomboxUI && window.BoomboxUI.setBalances) {
                    window.BoomboxUI.setBalances(zeroBalances);
                }
                const bnbEl = document.getElementById('balance-bnb');
                const usdtEl = document.getElementById('balance-usdt');
                const cakeEl = document.getElementById('balance-cake');
                const totalEl = document.getElementById('total-value');
                if (bnbEl) bnbEl.textContent = '0.000000';
                if (usdtEl) usdtEl.textContent = '0.0000';
                if (cakeEl) cakeEl.textContent = '0.000000';
                if (totalEl) totalEl.textContent = '$0.00';
            } catch (_) {}
        });
    }

    /**
     * Attendre que BoomboxAPI soit disponible (max 3s)
     */
    async waitForBoomboxAPI(timeout = 3000) {
        const start = Date.now();
        while (!window.BoomboxAPI && Date.now() - start < timeout) {
            await new Promise(res => setTimeout(res, 50));
        }
        if (!window.BoomboxAPI) {
            console.error('[ERREUR] MISSION ECHOUEE : BoomboxAPI non initialise apres 3 secondes. Verifiez le chargement du script js/core/api-client.js.');
            showNotification('MISSION ECHOUEE : API client non initialise. Verifiez l\'ordre des scripts dans index.html.', 'error');
            throw new Error('MISSION ECHOUEE : API client non initialise.');
        }
    }

    async handleWalletConnected(address, chainId) {
        try { (window.WALLET_TIMELINE ||= []).push({ t: Date.now(), e: 'connected', address, chainId }); } catch (_) {}
        const timestamp = Date.now();
        logSoldesEvent('WALLET_CONNECTED', {
            address: address,
            chainId: chainId,
            timestamp: timestamp
        });
        
        console.log(`🎯 AUDIT SOLDES [${timestamp}]: === CONNEXION METAMASK RÉUSSIE ===`);
        console.log(`🎯 AUDIT SOLDES [${timestamp}]: Address connectée: ${address}`);
        console.log(`🎯 AUDIT SOLDES [${timestamp}]: ChainId: ${chainId}`);
        console.log(`🎯 AUDIT SOLDES [${timestamp}]: Déclenchement récupération soldes...`);
        
        try {
            await this.waitForBoomboxAPI();
        } catch (e) {
            logSoldesEvent('API_WAIT_ERROR', {
                error: e.message,
                timestamp: Date.now()
            });
            console.error(`🎯 AUDIT SOLDES [${timestamp}]: ERREUR attente API:`, e);
            return;
        }
        
        if (!window.BoomboxAPI) {
            logSoldesEvent('API_NOT_AVAILABLE', {
                timestamp: Date.now()
            });
            console.error(`🎯 AUDIT SOLDES [${timestamp}]: BoomboxAPI non initialisé`);
            showNotification('ERREUR CRITIQUE : API client non initialise. Verifiez l\'ordre des scripts dans index.html.', 'error');
            return;
        }
        
        // Notification de succès
        showNotification('Wallet connecté avec succès', 'success');
        
        // Mettre à jour le bouton wallet (source unique)
        window.BOOMBOX_WALLET_OWNER = 'main';
        // Autoriser de nouveau les mises à jour de soldes après connexion
        try { window.BOOMBOX_SUPPRESS_BALANCE_UPDATES = false; } catch (_) {}
        // Harmonisation header: priorité Solana si chaîne Solana active
        try {
            const isSol = (
                (window.BoomboxChainManager && window.BoomboxChainManager.getCurrentChain &&
                 window.BoomboxChainManager.getCurrentChain().type === 'solana')
                || chainId === 0
            );
            if (typeof window.BOOMB_APPLY_WALLET_HEADER === 'function') {
                window.BOOMB_APPLY_WALLET_HEADER();
            } else if (!isSol) {
                // Fallback minimal EVM uniquement
                const walletBtn = document.getElementById('wallet-btn');
                const walletBtnText = document.getElementById('wallet-btn-text');
                if (walletBtn) walletBtn.className = 'wallet-header-btn wallet-btn connected';
                if (walletBtnText) {
                    walletBtnText.textContent = `MetaMask: ${address.slice(0, 6)}...${address.slice(-4)}`;
                }
            }
        } catch (_) {}

        // Source unique (AAA) : statut wallet géré par main.js uniquement
        
        // Afficher le nom du réseau
        const networkName = this.getNetworkName(chainId);
        console.log(`AUDIT SOLDES [${timestamp}]: Réseau actuel: ${networkName}`);
        
        // --- SYNCHRONISATION BACKEND ---
        const apiUrl = window.BoomboxAPI.baseUrl;
        console.log(`AUDIT SOLDES [${timestamp}]: === APPEL API BALANCES ===`);
        console.log(`AUDIT SOLDES [${timestamp}]: Appel via ApiClient.getBalances`);
        console.log(`AUDIT SOLDES [${timestamp}]: Headers envoyés: Content-Type: application/json`);
        
        const handleBalances = (balances) => {
                try { (window.WALLET_TIMELINE ||= []).push({ t: Date.now(), e: 'balances_received', balances }); } catch (_) {}
                const responseTimestamp = Date.now();
                console.log(`AUDIT SOLDES [${responseTimestamp}]: === RÉPONSE API BALANCES ===`);
                console.log(`AUDIT SOLDES [${responseTimestamp}]: Status réponse: 200 OK`);
                console.log(`AUDIT SOLDES [${responseTimestamp}]: Données reçues:`, balances);
                
                logSoldesEvent('BALANCES_RECEIVED', {
                    balances: balances,
                    timestamp: responseTimestamp
                });
                
                console.log(`🎯 AUDIT SOLDES [${responseTimestamp}]: === TRAITEMENT DONNÉES ===`);
                console.log(`🎯 AUDIT SOLDES [${responseTimestamp}]: BNB reçu: ${balances.BNB} → ${balances.BNB}`);
                console.log(`🎯 AUDIT SOLDES [${responseTimestamp}]: USDT reçu: ${balances.USDT} → ${balances.USDT}`);
                console.log(`🎯 AUDIT SOLDES [${responseTimestamp}]: CAKE reçu: ${balances.CAKE} → ${balances.CAKE}`);
                console.log(`🎯 AUDIT SOLDES [${responseTimestamp}]: Valeur totale calculée: $${balances.totalValue}`);
                
                console.log(`🎯 AUDIT SOLDES [${responseTimestamp}]: === MISE À JOUR CARD 1 ===`);
                console.log(`🎯 AUDIT SOLDES [${responseTimestamp}]: Fonction appelée: updatePortfolioCard()`);
                
                // Source unique: main.js
                window.BOOMBOX_BALANCES_OWNER = 'main';
                // S'assurer que la suppression est désactivée
                try { window.BOOMBOX_SUPPRESS_BALANCE_UPDATES = false; } catch (_) {}
                this.updatePortfolioCard(balances);

                // Fallback sécurisé: si aucune valeur n'a été injectée, forcer via UI
                try {
                    const bnbEl = document.getElementById('balance-bnb');
                    const usdtEl = document.getElementById('balance-usdt');
                    const cakeEl = document.getElementById('balance-cake');
                    const needsFallback = (
                        (bnbEl && !bnbEl.textContent) ||
                        (usdtEl && !usdtEl.textContent) ||
                        (cakeEl && !cakeEl.textContent)
                    );
                    if (needsFallback && window.BoomboxUI && window.BoomboxUI.setBalances) {
                        const normalized = {
                            bnb: parseFloat(balances.bnb) || 0,
                            usdt: parseFloat(balances.usdt) || 0,
                            cake: parseFloat(balances.cake) || 0,
                            totalUsd: parseFloat(balances.totalValue) || 0
                        };
                        // Permettre temporairement la MAJ par la façade UI
                        const prevOwner = window.BOOMBOX_BALANCES_OWNER;
                        window.BOOMBOX_BALANCES_OWNER = undefined;
                        window.BOOMBOX_SUPPRESS_BALANCE_UPDATES = false;
                        window.BoomboxUI.setBalances(normalized);
                        // Restaurer l'owner principal
                        window.BOOMBOX_BALANCES_OWNER = prevOwner;
                        console.log('🎯 AUDIT SOLDES: Fallback UI appliqué');
                    }
                } catch (e) {
                    console.warn('Fallback UI balances échoué', e);
                }
        };

        const handleBalancesError = (err) => {
                const errorTimestamp = Date.now();
                console.error(`🎯 AUDIT SOLDES [${errorTimestamp}]: === ERREUR API BALANCES ===`);
                console.error(`🎯 AUDIT SOLDES [${errorTimestamp}]: Erreur:`, err);
                
                logSoldesEvent('BALANCES_ERROR', {
                    error: err.message,
                    timestamp: errorTimestamp
                });
                
                this.showError('Balances', err.message || 'Erreur récupération soldes');
        };

        // Lancement en parallèle: 1) requête immédiate 2) requête courte avec deadline stricte
        // Audit N2: scoper les requêtes soldes par chaîne/epoch et annuler les anciennes
        window.BOOMBOX_BAL_REQ = window.BOOMBOX_BAL_REQ || {};
        const epoch = window.BOOMBOX_PRICE_EPOCH || 0;
        const balKey = `${address}_${chainId}_${epoch}`;
        // Abandonner les anciennes en vol pour cet utilisateur
        try {
            Object.keys(window.BOOMBOX_BAL_REQ).forEach((k) => {
                if (k.startsWith(`${address}_`) && k !== balKey) {
                    const ctl = window.BOOMBOX_BAL_REQ[k];
                    if (ctl && typeof ctl.abort === 'function') ctl.abort();
                    delete window.BOOMBOX_BAL_REQ[k];
                }
            });
        } catch (_) {}
        const makeCtl = () => new AbortController();
        const launchFast = () => {
            if (!window.BOOMSWAP_CURRENT_ADDRESS) return Promise.resolve();
            const ctl = makeCtl();
            window.BOOMBOX_BAL_REQ[balKey] = ctl;
            if (window.BoomboxProviderManager) {
                return window.BoomboxProviderManager.fetchBalances(address, chainId)
                    .then(handleBalances).catch(() => {});
            }
            return window.BoomboxAPI.getBalances(
                address, chainId, { headers: { 'X-Deadline': 'fast' }, signal: ctl.signal }
            ).then(handleBalances).catch(() => {});
        };
        const launchNormal = () => {
            if (!window.BOOMSWAP_CURRENT_ADDRESS) return Promise.resolve();
        if (window.BoomboxBalancesUpdater) {
                const ctl = makeCtl();
                window.BOOMBOX_BAL_REQ[balKey] = ctl;
                return window.BoomboxBalancesUpdater.fetchAndUpdate(
                    address, chainId, handleBalances, handleBalancesError, { signal: ctl.signal }
                );
            }
            const ctl = makeCtl();
            window.BOOMBOX_BAL_REQ[balKey] = ctl;
            if (window.BoomboxProviderManager) {
                return window.BoomboxProviderManager.fetchBalances(address, chainId)
                    .then(handleBalances).catch(handleBalancesError);
            }
            return window.BoomboxAPI.getBalances(address, chainId, { signal: ctl.signal })
                .then(handleBalances).catch(handleBalancesError);
        };
        try { launchFast(); } catch (_) {}
        try { launchNormal(); } catch (_) {}

        // Relance défensive après switch de chaîne pour éviter latences RPC
        // Relance agressive très courte (éviter latence RPC)
        try { setTimeout(launchFast, 300); } catch (_) {}
        
        // Récupérer positions
        const handlePositions = (positions) => {
            this.updatePositionsCard(positions);
        };
        const handlePositionsError = (err) => {
            this.showError('Positions', err.message || 'Erreur récupération positions');
        };
        if (window.BoomboxPositionsUpdater) {
            window.BoomboxPositionsUpdater
                .fetchAndUpdate(address, chainId, handlePositions, handlePositionsError);
        } else {
            window.BoomboxAPI.getPositions(address, chainId)
                .then(handlePositions)
                .catch(handlePositionsError);
        }
    }

    handleWalletDisconnected() {
        const timestamp = Date.now();
        console.log(`🎯 AUDIT FORENSIQUE [${timestamp}]: === HANDLE WALLET DISCONNECTED ===`);
        try { (window.WALLET_TIMELINE ||= []).push({ t: timestamp, e: 'handleWalletDisconnected' }); } catch (_) {}
        console.log(`🎯 AUDIT FORENSIQUE [${timestamp}]: État AVANT déconnexion:`);
        
        // Reset bouton wallet non destructif
        const walletBtn = document.getElementById('wallet-btn');
        if (walletBtn) {
            console.log(`🎯 AUDIT FORENSIQUE [${timestamp}]: Bouton wallet trouvé, état AVANT modification:`);
            console.log(`🎯 AUDIT FORENSIQUE [${timestamp}]:   - Text content:`, walletBtn.textContent);
            console.log(`🎯 AUDIT FORENSIQUE [${timestamp}]:   - Classes:`, walletBtn.className);
            console.log(`🎯 AUDIT FORENSIQUE [${timestamp}]:   - Disabled:`, walletBtn.disabled);

            let walletBtnText = document.getElementById('wallet-btn-text');
            if (!walletBtnText) {
                walletBtnText = document.createElement('span');
                walletBtnText.id = 'wallet-btn-text';
                walletBtn.innerHTML = '';
                walletBtn.appendChild(walletBtnText);
            }

            walletBtnText.textContent = 'Connecter Wallet';
            walletBtn.className = 'wallet-header-btn wallet-btn disconnected';
            walletBtn.disabled = false;

            console.log(`🎯 AUDIT FORENSIQUE [${timestamp}]: État APRÈS modification:`);
            console.log(`🎯 AUDIT FORENSIQUE [${timestamp}]:   - Text content:`, walletBtnText.textContent);
            console.log(`🎯 AUDIT FORENSIQUE [${timestamp}]:   - Classes:`, walletBtn.className);
            console.log(`🎯 AUDIT FORENSIQUE [${timestamp}]:   - Disabled:`, walletBtn.disabled);
        } else {
            console.error(`🎯 AUDIT FORENSIQUE [${timestamp}]: BOUTON WALLET NON TROUVÉ !`);
        }

        // Source unique (AAA) : statut wallet géré par main.js uniquement
        
        // Désactiver les fonctionnalités
        this.disableWalletFeatures && this.disableWalletFeatures();

        // Vider la Card 1 immédiatement
        try {
            window.BOOMBOX_BALANCES_OWNER = 'main';
            window.BOOMBOX_SUPPRESS_BALANCE_UPDATES = true;
            const zeroBalances = { bnb: 0, usdt: 0, cake: 0, totalUsd: 0 };
            if (window.BoomboxUI && window.BoomboxUI.clearBalances) {
                window.BoomboxUI.clearBalances();
            } else if (window.BoomboxUI && window.BoomboxUI.setBalances) {
                window.BoomboxUI.setBalances(zeroBalances);
            } else {
                const bnbEl = document.getElementById('balance-bnb');
                const usdtEl = document.getElementById('balance-usdt');
                const cakeEl = document.getElementById('balance-cake');
                const totalEl = document.getElementById('total-value');
                if (bnbEl) bnbEl.textContent = '0.000000';
                if (usdtEl) usdtEl.textContent = '0.0000';
                if (cakeEl) cakeEl.textContent = '0.000000';
                if (totalEl) totalEl.textContent = '$0.00';
            }
            (window.WALLET_TIMELINE ||= []).push({ t: Date.now(), e: 'balances_reset' });
        } catch (e) {
            console.warn('Reset balances post-déconnexion échoué', e);
        }
        
        console.log(`🎯 AUDIT FORENSIQUE [${timestamp}]: === HANDLE WALLET DISCONNECTED TERMINÉ ===`);
    }

    // Stopper proprement les modules dépendants du wallet
    disableWalletFeatures() {
        try { window.BOOMBAX_POLLING_ACTIVE = false; } catch (_) {}
        try { window.BoomboxPriceMonitor && window.BoomboxPriceMonitor.stop && window.BoomboxPriceMonitor.stop(); } catch (_) {}
        try { window.BoomboxBalancesUpdater && window.BoomboxBalancesUpdater.stop && window.BoomboxBalancesUpdater.stop(); } catch (_) {}
        try { window.BoomboxPositionsUpdater && window.BoomboxPositionsUpdater.stop && window.BoomboxPositionsUpdater.stop(); } catch (_) {}
    }

    handleNetworkChanged(chainId) {
        const networkName = this.getNetworkName(chainId);
        console.log('⛓️ Réseau changé vers:', networkName);
        // Mettre à jour l'interface selon le réseau
        if (this.interfaceInteractive) {
            this.interfaceInteractive.updateNetworkDisplay(chainId);
        }
        // Déclencher la même logique que onChainChanged pour rafraîchir balances
        try {
            this.onChainChanged({ newChainId: chainId });
        } catch (_) {}
    }

    getNetworkName(chainId) {
        const networks = {
            56: 'BSC',
            42161: 'Arbitrum',
            
            1: 'Ethereum'
        };
        return networks[chainId] || `Chain ${chainId}`;
    }

    /**
     * Tester connexion API
     */
    async testApiConnection() {
        if (window.BoomboxAPI) {
            const isConnected = await window.BoomboxAPI.testConnection();
            if (!isConnected) {
                console.warn('API NON DISPONIBLE - Mode démo activé');
            }
        }
    }

    /**
     * Démarrer monitoring prix en temps réel
     */
    startPriceMonitoring() {
        // Arrêter l'ancien mécanisme si présent
        this.cleanupPriceMonitoring();
        // Démarrer via PriceMonitor centralisé
        if (window.BoomboxPriceMonitor) {
            // Initialiser epoch/flags
            if (typeof window.BOOMBOX_PRICE_EPOCH !== 'number') {
                window.BOOMBOX_PRICE_EPOCH = 0;
            }
            window.BOOMBOX_HAS_REAL_PRICE_FOR_EPOCH = false;
            // Init cache LKG
            window.BOOMBOX_LKG_PRICE = window.BOOMBOX_LKG_PRICE || {};
            window.BoomboxPriceMonitor.start({
                getChainId: () => (window.BoomboxChainManager?.getCurrentChainId?.() || 'bsc'),
                onPrice: (data, chainId) => {
                    window.BOOMBOX_PRICE_ANIMATION_OWNER = 'main';
                    // Ignorer fallbacks si un prix réel a déjà été affiché pour cet epoch
                    const isFallback = !!data.fallback;
                    if (isFallback && window.BOOMBOX_HAS_REAL_PRICE_FOR_EPOCH) {
                        return;
                    }
                    // Ignorer les réponses d'une autre chaîne que l'actuelle
                    try {
                        const currentKey = window.BoomboxChainManager?.getCurrentChainId?.();
                        if (currentKey && currentKey !== chainId) return;
                    } catch (_) {}
                    // Mémoriser LKG
                    try { window.BOOMBOX_LKG_PRICE[chainId] = data.price; } catch (_) {}
                    this.updatePriceDisplay(data.price);
                    if (!isFallback) {
                        window.BOOMBOX_HAS_REAL_PRICE_FOR_EPOCH = true;
                    }
                    if (window.BoomboxEvents) {
                        window.BoomboxEvents.emit(window.BoomboxEvents.EVENTS.PRICE_UPDATED, {
                            chainId,
                            prices: { BNB: data },
                            timestamp: new Date().toISOString()
                        });
                    }
                },
                onError: (error) => {
                    const el = document.getElementById('bnbPrice');
                    if (el) {
                        el.classList.add('error');
                        el.textContent = 'Prix non disponible';
                    }
                },
                intervalMs: 30000
            });
        } else {
            // Fallback vers l'ancien mécanisme si indisponible
            this.fallbackToPolling();
        }
    }

    /**
     * Nettoyer les intervalles de prix pour éviter les memory leaks
     */
    cleanupPriceMonitoring() {
        if (this.priceUpdateInterval) {
            console.log('🧹 Nettoyage intervalle prix existant...');
            clearInterval(this.priceUpdateInterval);
            this.priceUpdateInterval = null;
        }
        
        if (this.priceTimeoutId) {
            console.log('🧹 Nettoyage timeout prix existant...');
            clearTimeout(this.priceTimeoutId);
            this.priceTimeoutId = null;
        }
    }

    /**
     * Retomber sur polling en cas d'erreur EventSource
     */
    async fallbackToPolling() {
        // Mise à jour initiale
        try {
            await this.updatePrices();
        } catch (_) {}
        // Mise à jour toutes les 30 secondes
        this.priceUpdateInterval = setInterval(() => {
            this.updatePrices();
        }, 30000);
    }

    /**
     * Mettre à jour les prix
     */
    async updatePrices() {
        try {
            // Utiliser BSC par défaut si pas de chain manager
            let chainId = 'bsc';
            let nativeSymbol = 'BNB';
            if (window.BoomboxChainManager) {
                chainId = window.BoomboxChainManager.getCurrentChainId();
                try {
                    const info = window.BoomboxChainManager.getCurrentChain();
                    if (info && info.nativeToken) nativeSymbol = info.nativeToken;
                } catch (_) {}
            }

            console.log('MISE A JOUR PRIX - Chain:', chainId, 'Token:', nativeSymbol);
            
            // Appel standard via ApiClient (BoomboxAPI)
            const bnbData = await window.BoomboxAPI.getTokenPrice(
                chainId,
                nativeSymbol
            );
            
            // Validation des données reçues
            if (!bnbData || typeof bnbData.price !== 'number') {
                throw new Error('Données de prix invalides reçues de l\'API');
            }
            
            // Construire l'objet prices avec le format attendu
            const prices = { [nativeSymbol]: bnbData };

            // Mettre à jour l'interface (source unique: main.js)
            // Indiquer que l'animation est gérée par main.js pour éviter double animation
            window.BOOMBOX_PRICE_ANIMATION_OWNER = 'main';
            this.updatePriceDisplay(bnbData.price);

            // Émettre événement
            if (window.BoomboxEvents) {
                window.BoomboxEvents.emit(window.BoomboxEvents.EVENTS.PRICE_UPDATED, {
                    chainId,
                    prices,
                    timestamp: new Date().toISOString()
                });
            }

        } catch (error) {
            console.error('ERREUR MISE A JOUR PRIX:', error);
            
            // Gestion spécifique des erreurs
            if (error.name === 'AbortError') {
                console.warn('Timeout API prix - Réessai dans 30s');
            } else if (error.message.includes('API Error')) {
                console.error('Erreur API serveur:', error.message);
            } else {
                console.error('Erreur réseau ou inconnue:', error.message);
            }
            
            // Ne pas afficher de message intrusif; conserver la valeur actuelle
            // ou à défaut, afficher $0.00 discretement
            const bnbPriceElement = document.getElementById('bnbPrice');
            if (bnbPriceElement && !bnbPriceElement.textContent) {
                bnbPriceElement.textContent = '$0.00';
            }
        }
    }

    /**
     * Mettre à jour l'affichage des prix avec animation
     */
    updatePriceDisplay(newPrice) {
        const priceElement = document.getElementById('bnbPrice');
        if (!priceElement) {
            console.warn("[DEBUG] Élément avec ID 'bnbPrice' non trouvé.");
            return;
        }

        const oldPriceText = priceElement.textContent.replace('$', '');
        const oldPrice = parseFloat(oldPriceText) || 0;

        // Mettre à jour le prix en blanc
        priceElement.textContent = `$${parseFloat(newPrice).toFixed(2)}`;
        priceElement.style.color = ''; // Couleur par défaut (blanc)
        priceElement.style.transform = ''; // Reset scale

        // Appliquer l'animation uniquement si le prix a changé
        if (newPrice !== oldPrice) {
            // Retirer les classes d'animation précédentes
            priceElement.classList.remove('pulse', 'price-up', 'price-down');

            // Ajouter l'animation pulse
            priceElement.classList.add('pulse');

            // Ajouter la classe de couleur selon la direction
            if (newPrice > oldPrice) {
                priceElement.classList.add('price-up'); // Vert
            } else if (newPrice < oldPrice) {
                priceElement.classList.add('price-down'); // Rouge
            }

            // Retirer l'animation après 600ms
            setTimeout(() => {
                priceElement.classList.remove('pulse', 'price-up', 'price-down');
            }, 600);
        }
    }



    /**
     * Changer de page
     */
    switchPage(pageId) {
        const pages = document.querySelectorAll('.page');
        const navPoints = document.querySelectorAll('.nav-point');

        // Masquer toutes les pages
        pages.forEach(page => page.classList.remove('active'));

        // Désactiver tous les points
        navPoints.forEach(point => point.classList.remove('active'));

        // Afficher la page sélectionnée
        const targetPage = document.getElementById(`${pageId}Page`);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Activer le point correspondant
        const targetPoint = document.querySelector(`[data-page="${pageId}"]`);
        if (targetPoint) {
            targetPoint.classList.add('active');
        }

        // Émettre événement
        if (window.BoomboxEvents) {
            window.BoomboxEvents.emit(window.BoomboxEvents.EVENTS.PAGE_CHANGED, {
                page: pageId,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Afficher modal wallet
     */
    showWalletModal() {
        if (window.BoomboxWalletModal && window.BoomboxWalletModal.show()) return;
        // Fallback si le contrôleur n'est pas disponible
        const modal = document.getElementById('walletModal');
        if (!modal) return;
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
        try { if (typeof fixWalletConnectShadowDOM === 'function') fixWalletConnectShadowDOM(); } catch (_) {}
    }

    /**
     * Masquer modal wallet
     */
    hideWalletModal() {
        if (window.BoomboxWalletModal && window.BoomboxWalletModal.hide()) return;
        // Fallback si le contrôleur n'est pas disponible
        const modal = document.getElementById('walletModal');
        if (!modal) return;
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }





    /**
     * Callbacks événements
     */
    async onChainChanged(data) {
        console.log('CHAIN CHANGE:', data);
        // Mettre à jour prix pour nouvelle chain avec LKG immédiat
        try {
            const currentKey = window.BoomboxChainManager?.getCurrentChainId?.();
            const lkg = window.BOOMBOX_LKG_PRICE && currentKey ? window.BOOMBOX_LKG_PRICE[currentKey] : null;
            if (typeof lkg === 'number' && isFinite(lkg)) {
                this.updatePriceDisplay(lkg);
            }
        } catch (_) {}
        this.updatePrices();
        try {
            // Réinitialiser rapidement la Card 1 pour éviter l'ancienne chaîne affichée
            const zeroBalances = { bnb: 0, usdt: 0, cake: 0, totalUsd: 0 };
            if (window.BoomboxUI && window.BoomboxUI.setBalances) {
                const prevOwner = window.BOOMBOX_BALANCES_OWNER;
                window.BOOMBOX_BALANCES_OWNER = undefined;
                window.BOOMBOX_SUPPRESS_BALANCE_UPDATES = false;
                window.BoomboxUI.setBalances(zeroBalances);
                window.BOOMBOX_BALANCES_OWNER = prevOwner;
            } else {
                const bnbEl = document.getElementById('balance-bnb');
                const usdtEl = document.getElementById('balance-usdt');
                const cakeEl = document.getElementById('balance-cake');
                const totalEl = document.getElementById('total-value');
                if (bnbEl) bnbEl.textContent = '0.000000';
                if (usdtEl) usdtEl.textContent = '0.0000';
                if (cakeEl) cakeEl.textContent = '0.000000';
                if (totalEl) totalEl.textContent = '$0.00';
            }
            // Invalider l'epoch de prix pour empêcher un fallback de l'ancienne chaîne
            if (typeof window.BOOMBOX_PRICE_EPOCH !== 'number') {
                window.BOOMBOX_PRICE_EPOCH = 0;
            }
            window.BOOMBOX_PRICE_EPOCH += 1;
            window.BOOMBOX_HAS_REAL_PRICE_FOR_EPOCH = false;
        } catch (_) {}

        // Si un wallet est connecté, relancer la récupération des soldes sur la nouvelle chaîne
        try {
            const address = window.BOOMSWAP_CURRENT_ADDRESS;
            const chainId = (
                window.BoomboxChainManager &&
                typeof window.BoomboxChainManager.getCurrentChain === 'function' &&
                window.BoomboxChainManager.getCurrentChain()
            ) ? window.BoomboxChainManager.getCurrentChain().id
              : (data && (data.newChainId || (data.chainData && data.chainData.id)))
              || window.BOOMSWAP_CURRENT_CHAIN_ID
              || 56;
            // Ne jamais déclencher de récupération si pas d'adresse connectée
            if (address && chainId) {
        const handleBalances = (balances) => {
                    if (!window.BOOMSWAP_CURRENT_ADDRESS) return;
                    window.BOOMBOX_BALANCES_OWNER = 'main';
                    window.BOOMBOX_SUPPRESS_BALANCE_UPDATES = false;
                    this.updatePortfolioCard(balances);
                };
                const handleBalancesError = (err) => {
                    this.showError('Balances', err.message || 'Erreur récupération soldes');
                };
                if (window.BoomboxBalancesUpdater) {
                    if (window.BoomboxProviderManager) {
                        window.BoomboxProviderManager.fetchBalances(address, chainId)
                            .then(handleBalances).catch(handleBalancesError);
                    } else {
                        window.BoomboxBalancesUpdater.fetchAndUpdate(address, chainId, handleBalances, handleBalancesError);
                    }
                } else if (window.BoomboxAPI) {
                    if (window.BoomboxProviderManager) {
                        window.BoomboxProviderManager.fetchBalances(address, chainId)
                            .then(handleBalances).catch(handleBalancesError);
                    } else {
                        window.BoomboxAPI.getBalances(address, chainId).then(handleBalances).catch(handleBalancesError);
                    }
                }
            }
        } catch (_) {}
    }

    onPriceUpdated(data) {
        console.log('PRICE UPDATE:', data);
    }

    /**
     * Délégation vers le gestionnaire de notifications
     */
    showError(context, message) {
        if (this.notificationManager) {
            this.notificationManager.showError(context, message);
        }
    }

    showSuccess(message) {
        if (this.notificationManager) {
            this.notificationManager.showSuccess(message);
        }
    }

    showGamingFeedback(message) {
        if (this.notificationManager) {
            this.notificationManager.showGamingFeedback(message);
        }
    }

    getGamingErrorMessage(error) {
        if (this.notificationManager) {
            return this.notificationManager.getGamingErrorMessage(error);
        }
        return 'MISSION ECHOUEE - Erreur inconnue';
    }

    /**
     * Nettoyage
     */
    destroy() {
        console.log('🧹 Destruction BoomboxApp...');
        
        // Nettoyer les modules spécialisés
        if (this.musicController) {
            this.musicController.destroy();
        }
        if (this.rangeConfigController) {
            this.rangeConfigController.destroy();
        }
        if (this.notificationManager) {
            this.notificationManager.destroy();
        }
        
        // Nettoyer les intervalles de prix pour éviter les memory leaks
        this.cleanupPriceMonitoring();
        
        // Nettoyer les event listeners
        if (this.eventListeners) {
            this.eventListeners.forEach(({ element, event, handler }) => {
                element.removeEventListener(event, handler);
            });
            this.eventListeners = [];
        }
        
        // Nettoyer les autres intervalles potentiels
        if (this.otherIntervals) {
            this.otherIntervals.forEach(intervalId => {
                clearInterval(intervalId);
            });
            this.otherIntervals = [];
        }

        if (window.BoomboxEvents) {
            window.BoomboxEvents.removeAllListeners();
        }
        
        // Nettoyer les gestionnaires de connexions
        if (window.MetaMaskConnectionManager) {
            window.MetaMaskConnectionManager.cleanup();
        }
        if (window.WalletConnectConnectionManager) {
            window.WalletConnectConnectionManager.cleanup();
        }
        
        console.log('✅ BoomboxApp détruit - Memory leaks évités');
    }

    // Ajout des méthodes d'update UI (MVP)
    updatePortfolioCard(balances) {
        const timestamp = Date.now();
        console.log(`🎯 AUDIT SOLDES [${timestamp}]: === MISE À JOUR CARD 1 ===`);
        console.log(`🎯 AUDIT SOLDES [${timestamp}]: Fonction appelée: updatePortfolioCard()`);
        console.log(`🎯 AUDIT SOLDES [${timestamp}]: Données balances reçues:`, balances);
        
        // ===== AUDIT DOLLARS: SURVEILLANCE UPDATEPORTFOLIOCARD =====
        console.log('🎯 AUDIT DOLLARS: === UPDATEPORTFOLIOCARD DÉMARRÉ ===');
        console.log('🎯 AUDIT DOLLARS: Données balances reçues:', balances);
        console.log('🎯 AUDIT DOLLARS: Stack trace:', new Error().stack);
        
        // Normaliser les clés (accepte 'BNB'/'bnb', 'USDT'/'usdt', etc.)
        const norm = (obj) => {
            if (!obj || typeof obj !== 'object') return { bnb: null, usdt: null, cake: null, totalValue: null };
            const pick = (obj, keys) => {
                for (const k of keys) {
                    if (obj[k] !== undefined && obj[k] !== null) return obj[k];
                }
                return null;
            };
            return {
                bnb: pick(obj, ['bnb', 'BNB', 'bnbBalance', 'native', 'nativeBalance']),
                usdt: pick(obj, ['usdt', 'USDT']),
                cake: pick(obj, ['cake', 'CAKE']),
                totalValue: pick(obj, ['totalValue', 'total', 'totalUSD', 'totalUsd'])
            };
        };
        const nb = norm(balances);
        
        // Mettre à jour les soldes dans la card portefeuille
        const bnbEl = document.getElementById('balance-bnb');
        const usdtEl = document.getElementById('balance-usdt');
        const cakeEl = document.getElementById('balance-cake');
        const totalEl = document.getElementById('total-value');
        
        console.log(`🎯 AUDIT SOLDES [${timestamp}]: Éléments DOM trouvés:`);
        console.log(`🎯 AUDIT SOLDES [${timestamp}]:   - balance-bnb:`, !!bnbEl);
        console.log(`🎯 AUDIT SOLDES [${timestamp}]:   - balance-usdt:`, !!usdtEl);
        console.log(`🎯 AUDIT SOLDES [${timestamp}]:   - balance-cake:`, !!cakeEl);
        console.log(`🎯 AUDIT SOLDES [${timestamp}]:   - total-value:`, !!totalEl);
        
        if (bnbEl && (nb.bnb !== undefined && nb.bnb !== null)) {
            const oldValue = bnbEl.textContent;
            bnbEl.textContent = String(nb.bnb);
            console.log(`🎯 AUDIT SOLDES [${timestamp}]: Valeurs injectées - BNB: ${oldValue} → ${nb.bnb}`);
        }
        if (usdtEl && (nb.usdt !== undefined && nb.usdt !== null)) {
            const oldValue = usdtEl.textContent;
            usdtEl.textContent = String(nb.usdt);
            console.log(`🎯 AUDIT SOLDES [${timestamp}]: Valeurs injectées - USDT: ${oldValue} → ${nb.usdt}`);
        }
        if (cakeEl && (nb.cake !== undefined && nb.cake !== null)) {
            const oldValue = cakeEl.textContent;
            cakeEl.textContent = String(nb.cake);
            console.log(`🎯 AUDIT SOLDES [${timestamp}]: Valeurs injectées - CAKE: ${oldValue} → ${nb.cake}`);
        }
        if (totalEl && (nb.totalValue !== undefined && nb.totalValue !== null)) {
            const oldValue = totalEl.textContent;
            const hasDollar = /^\$/.test(String(nb.totalValue));
            const newValue = hasDollar ? String(nb.totalValue) : ('$' + String(nb.totalValue));
            console.log(`🎯 AUDIT SOLDES [${timestamp}]: Valeurs injectées - Total: ${oldValue} → ${newValue}`);
            console.log('🎯 AUDIT DOLLARS: UPDATEPORTFOLIOCARD - total-value:', newValue);
            console.log('🎯 AUDIT DOLLARS: Source données:', 'API balances');
            totalEl.textContent = newValue;
            console.log('[DEBUG] Valeur totale mise à jour:', nb.totalValue);
        }
        
        // Vérifier l'état final de Card 1
        const finalState = {
            'balance-bnb': document.getElementById('balance-bnb')?.textContent,
            'balance-usdt': document.getElementById('balance-usdt')?.textContent,
            'balance-cake': document.getElementById('balance-cake')?.textContent,
            'total-value': document.getElementById('total-value')?.textContent
        };
        
        console.log(`🎯 AUDIT SOLDES [${timestamp}]: Card 1 état final:`, finalState);
        // Ré-application défensive si une valeur est vide (latences DOM)
        const reinject = (delayMs) => setTimeout(() => {
            try {
                if (bnbEl && !bnbEl.textContent && nb.bnb != null) bnbEl.textContent = String(nb.bnb);
                if (usdtEl && !usdtEl.textContent && nb.usdt != null) usdtEl.textContent = String(nb.usdt);
                if (cakeEl && !cakeEl.textContent && nb.cake != null) cakeEl.textContent = String(nb.cake);
                if (totalEl && !totalEl.textContent && nb.totalValue != null) {
                    const hasDollar = /^\$/.test(String(nb.totalValue));
                    totalEl.textContent = hasDollar ? String(nb.totalValue) : ('$' + String(nb.totalValue));
                }
            } catch (_) {}
        }, delayMs);
        reinject(50);
        reinject(300);
        console.log(`🎯 AUDIT SOLDES [${timestamp}]: === MISE À JOUR CARD 1 TERMINÉE ===`);
        
        logSoldesEvent('CARD1_UPDATED', {
            finalState: finalState,
            timestamp: timestamp
        });
        
        console.log('🎯 AUDIT DOLLARS: === UPDATEPORTFOLIOCARD TERMINÉ ===');
    }
    updatePositionsCard(positions) {
        // SUPPRIMÉ: affichage du nombre de positions dans la Card 1
        // const posEl = document.getElementById('positions-count');
        // if (posEl && positions && Array.isArray(positions)) {
        //     posEl.textContent = positions.length + ' position(s)';
        // }
    }

    // Appeler ceci lors de la connexion wallet
    onWalletConnected(data) {
        // data doit contenir balances ET positions
        if (data && data.balances) {
            this.updatePortfolioCard(data.balances);
        }
        if (data && data.positions) {
            this.updatePositionsCard(data.positions);
        }
        // TODO: Activer les boutons interactifs
    }
    // Appeler ceci lors de la déconnexion wallet
    onWalletDisconnected() {
        this.updatePositionsCard([]); // Réinitialiser la card positions
        // TODO: Désactiver les boutons interactifs
    }
}

// --- Logo SVG dynamique BOOMBOXSWAP ---
function createBoomboxswapLogo() {
    const logoContainer = document.querySelector('.logo-container');
    if (!logoContainer) return;
    // Créer SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '220');
    svg.setAttribute('height', '40');
    svg.setAttribute('viewBox', '0 0 220 40');
    // Définir les couleurs
    const colors = {
        boom: '#10b981',  // Vert
        box: '#ffffff',   // Blanc
        swap: '#3b82f6'   // Bleu
    };
    // Lettres et leurs positions (espacement réduit, P ajouté)
    const letters = [
        {char: 'B', x: 0, color: 'boom', bitcoin: true},
        {char: 'O', x: 18, color: 'boom'},
        {char: 'O', x: 36, color: 'boom'},
        {char: 'M', x: 54, color: 'boom'},
        {char: 'B', x: 80, color: 'box'},
        {char: 'O', x: 98, color: 'box'},
        {char: 'X', x: 116, color: 'box'},
        {char: 'S', x: 142, color: 'swap', bitcoin: true},
        {char: 'W', x: 160, color: 'swap'},
        {char: 'A', x: 178, color: 'swap'},
        {char: 'P', x: 196, color: 'swap'}
    ];
    // Créer chaque lettre
    letters.forEach(letter => {
        // Texte principal
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', letter.x);
        text.setAttribute('y', '28');
        text.setAttribute('fill', colors[letter.color]);
        text.setAttribute('font-family', 'Inter, sans-serif');
        text.setAttribute('font-weight', '700');
        text.setAttribute('font-size', '24');
        text.textContent = letter.char;
        svg.appendChild(text);
        // Barres Bitcoin horizontales si nécessaire
        if (letter.bitcoin) {
            // Barre du haut
            const topBar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            topBar.setAttribute('x', letter.x - 2);
            topBar.setAttribute('y', '6');
            topBar.setAttribute('width', '12');
            topBar.setAttribute('height', '2');
            topBar.setAttribute('fill', colors[letter.color]);
            svg.appendChild(topBar);
            // Barre du bas
            const bottomBar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bottomBar.setAttribute('x', letter.x - 2);
            bottomBar.setAttribute('y', '34');
            bottomBar.setAttribute('width', '12');
            bottomBar.setAttribute('height', '2');
            bottomBar.setAttribute('fill', colors[letter.color]);
            svg.appendChild(bottomBar);
        }
    });
    // Remplacer le logo existant
    logoContainer.innerHTML = '';
    logoContainer.appendChild(svg);
}
// Logo sera créé dans l'initialisation principale

    // ===== FONCTION CRÉATION PLACEHOLDER SVG =====
    function createPlaceholderSVG(name, color) {
        const svgContent = `
            <svg width="48" height="48" xmlns="http://www.w3.org/2000/svg">
                <rect width="48" height="48" fill="${color}" rx="6"/>
                <text x="24" y="30" font-family="Arial" font-size="12" fill="white" text-anchor="middle" font-weight="bold">${name}</text>
            </svg>
        `;
        return `data:image/svg+xml;base64,${btoa(svgContent)}`;
    }

    // ===== CSS DE SECOURS POUR LOGOS =====
    function applyWalletLogoBackupCSS() {
        // CSS minimal pour garantir la visibilité des logos
        const backupCSS = `
            /* Règle de base: petite taille par défaut pour garantir la visibilité */
            .wallet-logo {
                width: 48px !important;
                height: 48px !important;
                display: block !important;
                margin: 0 auto 12px auto !important;
                opacity: 1 !important;
                visibility: visible !important;
            }
            
            /* MetaMask */
            #connect-metamask .wallet-logo {
                margin-top: 10px !important;
                width: 64px !important;
                height: 64px !important;
            }
            
            /* WalletConnect */
            #connect-walletconnect .wallet-logo {
                margin-top: 20px !important;
                width: 88px !important;
                height: 88px !important;
            }
            
            /* Phantom (override spécifique MVP): 60px */
            #connect-phantom .wallet-logo {
                width: 60px !important;
                height: 60px !important;
            }
        `;
        
        // Créer et injecter le CSS de secours
        const style = document.createElement('style');
        style.textContent = backupCSS;
        document.head.appendChild(style);
        console.log('🔧 AUDIT CSS: CSS minimal pour logos appliqué');
    }

// Appliquer CSS de secours au chargement
applyWalletLogoBackupCSS();

// --- Fix WalletConnect Modal Size (injection CSS dans Shadow DOM) ---
function fixWalletConnectModalSize() {
    const interval = setInterval(() => {
        // Cherche le modal WalletConnect (balise custom ou shadow DOM)
        const modal = document.querySelector('wcm-modal, wc-modal, [class*=walletconnect]');
        if (modal && modal.shadowRoot) {
            if (!modal.shadowRoot.getElementById('fix-modal-size')) {
                const style = document.createElement('style');
                style.id = 'fix-modal-size';
                style.textContent = `
                    :host, .wcm-modal-container, .wcm-modal-content {
                        max-width: 380px !important;
                        width: 95vw !important;
                        max-height: 90vh !important;
                        height: auto !important;
                        min-width: 0 !important;
                        min-height: 0 !important;
                        box-sizing: border-box !important;
                    }
                    .wcm-qr-code, .wcm-qr-code canvas, .wcm-qr-code svg {
                        width: 180px !important;
                        height: 180px !important;
                        max-width: 180px !important;
                        max-height: 180px !important;
                        margin: 0 auto !important;
                        display: block !important;
                    }
                `;
                modal.shadowRoot.appendChild(style);
            }
            clearInterval(interval);
        }
    }, 100);
}

/**
 * Correction Shadow DOM avec timing correct
 * Attend que Web3Modal soit vraiment chargé
 */
function fixWalletConnectShadowDOM() {
    const checkAndFixModal = () => {
        const modal = document.querySelector('wcm-modal');
        if (modal && modal.shadowRoot) {
            // Shadow DOM trouvé, appliquer correction
            const style = document.createElement('style');
            style.textContent = `
                :host {
                    filter: none !important;
                    backdrop-filter: none !important;
                }
                .wcm-modal-container,
                .wcm-modal-content,
                .wcm-modal {
                    filter: none !important;
                    backdrop-filter: none !important;
                }
            `;
            modal.shadowRoot.appendChild(style);
            console.log('🎮 Shadow DOM Web3Modal corrigé (timing correct)');
            return true;
        }
        return false;
    };
    
    // Vérifier immédiatement
    if (!checkAndFixModal()) {
        // Retry toutes les 500ms pendant 10 secondes max
        let attempts = 0;
        const retryInterval = setInterval(() => {
            attempts++;
            if (checkAndFixModal() || attempts > 20) {
                clearInterval(retryInterval);
                if (attempts > 20) {
                    console.warn('⚠️ Web3Modal Shadow DOM non trouvé après 10s');
                }
            }
        }, 500);
    }
}

// === INTEGRATION EVENEMENTS WALLET ===
// SUPPRIMÉ : Event listener MetaMask automatique qui causait des conflits
// Les events MetaMask sont maintenant gérés uniquement après connexion manuelle
// pour éviter l'erreur "Already processing eth_requestAccounts"
// WalletConnect (événement custom à adapter selon intégration)
window.addEventListener('walletconnect-connected', async (e) => {
    const address = e.detail && e.detail.address;
    if (address) {
        try {
            const currentChainId = (
                window.BOOMSWAP_CURRENT_CHAIN_ID
                || (window.BoomboxChainManager
                    && window.BoomboxChainManager.getCurrentChain
                    && window.BoomboxChainManager.getCurrentChain().id)
                || 56
            );
            const balances = await window.BoomboxAPI.getBalances(
                address,
                currentChainId
            );
            let positions = [];
            try {
                const posResp = await window.BoomboxAPI.getPositions(
                    address,
                    currentChainId
                );
                positions = posResp || [];
            } catch (e) { console.error('Erreur récupération positions:', e); }
            console.debug('[DEBUG] Données balances reçues:', balances);
            console.debug('[DEBUG] Données positions reçues:', positions);
            if (window.BoomboxApp && window.BoomboxApp.onWalletConnected) {
                window.BoomboxApp.onWalletConnected({ balances, positions });
            }
        } catch (e) { console.error(e); }
    }
});
window.addEventListener('walletconnect-disconnected', () => {
    if (window.BoomboxApp && window.BoomboxApp.onWalletDisconnected) {
        window.BoomboxApp.onWalletDisconnected();
    }
});


    // Robustesse : fermer le menu si navigation ou DOM modifié


// === SÉLECTEUR DE CHAÎNE ===
(function() {
    console.log("=== INITIALISATION SÉLECTEUR DE CHAÎNE ===");
    
    const chainSelector = document.getElementById('chain-selector');
    const chainOptions = document.getElementById('chain-options');
    
    if (!chainSelector || !chainOptions) {
        console.log("Éléments sélecteur de chaîne non trouvés");
        return;
    }

    let menuOpen = false;

    // Fonction de mise à jour de la position du menu
    const updateMenuPosition = () => {
        const selectorRect = chainSelector.getBoundingClientRect();
        chainOptions.style.left = selectorRect.left + 'px';
        chainOptions.style.top = selectorRect.bottom + 5 + 'px';
        chainOptions.style.width = selectorRect.width + 'px';
    };

    // Gestionnaire de clic sur le sélecteur
    chainSelector.addEventListener('click', function(e) {
        e.stopPropagation();
        
        if (menuOpen) {
            chainOptions.style.display = 'none';
            menuOpen = false;
        } else {
            updateMenuPosition();
            chainOptions.style.display = 'block';
            menuOpen = true;
        }
    });

    // Gestionnaire de clic sur les options
    chainOptions.addEventListener('click', function(e) {
        if (e.target.closest('.chain-option')) {
            const option = e.target.closest('.chain-option');
            const chainValue = option.dataset.value;
            const chainName = option.querySelector('.chain-name').textContent;
            const chainLogo = option.querySelector('.chain-logo').src;
            
            // Mettre à jour le sélecteur
            const selectedChain = chainSelector.querySelector('.selected-chain');
            selectedChain.querySelector('.chain-logo').src = chainLogo;
            selectedChain.querySelector('.chain-name').textContent = chainName;
            
            // Fermer le menu
            chainOptions.style.display = 'none';
            menuOpen = false;
            
            // Émettre événement de changement de chaîne
            if (window.BoomboxEvents) {
                window.BoomboxEvents.emit(window.BoomboxEvents.EVENTS.CHAIN_CHANGED, {
                    chainId: chainValue,
                    chainName: chainName,
                    timestamp: new Date().toISOString()
                });
            }
            
            console.log(`Chaîne changée vers: ${chainName} (${chainValue})`);
        }
    });

    // Fermer le menu en cliquant à l'extérieur
    document.addEventListener('click', () => {
        if (menuOpen) {
            chainOptions.style.display = 'none';
            menuOpen = false;
        }
    });

    console.log("Sélecteur de chaîne initialisé avec succès");
})();

// Initialiser l'application quand le DOM est prêt
window.waitForDOM(() => {
    console.log('🚀 === INITIALISATION GLOBALE BOOMBOXSWAP DÉMARRÉE ===');
    console.log('📋 État DOM:', document.readyState);
    console.log('📋 waitForDOM appelé');
    
    // === AUDIT FRONTEND BOOMSWAP ===
    console.log('=== AUDIT FRONTEND BOOMSWAP ===');
    
    console.log('Functions defined:', {
        onWalletConnected: typeof window.BoomboxApp?.onWalletConnected,
        updatePortfolioCard: typeof window.BoomboxApp?.updatePortfolioCard
    });
    
    // Créer le logo SVG
    console.log('📋 Création logo SVG...');
    createBoomboxswapLogo();
    
    // SUPPRIMÉ: Appel à setAllCardsToZero() - INUTILE
    // Les éléments HTML sont maintenant initialisés avec "---" par défaut
    console.log('📋 Initialisation terminée - éléments Card 3 avec "---" par défaut');
    
    // Créer l'instance BoomboxApp (TOUJOURS)
    if (!window.BoomboxApp) {
        console.log('📋 Création instance BoomboxApp...');
        window.BoomboxApp = new BoomboxApp();
        console.log('✅ Instance BoomboxApp créée');
    } else {
        console.log('⚠️ Instance BoomboxApp déjà existante');
    }
    
    // ===== AUDIT CARD 3 - SURVEILLANCE DÉMARRAGE =====
    console.log('🎯 AUDIT CARD3: === DÉMARRAGE APPLICATION ===');
    console.log('🎯 AUDIT CARD3: État Card 3 au démarrage:');
    
    // Vérifier l'état initial de la Card 3
    const feesGenerated = document.getElementById('fees-generated');
    const cakeRewards = document.getElementById('cake-rewards');
    const totalGains = document.getElementById('total-gains');
    
    console.log('🎯 AUDIT CARD3:   - fees-generated initial:', feesGenerated?.textContent);
    console.log('🎯 AUDIT CARD3:   - cake-rewards initial:', cakeRewards?.textContent);
    console.log('🎯 AUDIT CARD3:   - total-gains initial:', totalGains?.textContent);
    console.log('🎯 AUDIT CARD3: === FIN DÉMARRAGE ===');
    
    // Initialiser TOUJOURS
    console.log('📋 Initialisation BoomboxApp...');
    console.log('📋 Type de BoomboxApp.init:', typeof window.BoomboxApp.init);
    
    if (typeof window.BoomboxApp.init === 'function') {
        window.BoomboxApp.init();
        console.log('✅ BoomboxApp.init() appelé');
    } else {
        console.error('❌ BoomboxApp.init n\'est pas une fonction !');
    }
    
    // Marquer comme initialisée
    window.BOOMBOX_APP_INITIALIZED = true;
    console.log('✅ BOOMBOX_APP_INITIALIZED = true');
    
    // Appel automatique à chaque ouverture du modal WalletConnect
    const walletConnectBtn = document.getElementById('walletConnect');
    if (walletConnectBtn) {
        walletConnectBtn.addEventListener('click', () => {
            setTimeout(fixWalletConnectModalSize, 400);
        });
    }
    
    console.log('🚀 === INITIALISATION GLOBALE BOOMBOXSWAP TERMINÉE ===');
});

// Nettoyer à la fermeture
window.addEventListener('beforeunload', () => {
    if (window.BoomboxApp) {
        window.BoomboxApp.destroy();
    }
});

// ===== SURVEILLANCE FORENSIQUE CARD 3 RENDEMENTS =====
console.log('🎯 AUDIT CARD3: === SURVEILLANCE CARD 3 RENDEMENTS DÉMARRÉE ===');

// Système de timeline pour tracer TOUTES les modifications Card 3
window.CARD3_TIMELINE = [];

function logCard3Change(action, details) {
    const entry = {
        timestamp: Date.now(),
        action: action,
        details: details,
        stack: new Error().stack
    };
    window.CARD3_TIMELINE.push(entry);
    console.log('📅 CARD3 TIMELINE:', entry);
}

// Observer les modifications de la Card 3 spécifiquement
function setupCard3Forensics() {
    console.log('🎯 AUDIT CARD3: Configuration surveillance Card 3...');
    
    const card3 = document.querySelector('.smart-card:nth-child(2)'); // Card 3 Rendements
    if (!card3) {
        console.error('🎯 AUDIT CARD3: Card 3 non trouvée !');
        return;
    }
    
    console.log('🎯 AUDIT CARD3: Card 3 trouvée, surveillance configurée');
    
    // Observer les modifications du contenu de la Card 3
    const card3Observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' || mutation.type === 'characterData') {
                logCard3Change('CONTENT_MODIFICATION', {
                    type: mutation.type,
                    target: mutation.target.id || mutation.target.className,
                    oldValue: mutation.oldValue,
                    newValue: mutation.target.textContent?.substring(0, 100)
                });
            }
        });
    });
    
    card3Observer.observe(card3, { 
        childList: true, 
        subtree: true, 
        characterData: true,
        characterDataOldValue: true
    });
    
    console.log('🎯 AUDIT CARD3: Observer Card 3 configuré');
}

// Fonction d'audit spécifique pour Card 3
window.AUDIT_CARD3 = function() {
    console.log('🎯 AUDIT CARD3: === AUDIT CARD 3 RENDEMENTS ===');
    
    const card3 = document.querySelector('.smart-card:nth-child(2)');
    if (!card3) {
        console.error('🎯 AUDIT CARD3: Card 3 non trouvée dans audit');
        return;
    }
    
    // Vérifier tous les éléments de la Card 3
    const feesGenerated = document.getElementById('fees-generated');
    const cakeRewards = document.getElementById('cake-rewards');
    const totalGains = document.getElementById('total-gains');
    const rebalancingCount = document.getElementById('rebalancing-count');
    const autocompoundCount = document.getElementById('autocompound-count');
    const breakEven = document.getElementById('break-even');
    
    console.log('🎯 AUDIT CARD3: État actuel Card 3:');
    console.log('🎯 AUDIT CARD3:   - fees-generated:', feesGenerated?.textContent);
    console.log('🎯 AUDIT CARD3:   - cake-rewards:', cakeRewards?.textContent);
    console.log('🎯 AUDIT CARD3:   - total-gains:', totalGains?.textContent);
    console.log('🎯 AUDIT CARD3:   - rebalancing-count:', rebalancingCount?.textContent);
    console.log('🎯 AUDIT CARD3:   - autocompound-count:', autocompoundCount?.textContent);
    console.log('🎯 AUDIT CARD3:   - break-even:', breakEven?.textContent);
    
    console.log('🎯 AUDIT CARD3: Timeline Card 3:', window.CARD3_TIMELINE);
    console.log('🎯 AUDIT CARD3: === FIN AUDIT CARD 3 ===');
};

// Initialiser la surveillance Card 3
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 AUDIT CARD3: DOM chargé, initialisation surveillance Card 3...');
    setupCard3Forensics();
});

// ===== AUDIT FORENSIQUE DOLLARS FAKE CARD 3 - SURVEILLANCE ULTRA-PRÉCISE =====
console.log('🎯 AUDIT DOLLARS: === SURVEILLANCE DOLLARS FAKE CARD 3 DÉMARRÉE ===');

// Système de timeline pour tracer TOUTES les modifications de valeurs monétaires
window.DOLLARS_TIMELINE = [];

function logDollarChange(elementId, oldValue, newValue, source, details) {
    const entry = {
        timestamp: Date.now(),
        elementId: elementId,
        oldValue: oldValue,
        newValue: newValue,
        source: source,
        details: details,
        stack: new Error().stack,
        url: window.location.href,
        userAgent: navigator.userAgent
    };
    window.DOLLARS_TIMELINE.push(entry);
    console.log('🎯 AUDIT DOLLARS: === DÉTECTION VALEUR DOLLAR CARD 3 ===');
    console.log('🎯 AUDIT DOLLARS: Élément:', elementId);
    console.log('🎯 AUDIT DOLLARS: Ancienne valeur:', oldValue);
    console.log('🎯 AUDIT DOLLARS: Nouvelle valeur:', newValue);
    console.log('🎯 AUDIT DOLLARS: Source:', source);
    console.log('🎯 AUDIT DOLLARS: Détails:', details);
    console.log('🎯 AUDIT DOLLARS: Stack trace:', entry.stack);
    console.log('🎯 AUDIT DOLLARS: URL:', entry.url);
    console.log('🎯 AUDIT DOLLARS: === FIN DÉTECTION ===');
}

// Intercepter TOUTES les modifications de textContent contenant des dollars
function setupDollarInterception() {
    console.log('🎯 AUDIT DOLLARS: Configuration interception modifications dollar...');
    
    // Liste des éléments Card 3 à surveiller
    const card3Elements = [
        'fees-generated',
        'cake-rewards', 
        'total-gains',
        'rebalancing-count',
        'autocompound-count',
        'break-even'
    ];
    
    card3Elements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            console.log(`🎯 AUDIT DOLLARS: Surveillance configurée pour ${elementId}`);
            
            // Observer les modifications du contenu
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList' || mutation.type === 'characterData') {
                        const oldValue = mutation.oldValue || '';
                        const newValue = mutation.target.textContent || '';
                        
                        // Vérifier si la nouvelle valeur contient des dollars
                        if (newValue.includes('$') && newValue !== oldValue) {
                            logDollarChange(elementId, oldValue, newValue, 'DOM_MUTATION', {
                                mutationType: mutation.type,
                                target: mutation.target.id || mutation.target.className,
                                timestamp: Date.now()
                            });
                        }
                    }
                });
            });
            
            observer.observe(element, { 
                childList: true, 
                subtree: true, 
                characterData: true,
                characterDataOldValue: true
            });
            
            // Intercepter les modifications directes de textContent
            const originalTextContent = Object.getOwnPropertyDescriptor(Element.prototype, 'textContent');
            if (originalTextContent) {
                Object.defineProperty(element, 'textContent', {
                    set: function(value) {
                        const oldValue = this.textContent;
                        if (value && value.includes('$') && value !== oldValue) {
                            logDollarChange(elementId, oldValue, value, 'TEXTCONTENT_SET', {
                                caller: new Error().stack,
                                timestamp: Date.now()
                            });
                        }
                        return originalTextContent.set.call(this, value);
                    },
                    get: function() {
                        return originalTextContent.get.call(this);
                    }
                });
            }
        } else {
            console.warn(`🎯 AUDIT DOLLARS: Élément ${elementId} non trouvé`);
        }
    });
}

// Intercepter TOUS les appels API qui pourraient retourner des dollars
function setupAPIDollarInterception() {
    console.log('🎯 AUDIT DOLLARS: Configuration interception API dollar...');
    
    // Intercepter fetch
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const url = args[0];
        const options = args[1] || {};
        
        console.log('🎯 AUDIT DOLLARS: === APPEL API DÉTECTÉ ===');
        console.log('🎯 AUDIT DOLLARS: URL:', url);
        console.log('🎯 AUDIT DOLLARS: Méthode:', options.method || 'GET');
        console.log('🎯 AUDIT DOLLARS: Headers:', options.headers);
        console.log('🎯 AUDIT DOLLARS: Body:', options.body);
        console.log('🎯 AUDIT DOLLARS: Stack trace:', new Error().stack);
        
        return originalFetch.apply(this, args).then(response => {
            // Cloner la réponse pour pouvoir la lire
            const clonedResponse = response.clone();
            
            clonedResponse.text().then(text => {
                try {
                    const data = JSON.parse(text);
                    console.log('🎯 AUDIT DOLLARS: === RÉPONSE API ===');
                    console.log('🎯 AUDIT DOLLARS: Status:', response.status);
                    console.log('🎯 AUDIT DOLLARS: Headers:', Object.fromEntries(response.headers.entries()));
                    console.log('🎯 AUDIT DOLLARS: Données brutes:', data);
                    
                    // Vérifier si la réponse contient des valeurs monétaires
                    const jsonString = JSON.stringify(data);
                    if (jsonString.includes('$') || jsonString.includes('USD') || jsonString.includes('dollar')) {
                        console.log('🎯 AUDIT DOLLARS: === VALEURS MONÉTAIRES DÉTECTÉES ===');
                        console.log('🎯 AUDIT DOLLARS: Données complètes:', data);
                        console.log('🎯 AUDIT DOLLARS: URL source:', url);
                        console.log('🎯 AUDIT DOLLARS: Timestamp:', Date.now());
                    }
                } catch (e) {
                    // Réponse non-JSON
                    if (text.includes('$') || text.includes('USD') || text.includes('dollar')) {
                        console.log('🎯 AUDIT DOLLARS: === VALEURS MONÉTAIRES DÉTECTÉES (TEXT) ===');
                        console.log('🎯 AUDIT DOLLARS: Contenu textuel:', text);
                        console.log('🎯 AUDIT DOLLARS: URL source:', url);
                    }
                }
            });
            
            return response;
        });
    };
    
    console.log('🎯 AUDIT DOLLARS: Interception fetch configurée');
}

// Intercepter les modifications de localStorage/sessionStorage
function setupStorageDollarInterception() {
    console.log('🎯 AUDIT DOLLARS: Configuration interception storage dollar...');
    
    // Intercepter localStorage
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
        if (value && (value.includes('$') || value.includes('USD') || value.includes('dollar'))) {
            console.log('🎯 AUDIT DOLLARS: === STORAGE DOLLAR DÉTECTÉ ===');
            console.log('🎯 AUDIT DOLLARS: Storage type:', this === localStorage ? 'localStorage' : 'sessionStorage');
            console.log('🎯 AUDIT DOLLARS: Clé:', key);
            console.log('🎯 AUDIT DOLLARS: Valeur:', value);
            console.log('🎯 AUDIT DOLLARS: Stack trace:', new Error().stack);
        }
        return originalSetItem.call(this, key, value);
    };
    
    // Intercepter sessionStorage
    const originalGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = function(key) {
        const value = originalGetItem.call(this, key);
        if (value && (value.includes('$') || value.includes('USD') || value.includes('dollar'))) {
            console.log('🎯 AUDIT DOLLARS: === LECTURE STORAGE DOLLAR ===');
            console.log('🎯 AUDIT DOLLARS: Storage type:', this === localStorage ? 'localStorage' : 'sessionStorage');
            console.log('🎯 AUDIT DOLLARS: Clé:', key);
            console.log('🎯 AUDIT DOLLARS: Valeur lue:', value);
            console.log('🎯 AUDIT DOLLARS: Stack trace:', new Error().stack);
        }
        return value;
    };
    
    console.log('🎯 AUDIT DOLLARS: Interception storage configurée');
}

// Fonction de diagnostic complet des dollars
window.AUDIT_DOLLARS_DIAGNOSTIC = function() {
    console.log('🎯 AUDIT DOLLARS: === DIAGNOSTIC COMPLET DOLLARS FAKE ===');
    console.log('🎯 AUDIT DOLLARS: Timeline complète:', window.DOLLARS_TIMELINE);
    
    // Vérifier l'état actuel de la Card 3
    const card3Elements = [
        'fees-generated',
        'cake-rewards', 
        'total-gains',
        'rebalancing-count',
        'autocompound-count',
        'break-even'
    ];
    
    console.log('🎯 AUDIT DOLLARS: État actuel Card 3:');
    card3Elements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            console.log(`🎯 AUDIT DOLLARS:   - ${elementId}:`, element.textContent);
        } else {
            console.log(`🎯 AUDIT DOLLARS:   - ${elementId}: ÉLÉMENT NON TROUVÉ`);
        }
    });
    
    // Vérifier le localStorage/sessionStorage
    console.log('🎯 AUDIT DOLLARS: Vérification storage...');
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        if (value && (value.includes('$') || value.includes('USD') || value.includes('dollar'))) {
            console.log(`🎯 AUDIT DOLLARS: localStorage[${key}]:`, value);
        }
    }
    
    for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        const value = sessionStorage.getItem(key);
        if (value && (value.includes('$') || value.includes('USD') || value.includes('dollar'))) {
            console.log(`🎯 AUDIT DOLLARS: sessionStorage[${key}]:`, value);
        }
    }
    
    console.log('🎯 AUDIT DOLLARS: === FIN DIAGNOSTIC ===');
};

// Fonction de test pour vérifier que la Card 3 est vide
window.testCard3Vide = function() {
    console.log('🎯 TEST CARD3: === VÉRIFICATION CARD 3 VIDE ===');
    
    const card3Elements = [
        'fees-generated',
        'cake-rewards', 
        'total-gains',
        'rebalancing-count',
        'autocompound-count',
        'break-even'
    ];
    
    let allEmpty = true;
    
    card3Elements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            const content = element.textContent.trim();
            const isEmpty = content === '';
            console.log(`🎯 TEST CARD3: ${elementId}: "${content}" ${isEmpty ? '✅ VIDE' : '❌ NON VIDE'}`);
            if (!isEmpty) {
                allEmpty = false;
            }
        } else {
            console.log(`🎯 TEST CARD3: ${elementId}: ❌ ÉLÉMENT NON TROUVÉ`);
            allEmpty = false;
        }
    });
    
    console.log('🎯 TEST CARD3: === RÉSULTAT ===');
    if (allEmpty) {
        console.log('🎯 TEST CARD3: ✅ CARD 3 COMPLÈTEMENT VIDE - SUCCÈS');
    } else {
        console.log('🎯 TEST CARD3: ❌ CARD 3 CONTIENT DU TEXTE - ÉCHEC');
    }
    console.log('🎯 TEST CARD3: === FIN TEST ===');
};

// Fonction de test pour l'audit timing
window.testTimingAudit = function() {
    console.log('🎯 TEST TIMING: === TEST AUDIT TIMING ===');
    
    // Vérifier que la timeline existe
    if (!window.TIMING_TIMELINE) {
        console.log('🎯 TEST TIMING: ❌ TIMING_TIMELINE non trouvée');
        return;
    }
    
    console.log('🎯 TEST TIMING: Timeline trouvée, événements:', window.TIMING_TIMELINE.length);
    
    // Vérifier les événements Card 3
    const card3Events = window.TIMING_TIMELINE.filter(event => 
        event.event === 'CARD3_ELEMENT_DETECTED'
    );
    
    console.log('🎯 TEST TIMING: Événements Card 3 détectés:', card3Events.length);
    
    // Vérifier les données fake
    const fakeDataEvents = card3Events.filter(event => 
        event.details.isFakeData
    );
    
    console.log('🎯 TEST TIMING: Données fake détectées:', fakeDataEvents.length);
    
    if (fakeDataEvents.length > 0) {
        console.log('🎯 TEST TIMING: ✅ SOURCE FAKE DATA IDENTIFIÉE');
        fakeDataEvents.forEach(event => {
            console.log('🎯 TEST TIMING:   -', event.details.elementId, ':', event.details.content);
        });
    } else {
        console.log('🎯 TEST TIMING: ❌ AUCUNE DONNÉE FAKE DÉTECTÉE');
    }
    
    // Vérifier l'ordre chronologique
    const sortedEvents = window.TIMING_TIMELINE.sort((a, b) => a.timestamp - b.timestamp);
    console.log('🎯 TEST TIMING: Premier événement:', sortedEvents[0]?.event);
    console.log('🎯 TEST TIMING: Dernier événement:', sortedEvents[sortedEvents.length - 1]?.event);
    
    console.log('🎯 TEST TIMING: === FIN TEST AUDIT TIMING ===');
};

// Initialiser la surveillance au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 AUDIT DOLLARS: DOM chargé, initialisation surveillance dollars...');
    setupDollarInterception();
    setupAPIDollarInterception();
    setupStorageDollarInterception();
    
    // Diagnostic initial
    setTimeout(() => {
        console.log('🎯 AUDIT DOLLARS: Diagnostic initial après 2 secondes...');
        window.AUDIT_DOLLARS_DIAGNOSTIC();
    }, 2000);
});

// ===== AUDIT FORENSIQUE TIMING FAKE DATA CARD 3 - SURVEILLANCE ULTRA-PRÉCISE =====
console.log('🎯 TIMING [', Date.now(), ']: === AUDIT FORENSIQUE TIMING FAKE DATA DÉMARRÉ ===');

// Timeline chronologique ultra-précise
window.TIMING_TIMELINE = [];

function logTimingEvent(event, details) {
    const entry = {
        timestamp: Date.now(),
        performanceTime: performance.now(),
        event: event,
        details: details,
        stack: new Error().stack,
        url: window.location.href,
        domReadyState: document.readyState
    };
    window.TIMING_TIMELINE.push(entry);
    console.log('🎯 TIMING [', entry.timestamp, ']: === ÉVÉNEMENT TIMING ===');
    console.log('🎯 TIMING [', entry.timestamp, ']: Événement:', event);
    console.log('🎯 TIMING [', entry.timestamp, ']: Performance time:', entry.performanceTime, 'ms');
    console.log('🎯 TIMING [', entry.timestamp, ']: DOM ready state:', entry.domReadyState);
    console.log('🎯 TIMING [', entry.timestamp, ']: Détails:', details);
    console.log('🎯 TIMING [', entry.timestamp, ']: Stack trace:', entry.stack);
    console.log('🎯 TIMING [', entry.timestamp, ']: === FIN ÉVÉNEMENT ===');
}

// Surveillance immédiate des éléments Card 3 dès que le DOM existe
function setupImmediateCard3Surveillance() {
    console.log('🎯 TIMING [', Date.now(), ']: === SURVEILLANCE IMMÉDIATE CARD 3 ===');
    
    const card3Elements = [
        'fees-generated',
        'cake-rewards', 
        'total-gains',
        'rebalancing-count',
        'autocompound-count',
        'break-even'
    ];
    
    // Vérifier immédiatement l'état des éléments
    card3Elements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            const content = element.textContent.trim();
            logTimingEvent('CARD3_ELEMENT_DETECTED', {
                elementId: elementId,
                content: content,
                hasContent: content !== '',
                isFakeData: content.includes('$') || content.includes('fois') || content === 'Atteint'
            });
            
            // Observer les modifications immédiatement
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList' || mutation.type === 'characterData') {
                        const oldValue = mutation.oldValue || '';
                        const newValue = mutation.target.textContent || '';
                        
                        logTimingEvent('CARD3_MODIFICATION_DETECTED', {
                            elementId: elementId,
                            oldValue: oldValue,
                            newValue: newValue,
                            mutationType: mutation.type,
                            timestamp: Date.now(),
                            performanceTime: performance.now()
                        });
                    }
                });
            });
            
            observer.observe(element, { 
                childList: true, 
                subtree: true, 
                characterData: true,
                characterDataOldValue: true
            });
            
            console.log('🎯 TIMING [', Date.now(), ']: Surveillance configurée pour', elementId);
        } else {
            logTimingEvent('CARD3_ELEMENT_NOT_FOUND', {
                elementId: elementId,
                timestamp: Date.now()
            });
        }
    });
}

// Surveillance du chargement des fichiers JS
function setupScriptLoadingSurveillance() {
    console.log('🎯 TIMING [', Date.now(), ']: === SURVEILLANCE CHARGEMENT SCRIPTS ===');
    
    // Intercepter les ajouts de scripts
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
        const element = originalCreateElement.call(this, tagName);
        if (tagName.toLowerCase() === 'script') {
            logTimingEvent('SCRIPT_CREATED', {
                tagName: tagName,
                timestamp: Date.now()
            });
            
            // Observer les modifications du script
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
                        logTimingEvent('SCRIPT_SRC_SET', {
                            src: element.src,
                            timestamp: Date.now()
                        });
                    }
                });
            });
            
            observer.observe(element, { 
                attributes: true, 
                attributeOldValue: true 
            });
        }
        return element;
    };
    
    // Intercepter les ajouts au DOM
    const originalAppendChild = Node.prototype.appendChild;
    Node.prototype.appendChild = function(child) {
        if (child.tagName && child.tagName.toLowerCase() === 'script') {
            logTimingEvent('SCRIPT_ADDED_TO_DOM', {
                src: child.src,
                timestamp: Date.now()
            });
        }
        return originalAppendChild.call(this, child);
    };
}

// Surveillance du localStorage/sessionStorage
function setupStorageTimingSurveillance() {
    console.log('🎯 TIMING [', Date.now(), ']: === SURVEILLANCE STORAGE TIMING ===');
    
    // Vérifier immédiatement le contenu du storage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        if (value && (value.includes('$') || value.includes('fois') || value.includes('Atteint'))) {
            logTimingEvent('STORAGE_FAKE_DATA_DETECTED', {
                storageType: 'localStorage',
                key: key,
                value: value,
                timestamp: Date.now()
            });
        }
    }
    
    for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        const value = sessionStorage.getItem(key);
        if (value && (value.includes('$') || value.includes('fois') || value.includes('Atteint'))) {
            logTimingEvent('STORAGE_FAKE_DATA_DETECTED', {
                storageType: 'sessionStorage',
                key: key,
                value: value,
                timestamp: Date.now()
            });
        }
    }
}

// Fonction de diagnostic timing complet
window.TIMING_DIAGNOSTIC = function() {
    console.log('🎯 TIMING [', Date.now(), ']: === DIAGNOSTIC TIMING COMPLET ===');
    console.log('🎯 TIMING [', Date.now(), ']: Timeline complète:', window.TIMING_TIMELINE);
    
    // Analyser les événements par ordre chronologique
    const sortedEvents = window.TIMING_TIMELINE.sort((a, b) => a.timestamp - b.timestamp);
    
    console.log('🎯 TIMING [', Date.now(), ']: === ÉVÉNEMENTS PAR ORDRE CHRONOLOGIQUE ===');
    sortedEvents.forEach((event, index) => {
        console.log(`🎯 TIMING [${index + 1}]: ${event.timestamp} - ${event.event}:`, event.details);
    });
    
    // Identifier les données fake détectées
    const fakeDataEvents = sortedEvents.filter(event => 
        event.event === 'CARD3_ELEMENT_DETECTED' && 
        event.details.isFakeData
    );
    
    console.log('🎯 TIMING [', Date.now(), ']: === DONNÉES FAKE DÉTECTÉES ===');
    fakeDataEvents.forEach(event => {
        console.log('🎯 TIMING [', Date.now(), ']: FAKE DATA:', event.details);
    });
    
    // Identifier la source HTML hardcodée
    const htmlSourceEvents = sortedEvents.filter(event => 
        event.event === 'CARD3_ELEMENT_DETECTED' && 
        event.details.hasContent
    );
    
    console.log('🎯 TIMING [', Date.now(), ']: === SOURCE HTML HARCODÉE ===');
    htmlSourceEvents.forEach(event => {
        console.log('🎯 TIMING [', Date.now(), ']: HTML SOURCE:', event.details);
    });
    
    console.log('🎯 TIMING [', Date.now(), ']: === FIN DIAGNOSTIC TIMING ===');
};

// Initialiser la surveillance immédiatement
logTimingEvent('AUDIT_TIMING_STARTED', {
    message: 'Audit timing fake data démarré',
    domReadyState: document.readyState
});

// Surveillance immédiate si DOM déjà chargé
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        logTimingEvent('DOM_CONTENT_LOADED', {
            message: 'DOM chargé, surveillance Card 3 démarrée'
        });
        setupImmediateCard3Surveillance();
        setupScriptLoadingSurveillance();
        setupStorageTimingSurveillance();
    });
} else {
    logTimingEvent('DOM_ALREADY_LOADED', {
        message: 'DOM déjà chargé, surveillance immédiate'
    });
    setupImmediateCard3Surveillance();
    setupScriptLoadingSurveillance();
    setupStorageTimingSurveillance();
}

// Surveillance des événements de chargement
window.addEventListener('load', () => {
    logTimingEvent('WINDOW_LOADED', {
        message: 'Page complètement chargée'
    });
});
