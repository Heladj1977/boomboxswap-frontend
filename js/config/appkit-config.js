/**
 * BOOMBOXSWAP V1 - Configuration WalletConnect v2
 * Gestionnaire dédié pour WalletConnect uniquement
 */

const projectId = '89d6c3d008f82be3012788ab766f8c12';

console.log('[WALLETCONNECT] Initialisation WalletConnect v2');
console.log('[WALLETCONNECT] Project ID:', projectId);

// Variables globales WalletConnect
window.BOOMSWAP_PROJECT_ID = projectId;
window.BOOMSWAP_CHAINS = [56, 42161];
window.BOOMSWAP_RPC_MAP = {
    56: "https://bsc-dataseed1.binance.org/",
    42161: "https://arb1.arbitrum.io/rpc", 
    
};
window.BOOMSWAP_WALLETCONNECT_READY = false;
// Si le provider est déjà présent (script ESM chargé avant), marquer ready
if (window.WalletConnectEthereumProvider) {
    window.BOOMSWAP_WALLETCONNECT_READY = true;
}

// Écouter l'event de chargement WalletConnect
window.addEventListener('walletconnect-loaded', () => {
    console.log('[WALLETCONNECT] Chargé via event');
    window.BOOMSWAP_WALLETCONNECT_READY = true;
});

