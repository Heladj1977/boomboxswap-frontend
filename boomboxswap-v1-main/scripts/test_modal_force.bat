@echo off
echo ========================================
echo TEST FORCE MODAL WALLET BLUR
echo ========================================
echo.

echo [1/4] Demarrage du serveur backend...
cd backend
start /B uvicorn main:app --host 127.0.0.1 --port 8000
timeout /t 3 /nobreak >nul

echo [2/4] Ouverture du navigateur...
cd ..
start http://127.0.0.1:8000

echo [3/4] Instructions de test FORCE:
echo.
echo 1. Ouvrez les outils de développement (F12)
echo 2. Allez dans l'onglet Console
echo 3. Tapez cette commande pour forcer l'affichage du modal:
echo    document.getElementById('walletModal').style.display = 'flex';
echo 4. Observez si l'effet blur fonctionne
echo 5. Pour masquer: document.getElementById('walletModal').style.display = 'none';
echo.
echo [4/4] Test en cours...
echo.
echo Appuyez sur une touche pour fermer ce script...
pause >nul 