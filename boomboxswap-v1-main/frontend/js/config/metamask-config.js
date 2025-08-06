/**
 * BOOMBOXSWAP V1 - Configuration MetaMask
 * Gestionnaire dédié pour MetaMask uniquement avec protection robuste
 */

console.log('🦊 Initialisation système MetaMask BOOMBOXSWAP...');

// ===== ÉTAT GLOBAL ROBUSTE =====
let isConnecting = false;
let connectionTimeout = null;
const DEBOUNCE_DELAY = 2000;
const CONNECTION_TIMEOUT = 30000; // 30 secondes

const CONNECTION_STATES = {
    DISCONNECTED: 'disconnected',
    CONNECTING: 'connecting', 
    CONNECTED: 'connected',
    ERROR: 'error'
};

let currentConnectionState = CONNECTION_STATES.DISCONNECTED;

// ===== EXPOSITION CONTRÔLÉE DE L'ÉTAT =====
// Exposer l'état de connexion pour main.js
window.BOOMSWAP_IS_CONNECTING = () => isConnecting;
window.BOOMSWAP_GET_CONNECTION_STATE = () => currentConnectionState;

// ===== FONCTION CONNEXION ROBUSTE =====
async function connectMetaMaskRobust() {
    const timestamp = Date.now();
    console.log(`🎯 AUDIT [${timestamp}]: connectMetaMaskRobust() démarré`);
    
    // PROTECTION DOUBLE APPEL
    if (isConnecting) {
        console.log(`🎯 AUDIT [${timestamp}]: METAMASK DÉJÀ EN CONNEXION - MISSION EN COURS`);
        console.log(`🎯 AUDIT [${timestamp}]:   - isConnecting:`, isConnecting);
        console.log(`🎯 AUDIT [${timestamp}]:   - currentConnectionState:`, currentConnectionState);
        return null;
    }
    
    // VÉRIFIER CONNEXION EXISTANTE D'ABORD
    console.log(`🎯 AUDIT [${timestamp}]: Vérification connexion existante...`);
    const existingConnection = await checkExistingConnection();
    if (existingConnection) {
        console.log(`🎯 AUDIT [${timestamp}]: Connexion existante trouvée:`, existingConnection.address);
        return existingConnection;
    }
    
    // MARQUER COMME EN COURS + TIMEOUT SÉCURITÉ
    console.log(`🎯 AUDIT [${timestamp}]: Marquage comme en cours...`);
    isConnecting = true;
    currentConnectionState = CONNECTION_STATES.CONNECTING;
    updateWalletUI('connecting');
    
    connectionTimeout = setTimeout(() => {
        const timeoutTimestamp = Date.now();
        console.warn(`🎯 AUDIT [${timeoutTimestamp}]: TIMEOUT CONNEXION METAMASK - DÉBLOQUAGE AUTOMATIQUE`);
        resetMetaMaskState();
    }, CONNECTION_TIMEOUT);
    
    try {
        // VÉRIFIER METAMASK DISPONIBLE
        console.log(`🎯 AUDIT [${timestamp}]: Vérification MetaMask disponible...`);
        if (!window.ethereum) {
            throw new Error('METAMASK_NOT_FOUND');
        }
        
        // DEMANDE CONNEXION (UN SEUL APPEL)
        console.log(`🎯 AUDIT [${timestamp}]: Appel eth_requestAccounts...`);
        
        // ===== INVESTIGATION DÉTAILLÉE =====
        console.log(`🎯 INVESTIGATION: AVANT eth_requestAccounts`);
        console.log(`🎯 INVESTIGATION: Timestamp exact:`, performance.now());
        console.log(`🎯 INVESTIGATION: Stack trace:`, new Error().stack);
        console.log(`🎯 INVESTIGATION: Appels précédents:`, window.INVESTIGATION_CALLS?.length || 0);
        
        // ===== CORRECTION CHIRURGICALE : SUPPRESSION DÉLAI FORCED =====
        console.log(`🎯 CORRECTION: Délai 2 secondes supprimé - réactivité immédiate`);
        // SUPPRIMÉ : await new Promise(resolve => setTimeout(resolve, 2000));
        // RÉSULTAT : Appel eth_requestAccounts immédiat
        
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });
        
        console.log(`🎯 INVESTIGATION: APRÈS eth_requestAccounts réussi`);
        console.log(`🎯 INVESTIGATION: Résultat:`, accounts);
        console.log(`🎯 INVESTIGATION: Total appels après:`, window.INVESTIGATION_CALLS?.length || 0);
        
        console.log(`🎯 AUDIT [${timestamp}]: Réponse eth_requestAccounts:`, accounts);
        
        if (accounts && accounts.length > 0) {
            const address = accounts[0];
            console.log(`🎯 AUDIT [${timestamp}]: METAMASK CONNECTÉ:`, address);
            
            // Récupérer le chainId
            const chainId = parseInt(await window.ethereum.request({ method: 'eth_chainId' }));
            console.log(`🎯 AUDIT [${timestamp}]: ChainId récupéré:`, chainId);
            
            // Sauvegarder état global
            window.BOOMSWAP_CURRENT_PROVIDER = window.ethereum;
            window.BOOMSWAP_CURRENT_ADDRESS = address;
            window.BOOMSWAP_CURRENT_CHAIN_ID = chainId;
            
            currentConnectionState = CONNECTION_STATES.CONNECTED;
            updateWalletUI('connected', address);
            
            // Configurer les event listeners APRÈS connexion réussie
            setupMetaMaskEvents(window.ethereum);
            
            // Retourner objet compatible avec le workflow modal
            return { address, chainId, type: 'metamask' };
        } else {
            throw new Error('NO_ACCOUNTS_RETURNED');
        }
        
    } catch (error) {
        const errorTimestamp = Date.now();
        console.error(`🎯 AUDIT [${errorTimestamp}]: MISSION CONNEXION METAMASK ÉCHOUÉE:`, error);
        console.error(`🎯 AUDIT [${errorTimestamp}]:   - Code:`, error.code);
        console.error(`🎯 AUDIT [${errorTimestamp}]:   - Message:`, error.message);
        
        // GESTION SPÉCIFIQUE "Already processing"
        if (error.message && error.message.includes('Already processing')) {
            console.log(`🎯 AUDIT [${errorTimestamp}]: AUTRE CONNEXION EN COURS - ATTENTE...`);
            return null;
        }
        
        // AUTRES ERREURS
        currentConnectionState = CONNECTION_STATES.ERROR;
        updateWalletUI('error');
        throw error;
        
    } finally {
        // CLEANUP OBLIGATOIRE
        const cleanupTimestamp = Date.now();
        clearTimeout(connectionTimeout);
        isConnecting = false;
        
        // SI TOUJOURS EN CONNECTING, PASSER À DISCONNECTED
        if (currentConnectionState === CONNECTION_STATES.CONNECTING) {
            currentConnectionState = CONNECTION_STATES.DISCONNECTED;
            updateWalletUI('disconnected');
        }
        
        console.log(`🎯 AUDIT [${cleanupTimestamp}]: NETTOYAGE CONNEXION METAMASK TERMINÉ`);
        console.log(`🎯 AUDIT [${cleanupTimestamp}]:   - isConnecting:`, isConnecting);
        console.log(`🎯 AUDIT [${cleanupTimestamp}]:   - currentConnectionState:`, currentConnectionState);
    }
}

