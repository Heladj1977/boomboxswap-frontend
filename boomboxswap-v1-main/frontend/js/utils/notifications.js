/**
 * BOOMBOXSWAP V1 - Module Notifications Centralisé
 * Gestion unifiée des notifications avec style gaming
 */

class NotificationManager {
    constructor() {
        this.notifications = [];
        this.container = null;
        this.init();
    }

    /**
     * Initialiser le conteneur de notifications
     */
    init() {
        // Créer le conteneur s'il n'existe pas
        if (!document.getElementById('notifications-container')) {
            this.container = document.createElement('div');
            this.container.id = 'notifications-container';
            this.container.className = 'notifications-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('notifications-container');
        }
    }

    /**
     * Afficher une notification
     * @param {string} message - Message à afficher
     * @param {string} type - Type de notification (success, error, warning, info)
     * @param {number} duration - Durée d'affichage en ms (défaut: 3000)
     */
    show(message, type = 'info', duration = 3000) {
        // Supprimer tout emoji du message
        message = message.replace(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu, '');
        
        const notification = document.createElement('div');
        notification.className = 'notification-arcade';
        notification.textContent = message;

        // Style BOOMBOXSWAP gaming UX (dark blue, glassmorphism, sobre)
        notification.style.cssText = `
            background: rgba(26,35,50,0.92);
            backdrop-filter: blur(8px);
            font-family: Inter, Arial, sans-serif;
            font-weight: 600;
            font-size: 1rem;
            letter-spacing: 0.01em;
            color: #fff;
            border-radius: 14px;
            padding: 1.1rem 2.2rem;
            z-index: 10000;
            max-width: 350px;
            text-align: center;
            position: fixed;
            top: 28px;
            right: 32px;
            opacity: 0;
            transform: translateY(-20px);
            transition: opacity 0.35s cubic-bezier(.4,1.3,.6,1), transform 0.35s cubic-bezier(.4,1.3,.6,1);
        `;

        // Couleur de bordure et ombre selon le type
        switch (type) {
            case 'error':
                notification.style.border = '2px solid #ff4757';
                notification.style.boxShadow = '0 6px 32px rgba(255,71,87,0.12), 0 1.5px 8px rgba(255,71,87,0.18)';
                break;
            case 'success':
                notification.style.border = '2px solid #00ff88';
                notification.style.boxShadow = '0 6px 32px rgba(0,255,136,0.12), 0 1.5px 8px rgba(0,255,136,0.18)';
                break;
            case 'warning':
                notification.style.border = '2px solid #ffa502';
                notification.style.boxShadow = '0 6px 32px rgba(255,165,2,0.12), 0 1.5px 8px rgba(255,165,2,0.18)';
                break;
            default: // info
                notification.style.border = '2px solid #4a90e2';
                notification.style.boxShadow = '0 6px 32px rgba(74,144,226,0.10), 0 1.5px 8px rgba(74,144,226,0.18)';
        }

        document.body.appendChild(notification);

        // Animation d'entrée
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 50);

        // Suppression automatique
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 350);
        }, duration);

        // Ajouter à la liste pour gestion
        this.notifications.push(notification);
        
        // Log en mode debug
        if (window.BOOMBOX_DEBUG_MODE) {
            console.log(`[NOTIFICATION] ${type.toUpperCase()}: ${message}`);
        }
    }

    /**
     * Méthodes raccourcis pour les types courants
     */
    success(message, duration = 3000) {
        this.show(message, 'success', duration);
    }

    error(message, duration = 5000) {
        this.show(message, 'error', duration);
    }

    warning(message, duration = 4000) {
        this.show(message, 'warning', duration);
    }

    info(message, duration = 3000) {
        this.show(message, 'info', duration);
    }

    /**
     * Supprimer toutes les notifications
     */
    clearAll() {
        this.notifications.forEach(notification => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        });
        this.notifications = [];
    }

    /**
     * Supprimer une notification spécifique
     */
    remove(notification) {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
        const index = this.notifications.indexOf(notification);
        if (index > -1) {
            this.notifications.splice(index, 1);
        }
    }
}

// Instance globale
window.NotificationManager = new NotificationManager();

// Fonction globale pour compatibilité
window.showNotification = function(message, type = 'info', duration = 3000) {
    window.NotificationManager.show(message, type, duration);
};

// Méthodes raccourcis globales
window.showSuccess = function(message, duration = 3000) {
    window.NotificationManager.success(message, duration);
};

window.showError = function(message, duration = 5000) {
    window.NotificationManager.error(message, duration);
};

window.showWarning = function(message, duration = 4000) {
    window.NotificationManager.warning(message, duration);
};

window.showInfo = function(message, duration = 3000) {
    window.NotificationManager.info(message, duration);
};

console.log('✅ Module notifications centralisé chargé'); 