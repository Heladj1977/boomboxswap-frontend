@echo off
echo ========================================
echo TEST CORRECTIONS CHIRURGICALES AUDIT
echo ========================================
echo.
echo MISSION: Vérifier corrections auto-connexion + logos
echo 1. Auto-connexion MetaMask désactivée
echo 2. Logos modal wallet visibles
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
echo ETAPE 3: TESTS CORRECTIONS
echo ========================================
echo.
echo TEST 1 - AUTO-CONNEXION DÉSACTIVÉE:
echo 1. Ouvrir Console DevTools (F12)
echo 2. Recharger la page (F5)
echo 3. Vérifier logs "DÉTECTION SILENCIEUSE"
echo 4. Vérifier que bouton wallet affiche "Connecter Wallet"
echo 5. Vérifier qu'aucune connexion automatique
echo.
echo TEST 2 - LOGOS MODAL VISIBLES:
echo 1. Cliquer sur le bouton wallet
echo 2. Observer la modal qui s'ouvre
echo 3. Vérifier que les logos MetaMask/WalletConnect s'affichent
echo 4. Vérifier logs "AUDIT IMAGES" et "AUDIT CSS"
echo 5. Vérifier que pas de texte à la place des logos
echo.
echo ========================================
echo LOGS À VÉRIFIER:
echo ========================================
echo.
echo AUTO-CONNEXION DÉSACTIVÉE:
echo - "DÉTECTION SILENCIEUSE - MetaMask disponible pour connexion manuelle"
echo - "ℹ️ Utilisateur doit cliquer pour se connecter (pas d'auto-connexion)"
echo - Bouton wallet affiche "Connecter Wallet" (pas d'adresse)
echo.
echo LOGOS MODAL VISIBLES:
echo - "AUDIT IMAGES: MetaMask SVG chargé avec succès"
echo - "AUDIT IMAGES: WalletConnect SVG chargé avec succès"
echo - "AUDIT CSS: CSS de secours pour logos appliqué"
echo - Logos visibles dans la modal (pas de texte)
echo.
echo ========================================
echo RÉSULTATS ATTENDUS:
echo ========================================
echo.
echo ✅ AUTO-CONNEXION:
echo - Plus de connexion automatique au chargement
echo - Utilisateur doit cliquer pour se connecter
echo - Bouton wallet affiche "Connecter Wallet"
echo.
echo ✅ LOGOS MODAL:
echo - Images MetaMask et WalletConnect visibles
echo - Pas de texte à la place des logos
echo - CSS de secours appliqué si nécessaire
echo.
echo Appuyez sur une touche pour terminer...
pause >nul 