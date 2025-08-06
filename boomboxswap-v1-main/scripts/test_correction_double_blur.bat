@echo off
echo ========================================
echo TEST CORRECTION DOUBLE BLUR
echo ========================================
echo.

echo [1/4] Demarrage du serveur backend...
cd backend
start /B uvicorn main:app --host 127.0.0.1 --port 8000
timeout /t 3 /nobreak >nul

echo [2/4] Ouverture du navigateur...
cd ..
start http://127.0.0.1:8000

echo [3/4] Instructions de test CORRECTION DOUBLE BLUR:
echo.
echo ✅ CORRECTIONS APPLIQUEES:
echo    - SUPPRIME: backdrop-filter: blur(10px) de .wallet-modal-content
echo    - SUPPRIME: backdrop-filter: blur(5px) de .wallet-option
echo    - SUPPRIME: backdrop-filter: blur(5px) de .close-btn
echo    - PRESERVE: body.modal-open { filter: blur(4px); }
echo    - PRESERVE: body.modal-open .wallet-modal { filter: none; }
echo.
echo 🎯 OBJECTIF VISUEL:
echo    - Interface background: Floutée atmospheric
echo    - Modal entier: Net et parfaitement lisible
echo    - Aucun double blur
echo    - Effet gaming restauré
echo.
echo 1. Cliquez sur "CONNECTER WALLET"
echo 2. Vérifiez que le modal est parfaitement net
echo 3. Confirmez que l'interface est floutée en arrière-plan
echo 4. Testez la lisibilité du titre et des options
echo.
echo [4/4] Test en cours...
echo.
echo Appuyez sur une touche pour fermer ce script...
pause >nul 