// ===== VÉRIFICATION CONNEXION EXISTANTE =====
async function checkExistingConnection() {
    const timestamp = Date.now();
    console.log(`🎯 AUDIT AUTO-CONNEXION [${timestamp}]: === CHECK EXISTING CONNECTION DÉMARRÉ ===`);
    console.log(`🎯 AUDIT AUTO-CONNEXION [${timestamp}]: État système au début:`);
    console.log(`🎯 AUDIT AUTO-CONNEXION [${timestamp}]:   - window.ethereum:`, !!window.ethereum);
    console.log(`🎯 AUDIT AUTO-CONNEXION [${timestamp}]:   - isConnecting:`, isConnecting);
    console.log(`🎯 AUDIT AUTO-CONNEXION [${timestamp}]:   - currentConnectionState:`, currentConnectionState);
    console.log(`🎯 AUDIT AUTO-CONNEXION [${timestamp}]:   - BOOMSWAP_CURRENT_ADDRESS:`, window.BOOMSWAP_CURRENT_ADDRESS);
    
    try {
        if (window.ethereum) {
            console.log(`🎯 AUDIT AUTO-CONNEXION [${timestamp}]: window.ethereum disponible, appel eth_accounts...`);
            console.log(`🎯 AUDIT AUTO-CONNEXION [${timestamp}]:   - Méthode: eth_accounts (silencieux, pas de popup)`);
            
            const accounts = await window.ethereum.request({
                method: 'eth_accounts'  // CORRECTION : Utiliser eth_accounts (silencieux)
            });
            
            console.log(`🎯 AUDIT AUTO-CONNEXION [${timestamp}]: Réponse eth_accounts:`, accounts);
            console.log(`🎯 AUDIT AUTO-CONNEXION [${timestamp}]: Comptes trouvés:`, accounts.length);
            
            if (accounts && accounts.length > 0) {
                const address = accounts[0];
                console.log(`🎯 AUDIT AUTO-CONNEXION [${timestamp}]: METAMASK DÉJÀ CONNECTÉ:`, address);
                
                // ===== CORRECTION CHIRURGICALE : SUPPRESSION AUTO-CONNEXION =====
                // ❌ SUPPRIMÉ : Auto-connexion automatique
                // ❌ SUPPRIMÉ : updateWalletUI('connected', address)
                // ❌ SUPPRIMÉ : setupMetaMaskEvents(window.ethereum)
                // ❌ SUPPRIMÉ : Définition variables globales
                
                // ✅ REMPLACÉ PAR : Détection silencieuse seulement
                console.log(`🎯 AUDIT AUTO-CONNEXION [${timestamp}]: DÉTECTION SILENCIEUSE - MetaMask disponible pour connexion manuelle`);
                console.log(`🎯 AUDIT AUTO-CONNEXION [${timestamp}]: ℹ️ Utilisateur doit cliquer pour se connecter (pas d'auto-connexion)`);
                
                // Retourner null pour indiquer qu'aucune connexion automatique n'a été effectuée
                return null;
            } else {
                console.log(`🎯 AUDIT AUTO-CONNEXION [${timestamp}]: Aucun compte connecté`);
            }
        } else {
            console.log(`🎯 AUDIT AUTO-CONNEXION [${timestamp}]: window.ethereum non disponible`);
        }
    } catch (error) {
        console.log(`🎯 AUDIT AUTO-CONNEXION [${timestamp}]: Erreur checkExistingConnection:`, error);
    }
    
    console.log(`🎯 AUDIT AUTO-CONNEXION [${timestamp}]: AUCUNE CONNEXION PRÉCÉDENTE`);
    console.log(`🎯 AUDIT AUTO-CONNEXION [${timestamp}]: === CHECK EXISTING CONNECTION TERMINÉ ===`);
    return null;
}

