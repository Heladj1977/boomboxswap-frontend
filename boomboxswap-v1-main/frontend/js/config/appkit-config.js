/**
 * BOOMBOXSWAP V1 - Configuration WalletConnect v2
 * Gestionnaire dédié pour WalletConnect uniquement
 */

const projectId = '89d6c3d008f82be3012788ab766f8c12';

console.log('📱 Initialisation WalletConnect v2 BOOMBOXSWAP...');
console.log('📋 Project ID:', projectId);

// Variables globales WalletConnect
window.BOOMSWAP_PROJECT_ID = projectId;
window.BOOMSWAP_CHAINS = [56, 42161, 8453];
window.BOOMSWAP_RPC_MAP = {
    56: "https://bsc-dataseed1.binance.org/",
    42161: "https://arb1.arbitrum.io/rpc", 
    8453: "https://mainnet.base.org"
};
window.BOOMSWAP_WALLETCONNECT_READY = false;

// Écouter l'event de chargement WalletConnect
window.addEventListener('walletconnect-loaded', () => {
    console.log('🎉 WalletConnect chargé via event!');
    window.BOOMSWAP_WALLETCONNECT_READY = true;
});

// Gestionnaire de connexions WalletConnect
class WalletConnectConnectionManager {
    constructor() {
        this.connecting = false;
        this.timeoutId = null;
        this.timeoutMs = 30000; // 30 secondes
    }

    /**
     * Vérifier si une connexion est en cours
     */
    isConnecting() {
        return this.connecting;
    }

    /**
     * Marquer une connexion comme en cours
     */
    startConnecting() {
        this.connecting = true;
        
        // Nettoyer le timeout précédent
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        
        // Timeout automatique pour éviter les blocages
        this.timeoutId = setTimeout(() => {
            this.connecting = false;
            this.timeoutId = null;
            console.warn('⚠️ Timeout connexion WalletConnect - déblocage automatique');
        }, this.timeoutMs);
    }

    /**
     * Marquer une connexion comme terminée
     */
    stopConnecting() {
        this.connecting = false;
        
        // Nettoyer le timeout
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }

    /**
     * Nettoyer toutes les connexions
     */
    cleanup() {
        this.connecting = false;
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }
}

// Instance globale du gestionnaire WalletConnect
window.WalletConnectConnectionManager = new WalletConnectConnectionManager();

let walletConnectInProgress = false;

