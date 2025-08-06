/**
 * BOOMBOXSWAP V1 - Application principale
 * Interface gaming pour PancakeSwap V3
 */

// ===== SURVEILLANCE FORENSIQUE UI MODAL WALLET =====
console.log('🎯 AUDIT FORENSIQUE: === SURVEILLANCE UI MODAL WALLET DÉMARRÉE ===');

// ===== SURVEILLANCE FORENSIQUE SOLDES CARD 1 =====
console.log('🎯 AUDIT SOLDES: === SURVEILLANCE WORKFLOW SOLDES DÉMARRÉE ===');

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
    console.log('🎯 AUDIT SOLDES:', entry);
}

// Intercepter les appels API getBalances
const originalGetBalances = window.BoomboxAPI?.getBalances;
if (window.BoomboxAPI && originalGetBalances) {
    window.BoomboxAPI.getBalances = async function(address, chainId) {
        logSoldesEvent('API_CALL_START', {
            address: address,
            chainId: chainId,
            url: `${this.baseUrl}/api/v1/data/balances/${address}?chain_id=${chainId}`
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
        const result = await window.BoomboxAPI.getBalances(address, chainId);
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

function setAllCardsToZero() {
    console.log('🎯 AUDIT CARD3: === SETALLCARDSZERO DÉMARRÉ ===');
    console.log('🎯 AUDIT CARD3: Source: setAllCardsToZero() - PROBABLE ORIGINE FAKE DATA');
    console.log('🎯 AUDIT CARD3: Stack trace:', new Error().stack);
    
    // ===== AUDIT DOLLARS: SURVEILLANCE SETALLCARDSZERO =====
    console.log('🎯 AUDIT DOLLARS: === SETALLCARDSZERO - MODIFICATIONS DOLLAR DÉTECTÉES ===');
    
    // Card 1 : Portefeuille
    document.getElementById('balance-bnb').textContent = '0.0000';
    document.getElementById('balance-usdt').textContent = '0.00';
    document.getElementById('balance-cake').textContent = '0.00';
    document.getElementById('total-value').textContent = '$0.00';
    
    // Card 2 : Rendements - COMPLÈTEMENT VIDE
    console.log('🎯 AUDIT CARD3: === VIDAGE COMPLET CARD 3 RENDEMENTS ===');
    if (document.getElementById('fees-generated')) {
        console.log('🎯 AUDIT CARD3: Vidage fees-generated (complètement vide)');
        console.log('🎯 AUDIT DOLLARS: SETALLCARDSZERO - fees-generated: VIDE');
        document.getElementById('fees-generated').textContent = '';
    }
    if (document.getElementById('cake-rewards')) {
        console.log('🎯 AUDIT CARD3: Vidage cake-rewards (complètement vide)');
        console.log('🎯 AUDIT DOLLARS: SETALLCARDSZERO - cake-rewards: VIDE');
        document.getElementById('cake-rewards').textContent = '';
    }
    if (document.getElementById('total-gains')) {
        console.log('🎯 AUDIT CARD3: Vidage total-gains (complètement vide)');
        console.log('🎯 AUDIT DOLLARS: SETALLCARDSZERO - total-gains: VIDE');
        document.getElementById('total-gains').textContent = '';
    }
    if (document.getElementById('rebalancing-count')) {
        console.log('🎯 AUDIT CARD3: Vidage rebalancing-count (complètement vide)');
        document.getElementById('rebalancing-count').textContent = '';
    }
    if (document.getElementById('autocompound-count')) {
        console.log('🎯 AUDIT CARD3: Vidage autocompound-count (complètement vide)');
        document.getElementById('autocompound-count').textContent = '';
    }
    if (document.getElementById('break-even')) {
        console.log('🎯 AUDIT CARD3: Vidage break-even (complètement vide)');
        document.getElementById('break-even').textContent = '';
    }
    
    // Card 4 : Dépôt
    if (document.getElementById('est-bnb')) document.getElementById('est-bnb').textContent = '0.0000';
    if (document.getElementById('est-usdt')) document.getElementById('est-usdt').textContent = '0.00';
    if (document.getElementById('est-total')) {
        console.log('🎯 AUDIT DOLLARS: SETALLCARDSZERO - est-total: $0.00');
        document.getElementById('est-total').textContent = '$0.00';
    }
    // Card 5 : Actions (ligne info)
    if (document.getElementById('positions-info')) document.getElementById('positions-info').textContent = '0/0 • 0% APR • - • - • -';
    // Card 6 : Swap intégré (état neutre, à compléter selon structure)
    // (exemple: désactiver boutons, remettre valeurs par défaut)
    // Card 2 : BNB/USDT (prix)
    document.getElementById('bnbPrice').textContent = '$0.00';
    
    console.log('🎯 AUDIT CARD3: === SETALLCARDSZERO TERMINÉ ===');
    console.log('🎯 AUDIT DOLLARS: === SETALLCARDSZERO - FIN MODIFICATIONS DOLLAR ===');
}

class BoomboxApp {
    constructor() {
        // Vérifier si une instance existe déjà
        if (window.BoomboxApp && window.BoomboxApp !== this) {
            console.log('Instance BoomboxApp déjà existante, arrêt...');
            return window.BoomboxApp;
        }
        
        this.isInitialized = false;
        this.priceUpdateInterval = null;
        this.soundEnabled = true;

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
            
            console.log(`🎯 AUDIT [${timestamp}]: 4. setupMusicControls()`);
            this.setupMusicControls();
            
            console.log(`🎯 AUDIT [${timestamp}]: 5. setupRangeConfig()`);
            this.setupRangeConfig();
            
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

        // Configuration WalletConnect (temporairement désactivé pour investigation)
        const walletConnectOption = document.getElementById('connect-walletconnect');
        if (walletConnectOption) {
            // ===== INVESTIGATION - DÉSACTIVATION TEMPORAIRE =====
            console.log(`🎯 INVESTIGATION: WalletConnect temporairement désactivé pour isolation`);
            
            walletConnectOption.onclick = async () => {
                console.log(`🎯 INVESTIGATION: WalletConnect appelé - DÉSACTIVÉ pour test`);
                console.log(`🎯 INVESTIGATION: Cette fonction ne doit PAS appeler eth_requestAccounts`);
                return null;
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
                        const result = await window.BOOMSWAP_CONNECT_METAMASK();
                        
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
     * Configuration contrôles musicaux
     */
    setupMusicControls() {
        const playBtn = document.getElementById('playBtn');
        const ejectBtn = document.getElementById('ejectBtn');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        if (playBtn) {
            playBtn.addEventListener('click', () => this.onPlayClicked());
        }

        if (ejectBtn) {
            ejectBtn.addEventListener('click', () => this.onEjectClicked());
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.onPrevClicked());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.onNextClicked());
        }
    }

    /**
     * Configuration page range config
     */
    setupRangeConfig() {
        const presetButtons = document.querySelectorAll('.preset-btn');
        const saveConfigBtn = document.getElementById('saveConfigBtn');
        const rangeAmount = document.getElementById('rangeAmount');

        // Boutons presets
        presetButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const amount = e.target.dataset.amount;
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
            if (window.BOOMSWAP_WEB3MODAL) {
                await window.BOOMSWAP_WEB3MODAL.clearCachedProvider();
            }
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
            this.disconnectWallet();
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
        
        // Mettre à jour le bouton wallet
        const walletBtn = document.getElementById('wallet-btn');
        if (walletBtn) {
            walletBtn.textContent = `${address.slice(0, 6)}...${address.slice(-4)}`;
            walletBtn.classList.add('connected');
            walletBtn.style.background = '#10b981'; // Vert success
            walletBtn.style.color = '#ffffff';
        }
        
        // Afficher le nom du réseau
        const networkName = this.getNetworkName(chainId);
        console.log(`🎯 AUDIT SOLDES [${timestamp}]: Réseau actuel: ${networkName}`);
        
        // --- SYNCHRONISATION BACKEND ---
        const apiUrl = window.BoomboxAPI.baseUrl;
        console.log(`🎯 AUDIT SOLDES [${timestamp}]: === APPEL API BALANCES ===`);
        console.log(`🎯 AUDIT SOLDES [${timestamp}]: URL appelée: ${apiUrl}/api/v1/data/balances/${address}?chain_id=${chainId}`);
        console.log(`🎯 AUDIT SOLDES [${timestamp}]: Headers envoyés: Content-Type: application/json`);
        
        window.BoomboxAPI.getBalances(address, chainId)
            .then(balances => {
                const responseTimestamp = Date.now();
                console.log(`🎯 AUDIT SOLDES [${responseTimestamp}]: === RÉPONSE API BALANCES ===`);
                console.log(`🎯 AUDIT SOLDES [${responseTimestamp}]: Status réponse: 200 OK`);
                console.log(`🎯 AUDIT SOLDES [${responseTimestamp}]: Données reçues:`, balances);
                
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
                
                this.updatePortfolioCard(balances);
            })
            .catch(err => {
                const errorTimestamp = Date.now();
                console.error(`🎯 AUDIT SOLDES [${errorTimestamp}]: === ERREUR API BALANCES ===`);
                console.error(`🎯 AUDIT SOLDES [${errorTimestamp}]: Erreur:`, err);
                
                logSoldesEvent('BALANCES_ERROR', {
                    error: err.message,
                    timestamp: errorTimestamp
                });
                
                this.showError('Balances', err.message || 'Erreur récupération soldes');
            });
        
        // Récupérer positions
        console.log(`🎯 AUDIT SOLDES [${timestamp}]: Appel getPositions pour: ${address}`);
        window.BoomboxAPI.getPositions(address, chainId)
            .then(positions => {
                console.log(`🎯 AUDIT SOLDES [${Date.now()}]: Données positions:`, positions);
                this.updatePositionsCard(positions);
            })
            .catch(err => {
                console.error(`🎯 AUDIT SOLDES [${Date.now()}]: ERREUR getPositions:`, err);
                this.showError('Positions', err.message || 'Erreur récupération positions');
            });
    }

    handleWalletDisconnected() {
        const timestamp = Date.now();
        console.log(`🎯 AUDIT FORENSIQUE [${timestamp}]: === HANDLE WALLET DISCONNECTED ===`);
        console.log(`🎯 AUDIT FORENSIQUE [${timestamp}]: État AVANT déconnexion:`);
        
        // Reset bouton wallet
        const walletBtn = document.getElementById('wallet-btn');
        if (walletBtn) {
            console.log(`🎯 AUDIT FORENSIQUE [${timestamp}]: Bouton wallet trouvé, état AVANT modification:`);
            console.log(`🎯 AUDIT FORENSIQUE [${timestamp}]:   - Text content:`, walletBtn.textContent);
            console.log(`🎯 AUDIT FORENSIQUE [${timestamp}]:   - Classes:`, walletBtn.className);
            console.log(`🎯 AUDIT FORENSIQUE [${timestamp}]:   - Style background:`, walletBtn.style.background);
            console.log(`🎯 AUDIT FORENSIQUE [${timestamp}]:   - Style color:`, walletBtn.style.color);
            console.log(`🎯 AUDIT FORENSIQUE [${timestamp}]:   - Disabled:`, walletBtn.disabled);
            
            // Modifications
            walletBtn.textContent = 'Connecter Wallet';
            walletBtn.classList.remove('connected');
            walletBtn.style.background = '#ef4444'; // Rouge par défaut
            walletBtn.style.color = '#ffffff';
            
            console.log(`🎯 AUDIT FORENSIQUE [${timestamp}]: État APRÈS modification:`);
            console.log(`🎯 AUDIT FORENSIQUE [${timestamp}]:   - Text content:`, walletBtn.textContent);
            console.log(`🎯 AUDIT FORENSIQUE [${timestamp}]:   - Classes:`, walletBtn.className);
            console.log(`🎯 AUDIT FORENSIQUE [${timestamp}]:   - Style background:`, walletBtn.style.background);
            console.log(`🎯 AUDIT FORENSIQUE [${timestamp}]:   - Style color:`, walletBtn.style.color);
            console.log(`🎯 AUDIT FORENSIQUE [${timestamp}]:   - Disabled:`, walletBtn.disabled);
        } else {
            console.error(`🎯 AUDIT FORENSIQUE [${timestamp}]: BOUTON WALLET NON TROUVÉ !`);
        }
        
        // Désactiver les fonctionnalités
        this.disableWalletFeatures && this.disableWalletFeatures();
        
        console.log(`🎯 AUDIT FORENSIQUE [${timestamp}]: === HANDLE WALLET DISCONNECTED TERMINÉ ===`);
    }

    handleNetworkChanged(chainId) {
        const networkName = this.getNetworkName(chainId);
        console.log('⛓️ Réseau changé vers:', networkName);
        // Mettre à jour l'interface selon le réseau
        if (this.interfaceInteractive) {
            this.interfaceInteractive.updateNetworkDisplay(chainId);
        }
    }

    getNetworkName(chainId) {
        const networks = {
            56: 'BSC',
            42161: 'Arbitrum',
            8453: 'Base',
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
        console.log('DEBUT MONITORING PRIX - Card 3');
        
        // Nettoyer les intervalles existants pour éviter les memory leaks
        this.cleanupPriceMonitoring();
        
        // Démarrer immédiatement le polling pour afficher le prix
        this.fallbackToPolling();
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
    fallbackToPolling() {
        console.log('Retour au polling classique');
        // Mise à jour initiale
        this.updatePrices();

        // Mise à jour toutes les 30 secondes comme spécifié
        this.priceUpdateInterval = setInterval(() => {
            this.updatePrices();
        }, 30000);
        
        // Stocker l'ID pour pouvoir le nettoyer plus tard
        console.log('📊 Monitoring prix démarré - Intervalle:', this.priceUpdateInterval);
    }

    /**
     * Mettre à jour les prix
     */
    async updatePrices() {
        try {
            // Utiliser BSC par défaut si pas de chain manager
            let chainId = 'bsc';
            if (window.BoomboxChainManager) {
                chainId = window.BoomboxChainManager.getCurrentChainId();
            }

            console.log('MISE A JOUR PRIX - Chain:', chainId);
            
            // Appel direct à l'API backend pour BNB avec timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
            
            const bnbResponse = await fetch(`/api/v1/price/${chainId}/BNB`, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!bnbResponse.ok) {
                const errorText = await bnbResponse.text();
                console.error('Échec récupération prix BNB:', errorText);
                throw new Error(`API Error ${bnbResponse.status}: ${errorText}`);
            }
            
            const bnbData = await bnbResponse.json();
            
            // Validation des données reçues
            if (!bnbData || typeof bnbData.price !== 'number') {
                throw new Error('Données de prix invalides reçues de l\'API');
            }
            
            // Construire l'objet prices avec le format attendu
            const prices = {
                BNB: bnbData
            };

            // Mettre à jour l'interface
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
            
            // Afficher erreur dans l'interface
            const bnbPriceElement = document.getElementById('bnbPrice');
            if (bnbPriceElement) {
                bnbPriceElement.textContent = 'Prix non disponible';
                bnbPriceElement.style.color = '#ff4757'; // Rouge pour erreur
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
        const timestamp = Date.now();
        console.log(`🎯 AUDIT [${timestamp}]: showWalletModal() appelé`);
        
        const modal = document.getElementById('walletModal');
        console.log(`🎯 AUDIT [${timestamp}]: Modal trouvé:`, !!modal);
        
        if (modal) {
            console.log(`🎯 AUDIT [${timestamp}]: Style display avant:`, modal.style.display);
            modal.style.display = 'flex';
            console.log(`🎯 AUDIT [${timestamp}]: Style display après:`, modal.style.display);
            
            // Ajouter classe modal-open pour flouter l'interface
            document.body.classList.add('modal-open');
            console.log(`🎯 AUDIT [${timestamp}]: Classe modal-open ajoutée - Interface floutée`);
            
            console.log(`🎯 AUDIT [${timestamp}]: Modal affiché avec succès`);
        } else {
            console.error(`🎯 AUDIT [${timestamp}]: Modal wallet non trouvé !`);
        }
    }

    /**
     * Masquer modal wallet
     */
    hideWalletModal() {
        console.log('🔒 === HIDE WALLET MODAL DÉMARRÉ ===');
        const modal = document.getElementById('walletModal');
        console.log('  - Modal trouvé:', !!modal);
        
        if (modal) {
            console.log('  - Style display avant:', modal.style.display);
            modal.style.display = 'none';
            console.log('  - Style display après:', modal.style.display);
            
            // Retirer classe modal-open pour déflouter l'interface
            document.body.classList.remove('modal-open');
            console.log('  - Classe modal-open retirée - Interface nette');
            
            console.log('✅ Modal wallet masqué');
        } else {
            console.error('❌ Modal wallet non trouvé dans hideWalletModal()');
        }
        console.log('🔒 === HIDE WALLET MODAL TERMINÉ ===');
    }

    /**
     * Actions musicales
     */
    onPlayClicked() {
        this.playSound('play');
        console.log('ACTION: PLAY CLICKED');

        if (window.BoomboxEvents) {
            window.BoomboxEvents.emit(window.BoomboxEvents.EVENTS.PLAY_CLICKED, {
                timestamp: new Date().toISOString()
            });
        }
    }

    onEjectClicked() {
        this.playSound('eject');
        console.log('ACTION: EJECT CLICKED');

        if (window.BoomboxEvents) {
            window.BoomboxEvents.emit(window.BoomboxEvents.EVENTS.EJECT_CLICKED, {
                timestamp: new Date().toISOString()
            });
        }
    }

    onPrevClicked() {
        this.playSound('prev');
        console.log('ACTION: PREV CLICKED');

        if (window.BoomboxEvents) {
            window.BoomboxEvents.emit(window.BoomboxEvents.EVENTS.PREV_CLICKED, {
                timestamp: new Date().toISOString()
            });
        }
    }

    onNextClicked() {
        this.playSound('next');
        console.log('ACTION: NEXT CLICKED');

        if (window.BoomboxEvents) {
            window.BoomboxEvents.emit(window.BoomboxEvents.EVENTS.NEXT_CLICKED, {
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Jouer un son
     */
    playSound(soundName) {
        if (!this.soundEnabled) return;

        try {
            const audio = new Audio(`assets/sounds/${soundName}.mp3`);
            audio.volume = 0.3;
            audio.play().catch(error => {
                console.warn(`SON ${soundName} NON DISPONIBLE:`, error);
            });
        } catch (error) {
            console.warn(`ERREUR SON ${soundName}:`, error);
        }
    }

    /**
     * Configuration range
     */
    setRangeAmount(amount) {
        const rangeAmount = document.getElementById('rangeAmount');
        if (rangeAmount) {
            rangeAmount.value = amount;
            this.updateRangePreview(amount);
        }
    }

    updateRangePreview(amount) {
        const rangeMin = document.getElementById('rangeMin');
        const rangeMax = document.getElementById('rangeMax');

        if (rangeMin && rangeMax && amount) {
            const numAmount = parseFloat(amount);
            const min = (numAmount * 0.95).toFixed(2);
            const max = (numAmount * 1.05).toFixed(2);

            rangeMin.textContent = `$${min}`;
            rangeMax.textContent = `$${max}`;
        }
    }

    saveRangeConfig() {
        const rangeAmount = document.getElementById('rangeAmount');
        if (rangeAmount && rangeAmount.value) {
            const amount = rangeAmount.value;

            // Sauvegarder en localStorage
            localStorage.setItem('boombox_range_config', amount);

            console.log(`CONFIGURATION RANGE SAUVEGARDEE: $${amount}`);

            // Émettre événement
            if (window.BoomboxEvents) {
                window.BoomboxEvents.emit(window.BoomboxEvents.EVENTS.RANGE_CONFIG_SAVED, {
                    amount: parseFloat(amount),
                    timestamp: new Date().toISOString()
                });
            }

            this.showSuccess('CONFIGURATION SAUVEGARDEE');
        }
    }

    /**
     * Callbacks événements
     */
    onChainChanged(data) {
        console.log('CHAIN CHANGE:', data);
        this.updatePrices(); // Mettre à jour prix pour nouvelle chain
    }

    onPriceUpdated(data) {
        console.log('PRICE UPDATE:', data);
    }

    /**
     * Affichage messages
     */
    showError(context, message) {
        console.error(`ERREUR ${context}:`, message);
        // Afficher un toast d'erreur avec style rouge
        if (typeof showNotification === 'function') {
            showNotification(`ERREUR ${context} : ${message || 'Une erreur est survenue.'}`, 'error');
        }
    }

    showSuccess(message) {
        console.log('SUCCES:', message);
        // Afficher un toast de succès avec style vert
        if (typeof showNotification === 'function') {
            showNotification(message || 'Opération réussie.', 'success');
        }
    }

    showGamingFeedback(message) {
        // Utiliser le système de notifications existant
        if (typeof showNotification === 'function') {
            showNotification(message, 'info');
        } else {
            console.log('📢 FEEDBACK GAMING:', message);
        }
    }

    getGamingErrorMessage(error) {
        if (!error) return 'ERREUR INCONNUE';
        
        const message = error.message || error.toString();
        
        if (message.includes('User rejected')) {
            return 'MISSION ANNULÉE PAR COMMANDANT';
        } else if (message.includes('Already processing')) {
            return 'AUTRE CONNEXION EN COURS';
        } else if (message.includes('MetaMask')) {
            return 'SYSTÈME BASE INDISPONIBLE';
        } else {
            return 'ERREUR CONNEXION BASE';
        }
    }

    /**
     * Nettoyage
     */
    destroy() {
        console.log('🧹 Destruction BoomboxApp...');
        
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
        
        if (bnbEl && balances.bnb) {
            const oldValue = bnbEl.textContent;
            bnbEl.textContent = balances.bnb;
            console.log(`🎯 AUDIT SOLDES [${timestamp}]: Valeurs injectées - BNB: ${oldValue} → ${balances.bnb}`);
        }
        if (usdtEl && balances.usdt) {
            const oldValue = usdtEl.textContent;
            usdtEl.textContent = balances.usdt;
            console.log(`🎯 AUDIT SOLDES [${timestamp}]: Valeurs injectées - USDT: ${oldValue} → ${balances.usdt}`);
        }
        if (cakeEl && balances.cake) {
            const oldValue = cakeEl.textContent;
            cakeEl.textContent = balances.cake;
            console.log(`🎯 AUDIT SOLDES [${timestamp}]: Valeurs injectées - CAKE: ${oldValue} → ${balances.cake}`);
        }
        if (totalEl && balances.totalValue) {
            const oldValue = totalEl.textContent;
            const newValue = '$' + balances.totalValue;
            console.log(`🎯 AUDIT SOLDES [${timestamp}]: Valeurs injectées - Total: ${oldValue} → ${newValue}`);
            console.log('🎯 AUDIT DOLLARS: UPDATEPORTFOLIOCARD - total-value:', newValue);
            console.log('🎯 AUDIT DOLLARS: Source données:', 'API balances');
            totalEl.textContent = newValue;
            console.log('[DEBUG] Valeur totale mise à jour:', balances.totalValue);
        }
        
        // Vérifier l'état final de Card 1
        const finalState = {
            'balance-bnb': document.getElementById('balance-bnb')?.textContent,
            'balance-usdt': document.getElementById('balance-usdt')?.textContent,
            'balance-cake': document.getElementById('balance-cake')?.textContent,
            'total-value': document.getElementById('total-value')?.textContent
        };
        
        console.log(`🎯 AUDIT SOLDES [${timestamp}]: Card 1 état final:`, finalState);
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
        // SUPPRIMÉ : setAllCardsToZero() appelé ici (déjà fait dans l'init)
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
            .wallet-logo {
                width: 48px !important;
                height: 48px !important;
                display: block !important;
                margin: 0 auto 12px auto !important;
                opacity: 1 !important;
                visibility: visible !important;
            }
            
            /* Décalage spécifique pour MetaMask */
            #connect-metamask .wallet-logo {
                margin-top: 10px !important;
                width: 64px !important;
                height: 64px !important;
            }
            
            /* Décalage spécifique pour WalletConnect */
            #connect-walletconnect .wallet-logo {
                margin-top: 20px !important;
                width: 88px !important;
                height: 88px !important;
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

// === INTEGRATION EVENEMENTS WALLET ===
// SUPPRIMÉ : Event listener MetaMask automatique qui causait des conflits
// Les events MetaMask sont maintenant gérés uniquement après connexion manuelle
// pour éviter l'erreur "Already processing eth_requestAccounts"
// WalletConnect (événement custom à adapter selon intégration)
window.addEventListener('walletconnect-connected', async (e) => {
    const address = e.detail && e.detail.address;
    if (address) {
        try {
            const balancesResp = await fetch(`/api/v1/data/balances/${address}`);
            let balances = {};
            if (balancesResp.ok) {
                balances = await balancesResp.json();
            }
            let positions = [];
            try {
                const positionsResp = await fetch(`/api/v1/data/positions/${address}`);
                if (positionsResp.ok) {
                    positions = await positionsResp.json();
                }
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
    
    // Initialiser les cards à zéro (UNE SEULE FOIS)
    console.log('📋 Initialisation cards à zéro...');
    setAllCardsToZero();
    
    // Test immédiat pour vérifier que la Card 3 est vide
    setTimeout(() => {
        console.log('🎯 TEST IMMÉDIAT: Vérification Card 3 vide...');
        if (window.testCard3Vide) {
            window.testCard3Vide();
        }
    }, 100);
    
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