// ===== RESET ÉTAT APRÈS ERREUR =====
function resetMetaMaskState() {
    isConnecting = false;
    currentConnectionState = CONNECTION_STATES.DISCONNECTED;
    
    if (connectionTimeout) {
        clearTimeout(connectionTimeout);
        connectionTimeout = null;
    }
    
    updateWalletUI('disconnected');
    console.log('🔄 ÉTAT METAMASK RÉINITIALISÉ');
}

// ===== MESSAGES GAMING =====
function getGamingErrorMessage(error) {
    if (!error) return 'ERREUR INCONNUE';
    
    const message = error.message || error.toString();
    
    if (message.includes('User rejected')) {
        return 'Connexion annulée par l\'utilisateur';
    } else if (message.includes('Already processing')) {
        return 'Autre connexion en cours';
    } else if (message.includes('MetaMask')) {
        return 'MetaMask non disponible';
    } else {
        return 'Erreur de connexion MetaMask';
    }
}

// ===== MISE À JOUR UI WALLET =====
function updateWalletUI(state, address = null) {
    const walletBtn = document.getElementById('wallet-btn');
    const walletBtnText = document.getElementById('wallet-btn-text');
    
    if (!walletBtn || !walletBtnText) return;
    
    switch (state) {
        case 'connecting':
            walletBtn.disabled = true;
            walletBtn.className = 'wallet-header-btn wallet-btn connecting';
            walletBtnText.textContent = 'Connexion MetaMask...';
            break;
            
        case 'connected':
            walletBtn.disabled = false;
            walletBtn.className = 'wallet-header-btn wallet-btn connected';
            walletBtnText.textContent = address ? 
                `MetaMask: ${address.substring(0, 6)}...${address.substring(38)}` : 
                'MetaMask Connecté';
            break;
            
        case 'error':
            walletBtn.disabled = false;
            walletBtn.className = 'wallet-header-btn wallet-btn error';
            walletBtnText.textContent = 'Erreur MetaMask';
            // Auto-reset après 3 secondes
            setTimeout(() => updateWalletUI('disconnected'), 3000);
            break;
            
        case 'disconnected':
        default:
            walletBtn.disabled = false;
            walletBtn.className = 'wallet-header-btn wallet-btn disconnected';
            walletBtnText.textContent = 'Connecter Wallet';
            break;
    }
}

