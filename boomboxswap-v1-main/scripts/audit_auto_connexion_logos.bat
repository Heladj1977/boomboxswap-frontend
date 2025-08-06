@echo off
echo ========================================
echo AUDIT AUTO-CONNEXION + LOGOS MODAL
echo ========================================
echo.
echo MISSION: Identifier causes exactes des 2 problemes
echo 1. Auto-connexion MetaMask non voulue
echo 2. Logos modal wallet remplaces par du texte
echo.
echo ========================================
echo ETAPE 1: DEMARRAGE BACKEND
echo ========================================
call conda activate boomswap-v1
cd backend
start uvicorn main:app --host 127.0.0.1 --port 8000
timeout /t 3 /nobreak >nul
echo Backend demarre sur http://127.0.0.1:8000
echo.
echo ========================================
echo ETAPE 2: OUVERTURE INTERFACE
echo ========================================
cd ..
start frontend/index.html
echo Interface ouverte dans le navigateur
echo.
echo ========================================
echo ETAPE 3: INSTRUCTIONS AUDIT
echo ========================================
echo.
echo PROBLÈME 1 - AUTO-CONNEXION METAMASK:
echo 1. Ouvrir Console DevTools (F12)
echo 2. Recharger la page (F5)
echo 3. Chercher les logs "AUDIT AUTO-CONNEXION"
echo 4. Identifier la sequence exacte d'auto-connexion
echo.
echo PROBLÈME 2 - LOGOS MODAL WALLET:
echo 1. Cliquer sur le bouton wallet
echo 2. Observer la modal qui s'ouvre
echo 3. Chercher les logs "AUDIT MODAL"
echo 4. Verifier si les logos s'affichent ou du texte
echo.
echo ========================================
echo LOGS À SURVEILLER:
echo ========================================
echo.
echo AUTO-CONNEXION:
echo - "AUDIT AUTO-CONNEXION: === INITIALISATION METAMASK AU CHARGEMENT ==="
echo - "AUDIT AUTO-CONNEXION: === VÉRIFICATION CONNEXION EXISTANTE AU DÉMARRAGE ==="
echo - "AUDIT AUTO-CONNEXION: METAMASK DÉJÀ CONNECTÉ"
echo - "AUDIT AUTO-CONNEXION: Auto-connexion en cours..."
echo.
echo LOGOS MODAL:
echo - "AUDIT MODAL: === INSPECTION STRUCTURE HTML MODAL ==="
echo - "AUDIT MODAL: HTML modal complet:"
echo - "AUDIT MODAL: Image trouvée:"
echo - "AUDIT MODAL: Src image:"
echo.
echo ========================================
echo RAPPORT AUDIT À FOURNIR:
echo ========================================
echo 1. Sequence exacte de l'auto-connexion
echo 2. Structure HTML reelle de la modal
echo 3. Presence/absence des images logos
echo 4. Paths des images (corrects ou incorrects)
echo 5. Modifications JavaScript des boutons
echo.
echo Appuyez sur une touche pour terminer...
pause >nul 