/**
 * BOOMBOXSWAP V1 - Notification Manager
 * Gère les notifications et messages de feedback gaming.
 */

class BoomboxNotificationManager {
    constructor() {
        this.notifications = [];
        this.maxNotifications = 5;
        this.init();
    }

    init() {
        this.createNotificationsContainer();
    }

    createNotificationsContainer() {
        if (!document.getElementById('notifications-container')) {
            const container = document.createElement('div');
            container.id = 'notifications-container';
            container.className = 'notifications-container';
            document.body.appendChild(container);
        }
    }

    showError(context, message) {
        console.error(`ERREUR ${context}:`, message);
        this.showNotification(`ERREUR ${context} : ${message || 'Une erreur est survenue.'}`, 'error');
    }

    showSuccess(message) {
        console.log('SUCCES:', message);
        this.showNotification(message || 'Opération réussie.', 'success');
    }

    showGamingFeedback(message) {
        console.log('GAMING FEEDBACK:', message);
        this.showNotification(message, 'gaming');
    }

    showNotification(message, type = 'info', duration = 5000) {
        const container = document.getElementById('notifications-container');
        if (!container) return;

        // Limiter le nombre de notifications
        if (this.notifications.length >= this.maxNotifications) {
            const oldestNotification = this.notifications.shift();
            if (oldestNotification && oldestNotification.element) {
                oldestNotification.element.remove();
            }
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        const messageSpan = document.createElement('span');
        messageSpan.className = 'notification-message';
        messageSpan.innerHTML = this.escapeHtml(message);
        const closeBtn = document.createElement('button');
        closeBtn.className = 'notification-close';
        closeBtn.textContent = '×';
        closeBtn.addEventListener('click', () => this.removeNotification(notification));
        notification.appendChild(messageSpan);
        notification.appendChild(closeBtn);

        container.appendChild(notification);
        this.notifications.push({ element: notification, timestamp: Date.now() });

        // Animation d'entrée
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 10);

        // Auto-remove après durée
        if (duration > 0) {
            setTimeout(() => {
                this.removeNotification(notification);
            }, duration);
        }

        return notification;
    }

    removeNotification(notificationElement) {
        if (notificationElement && notificationElement.parentElement) {
            notificationElement.style.transform = 'translateX(100%)';
            notificationElement.style.opacity = '0';
            
            setTimeout(() => {
                if (notificationElement.parentElement) {
                    notificationElement.remove();
                }
                // Retirer de la liste
                this.notifications = this.notifications.filter(n => n.element !== notificationElement);
            }, 300);
        }
    }

    clearAllNotifications() {
        const container = document.getElementById('notifications-container');
        if (container) {
            container.innerHTML = '';
        }
        this.notifications = [];
    }

    getGamingErrorMessage(error) {
        if (!error) return 'MISSION ECHOUEE - Erreur inconnue';

        const errorMessage = error.message || error.toString();
        
        // Mapping des erreurs courantes vers des messages gaming
        const gamingErrors = {
            'user rejected': 'MISSION ANNULEE - Utilisateur a annulé',
            'insufficient funds': 'MISSION ECHOUEE - Fonds insuffisants',
            'network error': 'MISSION ECHOUEE - Erreur réseau',
            'timeout': 'MISSION ECHOUEE - Délai dépassé',
            'already processing': 'MISSION ECHOUEE - Transaction en cours',
            'nonce too low': 'MISSION ECHOUEE - Nonce invalide',
            'gas required exceeds allowance': 'MISSION ECHOUEE - Gas insuffisant',
            'execution reverted': 'MISSION ECHOUEE - Transaction rejetée',
            'invalid signature': 'MISSION ECHOUEE - Signature invalide'
        };

        for (const [key, gamingMessage] of Object.entries(gamingErrors)) {
            if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
                return gamingMessage;
            }
        }

        return `MISSION ECHOUEE - ${errorMessage}`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Méthodes utilitaires pour différents types de notifications
    showWalletConnected(address) {
        const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
        this.showSuccess(`WALLET CONNECTE - ${shortAddress}`);
    }

    showWalletDisconnected() {
        this.showGamingFeedback('WALLET DECONNECTE');
    }

    showTransactionPending() {
        this.showGamingFeedback('MISSION LANCEE - Transaction en cours...');
    }

    showTransactionSuccess(txHash) {
        const shortHash = `${txHash.slice(0, 6)}...${txHash.slice(-4)}`;
        this.showSuccess(`MISSION ACCOMPLIE - ${shortHash}`);
    }

    showTransactionError(error) {
        const gamingMessage = this.getGamingErrorMessage(error);
        this.showError('TRANSACTION', gamingMessage);
    }

    showPriceUpdate(price) {
        this.showGamingFeedback(`PRIX MISE A JOUR - $${price}`);
    }

    destroy() {
        this.clearAllNotifications();
    }
}

// Export global
window.BoomboxNotificationManager = BoomboxNotificationManager;

// Fonction globale pour compatibilité
window.showNotification = function(message, type, duration) {
    if (window.boomboxNotificationManager) {
        return window.boomboxNotificationManager.showNotification(message, type, duration);
    }
};