// ===== FEEDBACK GAMING =====
function showGamingFeedback(message) {
    // Utiliser le système de notifications existant
    if (window.showNotification) {
        window.showNotification(message, 'info');
    } else {
        console.log('📢 FEEDBACK:', message);
    }
}

// ===== FONCTION POUR CONFIGURER LES EVENT LISTENERS META MASK APRÈS CONNEXION =====
function setupMetaMaskEvents(provider) {
    console.log('🔧 Configuration events MetaMask...');
    
    // CLEANUP : Supprimer tous les event listeners existants pour éviter les doublons
    try {
        provider.removeAllListeners();
        console.log('🧹 Event listeners existants supprimés');
    } catch (error) {
        console.log('ℹ️ Aucun event listener existant à supprimer');
    }
    
    // Écouter changements d'account
    provider.on('accountsChanged', async (accounts) => {
        console.log('🔄 Comptes MetaMask changés:', accounts);
        if (accounts && accounts.length > 0) {
            // Connexion ou changement de compte
            const address = accounts[0];
            try {
                // Appel API balances
                const balancesResp = await fetch(`/api/v1/data/balances/${address}`);
                let balances = {};
                if (balancesResp.ok) {
                    balances = await balancesResp.json();
                }
                // Appel API positions
                let positions = [];
                try {
                    const positionsResp = await fetch(`/api/v1/data/positions/${address}`);
                    if (positionsResp.ok) {
                        positions = await positionsResp.json();
                    }
                } catch (e) { console.error('Erreur récupération positions:', e); }
                
                if (window.BoomboxApp && window.BoomboxApp.onWalletConnected) {
                    window.BoomboxApp.onWalletConnected({ balances, positions });
                }
            } catch (e) {
                console.error('Erreur récupération balances:', e);
            }
        } else {
            // Déconnexion
            if (window.BoomboxApp && window.BoomboxApp.onWalletDisconnected) {
                window.BoomboxApp.onWalletDisconnected();
            }
        }
    });
    
    // Écouter changements de réseau
    provider.on('chainChanged', (chainId) => {
        const newChainId = parseInt(chainId);
        console.log('⛓️ Réseau MetaMask changé:', newChainId);
        window.BOOMSWAP_CURRENT_CHAIN_ID = newChainId;
        if (window.BoomboxApp && window.BoomboxApp.handleNetworkChanged) {
            window.BoomboxApp.handleNetworkChanged(newChainId);
        }
    });
    
    // Écouter déconnexion
    provider.on('disconnect', () => {
        console.log('🔌 Provider MetaMask déconnecté');
        if (window.BoomboxApp && window.BoomboxApp.onWalletDisconnected) {
            window.BoomboxApp.onWalletDisconnected();
        }
    });
    
    console.log('✅ Events MetaMask configurés');
}