// Fonction de connexion WalletConnect v2 avec vérification ready
window.BOOMSWAP_CONNECT_WALLETCONNECT = async function() {
    if (walletConnectInProgress) return;
    walletConnectInProgress = true;
    try {
        console.log('📱 Connexion WalletConnect v2...');
        // Attendre que WalletConnect soit ready
        if (!window.BOOMSWAP_WALLETCONNECT_READY || !window.WalletConnectEthereumProvider) {
            console.log('⏳ Attente chargement WalletConnect...');
            await new Promise((resolve, reject) => {
                let attempts = 0;
                const interval = setInterval(() => {
                    attempts++;
                    if (window.BOOMSWAP_WALLETCONNECT_READY && window.WalletConnectEthereumProvider) {
                        clearInterval(interval);
                        resolve();
                    } else if (attempts > 50) {
                        clearInterval(interval);
                        reject(new Error('Timeout WalletConnect loading'));
                    }
                }, 200);
            });
        }
        console.log('🔗 WalletConnect prêt, initialisation...');
        // Créer provider v2
        const provider = await window.WalletConnectEthereumProvider.init({
            projectId: projectId,
            chains: window.BOOMSWAP_CHAINS,
            rpcMap: window.BOOMSWAP_RPC_MAP,
            showQrModal: true,
            qrModalOptions: {
                themeMode: "dark",
                themeVariables: {
                    // Couleurs et styles BOOMSWAP
                    "--wcm-accent-color": "#3B82F6",
                    "--wcm-background-color": "#1a2332",
                    "--wcm-color-bg-1": "#1a2332",
                    "--wcm-color-bg-2": "#1a2332",
                    "--wcm-color-bg-3": "#1a2332",
                    "--wcm-color-overlay": "rgba(0,0,0,0.85)",
                    "--wcm-color-fg-1": "#ffffff",
                    "--wcm-color-fg-2": "#e5e7eb",
                    "--wcm-color-fg-3": "#9ca3af",
                    "--wcm-border-radius-master": "16px",
                    "--wcm-border-radius-xs": "8px",
                    "--wcm-border-radius-s": "12px",
                    "--wcm-border-radius-m": "16px",
                    "--wcm-font-family": "Inter, system-ui, sans-serif",
                    "--wcm-font-size-large": "15px",
                    "--wcm-font-size-medium": "13px",
                    "--wcm-font-size-small": "11px",
                    "--wcm-z-index": "10002",
                    // Optimisation responsive et anti-scroll
                    "--wcm-modal-width": "95vw",
                    "--wcm-modal-max-width": "380px",
                    "--wcm-modal-height": "auto",
                    "--wcm-modal-max-height": "90vh",
                    "--wcm-qr-size": "min(200px, 45vw)",
                    "--wcm-spacing": "10px"
                },
                enableExplorer: true,
                enableAccountView: false,
                enableNetworkView: false,
                explorerRecommendedWalletIds: [
                    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
                    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
                    '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
                    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa'  // Coinbase
                ],
                chains: [56, 42161, 8453]
            }
        });
        console.log('🚀 Provider créé, connexion...');
        // Gestion d'annulation utilisateur (fermeture modal QR)
        let abortConnexion = false;
        if (provider && provider.on) {
            provider.on('display_uri', () => {
                // Écoute la fermeture du modal WalletConnect
                const checkModalClosed = setInterval(() => {
                    const modal = document.querySelector('wcm-modal, wc-modal');
                    if (!modal) {
                        abortConnexion = true;
                        clearInterval(checkModalClosed);
                    }
                }, 300);
            });
        }
        // Connecter avec timeout et retry
        let connected = false;
        let attempts = 0;
        const maxAttempts = 3;
        while (!connected && attempts < maxAttempts && !abortConnexion) {
            try {
                attempts++;
                console.log(`🔄 Tentative connexion ${attempts}/${maxAttempts}...`);
                await provider.enable();
                connected = true;
                console.log('✅ Connexion WalletConnect réussie!');
            } catch (error) {
                if (abortConnexion || error.message.includes('reset') || error.message.includes('cancel')) {
                    console.log('🚫 Connexion annulée par l’utilisateur (fermeture modal QR)');
                    return; // Sortie silencieuse
                }
                console.warn(`⚠️ Tentative ${attempts} échouée:`, error.message);
                if (attempts >= maxAttempts) {
                    throw error;
                }
                // Attendre 1 seconde avant retry
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        if (abortConnexion) {
            console.log('🚫 Connexion annulée par l’utilisateur (fermeture modal QR)');
            return;
        }
        const web3 = new Web3(provider);
        const accounts = await web3.eth.getAccounts();
        const address = accounts[0];
        const chainId = parseInt(await web3.eth.getChainId());
        // Sauvegarder état
        window.BOOMSWAP_CURRENT_PROVIDER = provider;
        window.BOOMSWAP_CURRENT_WEB3 = web3;
        window.BOOMSWAP_CURRENT_ADDRESS = address;
        window.BOOMSWAP_CURRENT_CHAIN_ID = chainId;
        console.log('✅ WalletConnect v2 connecté:', address);
        console.log('⛓️ Chain ID:', chainId);
        // Nettoyage forcé du modal WalletConnect après connexion
        setTimeout(() => {
            const ghostModal = document.querySelector('wcm-modal, wc-modal');
            if (ghostModal && ghostModal.parentNode) {
                ghostModal.parentNode.removeChild(ghostModal);
            }
        }, 500);
        return { address, chainId, type: 'walletconnect' };
    } catch (error) {
        console.error('❌ Erreur WalletConnect v2:', error);
        let userMessage = 'Erreur de connexion WalletConnect';
        if (error.message.includes('Connection request reset')) {
            userMessage = 'Connexion interrompue. Veuillez réessayer.';
        } else if (error.message.includes('User rejected')) {
            userMessage = 'Connexion annulée par l\'utilisateur.';
        } else if (error.message.includes('Timeout')) {
            userMessage = 'Timeout de connexion. Vérifiez votre réseau.';
        }
        throw new Error(userMessage);
    } finally {
        walletConnectInProgress = false;
    }
};

// Fonction de déconnexion
window.BOOMSWAP_DISCONNECT = async function() {
    try {
        console.log('🔌 Déconnexion...');
        if (window.BOOMSWAP_CURRENT_PROVIDER && window.BOOMSWAP_CURRENT_PROVIDER.disconnect) {
            await window.BOOMSWAP_CURRENT_PROVIDER.disconnect();
        }
        // Reset états
        window.BOOMSWAP_CURRENT_PROVIDER = null;
        window.BOOMSWAP_CURRENT_WEB3 = null;
        window.BOOMSWAP_CURRENT_ADDRESS = null;
        window.BOOMSWAP_CURRENT_CHAIN_ID = null;
        console.log('✅ Déconnecté');
    } catch (error) {
        console.error('❌ Erreur déconnexion:', error);
    }
};

console.log('✅ BOOMSWAP WalletConnect v2 avec event system prêt'); 