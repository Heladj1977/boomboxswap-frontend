@echo off
echo ========================================
echo TEST MODAL WALLET BLUR EFFECT
echo ========================================
echo.

echo [1/4] Demarrage du serveur backend...
cd backend
start /B uvicorn main:app --host 127.0.0.1 --port 8000
timeout /t 3 /nobreak >nul

echo [2/4] Ouverture du navigateur...
cd ..
start http://127.0.0.1:8000

echo [3/4] Instructions de test:
echo.
echo 1. Cliquez sur le bouton "CONNECTER WALLET" dans l'interface
echo 2. Observez si le modal s'affiche avec un effet blur sur le background
echo 3. Vérifiez dans les outils de développement (F12) :
echo    - Onglet Elements : cherchez #walletModal
echo    - Onglet Computed : vérifiez backdrop-filter: blur(15px)
echo.
echo [4/4] Test en cours...
echo.
echo Appuyez sur une touche pour fermer ce script...
pause >nul 