// ===== FONCTION DE DÉCONNEXION META MASK =====
window.BOOMSWAP_DISCONNECT_METAMASK = async function() {
    try {
        console.log('🔌 Déconnexion MetaMask...');
        
        // Reset variables globales
        window.BOOMSWAP_CURRENT_PROVIDER = null;
        window.BOOMSWAP_CURRENT_WEB3 = null;
        window.BOOMSWAP_CURRENT_ADDRESS = null;
        window.BOOMSWAP_CURRENT_CHAIN_ID = null;
        
        // Reset état local
        resetMetaMaskState();
        
        console.log('✅ MetaMask déconnecté');
    } catch (error) {
        console.error('❌ Erreur déconnexion MetaMask:', error);
    }
};

// ===== EXPOSITION GLOBALE =====
window.BOOMSWAP_CONNECT_METAMASK = connectMetaMaskRobust;

// ===== INITIALISATION AU DÉMARRAGE =====
// Vérifier connexion existante au démarrage (sans event listeners)
async function checkExistingConnectionOnStartup() {
    const timestamp = Date.now();
    console.log(`🎯 AUDIT AUTO-CONNEXION [${timestamp}]: === VÉRIFICATION CONNEXION EXISTANTE AU DÉMARRAGE ===`);
    console.log(`🎯 AUDIT AUTO-CONNEXION [${timestamp}]: État système au démarrage:`);
    console.log(`🎯 AUDIT AUTO-CONNEXION [${timestamp}]:   - window.ethereum:`, !!window.ethereum);
    console.log(`🎯 AUDIT AUTO-CONNEXION [${timestamp}]:   - isConnecting:`, isConnecting);
    console.log(`🎯 AUDIT AUTO-CONNEXION [${timestamp}]:   - currentConnectionState:`, currentConnectionState);
    console.log(`🎯 AUDIT AUTO-CONNEXION [${timestamp}]:   - BOOMSWAP_CURRENT_ADDRESS:`, window.BOOMSWAP_CURRENT_ADDRESS);
    console.log(`🎯 AUDIT AUTO-CONNEXION [${timestamp}]:   - Stack trace appel:`, new Error().stack);
    
    console.log(`🎯 AUDIT AUTO-CONNEXION [${timestamp}]: Appel checkExistingConnection()...`);
    await checkExistingConnection();
    
    const endTimestamp = Date.now();
    console.log(`🎯 AUDIT AUTO-CONNEXION [${endTimestamp}]: VÉRIFICATION CONNEXION EXISTANTE TERMINÉE`);
    console.log(`🎯 AUDIT AUTO-CONNEXION [${endTimestamp}]: État final:`);
    console.log(`🎯 AUDIT AUTO-CONNEXION [${endTimestamp}]:   - isConnecting:`, isConnecting);
    console.log(`🎯 AUDIT AUTO-CONNEXION [${endTimestamp}]:   - currentConnectionState:`, currentConnectionState);
    console.log(`🎯 AUDIT AUTO-CONNEXION [${endTimestamp}]:   - BOOMSWAP_CURRENT_ADDRESS:`, window.BOOMSWAP_CURRENT_ADDRESS);
    console.log(`🎯 AUDIT AUTO-CONNEXION [${endTimestamp}]: === VÉRIFICATION CONNEXION EXISTANTE AU DÉMARRAGE TERMINÉE ===`);
}

// Initialiser au chargement (sans event listeners)
const initTimestamp = Date.now();
console.log(`🎯 AUDIT AUTO-CONNEXION [${initTimestamp}]: === INITIALISATION METAMASK AU CHARGEMENT ===`);
console.log(`🎯 AUDIT AUTO-CONNEXION [${initTimestamp}]: Appel checkExistingConnectionOnStartup()...`);
checkExistingConnectionOnStartup();

console.log('✅ Configuration MetaMask BOOMBOXSWAP initialisée'); 