@echo off
echo ========================================
echo TEST LOGOS RECONNEXION - VISIBILITÉ
echo ========================================
echo.
echo MISSION: Vérifier que les logos restent visibles
echo lors des reconnexions MetaMask
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
echo ETAPE 3: TESTS RECONNEXION
echo ========================================
echo.
echo TEST 1 - PREMIÈRE CONNEXION:
echo 1. Cliquer sur le bouton wallet
echo 2. Vérifier que les logos MetaMask et WalletConnect sont visibles
echo 3. Se connecter avec MetaMask
echo 4. Vérifier que la connexion fonctionne
echo.
echo TEST 2 - DÉCONNEXION:
echo 1. Se déconnecter de MetaMask
echo 2. Vérifier que la déconnexion fonctionne
echo.
echo TEST 3 - DEUXIÈME CONNEXION:
echo 1. Cliquer à nouveau sur le bouton wallet
echo 2. VÉRIFIER CRITIQUE: Le logo MetaMask est-il toujours visible ?
echo 3. VÉRIFIER CRITIQUE: Le logo WalletConnect est-il toujours visible ?
echo 4. Se reconnecter avec MetaMask
echo 5. Vérifier que la reconnexion fonctionne
echo.
echo TEST 4 - TROISIÈME CONNEXION:
echo 1. Se déconnecter à nouveau
echo 2. Cliquer sur le bouton wallet
echo 3. VÉRIFIER CRITIQUE: Les logos sont-ils toujours visibles ?
echo.
echo ========================================
echo RÉSULTATS ATTENDUS:
echo ========================================
echo.
echo ✅ LOGOS TOUJOURS VISIBLES:
echo - MetaMask: 64x64px, décalé de 10px vers le bas
echo - WalletConnect: 96x96px, décalé de 15px vers le bas
echo - Visibles à chaque ouverture de la modal
echo.
echo ✅ FONCTIONNALITÉ PRÉSERVÉE:
echo - Connexion/déconnexion fonctionne
echo - Interface reste responsive
echo - Pas de bugs visuels
echo.
echo ========================================
echo DIAGNOSTIC EN CAS DE PROBLÈME:
echo ========================================
echo.
echo Si les logos disparaissent:
echo 1. Ouvrir la console du navigateur (F12)
echo 2. Chercher les logs "🔧 AUDIT CSS"
echo 3. Vérifier que "CSS de secours réappliqué avec succès"
echo 4. Vérifier que les styles sont bien appliqués
echo.
echo Appuyez sur une touche pour terminer...
pause >nul 