// Poll de sécurité au cas où l'événement a été manqué
(function ensureWcReady() {
    if (!window.BOOMSWAP_WALLETCONNECT_READY && window.WalletConnectEthereumProvider) {
        window.BOOMSWAP_WALLETCONNECT_READY = true;
        console.log('[WALLETCONNECT] Ready par détection provider');
    }
    setTimeout(ensureWcReady, 1000);
})();

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
        console.log('[WALLETCONNECT] Connexion v2...');
        // Attendre que WalletConnect soit ready
        if (!window.BOOMSWAP_WALLETCONNECT_READY || !window.WalletConnectEthereumProvider) {
            console.log('[WALLETCONNECT] Attente chargement...');
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
        console.log('[WALLETCONNECT] Provider prêt, initialisation...');
        // Créer provider v2
        const provider = await window.WalletConnectEthereumProvider.init({
            projectId: projectId,
            chains: window.BOOMSWAP_CHAINS,
            rpcMap: window.BOOMSWAP_RPC_MAP,
            // QR modal désactivé pour utiliser notre modal personnalisé
            showQrModal: false,
            metadata: {
                name: 'BOOMBOXSWAP V1',
                description: 'Interface gaming PancakeSwap V3',
                url: 'http://127.0.0.1:8000/interface',
                icons: ['https://raw.githubusercontent.com/favicon.ico']
            },
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
                chains: [56, 42161]
            }
        });
        console.log('[WALLETCONNECT] Provider créé, préparation QR personnalisé');
        // Affichage QR personnalisé dans notre modal
        try {
            if (provider && provider.on) {
                provider.on('display_uri', (uri) => {
                    try {
                        const container = document.getElementById('walletqr-qrcode');
                        if (container) {
                            container.innerHTML = '';
                            if (window.BoomboxWalletQRModal) {
                                window.BoomboxWalletQRModal.show();
                            }
                            // Normaliser URI (wc:...)
                            let text = null;
                            if (typeof uri === 'string') {
                                text = uri;
                            } else if (uri) {
                                if (uri.uri) text = uri.uri;
                                else if (uri.data) text = uri.data;
                                else if (uri.params && uri.params[0]) text = uri.params[0];
                            }
                            if (!text) {
                                console.warn('[WALLETCONNECT] URI QR invalide');
                                return;
                            }
                            // Générer QR avec librairie qrcodejs
                            new QRCode(container, {
                                text: text,
                                width: 220,
                                height: 220,
                                colorDark: '#000000',
                                colorLight: '#ffffff',
                                correctLevel: QRCode.CorrectLevel.M
                            });
                        } else {
                            console.warn('[WALLETCONNECT] Container QR introuvable (#wallet-qrcode)');
                        }
                    } catch (e) {
                        console.error('[WALLETCONNECT] Erreur génération QR:', e);
                    }
                });
            }
        } catch (e) {
            console.warn('[WALLETCONNECT] Installation écouteur display_uri échouée', e);
        }

        console.log('[WALLETCONNECT] Provider prêt, connexion...');

        // Attacher événements EIP-1193 (alignement MetaMask)
        try {
            if (provider && provider.on) {
                provider.removeAllListeners && provider.removeAllListeners();
                provider.on('accountsChanged', async (accounts) => {
                    try { (window.WALLET_TIMELINE ||= []).push({ t: Date.now(), e: 'wc_accountsChanged', accounts }); } catch (_) {}
                    if (accounts && accounts[0]) {
                        const addr = accounts[0];
                        try {
                            const web3tmp = new Web3(provider);
                            const chId = parseInt(await web3tmp.eth.getChainId());
                            window.BOOMSWAP_CURRENT_PROVIDER = provider;
                            window.BOOMSWAP_CURRENT_WEB3 = web3tmp;
                            window.BOOMSWAP_CURRENT_ADDRESS = addr;
                            window.BOOMSWAP_CURRENT_CHAIN_ID = chId;
                            if (window.BoomboxWalletQRModal) window.BoomboxWalletQRModal.hide();
                            if (window.BoomboxWalletModal) window.BoomboxWalletModal.hide();
                            if (window.BoomboxApp && typeof window.BoomboxApp.handleWalletConnected === 'function') {
                                // Compat: main.js expose handleWalletConnected sur l'instance
                                window.BoomboxApp.handleWalletConnected(addr, chId);
                            } else if (window.BoomboxApp && typeof window.BoomboxApp.onWalletConnected === 'function') {
                                // Fallback: certaines branches utilisent onWalletConnected({ balances, positions })
                                try {
                                    const balances = await window.BoomboxAPI.getBalances(addr, chId);
                                    const pos = await window.BoomboxAPI.getPositions(addr, chId);
                                    window.BoomboxApp.onWalletConnected({ balances, positions: pos });
                                } catch (e) { console.warn('WC onWalletConnected fallback échoué', e); }
                            }
                        } catch (e) { console.warn('WC accountsChanged handler error', e); }
                    }
                });

                provider.on('chainChanged', (chainId) => {
                    try { (window.WALLET_TIMELINE ||= []).push({ t: Date.now(), e: 'wc_chainChanged', chainId }); } catch (_) {}
                    try { window.BOOMSWAP_CURRENT_CHAIN_ID = parseInt(chainId); } catch (_) {}
                    try {
                        if (window.BoomboxChainManager && typeof window.BoomboxChainManager.syncFromWallet === 'function') {
                            window.BoomboxChainManager.syncFromWallet(parseInt(chainId));
                        }
                    } catch (_) {}
                });

                provider.on('disconnect', (e) => {
                    try { (window.WALLET_TIMELINE ||= []).push({ t: Date.now(), e: 'wc_disconnect', data: e }); } catch (_) {}
                    if (window.BoomboxApp && window.BoomboxApp.onWalletDisconnected) {
                        window.BoomboxApp.onWalletDisconnected();
                    }
                });
            }
        } catch (e) {
            console.warn('[WALLETCONNECT] Installation listeners EIP-1193 échouée', e);
        }
        // Gestion d'annulation utilisateur (fermeture modal QR personnalisé)
        let abortConnexion = false;
        const closeBtn = document.getElementById('close-walletqr-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => { abortConnexion = true; }, { once: true });
        }

        // Tracer événements WalletConnect (forensique)
        try {
            provider.on && provider.on('session_event', (e) => {
                try { (window.WALLET_TIMELINE ||= []).push({ t: Date.now(), e: 'wc_session_event', data: e }); } catch (_) {}
            });
            provider.on && provider.on('disconnect', (e) => {
                try { (window.WALLET_TIMELINE ||= []).push({ t: Date.now(), e: 'wc_disconnect', data: e }); } catch (_) {}
            });
            provider.on && provider.on('accountsChanged', (accs) => {
                try { (window.WALLET_TIMELINE ||= []).push({ t: Date.now(), e: 'wc_accountsChanged', accounts: accs }); } catch (_) {}
            });
        } catch (_) {}
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
                console.log('[WALLETCONNECT] Connexion annulée par utilisateur (fermeture QR)');
                    return; // Sortie silencieuse
                }
            console.warn(`[WALLETCONNECT] Tentative ${attempts} échouée:`, error.message);
                if (attempts >= maxAttempts) {
                    throw error;
                }
                // Attendre 1 seconde avant retry
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        if (abortConnexion) {
            console.log('[WALLETCONNECT] Connexion annulée par utilisateur (fermeture QR)');
            return;
        }
        const web3 = new Web3(provider);
        let accounts = [];
        try {
            accounts = await web3.eth.getAccounts();
        } catch (_) { accounts = []; }
        // Certains wallets v2 nécessitent eth_requestAccounts après enable()
        if (!accounts || accounts.length === 0) {
            try {
                const req = await provider.request({ method: 'eth_requestAccounts' });
                accounts = req || [];
            } catch (e) {
                console.warn('[WALLETCONNECT] eth_requestAccounts a échoué', e);
            }
        }
        const address = accounts && accounts[0] ? accounts[0] : null;
        const chainId = parseInt(await web3.eth.getChainId());
        // Sauvegarder état
        window.BOOMSWAP_CURRENT_PROVIDER = provider;
        window.BOOMSWAP_CURRENT_WEB3 = web3;
        window.BOOMSWAP_CURRENT_ADDRESS = address;
        window.BOOMSWAP_CURRENT_CHAIN_ID = chainId;
        console.log('[WALLETCONNECT] Connecté:', address);
        console.log('[WALLETCONNECT] Chain ID:', chainId);
        // Nettoyage QR de notre modal après connexion
        try {
            const container = document.getElementById('walletqr-qrcode');
            if (container) { container.innerHTML = ''; }
            if (window.BoomboxWalletQRModal) window.BoomboxWalletQRModal.hide();
        } catch (_) {}
        // Notifier UI (sécurité) et fermer les modals si exposés globalement
        try {
            if (window.BoomboxWalletQRModal) window.BoomboxWalletQRModal.hide();
            if (window.BoomboxWalletModal) window.BoomboxWalletModal.hide();
        } catch (_) {}
        return { address, chainId, type: 'walletconnect' };
    } catch (error) {
        console.error('[WALLETCONNECT] Erreur:', error);
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

console.log('[WALLETCONNECT] Système prêt');