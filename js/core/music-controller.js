/**
 * BOOMBOXSWAP V1 - Music Controller
 * Gère les contrôles musicaux et les sons de l'interface gaming.
 */

class BoomboxMusicController {
    constructor() {
        this.soundEnabled = true;
        this.audioContext = null;
        this.init();
    }

    init() {
        this.setupMusicControls();
        this.setupAudioContext();
    }

    setupAudioContext() {
        try {
            // Créer un contexte audio pour une meilleure gestion des sons
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('AudioContext non supporté, utilisation Audio standard');
        }
    }

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

    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
    }

    destroy() {
        // Cleanup si nécessaire
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

// Export global
window.BoomboxMusicController = BoomboxMusicController;
